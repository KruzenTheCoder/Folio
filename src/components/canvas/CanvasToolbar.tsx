"use client";

import React, { useState } from "react";
import { useCanvasStore } from "@/stores/canvas-store";
import { CANVAS_TEMPLATES } from "@/lib/canvas-templates";
import {
  ZoomIn,
  ZoomOut,
  Undo2,
  Redo2,
  Grid3x3,
  Magnet,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  LayoutTemplate,
  Download,
  Plus,
  X,
  Minus,
  Copy,
  Trash2,
  AlignVerticalSpaceAround,
} from "lucide-react";

function ToolBtn({
  children,
  onClick,
  active,
  title,
  danger,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  title?: string;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`p-1.5 rounded-md transition-all text-xs ${
        disabled
          ? "opacity-50 cursor-not-allowed text-white/30"
          : active
          ? "bg-blue-600/80 text-white shadow-sm shadow-blue-500/20"
          : danger
          ? "text-red-400/60 hover:text-red-300 hover:bg-red-500/10"
          : "text-white/50 hover:text-white/90 hover:bg-white/8"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-white/8 mx-1" />;
}

export default function CanvasToolbar({ onExport }: { onExport?: () => void }) {
  const {
    zoom,
    showGrid,
    snapToGrid,
    setZoom,
    toggleGrid,
    toggleSnap,
    undo,
    redo,
    alignSelected,
    applyTemplate,
    addBlock,
    blocks,
    selectedBlockIds,
    historyIndex,
    history,
    pushHistory,
    duplicateSelectedBlocks,
    removeSelectedBlocks,
  } = useCanvasStore();

  const [showTemplates, setShowTemplates] = useState(false);
  const [showAddBlock, setShowAddBlock] = useState(false);

  const blockTypes = [
    { type: "header" as const, label: "Header" },
    { type: "contact" as const, label: "Contact" },
    { type: "summary" as const, label: "Summary" },
    { type: "experience" as const, label: "Experience" },
    { type: "education" as const, label: "Education" },
    { type: "skills" as const, label: "Skills" },
    { type: "projects" as const, label: "Projects" },
    { type: "certifications" as const, label: "Certifications" },
    { type: "divider" as const, label: "Divider" },
    { type: "panel" as const, label: "Panel / BG" },
  ];

  return (
    <>
      <div className="h-11 border-b border-white/8 bg-black/30 backdrop-blur-lg flex items-center px-3 gap-1 shrink-0 relative z-50">
        {/* Undo / Redo */}
        <ToolBtn onClick={undo} title="Undo (Ctrl+Z)"><Undo2 size={14} /></ToolBtn>
        <ToolBtn onClick={redo} title="Redo (Ctrl+Shift+Z)"><Redo2 size={14} /></ToolBtn>

        <Divider />

        {/* Zoom */}
        <ToolBtn onClick={() => setZoom(zoom - 10)} title="Zoom Out"><ZoomOut size={14} /></ToolBtn>
        <button
          onClick={() => setZoom(80)}
          className="px-2 py-0.5 text-[11px] font-medium text-white/70 hover:text-white/90 rounded bg-white/5 hover:bg-white/8 min-w-[48px] text-center transition-colors"
        >
          {zoom}%
        </button>
        <ToolBtn onClick={() => setZoom(zoom + 10)} title="Zoom In"><ZoomIn size={14} /></ToolBtn>

        <Divider />

        {/* Grid & Snap */}
        <ToolBtn onClick={toggleGrid} active={showGrid} title="Toggle Grid"><Grid3x3 size={14} /></ToolBtn>
        <ToolBtn onClick={toggleSnap} active={snapToGrid} title="Snap to Grid"><Magnet size={14} /></ToolBtn>

        <Divider />

        {/* Alignment (only when block is selected) */}
        <ToolBtn onClick={() => { pushHistory(); alignSelected("left"); }} title="Align Left" disabled={selectedBlockIds.length === 0}><AlignStartVertical size={14} /></ToolBtn>
        <ToolBtn onClick={() => { pushHistory(); alignSelected("center"); }} title="Align Center H" disabled={selectedBlockIds.length === 0}><AlignCenterVertical size={14} /></ToolBtn>
        <ToolBtn onClick={() => { pushHistory(); alignSelected("right"); }} title="Align Right" disabled={selectedBlockIds.length === 0}><AlignEndVertical size={14} /></ToolBtn>
        <ToolBtn onClick={() => { pushHistory(); alignSelected("top"); }} title="Align Top" disabled={selectedBlockIds.length === 0}><AlignStartHorizontal size={14} /></ToolBtn>
        <ToolBtn onClick={() => { pushHistory(); alignSelected("middle"); }} title="Align Center V" disabled={selectedBlockIds.length === 0}><AlignCenterHorizontal size={14} /></ToolBtn>
        <ToolBtn onClick={() => { pushHistory(); alignSelected("bottom"); }} title="Align Bottom" disabled={selectedBlockIds.length === 0}><AlignEndHorizontal size={14} /></ToolBtn>
        
        <Divider />
        <ToolBtn onClick={() => useCanvasStore.getState().autoLayout()} title="Auto Layout (Space vertically)"><AlignVerticalSpaceAround size={14} /></ToolBtn>

        <Divider />

        {/* Actions */}
        <ToolBtn onClick={() => { pushHistory(); duplicateSelectedBlocks(); }} title="Duplicate (Ctrl+D)" disabled={selectedBlockIds.length === 0}><Copy size={14} /></ToolBtn>
        <ToolBtn onClick={() => { pushHistory(); removeSelectedBlocks(); }} title="Delete (Del)" danger disabled={selectedBlockIds.length === 0}><Trash2 size={14} /></ToolBtn>

        <Divider />

        {/* Add Block */}
        <div className="relative">
          <ToolBtn onClick={() => { setShowAddBlock(!showAddBlock); setShowTemplates(false); }} title="Add Block">
            <div className="flex items-center gap-1">
              <Plus size={14} />
              <span className="text-[10px] font-medium">Block</span>
            </div>
          </ToolBtn>
          {showAddBlock && (
            <div className="absolute top-full left-0 mt-1 bg-neutral-900 border border-white/10 rounded-lg shadow-2xl py-1 min-w-[150px] z-[100]">
              {blockTypes.map((bt) => (
                <button
                  key={bt.type}
                  className="w-full text-left px-3 py-1.5 text-[11px] text-white/70 hover:text-white hover:bg-white/8 transition-colors"
                  onClick={() => {
                    addBlock({
                      type: bt.type,
                      label: bt.label,
                      x: 50,
                      y: 50,
                      width: bt.type === "divider" ? 694 : bt.type === "panel" ? 280 : 300,
                      height: bt.type === "divider" ? 2 : bt.type === "panel" ? 400 : 150,
                    });
                    setShowAddBlock(false);
                  }}
                >
                  {bt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Templates */}
        <ToolBtn onClick={() => { setShowTemplates(!showTemplates); setShowAddBlock(false); }} title="Template Gallery">
          <div className="flex items-center gap-1">
            <LayoutTemplate size={14} />
            <span className="text-[10px] font-medium">Templates</span>
          </div>
        </ToolBtn>

        <div className="flex-1" />

        {/* Export */}
        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold transition-colors shadow-sm shadow-blue-500/20"
          >
            <Download size={12} />
            Export PDF
          </button>
        )}
      </div>

      {/* ── Template Gallery Overlay ── */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <div className="bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-white/8">
              <div>
                <h2 className="text-lg font-bold text-white">Template Gallery</h2>
                <p className="text-xs text-white/40 mt-0.5">Choose a layout preset — your content stays the same</p>
              </div>
              <button
                onClick={() => setShowTemplates(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
              <div className="grid grid-cols-4 gap-4">
                {CANVAS_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => {
                      const blocks = tmpl.getBlocks();
                      applyTemplate(tmpl.id, blocks, tmpl.pageBackground);
                      setShowTemplates(false);
                    }}
                    className="group text-left rounded-xl border border-white/8 hover:border-blue-500/40 bg-white/3 hover:bg-white/5 transition-all overflow-hidden"
                  >
                    {/* Preview swatch */}
                    <div
                      className="h-28 w-full relative overflow-hidden"
                      style={{ background: tmpl.previewGradient }}
                    >
                      {/* Mini layout preview */}
                      <div className="absolute inset-3 flex gap-1.5 opacity-60 group-hover:opacity-80 transition-opacity">
                        {tmpl.id.includes("suite") || tmpl.id.includes("terminal") ? (
                          <>
                            <div className="w-1/3 h-full bg-black/30 rounded-sm" />
                            <div className="flex-1 flex flex-col gap-1">
                              <div className="h-3 w-2/3 bg-white/30 rounded-sm" />
                              <div className="h-1.5 w-1/2 bg-white/20 rounded-sm" />
                              <div className="flex-1 bg-white/10 rounded-sm mt-1" />
                            </div>
                          </>
                        ) : tmpl.id.includes("coral") || tmpl.id.includes("impact") || tmpl.id.includes("gradient") ? (
                          <div className="w-full flex flex-col gap-1">
                            <div className="h-6 w-full bg-black/20 rounded-sm" />
                            <div className="flex-1 flex gap-1">
                              <div className="flex-1 bg-white/10 rounded-sm" />
                              <div className="w-1/3 bg-white/15 rounded-sm" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-full flex flex-col gap-1">
                            <div className="h-4 w-2/3 bg-white/30 rounded-sm" />
                            <div className="h-1 w-full bg-white/15 rounded-sm" />
                            <div className="flex-1 flex gap-1.5 mt-1">
                              <div className="flex-1 bg-white/10 rounded-sm" />
                              <div className="w-1/3 flex flex-col gap-1">
                                <div className="flex-1 bg-white/15 rounded-sm" />
                                <div className="flex-1 bg-white/12 rounded-sm" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="text-[12px] font-semibold text-white/90 group-hover:text-white transition-colors">
                        {tmpl.name}
                      </div>
                      <div className="text-[10px] text-white/40 mt-0.5 leading-tight">{tmpl.description}</div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <div className="w-3 h-3 rounded-full border border-white/10" style={{ background: tmpl.accentColor }} />
                        <span className="text-[9px] text-white/30 uppercase tracking-wider">{tmpl.category}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
