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

let players = new Map();
let participants = [];

io.on('connection', (socket) => {
  socket.on('find', (player) => {

    if (player && !Array.from(players.values()).find(p => p._id === player._id)) {
      player.socketId = socket.id;
      players.set(socket.id, player);

      let currentPlayers = Array.from(players.values());

      if (currentPlayers.length >= 2) {
        let first_player = { ...currentPlayers[0], mark: 'x' };
        let second_player = { ...currentPlayers[1], mark: 'o' };

        let roomId = generateRoomId();
        let obj = { roomId, participants: [first_player, second_player], turn: 'x', board: Array(9).fill('') };

        participants.push(obj);
        console.log(participants, 'before');
        io.emit('find', obj);

        console.log(participants, 'after');

      }
    }
  });

  socket.on('makeMove', ({ roomId, board, turn }) => {
    let room = participants.find(p => p.roomId === roomId);
    console.log(participants, 'participants')
    console.log(roomId, board, turn, 'on makemove')
    console.log(room, 'roomroom inside app.js')
    if (room) {
      room.turn = turn;
      room.board = board;
      console.log(room, 'roomroom')
      io.emit('update', room);
    }else{
      console.log(`Room not found for room id: ${roomId}`)
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected', socket.id);
    players.delete(socket.id);
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
