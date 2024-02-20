const { Socket } = require("dgram");
const express = require("express");
const app = express();

const server = require("http").createServer(app);
const { Server } = require("socket.io");

const io = new Server(server);

app.get("/", (req, res) => {
  res.send("This is the backend running");
});

io.on("connection",(socket)=>{
    console.log("User Connected");
})

const port = 4000;
server.listen(port, () => {
  console.log(`Server running at ${port}`);
});
