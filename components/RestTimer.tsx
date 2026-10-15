"use client";

import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Bell } from "lucide-react";

export default function RestTimer() {
  const [secondsLeft, setSecondsLeft] = useState<number>(90);
  const [initialSeconds, setInitialSeconds] = useState<number>(90);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      // Play web audio beep
      playBeep();
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  function playBeep() {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // 880Hz A5
      gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch {
      // Audio not permitted or supported
    }
  }

  function startWithDuration(secs: number) {
    setInitialSeconds(secs);
    setSecondsLeft(secs);
    setIsRunning(true);
  }

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const progress = ((initialSeconds - secondsLeft) / initialSeconds) * 100;

  return (
    <div className="bg-metallic-card rounded-2xl p-5 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-red-500 animate-pulse" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Rest Timer</h4>
        </div>
        <span className="text-xs font-semibold text-zinc-400">
          {isRunning ? "Resting between sets..." : "Ready for next set"}
        </span>
      </div>

      <div className="flex items-center justify-between gap-4">
        {/* Timer Display */}
        <div className="flex items-baseline gap-2">
          <span
            className={`text-4xl font-black tracking-tight font-mono ${
              secondsLeft <= 5 && isRunning ? "text-red-500 animate-ping" : "text-white"
            }`}
          >
            {formatTime(secondsLeft)}
          </span>
          <span className="text-xs text-zinc-400 uppercase font-semibold">Remaining</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`p-3 rounded-xl font-bold transition flex items-center justify-center ${
              isRunning
                ? "bg-amber-600 hover:bg-amber-500 text-white"
                : "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/40"
            }`}
          >
            {isRunning ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
          </button>
          <button
            onClick={() => {
              setIsRunning(false);
              setSecondsLeft(initialSeconds);
            }}
            className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden my-4 border border-white/5">
        <div
          className="h-full bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Preset Quick Selectors */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "30s", val: 30 },
          { label: "60s", val: 60 },
          { label: "90s", val: 90 },
          { label: "120s", val: 120 },
        ].map((preset) => (
          <button
            key={preset.val}
            onClick={() => startWithDuration(preset.val)}
            className={`py-1.5 text-xs font-bold rounded-lg border transition ${
              initialSeconds === preset.val
                ? "bg-red-600/20 border-red-500/50 text-red-400"
                : "bg-black/40 border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
