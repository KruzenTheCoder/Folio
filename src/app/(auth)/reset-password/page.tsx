"use client";

import { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/(auth)/update-password`,
    });
    if (error) setError(error.message);
    else setMessage("If that email exists, a reset link has been sent.");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-card rounded-2xl p-6 w-full max-w-md space-y-4">
        <h1 className="text-2xl font-semibold">Reset your password</h1>
        {message && <div className="text-sm text-emerald-400">{message}</div>}
        {error && <div className="text-sm text-red-400">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-3">
          <input className="glass-input w-full rounded-xl px-3 py-2" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button disabled={loading} className="w-full rounded-xl bg-blue-600 text-white px-4 py-2">{loading ? "Sending..." : "Send reset link"}</button>
        </form>
        <div className="text-sm text-white/60">
          <Link href="/(auth)/sign-in" className="underline">Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}
