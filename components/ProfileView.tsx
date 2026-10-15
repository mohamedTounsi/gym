"use client";

import { useState } from "react";
import EditProfileModal from "@/components/EditProfileModal";
import Link from "next/link";
import {
  Flame,
  Dumbbell,
  Target,
  Edit,
  Trophy,
  Calendar,
  Clock,
  Sparkles,
  Shield,
  ArrowRight,
} from "lucide-react";

interface ProfileViewProps {
  initialUser: any;
  dynamicFields: any[];
  workouts: any[];
  prs: any[];
  canEdit: boolean;
}

export default function ProfileView({
  initialUser,
  dynamicFields,
  workouts,
  prs,
  canEdit,
}: ProfileViewProps) {
  const [user, setUser] = useState(initialUser);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // BMI calculation
  const heightM = (user.height || 180) / 100;
  const bmi = heightM > 0 ? ((user.weight || 80) / (heightM * heightM)).toFixed(1) : "24.5";

  return (
    <div className="space-y-8">
      {/* Profile Header Hero Card */}
      <div className="bg-metallic-card rounded-3xl p-6 sm:p-10 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            {/* 1:1 Circular Picture with Red Ring */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden ring-4 ring-red-500 gym-glow-red flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                  {user.name}
                </h1>
                {user.role === "admin" && (
                  <span className="px-2.5 py-0.5 rounded-full bg-red-600/20 border border-red-500/30 text-xs font-black text-red-400 uppercase">
                    ADMIN
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-zinc-400 max-w-lg">
                {user.bio || "Iron never lies to you. 5 days a week grind."}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black uppercase">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  {user.streak || 0} Day Streak
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/15 border border-red-500/30 text-red-400 text-xs font-black uppercase">
                  <Dumbbell className="w-3.5 h-3.5" />
                  {workouts.length} Total Workouts
                </span>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          {canEdit && (
            <button
              onClick={() => setIsEditOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white text-xs font-bold uppercase tracking-wider transition hover:border-red-500/40"
            >
              <Edit className="w-4 h-4 text-red-500" />
              <span>Edit Profile & Inputs</span>
            </button>
          )}
        </div>

        {/* Physique & Monthly Goal Section */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10">
          <div className="p-4 rounded-2xl bg-black/50 border border-white/5">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Height</span>
            <span className="text-xl font-black text-white">{user.height || 180} <span className="text-xs text-zinc-500">CM</span></span>
          </div>

          <div className="p-4 rounded-2xl bg-black/50 border border-white/5">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Weight</span>
            <span className="text-xl font-black text-red-500">{user.weight || 80} <span className="text-xs text-zinc-500">KG</span></span>
          </div>

          <div className="p-4 rounded-2xl bg-black/50 border border-white/5">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Body Mass (BMI)</span>
            <span className="text-xl font-black text-white">{bmi}</span>
          </div>

          <div className="p-4 rounded-2xl bg-black/50 border border-white/5">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Total PRs</span>
            <span className="text-xl font-black text-white">{prs.length}</span>
          </div>
        </div>

        {/* Goal of the Month Banner */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-red-950/30 to-black/60 border border-red-500/30 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-600/20 text-red-500 flex-shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-black text-red-400 tracking-wider block">
              Goal of the Month
            </span>
            <p className="text-sm font-bold text-white">
              {user.goalOfTheMonth || "Smash all personal records and stay consistent!"}
            </p>
          </div>
        </div>
      </div>

      {/* DYNAMIC PROFILE INPUTS SECTION (Admin Configured) */}
      {dynamicFields.length > 0 && (
        <section className="bg-metallic-card rounded-3xl p-6 sm:p-8 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-black text-white uppercase tracking-tight">
              Dynamic Attributes & Custom Stats
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {dynamicFields.map((field) => {
              const value = user.customFields?.[field.key];
              return (
                <div
                  key={field.key}
                  className="p-4 rounded-2xl bg-black/50 border border-white/5 hover:border-white/15 transition"
                >
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    {field.label}
                  </span>
                  <span className="text-base font-black text-white">
                    {value !== undefined && value !== "" ? value : <span className="text-xs text-zinc-600 font-normal italic">Not specified</span>}
                  </span>
                  {field.description && (
                    <span className="text-[10px] text-zinc-500 block mt-1">
                      {field.description}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* TWO-COLUMN LAYOUT: MACHINE PRS & WORKOUT HISTORY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Machine PR Shelf (5 cols) */}
        <section className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-black text-white uppercase tracking-tight">
                Machine PR Shelf ({prs.length})
              </h3>
            </div>
          </div>

          {prs.length === 0 ? (
            <div className="bg-metallic-card rounded-3xl p-8 text-center border border-white/10">
              <p className="text-xs text-zinc-400">No machine personal records recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {prs.map((pr, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-metallic-card border border-white/10 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center font-black text-xs">
                      #{idx + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{pr.machineName}</h4>
                      <span className="text-[10px] text-zinc-500">
                        Achieved on {new Date(pr.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xl font-black text-red-500">
                      {pr.maxWeight} <span className="text-xs text-zinc-400">KG</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Workout History (7 cols) */}
        <section className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-black text-white uppercase tracking-tight">
                Workout History ({workouts.length})
              </h3>
            </div>
          </div>

          {workouts.length === 0 ? (
            <div className="bg-metallic-card rounded-3xl p-8 text-center border border-white/10">
              <p className="text-xs text-zinc-400">No completed gym sessions in history yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workouts.map((w) => (
                <div
                  key={w._id}
                  className="bg-metallic-card rounded-2xl p-5 border border-white/10 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-white">{w.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{new Date(w.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{w.durationMinutes || 60} mins</span>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase">
                      COMPLETED
                    </span>
                  </div>

                  {w.notes && (
                    <p className="text-xs text-zinc-300 italic bg-black/40 p-2.5 rounded-xl border border-white/5">
                      &ldquo;{w.notes}&rdquo;
                    </p>
                  )}

                  {/* Machines crushed in this session */}
                  {w.logs && w.logs.length > 0 && (
                    <div className="pt-2 border-t border-white/5 flex flex-wrap gap-2">
                      {w.logs.map((log: any, i: number) => (
                        <div
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/5 text-xs flex items-center gap-1.5"
                        >
                          <span className="font-semibold text-zinc-300">{log.machineName}:</span>
                          <span className="font-black text-red-400">{log.maxWeight}kg</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Edit Profile Modal */}
      {isEditOpen && (
        <EditProfileModal
          user={user}
          dynamicFields={dynamicFields}
          onClose={() => setIsEditOpen(false)}
          onSuccess={(updated) => setUser(updated)}
        />
      )}
    </div>
  );
}
