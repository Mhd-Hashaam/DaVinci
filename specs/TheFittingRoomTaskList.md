# TheFittingRoom - Task List

> **Last Updated:** 2026-01-11 | **Current Phase:** 3 (Three-Panel Layout)

---

## Phase 1: Modal Shell & Animation ✅
> **Goal:** Create the basic modal with top-to-bottom animation and push transition.

- [x] **1.1** Create `components/davinci/fittingroom/` directory
- [x] **1.2** Create `TheFittingRoomModal.tsx` base component
- [x] **1.3** Implement modal container with `98vh` height, `rounded-b-[2rem]`
- [x] **1.4** Add GSAP animation: slide from top (`y: -100%` → `y: 0%`)
- [x] **1.5** Add GSAP reverse animation for close
- [x] **1.6** Implement **push animation** for dual modal transitions
  - [x] Opening FittingRoom pushes Apparel down
  - [x] Opening Apparel pushes FittingRoom up
- [x] **1.7** Implement draggable resize handle at bottom edge
- [x] **1.8** Position close button at bottom-right corner
- [x] **1.9** Add backdrop overlay with blur effect
- [x] **1.10** Add SparklesCore background effect

---

## Phase 2: State Management ✅
> **Goal:** Set up Zustand store with persistence.

- [x] **2.1** Create `lib/store/fittingRoomStore.ts`
- [x] **2.2** Define `DesignItem` interface
- [x] **2.3** Implement modal state: `isOpen`, `openFittingRoom`, `closeFittingRoom`
- [x] **2.4** Implement TheCloset state:
  - [x] `selectedShirts` array with **max 10 validation**
  - [x] `addShirt`, `removeShirt`, `clearShirts`
  - [x] `activeShirtId`, `setActiveShirt`
  - [x] `closetMode` toggle (stacked/expanded)
  - [x] `lastRemovedShirt` + `undoRemoveShirt` for undo
- [x] **2.5** Implement TheArtWall state:
  - [x] `designs` array with **max 10 validation**
  - [x] `addDesign`, `removeDesign`
  - [x] `activeDesignId`, `setActiveDesign`
  - [x] `lastRemovedDesign` + `undoRemoveDesign` for undo
- [x] **2.6** Add `zustand/middleware/persist` for localStorage

---

## Phase 3: Three-Panel Layout ✅
> **Goal:** Implement fluid 25-50-25 layout with clamp() sizing.

- [x] **3.1** Create CSS Grid container: `grid-template-columns: 1fr 2fr 1fr`
- [x] **3.2** Apply `clamp()` for fluid panel widths
- [x] **3.3** Create `TheCloset.tsx` component (left panel)
- [x] **3.4** Create `TheMirror.tsx` component (center panel)
- [x] **3.5** Create `TheArtWall.tsx` component (right panel)
- [x] **3.6** Add panel borders/separators with rounded corners
- [x] **3.7** Ensure panels fill modal height correctly
- [ ] **3.8** Test responsiveness across screen sizes (no breakpoints!)

---

## Phase 4: TheCloset - Card Stacking ✅
> **Goal:** Implement stacked card layout with hover interactions.

- [x] **4.1** Create `ClosetCard.tsx` for individual shirt cards
- [x] **4.2** Implement **empty state**: 5 ghost cards by default
  - [x] Use `IconGhost2Filled` (Tabler) + dashed border
  - [x] Top/front empty card has CTA "Select Shirts"
- [x] **4.3** Implement stacked layout using Framer Motion
  - [x] Calculate y-offset and z-index per card (70-80% overlap)
  - [x] Apply scale reduction for back cards
- [x] **4.4** Implement hover-to-expand behavior
  - [x] Hovered card rises 95% visibility
  - [x] Siblings become grayscale
- [x] **4.5** Click-to-select sets `activeShirtId` (border highlight)
- [x] **4.6** Add **bin icon on hover** for deletion
- [x] **4.7** Add `+/-` toggle button at top
- [x] **4.8** Implement expanded mode (vertical scroll list)
- [x] **4.9** Add card count indicator (e.g., "3/10")
- [x] **4.10** Dynamic card count: increase beyond 5 as user adds shirts

---

## Phase 5: TheMirror - Preview Canvas (UI Only) ✅
> **Goal:** Build preview area UI (functionality deferred).

- [x] **5.1** Display selected shirt image (from `activeShirtId`)
- [x] **5.2** Add placeholder overlay area for designs (visual only)
- [x] **5.3** Add placeholder state: "Select a shirt and design to preview"
- [x] **5.4** Add "Add to Bag" CTA button below canvas
  - [x] Style with hover effects
  - [x] ✅ `cursor-pointer`
  - [x] ❌ No click functionality yet
