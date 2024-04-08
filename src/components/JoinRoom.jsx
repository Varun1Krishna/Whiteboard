import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

// Initialize Firestore outside your component if not already initialized elsewhere
const db = getFirestore();

function JoinRoom(props) {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState("");

  // handleChange remains unchanged
  const handleChange = (event) => {
    setRoomCode(event.target.value);
  };

  // Adjusted handleJoin to fetch room details when the button is clicked
  const handleJoin = async () => {
    if (!roomCode.trim()) {
      toast.error("Room code cannot be empty.");
      return;
    }
    try {
      const q = query(
        collection(db, "rooms"),
        where("code", "==", roomCode.toUpperCase())
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const docId = doc.id; // Extract docId here
        console.log("docId: ", docId);
        // Navigate to the room with docId as state
        navigate(`/${roomCode}`, { state: { docId: docId, code: roomCode } });
      } else {
        toast("Invalid Room Code!");
        console.log("No matching document found for roomCode:", roomCode);
        // Optionally handle the case where no room is found (e.g., show an alert)
      }
    } catch (error) {
      console.error("Error fetching document:", error);
      toast.error(
        "An error occurred while joining the room. Please try again."
      );
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="rounded-lg bg-gray-900">
        <div className="mx-auto grid w-full max-w-8xl grid-cols-1 gap-x-16 gap-y-16 rounded-lg bg-white p-6 shadow-lg">
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {props.name}
          </h2>
          <div className="mt-6 space-y-6">
            <div className="relative flex items-center w-full rounded-[7px] bg-gray-100">
              <input
                type="text"
                value={roomCode}
                onChange={handleChange}
                className="w-full rounded-[7px] border-t border-b border-l border-blue-gray-200 bg-transparent px-3 py-2.5 text-sm font-normal text-blue-gray-700 outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder={props.placeholder2}
              />
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                onClick={handleJoin}
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

export default JoinRoom;
