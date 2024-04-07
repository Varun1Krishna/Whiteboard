import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import Roompage from "./pages/Roompage";
import {  toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function CreateRoom(props) {
  const navigate = useNavigate();
  const db = getFirestore();
  const [roomCode, setRoomCode] = useState("");
  const [codeGenerated, setCodeGenerated] = useState(false);
  const [docId, setDocId] = useState(null); // Firestore document ID of the generated room
  const [isCopied, setIsCopied] = useState(false); 

  
  const handleCopy = () => {
    if (roomCode) {
      navigator.clipboard
        .writeText(roomCode)
        .then(() => {
          setIsCopied(true); // Set isCopied to true on successful copy
          setTimeout(() => setIsCopied(false), 2000); // Reset isCopied after 2 seconds
        })
        .catch((err) => {
          console.error("Failed to copy room code: ", err);
        });
    }
  };

  const generateRoomCode = () => {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  };

  const checkRoomCodeExists = async (code) => {
    const roomsRef = collection(db, "rooms");
    const q = query(roomsRef, where("code", "==", code));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const handleGenerate = async () => {
    if (!props.isSignedIn) {
      toast("Please sign in to generate a room code.");
      return;
    }

    // If there's a previously generated code, remove it
    if (docId) {
      await deleteDoc(doc(db, "rooms", docId));
      setDocId(null);
    }

    let code = generateRoomCode();
    let codeExists = await checkRoomCodeExists(code);
    while (codeExists) {
      code = generateRoomCode();
      codeExists = await checkRoomCodeExists(code);
    }

    // Add the new room code to Firestore
    const docRef = await addDoc(collection(db, "rooms"), { code });
    setRoomCode(code);
    setCodeGenerated(true);
    setDocId(docRef.id); // Store the document ID for potential deletion later
  };

  const createRoomAndNavigate = async () => {
    if (!props.isSignedIn) {
      toast("Please sign in to create a room.");
      return;
    }

    if (!codeGenerated) {
      toast("Please generate a room code first.");
      return;
    }
    console.log("docId: ",docId);
    navigate(`/${roomCode}`, { state: { docId } });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="rounded-lg bg-gray-900">
        <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-x-16 gap-y-16 rounded-lg bg-white p-6 shadow-lg">
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {props.name}
          </h2>
          <div className="mt-6 space-y-6">
            <div className="relative flex items-center w-full rounded-[7px] bg-gray-100">
              <input
                type="text"
                className="flex-grow rounded-l-[7px] border-t border-b border-l border-blue-gray-200 bg-transparent px-3 py-2.5 text-sm font-normal text-blue-gray-700 outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder={props.placeholder2}
                value={roomCode} // Bind the input value to the roomCode state
                readOnly // Make the input read-only since the code is generated programmatically
              />
              <button
                className="rounded-none bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-400"
                type="button"
                onClick={handleGenerate}
              >
                Generate
              </button>
              <button
                className={`px-4 py-2 rounded-r-[7px] text-sm font-semibold text-white transition-all ${
                  isCopied
                    ? "bg-green-500 hover:bg-green-400"
                    : "bg-red-500 hover:bg-red-400"
                }`} 
                type="button"
                onClick={handleCopy}
              >
                {isCopied ? "Copied!" : "Copy"}
              </button>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                onClick={createRoomAndNavigate}
                className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus:outline-none"
              >
                {props.button}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateRoom;
