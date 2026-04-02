import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

// ── Block Style ──────────────────────────────────────────────
export interface BlockStyle {
  backgroundColor: string;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  padding: number;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  textAlign: "left" | "center" | "right";
  lineHeight: number;
  letterSpacing: number;
  opacity: number;
  headingFontFamily: string;
  headingFontSize: number;
  headingFontWeight: number;
  headingColor: string;
  subTextColor: string;
  subTextSize: number;
  accentColor: string;
}

export const DEFAULT_BLOCK_STYLE: BlockStyle = {
  backgroundColor: "transparent",
  borderRadius: 0,
  borderWidth: 0,
  borderColor: "#e5e7eb",
  padding: 16,
  fontFamily: "Inter",
  fontSize: 13,
  fontWeight: 400,
  color: "#374151",
  textAlign: "left",
  lineHeight: 1.6,
  letterSpacing: 0,
  opacity: 1,
  headingFontFamily: "Inter",
  headingFontSize: 20,
  headingFontWeight: 700,
  headingColor: "#111827",
  subTextColor: "#6b7280",
  subTextSize: 11,
  accentColor: "#2563eb",
};

// ── Block Types ──────────────────────────────────────────────
export type BlockType =
  | "header"
  | "contact"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "divider"
  | "panel";

export interface CanvasBlock {
  id: string;
  type: BlockType;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  locked: boolean;
  visible: boolean;
  style: BlockStyle;
  /** Which page this block lives on (0-indexed). Defaults to 0 */
  page?: number;
}

// ── Page constants ───────────────────────────────────────────
export const PAGE_W = 794;
export const PAGE_H = 1123;
export const PAGE_GAP = 40; // visual gap between pages

// ── Store ────────────────────────────────────────────────────
interface CanvasState {
  blocks: CanvasBlock[];
  selectedBlockIds: string[];
  editingBlockId: string | null;
  zoom: number;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  pageBackground: string;
  activeTemplateId: string;
  history: CanvasBlock[][];
  historyIndex: number;
  isDragging: boolean;
  isResizing: boolean;

  /** Clipboard for copy/paste */
  clipboard: CanvasBlock[];

  /** Total number of pages */
  pageCount: number;
  /** Currently active/viewed page (0-indexed) */
  currentPage: number;

  selectBlock: (id: string | null, multi?: boolean) => void;
  selectAllBlocks: () => void;
  clearSelection: () => void;
  setEditingBlock: (id: string | null) => void;
  moveBlock: (id: string, x: number, y: number) => void;
  moveSelectedBlocks: (dx: number, dy: number) => void;
  resizeBlock: (id: string, w: number, h: number, x?: number, y?: number) => void;
  updateBlockStyle: (id: string, style: Partial<BlockStyle>) => void;
  updateBlockLabel: (id: string, label: string) => void;
  setBlockVisibility: (id: string, visible: boolean) => void;
  setBlockLocked: (id: string, locked: boolean) => void;
  addBlock: (block: Partial<CanvasBlock> & { type: BlockType }) => void;
  removeBlock: (id: string) => void;
  removeSelectedBlocks: () => void;
  duplicateBlock: (id: string) => void;
  duplicateSelectedBlocks: () => void;
  copySelectedBlocks: () => void;
  pasteBlocks: () => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  setBlocks: (blocks: CanvasBlock[]) => void;
  setPageBackground: (bg: string) => void;
  setZoom: (z: number) => void;
  toggleGrid: () => void;
  toggleSnap: () => void;
  setDragging: (v: boolean) => void;
  setResizing: (v: boolean) => void;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  applyTemplate: (id: string, blocks: CanvasBlock[], bg: string) => void;
  alignSelected: (dir: "left" | "center" | "right" | "top" | "middle" | "bottom") => void;
  autoLayout: () => void;

