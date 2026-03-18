// ===== Canvas & constants =====
const canvas = document.getElementById('canvas');
const ctx    = canvas.getContext('2d');
const COLS   = 20;
const ROWS   = 20;
const CELL   = canvas.width / COLS; // 20px per cell

const COLOR_HEAD = '#4ade80';
const COLOR_BODY = '#22c55e';
const COLOR_FOOD = '#f87171';
const COLOR_GRID = '#161b22';

// ===== Difficulty =====
// speed = interval in ms (higher = slower)
let speed = 180;

document.querySelectorAll('.diff-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (running) return; // only change difficulty when not playing
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    speed = parseInt(btn.dataset.speed);
  });
});

// ===== Game state =====
let snake, dir, nextDir, food, score, running, paused, loop;

// Persist best score across sessions
let best = parseInt(localStorage.getItem('snake_best') || '0');
document.getElementById('best').textContent = best;

// ===== Init / restart =====
function init() {
  snake   = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  dir     = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };
  score   = 0;
  running = true;
  paused  = false;

  document.getElementById('score').textContent = 0;
  document.getElementById('message').textContent = '';
  document.getElementById('btn-pause').textContent = '⏸';
  document.getElementById('btn-pause').disabled = false;
  hideOverlay();
  placeFood();
  clearInterval(loop);
  loop = setInterval(tick, speed);
  draw();
}

// Place food at a random empty cell.
// Enumerates all empty cells to avoid infinite loop on full board.
function placeFood() {
  const empty = [];
  for (let x = 0; x < COLS; x++) {
    for (let y = 0; y < ROWS; y++) {
      if (!snake.some(s => s.x === x && s.y === y)) empty.push({ x, y });
    }
  }
  if (empty.length === 0) return; // board full — player wins
  food = empty[Math.floor(Math.random() * empty.length)];
}

// ===== Game loop =====
function tick() {
  dir = nextDir;
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  // Hit wall
  if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) return gameOver();
  // Hit self (exclude tail that will be removed this tick)
  if (snake.slice(0, -1).some(s => s.x === head.x && s.y === head.y)) return gameOver();

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    document.getElementById('score').textContent = score;
    if (score > best) {
      best = score;
      localStorage.setItem('snake_best', best);
      document.getElementById('best').textContent = best;
    }
    placeFood();
    if (!food) { gameOver(); return; } // board full
  } else {
    snake.pop();
  }

  draw();
}

// ===== Pause / resume =====
function togglePause() {
  if (!running) return;
  paused = !paused;
  const btn = document.getElementById('btn-pause');
  if (paused) {
    clearInterval(loop);
    btn.textContent = '▶';
    document.getElementById('message').textContent = '已暂停 — 按 P 或空格继续';
    drawPaused();
  } else {
    document.getElementById('message').textContent = '';
    loop = setInterval(tick, speed); // use current speed setting
    draw();
  }
}

function drawPaused() {
  draw();
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 22px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('⏸  已暂停', canvas.width / 2, canvas.height / 2);
  ctx.font = '13px system-ui';
  ctx.fillStyle = '#475569';
  ctx.fillText('按 P 或空格继续', canvas.width / 2, canvas.height / 2 + 28);
}

// ===== Game over =====
function gameOver() {
  clearInterval(loop);
  running = false;
  document.getElementById('btn-pause').disabled = true;
  drawGameOver();
  showOverlay(score, best);
}

// ===== Overlay =====
function showOverlay(finalScore, highScore) {
  document.getElementById('overlay-score').textContent = finalScore;
  document.getElementById('overlay-best').textContent  = highScore;
  const overlay = document.getElementById('overlay');
  overlay.classList.remove('hidden');
  requestAnimationFrame(() => overlay.classList.add('visible'));
}

function hideOverlay() {
  const overlay = document.getElementById('overlay');
  overlay.classList.remove('visible');
  overlay.classList.add('hidden');
}

