'use strict';

// Tabla de records local. game.js llama a Records.onStart / onLock / onGameOver.
const Records = (() => {
  const KEY = 'records';
  const MAX_TOP = 5;
  const MAX_NAME = 12;

  const startScreen = document.getElementById('start-screen');
  const playBtn = document.getElementById('play-btn');
  const startList = document.getElementById('start-records');
  const startCombo = document.getElementById('start-best-combo');
  const startLines = document.getElementById('start-max-lines');
  const startReset = document.getElementById('start-reset-btn');
  const overlayList = document.getElementById('overlay-records');
  const overlayStats = document.getElementById('overlay-stats');
  const overlayReset = document.getElementById('overlay-reset-btn');
  const nameForm = document.getElementById('name-form');
  const nameInput = document.getElementById('name-input');
  const restart = document.getElementById('restart-btn');

  let combo = 0;
  let pending = null; // { score } mientras se espera el nombre
  let highlight = -1; // índice de la fila nueva en el top

  function empty() { return { top: [], bestCombo: 0, maxLines: 0 }; }

  function load() {
    try {
      const d = JSON.parse(localStorage.getItem(KEY));
      if (!d || typeof d !== 'object') return empty();
      const top = Array.isArray(d.top) ? d.top
        .filter(e => e && typeof e.score === 'number')
        .map(e => ({ name: String(e.name).slice(0, MAX_NAME), score: e.score }))
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_TOP) : [];
      return { top, bestCombo: +d.bestCombo || 0, maxLines: +d.maxLines || 0 };
    } catch { return empty(); }
  }

  function save(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
  }

  function qualifies(data, s) {
    return s > 0 && (data.top.length < MAX_TOP || s > data.top[data.top.length - 1].score);
  }

  function render(list, data, hl) {
    list.textContent = '';
    if (!data.top.length) {
      const li = document.createElement('li');
      li.className = 'rec-empty';
      li.textContent = 'Sin records todavía';
      list.appendChild(li);
      return;
    }
    data.top.forEach((e, i) => {
      const li = document.createElement('li');
      if (i === hl) li.className = 'rec-new';
      const n = document.createElement('span');
      n.className = 'rec-name';
      n.textContent = e.name;
      const s = document.createElement('span');
      s.className = 'rec-score';
      s.textContent = e.score.toLocaleString();
      li.append(n, s);
      list.appendChild(li);
    });
  }

  function refresh() {
    const data = load();
    render(startList, data, -1);
    startCombo.textContent = data.bestCombo;
    startLines.textContent = data.maxLines;
  }

  function showStart() {
    refresh();
    startScreen.classList.remove('hidden');
    playBtn.focus();
  }

  function renderOverlay() {
    const data = load();
    render(overlayList, data, highlight);
    overlayStats.textContent = `Mejor combo: ${data.bestCombo} · Líneas máx: ${data.maxLines}`;
  }

  function confirmName() {
    if (!pending) return;
    const data = load();
    const name = nameInput.value.trim().slice(0, MAX_NAME) || 'Jugador';
    // la entrada ya se guardó al terminar la partida; aquí solo se renombra
    const e = data.top[pending.idx];
    if (e && e.score === pending.score) { e.name = name; save(data); }
    pending = null;
    nameForm.classList.add('hidden');
    renderOverlay();
    nameInput.blur(); // Space no debe activar ningún botón
  }

  function resetRecords() {
    if (!confirm('¿Borrar todos los records?')) return;
    try { localStorage.removeItem(KEY); } catch {}
    pending = null;
    highlight = -1;
    nameForm.classList.add('hidden');
    refresh();
    renderOverlay();
  }

  // ---- Hooks de game.js ----
  function onStart() {
    combo = 0;
    bestSession = 0;
    pending = null;
    highlight = -1;
    startScreen.classList.add('hidden');
    nameForm.classList.add('hidden');
    overlayList.parentElement.classList.add('hidden');
  }

  function onLock(cleared) {
    combo = cleared ? combo + 1 : 0;
    if (combo > 0) bestSession = Math.max(bestSession, combo);
  }
  let bestSession = 0;

  function onGameOver(score, lines) {
    const data = load();
    data.bestCombo = Math.max(data.bestCombo, bestSession);
    data.maxLines = Math.max(data.maxLines, lines);
    bestSession = 0;
    combo = 0;
    highlight = -1;
    if (qualifies(data, score)) {
      // se guarda ya con nombre por defecto (no se pierde si se cierra la pestaña)
      let idx = data.top.findIndex(e => e.score < score); // tras los empates
      if (idx === -1) idx = data.top.length;
      data.top.splice(idx, 0, { name: 'Jugador', score });
      data.top = data.top.slice(0, MAX_TOP);
      highlight = idx;
      pending = { idx, score };
      nameInput.value = 'Jugador';
      nameForm.classList.remove('hidden');
    }
    save(data);
    overlayList.parentElement.classList.remove('hidden');
    renderOverlay();
    // retraso: evita que Space/flechas auto-repetidos de la última caída caigan en el input
    if (pending) setTimeout(() => { if (pending) { nameInput.focus(); nameInput.select(); } }, 600);
  }

  playBtn.addEventListener('click', () => { playBtn.blur(); init(); });
  startReset.addEventListener('click', () => { startReset.blur(); resetRecords(); });
  overlayReset.addEventListener('click', () => { overlayReset.blur(); resetRecords(); });
  nameForm.addEventListener('submit', e => { e.preventDefault(); confirmName(); });
  restart.addEventListener('click', () => {
    // si el jugador reinicia sin confirmar, guardar con el nombre por defecto
    if (pending) confirmName();
    restart.blur();
  }, true);

  showStart();

  return { onStart, onLock, onGameOver };
})();
