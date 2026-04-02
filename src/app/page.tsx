import Link from "next/link";
import { FileText, Sparkles, Zap, Download, ArrowRight, Star, Check, Shield, Crown } from "lucide-react";
import { LiveStats } from "@/components/marketing/LiveStats";
import { ResumeStoryboard } from "@/components/marketing/ResumeStoryboard";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[oklch(0.45_0.25_270)] opacity-20 blur-[120px] animate-glow-pulse" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[oklch(0.50_0.22_300)] opacity-15 blur-[100px] animate-glow-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full bg-[oklch(0.55_0.18_220)] opacity-10 blur-[80px] animate-glow-pulse" style={{ animationDelay: "4s" }} />
      </div>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-14 space-y-8 text-center">
        <div className="inline-flex items-center gap-2 glass-card rounded-full px-5 py-2.5 text-sm font-medium text-white/80">
          <Sparkles className="w-4 h-4 text-[oklch(0.75_0.18_270)]" />
          <span>AI Folio Engine Powered</span>
          <span className="text-white/30">&bull;</span>
          <span>ATS Optimized</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight leading-[0.9]">
          <span className="text-white">Build </span>
          <span className="bg-gradient-to-r from-[oklch(0.75_0.18_270)] via-[oklch(0.70_0.22_300)] to-[oklch(0.65_0.18_220)] bg-clip-text text-transparent animate-gradient">
            Folio
          </span>
          <br />
          <span className="text-white">That Gets Interviews.</span>
        </h1>

        <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
          Viral resume builder with guided wizard, paste-transform parsing, live ATS scoring, advanced canvas editing, and one-click PDF export.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/builder">
            <button className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-[oklch(0.65_0.20_270)] to-[oklch(0.55_0.22_300)] text-white font-semibold text-lg shadow-[0_0_40px_oklch(0.55_0.25_270_/_30%)] hover:shadow-[0_0_60px_oklch(0.55_0.25_270_/_50%)] transition-all duration-500 hover:scale-105 active:scale-[0.98] flex items-center gap-3">
              <span>Start Building</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="group relative px-8 py-4 rounded-2xl border border-white/15 text-white font-semibold text-lg bg-white/[0.06] hover:bg-white/[0.1] hover:border-white/25 transition-all duration-500 hover:scale-105 flex items-center gap-3">
              <span>Open Dashboard</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>

        <ResumeStoryboard />

        <div className="flex flex-wrap justify-center gap-3 pt-8 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          {[
            { icon: FileText, label: "Smart Templates" },
            { icon: Sparkles, label: "AI Generation" },
            { icon: Zap, label: "Canvas Editor" },
            { icon: Download, label: "PDF Export" },
          ].map((feature) => (
            <div
              key={feature.label}
              className="flex items-center gap-2 glass rounded-xl px-4 py-2.5 text-sm text-white/60 hover:text-white/90 hover:bg-white/[0.08] transition-all duration-300"
            >
              <feature.icon className="w-4 h-4 text-[oklch(0.70_0.18_270)]" />
              <span>{feature.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Live Stats + Activity Feed ── */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <LiveStats />
      </section>

      {/* ── Pricing ── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[oklch(0.75_0.18_270)] mb-3">Pricing</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Simple, transparent pricing</h2>
          <p className="text-sm text-white/40 mt-2 max-w-md mx-auto">Start free. Upgrade when you need unlimited resumes, premium templates, and priority AI.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 items-start">
          {/* FREE */}
          <div className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center">
                <FileText className="w-4 h-4 text-white/50" />
              </div>
              <div>
                <p className="font-semibold text-sm">Free</p>
                <p className="text-[10px] text-white/30">For getting started</p>
              </div>
            </div>
            <div className="flex items-baseline gap-1 mb-5">
              <span className="text-4xl font-extrabold tracking-tight">$0</span>
              <span className="text-sm text-white/30">/forever</span>
            </div>
            <ul className="space-y-2.5 mb-6">
              {["3 resumes", "4 base templates", "AI rewrite (5/mo)", "ATS score checker", "PDF export"].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-white/60">
                  <Check className="w-3.5 h-3.5 text-white/30 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/builder" className="block w-full text-center py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-sm font-medium text-white/70 hover:bg-white/[0.08] hover:text-white transition-all">
              Get Started
            </Link>
          </div>

          {/* PRO — highlighted */}
          <div className="relative rounded-2xl border border-[oklch(0.65_0.20_270)]/30 bg-[oklch(0.65_0.20_270)]/[0.04] p-6 shadow-[0_0_60px_oklch(0.55_0.25_270_/_10%)] hover:shadow-[0_0_80px_oklch(0.55_0.25_270_/_18%)] transition-all duration-300">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-[oklch(0.65_0.20_270)] to-[oklch(0.55_0.22_300)] text-[10px] font-bold uppercase tracking-wider">
              Most Popular
            </div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[oklch(0.65_0.20_270)]/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[oklch(0.75_0.18_270)]" />
              </div>
              <div>
                <p className="font-semibold text-sm">Pro</p>
                <p className="text-[10px] text-white/30">For job seekers</p>
              </div>
            </div>
            <div className="flex items-baseline gap-1 mb-5">
              <span className="text-4xl font-extrabold tracking-tight">$9</span>
              <span className="text-sm text-white/30">/month</span>
            </div>
            <ul className="space-y-2.5 mb-6">
              {["Unlimited resumes", "All 8 premium templates", "Unlimited AI rewrites", "Advanced ATS optimization", "PDF + DOCX export", "Canvas visual editor", "Version history", "Priority support"].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-white/70">
                  <Check className="w-3.5 h-3.5 text-[oklch(0.75_0.18_270)] shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/builder" className="block w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-[oklch(0.65_0.20_270)] to-[oklch(0.55_0.22_300)] text-sm font-semibold shadow-[0_0_30px_oklch(0.55_0.25_270_/_15%)] hover:shadow-[0_0_50px_oklch(0.55_0.25_270_/_30%)] transition-all hover:scale-[1.02]">
              Start Pro Trial
            </Link>
          </div>

          {/* ENTERPRISE */}
          <div className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Crown className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="font-semibold text-sm">Enterprise</p>
                <p className="text-[10px] text-white/30">For teams & orgs</p>
              </div>
            </div>
            <div className="flex items-baseline gap-1 mb-5">
              <span className="text-4xl font-extrabold tracking-tight">Custom</span>
            </div>
            <ul className="space-y-2.5 mb-6">
              {["Everything in Pro", "Custom branded templates", "Team management", "SSO / SAML auth", "Bulk export & analytics", "Dedicated account manager", "API access", "SLA & uptime guarantee"].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-white/60">
                  <Check className="w-3.5 h-3.5 text-amber-400/60 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button className="w-full text-center py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-sm font-medium text-white/70 hover:bg-white/[0.08] hover:text-white transition-all">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* ── Social Proof ── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl overflow-hidden">
          <div className="px-8 py-10 md:py-12 flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Left — headline */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="flex items-center justify-center md:justify-start gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-2 text-sm font-semibold text-amber-400">4.9/5</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-snug">
                Join <span className="bg-gradient-to-r from-[oklch(0.75_0.18_270)] to-[oklch(0.70_0.22_300)] bg-clip-text text-transparent">50,000+</span> professionals<br className="hidden md:block" /> building winning resumes
              </h2>
              <p className="text-sm text-white/40 max-w-md">Trusted by engineers, designers, product managers, and executives at world-class companies.</p>
            </div>

            {/* Right — trust badges & stats */}
            <div className="flex flex-col gap-6 shrink-0 w-full md:w-auto">
              <div className="flex flex-col sm:flex-row items-center justify-between md:justify-start gap-6 bg-white/[0.03] border border-white/[0.05] p-5 rounded-2xl w-full">
                
                {/* Stacked avatars */}
                <div className="flex items-center">
                  <div className="flex -space-x-3">
                    {["bg-gradient-to-br from-blue-500 to-indigo-600", "bg-gradient-to-br from-emerald-500 to-teal-600", "bg-gradient-to-br from-amber-500 to-orange-600", "bg-gradient-to-br from-pink-500 to-rose-600", "bg-gradient-to-br from-purple-500 to-violet-600"].map((bg, i) => (
                      <div key={i} style={{ zIndex: 10 - i }} className={`w-10 h-10 rounded-full ${bg} border-[3px] border-[#131313] flex items-center justify-center text-xs font-bold text-white shadow-sm ring-1 ring-white/10 relative`}>
                        {["S", "M", "A", "J", "T"][i]}
                      </div>
                    ))}
                    <div className="w-10 h-10 rounded-full bg-neutral-800 border-[3px] border-[#131313] flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-1 ring-white/10 relative z-0">
                      +50K
                    </div>
                  </div>
                </div>

                {/* Counter */}
                <div className="flex flex-col text-center sm:text-left">
                  <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Live</span>
                  </div>
                  <div className="text-2xl font-black text-white tracking-tight flex items-baseline gap-1 justify-center sm:justify-start">
                    50,031 <span className="text-[oklch(0.70_0.22_300)]">+</span>
                  </div>
                  <p className="text-[11px] text-white/50 font-medium">
                    Resumes generated & counting
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Resumes created", value: "50,000+" },
                  { label: "Avg ATS improvement", value: "+34%" },
                  { label: "Interview callbacks", value: "3.2x more" },
                  { label: "Time to build", value: "< 5 min" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-white/[0.03] border border-white/[0.05] px-3.5 py-2.5">
                    <p className="text-lg font-bold tracking-tight">{stat.value}</p>
                    <p className="text-[10px] text-white/30">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-white/30">
                <Shield className="w-3.5 h-3.5" />
                <span>SOC 2 compliant &bull; GDPR ready &bull; 256-bit encryption</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/20">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[oklch(0.65_0.20_270)]" />
            <span className="font-semibold text-white/30">Folio</span>
            <span>&bull; &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-white/40 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/40 transition-colors">Terms</a>
            <a href="#" className="hover:text-white/40 transition-colors">Support</a>
            <a href="#" className="hover:text-white/40 transition-colors">Changelog</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
