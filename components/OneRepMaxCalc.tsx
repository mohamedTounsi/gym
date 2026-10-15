"use client";

import { useState } from "react";
import { Flame, Trophy } from "lucide-react";

export default function OneRepMaxCalc() {
  const [weight, setWeight] = useState<number>(90);
  const [reps, setReps] = useState<number>(6);

  // Epley and Brzycki formulas
  const epley = Math.round(weight * (1 + reps / 30));
  const brzycki = Math.round(weight * (36 / (37 - reps)));
  const estimated1RM = Math.round((epley + brzycki) / 2);

  const repPercentages = [
    { reps: 1, pct: 100 },
    { reps: 2, pct: 95 },
    { reps: 3, pct: 93 },
    { reps: 5, pct: 87 },
    { reps: 8, pct: 80 },
    { reps: 10, pct: 75 },
    { reps: 12, pct: 70 },
  ];

  return (
    <div className="bg-metallic-card rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-600/20 text-red-500">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">1RM Max Strength Calculator</h3>
            <p className="text-xs text-zinc-400">Calculate your ultimate one-rep peak power</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs uppercase tracking-wider text-zinc-400 block font-semibold">Estimated 1RM</span>
          <span className="text-3xl font-black text-red-500 flex items-center justify-end gap-1">
            {estimated1RM} <span className="text-sm font-semibold text-zinc-400">kg</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 block mb-2">
            Lifted Weight (kg)
          </label>
          <input
            type="number"
            min="1"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-full text-center py-2.5 bg-black border border-white/10 rounded-lg text-white font-black text-xl focus:outline-none focus:border-red-500"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 block mb-2">
            Completed Repetitions
          </label>
          <input
            type="number"
            min="1"
            max="15"
            value={reps}
            onChange={(e) => setReps(Math.min(15, Math.max(1, Number(e.target.value))))}
            className="w-full text-center py-2.5 bg-black border border-white/10 rounded-lg text-white font-black text-xl focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-3">
          Estimated Working Weight Table:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {repPercentages.map((item) => {
            const targetWeight = Math.round((estimated1RM * item.pct) / 100);
            return (
              <div
                key={item.reps}
                className="p-2.5 rounded-xl bg-black/60 border border-white/5 text-center hover:border-red-500/40 transition"
              >
                <div className="text-[11px] font-bold text-zinc-400 uppercase">
                  {item.reps} {item.reps === 1 ? "Rep" : "Reps"}
                </div>
                <div className="text-lg font-black text-white">{targetWeight}kg</div>
                <div className="text-[10px] text-red-500 font-semibold">{item.pct}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
