"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSpeechToText } from "@/hooks/useSpeechToText";

/* ═══════════════════════════════════════════════════════════════
   VoiceDictation — Mic button + real-time visual feedback
   
   Usage:
     <VoiceDictation 
       onTranscript={(text) => appendToField(text)} 
       label="Dictate summary"
     />
   ════════════════════════════════════════════════════════════ */

interface VoiceDictationProps {
  /** Called with each finalized phrase of text */
  onTranscript: (text: string) => void;
  /** Optional label shown next to the button */
  label?: string;
  /** Compact mode (icon only, no label) */
  compact?: boolean;
  /** Language code (default: "en-US") */
  lang?: string;
  /** Additional CSS class */
  className?: string;
}

export function VoiceDictation({
  onTranscript,
  label,
  compact = false,
  lang = "en-US",
  className = "",
}: VoiceDictationProps) {
  const [error, setError] = useState<string | null>(null);
  const [showInterim, setShowInterim] = useState(false);

  const {
    isSupported,
    isListening,
    interim,
    toggle,
  } = useSpeechToText({
    lang,
    continuous: true,
    interimResults: true,
    onResult: useCallback((text: string) => {
      onTranscript(text);
    }, [onTranscript]),
    onError: useCallback((err: string) => {
      setError(err);
      setTimeout(() => setError(null), 4000);
    }, []),
  });

  useEffect(() => {
    setShowInterim(isListening && interim.length > 0);
  }, [isListening, interim]);

  if (!isSupported) return null;

  return (
    <div className={`relative inline-flex items-center gap-1.5 ${className}`}>
      {/* Mic button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggle();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        title={isListening ? "Stop dictation" : label || "Start voice dictation"}
        className={`
          relative flex items-center justify-center rounded-lg transition-all duration-200
          ${compact ? "w-7 h-7" : "px-2.5 py-1.5 gap-1.5"}
          ${isListening
            ? "bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.2)]"
            : "bg-white/5 border border-white/10 text-white/40 hover:bg-white/10 hover:text-white/70 hover:border-white/20"
          }
        `}
      >
        {/* Animated rings when listening */}
        {isListening && (
          <>
            <span className="absolute inset-0 rounded-lg border border-red-400/30 animate-ping" style={{ animationDuration: "1.5s" }} />
            <span className="absolute inset-[-3px] rounded-xl border border-red-400/15 animate-ping" style={{ animationDuration: "2s", animationDelay: "0.3s" }} />
          </>
        )}

        {/* Mic icon */}
        <svg width={compact ? 14 : 12} height={compact ? 14 : 12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 shrink-0">
          <rect x="9" y="2" width="6" height="12" rx="3" />
          <path d="M5 10a7 7 0 0 0 14 0" />
          <line x1="12" y1="19" x2="12" y2="22" />
          <line x1="8" y1="22" x2="16" y2="22" />
        </svg>

        {/* Label */}
        {!compact && (
          <span className="text-[10px] font-medium relative z-10 whitespace-nowrap">
            {isListening ? "Listening..." : label || "Dictate"}
          </span>
        )}
      </button>

      {/* Interim text bubble */}
      {showInterim && interim && (
        <div
          className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-neutral-800 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] text-white/70 whitespace-nowrap max-w-[280px] truncate shadow-xl z-50 pointer-events-none"
          style={{ backdropFilter: "blur(8px)" }}
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5 animate-pulse" />
          {interim}
        </div>
      )}

      {/* Error toast */}
      {error && (
        <div className="absolute top-full mt-2 left-0 bg-red-900/90 border border-red-700/40 text-red-200 text-[10px] rounded-lg px-3 py-2 whitespace-nowrap shadow-xl z-50 pointer-events-none">
          {error}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   InlineDictation — Minimal mic icon for inline text fields
   Appends dictated text to existing value
   ════════════════════════════════════════════════════════════ */

interface InlineDictationProps {
  /** Current text value of the field */
  value: string;
  /** Called with the updated text (existing + new transcript) */
  onChange: (newValue: string) => void;
  /** Optional separator between existing text and new dictation */
  separator?: string;
  /** Language */
  lang?: string;
}

export function InlineDictation({
  value,
  onChange,
  separator = " ",
  lang = "en-US",
}: InlineDictationProps) {
  const handleTranscript = useCallback(
    (text: string) => {
      const updated = value ? `${value}${separator}${text}` : text;
      onChange(updated);
    },
    [value, onChange, separator]
  );

  return (
    <VoiceDictation
      onTranscript={handleTranscript}
      compact
      lang={lang}
      className="absolute right-1 top-1"
    />
  );
}
