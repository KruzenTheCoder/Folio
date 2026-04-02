import { CanvasBlock, BlockStyle, BlockType, DEFAULT_BLOCK_STYLE, PAGE_W, PAGE_H } from "@/stores/canvas-store";
import { v4 as uuidv4 } from "uuid";

// ── Template definition ──────────────────────────────────────
export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  category: "professional" | "creative" | "minimal" | "bold";
  accentColor: string;
  previewGradient: string;
  pageBackground: string;
  getBlocks: () => CanvasBlock[];
}

// ── Helper to create a block ─────────────────────────────────
function blk(
  type: BlockType,
  label: string,
  x: number,
  y: number,
  w: number,
  h: number,
  z: number,
  style: Partial<BlockStyle> = {}
): CanvasBlock {
  return {
    id: uuidv4(),
    type,
    label,
    x,
    y,
    width: w,
    height: h,
    zIndex: z,
    locked: false,
    visible: true,
    style: { ...DEFAULT_BLOCK_STYLE, ...style },
  };
}

// ═══════════════════════════════════════════════════════════════
// 1. MODERN ELEGANCE
// Top accent bar, single column flow, refined blue accents
// Plus Jakarta Sans + Inter, airy spacing, subtle card backgrounds
// ═══════════════════════════════════════════════════════════════
const modernElegance: CanvasTemplate = {
  id: "modern-elegance",
  name: "Modern Elegance",
  description: "Refined single-column layout with blue accent bar and airy spacing",
  category: "professional",
  accentColor: "#2563eb",
  previewGradient: "linear-gradient(135deg, #1e3a5f, #2563eb, #60a5fa)",
  pageBackground: "#ffffff",
  getBlocks: () => [
    // Top accent bar
    blk("panel", "Accent Bar", 0, 0, PAGE_W, 6, 1, {
      backgroundColor: "#2563eb",
      padding: 0,
    }),
    // Name & role
    blk("header", "Name & Title", 55, 32, 684, 80, 10, {
      headingFontFamily: "Plus Jakarta Sans",
      headingFontSize: 40,
      headingFontWeight: 800,
      headingColor: "#0f172a",
      subTextColor: "#2563eb",
      subTextSize: 14,
      accentColor: "#2563eb",
      textAlign: "left",
      padding: 0,
      letterSpacing: -0.5,
    }),
    // Contact row
    blk("contact", "Contact Info", 55, 118, 684, 26, 10, {
      fontSize: 10.5,
      color: "#64748b",
      accentColor: "#2563eb",
      padding: 0,
      textAlign: "left",
      letterSpacing: 0.3,
    }),
    // Thin divider
    blk("divider", "Divider", 55, 154, 684, 1, 5, {
      backgroundColor: "#e2e8f0",
      padding: 0,
    }),
    // Summary
    blk("summary", "Professional Summary", 55, 172, 684, 78, 10, {
      headingFontFamily: "Plus Jakarta Sans",
      headingFontSize: 11,
      headingFontWeight: 700,
      headingColor: "#2563eb",
      fontSize: 11.5,
      color: "#475569",
      lineHeight: 1.75,
      padding: 0,
      accentColor: "#2563eb",
      letterSpacing: 0.2,
    }),
    // Experience — left column
    blk("experience", "Work Experience", 55, 268, 430, 460, 10, {
      headingFontFamily: "Plus Jakarta Sans",
      headingFontSize: 11,
      headingFontWeight: 700,
      headingColor: "#2563eb",
      fontSize: 11,
      color: "#475569",
      subTextColor: "#94a3b8",
      subTextSize: 10,
      lineHeight: 1.65,
      padding: 0,
      accentColor: "#2563eb",
    }),
    // Skills — right column card
    blk("skills", "Core Skills", 510, 268, 229, 165, 10, {
      headingFontFamily: "Plus Jakarta Sans",
      headingFontSize: 11,
      headingFontWeight: 700,
      headingColor: "#2563eb",
      fontSize: 10,
      color: "#334155",
      accentColor: "#2563eb",
      backgroundColor: "#f1f5f9",
      borderRadius: 12,
      padding: 18,
    }),
    // Education — right column card
    blk("education", "Education", 510, 450, 229, 155, 10, {
      headingFontFamily: "Plus Jakarta Sans",
      headingFontSize: 11,
      headingFontWeight: 700,
      headingColor: "#2563eb",
      fontSize: 10.5,
      color: "#475569",
      subTextColor: "#94a3b8",
      subTextSize: 9.5,
      accentColor: "#2563eb",
      backgroundColor: "#f1f5f9",
      borderRadius: 12,
      padding: 18,
    }),
    // Certifications
    blk("certifications", "Certifications", 510, 622, 229, 106, 10, {
      headingFontFamily: "Plus Jakarta Sans",
      headingFontSize: 11,
      headingFontWeight: 700,
      headingColor: "#2563eb",
      fontSize: 10,
      color: "#475569",
      accentColor: "#2563eb",
      backgroundColor: "#f1f5f9",
      borderRadius: 12,
      padding: 18,
    }),
    // Projects
    blk("projects", "Projects", 55, 745, 684, 130, 10, {
      headingFontFamily: "Plus Jakarta Sans",
      headingFontSize: 11,
      headingFontWeight: 700,
      headingColor: "#2563eb",
      fontSize: 10.5,
      color: "#475569",
      accentColor: "#2563eb",
      backgroundColor: "#f8fafc",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#e2e8f0",
      padding: 18,
    }),
  ],
};

