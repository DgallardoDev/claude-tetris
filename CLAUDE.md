# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running

Vanilla HTML5 Canvas + JS, no dependencies, build, linter, or tests. Open `index.html` directly, or serve statically (`python3 -m http.server 8000`) and visit http://localhost:8000. The README and UI text are in Spanish.

## Architecture

All logic is in `game.js` (single script, global state, no modules). It talks to fixed DOM ids in `index.html` (`board`, `next-canvas`, `score`, `lines`, `level`, `overlay`, `overlay-title`, `overlay-score`, `restart-btn`, `theme-toggle`, `skin-select`) — renaming either side breaks the other.

- State: module-level `let` vars (`board`, `current`, `next`, `score`, `lines`, `level`, `paused`, `gameOver`, `dropInterval`, ...) reset in `init()`. `board` is ROWS×COLS of 0 or a piece type 1–7; `COLORS` and `PIECES` are indexed by that same type number (index 0 is `null`).
- Piece lifecycle: `spawn()` promotes `next` to `current`, and calls `endGame()` if it collides immediately. `lockPiece()` = `merge()` → `clearLines()` → `spawn()`. Hard drop, soft drop and the gravity tick in `loop()` all end in `lockPiece()`.
- Loop: `requestAnimationFrame` `loop()` accumulates dt against `dropInterval` and calls `draw()` every frame. Pause/game over use `cancelAnimationFrame(animId)`; resume restarts `loop` manually.
- Input: a single `keydown` handler (uses `e.code`); movement always goes through `collide()`; rotation via `tryRotate()` (CW + horizontal kicks 0, ±1, ±2).
- Scoring/speed live in `clearLines()` (`LINE_SCORES` × level; level = lines/10 + 1; `dropInterval = max(100, 1000 - (level-1)*90)`), plus +1/cell soft drop and +2/cell hard drop.
- Theming: colors are CSS variables in `style.css` (`:root` = dark, `[data-theme="light"]` = light). `applyTheme()` in `game.js` sets `data-theme`, updates the toggle label and caches `--grid` in `gridColor` for `drawGrid()`. The choice persists in `localStorage` (`theme`, default dark).
- Skins: `skins.js` (loaded before `game.js`) defines global `SKINS` = `{retro, neon, pastel, pixel}`; each has `name`, `colors[]` (index 0 `null`, 1–7 per piece type), `bg` (canvas fill, `null` = CSS theme background), `grid` (grid color, `null` = theme `--grid`) and `drawBlock(context, x, y, colorIndex, size, alpha)`. `game.js` `drawBlock` delegates to `SKINS[currentSkin]`; `COLORS` is a `let` pointing at the active skin's colors; `clearCanvas()` paints `bg` on both board and next canvases. `applySkin()`/`loadSkin()` handle the `#skin-select` dropdown (styled in `skins.css`) and persist in `localStorage` (`skin`, default `retro`). Skins must reset `shadowBlur`/`shadowColor`/`globalAlpha` after drawing. To add a skin: add an entry to `SKINS` and a matching `<option value="key">` in `index.html`.
- Changing `COLS`, `ROWS` or `BLOCK` requires updating the `<canvas id="board">` `width`/`height` in `index.html` (COLS×BLOCK by ROWS×BLOCK). The next-piece canvas assumes a 4×4 grid of 30px blocks (120×120).
