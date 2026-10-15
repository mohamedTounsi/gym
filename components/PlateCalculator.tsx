"use client";

import { useState } from "react";
import { Dumbbell, Plus, Minus } from "lucide-react";

export default function PlateCalculator() {
  const [targetWeight, setTargetWeight] = useState<number>(100);
  const [barWeight, setBarWeight] = useState<number>(20);

  // Available plates in standard gym kg
  const plateTypes = [
    { weight: 25, color: "bg-red-600 border-red-400 text-white", label: "25kg", height: "h-24" },
    { weight: 20, color: "bg-blue-600 border-blue-400 text-white", label: "20kg", height: "h-22" },
    { weight: 15, color: "bg-yellow-500 border-yellow-300 text-black", label: "15kg", height: "h-20" },
    { weight: 10, color: "bg-emerald-600 border-emerald-400 text-white", label: "10kg", height: "h-16" },
    { weight: 5, color: "bg-zinc-100 border-zinc-400 text-black", label: "5kg", height: "h-14" },
    { weight: 2.5, color: "bg-zinc-800 border-zinc-500 text-white", label: "2.5kg", height: "h-11" },
    { weight: 1.25, color: "bg-zinc-400 border-zinc-200 text-black", label: "1.25kg", height: "h-9" },
  ];

  const weightNeededPerSide = Math.max(0, (targetWeight - barWeight) / 2);

  // Greedy calculation of plates
  const platesPerSide: { weight: number; count: number; color: string; label: string; height: string }[] = [];
  let remaining = weightNeededPerSide;

  plateTypes.forEach((p) => {
    if (remaining >= p.weight) {
      const count = Math.floor(remaining / p.weight);
      platesPerSide.push({ ...p, count });
      remaining = Number((remaining - count * p.weight).toFixed(2));
    }
  });

  const actualTotal = barWeight + platesPerSide.reduce((acc, p) => acc + p.weight * p.count * 2, 0);

  return (
    <div className="bg-metallic-card rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-600/20 text-red-500">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Barbell Plate Calculator</h3>
            <p className="text-xs text-zinc-400">Load the bar without gym brain-fog</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs uppercase tracking-wider text-zinc-400 block font-semibold">Total Load</span>
          <span className="text-2xl font-black text-red-500">{actualTotal} kg</span>
        </div>
      </div>

      {/* Target input controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 block mb-2">
            Target Weight (kg)
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTargetWeight(Math.max(barWeight, targetWeight - 5))}
              className="p-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              step="2.5"
              min={barWeight}
              value={targetWeight}
              onChange={(e) => setTargetWeight(Number(e.target.value))}
              className="w-full text-center py-2 bg-black border border-white/10 rounded-lg text-white font-black text-xl focus:outline-none focus:border-red-500"
            />
            <button
              onClick={() => setTargetWeight(targetWeight + 5)}
              className="p-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 block mb-2">
            Barbell Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Olympic (20kg)", val: 20 },
              { label: "Standard (15kg)", val: 15 },
              { label: "EZ Bar (10kg)", val: 10 },
            ].map((b) => (
              <button
                key={b.val}
                onClick={() => setBarWeight(b.val)}
                className={`py-2 px-2 text-xs font-bold rounded-lg transition ${
                  barWeight === b.val
                    ? "bg-red-600 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Per Side Breakdown */}
      <div className="p-4 rounded-xl bg-black/60 border border-white/5 mb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-3">
          Plates per side ({weightNeededPerSide} kg):
        </span>
        {platesPerSide.length === 0 ? (
          <p className="text-sm text-zinc-500 italic">Empty bar — just the iron barbell!</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {platesPerSide.map((p) => (
              <div
                key={p.weight}
                className={`px-3 py-1.5 rounded-lg border font-black text-sm flex items-center gap-1.5 ${p.color}`}
              >
                <span>{p.count} ×</span>
                <span>{p.weight}kg</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Visual Barbell Representation */}
      <div className="relative h-28 bg-zinc-950/80 rounded-xl border border-white/5 flex items-center justify-center overflow-x-auto px-4">
        {/* Steel Barbell Shaft */}
        <div className="absolute w-[92%] h-3 bg-gradient-to-r from-zinc-600 via-zinc-300 to-zinc-600 rounded-full shadow-inner" />

        {/* Left Collar */}
        <div className="relative flex items-center justify-end mr-8 z-10 gap-1 flex-row-reverse">
          <div className="w-3 h-14 bg-zinc-400 border border-zinc-200 rounded-sm" title="Collar" />
          {platesPerSide.map((p) =>
            Array.from({ length: p.count }).map((_, i) => (
              <div
                key={`left-${p.weight}-${i}`}
                className={`w-3.5 ${p.height} ${p.color} rounded-sm border shadow-md flex items-center justify-center text-[8px] font-black`}
                title={`${p.weight}kg plate`}
              />
            ))
          )}
        </div>

        {/* Center Knurling Indicator */}
        <div className="relative z-10 px-4 py-1 bg-black/80 rounded-full border border-white/20 text-[10px] font-black uppercase tracking-widest text-zinc-300">
          {actualTotal} KG
        </div>

        {/* Right Collar */}
        <div className="relative flex items-center ml-8 z-10 gap-1">
          <div className="w-3 h-14 bg-zinc-400 border border-zinc-200 rounded-sm" title="Collar" />
          {platesPerSide.map((p) =>
            Array.from({ length: p.count }).map((_, i) => (
              <div
                key={`right-${p.weight}-${i}`}
                className={`w-3.5 ${p.height} ${p.color} rounded-sm border shadow-md flex items-center justify-center text-[8px] font-black`}
                title={`${p.weight}kg plate`}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
