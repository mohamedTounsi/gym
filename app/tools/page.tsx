import Navbar from "@/components/Navbar";
import PlateCalculator from "@/components/PlateCalculator";
import OneRepMaxCalc from "@/components/OneRepMaxCalc";
import RestTimer from "@/components/RestTimer";
import { Calculator, Dumbbell, Trophy, Bell } from "lucide-react";

export const metadata = {
  title: "Gym Tools & Strength Calculators | Titan Iron",
  description: "Barbell plate calculator, 1RM calculator, and gym rest timer for heavy lifters.",
};

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calculator className="w-5 h-5 text-red-500" />
            <span className="text-xs font-black uppercase tracking-wider text-red-500">
              Lifter Arsenal
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
            GYM BRO STRENGTH TOOLS
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Calculate your barbell plates per side, estimate your peak 1RM, and time your rests.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            {/* Barbell Plate Calculator */}
            <PlateCalculator />

            {/* 1RM Strength Calculator */}
            <OneRepMaxCalc />
          </div>

          <div className="lg:col-span-4 space-y-6">
            {/* Rest Timer */}
            <RestTimer />

            {/* Lifting Standards Quick Reference Guide */}
            <div className="bg-metallic-card rounded-2xl p-6 border border-white/10 space-y-3">
              <h4 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-red-500" />
                The Iron Brotherhood Standards
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Aim for progressive overload on each gym visit. Log the weight you charged on every machine and keep climbing the leaderboard!
              </p>
              <div className="space-y-2 pt-2 text-xs">
                <div className="flex justify-between p-2 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-zinc-400">1.0x Bodyweight Bench/Chest</span>
                  <span className="text-blue-400 font-bold">Solid Bro</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-zinc-400">1.4x Bodyweight Bench/Chest</span>
                  <span className="text-purple-400 font-bold">Advanced Crusher</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-zinc-400">1.8x+ Bodyweight Bench/Chest</span>
                  <span className="text-red-500 font-bold">Titan Legend</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
