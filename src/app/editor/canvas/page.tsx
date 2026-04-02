"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useCanvasStore } from "@/stores/canvas-store";
import { useResumeStore } from "@/stores/resume-store";
import { CANVAS_TEMPLATES, getCanvasTemplate } from "@/lib/canvas-templates";
import ResumeCanvas from "@/components/canvas/ResumeCanvas";
import PropertiesPanel from "@/components/canvas/PropertiesPanel";
import CanvasToolbar from "@/components/canvas/CanvasToolbar";
import { PAGE_W, PAGE_H, PAGE_GAP } from "@/stores/canvas-store";
import {
  ChevronLeft,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  GripVertical,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
  Paintbrush,
  BarChart3,
  Sparkles,
  FileDown,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Target,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  ArrowRightLeft,
  FilePlus2,
} from "lucide-react";
import Link from "next/link";

const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&family=EB+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&family=Lato:wght@300;400;700;900&family=Merriweather:wght@300;400;700;900&family=Outfit:wght@400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&family=Roboto:wght@300;400;500;700;900&family=Source+Sans+3:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700;800&display=swap";

type RightTab = "design" | "optimize";

export default function CanvasEditorPage() {
  const { blocks, selectedBlockIds, activeTemplateId, selectBlock, setBlockVisibility, setBlockLocked, pageCount, currentPage, setCurrentPage, addPage, removePage, moveBlockToPage } =
    useCanvasStore();
  const data = useResumeStore((s) => s.data);
  const intent = useResumeStore((s) => s.intent);
  const patchData = useResumeStore((s) => s.patchData);
  const updateIntent = useResumeStore((s) => s.updateIntent);

  const [showLayers, setShowLayers] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [rightTab, setRightTab] = useState<RightTab>("design");

  // ATS state
  const [atsScore, setAtsScore] = useState(0);
  const [atsIssues, setAtsIssues] = useState<any[]>([]);
  const [atsBulletRewrites, setAtsBulletRewrites] = useState<any[]>([]);
  const [atsMatchedSkills, setAtsMatchedSkills] = useState<string[]>([]);
  const [atsMissingSkills, setAtsMissingSkills] = useState<string[]>([]);
  const [jobDescription, setJobDescription] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const lastAtsFingerprintRef = useRef<string>("");

  const atsResumePayload = useMemo(
    () => ({
      personalInfo: data.personalInfo,
      summary: data.summary,
      skills: data.skills,
      experience: data.experience,
      education: data.education,
      projects: data.projects,
      certifications: data.certifications,
    }),
    [
      data.personalInfo,
      data.summary,
      data.skills,
      data.experience,
      data.education,
      data.projects,
      data.certifications,
    ]
  );

  const atsFingerprint = useMemo(
    () => `${jobDescription.trim()}::${JSON.stringify(atsResumePayload)}`,
    [jobDescription, atsResumePayload]
  );

  // Initialize with default template on first load
  useEffect(() => {
    if (initialized) return;
    const store = useCanvasStore.getState();
    const fromBuilder =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("fromBuilder") === "1"
        : false;

    if (fromBuilder && typeof window !== "undefined") {
      try {
        const raw = window.sessionStorage.getItem("folio_builder_handoff");
        if (raw) {
          const parsed = JSON.parse(raw) as { data?: unknown; intent?: unknown; ts?: number };
          if (parsed?.data && typeof parsed.data === "object") {
            patchData(parsed.data as any);
          }
          if (parsed?.intent && typeof parsed.intent === "object") {
            updateIntent(parsed.intent as any);
          }
        }
      } catch {}
      try {
        window.sessionStorage.removeItem("folio_builder_handoff");
      } catch {}
    }

    const hasCoreBlocks = store.blocks.some((b) =>
      ["header", "summary", "experience", "education", "skills", "projects", "certifications"].includes(b.type)
    );
    if (fromBuilder || store.blocks.length === 0 || !hasCoreBlocks) {
      const tmpl = getCanvasTemplate("modern-elegance") || CANVAS_TEMPLATES[0];
      store.applyTemplate(tmpl.id, tmpl.getBlocks(), tmpl.pageBackground);
      store.pushHistory();
    }
    setInitialized(true);
  }, [initialized, patchData, updateIntent]);

  // ATS scoring effect
  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const applyAtsPayload = (json: any) => {
      setAtsScore(json?.score || 0);
      
      const combinedIssues = [];
      if (json?.aiAnalysis?.improvementAreas?.length > 0) {
        combinedIssues.push(...json.aiAnalysis.improvementAreas);
      }
      if (json?.suggestions?.length > 0) {
        combinedIssues.push(...json.suggestions.map((s: any) => s.message || s));
      }
      // Deduplicate issues by exact string
      setAtsIssues(Array.from(new Set(combinedIssues)));

      setAtsBulletRewrites(json?.aiAnalysis?.bulletRewrites || []);
      setAtsMatchedSkills(json?.matchedSkills || []);
      setAtsMissingSkills(json?.missingSkills || []);
    };

    if (!jobDescription.trim()) {
      setAtsScore(0);
      setAtsIssues([]);
      setAtsBulletRewrites([]);
      setAtsMatchedSkills([]);
      setAtsMissingSkills([]);
      return () => {
        active = false;
        controller.abort();
      };
    }

    if (lastAtsFingerprintRef.current === atsFingerprint) {
      return () => {
        active = false;
        controller.abort();
      };
    }
    lastAtsFingerprintRef.current = atsFingerprint;

    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/ats/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resume: atsResumePayload, jobDescription }),
          signal: controller.signal,
        });
        const json = await res.json();
        if (!active) return;
        if (res.ok) {
          applyAtsPayload(json);
        }
      } catch { /* ignore */ }
    }, 600);
    return () => {
      active = false;
      clearTimeout(t);
      controller.abort();
    };
  }, [atsResumePayload, jobDescription, atsFingerprint]);

  const buildExportHtml = useCallback(() => {
    const el = document.querySelector("[data-canvas-export]");
    if (!el) return "<html><body>No canvas</body></html>";
    const clone = el.cloneNode(true) as HTMLElement;
    clone.querySelectorAll("[data-block-id]").forEach((node) => {
      const n = node as HTMLElement;
      n.style.border = "none";
      n.style.outline = "none";
      n.style.cursor = "default";
    });
    // Remove resize handles, labels, and page number overlays
    clone.querySelectorAll("[style*='z-index: 9999']").forEach((n) => n.remove());

    // Build multi-page CSS: each [data-page-index] becomes a print page
    const pageStyles = `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { background: #fff; }
      [data-canvas-export] { width: ${PAGE_W}px; margin: 0 auto; }
      [data-page-index] {
        width: ${PAGE_W}px;
        height: ${PAGE_H}px;
        position: relative;
        overflow: hidden;
        page-break-after: always;
        break-after: page;
      }
      [data-page-index]:last-child {
        page-break-after: auto;
        break-after: auto;
      }
      @media print {
        [data-page-index] { page-break-after: always; break-after: page; }
        [data-page-index]:last-child { page-break-after: auto; }
      }
    `;

    // Flatten pages: remove the absolute positioning of the export wrapper,
    // set pages to block flow instead of absolute stacking
    clone.style.position = "relative";
    clone.style.height = "auto";
    clone.style.transform = "none";
    clone.querySelectorAll("[data-page-index]").forEach((page) => {
      const p = page as HTMLElement;
      p.style.position = "relative";
      p.style.top = "0";
      p.style.left = "0";
      p.style.marginBottom = "0";
    });

    return `<!DOCTYPE html><html><head><meta charset="utf-8"><link href="${GOOGLE_FONTS_URL}" rel="stylesheet"><style>${pageStyles}</style></head><body>${clone.outerHTML}</body></html>`;
  }, []);

  const handleExportPdf = async () => {
    const name = data.personalInfo.fullName || "resume";
    const res = await fetch("/api/resume/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html: buildExportHtml() }),
    });
    if (!res.ok) return alert("Export failed");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}-folio.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportDocx = async () => {
    const res = await fetch("/api/resume/export-docx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume: data }),
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.personalInfo.fullName || "resume"}.docx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleAiOptimize = async () => {
    if (!jobDescription) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: JSON.stringify(data), jobDescription, tone: intent.tone }),
      });
      const json = await res.json();
      if (json.data) useResumeStore.getState().patchData(json.data);
    } catch { /* ignore */ }
    setAiLoading(false);
  };

  const handleProofPolish = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/post-process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, intent }),
      });
      const json = await res.json();
      if (json.data) useResumeStore.getState().patchData(json.data);
    } catch { /* ignore */ }
    setAiLoading(false);
  };

  const currentPageBlocks = blocks.filter((b) => (b.page ?? 0) === currentPage);
  const sorted = [...currentPageBlocks].sort((a, b) => b.zIndex - a.zIndex);
  const atsPercent = Math.max(0, Math.min(100, atsScore));

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={GOOGLE_FONTS_URL} />

      <div className="h-screen flex flex-col bg-neutral-950 text-white overflow-hidden">
        {/* ── Top Bar ── */}
        <div className="h-10 bg-black/40 border-b border-white/6 flex items-center px-3 gap-3 shrink-0 z-50">
          <Link href="/dashboard" className="flex items-center gap-1 text-white/40 hover:text-white/80 text-xs transition-colors">
            <ChevronLeft size={14} />
            <span>Dashboard</span>
          </Link>
          <div className="w-px h-4 bg-white/8" />
          <span className="text-xs font-semibold text-white/80">Resume Editor</span>
          <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded">
            {CANVAS_TEMPLATES.find((t) => t.id === activeTemplateId)?.name || "Custom"}
          </span>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            {atsScore > 0 && (
              <div className="flex items-center gap-1.5 bg-white/5 rounded-full px-2.5 py-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${atsScore >= 70 ? "bg-emerald-400" : atsScore >= 40 ? "bg-amber-400" : "bg-red-400"}`} />
                <span className="text-[10px] text-white/60">ATS {atsScore}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 bg-white/5 rounded-full px-2.5 py-0.5">
              <FilePlus2 size={10} className="text-white/40" />
              <span className="text-[10px] text-white/50">Page {currentPage + 1}/{pageCount}</span>
            </div>
            <span className="text-[10px] text-white/25">{blocks.length} blocks · Arrows nudge · Ctrl+Z undo</span>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <CanvasToolbar onExport={handleExportPdf} />

        {/* ── Main Area ── */}
        <div className="flex-1 flex overflow-hidden">
          {/* ── Layers Panel (Left) ── */}
          {showLayers ? (
            <aside className="w-[220px] border-r border-white/8 bg-black/20 flex flex-col shrink-0 overflow-hidden">
              <div className="p-2.5 border-b border-white/6 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Layers size={13} className="text-white/40" />
                  <span className="text-[11px] font-semibold text-white/70">Layers</span>
                </div>
                <button onClick={() => setShowLayers(false)} className="p-0.5 rounded hover:bg-white/8 text-white/30 hover:text-white/60 transition-colors">
                  <PanelLeftClose size={13} />
                </button>
              </div>

              {/* ── Page Tabs ── */}
              <div className="border-b border-white/6 p-1.5">
                <div className="flex items-center gap-1 mb-1">
                  <FilePlus2 size={10} className="text-white/40" />
                  <span className="text-[9px] font-semibold text-white/50 uppercase tracking-wider">Pages</span>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: pageCount }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`flex-1 px-2 py-1 rounded text-[10px] font-medium transition-all ${
                        i === currentPage
                          ? "bg-blue-600/25 border border-blue-500/30 text-blue-300"
                          : "bg-white/3 border border-transparent text-white/40 hover:bg-white/6 hover:text-white/60"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => addPage()}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/30 hover:text-white/60 transition-all"
                    title="Add page"
                  >
                    <Plus size={10} />
                  </button>
                  {pageCount > 1 && (
                    <button
                      onClick={() => removePage(currentPage)}
                      className="p-1 rounded bg-white/5 hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-all"
                      title={`Remove page ${currentPage + 1}`}
                    >
                      <Trash2 size={10} />
                    </button>
                  )}
                </div>
              </div>

              {/* ── Block layers for current page ── */}
              <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
                {sorted.length === 0 && (
                  <div className="text-[10px] text-white/25 text-center py-4">
                    No blocks on page {currentPage + 1}
                  </div>
                )}
                {sorted.map((block) => {
                  const sel = selectedBlockIds.includes(block.id);
                  return (
                    <div
                      key={block.id}
                      className={`flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer transition-all group ${sel ? "bg-blue-600/20 border border-blue-500/30" : "border border-transparent hover:bg-white/5"}`}
                      onClick={(e) => selectBlock(block.id, e.shiftKey || e.metaKey || e.ctrlKey)}
                    >
                      <GripVertical size={10} className="text-white/15 group-hover:text-white/30 shrink-0" />
                      <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: block.type === "panel" ? block.style.backgroundColor : block.style.accentColor }} />
                      <span className={`text-[10px] flex-1 truncate ${sel ? "text-white/90 font-medium" : "text-white/55"} ${!block.visible ? "line-through opacity-50" : ""}`}>
                        {block.label}
                      </span>
                      {/* Move block to another page */}
                      {sel && pageCount > 1 && (
                        <select
                          className="text-[9px] bg-white/10 rounded px-1 py-0.5 text-white/60 border-none outline-none cursor-pointer"
                          value={block.page ?? 0}
                          onChange={(e) => {
                            e.stopPropagation();
                            moveBlockToPage(block.id, Number(e.target.value));
                          }}
                          onClick={(e) => e.stopPropagation()}
                          title="Move to page"
                        >
                          {Array.from({ length: pageCount }, (_, i) => (
                            <option key={i} value={i}>P{i + 1}</option>
                          ))}
                        </select>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); setBlockVisibility(block.id, !block.visible); }} className="p-0.5 opacity-0 group-hover:opacity-100 text-white/30 hover:text-white/60 transition-all">
                        {block.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setBlockLocked(block.id, !block.locked); }} className="p-0.5 opacity-0 group-hover:opacity-100 text-white/30 hover:text-white/60 transition-all">
                        {block.locked ? <Lock size={12} /> : <Unlock size={12} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </aside>
          ) : (
            <button onClick={() => setShowLayers(true)} className="w-8 border-r border-white/8 bg-black/20 flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors shrink-0" title="Show Layers">
              <PanelLeftOpen size={14} />
            </button>
          )}

          {/* ── Canvas ── */}
          <div className="flex-1 overflow-auto bg-neutral-900/50" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, rgba(37,99,235,0.03) 0%, transparent 70%)" }}>
            <ResumeCanvas />
          </div>

          {/* ── Right Panel (Design / Optimize) ── */}
          <div className="w-[290px] border-l border-white/8 bg-black/20 flex flex-col shrink-0 overflow-hidden">
            {/* Tab switcher */}
            <div className="flex border-b border-white/6 shrink-0">
              <button
                onClick={() => setRightTab("design")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-medium transition-colors ${rightTab === "design" ? "text-white bg-white/5 border-b-2 border-blue-500" : "text-white/40 hover:text-white/70"}`}
              >
                <Paintbrush size={12} /> Design
              </button>
              <button
                onClick={() => setRightTab("optimize")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-medium transition-colors relative ${rightTab === "optimize" ? "text-white bg-white/5 border-b-2 border-emerald-500" : "text-white/40 hover:text-white/70"}`}
              >
                <BarChart3 size={12} /> Optimize
                {atsScore > 0 && atsScore < 60 && (
                  <span className="absolute top-1 right-3 w-1.5 h-1.5 bg-amber-400 rounded-full" />
                )}
              </button>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto">
              {rightTab === "design" ? (
                <PropertiesPanel />
              ) : (
                <div className="p-3 space-y-3">
                  {/* ATS Score */}
                  <div className="rounded-xl bg-white/3 border border-white/6 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Target size={13} className="text-emerald-400" />
                      <span className="text-[11px] font-semibold text-white/70">ATS Score</span>
                    </div>
                    <div className="flex items-end gap-2 mb-2">
                      <span className={`text-3xl font-bold ${atsScore >= 70 ? "text-emerald-400" : atsScore >= 40 ? "text-amber-400" : "text-red-400"}`}>
                        {atsScore}
                      </span>
                      <span className="text-[10px] text-white/30 mb-1">/ 100</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${atsScore >= 70 ? "bg-gradient-to-r from-emerald-500 to-cyan-500" : atsScore >= 40 ? "bg-gradient-to-r from-amber-500 to-orange-500" : "bg-gradient-to-r from-red-500 to-rose-500"}`}
                        style={{ width: `${atsPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Job Description */}
                  <div className="rounded-xl bg-white/3 border border-white/6 p-3">
                    <div className="text-[11px] font-semibold text-white/70 mb-2">Job Description</div>
                    <textarea
                      className="w-full rounded-lg bg-white/5 border border-white/8 p-2 text-[11px] text-white/80 h-24 resize-none outline-none focus:border-blue-500/40 placeholder:text-white/20"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the target job description to optimize your resume..."
                    />
                  </div>

                  {/* ATS Issues */}
                  {atsIssues.length > 0 && (
                    <div className="rounded-xl bg-white/3 border border-white/6 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={12} className="text-amber-400" />
                        <span className="text-[11px] font-semibold text-white/70">Suggestions</span>
                      </div>
                      <div className="space-y-1.5">
                        {atsIssues.map((issue, i) => (
                          <div key={i} className="text-[10px] text-white/50 bg-white/3 rounded-lg p-2 leading-relaxed">
                            {typeof issue === 'string' ? issue : issue.message || "Improvement suggested."}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills Matrix */}
                  <div className="rounded-xl bg-white/3 border border-white/6 p-3">
                    <div className="text-[11px] font-semibold text-white/70 mb-2">Skills Matrix</div>
                    {atsMatchedSkills.length > 0 && (
                      <div className="mb-2">
                        <div className="flex items-center gap-1 mb-1">
                          <CheckCircle2 size={10} className="text-emerald-400" />
                          <span className="text-[9px] text-emerald-400 font-medium">Matched</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {atsMatchedSkills.map((s) => (
                            <span key={s} className="text-[9px] bg-emerald-900/30 border border-emerald-700/30 rounded px-1.5 py-0.5 text-emerald-300">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {atsMissingSkills.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <AlertTriangle size={10} className="text-amber-400" />
                          <span className="text-[9px] text-amber-400 font-medium">Missing</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {atsMissingSkills.map((s) => (
                            <button
                              key={s}
                              onClick={() => {
                                const currentSkills = Array.isArray(data.skills) ? data.skills : String(data.skills || "").split(",").map(x=>x.trim()).filter(Boolean);
                                if (!currentSkills.includes(s)) {
                                  useResumeStore.getState().setSkills([...currentSkills, s]);
                                  setAtsMissingSkills(prev => prev.filter(x => x !== s));
                                  setAtsMatchedSkills(prev => [...prev, s]);
                                }
                              }}
                              className="text-[9px] bg-amber-900/30 border border-amber-700/30 rounded px-1.5 py-0.5 text-amber-300 hover:bg-amber-800/50 transition-colors flex items-center gap-0.5"
                              title="Click to add to your skills"
                            >
                              {s} <Plus size={8} />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {atsMatchedSkills.length === 0 && atsMissingSkills.length === 0 && (
                      <p className="text-[10px] text-white/30">Paste a job description to see skill matches</p>
                    )}
                  </div>

                  {/* Bullet Rewrites */}
                  {atsBulletRewrites.length > 0 && (
                    <div className="rounded-xl bg-white/3 border border-white/6 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={12} className="text-violet-400" />
                        <span className="text-[11px] font-semibold text-white/70">Bullet Rewrites</span>
                      </div>
                      <div className="space-y-2">
                        {atsBulletRewrites.map((rw, i) => (
                          <div key={i} className="bg-white/5 rounded p-2 text-[10px] border border-white/10">
                            <div className="text-white/40 line-through mb-1.5">{rw.original}</div>
                            <div className="text-emerald-300/90 mb-2 font-medium">{rw.improved}</div>
                            <button 
                              onClick={() => {
                                const newExp = data.experience.map(exp => {
                                  let responsibilities = Array.isArray(exp.responsibilities) ? exp.responsibilities : String(exp.responsibilities || "").split("\n");
                                  const replaced = responsibilities.map(r => r.trim() === rw.original.trim() || r.includes(rw.original.trim()) ? rw.improved : r);
                                  return { ...exp, responsibilities: replaced };
                                });
                                useResumeStore.getState().patchData({ experience: newExp });
                                setAtsBulletRewrites(prev => prev.filter(r => r !== rw));
                              }} 
                              className="w-full py-1.5 bg-violet-600/20 text-violet-300 rounded hover:bg-violet-600/40 transition-colors flex items-center justify-center gap-1"
                            >
                              <CheckCircle2 size={10} /> Apply Rewrite
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Actions */}
                  <div className="rounded-xl bg-white/3 border border-white/6 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={12} className="text-violet-400" />
                      <span className="text-[11px] font-semibold text-white/70">AI Tools</span>
                    </div>
                    <div className="space-y-1.5">
                      <button
                        onClick={handleAiOptimize}
                        disabled={aiLoading || !jobDescription}
                        className="w-full rounded-lg bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/20 px-3 py-2 text-[10px] font-medium text-violet-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        {aiLoading ? "Processing..." : "Rewrite for Job"}
                      </button>
                      <button
                        onClick={handleProofPolish}
                        disabled={aiLoading}
                        className="w-full rounded-lg bg-white/5 hover:bg-white/8 border border-white/8 px-3 py-2 text-[10px] font-medium text-white/60 transition-colors disabled:opacity-30"
                      >
                        Proof & Polish
                      </button>
                    </div>
                  </div>

                  {/* Export */}
                  <div className="rounded-xl bg-white/3 border border-white/6 p-3">
                    <div className="text-[11px] font-semibold text-white/70 mb-2">Export</div>
                    <div className="space-y-1.5">
                      <button onClick={handleExportPdf} className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-2 text-[11px] font-semibold text-white transition-colors">
                        <FileDown size={12} /> Export PDF
                      </button>
                      <button onClick={handleExportDocx} className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-white/5 hover:bg-white/8 border border-white/8 px-3 py-2 text-[10px] font-medium text-white/60 transition-colors">
                        <FileText size={12} /> Export DOCX
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
