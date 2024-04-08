import React, { useRef, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Whiteboard from "../Whiteboard";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { getFirestore, deleteDoc, doc, getDoc } from "firebase/firestore";
import io from "socket.io-client";

function Roompage(props) {
  const socket = io("http://localhost:4000", {
    withCredentials: true,
  });
  const location = useLocation();
  const docId = location.state?.docId;
  const navigate = useNavigate();
  const db = getFirestore();
  const auth = getAuth();
  const [tool, setTool] = useState("pencil");
  const [color, setColor] = useState("#000000");
  const [elements, setElements] = useState([]);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [roomCode, setRoomCode] = useState("");

  useEffect(() => {
    console.log("docId: ", docId);
    const fetchRoomCode = async () => {
      if (docId) {
        const docRef = doc(db, "rooms", docId);
        const docSnap = await getDoc(docRef);
        console.log("Inside if statement");
        if (docSnap.exists()) {
          // Set the room code to state
          setRoomCode(docSnap.data().code);
          console.log("Fetched and set Room Code:", docSnap.data().code); // Add this line to verify
        } else {
          console.log("No such document!");
        }
      }
    };

    fetchRoomCode();
  }, [docId, db]);

  // const handleSignOut = () => {
  //   signOut(auth).then(() => {
  //     console.log('User signed out successfully');
  //     navigate('/'); // Navigate after sign-out
  //   }).catch((error) => {
  //     console.error('Sign out error', error);
  //   });
  // };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(roomCode)
      .then(() => {
        console.log("Room code copied to clipboard");
        // Optionally, you can show some feedback to the user here.
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
      });
  };

  const handleExit = async () => {
    navigate("/");
  };
  const handleClearCanvas = () => {
    // Emit the clear event
    socket.emit("clearCanvas", { roomCode });
  };
  console.log("Room Code in Roompage:", roomCode); // Add this line
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex flex-row justify-center items-center text-4xl font-bold mt-5 mb-8 w-full">
        {/* Container for the heading to allow it to grow and push the sign out button to the right */}
        <div className="flex-grow text-center">
          Whiteboard Sharing App{" "}
          <span className="text-green-500">[{roomCode}]</span>
        </div>
        <button
          onClick={handleExit}
          className="px-4 py-2 text-2xl bg-black rounded hover:bg-red-600 text-white font-normal mr-4"
        >
          Exit
        </button>
        {/* <button
          onClick={handleSignOut}
          className="px-4 py-2 text-2xl bg-black rounded hover:bg-red-600 text-white font-normal"
        >
          Sign Out
        </button> */}
      </div>
      <div className="flex items-center justify-start gap-8 mb-6">
        {/* Your existing tool selection and color picker UI goes here */}
        <div className="flex gap-2">
          <input
            type="radio"
            id="pencil"
            name="tool"
            value="pencil"
            checked={tool === "pencil"}
            onChange={(e) => setTool(e.target.value)}
          />
          <label htmlFor="pencil">Pencil</label>
          <input
            type="radio"
            id="line"
            name="tool"
            value="line"
            checked={tool === "line"}
            onChange={(e) => setTool(e.target.value)}
          />
          <label htmlFor="line">Line</label>
          <input
            type="radio"
            id="rectangle"
            name="tool"
            value="rectangle"
            checked={tool === "rectangle"}
            onChange={(e) => setTool(e.target.value)}
          />
          <label htmlFor="rectangle">Rectangle</label>
          <input
            type="radio"
            id="eraser"
            name="tool"
            value="eraser"
            checked={tool === "eraser"}
            onChange={(e) => setTool(e.target.value)}
          />
          <label htmlFor="eraser">Eraser</label>
        </div>

        <div className="ml-12 flex items-center gap-2 mr-12">
          <label htmlFor="color">Set Color:</label>
          <input
            type="color"
            id="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>

        <button className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-300 text-white">
          Undo
        </button>
        <button className="px-4 py-2 bg-gray-500 rounded hover:bg-red-500 text-white mr-12">
          Redo
        </button>
        <button
          onClick={handleClearCanvas}
          className="px-4 py-2 bg-red-500 rounded hover:bg-red-600 text-white"
        >
          Clear Canvas
        </button>
      </div>

      <div>
        <Whiteboard
          roomCode={roomCode}
          canvasRef={canvasRef}
          ctxRef={ctxRef}
          elements={elements}
          setElements={setElements}
          tool={tool}
        />
      </div>
    </div>
  );
}

export default Roompage;
