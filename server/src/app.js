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

io.on('connection', (socket) => {
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

	socket.on('getDetails', async (roomId) => {
		let roomDetails = await room
			.findOne({ roomId })
			.populate('participants.player', 'username image isGuest name win')
			.populate('creator', 'username image isGuest name win')
			.lean();
		roomDetails.participants = roomDetails.participants.map((participant) => ({
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

			if (typeof data.disabledCell !== 'undefined') {
				updateData.disabledCell = data.disabledCell;
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

			socket.to(roomId).emit('playAgainRequested', { username, name });

			socket.emit('playAgainRequestsUpdate', playAgainRequests[roomId]);

			
		} catch (error) {
			console.log('Error notifying play again request', error);
		}
	});

	socket.on('playAgain', async (data) => {
		try {
			console.log('play Again triggered');
			const updateData = {
				board: Array(9).fill(''),
				turn: 'x',
				history: [],
				disabledCell: -1,
				isPlaying: true,
				round: data.round,
			};
			console.log('updateddata', updateData);

			const roomDetails = await room.findOneAndUpdate({ roomId: data.roomId }, updateData, {
				new: true,
			});

			console.log(roomDetails, 'roomDetails');
			io.emit('playAgain', roomDetails);
		} catch (error) {
			console.log('Error play again', error);
		}
	});
});

const VERSION = `/api/${process.env.VERSION}`;

// routes
app.use(`${VERSION}/auth`, Auth);
app.use(`${VERSION}/player`, Player);
app.use(`${VERSION}/room`, Room);

server.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});
