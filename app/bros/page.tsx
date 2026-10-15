import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import WorkoutSession from "@/models/WorkoutSession";
import Navbar from "@/components/Navbar";
import { Users, Flame, Dumbbell, Target, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function GymBrosPage() {
  await connectDB();

  const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();

  const usersWithStats = await Promise.all(
    users.map(async (u) => {
      const workoutCount = await WorkoutSession.countDocuments({
        userId: u._id,
        status: "completed",
      });
      return {
        ...u,
        _id: u._id.toString(),
        workoutCount,
      };
    })
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-red-500" />
            <span className="text-xs font-black uppercase tracking-wider text-red-500">
              Iron Brotherhood
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
            GYM BROS & COMMUNITY PROFILES
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Inspect your workout partners&apos; goals, track records, dynamic stats, and iron consistency.
          </p>
        </div>

        {/* Bros Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {usersWithStats.map((bro) => (
            <div
              key={bro._id}
              className="bg-metallic-card rounded-3xl p-6 border border-white/10 hover:border-red-500/50 transition duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* 1:1 Circular Avatar Header */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden ring-4 ring-red-500/40 group-hover:ring-red-500 transition flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={bro.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"}
                      alt={bro.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="text-lg font-black text-white truncate group-hover:text-red-400 transition">
                        {bro.name}
                      </h3>
                      {bro.role === "admin" && (
                        <span className="px-2 py-0.5 rounded-full bg-red-600/20 border border-red-500/30 text-[10px] font-black text-red-400 uppercase">
                          ADMIN
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400">
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        {bro.streak || 0}d Streak
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-xs text-zinc-400 font-semibold">
                        {bro.workoutCount} Workouts
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vitals row */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-black/50 border border-white/5 mb-4 text-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">Height</span>
                    <span className="text-sm font-black text-white">{bro.height || 180} cm</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">Weight</span>
                    <span className="text-sm font-black text-white">{bro.weight || 80} kg</span>
                  </div>
                </div>

                {/* Goal of the month */}
                <div className="mb-4">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1 mb-1">
                    <Target className="w-3 h-3 text-red-500" />
                    Goal of the Month:
                  </span>
                  <p className="text-xs text-zinc-300 font-medium italic line-clamp-2">
                    &ldquo;{bro.goalOfTheMonth || "Build pure muscle & smash PRs!"}&rdquo;
                  </p>
                </div>
              </div>

              {/* View Full Profile CTA */}
              <Link
                href={`/profile/${bro._id}`}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-red-600 hover:text-white text-zinc-300 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border border-white/10 transition mt-2"
              >
                <span>View Full Bro Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
