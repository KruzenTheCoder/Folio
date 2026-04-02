"use client";

import React from "react";
import { useCanvasStore, BlockStyle } from "@/stores/canvas-store";
import {
  Type,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Square,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ArrowUpToLine,
  ArrowDownToLine,
  Layers,
  Minus,
  Plus,
} from "lucide-react";

const FONT_OPTIONS = [
  "Inter",
  "Plus Jakarta Sans",
  "Space Grotesk",
  "Poppins",
  "Playfair Display",
  "Cormorant Garamond",
  "EB Garamond",
  "JetBrains Mono",
  "DM Sans",
  "Outfit",
  "Merriweather",
  "Source Sans 3",
  "Roboto",
  "Lato",
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <div className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">{title}</div>
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 mb-1.5">
      <span className="text-[11px] text-white/60 min-w-[70px] shrink-0">{label}</span>
      <div className="flex-1 flex justify-end">{children}</div>
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  min = 0,
  max = 200,
  step = 1,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="flex items-center gap-0.5 bg-white/5 rounded-md border border-white/8">
      <button
        className="px-1 py-0.5 text-white/40 hover:text-white/70 transition-colors"
        onClick={() => onChange(Math.max(min, value - step))}
      >
        <Minus size={10} />
      </button>
      <input
        type="number"
        className="w-[46px] bg-transparent text-center text-[11px] text-white/90 outline-none py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <button
        className="px-1 py-0.5 text-white/40 hover:text-white/70 transition-colors"
        onClick={() => onChange(Math.min(max, value + step))}
      >
        <Plus size={10} />
      </button>
    </div>
  );
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <input
        type="color"
        value={value === "transparent" ? "#ffffff" : value}
        onChange={(e) => onChange(e.target.value)}
        className="w-6 h-6 rounded border border-white/10 cursor-pointer bg-transparent [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-[72px] bg-white/5 border border-white/8 rounded px-1.5 py-0.5 text-[10px] text-white/80 font-mono outline-none focus:border-blue-500/40"
      />
    </div>
  );
}

function SelectInput({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-white/5 border border-white/8 rounded px-1.5 py-1 text-[11px] text-white/80 outline-none w-full max-w-[160px] focus:border-blue-500/40"
    >
      {options.map((o) => (
        <option key={o} value={o} className="bg-neutral-900 text-white">
          {o}
        </option>
      ))}
    </select>
  );
}

