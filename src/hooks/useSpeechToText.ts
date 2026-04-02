"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ═══════════════════════════════════════════════════════════════
   useSpeechToText — Browser-native voice dictation hook
   Uses the Web Speech API (Chrome, Edge, Safari 14.1+)
   ════════════════════════════════════════════════════════════ */

interface SpeechToTextOptions {
  /** Language code (default: "en-US") */
  lang?: string;
  /** Keep listening after pauses (default: true) */
  continuous?: boolean;
  /** Get partial results while speaking (default: true) */
  interimResults?: boolean;
  /** Called with final transcript when a phrase is complete */
  onResult?: (transcript: string) => void;
  /** Called with interim (partial) text while speaking */
  onInterim?: (transcript: string) => void;
  /** Called when an error occurs */
  onError?: (error: string) => void;
}

interface SpeechToTextReturn {
  /** Whether the browser supports Speech Recognition */
  isSupported: boolean;
  /** Whether the microphone is currently listening */
  isListening: boolean;
  /** Current interim transcript (updates in real-time as you speak) */
  interim: string;
  /** Full transcript accumulated during this session */
  transcript: string;
  /** Start listening */
  start: () => void;
  /** Stop listening */
  stop: () => void;
  /** Toggle listening on/off */
  toggle: () => void;
  /** Clear the accumulated transcript */
  clear: () => void;
}

export function useSpeechToText(options: SpeechToTextOptions = {}): SpeechToTextReturn {
  const {
    lang = "en-US",
    continuous = true,
    interimResults = true,
    onResult,
    onInterim,
    onError,
  } = options;

  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const recognitionRef = useRef<any>(null);
  const isIntentionallyStopped = useRef(false);
  const onResultRef = useRef(onResult);
  const onInterimRef = useRef(onInterim);
  const onErrorRef = useRef(onError);

  // Keep refs fresh
  useEffect(() => { onResultRef.current = onResult; }, [onResult]);
  useEffect(() => { onInterimRef.current = onInterim; }, [onInterim]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  // Check browser support
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SR);
  }, []);

  const start = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      onErrorRef.current?.("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    isIntentionallyStopped.current = false;

    // Stop any existing instance
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ok */ }
    }

    const recognition = new SR();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      let interimText = "";
      let finalText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      if (interimText) {
        setInterim(interimText);
        onInterimRef.current?.(interimText);
      }

      if (finalText) {
        setInterim("");
        setTranscript((prev) => {
          const combined = prev ? `${prev} ${finalText}` : finalText;
          return combined;
        });
        onResultRef.current?.(finalText);
      }
    };

    recognition.onerror = (event: any) => {
      // Ignore 'aborted' entirely if we are in continuous mode or if we stopped it manually.
      // This prevents the console and UI from spamming abort errors when the browser decides to stop listening.
      if (event.error === "aborted") {
        return;
      }
      
      // If it's a "no-speech" error and continuous is true, we don't want to kill it entirely
      // The onend handler will restart it if continuous is true
      if (event.error === "no-speech" && continuous) {
        return;
      }

      const errorMap: Record<string, string> = {
        "no-speech": "No speech detected. Try again.",
        "audio-capture": "No microphone found. Check your device settings.",
        "not-allowed": "Microphone access denied. Please allow microphone access.",
        "network": "Network error. Check your connection.",
      };
      
      const message = errorMap[event.error] || `Speech error: ${event.error}`;
      onErrorRef.current?.(message);
      setIsListening(false);
    };

    recognition.onend = () => {
      if (continuous && !isIntentionallyStopped.current) {
        // Browser sometimes stops on its own after silence, auto-restart
        try {
          recognition.start();
        } catch (err) {
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (err) {
      console.error("Speech recognition start error:", err);
    }
  }, [lang, continuous, interimResults]);

  const stop = useCallback(() => {
    isIntentionallyStopped.current = true;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ok */ }
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterim("");
  }, []);

  const toggle = useCallback(() => {
    if (isListening) stop();
    else start();
  }, [isListening, start, stop]);

  const clear = useCallback(() => {
    setTranscript("");
    setInterim("");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* ok */ }
      }
    };
  }, []);

  return { isSupported, isListening, interim, transcript, start, stop, toggle, clear };
}
