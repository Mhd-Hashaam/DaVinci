# TheFittingRoom Modal - Implementation Plan

> **Last Updated:** 2026-01-11 | **Status:** Approved with Revisions

## Overview

TheFittingRoom is a core feature modal for previewing AI-generated prints/designs on selected plain shirts. It features a unique top-to-bottom slide animation (reverse of ApparelModal), a three-panel layout (25%-50%-25%), and advanced card stacking UI for shirt selection.

> [!IMPORTANT]
> **Phase 1 Focus:** Build exceptional UI foundation. Preview functionality (design overlay on shirts) is deferred — this is a complex, mission-critical feature that requires dedicated development time.

---

## Design Specifications

### Modal Container
| Property | Value |
|----------|-------|
| Coverage | 98vh (same as ApparelModal) |
| Corners | `rounded-b-[2rem]` (rounded bottom, flat top) |
| Animation | Slide from TOP to BOTTOM (reverse of ApparelModal) |
| Close Button | Bottom-right corner (mirrored Y-axis from ApparelModal) |
| Resize Handle | Bottom edge, draggable upward |
| Background | `bg-[#09090b]` with SparklesCore overlay |

### Three-Panel Layout (25-50-25)
```
┌──────────────────────────────────────────────────────────┐
│                    TheFittingRoom                        │
├────────────┬──────────────────────────┬─────────────────-┤
│  TheCloset │        TheMirror         │    TheArtWall    │
│    (25%)   │          (50%)           │      (25%)       │
│            │                          │                  │
│  [Shirts]  │   [Preview Canvas]       │   [Designs]      │
│  Stacked   │   + Add to Bag CTA       │   5+ slots       │
│            │                          │                  │
└────────────┴──────────────────────────┴──────────────────┘
```

### Responsiveness (Modern Approach)
> 🔴 **NO OUTDATED PRACTICES** — Use `clamp()` for fluid sizing instead of rigid breakpoints.

```css
/* Example fluid sizing */
.panel-width { width: clamp(200px, 25vw, 400px); }
.card-size { width: clamp(80px, 15vw, 150px); }
.font-size { font-size: clamp(0.875rem, 1vw, 1.125rem); }
```

---

## Component Breakdown

### 1. TheCloset (Left Sidebar - 25%)
**Purpose:** Display selected plain shirts in a stacked card layout.

#### Stacked Mode (Default: `-`)
- Cards overlap 70-80%, only top card fully visible
- On hover:
  - Hovered card rises to 95% visibility
  - Non-hovered cards become grayscale
  - Smooth transition with `framer-motion`
- Card order: Last selected = front (highest z-index)
- **Bin icon (🗑️)** appears on hover for deletion

#### Expanded Mode (`+`)
- Cards display in vertical scroll list (no overlap)
- Toggle button switches between `+` and `-`

#### Empty State Logic
- **Default:** Show 5 empty placeholder cards
- **Dynamic:** As user adds more than 5 shirts, cards increase
- **Empty card UI:** `IconGhost2Filled` (Tabler) centered + dashed border
- **Top/front empty card:** Contains CTA button "Select Shirts"

#### UI Elements
- `+/-` toggle button at top
- Card count indicator (e.g., "3/10 shirts")
- Each card uses product image + name overlay

### 2. TheMirror (Center Canvas - 50%)
**Purpose:** Main preview area showing selected shirt with AI-generated design overlaid.

> [!WARNING]
> **Phase 1:** UI only. Preview functionality (design overlay rendering) is a complex feature to be implemented in a dedicated phase.

#### Phase 1 Features (UI Only)
- Shows currently selected shirt from TheCloset (static image)
- Placeholder design overlay area (visual indicator, non-functional)
- Placeholder when no selection: "Select a shirt and design to preview"
- **Add to Bag** CTA button centered below canvas
  - ❌ Not functional in Phase 1
  - ✅ Has `cursor-pointer` styling

