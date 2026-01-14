# Phase 3: Editor Undo/Redo - Implementation Plan

## Goal
Add Undo/Redo functionality to the image editor (EditModal), allowing users to step backward and forward through their edits with visual feedback.

## Current State Analysis

### EditModal State Variables
The editor currently tracks these editable properties:
- `scale` - Image zoom (50-200%)
- `rotation` - Image rotation (-180 to 180°)
- `brightness` - Brightness (0-200%)
- `contrast` - Contrast (0-200%)
- `saturation` - Saturation (0-200%)
- `selectedFilter` - Applied filter (none, grayscale, sepia, etc.)
- `selectedCrop` - Print size crop (none, 8x10, 11x14, 12x16, 16x20)
- `clipPath` - Shape clipping (none, circle, ellipse, etc.)
- `customClipPath` - Custom CSS clip-path value

### Current Buttons (Top Toolbar)
- Reset - Resets all values to defaults
- Save Changes - Saves the edited image
- Apply on Mockup - Applies edits and opens mockup
- Close (X) - Closes the editor

---

## Proposed Changes

### 1. History State Management

**New State Variables:**
```tsx
// History tracking
const [history, setHistory] = useState<EditorState[]>([]);
const [historyIndex, setHistoryIndex] = useState(-1);

interface EditorState {
  scale: number;
  rotation: number;
  brightness: number;
  contrast: number;
  saturation: number;
  selectedFilter: string;
  selectedCrop: string;
  clipPath: string;
  customClipPath: string;
}
```

**Initial History Setup:**
- When EditModal opens, capture initial state in history
- Set historyIndex to 0

### 2. History Recording

**When to Record:**
- Debounce slider changes (300ms after user stops dragging)
- Immediate recording for button clicks (filters, crops, clip paths)
- Only record if state actually changed from current history entry

**Implementation:**
```tsx
const recordHistory = useCallback(() => {
  const currentState: EditorState = {
    scale,
    rotation,
    brightness,
    contrast,
    saturation,
    selectedFilter,
    selectedCrop,
    clipPath,
    customClipPath,
  };
  
  // Remove any "future" history if we're not at the end
  const newHistory = history.slice(0, historyIndex + 1);
  newHistory.push(currentState);
  
  setHistory(newHistory);
  setHistoryIndex(newHistory.length - 1);
}, [scale, rotation, brightness, /* ...other dependencies */]);
```

### 3. Undo/Redo Functions

```tsx
const canUndo = historyIndex > 0;
const canRedo = historyIndex < history.length - 1;

const handleUndo = () => {
  if (!canUndo) return;
  
  const newIndex = historyIndex - 1;
  const previousState = history[newIndex];
  
  // Restore state
  setScale(previousState.scale);
  setRotation(previousState.rotation);
  setBrightness(previousState.brightness);
  // ... restore all properties
  
  setHistoryIndex(newIndex);
};

const handleRedo = () => {
  if (!canRedo) return;
  
  const newIndex = historyIndex + 1;
  const nextState = history[newIndex];
  
  // Restore state
  // ... same as undo
  
  setHistoryIndex(newIndex);
};
```

### 4. UI Changes

**Toolbar Layout (New):**
```
[← Undo] [Redo →]  |  [Reset] [Save Changes] [Apply on Mockup] [X]
```

**Button Specs:**
- **Undo**: Lucide `Undo2` icon, disabled when `historyIndex === 0`
- **Redo**: Lucide `Redo2` icon, disabled when `historyIndex === history.length - 1`
- **Separator**: `<div className="h-6 w-px bg-white/10" />`

**Disabled Style:**
```tsx
className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
  canUndo 
    ? 'text-zinc-300 hover:text-white hover:bg-white/5' 
    : 'text-zinc-600 cursor-not-allowed opacity-50'
}`}
disabled={!canUndo}
```

### 5. Reset Button Enhancement

Reset should:
1. Clear history
2. Reset to initial state
3. Add initial state as first history entry

---

## Implementation Steps

1. **Add imports:**
   ```tsx
   import { Undo2, Redo2 } from 'lucide-react';
   ```

2. **Add state variables** (history, historyIndex)

3. **Create EditorState interface**

4. **Implement recordHistory function** with debouncing

5. **Implement handleUndo and handleRedo**

6. **Update toolbar UI** with Undo/Redo buttons

7. **Add useEffect hooks** to record history on state changes

8. **Update handleReset** to work with history

9. **Add keyboard shortcuts** (Ctrl+Z for Undo, Ctrl+Y/Ctrl+Shift+Z for Redo)

---

## Keyboard Shortcuts

```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
        e.preventDefault();
        handleRedo();
      }
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [handleUndo, handleRedo]);
```

---

## Verification

1. Open editor
2. Make several edits (scale, rotation, brightness, filters)
3. Click Undo - should step backward through changes
4. Click Redo - should step forward
5. Make new edit while in middle of history - should clear future history
6. Test keyboard shortcuts (Ctrl+Z, Ctrl+Y)
7. Verify disabled states on Undo/Redo buttons
8. Test Reset clears history properly

---

## File to Modify

### [MODIFY] [EditModal.tsx](file:///c:/Users/mhdha_zeezxk7/Downloads/Programming/Portfolio/DaVinci/components/EditModal.tsx)

**Lines to modify:**
- Line 2: Add `Undo2, Redo2` imports
- Line 12-24: Add history state variables after existing state
- Line 61-76: Update `handleReset`
- Line 144-166: Update toolbar section with Undo/Redo buttons
- Add new functions: `recordHistory`, `handleUndo`, `handleRedo`
- Add useEffects: history recording, keyboard shortcuts

**Estimated changes:** ~150 lines added/modified
