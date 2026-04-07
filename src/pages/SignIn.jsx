// @ts-nocheck
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Fill in all fields");
      return;
    }

    setError("");

    // Fake login (later uzashyiramo backend)
    localStorage.setItem("nexapayUser", email);

    // Redirect to dashboard
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Sign In</h1>

        {error && (
          <div className="p-2 mb-4 text-red-400 bg-red-500/10 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 rounded bg-slate-700 text-white"
        />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 rounded bg-slate-700 text-white"
          />

          <button className="bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded mt-2">
            Sign In
          </button>
        </form>

        {/* Switch to signup */}
        <p className="text-sm text-center text-slate-400 mt-4">
          Don&apos;t have an account?
          <span
            onClick={() => navigate("/signup")}
            className="text-cyan-400 cursor-pointer ml-1"
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
}
