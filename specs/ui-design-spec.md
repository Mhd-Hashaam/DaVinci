

### B. Resizable Sidebar (`Sidebar.tsx`)
*   **Position:** Fixed Left (`fixed left-0 top-0 h-full`).
*   **Width:** Dynamic (State-controlled).
    *   Min: 240px.
    *   Max: 480px.
    *   Collapsed: 80px.
*   **Drag Handle:** A 4px wide invisible area on the right edge (`cursor-col-resize`). On hover/drag, a thin `indigo-500` line appears.
*   **Visuals:** Dark background (`#09090b`), Right border (`border-white/5`), Shadow (`shadow-2xl`).

### C. Main Content Area
*   **Position:** Fluid, with `marginLeft` equal to the sidebar width.
*   **Scroll:** Native window scrolling (not a nested overflow div).

---

## 4. Component Specifications

### 1. Sidebar Components
*   **Header:**
    *   Contains a **Collapse Button** (`PanelLeft` icon from Lucide) aligned left.
    *   **Logo Text:** "DaVinci" (Sans-serif, Semi-bold, White). Hidden when collapsed.
*   **Navigation:**
    *   Vertical list: Explore, Create, Archive.
    *   **Active State:** `bg-white/10`, text-white, shadow-sm.
    *   **Inactive State:** Text-zinc-400, hover:text-white, hover:bg-white/5.
    *   **Collapsed Behavior:** Icons centered. Tooltips appear on hover (absolute positioning `z-50`).
*   **Studio Settings (Accordion):**
    *   Label: "CONFIGURATION" with a chevron.
    *   **Content:**
        *   **Model Indicator:** "Gemini 2.5 Flash" with a glowing green dot (`shadow-[0_0_8px_rgba(34,197,94,0.5)]`).
        *   **Sliders:** Custom styled range inputs (`bg-white/10` track, white thumb). Used for Guidance Scale and Steps.
        *   **Reset Button:** `w-full` button with `Zap` icon.

### 2. Sticky Header & Prompt Bar (`PromptBar.tsx`)
*   **Header Wrapper:**
    *   `sticky top-0 z-40`.
    *   `bg-background/95 backdrop-blur-xl`.
    *   `border-b border-white/5`.
*   **Prompt Bar Container:**
    *   Centered max-width (`max-w-4xl`).
    *   **Style:** Capsule shape, `bg-[#18181b]`, `rounded-2xl`, `border border-white/10`.
    *   **Behavior:** Auto-growing Textarea (1 row default).
*   **Internal Elements:**
    *   **Left:** Settings Toggle Button (Square `rounded-xl`, toggles the aspect ratio dropdown).
    *   **Center:** Textarea (`bg-transparent`, `resize-none`).
    *   **Right:**
        *   Image Upload Icon (Ghost button).
        *   **Generate Button:** Indigo gradient, `rounded-xl`. Text "Generate" + Icon `Send`. Swaps to Spinner when loading.
*   **Settings Dropdown:**
    *   **Animation:** Slides **DOWN** from the bar (`origin-top`).
    *   **Content:** Horizontal scrolling list of Aspect Ratios (1:1, 16:9, etc.).
    *   **Active Ratio:** Highlighted White/Black. Inactive: Zinc-400.

### 3. Masonry Image Grid (`ImageGrid.tsx`)
*   **Tech:** CSS Columns (`column-count`).
    *   Mobile: 1 column.
    *   Tablet: 2 columns.
    *   Laptop: 3 columns.
    *   Wide: 4-5 columns.
*   **Card Style:**
    *   `break-inside-avoid`.
    *   `bg-white/5`, `rounded-xl`, `overflow-hidden`.
    *   **Hover Effect:** Scale up (`scale-[1.01]`), Shadow (`shadow-indigo-500/10`).
*   **Overlay:**
    *   Gradient from bottom (`from-black/90`).
    *   Appears on group hover.
    *   Contains: Prompt text (line-clamp-2), Aspect Ratio badge, Download/Maximize buttons.

### 4. Full Screen Modal (`ImageModal.tsx`)
*   **Backdrop:** `bg-black/90 backdrop-blur-sm`.
*   **Layout:**
    *   **Left (Image):** 100% height (or max viewport), `bg-black/50`, `object-contain`.
    *   **Right (Sidebar):** `w-96`, `bg-surface`, `border-l border-white/10`.
*   **Details Panel:**
    *   **Prompt:** Full text, selection allowed.
    *   **Metadata Grid:** 2 columns (Model, Ratio, Date, Resolution).
    *   **Actions:** "Copy Prompt" (Secondary style) and "Download Image" (White primary style).

---

## 5. Animations & Transitions# DaVinci Studio - UI Design Specification

## 1. Project Overview & Aesthetic
**DaVinci Studio** is a high-fidelity AI image generation web application. The design philosophy is "Professional Creative Studio." It borrows aesthetic cues from Midjourney, Linear, and V0, focusing on a dark, immersive environment where the content (images) takes center stage.

*   **Theme:** Deep Dark Mode (Zinc-950 base).
*   **Vibe:** Industrial, Minimalist, Precision-engineered.
*   **Core Tech:** React, Tailwind CSS, Lucide Icons.

---

## 2. Design System

### Color Palette
*   **Background:** `#09090b` (Zinc-950) - Used for the main body and sidebar.
*   **Surface:** `#18181b` (Zinc-900) - Used for cards, inputs, and panels.
*   **Primary Accent:** `#6366f1` (Indigo-500) - Used for primary buttons and focus rings.
*   **Secondary Text:** `#a1a1aa` (Zinc-400).
*   **Borders:** `rgba(255, 255, 255, 0.05)` - Extremely subtle dividers.

### Typography
*   **Font:** Inter (Google Fonts).
*   **Weights:** Light (300) for metadata, Regular (400) for body, Medium (500) for UI elements.

### Effects
*   **Glassmorphism:** `backdrop-blur-xl` used on the sticky top header.
*   **Micro-interactions:** `transition-all duration-200` on almost all interactive elements.
*   **Borders:** 1px borders using `white/5` or `white/10` to define depth without heavy shadows.

---

## 3. Layout Architecture

The app uses a **Resizable Sidebar + Fluid Main Content** layout.

### A. The Container
*   `div.min-h-screen.bg-background`
*   Selection color: `selection:bg-indigo-500/30`.
1.  **Sidebar Resize:** Use JS to update `width` style, but keep `transition-all duration-75` on the container for smooth snapping.
2.  **Shimmer Loading:** Custom keyframe animation on the "Generating" skeleton card (`skew-x-12`, gradient moving across).
3.  **Dropdowns:** `animate-in slide-in-from-top-2 fade-in zoom-in-95`.
4.  **Image Load:** Images start at `opacity-0` and transition to `opacity-100` via `onLoad` event.

---

## 6. Icons (Lucide React)
Specific icons used for authenticity:
*   `PanelLeft` (Sidebar toggle)
*   `Compass`, `Image`, `Archive` (Nav)
*   `Settings2`, `Send`, `ImageIcon` (Prompt Bar)
*   `Maximize2`, `Download`, `Copy`, `X` (Actions)
*   `Zap`, `Sliders` (Sidebar settings)
