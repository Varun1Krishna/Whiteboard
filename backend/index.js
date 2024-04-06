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

io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);

  socket.on('joinRoom', (roomCode, callback) => {
    socket.join(roomCode);
    console.log(`User ${socket.id} joined room: ${roomCode}`);
    callback({ status: "ok" }); // Send acknowledgment back for debugging
  });

  socket.on('drawing', (data) => {
    // Make sure you're broadcasting to the room correctly
    socket.to(data.roomCode).emit('drawing', data);
  });

  socket.on('disconnect', (reason) => {
    console.log(`User disconnected: ${socket.id}, Reason: ${reason}`);
  });
});


app.get("/", (req, res) => {
  res.send("This is the backend running");
});

const port = 4000;
server.listen(port, () => console.log(`Server running at http://localhost:${port}`));
