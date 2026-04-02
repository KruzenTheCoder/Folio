"use client";

import { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase/client";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);

  const mapOAuthError = (message: string) => {
    if (/provider is not enabled/i.test(message)) {
      return "This provider is not enabled. In Supabase Dashboard → Authentication → Providers, enable the provider and set client ID/secret. Add your site URL to Redirect URLs.";
    }
    return message;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/(auth)/sign-in`,
        data: { full_name: name },
      },
    });
    if (error) setError(error.message);
    else setMessage("Check your inbox to confirm your email.");
    setLoading(false);
  };

  const signUpWith = async (provider: "google" | "github") => {
    setOauthLoading(provider);
    try {
      const supabase = createSupabaseBrowser();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) setError(mapOAuthError(error.message));
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-background to-background/70">
      <div className="glass-card rounded-2xl p-6 w-full max-w-md space-y-5">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold">Create your Folio account</h1>
          <p className="text-sm text-white/60">Start building ATS-ready resumes powered by AI</p>
        </div>
        {message && <div className="text-sm text-emerald-400">{message}</div>}
        {error && <div className="text-sm text-red-400">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-3">
          <input className="glass-input w-full rounded-xl px-3 py-2" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="glass-input w-full rounded-xl px-3 py-2" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="glass-input w-full rounded-xl px-3 py-2" placeholder="Password (min 6 chars)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button disabled={loading} className="w-full rounded-xl bg-blue-600 text-white px-4 py-2">{loading ? "Creating..." : "Sign Up"}</button>
        </form>
        <div className="relative">
          <div className="my-2 h-px bg-white/10" />
          <p className="absolute -top-3 left-1/2 -translate-x-1/2 bg-background px-2 text-xs text-white/50">or</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => signUpWith("google")} disabled={oauthLoading !== null} className="rounded-xl bg-white/10 px-4 py-2 text-sm">
            {oauthLoading === "google" ? "Connecting..." : "Continue with Google"}
          </button>
          <button onClick={() => signUpWith("github")} disabled={oauthLoading !== null} className="rounded-xl bg-white/10 px-4 py-2 text-sm">
            {oauthLoading === "github" ? "Connecting..." : "Continue with GitHub"}
          </button>
        </div>
        <div className="flex items-center justify-between text-sm text-white/70">
          <Link href="/" className="underline">Back to Home</Link>
          <span>
            Already have an account? <Link href="/(auth)/sign-in" className="underline">Sign in</Link>
          </span>
        </div>
      </div>
    </div>
  );
}
