import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:4000"); // Connect to your server

function Whiteboard({roomCode}) {
  const canvasRef = useRef(null);
  const [elements, setElements] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("pencil");

  useEffect(() => {
    // Join the room
    socket.emit('joinRoom', roomCode);

    socket.on("drawing", (data) => {
      // Make sure to only update if the drawing action is in the same room
      if(data.roomCode === roomCode) {
        setElements((prevElements) => [...prevElements, data]);
      }
    });

    return () => {
      socket.off("drawing");
    };
  }, [roomCode]); // Re-run the effect if roomCode changes

  const drawPath = (ctx, path, stroke) => {
    if (path.length === 0) return; // Exit if the path is empty
    ctx.beginPath();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2; // Set the line width or make it a parameter
    // Move to the first point in the path
    ctx.moveTo(path[0][0], path[0][1]);
    // Loop through the path points and draw lines to each
    path.forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.stroke(); // Apply the stroke to the path
  };

  const redrawElements = (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clear the canvas
    ctx.strokeStyle = "#cccccc";
    ctx.strokeRect(50, 50, ctx.canvas.width - 100, ctx.canvas.height - 100);

    elements.forEach((element) => {
      if (element.type === "pencil") {
        drawPath(ctx, element.path, "black");
      } else if (element.type === "eraser") {
        drawPath(ctx, element.path, "white"); // Assuming the canvas background is white
      }
      // Add more conditions here for other types of elements
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    socket.on("drawing", (data) => {
      setElements((prevElements) => [...prevElements, data]);
    });

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      redrawElements(ctx);
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      socket.off("drawing");
    };
  }, []);

  const handleDrawingEvent = (newElement) => {
    // Include roomCode in the emitted event
    socket.emit("drawing", { ...newElement, roomCode });
  };

  const handleMouseDown = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    setIsDrawing(true);
    const newElement = { type: tool, path: [[offsetX, offsetY]] };
    setElements((prevElements) => [...prevElements, newElement]);
    handleDrawingEvent(newElement);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    const updatedElements = elements.map((elem, index) => {
      if (index === elements.length - 1) {
        const newPath = [...elem.path, [offsetX, offsetY]];
        const updatedElement = { ...elem, path: newPath, roomCode }; // Include roomCode here
        if (isDrawing) handleDrawingEvent(updatedElement); // Emit updated drawing with roomCode
        return updatedElement;
      }
      return elem;
    });
    setElements(updatedElements);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    redrawElements(ctx);
  }, [elements]);
  // UI for selecting the tool
  return (
    <div>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        width={window.innerWidth}
        height={window.innerHeight}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
export default Whiteboard;