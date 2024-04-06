// import React, { useEffect, useRef, useState } from "react";
// import io from "socket.io-client";
// import InfiniteCanvas from 'ef-infinite-canvas';





// function Whiteboard(props) {
//   const socket = io("http://localhost:4000", {
//     withCredentials: true,
//   });
//   const canvasRef = useRef(null);
//   const [ctx, setCtx] = useState(null);
//   const [elements, setElements] = useState([]);
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [isDragging, setIsDragging] = useState(false); // Track dragging separately
//   const [tool, setTool] = useState("pencil");
//   const [offset, setOffset] = useState({ x: 0, y: 0 });
//   const dragStart = useRef({ x: 0, y: 0 });
//   const roomCode=1
//   const points=[]

//   // useEffect(() => {
//   //   socket.emit('joinRoom', roomCode);
//   //   socket.on("drawing", (data) => {
//   //     if (data.roomCode === roomCode) {
//   //       setElements((prevElements) => [...prevElements, data]);
//   //     }
//   //   });
//   //   return () => {
//   //     socket.off("drawing");
//   //   };
//   // }, [roomCode]);
//   useEffect(()=>{
//     console.log("rerendering")
//     if(!ctx) return;
//     const points = [];

//     socket.on("connect", () => {
//       console.log("Connected to Socket.IO server!");
//     });

//     socket.on("disconnect", () => {
//       console.log("Disconnected from Socket.IO server!");
//     });

//     socket.on(roomCode.toString(), (msg) => {
//       console.log("mesage received ",msg)
//       if (points.length < 100) {
//         points.push(msg);
//       } else {
//         drawCurve(points);
//       }
//     },[ctx]);

//   },[ctx])
//   function drawCurve(points) {
//     if (points.length < 2) return;

//     ctx.strokeStyle = "black";
//     ctx.lineWidth = 2;
//     ctx.beginPath();
//     ctx.moveTo(points[0].x, points[0].y);

//     for (let i = 1; i < points.length; i++) {
//       ctx.lineTo(points[i].x, points[i].y);
//     }

//     ctx.stroke();
//   }


//   const drawPath = (ctx, path, stroke) => {
//     if (path.length === 0) return;
//     ctx.beginPath();
//     ctx.strokeStyle = stroke;
//     ctx.lineWidth = 2;
//     ctx.moveTo(path[0][0] + offset.x, path[0][1] + offset.y);
//     path.forEach(([x, y]) => ctx.lineTo(x + offset.x, y + offset.y));
//     ctx.stroke();
//   };

//   const redrawElements = (ctx) => {
//     ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
//     elements.forEach((element) => {
//       if (element.type === "pencil") {
//         drawPath(ctx, element.path, "black");
//       } else if (element.type === "eraser") {
//         drawPath(ctx, element.path, "white");
//       }
//     });
//   };

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const context = canvas.getContext("2d");
//     setCtx(context)
//     redrawElements(context);
//   }, [elements, offset]);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");

//     const resizeCanvas = () => {
//       canvas.width = window.innerWidth;
//       canvas.height = window.innerHeight;
//       redrawElements(ctx);
//     };
    

//     window.addEventListener("resize", resizeCanvas);
//     resizeCanvas();

//     return () => {
//       window.removeEventListener("resize", resizeCanvas);
//     };
//   }, []);

//   const handleMouseDown = (e) => {
//     const { offsetX, offsetY } = e.nativeEvent;
//     if (e.button === 1 || e.button === 2) { // Middle or right mouse button for dragging
//       setIsDragging(true);
//       dragStart.current = { x: offsetX, y: offsetY };
//       return;
//     }
//     setIsDrawing(true);
//     const newElement = { type: tool, path: [[offsetX - offset.x, offsetY - offset.y]] };
//     setElements((prevElements) => [...prevElements, newElement]);
//   };

