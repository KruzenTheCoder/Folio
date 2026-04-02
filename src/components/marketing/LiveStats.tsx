"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

const NAMES = ["Sam", "Morgan", "Alex", "Jordan", "Taylor", "Casey", "Riley", "Quinn", "Avery", "Blake", "Drew", "Emery", "Harper", "Logan", "Sage", "Reese", "Skyler", "Devon", "Jamie", "Kai"];
const ROLES = ["Data Analyst", "Frontend Engineer", "Product Manager", "UX Designer", "Backend Developer", "DevOps Engineer", "Marketing Lead", "AI Engineer", "Full Stack Dev", "Cloud Architect", "Mobile Developer", "Technical Writer", "Scrum Master", "QA Engineer", "Design Lead"];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface FeedItem {
  id: string;
  name: string;
  role: string;
  ats: number;
  time: string;
}

function generateFeedItem(): FeedItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: randomItem(NAMES),
    role: randomItem(ROLES),
    ats: Math.floor(Math.random() * 18) + 78,
    time: "Just now",
  };
}

export function LiveStats() {
  const [count, setCount] = useState(50003);
  // Start with an empty feed to avoid hydration mismatch (random data differs server vs client)
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Seed the feed only on the client after mount
  useEffect(() => {
    setFeed([generateFeedItem(), generateFeedItem(), generateFeedItem()]);
    setMounted(true);
  }, []);

  // Increment counter
  useEffect(() => {
    const timer = setInterval(() => setCount((v) => v + Math.floor(Math.random() * 3) + 1), 4000);
    return () => clearInterval(timer);
  }, []);

  // Add new activity
  useEffect(() => {
    if (!mounted) return;
    const timer = setInterval(() => {
      setFeed((prev) => {
        const updated = prev.map((item, i) => ({
          ...item,
          time: i === 0 ? "A moment ago" : i === 1 ? "2 min ago" : `${i + 2} min ago`,
        }));
        return [generateFeedItem(), ...updated].slice(0, 5);
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [mounted]);

  const formattedCount = useMemo(() => count.toLocaleString("en-US"), [count]);

  const getAtsColor = useCallback((ats: number) => {
    if (ats >= 90) return "text-emerald-400 bg-emerald-500/15";
    if (ats >= 80) return "text-sky-400 bg-sky-500/15";
    return "text-amber-400 bg-amber-500/15";
  }, []);

  return (
    <div className="grid lg:grid-cols-[1fr_1.4fr] gap-5">
      {/* Counter */}
      <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-8 flex flex-col justify-center overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[oklch(0.65_0.20_270)] opacity-[0.06] blur-[50px]" />
        <p className="text-xs font-medium uppercase tracking-wider text-white/40 mb-2">Resumes Generated</p>
        <div className="flex items-baseline gap-1.5">
          <motion.span
            key={count}
            className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent"
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {formattedCount}
          </motion.span>
          <span className="text-2xl font-bold text-[oklch(0.75_0.18_270)]">+</span>
        </div>
        <p className="text-xs text-white/30 mt-2">and counting — updated live</p>
        <div className="flex items-center gap-1.5 mt-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] text-emerald-400/80 font-medium">Live</span>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[oklch(0.75_0.18_270)] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[oklch(0.65_0.20_270)]" />
            </span>
            <p className="text-xs font-medium uppercase tracking-wider text-white/40">Live Activity</p>
          </div>
          <span className="text-[10px] text-white/20 font-mono">real-time</span>
        </div>
        <div className="space-y-2.5">
          <AnimatePresence initial={false} mode="popLayout">
            {feed.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: -12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[oklch(0.65_0.20_270)] to-[oklch(0.55_0.22_300)] flex items-center justify-center shrink-0">
                  <span className="text-[11px] font-bold text-white">{item.name.charAt(0)}</span>
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-semibold text-white/90 truncate">{item.name}</span>
                    <span className="text-white/20 text-[10px]">created resume for</span>
                    <span className="text-[12px] font-medium text-white/70 truncate">{item.role}</span>
                  </div>
                  <span className="text-[10px] text-white/25">{item.time}</span>
                </div>
                {/* ATS badge */}
                <span className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold ${getAtsColor(item.ats)}`}>
                  ATS: {item.ats}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
