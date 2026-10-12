'use strict';

// Skins visuales. Cada skin define:
//   name:      etiqueta en español para el selector
//   colors:    array indexado por tipo de pieza (0 = null, 1-7)
//   bg:        color de fondo de los canvas (null = el que da el CSS según el tema)
//   grid:      color de las líneas de la cuadrícula (null = variable CSS --grid)
//   drawBlock: (context, x, y, colorIndex, size, alpha) dibuja un bloque
// Para añadir un skin: agregar una entrada aquí (la clave aparece en #skin-select).

const SKINS = {
  retro: {
    name: 'Retro',
    colors: [null, '#4dd0e1', '#ffd54f', '#ba68c8', '#81c784', '#e57373', '#90caf9', '#ffb74d'],
    bg: null,
    grid: null,
    drawBlock(context, x, y, colorIndex, size, alpha) {
      if (!colorIndex) return;
      context.globalAlpha = alpha ?? 1;
      context.fillStyle = this.colors[colorIndex];
      context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
      context.fillStyle = 'rgba(255,255,255,0.12)';
      context.fillRect(x * size + 1, y * size + 1, size - 2, 4);
      context.globalAlpha = 1;
    },
  },

  neon: {
    name: 'Neón',
    colors: [null, '#00e5ff', '#ffee00', '#d500f9', '#00ff6a', '#ff1744', '#448aff', '#ff9100'],
    bg: '#000000',
    grid: '#2a2a3a',
    drawBlock(context, x, y, colorIndex, size, alpha) {
      if (!colorIndex) return;
      const color = this.colors[colorIndex];
      const px = x * size + 3, py = y * size + 3, s = size - 6;
      context.shadowColor = color;
      context.shadowBlur = 12;
      context.fillStyle = color;
      context.globalAlpha = (alpha ?? 1) * 0.35;
      context.fillRect(px, py, s, s);
      context.globalAlpha = alpha ?? 1;
      context.strokeStyle = color;
      context.lineWidth = 2;
      context.strokeRect(px, py, s, s);
      context.shadowBlur = 0;
      context.shadowColor = 'transparent';
      context.globalAlpha = 1;
    },
  },

  pastel: {
    name: 'Pastel',
    colors: [null, '#b5ead7', '#fdf2b3', '#d7bde2', '#c7e9b0', '#ffb3ba', '#bae1ff', '#ffdac1'],
    bg: null,
    grid: null,
    drawBlock(context, x, y, colorIndex, size, alpha) {
      if (!colorIndex) return;
      const px = x * size + 2, py = y * size + 2, s = size - 4, r = 7;
      context.globalAlpha = alpha ?? 1;
      context.fillStyle = this.colors[colorIndex];
      context.beginPath();
      if (context.roundRect) context.roundRect(px, py, s, s, r);
      else context.rect(px, py, s, s);
      context.fill();
      context.strokeStyle = 'rgba(0,0,0,0.18)';
      context.lineWidth = 1;
      context.stroke();
      context.fillStyle = 'rgba(255,255,255,0.45)';
      context.beginPath();
      if (context.roundRect) context.roundRect(px + 4, py + 3, s - 8, 5, 3);
      else context.rect(px + 4, py + 3, s - 8, 5);
      context.fill();
      context.globalAlpha = 1;
    },
  },

  pixel: {
    name: 'Pixel art',
    colors: [null, '#29b6f6', '#fdd835', '#ab47bc', '#66bb6a', '#ef5350', '#5c6bc0', '#ff9800'],
    bg: null,
    grid: null,
    drawBlock(context, x, y, colorIndex, size, alpha) {
      if (!colorIndex) return;
      const px = x * size, py = y * size, u = size / 6; // "píxel" de 5 px
      context.globalAlpha = alpha ?? 1;
      context.fillStyle = this.colors[colorIndex];
      context.fillRect(px + 1, py + 1, size - 2, size - 2);
      // textura: luz arriba/izquierda, sombra abajo/derecha, puntos en damero
      context.fillStyle = 'rgba(255,255,255,0.35)';
      context.fillRect(px + 1, py + 1, size - 2, u);
      context.fillRect(px + 1, py + 1, u, size - 2);
      context.fillStyle = 'rgba(0,0,0,0.35)';
      context.fillRect(px + 1, py + size - 1 - u, size - 2, u);
      context.fillRect(px + size - 1 - u, py + 1, u, size - 2);
      context.fillStyle = 'rgba(0,0,0,0.15)';
      for (let i = 1; i < 5; i++)
        for (let j = 1; j < 5; j++)
          if ((i + j) % 2 === 0) context.fillRect(px + i * u, py + j * u, u, u);
      context.globalAlpha = 1;
    },
  },
};
