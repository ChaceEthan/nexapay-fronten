import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

export default function App() {
  const user = localStorage.getItem("nexapayUser");

  return (
    <Routes>
      {/* Default = Signup */}
      <Route path="/" element={<Navigate to="/signup" replace />} />

      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />

      {/* Protected Dashboard */}
      <Route
        path="/dashboard"
        element={
          user ? <Dashboard /> : <Navigate to="/signin" replace />
        }
      />

      <Route path="*" element={<Navigate to="/signup" replace />} />
    </Routes>
  );
} 