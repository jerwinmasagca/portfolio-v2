# Theme Switching Guide: How to Toggle Designs

You can switch your portfolio's layout back and forth instantly using the pre-programmed theme switcher script.

---

## 1. Quick Switch Commands

Open your terminal in VS Code (ensure you are inside the `PORTFOLIO_JERWIN` directory) and run either command:

### Option A: The Animated Watercolor Theme
This is the hand-painted watercolor wash background with fluid panning motion and paper texture:
```powershell
.\switch_design.ps1 -design watercolor
```

### Option B: The Clean Dark Dashboard Theme
This is the original solid dark background (`#030712`) with neon floating glow orbs:
```powershell
.\switch_design.ps1 -design dashboard
```

---

## 2. How it Works Under the Hood

The script reads files from the `backups/` directory and overwrites the active frontend files:
- `src/app/page.tsx` (Grid structure, sections, and floating elements)
- `src/app/layout.tsx` (Navbar links, availability badge, and layout body classes)
- `src/app/globals.css` (Background colors, images, animations, and noise texturing)

Your running local server (`npm run dev`) will automatically detect the file swap and hot-reload your browser tab in under a second! No server restart is required.
