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

	socket.on('startGame', (data) => {
		// console.log(data, 'data')
		io.to(data.roomId).emit('gameStarted', data);
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
				updateData.disabledCell = -1
			}
			console.log('updateddata', updateData)
			const roomDetails = await room.findOneAndUpdate(
				{ roomId: data.roomId },
				updateData,
				{ new: true }
			);

			io.emit('makemove', roomDetails);
		} catch (error) {
			console.error('Error updating room:', error);
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
