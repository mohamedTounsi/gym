"use client";

import { useState } from "react";
import { Flame, Trophy, CheckCircle, Heart, MessageSquare } from "lucide-react";

interface FeedItem {
  _id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: "checkin" | "pr" | "workout_completed";
  message: string;
  machineName?: string;
  weight?: number;
  likes: string[];
  createdAt: string;
}

interface BroFeedWidgetProps {
  initialFeed: FeedItem[];
  currentUserName?: string;
}

export default function BroFeedWidget({ initialFeed, currentUserName }: BroFeedWidgetProps) {
  const [feed, setFeed] = useState<FeedItem[]>(initialFeed);
  const [cheeringId, setCheeringId] = useState<string | null>(null);

  async function handleCheer(feedId: string, emoji: string) {
    setCheeringId(feedId);
    try {
      const res = await fetch("/api/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedId, cheerEmoji: emoji }),
      });
      if (res.ok) {
        const data = await res.json();
        setFeed((prev) =>
          prev.map((item) => (item._id === feedId ? { ...item, likes: data.post.likes } : item))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCheeringId(null);
    }
  }

  const timeAgo = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="bg-metallic-card rounded-3xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-500 flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Bro Activity Feed</h3>
            <p className="text-xs text-zinc-400">Live brotherhood PRs, check-ins & hype</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          LIVE
        </span>
      </div>

      <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
        {feed.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-sm">
            No gym activity logged yet. Be the first to start the day and break iron!
          </div>
        ) : (
          feed.map((item) => {
            const isPr = item.type === "pr";
            return (
              <div
                key={item._id}
                className={`p-4 rounded-2xl border transition ${
                  isPr
                    ? "bg-gradient-to-r from-red-950/30 to-black/60 border-red-500/40"
                    : "bg-black/50 border-white/5 hover:border-white/15"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* 1:1 Circular Avatar */}
                  <div className="relative w-10 h-10 rounded-full ring-2 ring-red-500/40 overflow-hidden flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.userAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"}
                      alt={item.userName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-white truncate">{item.userName}</span>
                      <span className="text-[10px] text-zinc-500 flex-shrink-0 font-medium">
                        {timeAgo(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed font-medium">
                      {item.message}
                    </p>

                    {/* Weight Highlight Tag if present */}
                    {item.weight && (
                      <div className="inline-block mt-2 px-2.5 py-0.5 rounded-md bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-black">
                        ⚡ {item.weight} KG CHARGED
                      </div>
                    )}

                    {/* Cheers bar */}
                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.likes && item.likes.length > 0 ? (
                          item.likes.slice(0, 3).map((cheer, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-full bg-zinc-900 border border-white/10 text-[10px] text-zinc-300 font-semibold"
                            >
                              {cheer}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-zinc-500 italic">Cheer your bro!</span>
                        )}
                        {item.likes && item.likes.length > 3 && (
                          <span className="text-[10px] text-zinc-400 font-bold">
                            +{item.likes.length - 3} more
                          </span>
                        )}
                      </div>

                      {/* Cheer action buttons */}
                      <div className="flex items-center gap-1">
                        {["💪", "🔥", "👑"].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleCheer(item._id, emoji)}
                            disabled={cheeringId === item._id}
                            className="p-1 rounded-lg hover:bg-zinc-800 text-xs transition transform hover:scale-125"
                            title={`Cheer with ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
