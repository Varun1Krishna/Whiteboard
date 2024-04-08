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

// Object to map socket IDs to room codes
const socketRoomMap = {};

const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: true,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Object to keep track of the number of users in each room
const roomUserCounts = {};

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("joinRoom", ({ roomCode }) => {
    socket.join(roomCode);
    socketRoomMap[socket.id] = roomCode;

    if (roomUserCounts[roomCode]) {
      roomUserCounts[roomCode]++;
    } else {
      roomUserCounts[roomCode] = 1;
    }
    console.log(roomUserCounts[roomCode]);
    console.log(
      `User ${socket.id} joined room: ${roomCode}, Room count: ${roomUserCounts[roomCode]}`
    );
  });

  socket.on("cdn", (msg) => {
    console.log("Message from client: ", msg);
    socket.to(msg.roomCode).emit("cdn", msg);
  });

  socket.on("clearCanvas", ({ roomCode }) => {
    socket.to(roomCode).emit("clearCanvas");
    console.log(`Canvas cleared in room: ${roomCode}`);
  });

  socket.on("leaveRoom", async ({ roomCode }) => {
    socket.leave(roomCode);
    delete socketRoomMap[socket.id];

    // Decrement the user count for this room
    if (roomUserCounts[roomCode]) {
      roomUserCounts[roomCode]--;

      if (roomUserCounts[roomCode] === 0) {
        console.log(`Room ${roomCode} is now empty and will be deleted.`);
        delete roomUserCounts[roomCode];

        // Query and delete the room from Firestore
        const roomsRef = db.collection("rooms");
        const snapshot = await roomsRef.where("code", "==", roomCode).get(); // Assuming 'code' is the field name in Firestore documents

        if (!snapshot.empty) {
          const batch = db.batch();

          snapshot.forEach((doc) => {
            batch.delete(doc.ref);
          });

          await batch.commit();
          console.log(
            `Room(s) with roomCode: ${roomCode} deleted from Firestore.`
          );
        } else {
          console.log(`No room found with roomCode: ${roomCode} for deletion.`);
        }
      } else {
        console.log(
          `User ${socket.id} left room: ${roomCode}, Room count: ${roomUserCounts[roomCode]}`
        );
      }
    }
  });

  socket.on("disconnect", async () => {
    const roomCode = socketRoomMap[socket.id];
    // Decrement the user count for this room
    if (roomCode) {
      if (roomUserCounts[roomCode]) {
        roomUserCounts[roomCode]--;
        if (roomUserCounts[roomCode] === 0) {
          delete roomUserCounts[roomCode];
          // Query and delete the room from Firestore
          const roomsRef = db.collection("rooms");
          const snapshot = await roomsRef.where("code", "==", roomCode).get(); // Assuming 'code' is the field name in Firestore documents

          if (!snapshot.empty) {
            const batch = db.batch();

            snapshot.forEach((doc) => {
              batch.delete(doc.ref);
            });

            await batch.commit();
            console.log(
              `Room(s) with roomCode: ${roomCode} deleted from Firestore.`
            );
          } else {
            console.log(
              `No room found with roomCode: ${roomCode} for deletion.`
            );
          }
        } else {
          console.log(
            "User disconnected:",
            socket.id,
            " Room count: ",
            roomUserCounts[roomCode]
          );
        }
      }
      delete socketRoomMap[socket.id];
    }
  });
});

app.get("/", (req, res) => {
  res.send("This is the backend running");
});

const port = 4000;
server.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`)
);
