// @ts-nocheck
import React, { useState } from "react";
import WalletConnect from "../components/WalletConnect";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [manualWallet, setManualWallet] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Fill in all fields");
      return;
    }
    setError("");
    // TODO: Send to backend authentication
    console.log({ email, password, manualWallet });
    alert("Sign In submitted!");
  };

  const handleManualConnect = () => {
    if (!manualWallet) {
      setError("Enter wallet address for mobile connect");
      return;
    }
    localStorage.setItem("nexapayWallet", manualWallet);
    alert("Mobile wallet connected!");
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Sign In</h1>

        {error && <div className="p-2 mb-4 text-red-400 bg-red-500/10 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 rounded bg-slate-700 text-white"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 rounded bg-slate-700 text-white"
            required
          />

          {/* Optional Mobile Wallet Connect */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Wallet address (mobile)"
              value={manualWallet}
              onChange={(e) => setManualWallet(e.target.value)}
              className="flex-1 p-2 rounded bg-slate-700 text-white"
            />
            <button
              type="button"
              onClick={handleManualConnect}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 rounded"
            >
              Connect
            </button>
          </div>

          <WalletConnect />

          <button
            type="submit"
            className="bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded mt-2"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}