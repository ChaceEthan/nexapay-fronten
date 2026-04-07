import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

// Protected Route component
function ProtectedRoute({ children }) {
  const user = localStorage.getItem("nexapayUser");
  
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  
  return children;
}

export default function App() {
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
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to signup */}
      <Route path="*" element={<Navigate to="/signup" replace />} />
    </Routes>
  );
}
