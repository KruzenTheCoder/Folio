"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText, Plus, Sparkles, Zap, Download, Share2, Trash2,
  BarChart3, Eye, Clock, TrendingUp, Settings, LogOut,
  ChevronRight, Search, Star, Layout, Palette, Target,
  ArrowRight, Copy, Calendar, Award,
} from "lucide-react";

interface MockResume {
  id: string;
  title: string;
  template: string;
  atsScore: number;
  views: number;
  updatedAt: string;
  status: "draft" | "complete" | "shared";
}

const MOCK_RESUMES: MockResume[] = [
  { id: "1", title: "Senior Frontend Engineer", template: "Modern Clean", atsScore: 92, views: 47, updatedAt: "2026-03-31T10:00:00Z", status: "complete" },
  { id: "2", title: "Full Stack Developer", template: "Executive Suite", atsScore: 85, views: 23, updatedAt: "2026-03-28T14:30:00Z", status: "complete" },
  { id: "3", title: "Tech Lead Resume", template: "Tech Terminal", atsScore: 78, views: 12, updatedAt: "2026-03-25T09:15:00Z", status: "draft" },
  { id: "4", title: "Product Manager CV", template: "Gradient Pro", atsScore: 88, views: 31, updatedAt: "2026-03-20T16:45:00Z", status: "shared" },
];