// ═══════════════════════════════════════════════════════════════
// 2. EXECUTIVE SUITE
// Dark sidebar, gold/amber accents, Playfair Display headings
// Prestige feel with sidebar initials monogram area
// ═══════════════════════════════════════════════════════════════
const executiveSuite: CanvasTemplate = {
  id: "executive-suite",
  name: "Executive Suite",
  description: "Dark sidebar with gold accents and prestige serif typography",
  category: "professional",
  accentColor: "#d4a574",
  previewGradient: "linear-gradient(135deg, #0a0a1a, #1a1a2e, #d4a574)",
  pageBackground: "#faf9f7",
  getBlocks: () => [
    // Sidebar background
    blk("panel", "Sidebar", 0, 0, 275, PAGE_H, 1, {
      backgroundColor: "#0f1117",
      padding: 0,
    }),
    // Sidebar gold accent strip
    blk("panel", "Gold Strip", 275, 0, 3, PAGE_H, 2, {
      backgroundColor: "#d4a574",
      padding: 0,
      opacity: 0.6,
    }),
    // Name in sidebar
    blk("header", "Name & Title", 22, 40, 230, 95, 10, {
      headingFontFamily: "Playfair Display",
      headingFontSize: 24,
      headingFontWeight: 700,
      headingColor: "#ffffff",
      subTextColor: "#d4a574",
      subTextSize: 11,
      accentColor: "#d4a574",
      textAlign: "center",
      padding: 10,
      letterSpacing: 1,
    }),
    // Decorative divider in sidebar
    blk("divider", "Gold Line", 60, 145, 155, 1, 5, {
      backgroundColor: "#d4a574",
      padding: 0,
      opacity: 0.4,
    }),
    // Contact
    blk("contact", "Contact Details", 22, 162, 230, 125, 10, {
      fontSize: 9.5,
      color: "#d1d5db",
      accentColor: "#d4a574",
      headingFontFamily: "Inter",
      headingFontSize: 8,
      headingFontWeight: 700,
      headingColor: "#d4a574",
      padding: 10,
      letterSpacing: 1.5,
    }),
    // Skills in sidebar
    blk("skills", "Core Competencies", 22, 302, 230, 185, 10, {
      headingFontFamily: "Inter",
      headingFontSize: 8,
      headingFontWeight: 700,
      headingColor: "#d4a574",
      fontSize: 9.5,
      color: "#e5e7eb",
      accentColor: "#d4a574",
      padding: 10,
      letterSpacing: 1.5,
    }),
    // Education in sidebar
    blk("education", "Education", 22, 502, 230, 160, 10, {
      headingFontFamily: "Inter",
      headingFontSize: 8,
      headingFontWeight: 700,
      headingColor: "#d4a574",
      fontSize: 9.5,
      color: "#d1d5db",
      subTextColor: "#9ca3af",
      subTextSize: 8.5,
      accentColor: "#d4a574",
      padding: 10,
      letterSpacing: 1.5,
    }),
    // Certifications in sidebar
    blk("certifications", "Credentials", 22, 678, 230, 120, 10, {
      headingFontFamily: "Inter",
      headingFontSize: 8,
      headingFontWeight: 700,
      headingColor: "#d4a574",
      fontSize: 9.5,
      color: "#d1d5db",
      accentColor: "#d4a574",
      padding: 10,
      letterSpacing: 1.5,
    }),
    // Main area — Summary
    blk("summary", "Executive Summary", 300, 42, 462, 88, 10, {
      headingFontFamily: "Playfair Display",
      headingFontSize: 18,
      headingFontWeight: 700,
      headingColor: "#1a1a2e",
      fontSize: 11.5,
      color: "#4b5563",
      lineHeight: 1.75,
      accentColor: "#d4a574",
      padding: 0,
    }),
    // Decorative main divider
    blk("divider", "Section Line", 300, 140, 462, 1, 5, {
      backgroundColor: "#d4a574",
      padding: 0,
      opacity: 0.25,
    }),
    // Experience
    blk("experience", "Career Experience", 300, 158, 462, 500, 10, {
      headingFontFamily: "Playfair Display",
      headingFontSize: 18,
      headingFontWeight: 700,
      headingColor: "#1a1a2e",
      fontSize: 11,
      color: "#4b5563",
      subTextColor: "#9ca3af",
      subTextSize: 10,
      lineHeight: 1.65,
      accentColor: "#d4a574",
      padding: 0,
    }),
    // Projects
    blk("projects", "Key Projects", 300, 675, 462, 130, 10, {
      headingFontFamily: "Playfair Display",
      headingFontSize: 18,
      headingFontWeight: 700,
      headingColor: "#1a1a2e",
      fontSize: 10.5,
      color: "#4b5563",
      accentColor: "#d4a574",
      padding: 0,
    }),
  ],
};

// ═══════════════════════════════════════════════════════════════
// 3. NORDIC FROST
// Maximum whitespace, steel blue-gray, ultra-thin dividers
// Inter 300 weight headings, generous margins, serene feel
// ═══════════════════════════════════════════════════════════════
const nordicFrost: CanvasTemplate = {
  id: "nordic-frost",
  name: "Nordic Frost",
  description: "Ultra-minimal with steel blue accents and generous whitespace",
  category: "minimal",
  accentColor: "#4a6fa5",
  previewGradient: "linear-gradient(135deg, #e8edf2, #4a6fa5, #2d4a6f)",
  pageBackground: "#f9fafb",
  getBlocks: () => [
    // Name — large, light weight
    blk("header", "Name", 72, 62, 650, 68, 10, {
      headingFontFamily: "Inter",
      headingFontSize: 38,
      headingFontWeight: 300,
      headingColor: "#1e293b",
      subTextColor: "#4a6fa5",
      subTextSize: 12,
      accentColor: "#4a6fa5",
      textAlign: "left",
      padding: 0,
      letterSpacing: 3,
    }),
    // Contact
    blk("contact", "Contact", 72, 136, 650, 22, 10, {
      fontSize: 9.5,
      color: "#94a3b8",
      accentColor: "#4a6fa5",
      padding: 0,
      letterSpacing: 0.8,
    }),
    // Hair-thin line
    blk("divider", "Line", 72, 170, 650, 1, 5, {
      backgroundColor: "#cbd5e1",
      padding: 0,
      opacity: 0.6,
    }),
    // Summary
    blk("summary", "Summary", 72, 190, 650, 70, 10, {
      headingFontSize: 8,
      headingFontWeight: 600,
      headingColor: "#4a6fa5",
      fontSize: 11,
      color: "#64748b",
      lineHeight: 1.85,
      padding: 0,
      accentColor: "#4a6fa5",
      letterSpacing: 0.3,
    }),
    // Experience — left
    blk("experience", "Experience", 72, 278, 385, 470, 10, {
      headingFontSize: 8,
      headingFontWeight: 600,
      headingColor: "#4a6fa5",
      fontSize: 10.5,
      color: "#475569",
      subTextColor: "#94a3b8",
      subTextSize: 9.5,
      lineHeight: 1.75,
      padding: 0,
      accentColor: "#4a6fa5",
      letterSpacing: 1.5,
    }),
    // Skills — right
    blk("skills", "Skills", 486, 278, 236, 148, 10, {
      headingFontSize: 8,
      headingFontWeight: 600,
      headingColor: "#4a6fa5",
      fontSize: 10,
      color: "#475569",
      accentColor: "#4a6fa5",
      padding: 0,
      letterSpacing: 1.5,
    }),
    // Education — right
    blk("education", "Education", 486, 445, 236, 148, 10, {
      headingFontSize: 8,
      headingFontWeight: 600,
      headingColor: "#4a6fa5",
      fontSize: 10.5,
      color: "#475569",
      subTextColor: "#94a3b8",
      subTextSize: 9.5,
      accentColor: "#4a6fa5",
      padding: 0,
      letterSpacing: 1.5,
    }),
    // Certifications — right
    blk("certifications", "Certifications", 486, 612, 236, 100, 10, {
      headingFontSize: 8,
      headingFontWeight: 600,
      headingColor: "#4a6fa5",
      fontSize: 9.5,
      color: "#475569",
      accentColor: "#4a6fa5",
      padding: 0,
      letterSpacing: 1.5,
    }),
    // Projects — full width bottom
    blk("projects", "Projects", 72, 768, 650, 120, 10, {
      headingFontSize: 8,
      headingFontWeight: 600,
      headingColor: "#4a6fa5",
      fontSize: 10,
      color: "#475569",
      accentColor: "#4a6fa5",
      padding: 0,
      letterSpacing: 1.5,
    }),
    // Bottom accent line
    blk("divider", "Footer Line", 72, 905, 650, 1, 5, {
      backgroundColor: "#4a6fa5",
      padding: 0,
      opacity: 0.3,
    }),
  ],
};

