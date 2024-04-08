import React, { useState, useEffect } from "react";
import CreateRoom from "./CreateRoom";
import JoinRoom from "./JoinRoom";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  query,
  where,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

function Forms() {
  const auth = getAuth();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsSignedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        console.log("User signed out successfully");
        navigate("/"); // Navigate after sign-out
      })
      .catch((error) => {
        console.error("Sign out error", error);
      });
  };

  const handleSignIn = async () => {
    if (!auth.currentUser) {
      try {
        await signInWithPopup(auth, new GoogleAuthProvider());
      } catch (error) {
        console.error("Error signing in with Google:", error);
        return; // Stop execution if sign-in fails
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <ToastContainer closeOnClick/>
      <div className="w-full p-4 flex justify-between">
        {!isSignedIn && (
          <button
            onClick={handleSignIn}
            className="bg-blue-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Sign In
          </button>
        )}
        <div className="flex-grow"></div>

        {isSignedIn && (
          <button
            onClick={handleSignOut}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Sign Out
          </button>
        )}
      </div>

      <div className="flex-grow flex justify-center items-center">
        <div className="w-full max-w-4xl px-4 flex flex-col md:flex-row justify-around items-center gap-4">
          <div className="w-full md:w-auto">
            <CreateRoom
              isSignedIn={isSignedIn}
              name="Create Room"
              placeholder1="Enter your name"
              placeholder2="Create a room code"
              button="Create Room"
            />
          </div>
          <div className="w-full md:w-auto">
            <JoinRoom
              name="Join Room"
              placeholder1="Enter your name"
              placeholder2="Enter room code"
              button="Join Room"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Forms;
