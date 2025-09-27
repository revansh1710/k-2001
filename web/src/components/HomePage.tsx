import React, { useState } from "react";
import { Link } from "react-router-dom";
import backgroundVideo from "../assets/background.mp4";
import about from '../assets/about.jpg';
import Swal from "sweetalert2";
const Home: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [error, setError] = useState<string | null>(null);
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget; // save reference here

        setStatus("loading");
        setError(null);

        const formData = new FormData(form);
        const payload = {
            name: formData.get("name"),
            email: formData.get("email"),
            message: formData.get("message"),
        };

        try {
            const res = await fetch(`${import.meta.env.VITE_STRAPI_URL}/api/contact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.error?.message || "Something went wrong");
            }

            setStatus("success");

            Swal.fire({
                title: "Message Sent!",
                text: "Thanks for reaching out — I’ll get back to you soon.",
                icon: "success",
                confirmButtonColor: "#0ea5e9",
            });

            form.reset(); // works now
        } catch (err: any) {
            setStatus("error");
            setError(err.message);

            Swal.fire({
                title: "Oops!",
                text: err.message || "Failed to send your message.",
                icon: "error",
                confirmButtonColor: "#ef4444",
            });
        }
    };


    return (

        <div className="min-h-screen flex flex-col bg-black text-white">
            <header className="fixed top-0 left-0 w-full z-50">
                <nav className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between 
        rounded-b-xl bg-white/10 backdrop-blur-md border-b border-white/20 shadow-md">

                    {/* Logo */}
                    <div className="text-lg sm:text-xl font-bold tracking-wide bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
                        Cosmoscope
                    </div>

                    {/* Desktop links */}
                    <div className="hidden md:flex gap-6 text-sm font-medium text-gray-200">
                        <Link to="/" className="hover:text-sky-400 transition-colors">Home</Link>
                        <a href="#about" className="hover:text-sky-400 transition-colors">About</a>
                        <a href="#contact" className="hover:text-sky-400 transition-colors">Contact</a>
                    </div>

                    {/* Desktop auth buttons */}
                    <div className="hidden md:flex gap-3">
                        <Link
                            to="/login"
                            className="px-3 py-1.5 rounded-lg border border-white/30 text-gray-200 hover:bg-white/10 transition"
                        >
                            Login
                        </Link>
                        <Link
                            to="/register"
                            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold transition"
                        >
                            Register
                        </Link>
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden text-gray-200 focus:outline-none"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle menu"
                    >
                        {isOpen ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </nav>

                {/* Mobile menu */}
                {isOpen && (
                    <div className="md:hidden bg-black/90 backdrop-blur-md border-t border-white/10 px-6 py-4 space-y-4">
                        <div className="flex flex-col gap-4 text-gray-200">
                            <a href="#about" onClick={() => setIsOpen(false)} className="hover:text-sky-400">About</a>
                            <a href="#contact" onClick={() => setIsOpen(false)} className="hover:text-sky-400">Contact</a>
                        </div>
                        <div className="flex flex-col gap-3 mt-4">
                            <Link
                                to="/login"
                                onClick={() => setIsOpen(false)}
                                className="px-3 py-2 rounded-lg border border-white/30 text-gray-200 hover:bg-white/10 transition text-center"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                onClick={() => setIsOpen(false)}
                                className="px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold transition text-center"
                            >
                                Register
                            </Link>
                        </div>
                    </div>
                )}
            </header>


            {/* Hero with video background */}
            <section className="relative h-screen flex items-center justify-center text-center overflow-hidden">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                >
                    <source src={backgroundVideo} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>

                {/* overlay */}
                <div className="absolute inset-0 bg-black/60" aria-hidden />

                <div className="relative z-10 px-6">
                    <h1 className="text-4xl sm:text-6xl font-extrabold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
                        Welcome to Cosmoscope
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-300 leading-relaxed">
                        Explore the cosmos, powered by Strapi, React, NASA APOD, and ISRO missions.
                    </p>
                    <div className="mt-8 flex gap-4 justify-center">
                        <Link
                            to="/dashboard"
                            className="px-6 py-3 rounded-lg bg-sky-600 hover:bg-sky-700 font-semibold shadow-lg transition"
                        >
                            Enter Dashboard 🚀
                        </Link>
                    </div>
                </div>
            </section>

            {/* About Me */}
            <section className="py-20 px-6 bg-gradient-to-b from-slate-900 to-black" id="about">
                <div className="max-w-6xl mx-auto text-center mb-12">
                    <h2 className="text-3xl font-bold mb-6">About Me</h2>

                    {/* Profile Image */}
                    <div className="flex justify-center mb-6">
                        <img
                            src={about}
                            alt="Kaushik, creator of Cosmoscope"
                            className="w-40 h-40 rounded-full object-cover border-4 border-sky-500/40 shadow-lg shadow-sky-900/40 hover:scale-105 transition-transform duration-300"
                        />
                    </div>

                    <p className="mt-4 text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        I’m Kaushik, creator of Cosmoscope. I love building with Strapi, React,
                        and exploring data-driven visualizations of the universe.
                    </p>
                </div>

                {/* Info Cards */}
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <div className="p-6 bg-white/5 rounded-xl shadow hover:shadow-lg hover:bg-white/10 transition">
                        <h3 className="text-xl font-semibold mb-2">🌌 Cosmoscope</h3>
                        <p className="text-gray-300 text-sm">
                            A dashboard to explore planets, orbits, NASA’s APOD, and ISRO launches.
                        </p>
                    </div>
                    <div className="p-6 bg-white/5 rounded-xl shadow hover:shadow-lg hover:bg-white/10 transition">
                        <h3 className="text-xl font-semibold mb-2">⚙️ Tech Stack</h3>
                        <p className="text-gray-300 text-sm">
                            Built with Strapi v5, React + Tailwind, Recharts, and Kendo Free UI.
                        </p>
                    </div>
                    <div className="p-6 bg-white/5 rounded-xl shadow hover:shadow-lg hover:bg-white/10 transition">
                        <h3 className="text-xl font-semibold mb-2">🚀 Future</h3>
                        <p className="text-gray-300 text-sm">
                            Expanding Cosmoscope with more APIs, user auth, and personalized dashboards.
                        </p>
                    </div>
                </div>
            </section>


            {/* Contact */}
            <section className="py-20 px-6 bg-slate-950" id="contact">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4">Contact</h2>
                    <p className="text-gray-400 mb-8">
                        Want to collaborate, connect, or give feedback? Reach out below.
                    </p>
                    <form className="space-y-4 max-w-md mx-auto" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="name"
                            placeholder="Your name"
                            className="w-full px-4 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder-gray-400"
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Your email"
                            className="w-full px-4 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder-gray-400"
                            required
                        />
                        <textarea
                            name="message"
                            placeholder="Your message"
                            rows={4}
                            className="w-full px-4 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder-gray-400"
                            required
                        ></textarea>
                        <button
                            type="submit"
                            disabled={status === "loading"}
                            className="w-full px-4 py-2 rounded-md bg-sky-600 hover:bg-sky-700 text-white font-semibold transition disabled:opacity-50"
                        >
                            {status === "loading" ? "Sending..." : "Send"}
                        </button>

                        {/* Status messages */}
                        {status === "success" && (
                            <p className="text-green-400 text-sm">Message sent successfully ✅</p>
                        )}
                        {status === "error" && (
                            <p className="text-red-400 text-sm">Error: {error}</p>
                        )}
                    </form>

                </div>
            </section>

            {/* Footer */}
            <footer className="py-6 px-6 bg-black border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 items-center text-sm text-gray-400 gap-y-4">
                {/* Left: auth links */}
                <div className="flex gap-4 justify-center sm:justify-start">
                    <Link to="/login" className="hover:text-sky-400">
                        Login
                    </Link>
                    <Link to="/register" className="hover:text-sky-400">
                        Register
                    </Link>
                </div>

                {/* Center: credits */}
                <div className="text-center">
                    <a
                        href="https://www.pexels.com/@tetsunari-kawano-238537881/"
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-sky-400"
                    >
                        Video by TETSUNARI KAWANO
                    </a>
                </div>

                {/* Right: copyright */}
                <div className="text-center sm:text-right">
                    &copy; {new Date().getFullYear()} Cosmoscope. All rights reserved.
                </div>
            </footer>

        </div>
    );
};

export default Home;
