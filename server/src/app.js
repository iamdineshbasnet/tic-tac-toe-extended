const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Auth = require('./routes/auth');
const { generateRoomId } = require('./config/generateRandom');
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

// track of rooms and their players
const rooms = new Map();

io.on('connection', (socket) => {
	// create a room
	socket.on('createRoom', () => {
		const roomId = generateRoomId();
		rooms.set(roomId, { players: [socket.id] });
		socket.emit('roomCreated', roomId);
	});

	// join a room
	socket.on('joinRoom', (roomId) => {
		const room = rooms.get(roomId);
		if (room) {
			room.players.push(socket.id);
			socket.join(roomId);
			io.to(socket.id).emit('joinedRoom', roomId);
		} else {
			socket.emit('roomNotFound');
		}
	});

	// leave a room
	socket.on('leaveRoom', (roomId) => {
		const room = rooms.get(roomId);
		if (room) {
			const index = room.players.indexOf(socket.id);
			if (index !== -1) {
				room.players.splice(index, 1);
			}
			socket.leave(roomId);
			io.to(socket.id).emit('leftRoom', roomId);
		} else {
			socket.emit('roomNotFound');
		}
	});

	socket.on('disconnect', () => {
		console.log('Client disconnected');
		rooms.forEach((room) => {
			const index = room.players.indexOf(socket.id);
			if (index !== -1) {
				room.players.splice(index, 1);
			}
		});
	});
});

const VERSION = `/api/${process.env.VERSION}`;

// routes
app.use(`${VERSION}/auth`, Auth);

server.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});
