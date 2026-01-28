# 🎨 Asset Creation Guide for "Try On" Prototype

To make the "Try On" feature look realistic, we need **three files** for every shirt. For the prototype, we only need to do this **ONCE** for one shirt (e.g., a Black T-Shirt).

## 1. The Three Required Files

| File Type | Filename Example | Purpose | Visual Description |
| :--- | :--- | :--- | :--- |
| **1. Base Image** | `shirt-black-base.png` | The visible shirt background. | Normal color photo of the shirt. |
| **2. Displacement Map** | `shirt-black-disp.png` | Bends the design around wrinkles. | **High Contrast B&W**. White = Peaks, Black = Valleys. |
| **3. Shadow Map** | `shirt-black-shadow.png` | Adds realistic shadows *over* the design. | **Soft B&W**. Shows folds/shadows without the fabric color. |

---

## 2. How to Create Them (Using Photoshop / Photopea.com)

You can use **[Photopea.com](https://www.photopea.com/)** (free, runs in browser) to do this easily.

<!-- ### Step A: Prepare the Base Image -->
1.  Open your shirt photo.
2.  Crop/Resize it to a standard size (e.g., `1024x1024` or `800x1200`).
3.  Save as **`base.png`**.

### Step B: Create the Displacement Map (The "Bender")
1.  With `base.png` open:
2.  **Desaturate**: `Image > Adjustments > Desaturate` (Cmd+Shift+U). The image is now Black & White.
3.  **Increase Contrast**: `Image > Adjustments > Levels` (Cmd+L) or `Brightness/Contrast`.
    *   Push the sliders so the **wrinkles are very visible**.
    *   Dark folds should be near-black.
    *   High/flat points should be near-white.
4.  **Blur (Important)**: `Filter > Blur > Gaussian Blur`.
    *   Set Radius to **1.0px - 2.0px**.
    *   *Why?* If the map is too sharp, the design will look jagged/pixelated. Soft wrinkles bend better.
5.  Save as **`displacement.png`**.

### Step C: Create the Shadow Map (The "Shader")
1.  Go back to the Desaturated (B&W) step (undo the high contrast/blur if needed, or start from base).
2.  **Levels**: Adjust so the "flat" parts of the shirt are pure **White** (or very light gray).
    *   We want the ink to show through clearly on flat areas.
    *   Only the **shadows/folds** should remain dark/gray.
3.  **No Blur**: Keep this one sharp (or very slight blur), so detailed fabric texture (if any) is preserved.
4.  Save as **`shadow.png`**.

---

## 3. Checklist for Prototype
Before we code, please prepare a folder with these 3 files for **one** shirt (ideally a Black or Dark Grey Tee, as that's the hardest to get right):
- [ ] `black-tee-base.png`
- [ ] `black-tee-disp.png`
- [ ] `black-tee-shadow.png`

Put them in `public/assets/tryon/`.
