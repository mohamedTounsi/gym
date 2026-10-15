import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Machine from "@/models/Machine";
import WorkoutSession from "@/models/WorkoutSession";
import Navbar from "@/components/Navbar";
import { evaluateStrength } from "@/lib/encouragement";
import { Trophy, Dumbbell, ArrowLeft, Flame, Play, ShieldAlert, Award, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MachineDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectDB();

  const machine = await Machine.findById(id).lean();
  if (!machine) {
    notFound();
  }

  // Find all workout sessions that logged this machine
  const sessions = await WorkoutSession.find({
    $or: [{ "logs.machineId": machine._id }, { "logs.machineName": machine.name }],
    status: "completed",
  })
    .sort({ date: -1 })
    .lean();

  // Find user personal bests
  const liftersMap = new Map<
    string,
    {
      userId: string;
      userName: string;
      userAvatar: string;
      maxWeight: number;
      date: Date;
      feedback?: string;
      tierData: any;
    }
  >();

  sessions.forEach((s) => {
    s.logs?.forEach((l) => {
      if (
        l.machineId?.toString() === machine._id.toString() ||
        l.machineName.toLowerCase() === machine.name.toLowerCase()
      ) {
        const uId = s.userId.toString();
        const existing = liftersMap.get(uId);
        if (!existing || l.maxWeight > existing.maxWeight) {
          const evalRes = evaluateStrength(
            machine.name,
            machine.category,
            l.maxWeight,
            78,
            machine.benchmarks
          );
          liftersMap.set(uId, {
            userId: uId,
            userName: s.userName,
            userAvatar: s.userAvatar,
            maxWeight: l.maxWeight,
            date: s.date,
            feedback: l.feedback || evalRes.message,
            tierData: evalRes,
          });
        }
      }
    });
  });

  const leaderboard = Array.from(liftersMap.values())
    .sort((a, b) => b.maxWeight - a.maxWeight)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Back Link */}
        <Link
          href="/machines"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Machines</span>
        </Link>

        {/* Machine Full Hero Picture Banner */}
        <div className="relative w-full h-80 sm:h-[440px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={machine.picture}
            alt={machine.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="px-3 py-1 rounded-xl bg-red-600 text-white text-xs font-black uppercase tracking-wider shadow-lg">
                {machine.category} Station
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight mt-2 drop-shadow-md">
                {machine.name}
              </h1>
            </div>

            <Link
              href="/workout"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-wider text-xs shadow-xl shadow-red-900/50 transition self-start sm:self-auto"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Charge This Machine</span>
            </Link>
          </div>
        </div>

        {/* Machine Details & Benchmarks */}
        <div className="bg-metallic-card rounded-3xl p-6 sm:p-10 border border-white/10 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-500">
              Equipment Specs & Biomechanics
            </span>
            <p className="text-sm sm:text-base text-zinc-300 mt-2 leading-relaxed">
              {machine.description || "Targeted machine engineered for heavy overload and safe eccentric resistance."}
            </p>
          </div>

            {/* Scientific Strength Benchmarks */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                Scientific Strength Benchmarks (KG)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-3 rounded-xl bg-black/50 border border-white/5 text-center">
                  <span className="text-[10px] text-zinc-500 uppercase font-black block">Beginner</span>
                  <span className="text-base font-black text-white">{machine.benchmarks?.beginner || 40} kg</span>
                </div>
                <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/20 text-center">
                  <span className="text-[10px] text-blue-400 uppercase font-black block">Intermediate</span>
                  <span className="text-base font-black text-blue-300">{machine.benchmarks?.intermediate || 70} kg</span>
                </div>
                <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-center">
                  <span className="text-[10px] text-purple-400 uppercase font-black block">Advanced</span>
                  <span className="text-base font-black text-purple-300">{machine.benchmarks?.advanced || 100} kg</span>
                </div>
                <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-center">
                  <span className="text-[10px] text-red-400 uppercase font-black block">Titan Elite</span>
                  <span className="text-base font-black text-red-400">{machine.benchmarks?.elite || 140} kg</span>
                </div>
              </div>
            </div>

            {/* Form Tips */}
            {machine.tips && machine.tips.length > 0 && (
              <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                  Pro Execution Tips:
                </span>
                <ul className="list-disc list-inside space-y-1 text-xs text-zinc-300">
                  {machine.tips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Start / Log Button */}
            <Link
              href="/workout"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-wider text-xs shadow-lg shadow-red-900/40 transition"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Charge This Machine Now</span>
            </Link>
          </div>

        {/* FRIENDS LEADERBOARD SECTION */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-600/20 text-red-500">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                  Friends Leaderboard & Usage
                </h2>
                <p className="text-xs text-zinc-400">
                  Who from your friend group is charging this machine and their personal bests
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-zinc-400">
              {leaderboard.length} Lifters Ranked
            </span>
          </div>

          {leaderboard.length === 0 ? (
            <div className="bg-metallic-card rounded-3xl p-12 text-center border border-white/10">
              <Dumbbell className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">No Friend Has Charged This Machine Yet!</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto mb-6">
                Be the undisputed first champion to claim the #1 throne on the {machine.name}!
              </p>
              <Link
                href="/workout"
                className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-black uppercase text-xs hover:bg-red-500 transition"
              >
                Log First Record
              </Link>
            </div>
          ) : (
            <div className="bg-metallic-card rounded-3xl overflow-hidden border border-white/10">
              <div className="divide-y divide-white/5">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.userId}
                    className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition"
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank Medal */}
                      <div className="w-10 text-center font-black text-xl">
                        {entry.rank <= 3 ? (
                          <span className="text-2xl">{medals[entry.rank - 1]}</span>
                        ) : (
                          <span className="text-sm text-zinc-500">#{entry.rank}</span>
                        )}
                      </div>

                      {/* 1:1 Circular Avatar */}
                      <Link href={`/profile/${entry.userId}`} className="group flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-red-500/40 group-hover:ring-red-500 transition">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={entry.userAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"}
                            alt={entry.userName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-white group-hover:text-red-400 transition">
                            {entry.userName}
                          </h4>
                          <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-zinc-500" />
                            {new Date(entry.date).toLocaleDateString()}
                          </span>
                        </div>
                      </Link>
                    </div>

                    {/* Weight & Power Tier */}
                    <div className="flex items-center gap-4 self-end sm:self-center">
                      <div className={`hidden sm:inline-flex px-3 py-1 rounded-xl border text-xs font-black uppercase tracking-wider ${entry.tierData?.tierColor}`}>
                        {entry.tierData?.badge}
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                          Personal Best
                        </span>
                        <span className="text-2xl font-black text-red-500">
                          {entry.maxWeight} <span className="text-xs text-zinc-400">KG</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
