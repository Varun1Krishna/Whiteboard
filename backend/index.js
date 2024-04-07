const http = require("http");
const express = require("express");
const cors = require("cors");
const app = express();

const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors({
  origin: true,
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("joinRoom", ({ roomCode }) => {
    socket.join(roomCode);
    console.log(`User ${socket.id} joined room: ${roomCode}`);
  });

  socket.on("cdn", (msg) => {
    console.log("Message from client: ", msg);
    socket.to(msg.roomCode).emit("cdn", msg);
  });

  socket.on("clearCanvas", ({ roomCode }) => {
    socket.to(roomCode).emit("clearCanvas");
    console.log(`Canvas cleared in room: ${roomCode}`);
  });

  socket.on("leaveRoom", ({ roomCode }) => {
    socket.leave(roomCode);
    console.log(`User ${socket.id} left room: ${roomCode}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("This is the backend running");
});

const port = 4000;
server.listen(port, () => console.log(`Server running at http://localhost:${port}`));