// ═══════════════════════════════════════════════════════════════
// 4. CREATIVE CORAL
// Indigo header band, coral accent pills, Poppins font
// Card-based sidebar, playful rounded shapes
// ═══════════════════════════════════════════════════════════════
const creativeCoral: CanvasTemplate = {
  id: "creative-coral",
  name: "Creative Coral",
  description: "Playful indigo header with coral accents and rounded cards",
  category: "creative",
  accentColor: "#f97066",
  previewGradient: "linear-gradient(135deg, #312e81, #f97066, #fca5a1)",
  pageBackground: "#fffbfa",
  getBlocks: () => [
    // Header band
    blk("panel", "Header Band", 0, 0, PAGE_W, 190, 1, {
      backgroundColor: "#1e1b4b",
      padding: 0,
    }),
    // Coral accent strip at bottom of header
    blk("panel", "Coral Accent", 0, 190, PAGE_W, 4, 2, {
      backgroundColor: "#f97066",
      padding: 0,
    }),
    // Name
    blk("header", "Name & Title", 52, 38, 690, 82, 10, {
      headingFontFamily: "Poppins",
      headingFontSize: 36,
      headingFontWeight: 700,
      headingColor: "#ffffff",
      subTextColor: "#f97066",
      subTextSize: 13,
      accentColor: "#f97066",
      textAlign: "left",
      padding: 0,
      letterSpacing: -0.3,
    }),
    // Contact
    blk("contact", "Contact", 52, 128, 690, 28, 10, {
      fontSize: 10.5,
      color: "#c7d2fe",
      accentColor: "#f97066",
      padding: 0,
    }),
    // Summary
    blk("summary", "About Me", 52, 218, 690, 75, 10, {
      headingFontFamily: "Poppins",
      headingFontSize: 13,
      headingFontWeight: 600,
      headingColor: "#1e1b4b",
      fontSize: 11.5,
      color: "#4b5563",
      lineHeight: 1.7,
      accentColor: "#f97066",
      padding: 0,
    }),
    // Experience — left
    blk("experience", "Experience", 52, 312, 415, 440, 10, {
      headingFontFamily: "Poppins",
      headingFontSize: 13,
      headingFontWeight: 600,
      headingColor: "#1e1b4b",
      fontSize: 10.5,
      color: "#4b5563",
      subTextColor: "#f97066",
      subTextSize: 9.5,
      lineHeight: 1.65,
      accentColor: "#f97066",
      padding: 0,
    }),
    // Skills card
    blk("skills", "Skills", 492, 312, 250, 160, 10, {
      headingFontFamily: "Poppins",
      headingFontSize: 13,
      headingFontWeight: 600,
      headingColor: "#1e1b4b",
      fontSize: 10,
      color: "#4b5563",
      accentColor: "#f97066",
      backgroundColor: "#fef2f2",
      borderRadius: 16,
      padding: 20,
    }),
    // Education card
    blk("education", "Education", 492, 490, 250, 155, 10, {
      headingFontFamily: "Poppins",
      headingFontSize: 13,
      headingFontWeight: 600,
      headingColor: "#1e1b4b",
      fontSize: 10.5,
      color: "#4b5563",
      subTextColor: "#9ca3af",
      subTextSize: 9.5,
      accentColor: "#f97066",
      backgroundColor: "#fef2f2",
      borderRadius: 16,
      padding: 20,
    }),
    // Certifications card
    blk("certifications", "Certifications", 492, 662, 250, 100, 10, {
      headingFontFamily: "Poppins",
      headingFontSize: 13,
      headingFontWeight: 600,
      headingColor: "#1e1b4b",
      fontSize: 9.5,
      color: "#4b5563",
      accentColor: "#f97066",
      backgroundColor: "#fef2f2",
      borderRadius: 16,
      padding: 20,
    }),
    // Projects full-width card
    blk("projects", "Projects", 52, 772, 690, 120, 10, {
      headingFontFamily: "Poppins",
      headingFontSize: 13,
      headingFontWeight: 600,
      headingColor: "#1e1b4b",
      fontSize: 10.5,
      color: "#4b5563",
      accentColor: "#f97066",
      backgroundColor: "#fef2f2",
      borderRadius: 16,
      padding: 20,
    }),
  ],
};