#### Future Phase Features (Deferred)
- Canvas or layered `<Image>` components
- Design position calculation (center chest area)
- Advanced blend mode / perspective transforms

### 3. TheArtWall (Right Sidebar - 25%)
**Purpose:** Display design/print slots for selection.

#### Empty State Logic
- **Default:** Show 5 empty placeholder slots
- **Dynamic:** As user adds more than 5 designs, slots increase (max 10)
- **Empty slot UI:** `IconGhost2Filled` (Tabler) centered + dashed border

#### Features
- 2-column grid layout (responsive rows)
- Filled slots show design thumbnail
- Active design has highlight border
- Click to select for preview
- **Bin icon (🗑️)** appears on hover for deletion

---

## Icon Specifications

| Context | Icon | Source |
|---------|------|--------|
| Sidebar Tab | `TheFittingRoomClapWhite.png` | Custom PNG at `/Icons/TheFittingRoomClapWhite.png` |
| Empty Card/Slot | `IconGhost2Filled` | `@tabler/icons-react` |
| Delete/Remove | Bin icon on hover | `IconTrash` or similar |
| Expand/Collapse | `+` / `-` text or icons | CSS styled |

---

## State Management

### New Zustand Store: `useFittingRoomStore`
```typescript
interface DesignItem {
    id: string;
    name: string;
    thumbnail: string;  // URL for grid display
    fullImage: string;  // URL for preview (high-res)
    category?: string;  // Optional grouping
}

interface FittingRoomState {
    // Modal
    isOpen: boolean;
    openFittingRoom: () => void;
    closeFittingRoom: () => void;

    // TheCloset
    selectedShirts: ApparelProduct[];
    addShirt: (product: ApparelProduct) => void;  // Max 10 validation
    removeShirt: (productId: string) => void;
    clearShirts: () => void;
    activeShirtId: string | null;
    setActiveShirt: (id: string) => void;
    closetMode: 'stacked' | 'expanded';
    toggleClosetMode: () => void;
    lastRemovedShirt: ApparelProduct | null;  // For undo
    undoRemoveShirt: () => void;

    // TheArtWall
    designs: DesignItem[];  // Dynamic array (max 10)
    addDesign: (design: DesignItem) => void;  // Max 10 validation
    removeDesign: (designId: string) => void;
    activeDesignId: string | null;
    setActiveDesign: (id: string) => void;
    lastRemovedDesign: DesignItem | null;  // For undo
    undoRemoveDesign: () => void;
}
```

> **Note on `DesignItem`:** This interface defines the structure for design/print data. Each design needs:
> - `id`: Unique identifier
> - `name`: Display name
> - `thumbnail`: Small image for grid slots
> - `fullImage`: High-resolution image for preview canvas
> - `category`: Optional grouping for future filtering

### Persistence
- Use `zustand/middleware/persist` for localStorage backup
- Selections persist across page refreshes and modal close/reopen

---

## Animation Specifications

### Modal Open (Top → Bottom)
```javascript
// GSAP Timeline
gsap.set(modalRef, { y: '-100%' }); // Start above viewport
gsap.to(modalRef, { y: '0%', duration: 2.0, ease: 'power4.out' });
```

### Modal Close (Bottom → Top)
```javascript
gsap.to(modalRef, { y: '-100%', duration: 0.5, ease: 'power2.inOut' });
```

### Dual Modal Transition (Push Animation)
When one modal opens while another is open:
```javascript
// Opening FittingRoom while Apparel is open:
// 1. FittingRoom slides down from top
// 2. Apparel appears to be "pushed down" by FittingRoom

const tl = gsap.timeline();
tl.to(apparelModalRef, { y: '100%', duration: 0.6, ease: 'power2.in' }, 0);
tl.fromTo(fittingRoomRef, 
    { y: '-100%' }, 
    { y: '0%', duration: 0.8, ease: 'power4.out' }, 
    0.3
);
```

