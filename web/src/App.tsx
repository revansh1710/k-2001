import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/HomePage";     // new homepage
import PlanetList from "./components/PlanetList"; // dashboard

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Homepage */}
        <Route path="/" element={<Home />} />


        {/* Dashboard (protected later with auth) */}
        <Route path="/dashboard" element={<PlanetList />} />

        {/* Optional: add <Route path="/login" ...> and <Route path="/register" ...> */}
      </Routes>
    </BrowserRouter>
  );
};

export default App;
