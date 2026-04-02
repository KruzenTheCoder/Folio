import { ResumeBuilderWorkspace } from "@/components/builder/ResumeBuilderWorkspace";

export default function BuilderPage() {
  return (
    <div className="w-full animate-slide-up">
      <div className="text-center mb-10 space-y-4">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
          <span className="text-white">Let&apos;s build your </span>
          <span className="bg-gradient-to-r from-[oklch(0.75_0.18_270)] to-[oklch(0.65_0.20_300)] bg-clip-text text-transparent">
            resume
          </span>
        </h2>
        <p className="text-white/40 text-lg max-w-xl mx-auto">
          Use guided mode or paste mode to build a production-ready ATS resume with intent-driven AI.
        </p>
      </div>
      <ResumeBuilderWorkspace />
    </div>
  );
}
