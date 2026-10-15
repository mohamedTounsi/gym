import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Machine from "@/models/Machine";
import WorkoutSession from "@/models/WorkoutSession";
import BroFeed from "@/models/BroFeed";
import Navbar from "@/components/Navbar";
import BroFeedWidget from "@/components/BroFeedWidget";
import {
  Flame,
  Dumbbell,
  Play,
  Trophy,
  ArrowRight,
  TrendingUp,
  Target,
  Zap,
  Users,
  Calendar,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  await connectDB();

  // 1. Fetch active session
  const activeSession = await WorkoutSession.findOne({
    userId: user._id,
    status: "active",
  }).lean();

  // 2. Fetch machines
  const machines = await Machine.find().lean();

  // 3. Fetch completed sessions to compute top records
  const completedSessions = await WorkoutSession.find({ status: "completed" })
    .sort({ date: -1 })
    .lean();

  // Map machine top lifters
  const topMachines = machines.slice(0, 4).map((m) => {
    let topMax = 0;
    let topName = "None yet";
    let topAvatar = "";

    completedSessions.forEach((s) => {
      s.logs?.forEach((l) => {
        if (l.machineId?.toString() === m._id.toString() || l.machineName === m.name) {
          if (l.maxWeight > topMax) {
            topMax = l.maxWeight;
            topName = s.userName;
            topAvatar = s.userAvatar;
          }
        }
      });
    });

    return {
      _id: m._id.toString(),
      name: m.name,
      category: m.category,
      picture: m.picture,
      recordWeight: topMax,
      recordHolder: topName,
      recordAvatar: topAvatar,
    };
  });

  // 4. Fetch User's PRs
  const userPrMap = new Map<string, number>();
  completedSessions
    .filter((s) => s.userId.toString() === user._id.toString())
    .forEach((s) => {
      s.logs?.forEach((l) => {
        const cur = userPrMap.get(l.machineName) || 0;
        if (l.maxWeight > cur) userPrMap.set(l.machineName, l.maxWeight);
      });
    });

  const userPrCount = userPrMap.size;
  let highestWeightLifted = 0;
  userPrMap.forEach((w) => {
    if (w > highestWeightLifted) highestWeightLifted = w;
  });

  // 5. Fetch feed
  const feedRaw = await BroFeed.find().sort({ createdAt: -1 }).limit(15).lean();
  const feed = JSON.parse(JSON.stringify(feedRaw));

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Hero Banner */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-zinc-900 via-black to-zinc-900 border border-white/10 p-6 sm:p-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-black tracking-wider uppercase">
                  <Flame className="w-3.5 h-3.5 fill-current text-red-500" />
                  {user.streak || 0} DAY STREAK
                </span>
                <span className="text-xs text-zinc-400 font-semibold">
                  Member of Titan Iron Brotherhood
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
                WELCOME BACK, <span className="text-red-500">{user.name.split(" ")[0]}</span>!
              </h1>

              <p className="text-sm sm:text-base text-zinc-400 mt-2 max-w-xl font-medium">
                {user.goalOfTheMonth
                  ? `Monthly Target: "${user.goalOfTheMonth}"`
                  : "No excuses today. Step up, load the machines, and make your friends respect the weight."}
              </p>
            </div>

            {/* Main Action: Start or Resume Workout */}
            <div className="w-full lg:w-auto flex-shrink-0">
              {activeSession ? (
                <Link
                  href="/workout"
                  className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-wider text-base gym-glow-red transition transform hover:scale-105"
                >
                  <span className="w-3 h-3 rounded-full bg-white animate-ping" />
                  <span>RESUME ACTIVE WORKOUT</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <Link
                  href="/workout"
                  className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:brightness-110 text-white font-black uppercase tracking-wider text-base shadow-xl shadow-red-900/50 transition transform hover:scale-105"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>START TODAY&apos;S GYM DAY</span>
                </Link>
              )}
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10">
            <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Body Weight
              </span>
              <div className="text-2xl font-black text-white">{user.weight || 78} <span className="text-sm font-semibold text-zinc-500">KG</span></div>
            </div>

            <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Peak Lift
              </span>
              <div className="text-2xl font-black text-red-500">{highestWeightLifted || 0} <span className="text-sm font-semibold text-zinc-500">KG</span></div>
            </div>

            <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                PRs Recorded
              </span>
              <div className="text-2xl font-black text-white">{userPrCount} <span className="text-sm font-semibold text-zinc-500">MACHINES</span></div>
            </div>

            <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Gym Streak
              </span>
              <div className="text-2xl font-black text-amber-400">{user.streak || 0} <span className="text-sm font-semibold text-zinc-500">DAYS</span></div>
            </div>
          </div>
        </section>

        {/* Two-Column Grid: Machines Spotlight & Live Bro Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Top Machines and Leaderboard records (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-600/20 text-red-500">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">
                    Machine Champions
                  </h2>
                  <p className="text-xs text-zinc-400">Current max weight records held by the group</p>
                </div>
              </div>
              <Link
                href="/machines"
                className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 uppercase tracking-wider"
              >
                View All Machines <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {topMachines.map((machine) => (
                <Link
                  key={machine._id}
                  href={`/machines/${machine._id}`}
                  className="group bg-metallic-card rounded-2xl overflow-hidden border border-white/10 hover:border-red-500/50 transition duration-300 flex flex-col"
                >
                  {/* Machine Photo - Full High-Def Display */}
                  <div className="relative h-52 sm:h-60 w-full overflow-hidden bg-zinc-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={machine.picture}
                      alt={machine.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-wider text-red-500">
                      {machine.category}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <h3 className="font-bold text-sm text-white group-hover:text-red-400 transition truncate">
                      {machine.name}
                    </h3>

                    {/* Friend Champion info */}
                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {machine.recordAvatar ? (
                          <div className="relative w-6 h-6 rounded-full overflow-hidden ring-1 ring-red-500/50">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={machine.recordAvatar}
                              alt={machine.recordHolder}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-500">
                            -
                          </div>
                        )}
                        <span className="text-xs text-zinc-300 truncate max-w-[90px]">
                          {machine.recordHolder}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-zinc-500 block uppercase font-bold">Record</span>
                        <span className="text-sm font-black text-red-500">
                          {machine.recordWeight > 0 ? `${machine.recordWeight} kg` : "Unclaimed"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Quick Gym Tools Widget teaser */}
            <div className="bg-gradient-to-r from-zinc-950 to-zinc-900 rounded-2xl p-6 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-red-600/20 text-red-500">
                  <Dumbbell className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-white text-base uppercase">Gym Bro Strength Calculators</h4>
                  <p className="text-xs text-zinc-400">Calculate barbell plates or predict your 1RM power instantly.</p>
                </div>
              </div>
              <Link
                href="/tools"
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider border border-white/10 transition"
              >
                Launch Tools
              </Link>
            </div>
          </div>

          {/* Right Column: Live BroFeed (5 cols) */}
          <div className="lg:col-span-5">
            <BroFeedWidget initialFeed={feed} currentUserName={user.name} />
          </div>
        </div>
      </main>
    </div>
  );
}
