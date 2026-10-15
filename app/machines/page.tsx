import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import Machine from "@/models/Machine";
import WorkoutSession from "@/models/WorkoutSession";
import { getCurrentUser } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { Dumbbell, Plus, Trophy, ArrowRight, Shield } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MachinesPage() {
  const user = await getCurrentUser();
  await connectDB();

  const machines = await Machine.find().sort({ createdAt: -1 }).lean();
  const completedSessions = await WorkoutSession.find({ status: "completed" }).lean();

  const machinesWithStats = machines.map((machine) => {
    let maxWeight = 0;
    let topName = "";
    let topAvatar = "";
    const liftersSet = new Set<string>();

    completedSessions.forEach((s) => {
      s.logs?.forEach((l) => {
        if (
          l.machineId?.toString() === machine._id.toString() ||
          l.machineName.toLowerCase() === machine.name.toLowerCase()
        ) {
          liftersSet.add(s.userId.toString());
          if (l.maxWeight > maxWeight) {
            maxWeight = l.maxWeight;
            topName = s.userName;
            topAvatar = s.userAvatar;
          }
        }
      });
    });

    return {
      ...machine,
      _id: machine._id.toString(),
      totalLifters: liftersSet.size,
      recordWeight: maxWeight,
      topLifter: topName ? { userName: topName, userAvatar: topAvatar } : null,
    };
  });

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Dumbbell className="w-5 h-5 text-red-500" />
              <span className="text-xs font-black uppercase tracking-wider text-red-500">
                Gym Equipment Arena
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
              GYM MACHINES & RECORDS
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Explore equipment, see friend leaderboards, and set new personal milestones.
            </p>
          </div>

          {user?.role === "admin" && (
            <Link
              href="/admin#add-machine"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-wider text-xs shadow-lg shadow-red-900/40 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Machine</span>
            </Link>
          )}
        </div>

        {/* Grid of Machines */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {machinesWithStats.map((machine) => (
            <div
              key={machine._id}
              className="bg-metallic-card rounded-3xl overflow-hidden border border-white/10 hover:border-red-500/50 transition duration-300 flex flex-col group"
            >
              {/* Picture Header - Full High-Def Display */}
              <div className="relative h-64 sm:h-72 w-full bg-zinc-900 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={machine.picture}
                  alt={machine.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 text-xs font-black uppercase tracking-wider text-red-500">
                  {machine.category}
                </span>

                {/* Lifters count tag */}
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-[11px] font-bold text-zinc-300">
                  {machine.totalLifters} {machine.totalLifters === 1 ? "Lifter" : "Lifters"}
                </span>
              </div>

              {/* Machine Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-black text-white group-hover:text-red-400 transition mb-2">
                    {machine.name}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {machine.description || "Standard gym equipment engineered for isolated hypertrophy."}
                  </p>
                </div>

                {/* Champion Bro Banner */}
                <div className="mt-5 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {machine.topLifter?.userAvatar ? (
                        <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-red-500/50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={machine.topLifter.userAvatar}
                            alt={machine.topLifter.userName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-500">
                          🏆
                        </div>
                      )}
                      <div>
                        <span className="text-[10px] text-zinc-400 font-bold uppercase block">
                          Current Record
                        </span>
                        <span className="text-xs font-bold text-white truncate block max-w-[120px]">
                          {machine.topLifter ? machine.topLifter.userName : "No record yet"}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-red-500">
                        {machine.recordWeight > 0 ? `${machine.recordWeight} kg` : "-"}
                      </span>
                    </div>
                  </div>

                  {/* View Details / Leaderboard Link */}
                  <Link
                    href={`/machines/${machine._id}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-red-600 hover:text-white text-zinc-300 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border border-white/10 transition group-hover:border-red-500/30"
                  >
                    <span>View Friends Leaderboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
