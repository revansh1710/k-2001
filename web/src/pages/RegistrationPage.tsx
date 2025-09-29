import { useState } from "react";
import axios from "axios";
import registration from "../assets/Registration.png"; 

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    fullName: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(
        "http://localhost:1337/api/user/register",
        formData,
        { withCredentials: true }
      );

      setMessage("🎉 Registration successful! Welcome to Cosmoscope.");
      console.log(res.data);
      // You can redirect after success if needed:
      // window.location.href = "/login";
    } catch (err: any) {
      setMessage(err.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
      <div className="relative">
        <img
          src={registration}
          alt="Cosmic Illustration"
          className="w-full h-full object-cover"
        />
        {/* Dark overlay to improve contrast */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Right Side: Form Section */}
      <div className="relative flex flex-col justify-center items-center 
        bg-gradient-to-br from-[#1a1a1a] via-[#222] to-[#111] 
        text-white overflow-hidden">

        {/* Starry texture overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none" />

        {/* Header */}
        <div className="mb-8 text-center relative z-10">
          <h1 className="text-4xl font-serif tracking-widest text-sky-400 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
            COSMOSCOPE
          </h1>
          <p className="text-sm text-gray-400 italic mt-1">
            Vintage Vibes • Modern Exploration
          </p>
        </div>

        {/* Form Card */}
        <div className="relative z-10 w-full max-w-md bg-black/70 border border-white/10 
          backdrop-blur-md rounded-xl shadow-2xl p-8">

          <h2 className="text-2xl font-bold mb-6 text-center font-serif tracking-wide">
            Register
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-md bg-white/5 border border-white/20 
                text-white placeholder-gray-400 focus:ring-2 focus:ring-sky-400 focus:outline-none"
            />

            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-md bg-white/5 border border-white/20 
                text-white placeholder-gray-400 focus:ring-2 focus:ring-sky-400 focus:outline-none"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-md bg-white/5 border border-white/20 
                text-white placeholder-gray-400 focus:ring-2 focus:ring-sky-400 focus:outline-none"
            />

            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-md bg-white/5 border border-white/20 
                text-white placeholder-gray-400 focus:ring-2 focus:ring-sky-400 focus:outline-none"
            />

            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-md bg-white/5 border border-white/20 
                text-white placeholder-gray-400 focus:ring-2 focus:ring-sky-400 focus:outline-none"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-md bg-sky-600 hover:bg-sky-700 
                transition-colors font-semibold tracking-wide disabled:opacity-50"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          {message && (
            <p className="mt-4 text-center text-sm text-gray-300">{message}</p>
          )}

          <p className="mt-4 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <a href="/login" className="text-sky-400 hover:underline">
              Login
            </a>
          </p>
        </div>

        {/* Footer note */}
        <p className="absolute bottom-4 text-xs text-gray-500 italic tracking-wide">
          © {new Date().getFullYear()} Cosmoscope • Explore with vintage spirit
        </p>
      </div>
    </div>
  );
};

export default Register;