// ═══════════════════════════════════════════════════════════════
// 5. TECH TERMINAL
// Dark slate, neon green, JetBrains Mono, bordered cards
// Terminal-inspired section markers, code aesthetic
// ═══════════════════════════════════════════════════════════════
const techTerminal: CanvasTemplate = {
  id: "tech-terminal",
  name: "Tech Terminal",
  description: "Dark theme with neon green accents and monospace typography",
  category: "bold",
  accentColor: "#34d399",
  previewGradient: "linear-gradient(135deg, #020617, #0f172a, #34d399)",
  pageBackground: "#0f172a",
  getBlocks: () => [
    // Top neon line
    blk("panel", "Neon Line", 0, 0, PAGE_W, 2, 2, {
      backgroundColor: "#34d399",
      padding: 0,
      opacity: 0.7,
    }),
    // Identity
    blk("header", "$ whoami", 48, 32, 698, 78, 10, {
      headingFontFamily: "JetBrains Mono",
      headingFontSize: 34,
      headingFontWeight: 700,
      headingColor: "#e2e8f0",
      subTextColor: "#34d399",
      subTextSize: 12,
      accentColor: "#34d399",
      padding: 0,
      letterSpacing: -0.5,
    }),
    // Links
    blk("contact", "$ cat contact.txt", 48, 116, 698, 24, 10, {
      fontFamily: "JetBrains Mono",
      fontSize: 9.5,
      color: "#64748b",
      accentColor: "#34d399",
      padding: 0,
    }),
    // Divider
    blk("divider", "---", 48, 150, 698, 1, 5, {
      backgroundColor: "#1e293b",
      padding: 0,
    }),
    // Summary
    blk("summary", "// README.md", 48, 168, 698, 75, 10, {
      headingFontFamily: "JetBrains Mono",
      headingFontSize: 11,
      headingFontWeight: 700,
      headingColor: "#34d399",
      fontSize: 10.5,
      fontFamily: "Inter",
      color: "#94a3b8",
      lineHeight: 1.75,
      accentColor: "#34d399",
      padding: 0,
    }),
    // Experience — left
    blk("experience", "// work-history.log", 48, 260, 425, 460, 10, {
      headingFontFamily: "JetBrains Mono",
      headingFontSize: 11,
      headingFontWeight: 700,
      headingColor: "#34d399",
      fontSize: 10.5,
      color: "#cbd5e1",
      subTextColor: "#64748b",
      subTextSize: 9.5,
      lineHeight: 1.65,
      accentColor: "#34d399",
      padding: 0,
    }),
    // Tech Stack card
    blk("skills", "// tech-stack.json", 498, 260, 248, 180, 10, {
      headingFontFamily: "JetBrains Mono",
      headingFontSize: 11,
      headingFontWeight: 700,
      headingColor: "#34d399",
      fontFamily: "JetBrains Mono",
      fontSize: 9.5,
      color: "#e2e8f0",
      accentColor: "#34d399",
      backgroundColor: "#1e293b",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#334155",
      padding: 16,
    }),
    // Education card
    blk("education", "// education.md", 498, 460, 248, 145, 10, {
      headingFontFamily: "JetBrains Mono",
      headingFontSize: 11,
      headingFontWeight: 700,
      headingColor: "#34d399",
      fontSize: 10.5,
      color: "#cbd5e1",
      subTextColor: "#64748b",
      subTextSize: 9.5,
      accentColor: "#34d399",
      backgroundColor: "#1e293b",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#334155",
      padding: 16,
    }),
    // Projects card
    blk("projects", "// projects.git", 498, 625, 248, 125, 10, {
      headingFontFamily: "JetBrains Mono",
      headingFontSize: 11,
      headingFontWeight: 700,
      headingColor: "#34d399",
      fontSize: 9.5,
      color: "#cbd5e1",
      accentColor: "#34d399",
      backgroundColor: "#1e293b",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#334155",
      padding: 16,
    }),
    // Certifications
    blk("certifications", "// certs.txt", 48, 740, 425, 100, 10, {
      headingFontFamily: "JetBrains Mono",
      headingFontSize: 11,
      headingFontWeight: 700,
      headingColor: "#34d399",
      fontSize: 9.5,
      color: "#cbd5e1",
      accentColor: "#34d399",
      backgroundColor: "#1e293b",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#334155",
      padding: 16,
    }),
    // Bottom neon line
    blk("panel", "Bottom Neon", 0, PAGE_H - 2, PAGE_W, 2, 2, {
      backgroundColor: "#34d399",
      padding: 0,
      opacity: 0.4,
    }),
  ],
};

