const http = require('http');
const express = require("express");
const cors = require("cors");
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors({ origin: "http://localhost:3000" })); // Allowing your React app's origin

// When a client connects
io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // Handling room joining with acknowledgment
  socket.on('joinRoom', (roomCode, callback) => {
    socket.join(roomCode);
    console.log(`User ${socket.id} joined room: ${roomCode}`);
    callback({ status: "ok" }); // Send acknowledgment back
  });

  // Broadcasting drawing actions to clients in the same room, excluding the sender
  socket.on('drawing', (data) => {
    socket.to(data.roomCode).emit('drawing', data); // .broadcast is not needed in newer versions
  });

  // Simple error handling for disconnection
  socket.on('disconnect', (reason) => {
    console.log(`User disconnected: ${socket.id}, Reason: ${reason}`);
  });
});

app.get("/", (req, res) => {
  res.send("This is the backend running");
});

const port = 4000;
server.listen(port, () => console.log(`Server running at http://localhost:${port}`));
