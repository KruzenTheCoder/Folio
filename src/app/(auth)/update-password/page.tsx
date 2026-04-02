"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const s = createSupabaseBrowser();
    s.auth.getSession();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError(error.message);
    else {
      setMessage("Password updated. Redirecting to dashboard...");
      setTimeout(() => (window.location.href = "/dashboard"), 1000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-card rounded-2xl p-6 w-full max-w-md space-y-4">
        <h1 className="text-2xl font-semibold">Set a new password</h1>
        {message && <div className="text-sm text-emerald-400">{message}</div>}
        {error && <div className="text-sm text-red-400">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-3">
          <input className="glass-input w-full rounded-xl px-3 py-2" placeholder="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button disabled={loading} className="w-full rounded-xl bg-blue-600 text-white px-4 py-2">{loading ? "Updating..." : "Update password"}</button>
        </form>
      </div>
    </div>
  );
}
