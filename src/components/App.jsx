import React from "react";
import ReactDOM from "react-dom";
import "./styles/output.css";
import auth from "../auth";
import Forms from "./Forms";
import { Route, Routes } from "react-router-dom";
import RoomPage from "./pages/Roompage";
function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Forms/>}></Route>
        <Route path="/:roomid" element={<RoomPage/>}></Route>
      </Routes>
    </div>
  );
}

export default App;
