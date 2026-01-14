# LiBass AI Studio Implementation Plan

## Goal
Build a premium, fully functional web application for AI-powered custom clothing design, adhering to the requirements in `LiBass AI requirements.md`.

## User Review Required
> [!IMPORTANT]
> **UI Library Strategy**: The requirements specify "Aceternity UI" and "Magic UI". These are typically copy-paste component collections. I will implement the required components (Bento Grid, Dock, Shimmer Button) using Tailwind CSS and Framer Motion directly to ensure full control and no external private dependencies.

## Key Technical Decisions
- **Framework**: Next.js 16 (App Router + Turbopack)
- **Library**: React 19
- **Styling**: Tailwind CSS 4 + Framer Motion
- **3D Engine**: React Three Fiber (Three.js v0.170+) + Drei
- **State Management**: Zustand (for Session State, GPU Manager, Orders)
- **Persistence**: LocalStorage (MVP) + Database (Future)

## Proposed Changes

### Phase 1: Core Setup & UI Shell
#### [NEW] `components/ui/`
- Implement reusable modern primitives:
  - `BentoGrid.tsx`: CSS Grid based layout for image galleries.
  - `Dock.tsx`: Floating toolbar with magnification effect (Framer Motion).
  - `ShimmerButton.tsx`: Animated gradient button.
  - `Spotlight.tsx`: Mouse-tracking lighting effect.

#### [MODIFY] `app/layout.tsx` & `globals.css`
- Add necessary fonts and base animations.
- Configure theme provider for smooth light/dark transitions.

#### [NEW] `components/layout/`
- `ResponsiveShell.tsx`: Manages Sidebar (Desktop) vs Bottom Sheet (Mobile) logic.
- `PromptInput.tsx`: specialized input component that moves top/bottom based on media query.

### Phase 2: 3D Visualization & Shaders
#### [NEW] `components/canvas/`
- `Scene.tsx`: Main R3F Canvas setup with lighting environments.
- `MockupModel.tsx`: Loads 3D shirt model.
- `TextureShader.ts`: Custom GLSL shader material for realistic fabric wrapping.
  - **Vertex Shader**: Handles vertex displacement/UV mapping.
  - **Fragment Shader**: Blends AI texture with fabric normal maps.

### Phase 3: Feature Modules
#### [NEW] `features/editor/`
- `GenerationManager.ts`: State store for prompts and generation queue.
- `EditModal.tsx`: Canvas-based image editor (crop/rotate/scale) utilizing 3D texture projection preview.

#### [NEW] `features/order/`
- `OrderSystem.tsx`: Multi-step wizard for size/color/quantity.
- `PriceCalculator.ts`: Logic for dynamic pricing.

### Phase 4: Persistence & Performance
#### [NEW] `lib/managers/`
- `SessionManager.ts`: Auto-save logic (debounced save to local storage/DB).
- `GPUMemoryManager.ts`: Monitor GL resource usage and downgrade quality (e.g., lower texture resolution) if needed.

## Verification Plan

### Automated Tests
- Type checking with TypeScript.
- Unit tests for `PriceCalculator` and `SessionManager` logic.

### Manual Verification
- **Responsive Test**: Verify Prompt Input moves Top <-> Bottom on resize.
- **3D Test**: Verify "DaVinci" logo and texture application on 3D model without artifacts.
- **Performance**: Monitor FPS during comparison mode (3 models).
