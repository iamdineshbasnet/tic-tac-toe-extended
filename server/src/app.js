const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Auth = require('./routes/auth');
const Player = require('./routes/player');
const Room = require('./routes/room');
const room = require('./model/room');
const player = require('./model/player');
const Avatar = require('./routes/avatar');
const { generateRoomId } = require('./config/generateRandom');

// express app
const app = express();

//Middlewares
dotenv.config();
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// connect to the database
connectDB();

// Define PORT
const PORT = process.env.PORT || 3000;

// creating server
const server = http.createServer(app);

const io = socketIO(server, {
	cors: {
		origin: process.env.ALLOWED_HOST,
		methods: ['get', 'post'],
	},
});

// Store play-again requests
let playAgainRequests = {};
// store players looking for opponent player
let waitingPlayers = [];

io.on('connection', (socket) => {
	// friend mode
	socket.on('join', async (roomId) => {
		socket.join(roomId);
		let roomDetails = await room
			.findOne({ roomId })
			.populate('participants.player', 'username image isGuest name win')
			.populate('creator', 'username image isGuest name win')
			.lean();
		if (roomDetails && roomDetails.participants.length <= 2) {
			roomDetails.participants = roomDetails.participants.map((participant) => ({
				...participant.player,
				mark: participant.mark,
				_id: participant._id,
			}));
			io.to(roomId).emit('join', roomDetails);
		}
	});

	socket.on('startGame', async (data) => {
		try {
			const updateData = {
				isPlaying: data.isPlaying,
			};
			let roomDetails = await room
				.findOneAndUpdate({ roomId: data.roomId }, updateData, { new: true })
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

			io.to(data.roomId).emit('gameStarted', roomDetails);
		} catch (error) {
			console.log('Error in game start', error);
		}
	});

	// multiplayer mode
	socket.on('findOpponent', async (playerId) => {
		const playerDetails = await player.findById(playerId);

		if (!playerDetails) {
			socket.emit('error', 'Player not found');
			return;
		}

		waitingPlayers.push({ player: playerId, socketId: socket.id });
		if (waitingPlayers.length >= 2) {
			const [player1, player2] = waitingPlayers.splice(0, 2);
			const roomId = generateRoomId();

			const obj = {
				roomId,
				participants: [
					{
						player: player1.player,
						mark: 'x',
					},
					{
						player: player2.player,
						mark: 'o',
					},
				],
				board: Array(9).fill(''),
				history: [],
			};
			const newRoom = new room(obj);

			await newRoom.save();

			let populatedRoom = await room
				.findById(newRoom._id)
				.populate('participants.player', 'username image isGuest name win')
				.populate('creator', 'username image isGuest name win')
				.lean();

			populatedRoom.participants = populatedRoom.participants.map((participant) => ({
				...participant.player,
				mark: participant.mark,
				_id: participant._id,
			}));

			io.to(player1.socketId).emit('opponentFound', { message: 'success', details: populatedRoom });
			io.to(player2.socketId).emit('opponentFound', { message: 'success', details: populatedRoom });
		}
	});

	// end of multiplayer mode
	socket.on('getDetails', async (roomId) => {
		let roomDetails = await room
			.findOne({ roomId })
			.populate('participants.player', 'username image isGuest name win')
			.populate('creator', 'username image isGuest name win')
			.lean();
		roomDetails.participants = roomDetails?.participants.map((participant) => ({
			...participant.player,
			mark: participant.mark,
			_id: participant._id,
		}));

		io.emit('getDetails', roomDetails);
	});

	socket.on('makemove', async (data) => {
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

			const roomDetails = await room.findOneAndUpdate({ roomId: data.roomId }, updateData, {
				new: true,
			});

			io.emit('makemove', roomDetails);
		} catch (error) {
			console.error('Error updating room:', error);
		}
	});

	socket.on('gameWin', async (data) => {
		try {
			const { roomId, winner, loser } = data;
			await room.findOneAndUpdate({ roomId }, { isPlaying: false });

			// Update player win/lose records
			await player.updateOne({ username: winner }, { $inc: { win: 1 } });
			await player.updateOne({ username: loser }, { $inc: { lose: 1 } });

			let updatedRoomDetails = await room
				.findOne({ roomId })
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

			const updatedWinner = await player.findOne({ username: winner });
			const updatedLoser = await player.findOne({ username: loser });

			socket.to(roomId).emit('gameWin', {
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

			io.emit('playAgainRequested', playAgainRequests[roomId]);
		} catch (error) {
			console.log('Error notifying play again request', error);
		}
	});

	socket.on('playAgain', async (data) => {
		try {
			const updateData = {
				board: Array(9).fill(''),
				turn: 'x',
				history: [],
				disabledCell: -1,
				isPlaying: true,
				round: data.round,
			};
			const roomDetails = await room.findOneAndUpdate({ roomId: data.roomId }, updateData, {
				new: true,
			});

			playAgainRequests[data.roomId] = [];
			io.emit('playAgain', roomDetails);
		} catch (error) {
			console.log('Error play again', error);
		}
	});

	socket.on('leave', async (data) => {
		try {
			const { roomId, playerId } = data;

			let playerDetails = await player.findOne({ _id: playerId });

			if (!playerDetails) return;

			let roomDetails = await room
				.findOneAndUpdate(
					{ roomId },
					{ $pull: { participants: { player: playerId } } },
					{ new: true }
				)
				.lean();

			if (!roomDetails) return;

			if (roomDetails.participants.length === 0) {
				await room.findOneAndDelete({ roomId });
			} else {
				// roomDetails.participants = roomDetails.participants.map(participant => ({
				// 	...participant.player,
				// 	mark: participant.mark,
				// 	_id: participant._id,
				// }))
				io.emit('leave', playerDetails);
			}
		} catch (error) {
			console.log('Error Leaving game', error);
		}
	});
});

const VERSION = `/api/${process.env.VERSION}`;

// routes
app.use(`${VERSION}/auth`, Auth);
app.use(`${VERSION}/player`, Player);
app.use(`${VERSION}/room`, Room);
app.use(`${VERSION}/avatar`, Avatar);
app.use(`${VERSION}/avatars`, express.static('./src/avatars'));

server.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});