// ===== Rendering =====
function draw() {
  ctx.fillStyle = '#0d1117';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grid
  ctx.strokeStyle = COLOR_GRID;
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= COLS; i++) {
    ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, canvas.height); ctx.stroke();
  }
  for (let j = 0; j <= ROWS; j++) {
    ctx.beginPath(); ctx.moveTo(0, j * CELL); ctx.lineTo(canvas.width, j * CELL); ctx.stroke();
  }

  // Food (glowing circle)
  if (food) {
    ctx.shadowColor = '#f87171';
    ctx.shadowBlur  = 10;
    ctx.fillStyle   = COLOR_FOOD;
    ctx.beginPath();
    ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Snake
  snake.forEach((seg, i) => {
    if (i === 0) { ctx.shadowColor = COLOR_HEAD; ctx.shadowBlur = 12; }
    ctx.fillStyle = i === 0 ? COLOR_HEAD : COLOR_BODY;
    roundRect(ctx, seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2, i === 0 ? 5 : 3);
    ctx.fill();
    ctx.shadowBlur = 0;
  });
}

function drawGameOver() {
  draw();
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Helper: rounded rect path
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ===== Keyboard =====
const KEY_MAP = {
  ArrowUp:    { x: 0,  y: -1 },
  ArrowDown:  { x: 0,  y:  1 },
  ArrowLeft:  { x: -1, y:  0 },
  ArrowRight: { x: 1,  y:  0 },
  w: { x: 0, y: -1 }, s: { x: 0, y: 1 },
  a: { x: -1, y: 0 }, d: { x: 1, y: 0 },
};

document.addEventListener('keydown', e => {
  if (e.key === ' ') {
    e.preventDefault();
    if (!running) { init(); return; }
    togglePause(); return;
  }
  if (e.key === 'p' || e.key === 'P') { e.preventDefault(); togglePause(); return; }
  if (!running || paused) return;
  const d = KEY_MAP[e.key];
  if (!d) return;
  e.preventDefault();
  if (d.x !== -nextDir.x || d.y !== -nextDir.y) nextDir = d;
});

// ===== Canvas click to start =====
canvas.addEventListener('click', () => { if (!running) init(); });

// ===== D-pad =====
const BTN_MAP = {
  'btn-up':    { x: 0,  y: -1 },
  'btn-down':  { x: 0,  y:  1 },
  'btn-left':  { x: -1, y:  0 },
  'btn-right': { x: 1,  y:  0 },
};
Object.entries(BTN_MAP).forEach(([id, d]) => {
  const el = document.getElementById(id);
  // Use touchstart for snappier mobile response
  const handler = (e) => {
    e.preventDefault();
    if (!running) { init(); return; }
    if (paused) return;
    if (d.x !== -nextDir.x || d.y !== -nextDir.y) nextDir = d;
  };
  el.addEventListener('touchstart', handler, { passive: false });
  el.addEventListener('click', handler);
});

// ===== Overlay buttons =====
document.getElementById('btn-restart').addEventListener('click', init);
document.getElementById('btn-close-overlay').addEventListener('click', hideOverlay);
document.getElementById('btn-pause').addEventListener('click', togglePause);

// ===== Touch swipe on canvas =====
let touchStart = null;
canvas.addEventListener('touchstart', e => {
  touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchend', e => {
  if (!touchStart) return;
  const dx = e.changedTouches[0].clientX - touchStart.x;
  const dy = e.changedTouches[0].clientY - touchStart.y;
  touchStart = null;
  if (Math.abs(dx) < 10 && Math.abs(dy) < 10) { if (!running) init(); return; }
  if (!running || paused) return;
  const d = Math.abs(dx) > Math.abs(dy)
    ? (dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 })
    : (dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 });
  if (d.x !== -nextDir.x || d.y !== -nextDir.y) nextDir = d;
  e.preventDefault();
}, { passive: false });

// ===== Initial waiting screen =====
(function drawWaiting() {
  ctx.fillStyle = '#0d1117';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = COLOR_GRID;
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= COLS; i++) {
    ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, canvas.height); ctx.stroke();
  }
  for (let j = 0; j <= ROWS; j++) {
    ctx.beginPath(); ctx.moveTo(0, j * CELL); ctx.lineTo(canvas.width, j * CELL); ctx.stroke();
  }
  // Center prompt
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 16px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('按空格键 / 点击开始', canvas.width / 2, canvas.height / 2);
})();