// ═══════════════════════════════════════════════════════════════
// 6. ELEGANT SERIF
// Cream paper, burgundy accents, Cormorant Garamond headings
// Centered ornamental dividers, classic timeless feel
// ═══════════════════════════════════════════════════════════════
const elegantSerif: CanvasTemplate = {
  id: "elegant-serif",
  name: "Elegant Serif",
  description: "Cream tones with burgundy accents and timeless serif typography",
  category: "professional",
  accentColor: "#7f1d1d",
  previewGradient: "linear-gradient(135deg, #fef3c7, #92400e, #7f1d1d)",
  pageBackground: "#fdfdf5",
  getBlocks: () => [
    // Name — centered, large serif
    blk("header", "Name", 62, 52, 670, 78, 10, {
      headingFontFamily: "Cormorant Garamond",
      headingFontSize: 44,
      headingFontWeight: 600,
      headingColor: "#1c1917",
      subTextColor: "#7f1d1d",
      subTextSize: 12,
      accentColor: "#7f1d1d",
      textAlign: "center",
      padding: 0,
      letterSpacing: 4,
    }),
    // Contact — centered
    blk("contact", "Contact", 62, 136, 670, 24, 10, {
      fontSize: 9.5,
      color: "#78716c",
      accentColor: "#7f1d1d",
      textAlign: "center",
      padding: 0,
      letterSpacing: 1.5,
    }),
    // Ornamental divider
    blk("divider", "Ornament", 297, 172, 200, 2, 5, {
      backgroundColor: "#7f1d1d",
      padding: 0,
      borderRadius: 1,
      opacity: 0.5,
    }),
    // Summary — centered
    blk("summary", "Profile", 62, 192, 670, 78, 10, {
      headingFontFamily: "Cormorant Garamond",
      headingFontSize: 17,
      headingFontWeight: 600,
      headingColor: "#7f1d1d",
      fontFamily: "EB Garamond",
      fontSize: 11.5,
      color: "#57534e",
      lineHeight: 1.8,
      accentColor: "#7f1d1d",
      textAlign: "center",
      padding: 0,
      letterSpacing: 0.3,
    }),
    // Second ornamental divider
    blk("divider", "Ornament 2", 297, 282, 200, 1, 5, {
      backgroundColor: "#d6d3d1",
      padding: 0,
    }),
    // Experience — left
    blk("experience", "Experience", 62, 302, 395, 470, 10, {
      headingFontFamily: "Cormorant Garamond",
      headingFontSize: 17,
      headingFontWeight: 600,
      headingColor: "#7f1d1d",
      fontFamily: "EB Garamond",
      fontSize: 11.5,
      color: "#44403c",
      subTextColor: "#a8a29e",
      subTextSize: 10,
      lineHeight: 1.7,
      accentColor: "#7f1d1d",
      padding: 0,
      letterSpacing: 2,
    }),
    // Skills — right, bordered
    blk("skills", "Expertise", 487, 302, 245, 162, 10, {
      headingFontFamily: "Cormorant Garamond",
      headingFontSize: 17,
      headingFontWeight: 600,
      headingColor: "#7f1d1d",
      fontSize: 10.5,
      color: "#44403c",
      accentColor: "#7f1d1d",
      borderWidth: 1,
      borderColor: "#d6d3d1",
      borderRadius: 0,
      padding: 18,
      letterSpacing: 2,
    }),
    // Education — right, bordered
    blk("education", "Education", 487, 482, 245, 155, 10, {
      headingFontFamily: "Cormorant Garamond",
      headingFontSize: 17,
      headingFontWeight: 600,
      headingColor: "#7f1d1d",
      fontFamily: "EB Garamond",
      fontSize: 11,
      color: "#44403c",
      subTextColor: "#a8a29e",
      subTextSize: 9.5,
      accentColor: "#7f1d1d",
      borderWidth: 1,
      borderColor: "#d6d3d1",
      borderRadius: 0,
      padding: 18,
      letterSpacing: 2,
    }),
    // Certifications
    blk("certifications", "Credentials", 487, 655, 245, 115, 10, {
      headingFontFamily: "Cormorant Garamond",
      headingFontSize: 17,
      headingFontWeight: 600,
      headingColor: "#7f1d1d",
      fontSize: 10.5,
      color: "#44403c",
      accentColor: "#7f1d1d",
      borderWidth: 1,
      borderColor: "#d6d3d1",
      borderRadius: 0,
      padding: 18,
      letterSpacing: 2,
    }),
    // Projects — full width bottom
    blk("projects", "Notable Projects", 62, 792, 670, 110, 10, {
      headingFontFamily: "Cormorant Garamond",
      headingFontSize: 17,
      headingFontWeight: 600,
      headingColor: "#7f1d1d",
      fontFamily: "EB Garamond",
      fontSize: 11,
      color: "#44403c",
      accentColor: "#7f1d1d",
      borderWidth: 1,
      borderColor: "#d6d3d1",
      borderRadius: 0,
      padding: 18,
      letterSpacing: 2,
    }),
  ],
};

// ═══════════════════════════════════════════════════════════════
// 7. BOLD IMPACT
// Black header band, massive Space Grotesk type, electric blue
// High contrast, geometric feel, strong visual hierarchy
// ═══════════════════════════════════════════════════════════════
const boldImpact: CanvasTemplate = {
  id: "bold-impact",
  name: "Bold Impact",
  description: "High-contrast black header with massive typography and electric blue",
  category: "bold",
  accentColor: "#2563eb",
  previewGradient: "linear-gradient(135deg, #000000, #111827, #2563eb)",
  pageBackground: "#ffffff",
  getBlocks: () => [
    // Black header band
    blk("panel", "Header Band", 0, 0, PAGE_W, 195, 1, {
      backgroundColor: "#000000",
      padding: 0,
    }),
    // Blue accent bar under header
    blk("panel", "Blue Bar", 0, 195, PAGE_W, 4, 2, {
      backgroundColor: "#2563eb",
      padding: 0,
    }),
    // Massive name
    blk("header", "Name", 52, 28, 690, 108, 10, {
      headingFontFamily: "Space Grotesk",
      headingFontSize: 54,
      headingFontWeight: 800,
      headingColor: "#ffffff",
      subTextColor: "#2563eb",
      subTextSize: 15,
      accentColor: "#2563eb",
      padding: 0,
      letterSpacing: -1.5,
    }),
    // Contact
    blk("contact", "Contact", 52, 145, 690, 26, 10, {
      fontSize: 10.5,
      color: "#94a3b8",
      accentColor: "#2563eb",
      padding: 0,
    }),
    // Summary
    blk("summary", "Summary", 52, 222, 690, 75, 10, {
      headingFontFamily: "Space Grotesk",
      headingFontSize: 12,
      headingFontWeight: 700,
      headingColor: "#000000",
      fontSize: 11.5,
      color: "#4b5563",
      lineHeight: 1.7,
      accentColor: "#2563eb",
      padding: 0,
      letterSpacing: 2,
    }),
    // Blue divider
    blk("divider", "Divider", 52, 310, 690, 3, 5, {
      backgroundColor: "#2563eb",
      padding: 0,
    }),
    // Experience — left
    blk("experience", "Experience", 52, 330, 428, 430, 10, {
      headingFontFamily: "Space Grotesk",
      headingFontSize: 13,
      headingFontWeight: 700,
      headingColor: "#000000",
      fontSize: 10.5,
      color: "#374151",
      subTextColor: "#2563eb",
      subTextSize: 9.5,
      lineHeight: 1.65,
      accentColor: "#2563eb",
      padding: 0,
      letterSpacing: 2,
    }),
    // Skills — right, blue-bordered
    blk("skills", "Skills", 508, 330, 234, 168, 10, {
      headingFontFamily: "Space Grotesk",
      headingFontSize: 12,
      headingFontWeight: 700,
      headingColor: "#000000",
      fontSize: 10,
      color: "#1f2937",
      accentColor: "#2563eb",
      backgroundColor: "#eff6ff",
      borderRadius: 0,
      borderWidth: 2,
      borderColor: "#2563eb",
      padding: 18,
      letterSpacing: 2,
    }),
    // Education
    blk("education", "Education", 508, 516, 234, 148, 10, {
      headingFontFamily: "Space Grotesk",
      headingFontSize: 12,
      headingFontWeight: 700,
      headingColor: "#000000",
      fontSize: 10.5,
      color: "#374151",
      subTextColor: "#6b7280",
      subTextSize: 9.5,
      accentColor: "#2563eb",
      padding: 0,
      letterSpacing: 2,
    }),
    // Certifications
    blk("certifications", "Certifications", 508, 682, 234, 78, 10, {
      headingFontFamily: "Space Grotesk",
      headingFontSize: 12,
      headingFontWeight: 700,
      headingColor: "#000000",
      fontSize: 9.5,
      color: "#374151",
      accentColor: "#2563eb",
      padding: 0,
      letterSpacing: 2,
    }),
    // Projects — full width bottom
    blk("projects", "Projects", 52, 782, 690, 115, 10, {
      headingFontFamily: "Space Grotesk",
      headingFontSize: 12,
      headingFontWeight: 700,
      headingColor: "#000000",
      fontSize: 10.5,
      color: "#374151",
      accentColor: "#2563eb",
      backgroundColor: "#f9fafb",
      borderRadius: 0,
      borderWidth: 2,
      borderColor: "#e5e7eb",
      padding: 18,
      letterSpacing: 2,
    }),
  ],
};