const ACTIVITY = [
  { text: "ATS score improved to 92 on Senior Frontend Engineer", time: "2 hours ago", icon: TrendingUp },
  { text: "Exported PDF for Full Stack Developer", time: "Yesterday", icon: Download },
  { text: "Created Tech Lead Resume from template", time: "3 days ago", icon: Plus },
  { text: "Shared Product Manager CV via link", time: "1 week ago", icon: Share2 },
  { text: "AI optimized bullets for Senior Frontend Engineer", time: "1 week ago", icon: Sparkles },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [resumes, setResumes] = useState<MockResume[]>(MOCK_RESUMES);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "draft" | "complete" | "shared">("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (!data.loggedIn) {
          router.replace("/sign-in");
        } else {
          const u = data.user || data;
          setUser({ name: u.name || u.email || "User", email: u.email || "" });
        }
      })
      .catch(() => router.replace("/sign-in"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/sign-in");
  };

  const handleDelete = (id: string) => {
    setResumes((prev) => prev.filter((r) => r.id !== id));
    setDeleteConfirm(null);
  };

  const handleDuplicate = (id: string) => {
    const original = resumes.find((r) => r.id === id);
    if (!original) return;
    const dup: MockResume = {
      ...original,
      id: Date.now().toString(),
      title: `${original.title} (Copy)`,
      views: 0,
      status: "draft",
      updatedAt: new Date().toISOString(),
    };
    setResumes((prev) => [dup, ...prev]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="w-8 h-8 border-2 border-white/20 border-t-[oklch(0.65_0.20_270)] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const filteredResumes = resumes
    .filter((r) => activeTab === "all" || r.status === activeTab)
    .filter((r) => r.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const avgAts = resumes.length ? Math.round(resumes.reduce((s, r) => s + r.atsScore, 0) / resumes.length) : 0;
  const totalViews = resumes.reduce((s, r) => s + r.views, 0);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* -- Top navbar -- */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-neutral-950/80 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[oklch(0.65_0.20_270)] to-[oklch(0.55_0.22_300)] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">Folio</span>
            </Link>
            <div className="hidden md:flex items-center gap-1 text-sm">
              <Link href="/dashboard" className="px-3 py-1.5 rounded-lg bg-white/[0.06] text-white/90 font-medium">Dashboard</Link>
              <Link href="/editor/canvas" className="px-3 py-1.5 rounded-lg text-white/50 hover:text-white/80 hover:bg-white/[0.04] transition-all">Editor</Link>
              <Link href="/builder" className="px-3 py-1.5 rounded-lg text-white/50 hover:text-white/80 hover:bg-white/[0.04] transition-all">Builder</Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] text-xs text-white/40">
              <Search className="w-3.5 h-3.5" />
              <span>Search...</span>
              <kbd className="ml-4 px-1.5 py-0.5 rounded bg-white/[0.06] text-[10px]">?K</kbd>
            </div>
            <button className="p-2 rounded-lg hover:bg-white/[0.06] text-white/50 hover:text-white/80 transition-all">
              <Settings className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5 pl-3 border-l border-white/[0.06]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[oklch(0.65_0.20_270)] to-[oklch(0.55_0.22_300)] flex items-center justify-center text-xs font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-medium leading-none">{user.name}</p>
                <p className="text-[10px] text-white/40 mt-0.5">{user.email}</p>
              </div>
              <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-red-400 transition-all" title="Sign out">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-8">
        {/* -- Welcome + Quick Actions -- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-sm text-white/40 mb-1">Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"},</p>
            <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
            <p className="text-sm text-white/40 mt-1">Manage your resumes, track ATS scores, and export your best versions.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/builder" className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-sm font-medium hover:bg-white/[0.06] transition-all">
              <Layout className="w-4 h-4 text-white/50" />
              Wizard Builder
            </Link>
            <Link href="/editor/canvas" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[oklch(0.65_0.20_270)] to-[oklch(0.55_0.22_300)] text-sm font-semibold shadow-[0_0_30px_oklch(0.55_0.25_270_/_15%)] hover:shadow-[0_0_50px_oklch(0.55_0.25_270_/_30%)] transition-all hover:scale-[1.02]">
              <Plus className="w-4 h-4" />
              New Resume
            </Link>
          </div>
        </div>

        {/* -- Stats Grid -- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Resumes", value: resumes.length.toString(), icon: FileText, color: "from-blue-500/20 to-blue-600/5", iconColor: "text-blue-400" },
            { label: "Avg ATS Score", value: `${avgAts}%`, icon: Target, color: "from-emerald-500/20 to-emerald-600/5", iconColor: "text-emerald-400" },
            { label: "Total Views", value: totalViews.toString(), icon: Eye, color: "from-purple-500/20 to-purple-600/5", iconColor: "text-purple-400" },
            { label: "Plan", value: "PRO", icon: Award, color: "from-amber-500/20 to-amber-600/5", iconColor: "text-amber-400" },
          ].map((stat) => (
            <div key={stat.label} className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className={`w-4.5 h-4.5 ${stat.iconColor}`} />
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
              </div>
              <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-xs text-white/40 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* -- Continue where you left off -- */}
        {resumes.length > 0 && (
          <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-r from-[oklch(0.65_0.20_270)]/[0.06] to-transparent p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[oklch(0.65_0.20_270)]/20 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-[oklch(0.75_0.18_270)]" />
              </div>
              <div>
                <p className="text-xs text-white/40 mb-0.5">Continue where you left off</p>
                <p className="font-semibold">{resumes[0].title}</p>
                <p className="text-xs text-white/30 mt-0.5">Last edited {new Date(resumes[0].updatedAt).toLocaleDateString()} &middot; ATS {resumes[0].atsScore}%</p>
              </div>
            </div>
            <Link href="/editor/canvas" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-sm font-medium transition-all shrink-0">
              Open Editor
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* -- Quick Features -- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Canvas Editor", desc: "Visual block editing", icon: Palette, href: "/editor/canvas" },
            { label: "AI Optimize", desc: "Enhance with AI", icon: Sparkles, href: "/editor/canvas" },
            { label: "ATS Scanner", desc: "Check compatibility", icon: Zap, href: "/editor/canvas" },
            { label: "Export PDF", desc: "Download resume", icon: Download, href: "/editor/canvas" },
          ].map((f) => (
            <Link key={f.label} href={f.href} className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300">
              <f.icon className="w-5 h-5 text-white/40 group-hover:text-[oklch(0.75_0.18_270)] transition-colors mb-2" />
              <p className="text-sm font-medium">{f.label}</p>
              <p className="text-[11px] text-white/30">{f.desc}</p>
            </Link>
          ))}
        </div>

        {/* -- Resumes Section -- */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Your Resumes</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                <input
                  type="text"
                  placeholder="Search resumes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 rounded-lg border border-white/[0.08] bg-white/[0.03] text-sm text-white placeholder:text-white/25 outline-none focus:border-white/20 w-[200px]"
                />
              </div>
              <div className="flex items-center rounded-lg border border-white/[0.08] overflow-hidden">
                {(["all", "draft", "complete", "shared"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                      activeTab === tab ? "bg-white/[0.08] text-white" : "text-white/40 hover:text-white/60"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filteredResumes.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
              <FileText className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="font-medium text-white/60">No resumes found</p>
              <p className="text-sm text-white/30 mt-1 mb-4">
                {searchQuery ? "Try a different search term" : "Create your first ATS-optimized resume"}
              </p>
              <Link href="/editor/canvas" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[oklch(0.65_0.20_270)] to-[oklch(0.55_0.22_300)] text-sm font-semibold">
                <Plus className="w-4 h-4" />
                Create Resume
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredResumes.map((resume) => (
                <div key={resume.id} className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300 overflow-hidden">
                  {/* Card header with gradient */}
                  <div className="h-2 bg-gradient-to-r from-[oklch(0.65_0.20_270)] to-[oklch(0.55_0.22_300)]" />
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 min-w-0">
                        <h3 className="font-semibold truncate">{resume.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-white/40">
                          <span className="flex items-center gap-1"><Palette className="w-3 h-3" />{resume.template}</span>
                          <span>&middot;</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(resume.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        resume.status === "complete" ? "bg-emerald-500/15 text-emerald-400" :
                        resume.status === "shared" ? "bg-blue-500/15 text-blue-400" :
                        "bg-amber-500/15 text-amber-400"
                      }`}>
                        {resume.status}
                      </span>
                    </div>

                    {/* ATS + Views */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-white/40 uppercase tracking-wider">ATS Score</span>
                          <span className={`text-xs font-bold ${resume.atsScore >= 85 ? "text-emerald-400" : resume.atsScore >= 70 ? "text-amber-400" : "text-red-400"}`}>
                            {resume.atsScore}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${resume.atsScore >= 85 ? "bg-emerald-500" : resume.atsScore >= 70 ? "bg-amber-500" : "bg-red-500"}`}
                            style={{ width: `${resume.atsScore}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-white/40">
                        <Eye className="w-3 h-3" />
                        {resume.views}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      <Link href="/editor/canvas" className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.10] text-xs font-medium transition-all">
                        <FileText className="w-3 h-3" /> Edit
                      </Link>
                      <button onClick={() => handleDuplicate(resume.id)} className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.10] text-white/50 hover:text-white transition-all" title="Duplicate">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.10] text-white/50 hover:text-white transition-all" title="Share">
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      {deleteConfirm === resume.id ? (
                        <button onClick={() => handleDelete(resume.id)} className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all" title="Confirm delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button onClick={() => setDeleteConfirm(resume.id)} className="p-2 rounded-lg bg-white/[0.06] hover:bg-red-500/10 text-white/50 hover:text-red-400 transition-all" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Create new card */}
              <Link href="/editor/canvas" className="group rounded-2xl border-2 border-dashed border-white/[0.08] hover:border-[oklch(0.65_0.20_270)]/30 flex flex-col items-center justify-center py-12 text-center hover:bg-white/[0.02] transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-white/[0.04] group-hover:bg-[oklch(0.65_0.20_270)]/10 flex items-center justify-center mb-3 transition-all">
                  <Plus className="w-5 h-5 text-white/30 group-hover:text-[oklch(0.75_0.18_270)] transition-colors" />
                </div>
                <p className="text-sm font-medium text-white/50 group-hover:text-white/80 transition-colors">Create New Resume</p>
                <p className="text-xs text-white/25 mt-1">Start from template or blank</p>
              </Link>
            </div>
          )}
        </div>

        {/* -- Activity + Tips -- */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2"><BarChart3 className="w-4 h-4 text-white/40" /> Recent Activity</h3>
              <button className="text-xs text-white/30 hover:text-white/60 transition-colors">View all</button>
            </div>
            <div className="space-y-3">
              {ACTIVITY.map((a, i) => (
                <div key={i} className="flex items-start gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0 mt-0.5">
                    <a.icon className="w-3.5 h-3.5 text-white/30 group-hover:text-[oklch(0.75_0.18_270)] transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-white/70 truncate">{a.text}</p>
                    <p className="text-[10px] text-white/25 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Tips */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2"><Star className="w-4 h-4 text-amber-400" /> Pro Tips</h3>
            </div>
            <div className="space-y-3">
              {[
                { title: "Use the Canvas Editor", desc: "Drag, resize, and style every element of your resume with pixel-perfect precision." },
                { title: "Optimize for ATS", desc: "Paste the job description in the editor to get targeted keyword suggestions." },
                { title: "Try Multiple Templates", desc: "Switch between 8 premium templates to find the best look for your industry." },
                { title: "AI Enhancement", desc: "Use Proof & Polish to automatically fix grammar and strengthen bullet points." },
                { title: "Export Options", desc: "Download as PDF for applications or DOCX for further editing in Word." },
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-3 group">
                  <span className="w-6 h-6 rounded-md bg-white/[0.04] flex items-center justify-center text-[10px] font-bold text-white/30 shrink-0 mt-0.5">{i + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-white/70">{tip.title}</p>
                    <p className="text-[11px] text-white/30 mt-0.5 leading-relaxed">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* -- Footer -- */}
        <div className="pt-4 pb-8 border-t border-white/[0.04] flex items-center justify-between text-xs text-white/20">
          <span>&copy; {new Date().getFullYear()} Folio. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white/40 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/40 transition-colors">Terms</a>
            <a href="#" className="hover:text-white/40 transition-colors">Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}
