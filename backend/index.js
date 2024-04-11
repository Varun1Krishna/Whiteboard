const http = require("http");
const express = require("express");
const cors = require("cors");
const app = express();
const admin = require("firebase-admin");

const serviceAccount = require("./whiteboard-ed812-firebase-adminsdk-urxe2-e85a35f227.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const socketRoomMap = {};
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

const roomUserCounts = {};

// Define the function at the top level
function updateUserCountInRoom(roomCode) {
  io.in(roomCode).emit("updateUserCount", roomUserCounts[roomCode] || 0);
}

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("joinRoom", ({ roomCode }) => {
    socket.join(roomCode);
    socketRoomMap[socket.id] = roomCode;
    roomUserCounts[roomCode] = (roomUserCounts[roomCode] || 0) + 1;
    console.log(`User ${socket.id} joined room: ${roomCode}, Room count: ${roomUserCounts[roomCode]}`);
    updateUserCountInRoom(roomCode);
  });

  socket.on("cdn", (msg) => {
    console.log("Message from client: ", msg);
    socket.to(msg.roomCode).emit("cdn", msg);
  });

  socket.on("clearCanvas", ({ roomCode }) => {
    socket.to(roomCode).emit("clearCanvas");
    console.log(`Canvas cleared in room: ${roomCode}`);
  });

  function attemptToDeleteRoom(roomCode) {
    if (roomUserCounts[roomCode] === 0) {
      setTimeout(async () => {
        if (roomUserCounts[roomCode] === 0) {
          delete roomUserCounts[roomCode];
          const roomsRef = db.collection("rooms");
          const snapshot = await roomsRef.where("code", "==", roomCode).get();
          if (!snapshot.empty) {
            const batch = db.batch();
            snapshot.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            console.log(`Room(s) with roomCode: ${roomCode} deleted from Firestore.`);
          }
          io.in(roomCode).emit("updateUserCount", 0); // Update after final check
        } else {
          updateUserCountInRoom(roomCode); // If not deleted, update with the latest count
        }
      }, 5000); // 5-second delay
    }
  }

  socket.on("leaveRoom", async ({ roomCode }) => {
    socket.leave(roomCode);
    delete socketRoomMap[socket.id];
    if (roomUserCounts[roomCode]) {
      roomUserCounts[roomCode]--;
      console.log(`User ${socket.id} left room: ${roomCode}, Room count: ${roomUserCounts[roomCode]}`);
      updateUserCountInRoom(roomCode); // Update immediately when a user leaves
      attemptToDeleteRoom(roomCode);
    }
  });

  socket.on("disconnect", () => {
    const roomCode = socketRoomMap[socket.id];
    delete socketRoomMap[socket.id];
    if (roomCode && roomUserCounts[roomCode]) {
      roomUserCounts[roomCode]--;
      console.log("User disconnected:", socket.id, " Room count: ", roomUserCounts[roomCode]);
      updateUserCountInRoom(roomCode); // Update immediately on disconnect
      attemptToDeleteRoom(roomCode);
    }
  });
});

app.get("/", (req, res) => {
  res.send("This is the backend running");
});

const port = 4000;
server.listen(port, () => console.log(`Server running at http://localhost:${port}`));
