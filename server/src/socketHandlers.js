const Room = require('./model/room');
const Player = require('./model/player');
const { generateRoomId } = require('./config/generateRandom');

let playAgainRequests = {};
let waitingPlayers = [];

module.exports = (io) => {
	io.sockets.on('connection', (socket) => {
		socket.on('create_room', async (data) => {
			const socketRoomId = Array.from(socket.rooms).join(',');
			const roomId = generateRoomId();
			const created_room = new Room({
				roomId,
				participants: [
					{
						player: data._id,
						mark: 'x',
						player_socket_id: socket.id,
					},
				],
				creator: data._id,
				board: Array(9).fill(''),
				history: [],
				socket_room_id: socketRoomId,
			});

			await created_room.save();

			let populated_room = await Room.findById(created_room._id)
				.populate('participants.player', 'username image isGuest name win')
				.populate('creator', 'username image isGuest name win')
				.lean();

			populated_room.participants = populated_room.participants.map((participant) => ({
				...participant.player,
				mark: participant.mark,
				_id: participant.id,
				player_socket_id: participant.player_socket_id,
			}));

			socket.join(socketRoomId);
			socket.emit('room_created', populated_room);
			socket.roomId = roomId;
		});

		// Get room details
		socket.on('get_room_details', async (roomId) => {
			let room_details = await Room.findOne({ roomId })
				.populate('participants.player', 'username image isGuest name win')
				.populate('creator', 'username image isGuest name win')
				.lean();

			room_details.participants = room_details?.participants.map((participant) => ({
				...participant.player,
				mark: participant.mark,
				_id: participant._id,
				player_socket_id: participant.player_socket_id,
			}));

			socket.join(room_details.socket_room_id);
			io.to(room_details.socket_room_id).emit('room_details', room_details);
		});

		// Join room
		socket.on('join_room', async (data) => {
			const player = data.player?._id;
			const roomId = data.roomId;
			const room_details = await Room.findOne({ roomId });

			if (room_details.participants.length >= 2) {
				socket.emit('room_full', {
					message: 'The room is full and cannot accept more players.',
				});
				return;
			}

			room_details.participants.push({
				player: player,
				mark: 'o',
				player_socket_id: socket.id,
			});

			await room_details.save();

			let populated_room = await Room.findById(room_details._id)
				.populate('participants.player', 'username image isGuest name win')
				.populate('creator', 'username image isGuest name win')
				.lean();

			populated_room.participants = populated_room.participants.map((participant) => ({
				...participant.player,
				mark: participant.mark,
				_id: participant.id,
				player_socket_id: participant.player_socket_id,
			}));

			socket.join(populated_room.socket_room_id);
			io.to(populated_room.socket_room_id).emit('room_joined', populated_room);
			socket.roomId = roomId;
		});

		// Start game
		socket.on('start_game', async (data) => {
			try {
				const updateData = { isPlaying: data.isPlaying };
				let room_details = await Room.findOneAndUpdate(
					{ roomId: data.roomId },
					updateData,
					{
						new: true,
					}
				)
					.populate('participants.player', 'username image isGuest name win')
					.populate('creator', 'username image isGuest name win')
					.lean();

				if (room_details && room_details.participants.length <= 2) {
					room_details.participants = room_details.participants.map((participant) => ({
						...participant.player,
						mark: participant.mark,
						_id: participant._id,
						player_socket_id: participant.player_socket_id,
					}));
				}

				socket.join(room_details.socket_room_id);
				io.to(room_details.socket_room_id).emit('game_start', room_details);
			} catch (error) {
				console.log('Error in game start', error);
			}
		});

		// Make move
		socket.on('make_move', async (data) => {
			try {
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

				const room_details = await Room.findOneAndUpdate(
					{ roomId: data.roomId },
					updateData,
					{ new: true }
				);
				socket.join(room_details.socket_room_id);
				io.sockets.in(room_details.socket_room_id).emit('move_made', room_details);
			} catch (error) {
				console.error('Error updating room:', error);
			}
		});

		// Game win
		socket.on('game_win', async (data) => {
			try {
				const { roomId, winner, loser } = data;
				await Room.findOneAndUpdate({ roomId }, { isPlaying: false });

				await Player.updateOne({ username: winner }, { $inc: { win: 1 } });
				await Player.updateOne({ username: loser }, { $inc: { lose: 1 } });

				let room_details = await Room.findOne({ roomId })
					.populate('participants.player', 'username image isGuest name win')
					.populate('creator', 'username image isGuest name win')
					.lean();

				room_details.participants = room_details.participants.map((participant) => ({
					...participant.player,
					mark: participant.mark,
					_id: participant._id,
					player_socket_id: participant.player_socket_id,
				}));

				const updatedWinner = await Player.findOne({ username: winner });
				const updatedLoser = await Player.findOne({ username: loser });

				socket.join(room_details.socket_room_id);
				io.sockets.in(room_details.socket_room_id).emit('game_won', {
					roomDetails: room_details,
					winner: updatedWinner,
					loser: updatedLoser,
				});
			} catch (error) {
				console.log('Error handling gameWin', error);
			}
		});

		// Request play again
		socket.on('request_play_again', async (data) => {
			try {
				const { roomId, username, name } = data;
				let room_details = await Room.findOne({ roomId });
				if (!playAgainRequests[roomId]) {
					playAgainRequests[roomId] = [];
				}

				const userExists = playAgainRequests[roomId].some(
					(request) => request.username === username
				);

				if (!userExists) {
					playAgainRequests[roomId].push({ username, name });
				}

				socket.join(room_details.socket_room_id);
				io.sockets
					.in(room_details.socket_room_id)
					.emit('play_again_request', playAgainRequests[roomId]);
			} catch (error) {
				console.log('Error notifying play again request', error);
			}
		});

		// Play again
		socket.on('play_again', async (data) => {
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
				const room_details = await Room.findOneAndUpdate(
					{ roomId: data.roomId },
					updateData,
					{ new: true }
				);

				if (!room_details) {
					console.log(`Room ${data.roomId} not found for playAgain.`);
					return;
				}

				playAgainRequests[data.roomId] = [];

				socket.join(room_details.socket_room_id);
				io.sockets.in(room_details.socket_room_id).emit('play_again', room_details);
			} catch (error) {
				console.log('Error play again', error);
			}
		});

		// Leave room
		socket.on('leave', async (data) => {
			socket.join(data.roomId);
			try {
				const { roomId, playerId } = data;

				let player = await Player.findOne({ _id: playerId });

				if (!player) {
					console.log(`Player ${playerId} not found for leave.`);
					return;
				}

				let room_details = await Room.findOneAndUpdate(
					{ roomId },
					{ $pull: { participants: { player: playerId } } },
					{ new: true }
				).lean();

				if (!room_details) {
					console.log(`Room ${roomId} not found for leave.`);
					return;
				}

				if (room_details.participants.length === 0) {
					await Room.findOneAndDelete({ roomId });
				} else {
					socket.join(room_details.socket_room_id);
					io.sockets.in(room_details.socket_room_id).emit('left', player);
				}
			} catch (error) {
				console.log('Error leaving game', error);
			}
		});

		// Find opponent
		socket.on('find_opponent', async (playerId) => {
			const player_details = await Player.findById(playerId);

			if (!player_details) {
				socket.emit('error', 'Player not found');
				return;
			}

			// Check if player is already in the waiting list
			const existingPlayer = waitingPlayers.find((p) => p.player === playerId);
			if (existingPlayer) {
				// Update the socket ID if the player already exists
				existingPlayer.socketId = socket.id;
			} else {
				// Add new player to the waiting list
				waitingPlayers.push({ player: playerId, socketId: socket.id });
			}

			console.log(waitingPlayers, 'waiting players');

			if (waitingPlayers.length >= 2) {
				const [player1, player2] = waitingPlayers.splice(0, 2);
				const roomId = generateRoomId();
				const socketRoomId = Array.from(socket.rooms).join(',');


				const newRoom = new Room({
					roomId,
					participants: [
						{
							player: player1.player,
							mark: 'x',
							player_socket_id: player1.socketId,
						},
						{
							player: player2.player,
							mark: 'o',
							player_socket_id: player2.socketId,
						},
					],
					board: Array(9).fill(''),
					history: [],
					isPlaying: false,
					socket_room_id: socketRoomId,
				});

				await newRoom.save();

				let populated_room = await Room.findById(newRoom._id)
					.populate('participants.player', 'username image isGuest name win')
					.populate('creator', 'username image isGuest name win')
					.lean();

				populated_room.participants = populated_room.participants.map((participant) => ({
					...participant.player,
					mark: participant.mark,
					_id: participant._id,
					player_socket_id: participant.player_socket_id,
				}));

				// Emit the event to both players
				io.to(player1.socketId).emit('opponent_found', { message: 'success', details: populated_room });
				io.to(player2.socketId).emit('opponent_found', { message: 'success', details: populated_room });

				// Add players to the room
				socket.join(socketRoomId);
				// io.sockets.connected[player1?.socketId].join(socketRoomId);
				// io.sockets.connected[player2?.socketId].join(socketRoomId);
			}
		});

		// Handle reconnection
		socket.on('reconnect', async (playerId) => {
			const player_details = await Player.findById(playerId);

			if (!player_details) {
				socket.emit('error', 'Player not found');
				return;
			}

			const room = await Room.findOne({
				'participants.player': playerId,
			})
				.populate('participants.player', 'username image isGuest name win')
				.lean();

			if (room) {
				const socketRoomId = room.socket_room_id;
				const populated_room = {
					...room,
					participants: room.participants.map((participant) => ({
						...participant.player,
						mark: participant.mark,
						_id: participant._id,
						player_socket_id: participant.player_socket_id,
					})),
				};

				// Re-join the socket room
				socket.join(socketRoomId);
				io.to(socket.id).emit('opponent_found', { message: 'success', details: populated_room });
			} else {
				socket.emit('error', 'Room not found');
			}
		});
	});
};
