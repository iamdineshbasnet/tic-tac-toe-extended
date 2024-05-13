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
  
});


const VERSION = `/api/${process.env.VERSION}`;

// routes
app.use(`${VERSION}/auth`, Auth);
app.use(`${VERSION}/player`, Player);
app.use(`${VERSION}/room`, Room);

server.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});
