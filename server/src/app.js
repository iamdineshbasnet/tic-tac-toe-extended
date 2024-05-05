const express = require('express')
const cors = require('cors')
const http = require('http')
const socketIO = require('socket.io')
const app = express();
const PORT = 3000;

const server = http.createServer(app);

const io = socketIO(server, {
	cors: {
		origin: 'http://localhost:5173',
		methods: ['get', 'post'],
	},
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("makeMove", (data) => {
    io.emit("moveMade", data);
  });

  socket.on("resetGame", (newGame) => {
    io.emit("gameReset", newGame);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

app.use(cors());

app.get("/game", (req, res) => {
  res.status(200).send("Tic Tac Toe Game Server");
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});