"use client";

import { useState } from "react";
import { X, Upload, Camera, Save, Sparkles } from "lucide-react";

interface DynamicFieldDef {
  _id: string;
  label: string;
  key: string;
  type: "text" | "number" | "select";
  options?: string[];
  placeholder?: string;
}

interface EditProfileModalProps {
  user: {
    _id: string;
    name: string;
    avatar: string;
    height?: number;
    weight?: number;
    goalOfTheMonth?: string;
    bio?: string;
    customFields?: Record<string, any>;
  };
  dynamicFields: DynamicFieldDef[];
  onClose: () => void;
  onSuccess: (updatedUser: any) => void;
}

export default function EditProfileModal({
  user,
  dynamicFields,
  onClose,
  onSuccess,
}: EditProfileModalProps) {
  const [name, setName] = useState(user.name || "");
  const [avatar, setAvatar] = useState(user.avatar || "");
  const [height, setHeight] = useState(String(user.height || 180));
  const [weight, setWeight] = useState(String(user.weight || 80));
  const [goalOfTheMonth, setGoalOfTheMonth] = useState(user.goalOfTheMonth || "");
  const [bio, setBio] = useState(user.bio || "");
  const [customFields, setCustomFields] = useState<Record<string, any>>(user.customFields || {});

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setAvatar(data.url);
    } catch (err: any) {
      setError(err.message || "Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  }

  function handleCustomFieldChange(key: string, value: any) {
    setCustomFields((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          avatar,
          height: Number(height),
          weight: Number(weight),
          goalOfTheMonth,
          bio,
          customFields,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
          Update Profile & Custom Stats
        </h2>
        <p className="text-xs text-zinc-400 mb-6">
          Update your 1:1 circular photo via Cloudinary, physique measurements, and dynamic gym goals.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* 1:1 Circular Picture Section */}
          <div className="p-4 rounded-2xl bg-black/60 border border-white/5 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-red-500/50 flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              {uploading && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            <div className="flex-1 w-full space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block">
                1:1 Circular Picture (Cloudinary / Direct Upload)
              </label>

              <div className="flex items-center gap-2">
                <label className="flex-1 cursor-pointer py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-semibold text-zinc-300 flex items-center justify-center gap-2 transition">
                  <Camera className="w-4 h-4 text-red-500" />
                  <span>{uploading ? "Uploading..." : "Upload New Photo"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <input
                type="text"
                placeholder="Or paste Cloudinary / Image URL..."
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full px-3 py-1.5 bg-black border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Standard Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Name / Moniker
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-black border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full px-3 py-2.5 bg-black border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-3 py-2.5 bg-black border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              Goal of the Month
            </label>
            <input
              type="text"
              value={goalOfTheMonth}
              onChange={(e) => setGoalOfTheMonth(e.target.value)}
              placeholder="e.g. 130kg Bench Press & hit 22 gym workouts"
              className="w-full px-4 py-2.5 bg-black border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              Bio / Lifting Philosophy
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Brief motto or workout focus..."
              className="w-full px-4 py-2 bg-black border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          {/* DYNAMIC PROFILE FIELDS (ADMIN DEFINED) */}
          {dynamicFields.length > 0 && (
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-red-500" />
                <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  Dynamic Gym Profile Attributes (Configured by Admin)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {dynamicFields.map((field) => (
                  <div key={field.key}>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                      {field.label}
                    </label>

                    {field.type === "select" && field.options && field.options.length > 0 ? (
                      <select
                        value={customFields[field.key] || ""}
                        onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                        className="w-full px-4 py-2.5 bg-black border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
                      >
                        <option value="">Select option...</option>
                        {field.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type === "number" ? "number" : "text"}
                        placeholder={field.placeholder || `Enter ${field.label}...`}
                        value={customFields[field.key] || ""}
                        onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                        className="w-full px-4 py-2.5 bg-black border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={saving || uploading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 text-white font-black uppercase tracking-wider text-sm hover:brightness-110 shadow-lg shadow-red-900/40 transition active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? "SAVING PROFILE..." : "SAVE & UPDATE BRO PROFILE"}
          </button>
        </form>
      </div>
    </div>
  );
}
