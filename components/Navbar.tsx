"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Dumbbell, Users, Shield, Flame, LogOut, Calculator, Trophy, Play } from "lucide-react";

interface UserInfo {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  streak: number;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [activeDuration, setActiveDuration] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchUserAndSession();
    const interval = setInterval(fetchUserAndSession, 15000);
    return () => clearInterval(interval);
  }, []);

  async function fetchUserAndSession() {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);

        // Check active session
        const sessRes = await fetch("/api/workout");
        if (sessRes.ok) {
          const sessData = await sessRes.json();
          if (sessData.activeSession) {
            setHasActiveSession(true);
            const startTime = new Date(sessData.activeSession.startedAt).getTime();
            const mins = Math.max(1, Math.round((Date.now() - startTime) / 60000));
            setActiveDuration(`${mins}m`);
          } else {
            setHasActiveSession(false);
          }
        }
      } else {
        setUser(null);
      }
    } catch {
      // not logged in
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  }

  const navLinks = [
    { label: "Dashboard", href: "/", icon: Flame },
    { label: "Machines & PRs", href: "/machines", icon: Dumbbell },
    { label: "Gym Bros", href: "/bros", icon: Users },
    { label: "Tools", href: "/tools", icon: Calculator },
  ];

  if (user?.role === "admin") {
    navLinks.push({ label: "Admin Hub", href: "/admin", icon: Shield });
  }

  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-700 flex items-center justify-center text-white gym-glow-red-sm transform group-hover:scale-105 transition duration-300">
              <Dumbbell className="w-6 h-6 -rotate-45" />
            </div>
            <div>
              <span className="text-xl font-black tracking-wider text-white flex items-center gap-1">
                TITAN<span className="text-red-500">IRON</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-zinc-400 block -mt-1 font-semibold">
                Brothers in Iron
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "text-white bg-red-600/20 border border-red-500/30"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-red-500" : ""}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action / User Controls */}
          <div className="flex items-center gap-3">
            {/* Start / In Session Button */}
            {user && (
              <Link
                href="/workout"
                className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wider transition ${
                  hasActiveSession
                    ? "bg-red-600 text-white animate-pulse gym-glow-red"
                    : "bg-gradient-to-r from-red-600 to-rose-700 text-white hover:brightness-110 shadow-lg shadow-red-900/30"
                }`}
              >
                {hasActiveSession ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                    <span>Lifting ({activeDuration})</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Day</span>
                  </>
                )}
              </Link>
            )}

            {/* Profile Avatar / Login */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                <Link
                  href={`/profile/${user._id}`}
                  className="flex items-center gap-2 group"
                  title="My Profile"
                >
                  <div className="relative w-9 h-9 rounded-full ring-2 ring-red-500/50 hover:ring-red-500 transition overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="hidden lg:block text-sm font-semibold text-zinc-200 group-hover:text-red-400 transition">
                    {user.name.split(" ")[0]}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800/60 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-1.5 rounded-lg text-sm font-bold bg-zinc-800 text-white hover:bg-zinc-700 border border-white/10 transition"
              >
                Sign In
              </Link>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-white/10 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium ${
                    isActive
                      ? "text-white bg-red-600/20 border border-red-500/30"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-red-500" : ""}`} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
