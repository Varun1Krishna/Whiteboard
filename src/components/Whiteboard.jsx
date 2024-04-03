import React, { useEffect, useRef, useState } from "react";

function Whiteboard() {
  const canvasRef = useRef(null);
  const [elements, setElements] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("pencil"); // Add tool state

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Re-draw elements on resize
      redrawElements(ctx);
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const redrawElements = (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.strokeStyle = "#cccccc";
    ctx.strokeRect(50, 50, ctx.canvas.width - 100, ctx.canvas.height - 100);

    elements.forEach((element) => {
      if (element.type === "pencil") {
        drawPath(ctx, element.path, "black");
      } else if (element.type === "eraser") {
        drawPath(ctx, element.path, "white"); // Draw with background color
      }
    });
  };

  const drawPath = (ctx, path, stroke) => {
    ctx.beginPath();
    ctx.strokeStyle = stroke;
    path.forEach(([x, y], index) => {
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
  };

  const handleMouseDown = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    setIsDrawing(true);
    const newElement = { type: tool, path: [[offsetX, offsetY]] };
    setElements([...elements, newElement]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;

    const updatedElements = elements.map((elem, index) => {
      if (index === elements.length - 1) {
        const newPath = [...elem.path, [offsetX, offsetY]];
        return { ...elem, path: newPath };
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