### Card Stack Hover (Framer Motion)
```jsx
<motion.div
    whileHover={{ 
        y: -80,  // Rise up
        scale: 1.02,
        zIndex: 100
    }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
/>
```

### Grayscale on Sibling Hover
```jsx
// Parent tracks hovered index
const [hoveredIdx, setHoveredIdx] = useState(null);

// Each card applies grayscale if NOT hovered
style={{ filter: hoveredIdx !== null && hoveredIdx !== idx ? 'grayscale(100%)' : 'none' }}
```

### Animation Sync Rule
Card hover animations should be disabled during modal open/close transitions to prevent visual conflicts.

---

## Sidebar Integration

### New Nav Item
| Position | ID | Icon | Label |
|----------|-----|------|-------|
| 3rd (after Create) | `fittingroom` | Custom PNG | FittingRoom |

```tsx
// Usage in DaVinciFloatingDock.tsx
import Image from 'next/image';

// In navItems array (position 3)
{ 
    id: 'fittingroom', 
    icon: () => (
        <Image 
            src="/Icons/TheFittingRoomClapWhite.png" 
            alt="FittingRoom" 
            width={24} 
            height={24} 
        />
    ), 
    label: 'FittingRoom' 
}
```

### Sidebar Behavior
- Clicking FittingRoom tab opens modal (like Apparel)
- Tab shows glow when modal is open
- Opening one modal closes the other (push animation)

---

## Development Timeline

| Phase | Focus | Status |
|-------|-------|--------|
| **Phase 1** | Good UI Foundation | 🔄 Current |
| **Phase 2** | Advanced UI Polish | ⏳ Pending |
| **Phase 3** | Preview Functionality | ⏳ Pending |
| **Phase 4** | AI Studio Integration | ⏳ Pending |
| **Phase 5** | Cart & Checkout | ⏳ Pending |

---

## Resolved Decisions

### ✅ Design Source
- **Phase 1:** Preset designs library (sample designs for testing)
- **Future:** User uploads from AI Studio

### ✅ Preview Fidelity
- **Phase 1:** UI placeholder only (no functional overlay)
- **Future:** Advanced rendering with perspective transforms

### ✅ Cart Integration
- **Phase 1:** CTA button visible but non-functional (cursor-pointer only)
- **Future:** Full cart system integration

### ✅ Mobile Responsiveness
- Use `clamp()` for fluid sizing across ALL screen sizes
- No rigid breakpoints — adaptive by default

---

## Technical Dependencies

| Dependency | Purpose | Status |
|------------|---------|--------|
| Framer Motion | Card hover animations | ✅ Installed |
| GSAP | Modal open/close | ✅ Installed |
| Zustand | State management + persistence | ✅ Installed |
| Tabler Icons | Ghost icon for empty states | ✅ Installed |
| Custom PNG | Sidebar icon | ✅ Available |

---

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Dual modal z-index conflicts | Push animation ensures only one visible |
| Performance with stacked cards | Limit to 10 items max |
| Complex hover state management | Parent-level state, not per-card |
| Empty state confusion | Clear CTAs + ghost icon placeholders |

---

## Success Criteria (Phase 1)

1. ✅ Modal opens from top with smooth animation
2. ✅ Push animation when switching between modals  
3. ✅ Three-panel layout with fluid clamp() sizing
4. ✅ Card stacking works with hover-to-expand + grayscale siblings
5. ✅ Empty states show 5 ghost cards/slots with CTAs
6. ✅ Bin icon delete on hover for all cards
7. ✅ Sidebar tab with custom PNG icon
8. ✅ State persists across modal close/reopen

---

## Approved Improvements

### ✅ Accessibility
Add ARIA labels, focus management, and focus trap inside modal.

### ✅ Animation Sync
Disable card hover animations during modal transitions.

### ✅ Undo Last Deselection
Single-level undo for shirt/design removal. Store `lastRemovedShirt` and `lastRemovedDesign` in Zustand.