'use strict';

// Menú de pausa (#pause-menu). Usa globals de game.js: startLevel, init, togglePause, paused.
(function () {
  const menu = document.getElementById('pause-menu');
  const resumeBtn = document.getElementById('pause-resume');
  const restartBtn2 = document.getElementById('pause-restart');
  const controlsBtn = document.getElementById('pause-controls-btn');
  const controlsList = document.getElementById('pause-controls');
  const levelSelect = document.getElementById('start-level');

  for (let i = 1; i <= 10; i++) {
    const opt = document.createElement('option');
    opt.value = String(i);
    opt.textContent = String(i);
    levelSelect.appendChild(opt);
  }
  levelSelect.value = String(startLevel);

  function blurAll() {
    if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
  }

  function show() {
    controlsList.classList.add('hidden');
    controlsBtn.textContent = 'Ver controles';
    controlsBtn.setAttribute('aria-expanded', 'false');
    levelSelect.value = String(startLevel);
    menu.classList.remove('hidden');
  }

  function hide() {
    menu.classList.add('hidden');
    blurAll();
  }

  window.pauseUI = { show, hide };

  resumeBtn.addEventListener('click', () => { if (paused) togglePause(); });

  restartBtn2.addEventListener('click', () => {
    init();
  });

  controlsBtn.addEventListener('click', () => {
    const open = controlsList.classList.toggle('hidden') === false;
    controlsBtn.textContent = open ? 'Ocultar controles' : 'Ver controles';
    controlsBtn.setAttribute('aria-expanded', String(open));
    controlsBtn.blur();
  });

  levelSelect.addEventListener('change', () => {
    startLevel = parseInt(levelSelect.value, 10) || 1;
    try { localStorage.setItem('startLevel', String(startLevel)); } catch {}
    levelSelect.blur();
  });

  // Con el menú abierto, evita que Space/flechas/Enter activen controles o muevan la página.
  document.addEventListener('keydown', e => {
    if (menu.classList.contains('hidden')) return;
    if (e.target === levelSelect) return;
    // Los botones del menú siguen activables con teclado (Enter/Space).
    if (e.target instanceof HTMLButtonElement && menu.contains(e.target) && (e.code === 'Enter' || e.code === 'Space')) return;
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.code)) {
      e.preventDefault();
      blurAll();
    }
  });
})();
