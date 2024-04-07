import React, { useRef, useEffect, useState } from "react";
import io from "socket.io-client";

function Whiteboard({ roomCode }) {
  const socket = io("http://localhost:4000", {
    withCredentials: true,
  });
  const canvasRef = useRef(null);
  const [ctx, setCtx] = useState(null);
  let isDrawing = false;
  const [tool, setTool] = useState("pencil");
  let startPoint = { x: 0, y: 0 };
  let lastX = 0; // Last X coordinate
  let lastY = 0; // Last Y coordinate
  let startNewLine = true;

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    // Set up initial styles for drawing
    context.lineWidth = 2;
    context.strokeStyle = "black";
    context.lineCap = "round";
    context.lineJoin = "round";
    setCtx(context);
  }, []);

  useEffect(() => {
    console.log("Roomcode: ", roomCode);
    // Join the room as soon as the component mounts and the socket is available
    if (roomCode) {
      console.log(`Attempting to join room: ${roomCode}`);
      socket.emit("joinRoom", { roomCode });
    }

    // Setup the canvas context
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.lineWidth = 2;
    context.strokeStyle = "black";
    context.lineCap = "round";
    context.lineJoin = "round";
    setCtx(context);

    // Setup socket listeners for drawing and clearing the canvas
    socket.on("cdn", (data) => {
      console.log("Drawing data received from server: ",data);
      drawSegment(data.from.x, data.from.y, data.to.x, data.to.y);
    });

    socket.on("clearCanvas", () => {
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    });

    // return () => {
    //   // Clean up: Leave the room and remove socket listeners
    //   socket.emit("leaveRoom", { roomCode }); // Assuming you have a leaveRoom event on the server
    //   socket.off("cdn");
    //   socket.off("clearCanvas");
    // };
  }, [ctx, roomCode]); // Add roomCode as a dependency

  const startDrawing = (event) => {
    isDrawing = true;
    const { offsetX, offsetY } = event.nativeEvent;
    startPoint = { x: offsetX, y: offsetY };
    lastX = offsetX; // Update lastX
    lastY = offsetY; // Update lastY
    startNewLine = false;
  };

  const draw = (event) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = event.nativeEvent;

    if (tool === "pencil") {
      drawSegment(lastX, lastY, offsetX, offsetY);

      // Emit the drawing segment for real-time collaboration
      socket.emit("cdn", {
        from: { x: lastX, y: lastY },
        to: { x: offsetX, y: offsetY },
        roomCode,
      });

      lastX = offsetX; // Update lastX
      lastY = offsetY; // Update lastY
    }
  };

  const stopDrawing = () => {
    isDrawing = false;
    startNewLine = true;
  };

  const drawSegment = (startX, startY, endX, endY) => {
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  };

  const selectTool = (selectedTool) => {
    setTool(selectedTool);
  };

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={800} // Set your desired canvas width
        height={600} // Set your desired canvas height
        className="border border-gray-400"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onContextMenu={(event) => event.preventDefault()}
      />
    </div>
  );
}

export default Whiteboard;
