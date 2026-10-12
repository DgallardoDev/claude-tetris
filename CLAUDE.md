# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running

Vanilla HTML5 Canvas + JS, no dependencies, build, linter, or tests. Open `index.html` directly, or serve statically (`python3 -m http.server 8000`) and visit http://localhost:8000. The README and UI text are in Spanish.

## Architecture

All logic is in `game.js` (single script, global state, no modules). It talks to fixed DOM ids in `index.html` (`board`, `next-canvas`, `score`, `lines`, `level`, `overlay`, `overlay-title`, `overlay-score`, `restart-btn`, `theme-toggle`) — renaming either side breaks the other.

- State: module-level `let` vars (`board`, `current`, `next`, `score`, `lines`, `level`, `paused`, `gameOver`, `dropInterval`, ...) reset in `init()`. `board` is ROWS×COLS of 0 or a piece type 1–7; `COLORS` and `PIECES` are indexed by that same type number (index 0 is `null`).
- Piece lifecycle: `spawn()` promotes `next` to `current`, and calls `endGame()` if it collides immediately. `lockPiece()` = `merge()` → `clearLines()` → `spawn()`. Hard drop, soft drop and the gravity tick in `loop()` all end in `lockPiece()`.
- Loop: `requestAnimationFrame` `loop()` accumulates dt against `dropInterval` and calls `draw()` every frame. Pause/game over use `cancelAnimationFrame(animId)`; resume restarts `loop` manually.
- Input: a single `keydown` handler (uses `e.code`); movement always goes through `collide()`; rotation via `tryRotate()` (CW + horizontal kicks 0, ±1, ±2).
- Scoring/speed live in `clearLines()` (`LINE_SCORES` × level; level = lines/10 + 1; `dropInterval = max(100, 1000 - (level-1)*90)`), plus +1/cell soft drop and +2/cell hard drop.
- Theming: colors are CSS variables in `style.css` (`:root` = dark, `[data-theme="light"]` = light). `applyTheme()` in `game.js` sets `data-theme`, updates the toggle label and caches `--grid` in `gridColor` for `drawGrid()`. The choice persists in `localStorage` (`theme`, default dark).
- Startup flow: `game.js` no longer calls `init()` on load. It sets an idle state (empty board drawn, `gameOver = true` so keys are ignored, no loop) and `records.js` shows `#start-screen`; its `#play-btn` calls `init()`.
- Records (`records.js`, `records.css`, loaded after `game.js`): global `Records` with hooks called from `game.js` (guarded by `typeof Records`): `onStart()` in `init()`, `onLock(cleared)` at the end of `clearLines()` (combo = consecutive locks that clear lines), `onGameOver(score, lines)` in `endGame()`. localStorage key `records` = `{ top: [{name, score}] (max 5, desc), bestCombo, maxLines }`. DOM ids: `start-screen`, `play-btn`, `start-records`, `start-best-combo`, `start-max-lines`, `start-reset-btn`, `name-form`, `name-input`, `name-save`, `overlay-records-box`, `overlay-records`, `overlay-stats`, `overlay-reset-btn`. The global keydown handler ignores events whose target is an `<input>`.
- Changing `COLS`, `ROWS` or `BLOCK` requires updating the `<canvas id="board">` `width`/`height` in `index.html` (COLS×BLOCK by ROWS×BLOCK). The next-piece canvas assumes a 4×4 grid of 30px blocks (120×120).
