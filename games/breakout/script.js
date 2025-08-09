

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const homeBtn = document.getElementById('homeBtn');
const overlay = document.getElementById('overlay');

const LOGICAL_WIDTH = 800;
const LOGICAL_HEIGHT = 480;

// Game state
let paddle = { w: 120, h: 14, x: LOGICAL_WIDTH/2 - 60, y: LOGICAL_HEIGHT - 40, speed: 8 };
let ball = { x: LOGICAL_WIDTH/2, y: LOGICAL_HEIGHT - 60, r: 8, vx: 0, vy: 0, speed: 5, launched: false };
let bricks = [];
let rows = 5;
let cols = 9;
let brickPadding = 8;
let brickOffsetTop = 40;
let brickOffsetLeft = 40;
let brickWidth = 0, brickHeight = 22;
let score = 0;
let lives = 3;
let running = false;
let animationId = null;
let keys = { left: false, right: false };

// --- Canvas resize / high-DPI handling ---
function resizeCanvas() {
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  const parentRect = canvas.parentElement.getBoundingClientRect();
  const cssWidth = Math.max(200, parentRect.width);
  const cssHeight = Math.round((LOGICAL_HEIGHT / LOGICAL_WIDTH) * cssWidth);

  canvas.style.width = cssWidth + 'px';
  canvas.style.height = cssHeight + 'px';

  canvas.width = Math.round(LOGICAL_WIDTH * ratio);
  canvas.height = Math.round(LOGICAL_HEIGHT * ratio);

  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

// --- Layout computations ---
function computeLayout() {
  brickWidth = Math.floor((LOGICAL_WIDTH - brickOffsetLeft*2 - (cols-1)*brickPadding) / cols);
  brickHeight = 22;
}

// --- Bricks initialization ---
function initBricks() {
  bricks = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = brickOffsetLeft + c * (brickWidth + brickPadding);
      const y = brickOffsetTop + r * (brickHeight + brickPadding);
      bricks.push({ x, y, w: brickWidth, h: brickHeight, alive: true, color: getBrickColor(r) });
    }
  }
}
function getBrickColor(row) {
  const palette = ['#ff7b7b','#ffb86b','#ffd56b','#8fe388','#6fd3ff'];
  return palette[row % palette.length];
}

// --- Draw helpers ---
function drawRoundedRect(x,y,w,h,r, fillStyle) {
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
}
function draw() {
  ctx.clearRect(0,0,LOGICAL_WIDTH,LOGICAL_HEIGHT);

  for (const b of bricks) {
    if (!b.alive) continue;
    drawRoundedRect(b.x, b.y, b.w, b.h, 6, b.color);
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.strokeRect(b.x, b.y, b.w, b.h);
  }

  drawRoundedRect(paddle.x, paddle.y, paddle.w, paddle.h, 6, '#ffffff');

  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2);
  ctx.fillStyle = '#ffd86b';
  ctx.fill();
  ctx.closePath();
}

// --- Pause the game (show overlay) ---
function stopGame() {
  running = false;
  overlay.style.display = '';
  cancelAnimationFrame(animationId);
}

// --- Resume/start the game (hide overlay) ---
function startGame() {
  if (running) return;
  running = true;
  overlay.style.display = 'none';
  // hide start button UI so players don't click mid-run
  startBtn.style.display = 'none';
  restartBtn.style.display = 'none';
  animationId = requestAnimationFrame(loop);
  if (!ball.launched) launchBall();
}

// Called when player loses a life but still has lives remaining.
// We pause the loop and show the Start button so the player explicitly resumes.
function pauseForLifeLost() {
  // place the ball back on the paddle
  ball.launched = false;
  ball.vx = 0;
  ball.vy = 0;
  ball.x = paddle.x + paddle.w/2;
  ball.y = paddle.y - ball.r - 2;

  // stop the loop and show overlay with Start visible
  stopGame();
  startBtn.style.display = 'inline-block';
  restartBtn.style.display = 'none';
}

// --- Ball launch ---
function launchBall() {
  if (!ball.launched) {
    ball.vx = (Math.random() * 2 - 1) * ball.speed;
    ball.vy = -Math.abs(ball.speed);
    ball.launched = true;
  }
}

