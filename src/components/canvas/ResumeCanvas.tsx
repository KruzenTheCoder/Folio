"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
import { useCanvasStore, CanvasBlock, PAGE_W, PAGE_H, PAGE_GAP } from "@/stores/canvas-store";
import { useResumeStore } from "@/stores/resume-store";

// ── Resize handle positions ──────────────────────────────────
type HandlePos = "tl" | "tr" | "bl" | "br" | "t" | "b" | "l" | "r";
const HANDLE_SIZE = 8;

const HANDLE_CURSORS: Record<HandlePos, string> = {
  tl: "nwse-resize",
  tr: "nesw-resize",
  bl: "nesw-resize",
  br: "nwse-resize",
  t: "ns-resize",
  b: "ns-resize",
  l: "ew-resize",
  r: "ew-resize",
};

function handleStyle(pos: HandlePos, selected: boolean): React.CSSProperties {
  if (!selected) return { display: "none" };
  const base: React.CSSProperties = {
    position: "absolute",
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    background: "#2563eb",
    border: "1.5px solid #fff",
    borderRadius: 2,
    zIndex: 9999,
    cursor: HANDLE_CURSORS[pos],
    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
  };
  const half = -HANDLE_SIZE / 2;
  switch (pos) {
    case "tl": return { ...base, top: half, left: half };
    case "tr": return { ...base, top: half, right: half };
    case "bl": return { ...base, bottom: half, left: half };
    case "br": return { ...base, bottom: half, right: half };
    case "t":  return { ...base, top: half, left: "50%", marginLeft: half };
    case "b":  return { ...base, bottom: half, left: "50%", marginLeft: half };
    case "l":  return { ...base, top: "50%", left: half, marginTop: half };
    case "r":  return { ...base, top: "50%", right: half, marginTop: half };
  }
}

/* ═══════════════════════════════════════════════════════════════
   SHARED INLINE INPUT STYLES
   ════════════════════════════════════════════════════════════ */

const editInput: React.CSSProperties = {
  width: "100%",
  background: "rgba(37,99,235,0.06)",
  border: "1px solid rgba(37,99,235,0.25)",
  borderRadius: 4,
  outline: "none",
  padding: "2px 4px",
  color: "inherit",
  font: "inherit",
  fontSize: "inherit",
  fontWeight: "inherit",
  fontFamily: "inherit",
  lineHeight: "inherit",
  letterSpacing: "inherit",
};

const editTextarea: React.CSSProperties = {
  ...editInput,
  resize: "vertical",
  minHeight: 48,
};

const editHint: React.CSSProperties = {
  position: "absolute",
  bottom: -18,
  right: 0,
  fontSize: 8,
  color: "#2563eb",
  background: "#eff6ff",
  padding: "1px 5px",
  borderRadius: 3,
  pointerEvents: "none",
  fontFamily: "Inter, sans-serif",
  zIndex: 9999,
  whiteSpace: "nowrap",
};

/* ═══════════════════════════════════════════════════════════════
   EDITABLE BLOCK CONTENT
   Double-click a block → inline edit its data.
   ════════════════════════════════════════════════════════════ */

