# Random Aesthetic Generator 🎨✨

A lightweight, single-page web app that generates **beautiful color palettes (2–6 colors)** and **curated font pairings**, shows a **live preview**, supports **locking** values, includes a **dark mode toggle**, and lets you **save / load / search / delete** your favorite aesthetics (persisted in `localStorage`). It also supports a **seed color** chosen from a **color wheel** and can **use it as the first swatch**.

---

## Features

### Palette & Font Generation
- 🎨 Generate **harmonious color palettes** (analogous or complementary)
- 🔢 Choose how many palette colors to generate: **2 to 6**
- 🧭 Pick a **starting color** from a color wheel and click **“Use as first swatch”**
- ✏️ Generate **curated Google Font pairings**
- ⚡ Fonts are loaded on-demand from Google Fonts

### Live Preview
- 👁️ Preview updates instantly with:
  - Background + text neutral colors
  - Swatch **#1** used for the headline color
  - Swatch **#2** (or #1 if not available) used for the button color

### Locking
- 🔒 Lock any swatch (Swatch 1–6), background, text, heading font, or body font
- 🔓 Unlock everything with one click

### Dark Mode
- 🌙 Toggle in the top-right corner
- Saves your theme preference in `localStorage`
- Uses `prefers-color-scheme` when no preference is saved

### Saving Library
- ⭐ Save your current aesthetic with a name:
  - Swatches (2–6)
  - Background + text
  - Fonts
  - Palette settings (count + seed configuration)
- 🔎 Search saved aesthetics
- ✅ Apply any saved aesthetic
- 🗑️ Delete one or clear all
- 📋 Copy any saved aesthetic as JSON

## Getting Started

### Run locally (quick)
1. Download / clone this repo
2. Open `index.html` in your browser

### Run with a local server (recommended)
**VS Code Live Server**
1. Install the “Live Server” extension
2. Right-click `index.html` → **Open with Live Server**

**Node**
bash
npx serve .

### How to Use
## Generate an aesthetic

Click 🎨 Generate New Aesthetic to generate new colors + fonts

Use 🔒 locks to keep specific values unchanged between generations

### Choose how many colors (2–6)

In the Color Palette panel, use the Colors dropdown to select 2–6

The palette regenerates automatically using the selected count

### Pick a starting (seed) color

Use the color wheel input in the Color Palette panel

Click Use as first swatch

This sets Swatch 1 to your selected color

Swatch 1 is locked automatically so it stays consistent

Unlock it anytime if you want Swatch 1 to change again

### Save & manage aesthetics

Click 💾 Save

Name it, then save

In Saved Aesthetics:

Apply loads it instantly

Copy JSON copies the aesthetic to your clipboard

Delete removes it

Clear removes all saved 

### What Gets Saved

Each saved entry includes:

settings:

count (2–6)

useSeedFirst (true/false)

seedColor (hex)

colors:

swatches (array)

background, text

fonts:

heading, body

Example (Copy JSON output):

{
  "name": "Midnight Lavender",
  "settings": {
    "count": 4,
    "useSeedFirst": true,
    "seedColor": "#6366f1"
  },
  "colors": {
    "swatches": ["#6366F1", "#A855F7", "#F97316", "#22C55E"],
    "background": "#F5F6FA",
    "text": "#111827"
  },
  "fonts": {
    "heading": "DM Serif Display",
    "body": "DM Sans"
  }
}

## Persistence (localStorage)
### Saved aesthetics storage key

Saved aesthetics are stored under:

rag_saved_aesthetics_v2

### Theme storage key

Theme preference is stored under:

theme ("light" or "dark")

Note: localStorage is device + browser specific. Clearing site data removes saved aesthetics.

## Accessibility Notes

Text contrast badge is calculated using WCAG contrast ratio:

AAA: ≥ 4.5

AA: ≥ 3.0

Poor: < 3.0

## Customization
### Add more font pairs

Edit fontPairs in script.js:

const fontPairs = [
  { heading: "Playfair Display", body: "Source Sans Pro" },
  { heading: "Poppins", body: "Roboto" },
  { heading: "Your Heading Font", body: "Your Body Font" }
];

### Change palette generation behavior

Palette logic lives in:

generateSwatches(baseHue, count)

generateNeutrals(baseHue)

### Change how the preview uses colors

Preview mapping is in renderAesthetic():

headline uses swatches[0]

button uses swatches[1] (fallback to swatches[0])

## Ideas for Next Improvements (Optional)

Toggle “Seed mode” on/off explicitly

Rename saved aesthetics

Pin/favorite saved aesthetics

Export/Import .json file for backups/sharing

Encode palette into URL for shareable links

## License

No license included by default. If you want this to be open-source friendly, consider adding an MIT License.

## Project Structure

```text
.
├─ index.html
├─ styles.css
├─ script.js
└─ README.md