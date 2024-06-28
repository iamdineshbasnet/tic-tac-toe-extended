const Room = require('./model/room');
const Player = require('./model/player');
const { generateRoomId } = require('./config/generateRandom');

let playAgainRequests = {};
let waitingPlayers = [];

module.exports = (io) => {
	io.sockets.on('connection', (socket) => {
		socket.on('join', async (roomId) => {
			socket.join(roomId);
			try {
				let roomDetails = await Room.findOne({ roomId })
					.populate('participants.player', 'username image isGuest name win')
					.populate('creator', 'username image isGuest name win')
					.lean();

				if (roomDetails && roomDetails.participants.length <= 2) {
					roomDetails.participants = roomDetails.participants.map((participant) => ({
						...participant.player,
						mark: participant.mark,
						_id: participant._id,
					}));

					io.sockets.in(roomId).emit('join', roomDetails);
				}
			} catch (error) {
				console.error('Error fetching room details:', error);
			}
		});

		socket.on('startGame', async (data) => {
			try {
				console.log('starting...', data);
				const updateData = { isPlaying: data.isPlaying };
				let roomDetails = await Room.findOneAndUpdate({ roomId: data.roomId }, updateData, {
					new: true,
				})
					.populate('participants.player', 'username image isGuest name win')
					.populate('creator', 'username image isGuest name win')
					.lean();

				if (roomDetails && roomDetails.participants.length <= 2) {
					roomDetails.participants = roomDetails.participants.map((participant) => ({
						...participant.player,
						mark: participant.mark,
						_id: participant._id,
					}));
				}

				io.sockets.in(data.roomId).emit('gameStarted', roomDetails);
			} catch (error) {
				console.log('Error in game start', error);
			}
		});

		socket.on('findOpponent', async (playerId) => {
			const playerDetails = await Player.findById(playerId);

			if (!playerDetails) {
				socket.emit('error', 'Player not found');
				return;
			}

			waitingPlayers.push({ player: playerId, socketId: socket.id });
			if (waitingPlayers.length >= 2) {
				const [player1, player2] = waitingPlayers.splice(0, 2);
				const roomId = generateRoomId();

				const newRoom = new Room({
					roomId,
					participants: [
						{ player: player1.player, mark: 'x' },
						{ player: player2.player, mark: 'o' },
					],
					board: Array(9).fill(''),
					history: [],
					isPlaying: false,
				});

				await newRoom.save();
				socket.join(newRoom._id);

				let populatedRoom = await Room.findById(newRoom._id)
					.populate('participants.player', 'username image isGuest name win')
					.populate('creator', 'username image isGuest name win')
					.lean();
				populatedRoom.participants = populatedRoom.participants.map((participant) => ({
					...participant.player,
					mark: participant.mark,
					_id: participant._id,
				}));

				io.to(player1.socketId).emit('opponentFound', {
					message: 'success',
					details: populatedRoom,
				});
				io.to(player2.socketId).emit('opponentFound', {
					message: 'success',
					details: populatedRoom,
				});
			}
		});

		socket.on('getDetails', async (roomId) => {
      socket.join(roomId);
			let roomDetails = await Room.findOne({ roomId })
				.populate('participants.player', 'username image isGuest name win')
				.populate('creator', 'username image isGuest name win')
				.lean();

			roomDetails.participants = roomDetails?.participants.map((participant) => ({
				...participant.player,
				mark: participant.mark,
				_id: participant._id,
			}));

			io.sockets.in(roomId).emit('getDetails', roomDetails);
		});

		socket.on('makeMove', async (data) => {
			try {
        socket.join(data.roomId)
				const updateData = {
					board: data.board,
					turn: data.turn,
					history: data.history,
				};

				const emptyCellCount = data.board.filter((cell) => cell === '').length;

				if (emptyCellCount <= 3) {
					if (emptyCellCount === 2) {
						const firstMoveIndex = data.history.find((id) => data.board[id] !== '');
						if (firstMoveIndex !== undefined) {
							updateData.board[firstMoveIndex] = '';
							updateData.history = data.history.filter(
								(index) => index !== firstMoveIndex
							);
							updateData.disabledCell = updateData.history[0];
						}
					} else {
						updateData.disabledCell = data.history[0];
					}
				} else {
					updateData.disabledCell = -1;
				}

				const roomDetails = await Room.findOneAndUpdate(
					{ roomId: data.roomId },
					updateData,
					{ new: true }
				);

				io.sockets.in(data.roomId).emit('makeMove', roomDetails);
			} catch (error) {
				console.error('Error updating room:', error);
			}
		});

		socket.on('gameWin', async (data) => {
			try {
				const { roomId, winner, loser } = data;
				await Room.findOneAndUpdate({ roomId }, { isPlaying: false });

				await Player.updateOne({ username: winner }, { $inc: { win: 1 } });
				await Player.updateOne({ username: loser }, { $inc: { lose: 1 } });

				let updatedRoomDetails = await Room.findOne({ roomId })
					.populate('participants.player', 'username image isGuest name win')
					.populate('creator', 'username image isGuest name win')
					.lean();

				updatedRoomDetails.participants = updatedRoomDetails.participants.map(
					(participant) => ({
						...participant.player,
						mark: participant.mark,
						_id: participant._id,
					})
				);

				const updatedWinner = await Player.findOne({ username: winner });
				const updatedLoser = await Player.findOne({ username: loser });

				io.sockets.in(roomId).emit('gameWin', {
					roomDetails: updatedRoomDetails,
					winner: updatedWinner,
					loser: updatedLoser,
				});
			} catch (error) {
				console.log('Error handling gameWin', error);
			}
		});

		socket.on('playAgainRequest', async (data) => {
			try {
				const { roomId, username, name } = data;

				if (!playAgainRequests[roomId]) {
					playAgainRequests[roomId] = [];
				}

				const userExists = playAgainRequests[roomId].some(
					(request) => request.username === username
				);

				if (!userExists) {
					playAgainRequests[roomId].push({ username, name });
				}

				io.sockets.in(roomId).emit('playAgainRequested', playAgainRequests[roomId]);
			} catch (error) {
				console.log('Error notifying play again request', error);
			}
		});

		socket.on('playAgain', async (data) => {
			socket.join(data.roomId);
			try {
				const updateData = {
					board: Array(9).fill(''),
					turn: 'x',
					history: [],
					disabledCell: -1,
					isPlaying: true,
					round: data.round,
				};
				const roomDetails = await Room.findOneAndUpdate(
					{ roomId: data.roomId },
					updateData,
					{ new: true }
				);

				if (!roomDetails) {
					console.log(`Room ${data.roomId} not found for playAgain.`);
					return;
				}

				playAgainRequests[data.roomId] = [];
				io.sockets.in(data.roomId).emit('playAgain', roomDetails);
			} catch (error) {
				console.log('Error play again', error);
			}
		});

		socket.on('leave', async (data) => {
			socket.join(data.roomId);
			try {
				const { roomId, playerId } = data;

				let playerDetails = await Player.findOne({ _id: playerId });

				if (!playerDetails) {
					console.log(`Player ${playerId} not found for leave.`);
					return;
				}

				let roomDetails = await Room.findOneAndUpdate(
					{ roomId },
					{ $pull: { participants: { player: playerId } } },
					{ new: true }
				).lean();

				if (!roomDetails) {
					console.log(`Room ${roomId} not found for leave.`);
					return;
				}

				if (roomDetails.participants.length === 0) {
					await Room.findOneAndDelete({ roomId });
				} else {
					io.sockets.in(roomId).emit('leaved', playerDetails);
				}
			} catch (error) {
				console.log('Error leaving game', error);
			}
		});
	});
};