function BlockContent({ block, isEditing }: { block: CanvasBlock; isEditing: boolean }) {
  const data = useResumeStore((s) => s.data);
  const {
    updatePersonalInfo,
    updateSummary,
    setSkills,
    updateExperience,
    updateEducation,
    updateProject,
  } = useResumeStore();
  const s = block.style;

  // Prevent drag start when typing inside inputs
  const stopDrag = (e: React.MouseEvent) => e.stopPropagation();

  const sectionTitle = (text: string) => (
    <div
      style={{
        fontFamily: s.headingFontFamily,
        fontSize: s.headingFontSize,
        fontWeight: s.headingFontWeight,
        color: s.headingColor,
        letterSpacing: s.letterSpacing > 1 ? s.letterSpacing : 1.5,
        textTransform: "uppercase" as const,
        marginBottom: 10,
        borderBottom: `2px solid ${s.accentColor}20`,
        paddingBottom: 6,
      }}
    >
      {text}
    </div>
  );

  // ── PANEL / DIVIDER ──
  if (block.type === "panel") return null;
  if (block.type === "divider") {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: s.backgroundColor === "transparent" ? s.accentColor : s.backgroundColor,
          borderRadius: s.borderRadius,
        }}
      />
    );
  }

  // ── HEADER ──
  if (block.type === "header") {
    const name = data.personalInfo.fullName || "Your Name";
    const role = data.experience?.[0]?.jobTitle || "Professional Title";
    if (isEditing) {
      return (
        <div style={{ textAlign: s.textAlign }} onMouseDown={stopDrag}>
          <input
            autoFocus
            style={{ ...editInput, fontFamily: s.headingFontFamily, fontSize: s.headingFontSize, fontWeight: s.headingFontWeight, color: s.headingColor }}
            value={data.personalInfo.fullName}
            onChange={(e) => updatePersonalInfo({ fullName: e.target.value })}
            placeholder="Full Name"
          />
          <input
            style={{ ...editInput, fontFamily: s.fontFamily, fontSize: s.subTextSize, color: s.subTextColor, marginTop: 6 }}
            value={data.experience?.[0]?.jobTitle || ""}
            onChange={(e) => {
              if (data.experience[0]) {
                updateExperience(data.experience[0].id, { jobTitle: e.target.value });
              }
            }}
            placeholder="Professional Title"
          />
        </div>
      );
    }
    return (
      <div style={{ textAlign: s.textAlign }}>
        <div style={{ fontFamily: s.headingFontFamily, fontSize: s.headingFontSize, fontWeight: s.headingFontWeight, color: s.headingColor, letterSpacing: s.letterSpacing, lineHeight: 1.1 }}>
          {name}
        </div>
        <div style={{ fontFamily: s.fontFamily, fontSize: s.subTextSize, fontWeight: 600, color: s.subTextColor, letterSpacing: 2, textTransform: "uppercase", marginTop: 6 }}>
          {role}
        </div>
      </div>
    );
  }

  // ── CONTACT ──
  if (block.type === "contact") {
    const p = data.personalInfo;
    if (isEditing) {
      return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }} onMouseDown={stopDrag}>
          <input style={editInput} value={p.email} onChange={(e) => updatePersonalInfo({ email: e.target.value })} placeholder="Email" />
          <input style={editInput} value={p.phone} onChange={(e) => updatePersonalInfo({ phone: e.target.value })} placeholder="Phone" />
          <input style={editInput} value={p.location} onChange={(e) => updatePersonalInfo({ location: e.target.value })} placeholder="Location" />
          <input style={editInput} value={p.linkedin} onChange={(e) => updatePersonalInfo({ linkedin: e.target.value })} placeholder="LinkedIn URL" />
          <input style={{ ...editInput, gridColumn: "1 / -1" }} value={p.portfolio} onChange={(e) => updatePersonalInfo({ portfolio: e.target.value })} placeholder="Portfolio URL" />
        </div>
      );
    }
    const parts = [p.email, p.phone, p.location, p.linkedin, p.portfolio].filter(Boolean);
    return (
      <div style={{ fontFamily: s.fontFamily, fontSize: s.fontSize, color: s.color, textAlign: s.textAlign, display: "flex", flexWrap: "wrap", gap: "6px 14px", alignItems: "center" }}>
        {parts.map((item, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {i > 0 && <span style={{ color: s.accentColor, fontSize: 8 }}>●</span>}
            {item}
          </span>
        ))}
      </div>
    );
  }

  // ── SUMMARY ──
  if (block.type === "summary") {
    const text = data.summary || "Experienced professional with a proven track record of delivering exceptional results.";
    if (isEditing) {
      return (
        <div onMouseDown={stopDrag}>
          {sectionTitle(block.label)}
          <textarea
            autoFocus
            style={{ ...editTextarea, fontFamily: s.fontFamily, fontSize: s.fontSize, color: s.color, lineHeight: s.lineHeight, minHeight: 80 }}
            value={data.summary}
            onChange={(e) => updateSummary(e.target.value)}
            placeholder="Write your professional summary..."
          />
        </div>
      );
    }
    return (
      <div>
        {sectionTitle(block.label)}
        <div style={{ fontFamily: s.fontFamily, fontSize: s.fontSize, color: s.color, lineHeight: s.lineHeight, textAlign: s.textAlign }}>{text}</div>
      </div>
    );
  }

  // ── EXPERIENCE ──
  if (block.type === "experience") {
    const exps = data.experience || [];
    if (isEditing) {
      return (
        <div onMouseDown={stopDrag}>
          {sectionTitle(block.label)}
          {exps.length === 0 ? (
            <div style={{ fontSize: 11, color: s.subTextColor, fontStyle: "italic" }}>Add experience in the builder first</div>
          ) : (
            exps.map((exp, idx) => {
              const bullets = Array.isArray(exp.responsibilities) ? exp.responsibilities : String(exp.responsibilities || "").split("\n").filter(Boolean);
              return (
                <div key={exp.id || `edit-exp-${idx}`} style={{ marginBottom: 14, padding: 6, background: "rgba(37,99,235,0.03)", borderRadius: 6, border: "1px dashed rgba(37,99,235,0.15)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 4 }}>
                    <input style={{ ...editInput, fontWeight: 700, fontSize: s.fontSize + 2 }} value={exp.jobTitle} onChange={(e) => updateExperience(exp.id, { jobTitle: e.target.value })} placeholder="Job Title" />
                    <input style={editInput} value={exp.company} onChange={(e) => updateExperience(exp.id, { company: e.target.value })} placeholder="Company" />
                    <input style={{ ...editInput, fontSize: s.subTextSize }} value={exp.startDate} onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })} placeholder="Start Date" />
                    <input style={{ ...editInput, fontSize: s.subTextSize }} value={exp.isCurrentRole ? "Present" : (exp.endDate || "")} onChange={(e) => {
                      if (e.target.value.toLowerCase() === "present") {
                        updateExperience(exp.id, { isCurrentRole: true, endDate: "" });
                      } else {
                        updateExperience(exp.id, { isCurrentRole: false, endDate: e.target.value });
                      }
                    }} placeholder="End Date (or Present)" />
                  </div>
                  <textarea
                    style={{ ...editTextarea, fontSize: s.fontSize, minHeight: 60 }}
                    value={bullets.map(b => typeof b === 'string' ? b : (b as any).actionItem || (b as any).message || JSON.stringify(b)).join("\n")}
                    onChange={(e) => updateExperience(exp.id, { responsibilities: e.target.value.split("\n").filter(Boolean) })}
                    placeholder="One bullet point per line..."
                  />
                </div>
              );
            })
          )}
        </div>
      );
    }
    return (
      <div>
        {sectionTitle(block.label)}
        {exps.length === 0 ? (
          <div style={{ fontSize: 11, color: s.subTextColor, fontStyle: "italic" }}>Add experience in the builder to see it here</div>
        ) : (
          exps.map((exp, idx) => {
            const bullets = Array.isArray(exp.responsibilities) ? exp.responsibilities : String(exp.responsibilities || "").split("\n").filter(Boolean);
            return (
              <div key={exp.id || `exp-${idx}`} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 4 }}>
                  <div>
                    <div style={{ fontFamily: s.headingFontFamily, fontSize: s.fontSize + 2, fontWeight: 700, color: s.headingColor }}>{exp.jobTitle}</div>
                    <div style={{ fontSize: s.subTextSize, color: s.subTextColor, fontWeight: 500 }}>{exp.company}</div>
                  </div>
                  <div style={{ fontSize: s.subTextSize, color: s.subTextColor, whiteSpace: "nowrap" }}>
                    {exp.startDate} — {exp.isCurrentRole ? "Present" : exp.endDate || "Present"}
                  </div>
                </div>
                {bullets.length > 0 && (
                  <ul style={{ margin: "6px 0 0 0", paddingLeft: 14, listStyle: "none" }}>
                    {bullets.map((b, i) => {
                      const text = typeof b === 'string' ? b : (b as any).actionItem || (b as any).message || JSON.stringify(b);
                      return (
                        <li key={i} style={{ fontSize: s.fontSize, color: s.color, lineHeight: s.lineHeight, marginBottom: 3, position: "relative", paddingLeft: 12 }}>
                          <span style={{ position: "absolute", left: 0, top: "0.55em", width: 4, height: 4, borderRadius: "50%", backgroundColor: s.accentColor }} />
                          {text}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })
        )}
      </div>
    );
  }

  // ── EDUCATION ──
  if (block.type === "education") {
    const edus = data.education || [];
    if (isEditing) {
      return (
        <div onMouseDown={stopDrag}>
          {sectionTitle(block.label)}
          {edus.length === 0 ? (
            <div style={{ fontSize: 11, color: s.subTextColor, fontStyle: "italic" }}>Add education entries first</div>
          ) : (
            edus.map((edu, idx) => (
              <div key={edu.id || `edit-edu-${idx}`} style={{ marginBottom: 10, padding: 6, background: "rgba(37,99,235,0.03)", borderRadius: 6, border: "1px dashed rgba(37,99,235,0.15)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                  <input style={{ ...editInput, fontWeight: 600 }} value={edu.degree} onChange={(e) => updateEducation(edu.id, { degree: e.target.value })} placeholder="Degree" />
                  <input style={editInput} value={edu.institution} onChange={(e) => updateEducation(edu.id, { institution: e.target.value })} placeholder="Institution" />
                  <input style={{ ...editInput, fontSize: s.subTextSize }} value={edu.fieldOfStudy || ""} onChange={(e) => updateEducation(edu.id, { fieldOfStudy: e.target.value })} placeholder="Field of Study" />
                  <input style={{ ...editInput, fontSize: s.subTextSize }} value={edu.graduationDate || ""} onChange={(e) => updateEducation(edu.id, { graduationDate: e.target.value })} placeholder="Graduation Date" />
                </div>
              </div>
            ))
          )}
        </div>
      );
    }
    return (
      <div>
        {sectionTitle(block.label)}
        {edus.length === 0 ? (
          <div style={{ fontSize: 11, color: s.subTextColor, fontStyle: "italic" }}>Add education entries</div>
        ) : (
          edus.map((edu, idx) => (
            <div key={edu.id || `edu-${idx}`} style={{ marginBottom: 12, borderLeft: `3px solid ${s.accentColor}`, paddingLeft: 10 }}>
              <div style={{ fontFamily: s.headingFontFamily, fontSize: s.fontSize + 1, fontWeight: 600, color: s.headingColor }}>{edu.degree}</div>
              <div style={{ fontSize: s.subTextSize, color: s.subTextColor }}>
                {edu.institution}
                {edu.fieldOfStudy ? ` — ${edu.fieldOfStudy}` : ""}
                {edu.graduationDate ? ` | ${edu.graduationDate}` : ""}
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  // ── SKILLS ──
  if (block.type === "skills") {
    const rawSkills = Array.isArray(data.skills) ? data.skills : String(data.skills || "").split(",");
    const skills = rawSkills.map(x => typeof x === 'string' ? x.trim() : (x as any).actionItem || (x as any).message || JSON.stringify(x)).filter(Boolean);
    if (isEditing) {
      return (
        <div onMouseDown={stopDrag}>
          {sectionTitle(block.label)}
          <textarea
            autoFocus
            style={{ ...editTextarea, fontSize: s.fontSize, minHeight: 60 }}
            value={skills.join(", ")}
            onChange={(e) => setSkills(e.target.value.split(",").map((x) => x.trim()).filter(Boolean))}
            placeholder="Comma-separated skills: React, TypeScript, Node.js..."
          />
        </div>
      );
    }
    return (
      <div>
        {sectionTitle(block.label)}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {skills.length === 0 ? (
            <div style={{ fontSize: 11, color: s.subTextColor, fontStyle: "italic" }}>Add skills</div>
          ) : (
            skills.map((skill, i) => (
              <span key={i} style={{ fontSize: s.fontSize, color: s.accentColor, background: `${s.accentColor}12`, border: `1px solid ${s.accentColor}30`, borderRadius: 5, padding: "3px 9px", fontWeight: 500 }}>
                {skill}
              </span>
            ))
          )}
        </div>
      </div>
    );
  }

  // ── PROJECTS ──
  if (block.type === "projects") {
    const projects = data.projects || [];
    if (isEditing) {
      return (
        <div onMouseDown={stopDrag}>
          {sectionTitle(block.label)}
          {projects.length === 0 ? (
            <div style={{ fontSize: 11, color: s.subTextColor, fontStyle: "italic" }}>Add projects first</div>
          ) : (
            projects.map((p) => (
              <div key={p.id} style={{ marginBottom: 10, padding: 6, background: "rgba(37,99,235,0.03)", borderRadius: 6, border: "1px dashed rgba(37,99,235,0.15)" }}>
                <input style={{ ...editInput, fontWeight: 600, marginBottom: 4 }} value={p.name} onChange={(e) => updateProject(p.id, { name: e.target.value })} placeholder="Project Name" />
                <textarea style={{ ...editTextarea, minHeight: 40 }} value={p.description} onChange={(e) => updateProject(p.id, { description: e.target.value })} placeholder="Description" />
              </div>
            ))
          )}
        </div>
      );
    }
    return (
      <div>
        {sectionTitle(block.label)}
        {projects.length === 0 ? (
          <div style={{ fontSize: 11, color: s.subTextColor, fontStyle: "italic" }}>Add projects</div>
        ) : (
          projects.map((p) => (
            <div key={p.id} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: s.fontSize + 1, fontWeight: 600, color: s.headingColor }}>{p.name}</div>
              <div style={{ fontSize: s.fontSize, color: s.color, lineHeight: s.lineHeight }}>{p.description}</div>
            </div>
          ))
        )}
      </div>
    );
  }

  // ── CERTIFICATIONS ──
  if (block.type === "certifications") {
    const certs = data.certifications || [];
    return (
      <div>
        {sectionTitle(block.label)}
        {certs.length === 0 ? (
          <div style={{ fontSize: 11, color: s.subTextColor, fontStyle: "italic" }}>Add certifications</div>
        ) : (
          certs.map((c) => (
            <div key={c.id} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: s.fontSize, fontWeight: 600, color: s.headingColor }}>{c.name}</div>
              <div style={{ fontSize: s.subTextSize, color: s.subTextColor }}>{c.issuer}</div>
            </div>
          ))
        )}
      </div>
    );
  }

  return <div style={{ fontSize: 11, color: "#999" }}>{block.label}</div>;
}

/* ═══════════════════════════════════════════════════════════════
   AUTO-RESIZE OBSERVER
   Watches the rendered height of auto-height text blocks and updates store
   ════════════════════════════════════════════════════════════ */
function AutoResizeObserver({ block, isGraphic, isEditing, isDragging, isResizing }: { block: CanvasBlock, isGraphic: boolean, isEditing: boolean, isDragging: boolean, isResizing: boolean }) {
  const resizeBlock = useCanvasStore(s => s.resizeBlock);
  
  useEffect(() => {
    if (isGraphic || isEditing || isDragging || isResizing) return;
    const el = document.querySelector(`[data-block-id="${block.id}"]`) as HTMLElement;
    if (!el) return;
    
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // borderBoxSize is preferred as it includes padding and borders
        const h = entry.borderBoxSize?.[0]?.blockSize || entry.contentRect.height;
        if (h > 10 && Math.abs(h - block.height) > 2) {
          resizeBlock(block.id, block.width, h);
        }
      }
    });
    
    observer.observe(el);
    return () => observer.disconnect();
  }, [block.id, block.height, block.width, isGraphic, isEditing, isDragging, isResizing, resizeBlock]);

  return null;
}

/* ═══════════════════════════════════════════════════════════════
   MAIN CANVAS COMPONENT
   ════════════════════════════════════════════════════════════ */

export default function ResumeCanvas() {
  const {
    blocks,
    selectedBlockIds,
    editingBlockId,
    zoom,
    showGrid,
    gridSize,
    pageBackground,
    isDragging,
    isResizing,
    pageCount,
    currentPage,
    selectBlock,
    selectAllBlocks,
    clearSelection,
    setEditingBlock,
    moveBlock,
    moveSelectedBlocks,
    resizeBlock,
    setDragging,
    setResizing,
    pushHistory,
    setCurrentPage,
  } = useCanvasStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<{ startX: number; startY: number; initialBlocks: Record<string, { x: number, y: number }> } | null>(null);
  const [resizeState, setResizeState] = useState<{
    blockId: string;
    handle: HandlePos;
    startX: number;
    startY: number;
    blockX: number;
    blockY: number;
    blockW: number;
    blockH: number;
  } | null>(null);

  // ── Mouse helpers ──
  const getScaledPos = useCallback(
    (e: MouseEvent | React.MouseEvent) => {
      if (!canvasRef.current) return { x: 0, y: 0 };
      const rect = canvasRef.current.getBoundingClientRect();
      const scale = zoom / 100;
      return { x: (e.clientX - rect.left) / scale, y: (e.clientY - rect.top) / scale };
    },
    [zoom]
  );

  const handleBlockMouseDown = useCallback(
    (e: React.MouseEvent, block: CanvasBlock) => {
      if (block.locked) return;
      // Don't start drag if we're editing and clicking inside the edit area
      if (editingBlockId === block.id) return;
      e.stopPropagation();

      const store = useCanvasStore.getState();
      
      // If holding shift/cmd, toggle selection
      if (e.shiftKey || e.metaKey || e.ctrlKey) {
        store.selectBlock(block.id, true);
      } else {
        // If clicking an unselected block without shift, select only it
        if (!store.selectedBlockIds.includes(block.id)) {
          store.selectBlock(block.id, false);
        }
      }

      // Re-fetch store state after selection updates
      const updatedStore = useCanvasStore.getState();

      const pos = getScaledPos(e);
      const initialBlocks: Record<string, {x: number, y: number}> = {};
      updatedStore.blocks.forEach(b => {
        if (updatedStore.selectedBlockIds.includes(b.id)) {
          initialBlocks[b.id] = { x: b.x, y: b.y };
        }
      });

      setDragState({
        startX: pos.x,
        startY: pos.y,
        initialBlocks
      });
      setDragging(true);
      pushHistory();
    },
    [editingBlockId, getScaledPos, setDragging, pushHistory]
  );

  const handleHandleMouseDown = useCallback(
    (e: React.MouseEvent, block: CanvasBlock, handle: HandlePos) => {
      e.stopPropagation();
      pushHistory();
      const pos = getScaledPos(e);
      setResizeState({ blockId: block.id, handle, startX: pos.x, startY: pos.y, blockX: block.x, blockY: block.y, blockW: block.width, blockH: block.height });
      setResizing(true);
    },
    [pushHistory, getScaledPos, setResizing]
  );

  // Double-click to enter edit mode
  const handleBlockDoubleClick = useCallback(
    (e: React.MouseEvent, block: CanvasBlock) => {
      e.stopPropagation();
      // Panels, dividers are not editable
      if (block.type === "panel" || block.type === "divider") return;
      setEditingBlock(block.id);
    },
    [setEditingBlock]
  );

  // ── Mouse move / up ──
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const pos = getScaledPos(e);
      const store = useCanvasStore.getState();

      if (dragState) {
        const dx = pos.x - dragState.startX;
        const dy = pos.y - dragState.startY;

        // Apply grid snapping globally
        const snap = store.snapToGrid ? store.gridSize : 1;
        const snappedDx = Math.round(dx / snap) * snap;
        const snappedDy = Math.round(dy / snap) * snap;

        const newBlocks = store.blocks.map(b => {
          if (dragState.initialBlocks[b.id] && !b.locked) {
            return {
              ...b,
              x: dragState.initialBlocks[b.id].x + snappedDx,
              y: dragState.initialBlocks[b.id].y + snappedDy
            };
          }
          return b;
        });

        useCanvasStore.setState({ blocks: newBlocks });
      }
      if (resizeState) {
        const dx = pos.x - resizeState.startX;
        const dy = pos.y - resizeState.startY;
        const { handle, blockX, blockY, blockW, blockH, blockId } = resizeState;
        let nx = blockX, ny = blockY, nw = blockW, nh = blockH;
        if (handle.includes("r")) nw = blockW + dx;
        if (handle.includes("l")) { nw = blockW - dx; nx = blockX + dx; }
        if (handle.includes("b")) nh = blockH + dy;
        if (handle.includes("t")) { nh = blockH - dy; ny = blockY + dy; }
        resizeBlock(blockId, nw, nh, nx, ny);
      }
    };
    const handleMouseUp = () => {
      if (dragState) { setDragState(null); setDragging(false); }
      if (resizeState) { setResizeState(null); setResizing(false); }
    };
    if (dragState || resizeState) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragState, resizeState, moveBlock, resizeBlock, getScaledPos, setDragging, setResizing]);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape exits edit mode
      if (e.key === "Escape" && editingBlockId) {
        setEditingBlock(null);
        return;
      }

      // Don't handle shortcuts while editing text
      if (editingBlockId) return;

      const store = useCanvasStore.getState();
      const { selectedBlockIds } = store;

      if (e.key === "Escape") {
        store.clearSelection();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) store.redo();
        else store.undo();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        e.preventDefault();
        store.pasteBlocks();
        return;
      }

      if (selectedBlockIds.length === 0) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        if (document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
          e.preventDefault();
          store.pushHistory();
          store.removeSelectedBlocks();
        }
      }

      // Enter to start editing
      if (e.key === "Enter" && !e.ctrlKey && !e.metaKey && selectedBlockIds.length === 1) {
        const block = store.blocks.find((b) => b.id === selectedBlockIds[0]);
        if (block && block.type !== "panel" && block.type !== "divider") {
          e.preventDefault();
          setEditingBlock(selectedBlockIds[0]);
          return;
        }
      }

      const step = e.shiftKey ? 10 : 1;
      if (e.key === "ArrowUp")    { e.preventDefault(); store.pushHistory(); store.moveSelectedBlocks(0, -step); }
      if (e.key === "ArrowDown")  { e.preventDefault(); store.pushHistory(); store.moveSelectedBlocks(0, step); }
      if (e.key === "ArrowLeft")  { e.preventDefault(); store.pushHistory(); store.moveSelectedBlocks(-step, 0); }
      if (e.key === "ArrowRight") { e.preventDefault(); store.pushHistory(); store.moveSelectedBlocks(step, 0); }

      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        store.duplicateSelectedBlocks();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        e.preventDefault();
        store.copySelectedBlocks();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingBlockId, setEditingBlock]);

  const scale = zoom / 100;
  const totalHeight = pageCount * PAGE_H + (pageCount - 1) * PAGE_GAP;

  return (
    <div
      className="flex-1 overflow-auto flex items-start justify-center p-8"
      style={{ cursor: isDragging ? "grabbing" : isResizing ? "default" : "default" }}
      onClick={() => { selectBlock(null); setEditingBlock(null); }}
    >
      <div
        ref={canvasRef}
        data-canvas-export=""
        style={{
          width: PAGE_W,
          height: totalHeight,
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          position: "relative",
          flexShrink: 0,
        }}
        onClick={(e) => { e.stopPropagation(); selectBlock(null); setEditingBlock(null); }}
      >
        {/* Render each page */}
        {Array.from({ length: pageCount }, (_, pageIndex) => {
          const pageY = pageIndex * (PAGE_H + PAGE_GAP);
          const pageBlocks = blocks
            .filter((b) => (b.page ?? 0) === pageIndex)
            .sort((a, b) => a.zIndex - b.zIndex);
          const isActive = pageIndex === currentPage;

          return (
            <div
              key={pageIndex}
              data-page-index={pageIndex}
              style={{
                position: "absolute",
                left: 0,
                top: pageY,
                width: PAGE_W,
                height: PAGE_H,
                background: pageBackground,
                boxShadow: isActive
                  ? "0 20px 60px rgba(0,0,0,0.35), 0 0 0 2px rgba(37,99,235,0.3)"
                  : "0 20px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06)",
                borderRadius: 2,
                overflow: "hidden",
              }}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentPage(pageIndex);
                selectBlock(null);
                setEditingBlock(null);
              }}
            >
              {/* Page number label */}
              <div style={{ position: "absolute", bottom: 8, right: 12, fontSize: 9, color: "#b0b0b0", fontFamily: "Inter, sans-serif", pointerEvents: "none", zIndex: 1, opacity: 0.5 }}>
                Page {pageIndex + 1} of {pageCount}
              </div>

              {/* Grid overlay */}
              {showGrid && (
                <svg width={PAGE_W} height={PAGE_H} style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", zIndex: 0, opacity: 0.15 }}>
                  <defs>
                    <pattern id={`grid-${pageIndex}`} width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
                      <path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke="#94a3b8" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill={`url(#grid-${pageIndex})`} />
                </svg>
              )}

              {/* Blocks on this page */}
              {pageBlocks.map((block) => {
                if (!block.visible) return null;
                const selected = selectedBlockIds.includes(block.id);
                const editing = block.id === editingBlockId;
                const isPanel = block.type === "panel";
                const isDividerBlock = block.type === "divider";
                const isGraphic = isPanel || isDividerBlock;

                return (
                  <React.Fragment key={block.id}>
                    {!isGraphic && (
                      <AutoResizeObserver 
                        block={block} 
                        isGraphic={isGraphic} 
                        isEditing={editing} 
                        isDragging={isDragging} 
                        isResizing={isResizing} 
                      />
                    )}
                    <div
                      data-block-id={block.id}
                      style={{
                        position: "absolute",
                        left: block.x,
                        top: block.y,
                        width: block.width,
                        height: isGraphic ? block.height : "auto",
                        minHeight: isGraphic ? block.height : 20,
                        zIndex: block.zIndex,
                        backgroundColor: block.style.backgroundColor,
                        borderRadius: block.style.borderRadius,
                      border: editing
                        ? "2px solid #2563eb"
                        : selected
                        ? "1.5px solid #2563eb"
                        : block.style.borderWidth > 0
                        ? `${block.style.borderWidth}px solid ${block.style.borderColor}`
                        : "1.5px solid transparent",
                      padding: isDividerBlock ? 0 : block.style.padding,
                      opacity: block.style.opacity,
                      cursor: editing
                        ? "text"
                        : block.locked
                        ? "default"
                        : isDragging && selectedBlockIds.includes(block.id) 
                        ? "grabbing"
                        : "grab",
                      outline: selected && !editing ? "2px solid #2563eb44" : "none",
                      outlineOffset: 2,
                      transition: isDragging || isResizing ? "none" : "border-color 0.15s, outline 0.15s",
                      overflow: editing ? "visible" : "hidden",
                      userSelect: editing ? "text" : isDragging || isResizing ? "none" : "auto",
                    }}
                    onMouseDown={(e) => {
                      setCurrentPage(pageIndex);
                      if (editing) return; // Don't drag while editing
                      if (!isPanel || selected) handleBlockMouseDown(e, block);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentPage(pageIndex);
                      if (!editing) selectBlock(block.id);
                    }}
                    onDoubleClick={(e) => handleBlockDoubleClick(e, block)}
                  >
                    {/* Content (editable or static) */}
                    {!isPanel && <BlockContent block={block} isEditing={editing} />}

                    {/* Edit hint */}
                    {editing && (
                      <div style={editHint}>
                        Esc to finish · Changes save automatically
                      </div>
                    )}

                    {/* Double-click hint on selected blocks */}
                    {selected && !editing && !isPanel && !isDividerBlock && (
                      <div style={{ ...editHint, bottom: -16, color: "#6b7280", background: "#f3f4f6" }}>
                        Double-click or Enter to edit
                      </div>
                    )}

                    {/* Resize handles */}
                    {selectedBlockIds.length === 1 && selected && !block.locked && !editing && (
                      <>
                        {(["tl", "tr", "bl", "br", "t", "b", "l", "r"] as HandlePos[]).map((h) => (
                          <div key={h} style={handleStyle(h, true)} onMouseDown={(e) => handleHandleMouseDown(e, block, h)} />
                        ))}
                      </>
                    )}

                    {/* Block label */}
                    {selected && !editing && (
                      <div style={{ position: "absolute", top: -20, left: 0, fontSize: 9, fontWeight: 600, color: "#2563eb", background: "#eff6ff", padding: "1px 6px", borderRadius: "3px 3px 0 0", whiteSpace: "nowrap", fontFamily: "Inter, sans-serif", letterSpacing: 0.3, pointerEvents: "none", zIndex: 9999 }}>
                        {block.label} — {Math.round(block.width)}×{Math.round(block.height)}
                      </div>
                    )}
                  </div>
                  </React.Fragment>
                );
              })}

              {/* Selection alignment guides */}
              {selectedBlockIds.length === 1 && (() => {
                const sel = pageBlocks.find((b) => b.id === selectedBlockIds[0]);
                if (!sel) return null;
                const cx = sel.x + sel.width / 2;
                const cy = sel.y + sel.height / 2;
                const pageCx = PAGE_W / 2;
                const pageCy = PAGE_H / 2;
                const guides: React.ReactNode[] = [];
                if (Math.abs(cx - pageCx) < 4) {
                  guides.push(<div key="vcenter" style={{ position: "absolute", left: pageCx - 0.5, top: 0, width: 1, height: PAGE_H, background: "#2563eb55", zIndex: 99999, pointerEvents: "none" }} />);
                }
                if (Math.abs(cy - pageCy) < 4) {
                  guides.push(<div key="hcenter" style={{ position: "absolute", top: pageCy - 0.5, left: 0, height: 1, width: PAGE_W, background: "#2563eb55", zIndex: 99999, pointerEvents: "none" }} />);
                }
                return guides;
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