- [x] **5.5** Apply rounded corners matching design system

---

## Phase 6: TheArtWall - Design Slots ✅
> **Goal:** Implement design selection grid with empty states.

- [x] **6.1** Create 2-column responsive grid layout
- [x] **6.2** Create `ArtSlot.tsx` for individual design slots
- [x] **6.3** Implement **empty state**: 5 ghost slots by default
  - [x] Use `IconGhost2Filled` (Tabler) + dashed border
- [x] **6.4** Filled slots show design thumbnail
- [x] **6.5** Click-to-select sets `activeDesignId` (border glow)
- [x] **6.6** Add **bin icon on hover** for deletion
- [x] **6.7** Dynamic slot count: increase beyond 5 as user adds designs
- [x] **6.8** Add preset sample designs for testing (5-6 designs)

---

## Phase 7: Sidebar Integration ✅
> **Goal:** Add FittingRoom tab to main navigation.

- [x] **7.1** Add `fittingroom` entry to `navItems` in `DaVinciFloatingDock.tsx`
- [x] **7.2** Use custom PNG: `/Icons/TheFittingRoomClapWhite.png`
- [x] **7.3** Position tab at 3rd position (after Create)
- [x] **7.4** Implement click handler to open modal
- [x] **7.5** Close Apparel modal if open (trigger push animation)
- [x] **7.6** Add active glow state when modal is open
- [x] **7.7** Update Apparel sidebar handler to close FittingRoom if open
- [x] **7.8** Sidebar transforms to bottom navbar when modal opens

---

## Phase 8: ApparelPage Integration ✅
> **Goal:** Connect shirt selection flow to FittingRoom store.

- [x] **8.1** Modify `ApparelProductCard.tsx` checkbox to call `addShirt`
- [x] **8.2** Add max 10 validation with visual feedback when limit reached
- [ ] **8.3** Add "Preview in FittingRoom" shortcut button when shirts selected
- [ ] **8.4** Show selection count badge on FittingRoom sidebar tab
- [x] **8.5** Implement `removeShirt` when checkbox unchecked

---

## Phase 9: Polish & Edge Cases
> **Goal:** Handle edge cases and add finishing touches.

- [ ] **9.1** Disable card hover animations during modal transitions
- [ ] **9.2** Implement undo UI for last removed shirt/design
- [ ] **9.2** Implement undo UI for last removed shirt/design
- [x] **9.3** Add ARIA labels to all interactive elements
- [x] **9.4** Implement focus trap inside modal
- [x] **9.5** Add keyboard shortcuts (Escape to close)
- [ ] **9.6** Test with 10 shirts/designs (max) for performance
- [x] **9.7** Ensure z-index hierarchy is correct
- [x] **9.8** Verify persistence works (refresh, close/reopen)

---

## Phase 10: Testing & Documentation
> **Goal:** Validate functionality and document.

- [ ] **10.1** Manual testing checklist:
  - [ ] Modal open/close from top animation
  - [ ] Push animation between modals
  - [ ] Card stacking hover behavior
  - [ ] Grayscale on siblings
  - [ ] Delete with bin icon
  - [ ] Undo functionality
  - [ ] Empty state CTAs
  - [ ] Persistence across refresh
- [ ] **10.2** Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] **10.3** Responsive testing (desktop, tablet, mobile simulations)
- [ ] **10.4** Update project documentation

---

## Estimated Effort

| Phase | Complexity | Est. Time |
|-------|------------|-----------|
| Phase 1 | Medium | 3-4 hrs |
| Phase 2 | Medium | 1-2 hrs |
| Phase 3 | Low | 1-2 hrs |
| Phase 4 | High | 4-5 hrs |
| Phase 5 | Low | 1-2 hrs |
| Phase 6 | Medium | 2-3 hrs |
| Phase 7 | Low | 1 hr |
| Phase 8 | Medium | 2-3 hrs |
| Phase 9 | Medium | 2-3 hrs |
| Phase 10 | Low | 1-2 hrs |
| **Total** | | **~18-26 hrs** |

---

## Dependency Graph

```
Phase 1 (Modal) ─────┬───────────────────────────────┐
                     │                               │
Phase 2 (State) ─────┼──────┬───────┬───────┐       │
                     │      │       │       │       │
                     ▼      ▼       ▼       ▼       ▼
                Phase 3  Phase 4  Phase 5  Phase 6  Phase 7
                (Layout) (Closet) (Mirror) (Wall)  (Sidebar)
                     │      │       │       │       │
                     └──────┴───────┴───────┴───────┘
                                    │
                                    ▼
                              Phase 8 (Integration)
                                    │
                                    ▼
                              Phase 9 (Polish)
                                    │
                                    ▼
                              Phase 10 (Testing)
```