// ═══════════════════════════════════════════════════════════════
// 8. GRADIENT PRO
// Purple-to-indigo gradient header, floating white cards
// Plus Jakarta Sans, modern rounded shapes, subtle shadows
// ═══════════════════════════════════════════════════════════════
const gradientPro: CanvasTemplate = {
  id: "gradient-pro",
  name: "Gradient Pro",
  description: "Purple gradient header with floating white cards and modern feel",
  category: "creative",
  accentColor: "#7c3aed",
  previewGradient: "linear-gradient(135deg, #7c3aed, #4f46e5, #3b82f6)",
  pageBackground: "#f5f3ff",
  getBlocks: () => [
    // Gradient header background
    blk("panel", "Header Gradient", 0, 0, PAGE_W, 205, 1, {
      backgroundColor: "#4c1d95",
      padding: 0,
    }),
    // Name & Role
    blk("header", "Name & Role", 52, 38, 690, 88, 10, {
      headingFontFamily: "Plus Jakarta Sans",
      headingFontSize: 38,
      headingFontWeight: 800,
      headingColor: "#ffffff",
      subTextColor: "#c4b5fd",
      subTextSize: 13,
      accentColor: "#a78bfa",
      padding: 0,
      letterSpacing: -0.5,
    }),
    // Contact
    blk("contact", "Contact", 52, 134, 690, 28, 10, {
      fontSize: 10.5,
      color: "#ddd6fe",
      accentColor: "#a78bfa",
      padding: 0,
    }),
    // Summary floating card
    blk("summary", "Summary", 42, 222, 710, 80, 10, {
      headingFontFamily: "Plus Jakarta Sans",
      headingFontSize: 12,
      headingFontWeight: 700,
      headingColor: "#4c1d95",
      fontSize: 11.5,
      color: "#4b5563",
      lineHeight: 1.7,
      accentColor: "#7c3aed",
      backgroundColor: "#ffffff",
      borderRadius: 16,
      padding: 22,
    }),
    // Experience floating card
    blk("experience", "Experience", 42, 320, 428, 430, 10, {
      headingFontFamily: "Plus Jakarta Sans",
      headingFontSize: 13,
      headingFontWeight: 700,
      headingColor: "#4c1d95",
      fontSize: 10.5,
      color: "#4b5563",
      subTextColor: "#7c3aed",
      subTextSize: 9.5,
      lineHeight: 1.65,
      accentColor: "#7c3aed",
      backgroundColor: "#ffffff",
      borderRadius: 16,
      padding: 22,
    }),
    // Skills floating card
    blk("skills", "Skills", 490, 320, 262, 165, 10, {
      headingFontFamily: "Plus Jakarta Sans",
      headingFontSize: 12,
      headingFontWeight: 700,
      headingColor: "#4c1d95",
      fontSize: 10,
      color: "#4b5563",
      accentColor: "#7c3aed",
      backgroundColor: "#ffffff",
      borderRadius: 16,
      padding: 20,
    }),
    // Education floating card
    blk("education", "Education", 490, 502, 262, 148, 10, {
      headingFontFamily: "Plus Jakarta Sans",
      headingFontSize: 12,
      headingFontWeight: 700,
      headingColor: "#4c1d95",
      fontSize: 10.5,
      color: "#4b5563",
      subTextColor: "#9ca3af",
      subTextSize: 9.5,
      accentColor: "#7c3aed",
      backgroundColor: "#ffffff",
      borderRadius: 16,
      padding: 20,
    }),
    // Certifications floating card
    blk("certifications", "Certifications", 490, 668, 262, 82, 10, {
      headingFontFamily: "Plus Jakarta Sans",
      headingFontSize: 12,
      headingFontWeight: 700,
      headingColor: "#4c1d95",
      fontSize: 9.5,
      color: "#4b5563",
      accentColor: "#7c3aed",
      backgroundColor: "#ffffff",
      borderRadius: 16,
      padding: 20,
    }),
    // Projects floating card
    blk("projects", "Projects", 42, 770, 710, 115, 10, {
      headingFontFamily: "Plus Jakarta Sans",
      headingFontSize: 12,
      headingFontWeight: 700,
      headingColor: "#4c1d95",
      fontSize: 10.5,
      color: "#4b5563",
      accentColor: "#7c3aed",
      backgroundColor: "#ffffff",
      borderRadius: 16,
      padding: 22,
    }),
  ],
};

