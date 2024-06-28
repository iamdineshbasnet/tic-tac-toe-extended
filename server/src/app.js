const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to the database
connectDB();

// Initialize express app
const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Define PORT
const PORT = process.env.PORT || 3000;

// Create server
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIO(server, {
  cors: {
    origin: process.env.ALLOWED_HOST,
    methods: ['GET', 'POST'],
  },
});

// Import routes
const Auth = require('./routes/auth');
const Player = require('./routes/player');
const Room = require('./routes/room');
const Avatar = require('./routes/avatar');

// Import socket handlers
const socketHandlers = require('./socketHandlers');

// Initialize socket handlers
socketHandlers(io);

// Define API version and routes
const VERSION = `/api/${process.env.VERSION}`;
app.use(`${VERSION}/auth`, Auth);
app.use(`${VERSION}/player`, Player);
app.use(`${VERSION}/room`, Room);
app.use(`${VERSION}/avatar`, Avatar);
app.use(`${VERSION}/avatars`, express.static('./src/avatars'));

// Start server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