export default function PropertiesPanel() {
  const {
    blocks,
    selectedBlockIds,
    pageBackground,
    updateBlockStyle,
    setBlockVisibility,
    setBlockLocked,
    removeBlock,
    duplicateBlock,
    bringToFront,
    sendToBack,
    setPageBackground,
    updateBlockLabel,
  } = useCanvasStore();

  const block = selectedBlockIds.length === 1 ? blocks.find((b) => b.id === selectedBlockIds[0]) : null;

  const update = (patch: Partial<BlockStyle>) => {
    if (block) updateBlockStyle(block.id, patch);
  };

  if (selectedBlockIds.length > 1) {
    return (
      <div className="p-5 flex flex-col items-center justify-center h-full text-center space-y-3">
        <div className="p-3 bg-white/5 rounded-full">
          <Type size={20} className="text-white/40" />
        </div>
        <div>
          <p className="text-sm font-medium text-white/80">Multiple elements selected</p>
          <p className="text-xs text-white/40 mt-1">Properties are only available when a single element is selected.</p>
        </div>
      </div>
    );
  }

  // ── No selection state ──
  if (!block) {
    return (
      <div className="p-4 overflow-y-auto">
        <div className="text-xs text-white/30 text-center mt-10">
          <Layers size={28} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Select a block</p>
          <p className="mt-1 text-[10px]">Click on any element on the canvas to edit its properties</p>
        </div>

        <div className="mt-8">
          <Section title="Page Background">
            <ColorInput value={pageBackground} onChange={setPageBackground} />
          </Section>
        </div>

        <div className="mt-4">
          <Section title="All Blocks">
            {blocks
              .filter((b) => b.type !== "panel" && b.type !== "divider")
              .map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between py-1 px-2 rounded hover:bg-white/5 cursor-pointer text-[11px] text-white/60"
                  onClick={() => useCanvasStore.getState().selectBlock(b.id)}
                >
                  <span className="truncate">{b.label}</span>
                  <span className="text-[9px] text-white/30">{b.type}</span>
                </div>
              ))}
          </Section>
        </div>
      </div>
    );
  }

  const s = block.style;
  const isPanel = block.type === "panel" || block.type === "divider";

  return (
    <div className="overflow-y-auto">
      {/* Block header */}
      <div className="p-3 border-b border-white/6 flex items-center justify-between">
        <div>
          <input
            type="text"
            value={block.label}
            onChange={(e) => updateBlockLabel(block.id, e.target.value)}
            className="bg-transparent text-sm font-semibold text-white/90 outline-none w-full"
          />
          <div className="text-[9px] text-white/30 mt-0.5 uppercase tracking-wider">{block.type}</div>
        </div>
        <div className="flex gap-1">
          <button
            className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors"
            onClick={() => setBlockVisibility(block.id, !block.visible)}
            title={block.visible ? "Hide" : "Show"}
          >
            {block.visible ? <Eye size={13} /> : <EyeOff size={13} />}
          </button>
          <button
            className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors"
            onClick={() => setBlockLocked(block.id, !block.locked)}
            title={block.locked ? "Unlock" : "Lock"}
          >
            {block.locked ? <Lock size={13} /> : <Unlock size={13} />}
          </button>
        </div>
      </div>

      <div className="p-3 space-y-1">
        {/* ── Position & Size ── */}
        <Section title="Position & Size">
          <div className="grid grid-cols-2 gap-2">
            <Row label="X">
              <NumberInput value={Math.round(block.x)} onChange={(v) => useCanvasStore.getState().moveBlock(block.id, v, block.y)} min={-200} max={1000} />
            </Row>
            <Row label="Y">
              <NumberInput value={Math.round(block.y)} onChange={(v) => useCanvasStore.getState().moveBlock(block.id, block.x, v)} min={-200} max={1500} />
            </Row>
            <Row label="W">
              <NumberInput value={Math.round(block.width)} onChange={(v) => useCanvasStore.getState().resizeBlock(block.id, v, block.height)} min={20} max={800} />
            </Row>
            <Row label="H">
              <NumberInput value={Math.round(block.height)} onChange={(v) => useCanvasStore.getState().resizeBlock(block.id, block.width, v)} min={10} max={1200} />
            </Row>
          </div>
        </Section>

        {/* ── Appearance ── */}
        <Section title="Appearance">
          <Row label="Background">
            <ColorInput value={s.backgroundColor} onChange={(v) => update({ backgroundColor: v })} />
          </Row>
          <Row label="Border Radius">
            <NumberInput value={s.borderRadius} onChange={(v) => update({ borderRadius: v })} max={50} />
          </Row>
          <Row label="Border Width">
            <NumberInput value={s.borderWidth} onChange={(v) => update({ borderWidth: v })} max={10} />
          </Row>
          {s.borderWidth > 0 && (
            <Row label="Border Color">
              <ColorInput value={s.borderColor} onChange={(v) => update({ borderColor: v })} />
            </Row>
          )}
          <Row label="Padding">
            <NumberInput value={s.padding} onChange={(v) => update({ padding: v })} max={60} />
          </Row>
          <Row label="Opacity">
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={s.opacity}
              onChange={(e) => update({ opacity: Number(e.target.value) })}
              className="w-[100px] accent-blue-500"
            />
          </Row>
        </Section>

        {/* ── Typography (only for content blocks) ── */}
        {!isPanel && (
          <>
            <Section title="Heading Typography">
              <Row label="Font">
                <SelectInput value={s.headingFontFamily} options={FONT_OPTIONS} onChange={(v) => update({ headingFontFamily: v })} />
              </Row>
              <Row label="Size">
                <NumberInput value={s.headingFontSize} onChange={(v) => update({ headingFontSize: v })} min={8} max={72} />
              </Row>
              <Row label="Weight">
                <SelectInput
                  value={String(s.headingFontWeight)}
                  options={["300", "400", "500", "600", "700", "800", "900"]}
                  onChange={(v) => update({ headingFontWeight: Number(v) })}
                />
              </Row>
              <Row label="Color">
                <ColorInput value={s.headingColor} onChange={(v) => update({ headingColor: v })} />
              </Row>
            </Section>

            <Section title="Body Typography">
              <Row label="Font">
                <SelectInput value={s.fontFamily} options={FONT_OPTIONS} onChange={(v) => update({ fontFamily: v })} />
              </Row>
              <Row label="Size">
                <NumberInput value={s.fontSize} onChange={(v) => update({ fontSize: v })} min={8} max={32} />
              </Row>
              <Row label="Weight">
                <SelectInput
                  value={String(s.fontWeight)}
                  options={["300", "400", "500", "600", "700"]}
                  onChange={(v) => update({ fontWeight: Number(v) })}
                />
              </Row>
              <Row label="Color">
                <ColorInput value={s.color} onChange={(v) => update({ color: v })} />
              </Row>
              <Row label="Line Height">
                <NumberInput value={s.lineHeight} onChange={(v) => update({ lineHeight: v })} min={1} max={3} step={0.1} />
              </Row>
              <Row label="Letter Spacing">
                <NumberInput value={s.letterSpacing} onChange={(v) => update({ letterSpacing: v })} min={-2} max={10} step={0.25} />
              </Row>
              <Row label="Align">
                <div className="flex gap-0.5 bg-white/5 rounded-md p-0.5">
                  {([
                    { val: "left" as const, Icon: AlignLeft },
                    { val: "center" as const, Icon: AlignCenter },
                    { val: "right" as const, Icon: AlignRight },
                  ]).map(({ val, Icon }) => (
                    <button
                      key={val}
                      className={`p-1 rounded transition-colors ${s.textAlign === val ? "bg-blue-600 text-white" : "text-white/40 hover:text-white/70"}`}
                      onClick={() => update({ textAlign: val })}
                    >
                      <Icon size={12} />
                    </button>
                  ))}
                </div>
              </Row>
            </Section>

            <Section title="Detail Colors">
              <Row label="Sub Text">
                <ColorInput value={s.subTextColor} onChange={(v) => update({ subTextColor: v })} />
              </Row>
              <Row label="Sub Size">
                <NumberInput value={s.subTextSize} onChange={(v) => update({ subTextSize: v })} min={8} max={20} />
              </Row>
              <Row label="Accent">
                <ColorInput value={s.accentColor} onChange={(v) => update({ accentColor: v })} />
              </Row>
            </Section>
          </>
        )}

        {/* ── Actions ── */}
        <Section title="Actions">
          <div className="grid grid-cols-2 gap-1.5">
            <button
              className="flex items-center justify-center gap-1.5 rounded-lg bg-white/5 hover:bg-white/10 px-2 py-1.5 text-[10px] text-white/60 hover:text-white/90 transition-colors"
              onClick={() => duplicateBlock(block.id)}
            >
              <Copy size={11} /> Duplicate
            </button>
            <button
              className="flex items-center justify-center gap-1.5 rounded-lg bg-white/5 hover:bg-white/10 px-2 py-1.5 text-[10px] text-white/60 hover:text-white/90 transition-colors"
              onClick={() => bringToFront(block.id)}
            >
              <ArrowUpToLine size={11} /> To Front
            </button>
            <button
              className="flex items-center justify-center gap-1.5 rounded-lg bg-white/5 hover:bg-white/10 px-2 py-1.5 text-[10px] text-white/60 hover:text-white/90 transition-colors"
              onClick={() => sendToBack(block.id)}
            >
              <ArrowDownToLine size={11} /> To Back
            </button>
            <button
              className="flex items-center justify-center gap-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 px-2 py-1.5 text-[10px] text-red-400 hover:text-red-300 transition-colors"
              onClick={() => removeBlock(block.id)}
            >
              <Trash2 size={11} /> Delete
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
}
