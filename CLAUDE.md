# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running

Vanilla HTML5 Canvas + JS, no dependencies, build, linter, or tests. Open `index.html` directly, or serve statically (`python3 -m http.server 8000`) and visit http://localhost:8000. The README and UI text are in Spanish.

## Architecture

All logic is in `game.js` (single script, global state, no modules). It talks to fixed DOM ids in `index.html` (`board`, `next-canvas`, `score`, `lines`, `level`, `overlay`, `overlay-title`, `overlay-score`, `restart-btn`) — renaming either side breaks the other.

- State: module-level `let` vars (`board`, `current`, `next`, `score`, `lines`, `level`, `paused`, `gameOver`, `dropInterval`, ...) reset in `init()`. `board` is ROWS×COLS of 0 or a piece type 1–7; `COLORS` and `PIECES` are indexed by that same type number (index 0 is `null`).
- Piece lifecycle: `spawn()` promotes `next` to `current`, and calls `endGame()` if it collides immediately. `lockPiece()` = `merge()` → `clearLines()` → `spawn()`. Hard drop, soft drop and the gravity tick in `loop()` all end in `lockPiece()`.
- Loop: `requestAnimationFrame` `loop()` accumulates dt against `dropInterval` and calls `draw()` every frame. Pause/game over use `cancelAnimationFrame(animId)`; resume restarts `loop` manually.
- Input: a single `keydown` handler (uses `e.code`); movement always goes through `collide()`; rotation via `tryRotate()` (CW + horizontal kicks 0, ±1, ±2).
- Scoring/speed live in `clearLines()` (`LINE_SCORES` × level; level = lines/10 + 1; `dropInterval = max(100, 1000 - (level-1)*90)`), plus +1/cell soft drop and +2/cell hard drop.
- Changing `COLS`, `ROWS` or `BLOCK` requires updating the `<canvas id="board">` `width`/`height` in `index.html` (COLS×BLOCK by ROWS×BLOCK). The next-piece canvas assumes a 4×4 grid of 30px blocks (120×120).