// ═══════════════════════════════════════════════════════════════
// 9. NEO BRUTALISM
// Thick black borders, vibrant yellow background, stark contrast
// High-energy, disruptive, confident aesthetic
// ═══════════════════════════════════════════════════════════════
const neoBrutalism: CanvasTemplate = {
  id: "neo-brutalism",
  name: "Neo Brutalism",
  description: "High contrast with thick borders and vibrant yellow accents",
  category: "bold",
  accentColor: "#000000",
  previewGradient: "linear-gradient(135deg, #fbbf24, #f59e0b, #000000)",
  pageBackground: "#fef3c7",
  getBlocks: () => [
    // Name & Role - Massive block
    blk("header", "Name & Role", 40, 40, 714, 110, 10, {
      headingFontFamily: "Space Grotesk",
      headingFontSize: 46,
      headingFontWeight: 900,
      headingColor: "#000000",
      subTextColor: "#000000",
      subTextSize: 16,
      accentColor: "#000000",
      backgroundColor: "#ffffff",
      borderWidth: 4,
      borderColor: "#000000",
      borderRadius: 0,
      padding: 24,
      letterSpacing: -1,
    }),
    // Contact Bar
    blk("contact", "Contact", 40, 170, 714, 40, 10, {
      fontFamily: "Space Grotesk",
      fontSize: 12,
      color: "#000000",
      accentColor: "#000000",
      backgroundColor: "#ffffff",
      borderWidth: 3,
      borderColor: "#000000",
      borderRadius: 0,
      padding: 12,
    }),
    // Summary
    blk("summary", "Summary", 40, 230, 450, 140, 10, {
      headingFontFamily: "Space Grotesk",
      headingFontSize: 16,
      headingFontWeight: 800,
      headingColor: "#ffffff",
      fontSize: 12,
      color: "#000000",
      lineHeight: 1.6,
      accentColor: "#ffffff",
      backgroundColor: "#3b82f6", // Bright blue box
      borderWidth: 3,
      borderColor: "#000000",
      borderRadius: 0,
      padding: 20,
    }),
    // Skills
    blk("skills", "Skills", 510, 230, 244, 140, 10, {
      headingFontFamily: "Space Grotesk",
      headingFontSize: 16,
      headingFontWeight: 800,
      headingColor: "#ffffff",
      fontSize: 11,
      color: "#000000",
      accentColor: "#ffffff",
      backgroundColor: "#ef4444", // Bright red box
      borderWidth: 3,
      borderColor: "#000000",
      borderRadius: 0,
      padding: 20,
    }),
    // Experience
    blk("experience", "Experience", 40, 390, 450, 480, 10, {
      headingFontFamily: "Space Grotesk",
      headingFontSize: 16,
      headingFontWeight: 800,
      headingColor: "#000000",
      fontSize: 11.5,
      color: "#000000",
      subTextColor: "#000000",
      subTextSize: 10,
      lineHeight: 1.5,
      accentColor: "#000000",
      backgroundColor: "#ffffff",
      borderWidth: 3,
      borderColor: "#000000",
      borderRadius: 0,
      padding: 24,
    }),
    // Education
    blk("education", "Education", 510, 390, 244, 230, 10, {
      headingFontFamily: "Space Grotesk",
      headingFontSize: 16,
      headingFontWeight: 800,
      headingColor: "#000000",
      fontSize: 11,
      color: "#000000",
      subTextColor: "#000000",
      subTextSize: 10,
      accentColor: "#000000",
      backgroundColor: "#ffffff",
      borderWidth: 3,
      borderColor: "#000000",
      borderRadius: 0,
      padding: 20,
    }),
    // Projects
    blk("projects", "Projects", 510, 640, 244, 230, 10, {
      headingFontFamily: "Space Grotesk",
      headingFontSize: 16,
      headingFontWeight: 800,
      headingColor: "#000000",
      fontSize: 11,
      color: "#000000",
      accentColor: "#000000",
      backgroundColor: "#ffffff",
      borderWidth: 3,
      borderColor: "#000000",
      borderRadius: 0,
      padding: 20,
    }),
  ],
};

// ═══════════════════════════════════════════════════════════════
// 10. EDITORIAL CHIC
// High-fashion magazine style, huge serif fonts, stark minimal
// ═══════════════════════════════════════════════════════════════
const editorialChic: CanvasTemplate = {
  id: "editorial-chic",
  name: "Editorial Chic",
  description: "High-fashion magazine layout with dramatic serif typography",
  category: "creative",
  accentColor: "#111827",
  previewGradient: "linear-gradient(135deg, #ffffff, #e5e7eb, #9ca3af)",
  pageBackground: "#ffffff",
  getBlocks: () => [
    // Massive Name
    blk("header", "Name & Title", 40, 40, 714, 120, 10, {
      headingFontFamily: "Cormorant Garamond",
      headingFontSize: 56,
      headingFontWeight: 700,
      headingColor: "#111827",
      subTextColor: "#6b7280",
      subTextSize: 14,
      accentColor: "#111827",
      textAlign: "center",
      padding: 0,
      letterSpacing: -1,
    }),
    // Thin full-width divider
    blk("divider", "Divider", 40, 170, 714, 1, 5, {
      backgroundColor: "#111827",
      padding: 0,
    }),
    // Contact - Centered
    blk("contact", "Contact", 40, 185, 714, 20, 10, {
      fontFamily: "Inter",
      fontSize: 9,
      color: "#4b5563",
      accentColor: "#111827",
      textAlign: "center",
      padding: 0,
      letterSpacing: 2,
    }),
    // Thin full-width divider 2
    blk("divider", "Divider 2", 40, 215, 714, 1, 5, {
      backgroundColor: "#111827",
      padding: 0,
    }),
    // Summary
    blk("summary", "Profile", 150, 240, 494, 90, 10, {
      headingFontFamily: "Cormorant Garamond",
      headingFontSize: 16,
      headingFontWeight: 700,
      headingColor: "#111827",
      fontSize: 12,
      color: "#374151",
      lineHeight: 1.8,
      accentColor: "#111827",
      textAlign: "center",
      padding: 0,
    }),
    // Left column: Experience
    blk("experience", "Experience", 40, 360, 340, 600, 10, {
      headingFontFamily: "Cormorant Garamond",
      headingFontSize: 20,
      headingFontWeight: 700,
      headingColor: "#111827",
      fontSize: 11,
      color: "#374151",
      subTextColor: "#6b7280",
      subTextSize: 10,
      lineHeight: 1.6,
      accentColor: "#111827",
      padding: 0,
    }),
    // Center vertical divider
    blk("divider", "Vertical Divider", 396, 360, 1, 600, 5, {
      backgroundColor: "#e5e7eb",
      padding: 0,
    }),
    // Right column: Education
    blk("education", "Education", 414, 360, 340, 200, 10, {
      headingFontFamily: "Cormorant Garamond",
      headingFontSize: 20,
      headingFontWeight: 700,
      headingColor: "#111827",
      fontSize: 11,
      color: "#374151",
      subTextColor: "#6b7280",
      subTextSize: 10,
      accentColor: "#111827",
      padding: 0,
    }),
    // Right column: Skills
    blk("skills", "Expertise", 414, 580, 340, 180, 10, {
      headingFontFamily: "Cormorant Garamond",
      headingFontSize: 20,
      headingFontWeight: 700,
      headingColor: "#111827",
      fontSize: 10,
      color: "#374151",
      accentColor: "#111827",
      padding: 0,
    }),
    // Right column: Projects
    blk("projects", "Projects", 414, 780, 340, 180, 10, {
      headingFontFamily: "Cormorant Garamond",
      headingFontSize: 20,
      headingFontWeight: 700,
      headingColor: "#111827",
      fontSize: 11,
      color: "#374151",
      accentColor: "#111827",
      padding: 0,
    }),
  ],
};

