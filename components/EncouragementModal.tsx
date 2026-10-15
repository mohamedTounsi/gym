"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { Trophy, Flame, Zap, X, ShieldAlert } from "lucide-react";
import { EncouragementResult } from "@/lib/encouragement";

interface EncouragementModalProps {
  result: EncouragementResult;
  machineName: string;
  weight: number;
  isPr?: boolean;
  onClose: () => void;
}

export default function EncouragementModal({
  result,
  machineName,
  weight,
  isPr,
  onClose,
}: EncouragementModalProps) {
  useEffect(() => {
    // Fire celebratory confetti!
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ef4444", "#dc2626", "#ffffff", "#ffd700"],
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-950 border-2 border-red-500/50 rounded-3xl p-6 sm:p-8 gym-glow-red overflow-hidden shadow-2xl">
        {/* Glow Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-red-800/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="flex flex-col items-center text-center">
          {isPr ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-black tracking-widest uppercase mb-3 animate-bounce">
              <Flame className="w-3.5 h-3.5 text-red-500" />
              <span>NEW PERSONAL RECORD!</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 border border-white/10 text-zinc-300 text-xs font-black tracking-widest uppercase mb-3">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span>POWER LOGGED</span>
            </div>
          )}

          {/* Machine & Weight */}
          <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            {weight} <span className="text-red-500">KG</span>
          </h2>
          <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
            on {machineName}
          </p>

          {/* Tier Medal */}
          <div
            className={`px-4 py-2 rounded-xl border text-sm font-black uppercase tracking-wider mb-5 ${result.tierColor}`}
          >
            {result.badge}
          </div>

          {/* Dynamic Encouragement Message */}
          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-white/10 text-center mb-6">
            <h4 className="text-base font-black text-white uppercase tracking-wide mb-1 text-red-400">
              {result.title}
            </h4>
            <p className="text-sm text-zinc-300 leading-relaxed font-medium">
              &ldquo;{result.message}&rdquo;
            </p>
          </div>

          {/* Percentile Stats */}
          <div className="w-full bg-black/60 rounded-xl p-3 border border-white/5 mb-6 text-left">
            <div className="flex justify-between text-xs font-bold text-zinc-400 mb-1.5">
              <span>Gym Lifter Percentile</span>
              <span className="text-red-400 font-black">Top {100 - result.percentile}%</span>
            </div>
            <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-rose-400 rounded-full transition-all duration-1000"
                style={{ width: `${result.percentile}%` }}
              />
            </div>
          </div>

          {/* Dismiss CTA */}
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 text-white font-black uppercase tracking-wider hover:brightness-110 shadow-lg shadow-red-900/40 transition active:scale-[0.98]"
          >
            LOCK IN GAINS & CONTINUE
          </button>
        </div>
      </div>
    </div>
  );
}
