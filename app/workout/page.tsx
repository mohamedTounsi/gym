"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import RestTimer from "@/components/RestTimer";
import EncouragementModal from "@/components/EncouragementModal";
import { EncouragementResult, evaluateStrength } from "@/lib/encouragement";
import confetti from "canvas-confetti";
import {
  Play,
  CheckCircle,
  Dumbbell,
  Plus,
  Flame,
  Clock,
  Trophy,
  Trash2,
  ChevronRight,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";

interface MachineItem {
  _id: string;
  name: string;
  category: "Chest" | "Back" | "Legs" | "Shoulders" | "Arms" | "Core";
  picture: string;
  description: string;
  benchmarks: {
    beginner: number;
    intermediate: number;
    advanced: number;
    elite: number;
  };
  tips: string[];
  totalLifters?: number;
  recordWeight?: number;
  topLifter?: {
    userName: string;
    userAvatar: string;
    maxWeight: number;
  };
}

interface LoggedItem {
  machineId: string;
  machineName: string;
  category?: string;
  maxWeight: number;
  sets?: { reps: number; weight: number }[];
  rpe?: number;
  feedback?: string;
  isPr?: boolean;
}

interface SessionData {
  _id: string;
  title: string;
  notes: string;
  status: string;
  startedAt: string;
  logs: LoggedItem[];
}

export default function WorkoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<SessionData | null>(null);
  const [machines, setMachines] = useState<MachineItem[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<MachineItem | null>(null);
  const [weightInput, setWeightInput] = useState<string>("80");
  const [repsInput, setRepsInput] = useState<string>("10");
  const [rpeInput, setRpeInput] = useState<number>(8);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sessionTitle, setSessionTitle] = useState<string>("Heavy Day at the Gym");

  // Encouragement modal
  const [encouragement, setEncouragement] = useState<{
    result: EncouragementResult;
    machineName: string;
    weight: number;
    isPr?: boolean;
  } | null>(null);

  // Live timer
  const [elapsedTime, setElapsedTime] = useState<string>("00:00");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSessionAndMachines();
  }, []);

  useEffect(() => {
    if (!session?.startedAt) return;
    const interval = setInterval(() => {
      const diffMs = Date.now() - new Date(session.startedAt).getTime();
      const totalSecs = Math.max(0, Math.floor(diffMs / 1000));
      const mins = Math.floor(totalSecs / 60);
      const secs = totalSecs % 60;
      setElapsedTime(
        `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [session?.startedAt]);

  async function fetchSessionAndMachines() {
    setLoading(true);
    try {
      // 1. Fetch current workout
      const sessRes = await fetch("/api/workout");
      if (sessRes.status === 401) {
        router.push("/login");
        return;
      }
      if (sessRes.ok) {
        const sessData = await sessRes.json();
        setSession(sessData.activeSession || null);
      }

      // 2. Fetch machines
      const machRes = await fetch("/api/machines");
      if (machRes.ok) {
        const machData = await machRes.json();
        setMachines(machData.machines || []);
        if (machData.machines?.length > 0 && !selectedMachine) {
          setSelectedMachine(machData.machines[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStartDay() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: sessionTitle }),
      });
      if (res.ok) {
        const data = await res.json();
        setSession(data.session);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogMachine() {
    if (!selectedMachine || !weightInput) return;
    setSubmitting(true);
    try {
      const numericWeight = Number(weightInput);
      const numericReps = Number(repsInput) || 10;

      const res = await fetch("/api/workout", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "log_machine",
          machineId: selectedMachine._id,
          maxWeight: numericWeight,
          sets: [{ reps: numericReps, weight: numericWeight }],
          rpe: rpeInput,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSession(data.session);

        // Show encouragement modal
        setEncouragement({
          result: data.strengthEval,
          machineName: selectedMachine.name,
          weight: numericWeight,
          isPr: data.isPr,
        });

        // Refresh machine stats
        const machRes = await fetch("/api/machines");
        if (machRes.ok) {
          const machData = await machRes.json();
          setMachines(machData.machines || []);
          const updated = machData.machines.find((m: MachineItem) => m._id === selectedMachine._id);
          if (updated) setSelectedMachine(updated);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFinishWorkout() {
    if (!confirm("Ready to lock this gym day in history?")) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/workout", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "finish" }),
      });

      if (res.ok) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.5 },
        });
        setSession(null);
        router.push("/");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancelSession() {
    if (!confirm("Are you sure you want to discard this active workout?")) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/workout", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      if (res.ok) {
        setSession(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  const categories = ["All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];

  const filteredMachines = machines.filter((m) => {
    const matchesCat = selectedCategory === "All" || m.category === selectedCategory;
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* IF NO ACTIVE SESSION -> START DAY CTA */}
        {!session ? (
          <div className="max-w-2xl mx-auto my-12 text-center">
            <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-tr from-red-600 to-rose-700 text-white gym-glow-red mb-6">
              <Dumbbell className="w-12 h-12 -rotate-45" />
            </div>

            <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white mb-3">
              START THE <span className="text-red-500">GYM DAY</span>
            </h1>
            <p className="text-base text-zinc-400 mb-8 max-w-lg mx-auto">
              Just stepped into the gym? Check in now, select the machines you crush, charge heavy iron,
              and motivate your brothers!
            </p>

            <div className="bg-metallic-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl mb-8 text-left">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                Today&apos;s Workout Focus / Name
              </label>
              <input
                type="text"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="e.g. Chest & Triceps Annihilation"
                className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white font-bold text-base focus:outline-none focus:border-red-500 transition mb-6"
              />

              <button
                onClick={handleStartDay}
                disabled={submitting}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 text-white font-black uppercase tracking-wider text-lg hover:brightness-110 gym-glow-red transition transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
              >
                {submitting ? "INITIALIZING DAY..." : "START DAY & ENTER THE IRON ARENA"}
              </button>
            </div>
          </div>
        ) : (
          /* ACTIVE WORKOUT SESSION INTERFACE */
          <div className="space-y-8">
            {/* Active Header Bar */}
            <div className="bg-gradient-to-r from-red-950/40 via-black to-zinc-950 rounded-3xl p-6 border border-red-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white gym-glow-red">
                  <Play className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span className="text-xs font-black uppercase tracking-wider text-red-400">
                      LIVE GYM SESSION
                    </span>
                  </div>
                  <h1 className="text-2xl font-black text-white uppercase">{session.title}</h1>
                </div>
              </div>

              {/* Timer & Finish controls */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                <div className="px-4 py-2 rounded-xl bg-black/60 border border-white/10 font-mono text-xl font-black text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-red-500" />
                  {elapsedTime}
                </div>

                <button
                  onClick={handleFinishWorkout}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-wider text-xs shadow-lg shadow-red-900/40 transition active:scale-95"
                >
                  Finish & Lock Day
                </button>

                <button
                  onClick={handleCancelSession}
                  className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 border border-white/5 transition"
                  title="Discard session"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Machine Catalog & Selector (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-red-500" />
                    Select Machine to Charge
                  </h3>
                  <span className="text-xs text-zinc-500">{filteredMachines.length} available</span>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search machine name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                {/* Category Pills */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition flex-shrink-0 ${
                        selectedCategory === cat
                          ? "bg-red-600 text-white"
                          : "bg-zinc-900 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Machines List */}
                <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                  {filteredMachines.map((machine) => {
                    const isSelected = selectedMachine?._id === machine._id;
                    const isAlreadyLogged = session.logs?.some(
                      (l) => l.machineId.toString() === machine._id
                    );

                    return (
                      <button
                        key={machine._id}
                        onClick={() => setSelectedMachine(machine)}
                        className={`w-full p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
                          isSelected
                            ? "bg-red-950/30 border-red-500/60 shadow-lg"
                            : "bg-metallic-card border-white/5 hover:border-white/15"
                        }`}
                      >
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-zinc-900 flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={machine.picture}
                            alt={machine.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold uppercase text-red-500">
                              {machine.category}
                            </span>
                            {isAlreadyLogged && (
                              <span className="text-[10px] font-black text-emerald-400 uppercase flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Logged
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-white truncate">{machine.name}</h4>
                          <span className="text-[11px] text-zinc-400 block mt-0.5">
                            Group Record: {machine.recordWeight ? `${machine.recordWeight}kg` : "Unclaimed"}
                          </span>
                        </div>

                        <ChevronRight
                          className={`w-4 h-4 ${
                            isSelected ? "text-red-500" : "text-zinc-600"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Center / Right Column: Charge Weight on Selected Machine & Encouragement (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                {selectedMachine ? (
                  <div className="bg-metallic-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
                    {/* Full Machine Picture Banner */}
                    <div className="relative h-56 sm:h-72 w-full rounded-2xl overflow-hidden mb-6 border border-white/10 shadow-xl group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedMachine.picture}
                        alt={selectedMachine.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 text-xs font-black uppercase tracking-wider text-red-500">
                        {selectedMachine.category} Station
                      </span>
                    </div>

                    {/* Machine Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider text-red-500 block mb-1">
                          {selectedMachine.category}
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase">
                          {selectedMachine.name}
                        </h2>
                      </div>

                      {/* Top Record Badge */}
                      <div className="px-4 py-2 rounded-2xl bg-black/60 border border-white/10 text-right">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                          Current Friend Record
                        </span>
                        <span className="text-lg font-black text-red-500 flex items-center justify-end gap-1.5">
                          <Trophy className="w-4 h-4" />
                          {selectedMachine.recordWeight || 0} kg
                        </span>
                        {selectedMachine.topLifter && (
                          <span className="text-[11px] text-zinc-400 block">
                            held by {selectedMachine.topLifter.userName}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Weight Charging Input Box */}
                    <div className="bg-black/60 rounded-2xl p-6 border border-white/5 mb-6">
                      <span className="text-xs font-black uppercase tracking-wider text-zinc-400 block mb-4 text-center">
                        HOW MUCH WEIGHT ARE YOU CHARGING TODAY?
                      </span>

                      <div className="flex items-center justify-center gap-4 mb-4">
                        <button
                          type="button"
                          onClick={() => setWeightInput(String(Math.max(5, Number(weightInput) - 5)))}
                          className="w-12 h-12 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xl border border-white/10 transition"
                        >
                          -5
                        </button>

                        <div className="relative">
                          <input
                            type="number"
                            step="2.5"
                            min="5"
                            max="600"
                            value={weightInput}
                            onChange={(e) => setWeightInput(e.target.value)}
                            className="w-44 text-center py-3 bg-zinc-950 border-2 border-red-500 rounded-2xl text-4xl font-black text-white focus:outline-none gym-glow-red-sm"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-black text-zinc-500">
                            KG
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setWeightInput(String(Number(weightInput) + 5))}
                          className="w-12 h-12 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xl border border-white/10 transition"
                        >
                          +5
                        </button>
                      </div>

                      {/* Reps & RPE Intensity */}
                      <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-4 border-t border-white/5">
                        <div>
                          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1 text-center">
                            Reps Performed
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={repsInput}
                            onChange={(e) => setRepsInput(e.target.value)}
                            className="w-full text-center py-2 bg-zinc-900 border border-white/10 rounded-xl text-white font-bold text-sm"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1 text-center">
                            Exertion (RPE {rpeInput}/10)
                          </label>
                          <input
                            type="range"
                            min="5"
                            max="10"
                            value={rpeInput}
                            onChange={(e) => setRpeInput(Number(e.target.value))}
                            className="w-full accent-red-500 mt-2"
                          />
                        </div>
                      </div>

                      {/* Log Action Button */}
                      <button
                        onClick={handleLogMachine}
                        disabled={submitting}
                        className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 text-white font-black uppercase tracking-wider text-sm hover:brightness-110 gym-glow-red transition transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
                      >
                        {submitting ? "CALCULATING DATASET & LOGGING..." : "CHARGE WEIGHT & LOG EXERCISE"}
                      </button>
                    </div>

                    {/* Scientific Benchmarks for this machine */}
                    <div className="p-4 rounded-2xl bg-zinc-950 border border-white/5">
                      <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 block mb-3">
                        Scientific Strength Standards for {selectedMachine.name}:
                      </span>
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        <div className="p-2 rounded-xl bg-zinc-900/60 border border-white/5">
                          <span className="text-zinc-500 block text-[10px] uppercase font-bold">Rookie</span>
                          <span className="font-bold text-white">{selectedMachine.benchmarks?.beginner || 40}kg</span>
                        </div>
                        <div className="p-2 rounded-xl bg-blue-950/30 border border-blue-500/20">
                          <span className="text-blue-400 block text-[10px] uppercase font-bold">Gym Bro</span>
                          <span className="font-bold text-white">{selectedMachine.benchmarks?.intermediate || 70}kg</span>
                        </div>
                        <div className="p-2 rounded-xl bg-purple-950/30 border border-purple-500/20">
                          <span className="text-purple-400 block text-[10px] uppercase font-bold">Crusher</span>
                          <span className="font-bold text-white">{selectedMachine.benchmarks?.advanced || 100}kg</span>
                        </div>
                        <div className="p-2 rounded-xl bg-red-950/30 border border-red-500/20">
                          <span className="text-red-400 block text-[10px] uppercase font-bold">Titan</span>
                          <span className="font-bold text-white">{selectedMachine.benchmarks?.elite || 140}kg</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-metallic-card rounded-3xl p-12 text-center border border-white/10">
                    <p className="text-zinc-400">Select a machine from the left catalog to start charging weight!</p>
                  </div>
                )}

                {/* Rest Timer Widget */}
                <RestTimer />

                {/* Today's Logged Machines History */}
                {session.logs && session.logs.length > 0 && (
                  <div className="bg-metallic-card rounded-3xl p-6 border border-white/10">
                    <h3 className="text-base font-black text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      Machines Crushed Today ({session.logs.length})
                    </h3>

                    <div className="space-y-3">
                      {session.logs.map((log, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-black/50 border border-white/5 flex items-center justify-between gap-4"
                        >
                          <div>
                            <span className="text-[10px] font-bold text-red-500 uppercase">
                              {log.category || "Station"}
                            </span>
                            <h4 className="text-sm font-bold text-white">{log.machineName}</h4>
                            <p className="text-xs text-zinc-400 mt-1 italic">&ldquo;{log.feedback}&rdquo;</p>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <span className="text-2xl font-black text-white">{log.maxWeight} <span className="text-sm text-red-500">KG</span></span>
                            {log.isPr && (
                              <span className="block text-[10px] font-black uppercase text-amber-400">
                                🚀 NEW PR!
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Encouragement Popup Modal */}
      {encouragement && (
        <EncouragementModal
          result={encouragement.result}
          machineName={encouragement.machineName}
          weight={encouragement.weight}
          isPr={encouragement.isPr}
          onClose={() => setEncouragement(null)}
        />
      )}
    </div>
  );
}
