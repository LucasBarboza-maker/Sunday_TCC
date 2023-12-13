import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from './Pages/Login/index';
import Home from './Pages/Home/index';
import Schedule from './Pages/Schedule/index';
import Game from './Pages/Game/index';
import ResetPassword from './Pages/ResetPassword/index';

export default function App() {
  return (
    <BrowserRouter>
    <Routes>
        <Route path="/" element={<Login />}></Route>
        <Route path="/home" element={<Home />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/game" element={<Game />} />
        <Route path="/resetPassword/:userId" element={<ResetPassword />} />

    </Routes>
  </BrowserRouter>
  );
}

