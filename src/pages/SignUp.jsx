import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { signUp } from "../services/api.js";

const COUNTRIES = [
  { code: "+250", flag: "RW", name: "Rwanda" },
  { code: "+256", flag: "UG", name: "Uganda" },
  { code: "+254", flag: "KE", name: "Kenya" },
  { code: "+255", flag: "TZ", name: "Tanzania" },
  { code: "+257", flag: "BI", name: "Burundi" },
  { code: "+211", flag: "SS", name: "South Sudan" },
];

export default function SignUp() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [countryCode, setCountryCode] = useState("+250");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");

  const selectedCountry = COUNTRIES.find((country) => country.code === countryCode) || COUNTRIES[0];

  const handlePhoneChange = (event) => {
    setPhone(event.target.value.replace(/\D/g, ""));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!phone || phone.length < 6) {
      setError("Invalid phone number");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await signUp({
        email,
        password,
        phone: `${countryCode}${phone}`,
      });

      setShowOtp(true);
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = () => {
    setOtpError("");

    if (otp.length !== 6) {
      setOtpError("Enter a 6-digit code");
      return;
    }

    navigate("/welcome", { replace: true });
  };

  const handleSkipOtp = () => {
    navigate("/welcome", { replace: true });
  };

  if (showOtp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0e11] px-4 text-white">
        <div className="w-full max-w-md bg-[#1e2329] border border-[#2b3139] rounded-2xl p-6">
          <h1 className="text-2xl font-bold text-center mb-2">Verify Phone</h1>
          <p className="text-center text-sm text-gray-400 mb-6">
            Enter the 6-digit code sent to {countryCode} {phone}
          </p>

          {otpError && (
            <div className="bg-red-500/10 text-red-400 p-2 rounded mb-3 text-sm">
              {otpError}
            </div>
          )}

          <input
            type="text"
            maxLength={6}
            className="w-full bg-[#0b0e11] p-3 rounded border border-[#2b3139] text-center text-lg tracking-widest mb-4"
            placeholder="000000"
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
          />

          <button
            type="button"
            onClick={handleOtpVerify}
            className="w-full bg-cyan-500 text-black p-3 rounded font-semibold mb-3"
          >
            Verify
          </button>

          <button
            type="button"
            onClick={handleSkipOtp}
            className="w-full bg-transparent p-2 rounded text-gray-400 text-sm hover:text-white transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0e11] px-4 text-white">
      <div className="w-full max-w-md bg-[#1e2329] border border-[#2b3139] rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>

        {error && (
          <div className="bg-red-500/10 text-red-400 p-2 rounded mb-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            className="w-full bg-[#0b0e11] p-3 rounded border border-[#2b3139]"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full bg-[#0b0e11] p-3 rounded border border-[#2b3139] pr-10"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              onClick={() => setShowPassword((visible) => !visible)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full bg-[#0b0e11] p-3 rounded border border-[#2b3139] pr-10"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              onClick={() => setShowPassword((visible) => !visible)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="flex gap-2">
            <select
              className="bg-[#0b0e11] p-3 border border-[#2b3139] rounded"
              value={countryCode}
              onChange={(event) => setCountryCode(event.target.value)}
            >
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.name} ({country.code})
                </option>
              ))}
            </select>

            <input
              className="min-w-0 flex-1 bg-[#0b0e11] p-3 border border-[#2b3139] rounded"
              placeholder={`${selectedCountry.code} XXX XXX XXX`}
              value={phone}
              onChange={handlePhoneChange}
              inputMode="numeric"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 text-black p-3 rounded font-semibold disabled:opacity-60"
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm mt-4 text-gray-400">
          Prefer a local wallet?{" "}
          <Link className="text-cyan-400" to="/welcome">
            Continue
          </Link>
        </p>
      </div>
    </div>
  );
}
