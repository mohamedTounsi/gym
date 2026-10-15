"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  Shield,
  Dumbbell,
  Plus,
  Trash2,
  Sparkles,
  Camera,
  Layers,
  Database,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface MachineItem {
  _id: string;
  name: string;
  category: string;
  picture: string;
  description: string;
  benchmarks: {
    beginner: number;
    intermediate: number;
    advanced: number;
    elite: number;
  };
}

interface DynamicFieldItem {
  _id: string;
  label: string;
  key: string;
  type: string;
  options?: string[];
  placeholder?: string;
  description?: string;
  required: boolean;
}

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [machines, setMachines] = useState<MachineItem[]>([]);
  const [fields, setFields] = useState<DynamicFieldItem[]>([]);
  const [activeTab, setActiveTab] = useState<"machines" | "fields" | "database">("machines");

  // Add Machine form state
  const [mName, setMName] = useState("");
  const [mCategory, setMCategory] = useState("Chest");
  const [mPicture, setMPicture] = useState("https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&auto=format&fit=crop&q=80");
  const [mDesc, setMDesc] = useState("");
  const [mTips, setMTips] = useState("Control the eccentric movement down slowly.\nExplode with power on the concentric phase.");
  const [mBeginner, setMBeginner] = useState("40");
  const [mIntermediate, setMIntermediate] = useState("70");
  const [mAdvanced, setMAdvanced] = useState("100");
  const [mElite, setMElite] = useState("140");
  const [machineUploading, setMachineUploading] = useState(false);

  // Add Dynamic Field form state
  const [fLabel, setFLabel] = useState("");
  const [fType, setFType] = useState<"text" | "number" | "select">("text");
  const [fOptions, setFOptions] = useState("");
  const [fPlaceholder, setFPlaceholder] = useState("");
  const [fDesc, setFDesc] = useState("");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  async function checkAdminAndFetch() {
    setLoading(true);
    try {
      const meRes = await fetch("/api/auth/me");
      if (!meRes.ok) {
        router.push("/login");
        return;
      }
      const meData = await meRes.json();
      if (meData.user?.role !== "admin") {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      setIsAdmin(true);

      // Fetch machines
      const machRes = await fetch("/api/machines");
      if (machRes.ok) {
        const mData = await machRes.json();
        setMachines(mData.machines || []);
      }

      // Fetch dynamic fields
      const fRes = await fetch("/api/dynamic-fields");
      if (fRes.ok) {
        const fData = await fRes.json();
        setFields(fData.fields || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handlePictureUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setMachineUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setMPicture(data.url);
      }
    } catch {
      // fallback
    } finally {
      setMachineUploading(false);
    }
  }

  async function handleAddMachine(e: React.FormEvent) {
    e.preventDefault();
    try {
      const tipsArray = mTips
        .split("\n")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const res = await fetch("/api/machines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: mName,
          category: mCategory,
          picture: mPicture,
          description: mDesc,
          benchmarks: {
            beginner: Number(mBeginner),
            intermediate: Number(mIntermediate),
            advanced: Number(mAdvanced),
            elite: Number(mElite),
          },
          tips: tipsArray,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create machine");

      setMachines((prev) => [data.machine, ...prev]);
      setMessage({ type: "success", text: `Machine "${mName}" successfully added!` });
      setMName("");
      setMDesc("");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    }
  }

  async function handleDeleteMachine(id: string) {
    if (!confirm("Are you sure you want to delete this gym machine?")) return;
    try {
      const res = await fetch(`/api/machines/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMachines((prev) => prev.filter((m) => m._id !== id));
        setMessage({ type: "success", text: "Machine deleted." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    }
  }

  async function handleAddDynamicField(e: React.FormEvent) {
    e.preventDefault();
    try {
      const optionsArray =
        fType === "select"
          ? fOptions
              .split(",")
              .map((o) => o.trim())
              .filter((o) => o.length > 0)
          : [];

      const res = await fetch("/api/dynamic-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: fLabel,
          type: fType,
          options: optionsArray,
          placeholder: fPlaceholder,
          description: fDesc,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add field");

      setFields((prev) => [...prev, data.field]);
      setMessage({
        type: "success",
        text: `Dynamic field "${fLabel}" created! It is now active on all profile pages.`,
      });
      setFLabel("");
      setFPlaceholder("");
      setFDesc("");
      setFOptions("");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    }
  }

  async function handleDeleteField(id: string) {
    if (!confirm("Are you sure you want to delete this profile field?")) return;
    try {
      const res = await fetch(`/api/dynamic-fields?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setFields((prev) => prev.filter((f) => f._id !== id));
        setMessage({ type: "success", text: "Profile field deleted." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    }
  }

  async function handleSeedDatabase() {
    if (!confirm("This will refresh all machines, dynamic fields, and gym bro accounts to test data. Proceed?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      if (res.ok) {
        setMessage({ type: "success", text: "Database successfully re-seeded!" });
        await checkAdminAndFetch();
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

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

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <Shield className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-black uppercase text-white">Admin Privileges Required</h2>
          <p className="text-sm text-zinc-400 mt-2 max-w-sm">
            Only designated gym administrators have permission to access the equipment and dynamic field configuration panel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-red-500" />
              <span className="text-xs font-black uppercase tracking-wider text-red-500">
                Gym Administrator Hub
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
              CONTROL PANEL & CONFIGURATION
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Add new gym machines, configure dynamic profile fields, and manage gym datasets.
            </p>
          </div>
        </div>

        {/* Feedback message */}
        {message && (
          <div
            className={`p-4 rounded-2xl flex items-center gap-3 border ${
              message.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="text-xs font-bold">{message.text}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex p-1 rounded-2xl bg-metallic-card border border-white/10 max-w-md">
          <button
            onClick={() => setActiveTab("machines")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 ${
              activeTab === "machines" ? "bg-red-600 text-white shadow-lg" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>Machines ({machines.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("fields")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 ${
              activeTab === "fields" ? "bg-red-600 text-white shadow-lg" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Dynamic Fields ({fields.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("database")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 ${
              activeTab === "database" ? "bg-red-600 text-white shadow-lg" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Database</span>
          </button>
        </div>

        {/* TAB 1: ADD & MANAGE MACHINES */}
        {activeTab === "machines" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form to Add Machine (5 cols) */}
            <div className="lg:col-span-5 bg-metallic-card rounded-3xl p-6 sm:p-8 border border-white/10">
              <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2 flex items-center gap-2">
                <Plus className="w-5 h-5 text-red-500" />
                Add New Machine to Gym
              </h3>
              <p className="text-xs text-zinc-400 mb-6">
                Equipment appears instantly for everyone during active sessions with strength benchmarks.
              </p>

              <form onSubmit={handleAddMachine} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    Machine Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Incline Dumbbell Bench"
                    value={mName}
                    onChange={(e) => setMName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    Muscle Group Category
                  </label>
                  <select
                    value={mCategory}
                    onChange={(e) => setMCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
                  >
                    {["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"].map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Picture with upload or url */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    Machine Picture (Cloudinary / File)
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="cursor-pointer py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-semibold text-zinc-300 flex items-center gap-2 transition">
                      <Camera className="w-4 h-4 text-red-500" />
                      <span>{machineUploading ? "Uploading..." : "Upload File"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePictureUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="Or paste image URL directly..."
                    value={mPicture}
                    onChange={(e) => setMPicture(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    Description & Mechanics
                  </label>
                  <textarea
                    rows={2}
                    value={mDesc}
                    onChange={(e) => setMDesc(e.target.value)}
                    placeholder="Biomechanical path, angles, and muscle engagement..."
                    className="w-full px-4 py-2 bg-black border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
                  />
                </div>

                {/* Scientific Strength Benchmarks */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    Standard Strength Benchmarks (kg)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase">Beginner</span>
                      <input
                        type="number"
                        value={mBeginner}
                        onChange={(e) => setMBeginner(e.target.value)}
                        className="w-full py-1.5 px-2 bg-black border border-white/10 rounded-lg text-white text-xs text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-blue-400 block uppercase">Intermed.</span>
                      <input
                        type="number"
                        value={mIntermediate}
                        onChange={(e) => setMIntermediate(e.target.value)}
                        className="w-full py-1.5 px-2 bg-black border border-white/10 rounded-lg text-white text-xs text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-purple-400 block uppercase">Advanced</span>
                      <input
                        type="number"
                        value={mAdvanced}
                        onChange={(e) => setMAdvanced(e.target.value)}
                        className="w-full py-1.5 px-2 bg-black border border-white/10 rounded-lg text-white text-xs text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-red-400 block uppercase">Titan</span>
                      <input
                        type="number"
                        value={mElite}
                        onChange={(e) => setMElite(e.target.value)}
                        className="w-full py-1.5 px-2 bg-black border border-white/10 rounded-lg text-white text-xs text-center"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 text-white font-black uppercase tracking-wider text-sm hover:brightness-110 shadow-lg shadow-red-900/40 transition active:scale-[0.98]"
                >
                  ADD MACHINE TO SYSTEM
                </button>
              </form>
            </div>

            {/* Existing Machines Catalog (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2">
                Existing Gym Machines ({machines.length})
              </h3>

              <div className="space-y-3">
                {machines.map((m) => (
                  <div
                    key={m._id}
                    className="p-4 rounded-2xl bg-metallic-card border border-white/10 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-zinc-900 flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={m.picture} alt={m.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-red-500 block">
                          {m.category}
                        </span>
                        <h4 className="text-sm font-bold text-white">{m.name}</h4>
                        <span className="text-xs text-zinc-400">
                          Elite benchmark: {m.benchmarks?.elite || 140}kg
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteMachine(m._id)}
                      className="p-2 rounded-xl bg-zinc-900 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition"
                      title="Delete Machine"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DYNAMIC PROFILE FIELDS BUILDER */}
        {activeTab === "fields" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Add Dynamic Field Form (5 cols) */}
            <div className="lg:col-span-5 bg-metallic-card rounded-3xl p-6 sm:p-8 border border-white/10">
              <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-red-500" />
                Add Dynamic Profile Field
              </h3>
              <p className="text-xs text-zinc-400 mb-6">
                Create any custom metric (e.g. &ldquo;Body Fat %&rdquo;, &ldquo;Bicep Circumference&rdquo;, &ldquo;Deadlift 1RM Goal&rdquo;) that friends can fill in their profile!
              </p>

              <form onSubmit={handleAddDynamicField} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    Field Label / Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chest Circumference (cm)"
                    value={fLabel}
                    onChange={(e) => setFLabel(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    Input Type
                  </label>
                  <select
                    value={fType}
                    onChange={(e) => setFType(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-black border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
                  >
                    <option value="text">Text / String</option>
                    <option value="number">Numeric (e.g. kg, %, cm)</option>
                    <option value="select">Dropdown Selection</option>
                  </select>
                </div>

                {fType === "select" && (
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                      Options (comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Morning, Afternoon, Late Night"
                      value={fOptions}
                      onChange={(e) => setFOptions(e.target.value)}
                      className="w-full px-4 py-2.5 bg-black border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    Placeholder Hint
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 110"
                    value={fPlaceholder}
                    onChange={(e) => setFPlaceholder(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    Description / Helper
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Flexed measurement around the chest"
                    value={fDesc}
                    onChange={(e) => setFDesc(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 text-white font-black uppercase tracking-wider text-sm hover:brightness-110 shadow-lg shadow-red-900/40 transition active:scale-[0.98]"
                >
                  CREATE DYNAMIC FIELD
                </button>
              </form>
            </div>

            {/* Existing Dynamic Fields List (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2">
                Active Dynamic Profile Fields ({fields.length})
              </h3>

              <div className="space-y-3">
                {fields.map((f) => (
                  <div
                    key={f._id}
                    className="p-5 rounded-2xl bg-metallic-card border border-white/10 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-white/10 text-[10px] font-black uppercase text-zinc-400">
                          {f.type}
                        </span>
                        <h4 className="text-sm font-bold text-white">{f.label}</h4>
                      </div>
                      <span className="text-xs text-zinc-500 font-mono block mt-1">
                        key: {f.key}
                      </span>
                      {f.description && (
                        <p className="text-xs text-zinc-400 mt-1">{f.description}</p>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteField(f._id)}
                      className="p-2 rounded-xl bg-zinc-900 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition"
                      title="Delete Dynamic Field"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DATABASE SEED & MAINTENANCE */}
        {activeTab === "database" && (
          <div className="max-w-2xl bg-metallic-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
            <div>
              <h3 className="text-xl font-black uppercase text-white mb-2 flex items-center gap-2">
                <Database className="w-5 h-5 text-red-500" />
                Gym Database & Test Seeding
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Need to quickly populate the gym website with authentic test data? This generator creates 4 gym bro accounts with realistic avatars, weights, heights, 8 popular gym machines with scientific benchmark kg sets, dynamic profile fields, and workout history with leaderboard records!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/50 border border-white/5 space-y-2 text-xs text-zinc-300">
              <div className="font-bold text-white">Default Seed Accounts:</div>
              <div>• <strong>Admin:</strong> admin@titangym.com (password: gymbro123)</div>
              <div>• <strong>Member:</strong> karim@titangym.com (password: gymbro123)</div>
              <div>• <strong>Member:</strong> youssef@titangym.com (password: gymbro123)</div>
              <div>• <strong>Member:</strong> samir@titangym.com (password: gymbro123)</div>
            </div>

            <button
              onClick={handleSeedDatabase}
              className="py-3.5 px-6 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-wider text-xs shadow-lg shadow-red-900/40 transition"
            >
              Seed / Reset Database Now
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
