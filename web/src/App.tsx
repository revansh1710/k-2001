import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./utils/ProtectedRoute";
import Home from "./components/HomePage";
import PlanetList from "./components/PlanetList";
import Register from "./pages/RegistrationPage";
import Login from "./pages/LoginPage";

const App: React.FC = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check session on first load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-600">
        Checking session...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public homepage */}
        <Route path="/" element={<Home />} />

        {/* Protected dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <PlanetList />
            </ProtectedRoute>
          }
        />

        {/* Auth pages */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
