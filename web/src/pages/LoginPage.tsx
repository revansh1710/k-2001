import { useState } from "react";
import { useNavigate } from "react-router-dom";
import loginHero from "../assets/Login.png"; // Use your generated cosmic hero image

const Login = ({ setUser }: { setUser: (user: any) => void }) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (identifier: string, password: string) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(import.meta.env.VITE_LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      if (!res.ok) {
        const errorMsg = await res.text();
        throw new Error(errorMsg || "Login failed");
      }

      const data = await res.json();

      // Save token and user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(identifier, password);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
      {/* Left Side: Hero image */}
      <div className="relative">
        <img
          src={loginHero}
          alt="Cosmic hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Right Side: Form */}
      <div className="relative flex flex-col justify-center items-center 
        bg-gradient-to-br from-[#1a1a1a] via-[#222] to-[#111] 
        text-white overflow-hidden">

        {/* Starry texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none" />

        <div className="relative z-10 w-full max-w-md bg-black/70 border border-white/10 
          backdrop-blur-md rounded-xl shadow-2xl p-8">

          <h1 className="text-4xl font-serif tracking-widest text-sky-400 text-center drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)] mb-6">
            COSMOSCOPE
          </h1>

          <h2 className="text-2xl font-bold mb-6 text-center font-serif tracking-wide">
            Login
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Email or Username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              autoComplete="username"
              className="w-full px-4 py-2 rounded-md bg-white/5 border border-white/20 
                text-white placeholder-gray-400 focus:ring-2 focus:ring-sky-400 focus:outline-none"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-2 rounded-md bg-white/5 border border-white/20 
                text-white placeholder-gray-400 focus:ring-2 focus:ring-sky-400 focus:outline-none"
            />

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-md bg-sky-600 hover:bg-sky-700 
                transition-colors font-semibold tracking-wide disabled:opacity-50"
            >
              {loading ? "Logging in…" : "Login"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-400">
            Don’t have an account?{" "}
            <a href="/register" className="text-sky-400 hover:underline">
              Register
            </a>
          </p>
        </div>

        <p className="absolute bottom-4 text-xs text-gray-500 italic tracking-wide">
          © {new Date().getFullYear()} Cosmoscope • Explore with vintage spirit
        </p>
      </div>
    </div>
  );
};

export default Login;
