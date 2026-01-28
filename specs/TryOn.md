# Realistic "Try On" & Print Preview: Research & Specification

## 1. Executive Summary & Mental Model
**We are NOT building a 3D simulation.** We are strictly **"lying to the eye using pixel math"** (2.5D).
The core illusion is achieved by combining three specific layers:
1.  **Base Layer**: The flat photo of the shirt.
2.  **Displacement Layer**: A hidden grayscale map where `White` = High/Peak and `Black` = Low/Valley. This tells the GPU to *shift* the design's pixels to match wrinkles.
3.  **Shadow/Lighting Layer**: A grayscale map of just the shadows/highlights, blended *over* the design to make it look embedded, not floating.

**Technology Choice**: **WebGL via PixiJS**.
*   **Why?**: It is 2D-first, lightweight, and supports `DisplacementFilter` natively.
*   **Role**: React handles State (Selection, Color, Size). Pixi handles Pixels (Rendering, Blending, Displacement).

## 2. The Rendering Pipeline

### A. Asset Requirements (Per Shirt)
1.  **Base Image** (`shirt.png`): High-res color photo.
2.  **Displacement Map** (`shirt-displace.png`): High-contrast grayscale.
3.  **Shadow Map** (`shirt-shadow.png`): Medium-contrast grayscale.

### B. Rendering Logic (The "Stack")
1.  **Background**: Shirt Sprite.
2.  **Middle**: User Design Sprite.
    *   **Filter**: `DisplacementFilter` (using the Displacement Map).
    *   **Transform**: Standard 2D scaling/rotation. *Note: If extreme angles are needed, use `pixi-projection`, but avoid if possible for performance.*
3.  **Foreground**: Shadow Sprite.
    *   **Blend Mode**: `MULTIPLY` (Light Shirts) or `NORMAL` + `MULTIPLY` Overlay (Dark Shirts).

## 3. Architecture & State Management (Critical Best Practices)

To avoid common pitfalls (Memory Leaks, Context Limits, UI Lag):

### A. The "One-Way" Data Flow
**React** owns the Truth. **Pixi** reflects the Truth.
*   **Store (Zustand/Context)**: Holds **ONLY** serializable JSON data.
    *   `{ shirtId: 'tee_black', designs: [{ id: 1, x: 100, y: 200, scale: 0.5 }] }`
*   **Pixi Component**: Subscribes to store changes and updates sprites.
    *   *Never* store Pixi DisplayObjects (Sprites, Containers) in React State. This causes circular references and memory leaks.

### B. Single WebGL Context
*   **Rule**: Use **ONE** `PIXI.Application` for the entire canvas area.
*   **Why**: Browsers limit WebGL contexts (~16 max). Creating a new App for every shirt preview will crash mobile browsers.
*   **Lifecycle**: Create the App once on mount. When the shirt changes, *swap the textures*, do not destroy the App.

### C. Input Handling (The "Overlay" Pattern)
*   **Do not** use Pixi for text inputs or sliders.
*   **Strategy**: Overlay standard HTML/DOM elements on top of the Canvas.
    *   *Text Editing*: User types in a React `<input>` floating over the canvas. On submit, render the text to a Texture/BitmapText in Pixi.
    *   *Color Picker*: Standard HTML color picker.

## 4. Performance & Resource Management

### A. Texture Hygiene
*   **Problem**: Pixi caches every texture. Uploading 50 user images = GPU Memory Leak.
*   **Solution**: Manually call `texture.destroy(true)` when a user removes a design or changes the shirt base.

### B. Optimization
*   **Masks/Filters**: Expensive. Limit checks. Do not apply filters to the entire stage, only to the Design container.
*   **Resolution**: Set `autoDensity: true` and `resolution: window.devicePixelRatio` for specific high-DPI handling, but cap at 2x to save battery.

## 5. Implementation Roadmap

### Phase 1: The "Brutal" Prototype (MVP)
**Goal**: Prove the tech stack with ONE shirt and ONE design.
1.  **Setup**: Install `pixi.js` and `@pixi/react`.
2.  **Assets**: Manually create 1 set of assets (Base + Displace + Shadow).
3.  **Component**: Build `RealisticShirtPreview.tsx`.
    *   Implementation: Single Pixi Stage.
    *   Features: Displacement Filter active. Blend mode toggle.

### Phase 2: React Integration
1.  Connect to `fittingRoomStore`.
2.  Implement "One-Way" state updates.
3.  Add Drag/Scale interactions (using Pixi interaction events to update React state).

### Phase 3: Automation
1.  Implement browser-side Shadow/Displacement generation (Canvas filters) to support any uploaded shirt photo.
