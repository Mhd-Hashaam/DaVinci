# Phase 7: Prompt Bar Redesign Implementation Plan

## Goal
Redesign the Prompt Bar to be a comprehensive, premium command center for image generation, inspired by Adobe Firefly. Move key controls (Model, Aspect Ratio, Styles) from the Sidebar to the Prompt Bar for a more streamlined workflow.

## User Review Required
- **Sidebar Cleanup**: I will remove Model, Aspect Ratio, and Style selectors from the Sidebar. The Sidebar will mainly serve for navigation (Explore, Create, Bookmarks) and potentially "Advanced" settings if any remain.
- **State Management**: Key generation states (`model`, `aspectRatio`, `style`) will be lifted to `App.tsx` to be shared between the Prompt Bar and the generation logic.

## Proposed Changes

### 1. State Management (`App.tsx`)
#### [MODIFY] `App.tsx`
- Lift the following state variables from `Sidebar.tsx` to `App.tsx`:
  - `aspectRatio` (already partially there, but need full control)
  - `style` (StylePreset)
- Pass these states and their setters to `PromptBar`.

### 2. Prompt Bar Redesign (`components/PromptBar.tsx`)
#### [MODIFY] `components/PromptBar.tsx`
- **Container**: Change to a floating, glassmorphism "pill" or rounded panel design.
- **Layout**:
  - **Input Area**: Large, clear text input.
  - **Controls Row**:
    - **Model Selector**: Dropdown to select Gemini 2.5, Imagen 3, etc.
    - **Aspect Ratio**: Dropdown for 16:9, 1:1, 9:16, etc.
    - **Style**: Dropdown/Popover for styles (Cinematic, Digital Art).
    - **Generate Button**: Premium gradient button.
- **Visuals**: Use `lucide-react` icons and high-quality Tailwind styling (borders, shadows, gradients).

### 3. Sidebar Cleanup (`components/Sidebar.tsx`)
#### [MODIFY] `components/Sidebar.tsx`
- Remove `ModelSelector`.
- Remove `ImageDimensionSelector`.
- Remove `StyleDropdown`.
- Keep `PromptEnhanceDropdown` (maybe move to Prompt Bar "More" menu later, but for now keep or remove if clutter). *Decision: Move Prompt Enhance to Prompt Bar "Settings" or "More" to fully clean up Sidebar.*
- The Sidebar will now focus on Navigation and History/Gallery stats.

### 4. Component Updates
#### [DELETE] `components/ModelSelector.tsx` (Logic moved to PromptBar or kept as sub-component used by PromptBar)
- *Refinement*: I will adapt `ModelSelector` to be used *inside* the Prompt Bar or rewrite the selector logic within `PromptBar` for a tighter UI integration.

## Verification Plan
### Manual Verification
1.  **Visual Check**: Verify the new Prompt Bar looks premium and resembles the Firefly aesthetic.
2.  **Functionality**:
    - Change Model in Prompt Bar -> Verify `App.tsx` state updates.
    - Change Aspect Ratio -> Verify state updates.
    - Generate Image -> Verify correct Model and Aspect Ratio are sent to API.
3.  **Responsiveness**: Ensure the bar works on mobile (stacking controls if needed).