// --- Game physics & collisions ---
function update() {
  if (!running) return;
  if (keys.left) paddle.x -= paddle.speed;
  if (keys.right) paddle.x += paddle.speed;
  paddle.x = Math.max(10, Math.min(LOGICAL_WIDTH - paddle.w - 10, paddle.x));

  if (!ball.launched) {
    ball.x = paddle.x + paddle.w/2;
    ball.y = paddle.y - ball.r - 2;
    return;
  }

  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.x - ball.r < 0) { ball.x = ball.r; ball.vx *= -1; }
  if (ball.x + ball.r > LOGICAL_WIDTH) { ball.x = LOGICAL_WIDTH - ball.r; ball.vx *= -1; }
  if (ball.y - ball.r < 0) { ball.y = ball.r; ball.vy *= -1; }

  // Paddle collision
  if (ball.y + ball.r >= paddle.y && ball.y + ball.r <= paddle.y + paddle.h && ball.x >= paddle.x && ball.x <= paddle.x + paddle.w) {
    const relative = (ball.x - (paddle.x + paddle.w/2)) / (paddle.w/2);
    const angle = relative * (Math.PI / 3);
    const speedNow = Math.min(10, Math.hypot(ball.vx, ball.vy) * 1.02 + 0.1);
    ball.vx = Math.sin(angle) * speedNow;
    ball.vy = -Math.abs(Math.cos(angle) * speedNow);
    ball.y = paddle.y - ball.r - 1;
  }

  // Brick collision
  for (const b of bricks) {
    if (!b.alive) continue;
    if (ball.x + ball.r > b.x && ball.x - ball.r < b.x + b.w && ball.y + ball.r > b.y && ball.y - ball.r < b.y + b.h) {
      const overlapX = Math.min(ball.x + ball.r - b.x, b.x + b.w - (ball.x - ball.r));
      const overlapY = Math.min(ball.y + ball.r - b.y, b.y + b.h - (ball.y - ball.r));
      if (overlapX < overlapY) ball.vx *= -1; else ball.vy *= -1;
      b.alive = false;
      score += 10;
      scoreEl.textContent = score;
      break;
    }
  }

  // Bottom (lose life)
  if (ball.y - ball.r > LOGICAL_HEIGHT) {
    lives--;
    livesEl.textContent = lives;
    if (lives <= 0) {
      endGame(false);
    } else {
      // pause and let user resume with Start / Space / Tap
      pauseForLifeLost();
    }
  }

  // Win check
  if (bricks.every(b => !b.alive)) {
    endGame(true);
  }
}

// --- Main loop ---
function loop() {
  update();
  draw();
  if (running) animationId = requestAnimationFrame(loop);
}

// --- End & restart helpers ---
function endGame(won) {
  stopGame();
  restartBtn.style.display = 'inline-block';
  startBtn.style.display = 'none';
  setTimeout(() => {
    if (won) alert(`🎉 You Win! Score: ${score}`);
    else alert(`💀 Game Over. Score: ${score}`);
  }, 120);
}

function restartGame() {
  stopGame();
  startBtn.style.display = 'inline-block';
  restartBtn.style.display = 'none';
  resetGameState();
  draw();
}

// --- Reset initial state ---
function resetGameState() {
  paddle.w = Math.max(80, Math.round(LOGICAL_WIDTH * 0.15));
  paddle.x = LOGICAL_WIDTH/2 - paddle.w/2;
  paddle.y = LOGICAL_HEIGHT - 40;
  paddle.speed = 8;

  ball.r = 8;
  ball.x = LOGICAL_WIDTH/2;
  ball.y = paddle.y - 16;
  ball.vx = 0;
  ball.vy = 0;
  ball.launched = false;
  ball.speed = 5;

  score = 0;
  lives = 3;
  scoreEl.textContent = score;
  livesEl.textContent = lives;

  computeLayout();
  initBricks();
}

// --- Input handling ---
window.addEventListener('keydown', (e) => {
  // Space behavior:
  // - If game paused (not running): start the game
  // - If running and ball not launched: launch the ball
  if (e.key === ' ' || e.key === 'Spacebar') {
    e.preventDefault();
    if (!running) startGame();
    else if (!ball.launched) launchBall();
    return;
  }

  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
});
window.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
});

// Touch & mouse: if game paused, tap/click canvas to start; if running allow drag to move paddle
let dragging = false;
canvas.addEventListener('touchstart', (ev) => {
  ev.preventDefault();
  const t = ev.touches[0];
  const rect = canvas.getBoundingClientRect();
  const x = ((t.clientX - rect.left) / rect.width) * LOGICAL_WIDTH;

  if (!running) {
    startGame();
    return;
  }
  // start drag if touching near paddle
  if (Math.abs((paddle.x + paddle.w/2) - x) < 200) dragging = true;
  if (!ball.launched && Math.abs((paddle.x + paddle.w/2) - x) < paddle.w) launchBall();
});
canvas.addEventListener('touchmove', (ev) => {
  ev.preventDefault();
  if (!dragging) return;
  const t = ev.touches[0];
  const rect = canvas.getBoundingClientRect();
  const x = ((t.clientX - rect.left) / rect.width) * LOGICAL_WIDTH;
  paddle.x = Math.max(10, Math.min(LOGICAL_WIDTH - paddle.w - 10, x - paddle.w/2));
});
canvas.addEventListener('touchend', () => { dragging = false; });

// Mouse click / drag support
let mouseDown = false;
canvas.addEventListener('mousedown', (ev) => {
  // if game paused, start it on click
  if (!running) {
    startGame();
    return;
  }
  mouseDown = true;
});
canvas.addEventListener('mouseup', () => { mouseDown = false; });
canvas.addEventListener('mousemove', (ev) => {
  if (!mouseDown) return;
  const rect = canvas.getBoundingClientRect();
  const x = ((ev.clientX - rect.left) / rect.width) * LOGICAL_WIDTH;
  paddle.x = Math.max(10, Math.min(LOGICAL_WIDTH - paddle.w - 10, x - paddle.w/2));
});

// Buttons
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);
homeBtn.addEventListener('click', () => window.location.href = '../../index.html');


function onResize() {
  resizeCanvas();
  draw();
}
window.addEventListener('resize', onResize);

// Initialization
function init() {
  computeLayout();
  resetGameState();
  resizeCanvas();
  draw();
  // overlay visible initially with Start button
  overlay.style.display = '';
  startBtn.style.display = 'inline-block';
  restartBtn.style.display = 'none';
}
init();
