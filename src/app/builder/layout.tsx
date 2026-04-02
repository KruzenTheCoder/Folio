import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Build Your Resume — Folio",
  description: "Fill in your professional details and let Folio craft the perfect, ATS-ready resume.",
};

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Background ambient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[oklch(0.45_0.25_270)] opacity-15 blur-[120px] animate-glow-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[oklch(0.50_0.22_300)] opacity-10 blur-[100px] animate-glow-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Top Nav */}
      <header className="sticky top-0 z-50 glass-strong">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[oklch(0.65_0.20_270)] to-[oklch(0.55_0.22_300)] flex items-center justify-center shadow-[0_0_20px_oklch(0.55_0.25_270_/_30%)]">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="font-semibold text-white/90 text-lg">Folio</span>
          </Link>
          <div className="text-sm text-white/40">Auto-saved locally</div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
