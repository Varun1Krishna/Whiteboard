import React from "react";
import CreateRoom from "./CreateRoom";
import JoinRoom from "./JoinRoom";

function Forms() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="w-full max-w-4xl px-4 flex flex-col md:flex-row justify-around items-center gap-4">
        <div className="w-full md:w-auto">
          <CreateRoom
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
  );
}

export default Forms;
