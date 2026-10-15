"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, Mail, Eye, EyeOff, Shield, Dumbbell, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [height, setHeight] = useState("180");
  const [weight, setWeight] = useState("80");
  const [goalOfTheMonth, setGoalOfTheMonth] = useState("Hit 100kg Bench & 20 workouts!");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const payload = isRegister
        ? { name, email, password, height, weight, goalOfTheMonth }
        : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function quickLogin(demoEmail: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: demoEmail, password: "gymbro123" }),
      });

      const data = await res.json();
      if (!res.ok) {
        await seedDatabase(demoEmail);
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function seedDatabase(targetEmail?: string) {
    setSeedLoading(true);
    setError("");
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        await quickLogin(targetEmail || "admin@titangym.com");
      } else {
        setError(data.error || "Seed failed");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSeedLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#070709] flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Background Soft Red Ambiance */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-red-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Main Floating Rounded Card (Design matching user reference image) */}
      <div className="w-full max-w-4xl bg-[#111115] border border-white/10 rounded-[32px] overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col md:flex-row min-h-[580px] z-10">
        
        {/* LEFT PANEL: Fluid Organic Spheres & Welcome Message */}
        <div className="md:w-[46%] bg-gradient-to-br from-red-600 via-rose-700 to-red-950 relative overflow-hidden p-8 sm:p-12 flex flex-col justify-between text-white">
          
          {/* Overlapping Curved 3D Organic Spheres (exact reference design in red) */}
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-gradient-to-br from-red-500/80 to-rose-700/60 blur-sm pointer-events-none" />
          <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-gradient-to-tl from-red-500 via-rose-600 to-red-800 shadow-2xl pointer-events-none" />
          <div className="absolute -bottom-16 left-8 w-56 h-56 rounded-full bg-gradient-to-tr from-rose-700 to-red-900 shadow-xl pointer-events-none" />
          <div className="absolute bottom-6 -right-6 w-32 h-32 rounded-full bg-red-600/50 pointer-events-none" />

          {/* Top Logo / Icon */}
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
              <Dumbbell className="w-5 h-5 -rotate-45" />
            </div>
            <span className="text-sm font-black tracking-widest uppercase">
              TITAN<span className="text-white/80">IRON</span>
            </span>
          </div>

          {/* Center Welcome Headline */}
          <div className="relative z-10 my-auto py-10">
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white mb-2 leading-none">
              WELCOME
            </h1>
            <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-white/90 mb-4">
              THE IRON BROTHERHOOD
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-medium max-w-xs">
              Log into your profile, record today&apos;s charged weights across all machines, compete on the leaderboards, and motivate your brothers.
            </p>
          </div>

          {/* Bottom subtle note */}
          <div className="relative z-10 text-[11px] font-semibold text-white/60 uppercase tracking-widest">
            No Excuses • Only Heavy Iron
          </div>
        </div>

        {/* RIGHT PANEL: Clean Crisp Form with Show/Hide & Remember Me */}
        <div className="md:w-[54%] bg-[#121216] p-8 sm:p-12 flex flex-col justify-center">
          
          <div className="max-w-sm w-full mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {isRegister ? "Create Account" : "Sign in"}
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                {isRegister
                  ? "Enter your details below to join the gym brotherhood."
                  : "Welcome back! Enter your credentials to continue."}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <>
                  {/* Name Input */}
                  <div className="bg-[#1a1a20] border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500 transition">
                    <User className="w-5 h-5 text-zinc-400 flex-shrink-0" />
                    <input
                      type="text"
                      required
                      placeholder="Your Name / Moniker"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-transparent text-white text-sm focus:outline-none placeholder:text-zinc-500"
                    />
                  </div>

                  {/* Height & Weight Inputs */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#1a1a20] border border-white/10 rounded-2xl px-3 py-2.5 flex items-center gap-2 focus-within:border-red-500 transition">
                      <span className="text-xs font-bold text-zinc-500 uppercase">H:</span>
                      <input
                        type="number"
                        required
                        placeholder="Height (cm)"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="w-full bg-transparent text-white text-sm focus:outline-none placeholder:text-zinc-500"
                      />
                    </div>
                    <div className="bg-[#1a1a20] border border-white/10 rounded-2xl px-3 py-2.5 flex items-center gap-2 focus-within:border-red-500 transition">
                      <span className="text-xs font-bold text-zinc-500 uppercase">W:</span>
                      <input
                        type="number"
                        required
                        placeholder="Weight (kg)"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full bg-transparent text-white text-sm focus:outline-none placeholder:text-zinc-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email / Username Input */}
              <div className="bg-[#1a1a20] border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500 transition">
                <User className="w-5 h-5 text-zinc-400 flex-shrink-0" />
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-white text-sm focus:outline-none placeholder:text-zinc-500"
                />
              </div>

              {/* Password Input with SHOW/HIDE Button (Reference image design) */}
              <div className="bg-[#1a1a20] border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500 transition">
                <Lock className="w-5 h-5 text-zinc-400 flex-shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-white text-sm focus:outline-none placeholder:text-zinc-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition flex-shrink-0"
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>

              {/* Remember me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-zinc-400 hover:text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-red-600 focus:ring-0 accent-red-600 cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => alert("Contact your gym admin (Hamza) to reset your pass!")}
                  className="text-zinc-400 hover:text-red-400 transition"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Primary Action Button (Reference: Solid Pill) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-sm tracking-wide uppercase shadow-lg shadow-red-900/40 transition transform active:scale-[0.98] disabled:opacity-50 mt-2"
              >
                {loading ? "AUTHENTICATING..." : isRegister ? "Sign up" : "Sign in"}
              </button>
            </form>

            {/* Divider: ── Or ── */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <span className="relative px-4 text-xs font-semibold text-zinc-500 bg-[#121216] uppercase">
                Or
              </span>
            </div>

            {/* Secondary Action: Sign in as Admin */}
            <button
              type="button"
              onClick={() => quickLogin("admin@titangym.com")}
              className="w-full py-3 rounded-2xl border border-white/20 hover:border-red-500/50 text-white font-bold text-sm tracking-wide transition flex items-center justify-center gap-2 hover:bg-white/5 group"
            >
              <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-[10px] font-black text-white">
                A
              </div>
              <span>Sign in as Admin</span>
            </button>

            {/* Footer: Don't have an account? Sign Up */}
            <div className="mt-6 text-center text-xs text-zinc-400">
              {isRegister ? (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsRegister(false)}
                    className="font-bold text-white hover:text-red-400 transition ml-1"
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsRegister(true)}
                    className="font-bold text-white hover:text-red-400 transition ml-1"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