  /** Page management */
  setCurrentPage: (page: number) => void;
  addPage: () => void;
  removePage: (page: number) => void;
  moveBlockToPage: (blockId: string, targetPage: number) => void;
  getBlocksForPage: (page: number) => CanvasBlock[];
}

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set, get) => ({
      blocks: [],
      selectedBlockIds: [],
      editingBlockId: null,
      zoom: 80,
      showGrid: false,
      snapToGrid: true,
      gridSize: 8,
      pageBackground: "#ffffff",
      activeTemplateId: "modern-elegance",
      history: [],
      historyIndex: -1,
      isDragging: false,
      isResizing: false,
      clipboard: [],
      pageCount: 1,
      currentPage: 0,

  selectBlock: (id, multi) => {
    if (id === null) {
      set({ selectedBlockIds: [], editingBlockId: null });
      return;
    }
    set((s) => {
      if (multi) {
        if (s.selectedBlockIds.includes(id)) {
          return { selectedBlockIds: s.selectedBlockIds.filter(i => i !== id), editingBlockId: null };
        }
        return { selectedBlockIds: [...s.selectedBlockIds, id], editingBlockId: null };
      }
      return { selectedBlockIds: [id], editingBlockId: null };
    });
  },

  selectAllBlocks: () => {
    set((s) => ({ selectedBlockIds: s.blocks.map((b) => b.id), editingBlockId: null }));
  },

  clearSelection: () => set({ selectedBlockIds: [], editingBlockId: null }),

  setEditingBlock: (id) => set((s) => ({ editingBlockId: id, selectedBlockIds: id ? [id] : s.selectedBlockIds })),

  moveBlock: (id, x, y) => {
    const { snapToGrid, gridSize } = get();
    const sx = snapToGrid ? Math.round(x / gridSize) * gridSize : x;
    const sy = snapToGrid ? Math.round(y / gridSize) * gridSize : y;
    set((s) => ({
      blocks: s.blocks.map((b) => {
        if (b.id === id && !b.locked) {
          const nx = Math.max(0, Math.min(sx, PAGE_W - b.width));
          const ny = Math.max(0, Math.min(sy, PAGE_H - b.height));
          return { ...b, x: nx, y: ny };
        }
        return b;
      }),
    }));
  },

  moveSelectedBlocks: (dx, dy) => {
    const { snapToGrid, gridSize, selectedBlockIds } = get();
    set((s) => ({
      blocks: s.blocks.map((b) => {
        if (selectedBlockIds.includes(b.id) && !b.locked) {
          const nx = b.x + dx;
          const ny = b.y + dy;
          let sx = snapToGrid ? Math.round(nx / gridSize) * gridSize : nx;
          let sy = snapToGrid ? Math.round(ny / gridSize) * gridSize : ny;
          sx = Math.max(0, Math.min(sx, PAGE_W - b.width));
          sy = Math.max(0, Math.min(sy, PAGE_H - b.height));
          return { ...b, x: sx, y: sy };
        }
        return b;
      }),
    }));
  },

  resizeBlock: (id, w, h, x, y) => {
    set((s) => ({
      blocks: s.blocks.map((b) => {
        if (b.id === id && !b.locked) {
          let nx = x !== undefined ? x : b.x;
          let ny = y !== undefined ? y : b.y;
          let nw = Math.max(40, w);
          let nh = Math.max(16, h);
          
          // Constrain width and height to page boundaries
          if (nx + nw > PAGE_W) nw = PAGE_W - nx;
          if (ny + nh > PAGE_H) nh = PAGE_H - ny;
          
          return { ...b, width: nw, height: nh, x: nx, y: ny };
        }
        return b;
      }),
    }));
  },

  updateBlockStyle: (id, style) => {
    set((s) => ({
      blocks: s.blocks.map((b) => (b.id === id ? { ...b, style: { ...b.style, ...style } } : b)),
    }));
  },

  updateBlockLabel: (id, label) => {
    set((s) => ({
      blocks: s.blocks.map((b) => (b.id === id ? { ...b, label } : b)),
    }));
  },

  setBlockVisibility: (id, visible) => {
    set((s) => ({
      blocks: s.blocks.map((b) => (b.id === id ? { ...b, visible } : b)),
    }));
  },

  setBlockLocked: (id, locked) => {
    set((s) => ({
      blocks: s.blocks.map((b) => (b.id === id ? { ...b, locked } : b)),
    }));
  },

  addBlock: (block) => {
    const state = get();
    const maxZ = state.blocks.reduce((m, b) => Math.max(m, b.zIndex), 0);
    const newBlock: CanvasBlock = {
      id: uuidv4(),
      label: block.label || block.type.charAt(0).toUpperCase() + block.type.slice(1),
      x: block.x ?? 40,
      y: block.y ?? 40,
      width: block.width ?? 300,
      height: block.height ?? 100,
      zIndex: block.zIndex ?? maxZ + 1,
      locked: block.locked ?? false,
      visible: block.visible ?? true,
      style: { ...DEFAULT_BLOCK_STYLE, ...block.style },
      type: block.type,
      page: block.page ?? state.currentPage,
    };
    set((s) => ({ blocks: [...s.blocks, newBlock] }));
  },

  removeBlock: (id) =>
    set((s) => ({
      blocks: s.blocks.filter((b) => b.id !== id),
      selectedBlockIds: s.selectedBlockIds.filter(i => i !== id),
    })),

  removeSelectedBlocks: () =>
    set((s) => ({
      blocks: s.blocks.filter((b) => !s.selectedBlockIds.includes(b.id)),
      selectedBlockIds: [],
      editingBlockId: null,
    })),

  duplicateBlock: (id) => {
    const block = get().blocks.find((b) => b.id === id);
    if (!block) return;
    const maxZ = get().blocks.reduce((m, b) => Math.max(m, b.zIndex), 0);
    const dup: CanvasBlock = {
      ...block,
      id: uuidv4(),
      x: block.x + 16,
      y: block.y + 16,
      zIndex: maxZ + 1,
      label: block.label + " copy",
    };
    set((s) => ({ blocks: [...s.blocks, dup], selectedBlockIds: [dup.id] }));
  },

  duplicateSelectedBlocks: () => {
    const { blocks, selectedBlockIds } = get();
    if (selectedBlockIds.length === 0) return;
    const toDuplicate = blocks.filter((b) => selectedBlockIds.includes(b.id));
    let maxZ = blocks.reduce((m, b) => Math.max(m, b.zIndex), 0);
    const duplicated: CanvasBlock[] = toDuplicate.map((b) => {
      maxZ++;
      return {
        ...b,
        id: uuidv4(),
        x: b.x + 16,
        y: b.y + 16,
        zIndex: maxZ,
        label: b.label + " copy",
      };
    });
    set((s) => ({
      blocks: [...s.blocks, ...duplicated],
      selectedBlockIds: duplicated.map((b) => b.id),
    }));
  },

  copySelectedBlocks: () => {
    const { blocks, selectedBlockIds } = get();
    if (selectedBlockIds.length === 0) return;
    const toCopy = blocks.filter((b) => selectedBlockIds.includes(b.id));
    set({ clipboard: structuredClone(toCopy) });
  },

  pasteBlocks: () => {
    const { clipboard, blocks, currentPage } = get();
    if (clipboard.length === 0) return;
    get().pushHistory();
    let maxZ = blocks.reduce((m, b) => Math.max(m, b.zIndex), 0);
    const pasted: CanvasBlock[] = clipboard.map((b) => {
      maxZ++;
      return {
        ...b,
        id: uuidv4(),
        x: b.x + 16,
        y: b.y + 16,
        zIndex: maxZ,
        page: currentPage, // Paste onto current page
        label: b.label + " pasted",
      };
    });
    set((s) => ({
      blocks: [...s.blocks, ...pasted],
      selectedBlockIds: pasted.map((b) => b.id),
    }));
  },

  bringToFront: (id) => {
    const maxZ = get().blocks.reduce((m, b) => Math.max(m, b.zIndex), 0);
    set((s) => ({
      blocks: s.blocks.map((b) => (b.id === id ? { ...b, zIndex: maxZ + 1 } : b)),
    }));
  },

  sendToBack: (id) => {
    const minZ = get().blocks.reduce((m, b) => Math.min(m, b.zIndex), Infinity);
    set((s) => ({
      blocks: s.blocks.map((b) => (b.id === id ? { ...b, zIndex: minZ - 1 } : b)),
    }));
  },

  setBlocks: (blocks) => set({ blocks }),
  setPageBackground: (bg) => set({ pageBackground: bg }),
  setZoom: (z) => set({ zoom: Math.max(25, Math.min(200, z)) }),
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  toggleSnap: () => set((s) => ({ snapToGrid: !s.snapToGrid })),
  setDragging: (v) => set({ isDragging: v }),
  setResizing: (v) => set({ isResizing: v }),

  pushHistory: () => {
    const { blocks, history, historyIndex } = get();
    const trimmed = history.slice(0, historyIndex + 1);
    trimmed.push(structuredClone(blocks));
    if (trimmed.length > 60) trimmed.shift();
    set({ history: trimmed, historyIndex: trimmed.length - 1 });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    set({ blocks: structuredClone(history[historyIndex - 1]), historyIndex: historyIndex - 1 });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    set({ blocks: structuredClone(history[historyIndex + 1]), historyIndex: historyIndex + 1 });
  },

  applyTemplate: (id, blocks, bg) => {
    get().pushHistory();
    // Ensure all blocks from templates have page=0 by default
    const blocksWithPage = blocks.map((b) => ({ ...b, page: b.page ?? 0 }));
    
    // Preserve custom added blocks (like extra panels or custom dividers) that aren't core resume types
    const existingBlocks = get().blocks;
    const coreTypes = ["header", "contact", "summary", "experience", "education", "skills", "projects", "certifications"];
    
    // Find blocks the user explicitly added that aren't core resume sections
    const customBlocks = existingBlocks.filter(b => !coreTypes.includes(b.type));

    set({ 
      blocks: [...blocksWithPage, ...customBlocks], 
      pageBackground: bg, 
      activeTemplateId: id, 
      selectedBlockIds: [], 
      pageCount: 1, 
      currentPage: 0 
    });
    
    // Auto layout to prevent overlaps on template apply
    setTimeout(() => {
      get().autoLayout();
    }, 50);
  },

  alignSelected: (dir) => {
    const { selectedBlockIds, blocks } = get();
    if (selectedBlockIds.length === 0) return;
    
    // If one block is selected, align it relative to the page
    if (selectedBlockIds.length === 1) {
      const block = blocks.find((b) => b.id === selectedBlockIds[0]);
      if (!block) return;
      let nx = block.x;
      let ny = block.y;
      switch (dir) {
        case "left":   nx = 0; break;
        case "center": nx = (PAGE_W - block.width) / 2; break;
        case "right":  nx = PAGE_W - block.width; break;
        case "top":    ny = 0; break;
        case "middle": ny = (PAGE_H - block.height) / 2; break;
        case "bottom": ny = PAGE_H - block.height; break;
      }
      set((s) => ({
        blocks: s.blocks.map((b) => (b.id === selectedBlockIds[0] ? { ...b, x: nx, y: ny } : b)),
      }));
      return;
    }

    // If multiple blocks are selected, align them relative to their bounding box
    const selectedBlocks = blocks.filter((b) => selectedBlockIds.includes(b.id));
    const minX = Math.min(...selectedBlocks.map((b) => b.x));
    const maxX = Math.max(...selectedBlocks.map((b) => b.x + b.width));
    const minY = Math.min(...selectedBlocks.map((b) => b.y));
    const maxY = Math.max(...selectedBlocks.map((b) => b.y + b.height));
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;

    set((s) => ({
      blocks: s.blocks.map((b) => {
        if (!selectedBlockIds.includes(b.id)) return b;
        let nx = b.x;
        let ny = b.y;
        switch (dir) {
          case "left":   nx = minX; break;
          case "center": nx = midX - b.width / 2; break;
          case "right":  nx = maxX - b.width; break;
          case "top":    ny = minY; break;
          case "middle": ny = midY - b.height / 2; break;
          case "bottom": ny = maxY - b.height; break;
        }
        return { ...b, x: nx, y: ny };
      }),
    }));
  },

  autoLayout: () => {
    get().pushHistory();
    const { blocks, currentPage, snapToGrid, gridSize } = get();
    
    // Only layout blocks on the current page
    const pageBlocks = blocks.filter(b => b.page === currentPage);
    if (pageBlocks.length === 0) return;

    // Sort blocks visually from top to bottom
    const sortedBlocks = [...pageBlocks].sort((a, b) => a.y - b.y);
    
    let currentY = 40; // Starting Y margin
    const spacing = snapToGrid ? gridSize * 2 : 16; // Margin between blocks
    
    const updatedBlocks = sortedBlocks.map((block) => {
      // Skip background panels
      if (block.type === "panel") return block;
      
      const newY = snapToGrid ? Math.round(currentY / gridSize) * gridSize : currentY;
      const updatedBlock = { ...block, y: newY };
      
      currentY = newY + block.height + spacing;
      return updatedBlock;
    });

    set((s) => ({
      blocks: s.blocks.map((b) => {
        const update = updatedBlocks.find(ub => ub.id === b.id);
        return update ? update : b;
      }),
    }));
  },

  // ── Page Management ──

  setCurrentPage: (page) => {
    const { pageCount } = get();
    if (page >= 0 && page < pageCount) {
      set({ currentPage: page, selectedBlockIds: [] });
    }
  },

  addPage: () => {
    set((s) => ({ pageCount: s.pageCount + 1, currentPage: s.pageCount }));
  },

  removePage: (page) => {
    const { pageCount, blocks, currentPage } = get();
    if (pageCount <= 1) return; // Can't remove the only page

    // Remove all blocks on this page
    const remaining = blocks.filter((b) => (b.page ?? 0) !== page);
    // Shift blocks on higher pages down by 1
    const shifted = remaining.map((b) => {
      const bp = b.page ?? 0;
      return bp > page ? { ...b, page: bp - 1 } : b;
    });

    const newCount = pageCount - 1;
    const newCurrent = currentPage >= newCount ? newCount - 1 : currentPage > page ? currentPage - 1 : currentPage;
    set({ blocks: shifted, pageCount: newCount, currentPage: Math.max(0, newCurrent) });
  },

  moveBlockToPage: (blockId, targetPage) => {
    const { pageCount } = get();
    if (targetPage < 0 || targetPage >= pageCount) return;
    set((s) => ({
      blocks: s.blocks.map((b) => (b.id === blockId ? { ...b, page: targetPage } : b)),
    }));
  },

  getBlocksForPage: (page) => {
    return get().blocks.filter((b) => (b.page ?? 0) === page);
  },
}),
{
  name: "folio-canvas-storage",
  version: 1,
  partialize: (state) => ({
    blocks: state.blocks,
    pageBackground: state.pageBackground,
    activeTemplateId: state.activeTemplateId,
    pageCount: state.pageCount,
  }),
}
));
