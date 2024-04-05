import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:4000");

function Whiteboard({ roomCode }) {
  const canvasRef = useRef(null);
  const [elements, setElements] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // Track dragging separately
  const [tool, setTool] = useState("pencil");
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    socket.emit(roomCode, 'roomCode');
    socket.on("drawing", (data) => {
      if (data.roomCode === roomCode) {
        setElements((prevElements) => [...prevElements, data]);
      }
    });
    return () => {
      socket.off("drawing");
    };
  }, [roomCode]);

  const drawPath = (ctx, path, stroke) => {
    if (path.length === 0) return;
    ctx.beginPath();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.moveTo(path[0][0] + offset.x, path[0][1] + offset.y);
    path.forEach(([x, y]) => ctx.lineTo(x + offset.x, y + offset.y));
    ctx.stroke();
  };

  const redrawElements = (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    elements.forEach((element) => {
      if (element.type === "pencil") {
        drawPath(ctx, element.path, "black");
      } else if (element.type === "eraser") {
        drawPath(ctx, element.path, "white");
      }
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    redrawElements(ctx);
  }, [elements, offset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      redrawElements(ctx);
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  const handleMouseDown = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    if (e.button === 1 || e.button === 2) { // Middle or right mouse button for dragging
      setIsDragging(true);
      dragStart.current = { x: offsetX, y: offsetY };
      return;
    }
    setIsDrawing(true);
    const newElement = { type: tool, path: [[offsetX - offset.x, offsetY - offset.y]] };
    setElements((prevElements) => [...prevElements, newElement]);
  };

  const handleMouseMove = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    if (isDragging) {
      const dx = offsetX - dragStart.current.x;
      const dy = offsetY - dragStart.current.y;
      setOffset({ x: offset.x + dx, y: offset.y + dy });
      dragStart.current = { x: offsetX, y: offsetY };
      return;
    }
    if (!isDrawing) return;
    const updatedElement = { type: tool, path: [...elements[elements.length - 1].path, [offsetX - offset.x, offsetY - offset.y]] };
    setElements(prev => [...prev.slice(0, -1), updatedElement]);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setIsDragging(false);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()} // Prevent right-click menu
        width={window.innerWidth}
        height={window.innerHeight}
        style={{ width: "100%", height: "100%", cursor: isDragging ? 'grabbing' : 'crosshair' }}
      />
    </div>
  );
}

export default Whiteboard;
