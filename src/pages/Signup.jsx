// @ts-nocheck
import React, { useState } from "react";

// African countries with flags and codes (most common ones)
const africanCountries = [
  { name: "Rwanda", code: "+250", flag: "🇷🇼" },
  { name: "Kenya", code: "+254", flag: "🇰🇪" },
  { name: "Uganda", code: "+256", flag: "🇺🇬" },
  { name: "Tanzania", code: "+255", flag: "🇹🇿" },
  { name: "South Africa", code: "+27", flag: "🇿🇦" },
  { name: "Nigeria", code: "+234", flag: "🇳🇬" },
  { name: "Ghana", code: "+233", flag: "🇬🇭" },
  { name: "Senegal", code: "+221", flag: "🇸🇳" },
  { name: "Cameroon", code: "+237", flag: "🇨🇲" },
  { name: "Ethiopia", code: "+251", flag: "🇪🇹" },
  { name: "Sudan", code: "+249", flag: "🇸🇩" },
  { name: "Morocco", code: "+212", flag: "🇲🇦" },
  { name: "Egypt", code: "+20", flag: "🇪🇬" },
  { name: "Algeria", code: "+213", flag: "🇩🇿" },
  { name: "Senegal", code: "+221", flag: "🇸🇳" },
  { name: "Mozambique", code: "+258", flag: "🇲🇿" },
  { name: "Zambia", code: "+260", flag: "🇿🇲" },
  { name: "Zimbabwe", code: "+263", flag: "🇿🇼" },
  { name: "Botswana", code: "+267", flag: "🇧🇼" },
  { name: "Namibia", code: "+264", flag: "🇳🇦" },
];

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+250"); // Rwanda default
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword || !phone) {
      setError("Fill all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    // TODO: Send to backend
    console.log({ email, password, phone: countryCode + phone });
    alert("Sign Up submitted!");
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Sign Up</h1>

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
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 rounded bg-slate-700 text-white"
            required
          />

          {/* Phone with African country codes */}
          <div className="flex gap-2">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="p-2 rounded bg-slate-700 text-white"
            >
              {africanCountries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name} ({c.code})
                </option>
              ))}
            </select>
            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 p-2 rounded bg-slate-700 text-white"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded mt-2"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}