//   const handleMouseMove = (e) => {
//     const { offsetX, offsetY } = e.nativeEvent;
//     if (isDragging) {
//       const dx = offsetX - dragStart.current.x;
//       const dy = offsetY - dragStart.current.y;
//       setOffset({ x: offset.x + dx, y: offset.y + dy });
//       dragStart.current = { x: offsetX, y: offsetY };
//       return;
//     }
//     if (!isDrawing) return;
//     const updatedElement = { type: tool, path: [...elements[elements.length - 1].path, [offsetX - offset.x, offsetY - offset.y]] };
//     setElements(prev => [...prev.slice(0, -1), updatedElement]);
  
//     // Log the point if drawing with pencil
//       socket.emit(roomCode.toString(),{roomCode:roomCode,x:offsetX - offset.x,y: offsetY - offset.y})
//       console.log(`Point: (${offsetX - offset.x}, ${offsetY - offset.y})`);
//     }
  

//   const handleMouseUp = () => {
//     setIsDrawing(false);
//     setIsDragging(false);
//   };

//   return (
//     <div>
//       <canvas
//         ref={canvasRef}
//         onMouseDown={handleMouseDown}
//         onMouseMove={handleMouseMove}
//         onMouseUp={handleMouseUp}
//         onContextMenu={(e) => e.preventDefault()} // Prevent right-click menu
//         width={window.innerWidth}
//         height={window.innerHeight}
//         style={{ width: "100%", height: "100%", cursor: isDragging ? 'grabbing' : 'crosshair' }}
//       />
//     </div>
//   );
// }

// export default Whiteboard;

import React, { useRef, useEffect, useState } from "react";
import io from "socket.io-client";
function Whiteboard() {
  
  const socket = io("http://localhost:4000", {
    withCredentials: true,
    
  });  console.log("io created ",socket)
  const canvasRef = useRef(null);
  const [ctx, setCtx] = useState(null);
  let isDrawing = false;
  const [tool, setTool] = useState("pencil"); // State to track selected tool
 
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
    if (!ctx) return; // Check if ctx is null before drawing
    console.log("context set")

    let points = []
    let dr=true;
    console.log("warning")
    socket.on("connect", () => {
      console.log("Connected to Socket.IO server!");
    });

    // Log a message when the Socket.IO client disconnects from the server
    socket.on("disconnect", () => {
      console.log("Disconnected from Socket.IO server!");
    });
    socket.on("cdn", (msg) => {
      console.log("received from server ", msg);
      
      if (points.length < 100) {
        points.push(msg);
        console.log("did not draw")
      } else if(points.length==100 && dr==true ) {
        console.log("drawing points", points);
        drawCurve(points);
        dr=false
      }
    });
}, [ctx]);

  function drawCurve(points) {
    if (points.length < 2) return; // Need at least two points to draw a curve
  
    // Move to the first point
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
  
    // Draw lines between consecutive points
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
  
    // Stroke the path to draw the curve
    ctx.stroke();
    points=[]
  }

  const startDrawing = (event) => {
    isDrawing = true;
    const { offsetX, offsetY } = event.nativeEvent;
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    if (tool === "eraser") {
      erase(offsetX, offsetY);
    }
  };

  const draw = (event) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = event.nativeEvent;
    if (tool === "pencil") {
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
      logPoint(offsetX, offsetY); // Log the point
    }
    if (tool === "eraser") {
      erase(offsetX, offsetY);
    }
  };

  const stopDrawing = () => {
    isDrawing = false;
    ctx.closePath();
  };

  const erase = (x, y) => {
    ctx.clearRect(x - 4, y - 4, 20, 20); // Adjust erase area as needed
  };

  const selectTool = (selectedTool) => {
    setTool(selectedTool);
  };

  const logPoint = (x, y) => {
    console.log(`Point: (${x}, ${y})`,"emitting"); // Log the point coordinates
    socket.emit("cdn",{x:x,y:y})

  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => selectTool("pencil")}
          className={`px-4 py-2 rounded-full ${
            tool === "pencil"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          Pencil
        </button>
        <button
          onClick={() => selectTool("eraser")}
          className={`px-4 py-2 rounded-full ${
            tool === "eraser"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          Eraser
        </button>
      </div>
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