// ═══════════════════════════════════════════════════════════════
// 11. AURORA GLASS
// Soft translucent blocks, beautiful gradient background, modern
// ═══════════════════════════════════════════════════════════════
const auroraGlass: CanvasTemplate = {
  id: "aurora-glass",
  name: "Aurora Glass",
  description: "Modern glassmorphism with soft ambient gradients and clean typography",
  category: "creative",
  accentColor: "#8b5cf6",
  previewGradient: "linear-gradient(135deg, #1e1b4b, #4c1d95, #2563eb)",
  // We use a CSS gradient string for the canvas background here
  pageBackground: "linear-gradient(135deg, #f0fdfa, #fdf4ff, #eff6ff)",
  getBlocks: () => [
    // Header Block
    blk("header", "Name & Title", 40, 40, 714, 100, 10, {
      headingFontFamily: "Outfit",
      headingFontSize: 42,
      headingFontWeight: 700,
      headingColor: "#1e1b4b",
      subTextColor: "#6d28d9",
      subTextSize: 14,
      accentColor: "#8b5cf6",
      backgroundColor: "rgba(255, 255, 255, 0.6)",
      borderRadius: 24,
      padding: 24,
      textAlign: "center",
      letterSpacing: -0.5,
    }),
    // Contact Block
    blk("contact", "Contact", 40, 155, 714, 30, 10, {
      fontFamily: "Outfit",
      fontSize: 10,
      color: "#4c1d95",
      accentColor: "#8b5cf6",
      backgroundColor: "rgba(255, 255, 255, 0.6)",
      borderRadius: 16,
      padding: 8,
      textAlign: "center",
    }),
    // Summary Block
    blk("summary", "Summary", 40, 200, 714, 90, 10, {
      headingFontFamily: "Outfit",
      headingFontSize: 14,
      headingFontWeight: 600,
      headingColor: "#4c1d95",
      fontSize: 11.5,
      color: "#334155",
      lineHeight: 1.7,
      accentColor: "#8b5cf6",
      backgroundColor: "rgba(255, 255, 255, 0.6)",
      borderRadius: 24,
      padding: 20,
    }),
    // Left Col: Experience
    blk("experience", "Experience", 40, 305, 460, 650, 10, {
      headingFontFamily: "Outfit",
      headingFontSize: 14,
      headingFontWeight: 600,
      headingColor: "#4c1d95",
      fontSize: 11,
      color: "#334155",
      subTextColor: "#6d28d9",
      subTextSize: 10,
      lineHeight: 1.6,
      accentColor: "#8b5cf6",
      backgroundColor: "rgba(255, 255, 255, 0.6)",
      borderRadius: 24,
      padding: 24,
    }),
    // Right Col: Skills
    blk("skills", "Skills", 515, 305, 239, 200, 10, {
      headingFontFamily: "Outfit",
      headingFontSize: 14,
      headingFontWeight: 600,
      headingColor: "#4c1d95",
      fontSize: 10,
      color: "#334155",
      accentColor: "#8b5cf6",
      backgroundColor: "rgba(255, 255, 255, 0.6)",
      borderRadius: 24,
      padding: 20,
    }),
    // Right Col: Education
    blk("education", "Education", 515, 520, 239, 210, 10, {
      headingFontFamily: "Outfit",
      headingFontSize: 14,
      headingFontWeight: 600,
      headingColor: "#4c1d95",
      fontSize: 11,
      color: "#334155",
      subTextColor: "#6d28d9",
      subTextSize: 10,
      accentColor: "#8b5cf6",
      backgroundColor: "rgba(255, 255, 255, 0.6)",
      borderRadius: 24,
      padding: 20,
    }),
    // Right Col: Projects
    blk("projects", "Projects", 515, 745, 239, 210, 10, {
      headingFontFamily: "Outfit",
      headingFontSize: 14,
      headingFontWeight: 600,
      headingColor: "#4c1d95",
      fontSize: 10.5,
      color: "#334155",
      accentColor: "#8b5cf6",
      backgroundColor: "rgba(255, 255, 255, 0.6)",
      borderRadius: 24,
      padding: 20,
    }),
  ],
};

// ── Export registry ──────────────────────────────────────────
export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  modernElegance,
  executiveSuite,
  nordicFrost,
  creativeCoral,
  techTerminal,
  elegantSerif,
  boldImpact,
  gradientPro,
  neoBrutalism,
  editorialChic,
  auroraGlass,
];

export function getCanvasTemplate(id: string): CanvasTemplate | undefined {
  return CANVAS_TEMPLATES.find((t) => t.id === id);
}
