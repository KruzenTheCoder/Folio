"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Legacy TipTap editor replaced by canvas editor at /editor/canvas
export default function NewEditorPage() {
  const router = useRouter();
  useEffect(() => {
    const fromBuilder =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("fromBuilder")
        : null;
    router.replace(fromBuilder ? `/editor/canvas?fromBuilder=${encodeURIComponent(fromBuilder)}` : "/editor/canvas");
  }, [router]);
  return (
    <div className="h-screen flex items-center justify-center bg-neutral-950 text-white/40 text-sm">
      Redirecting to editor...
    </div>
  );
}
