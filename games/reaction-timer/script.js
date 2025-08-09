
const gameArea = document.getElementById("game-area");
const startBtn = document.getElementById("start-btn");
const lastTimeEl = document.getElementById("last-time");
const bestTimeEl = document.getElementById("best-time");

let startTime = 0;
let timeoutId;
let gameState = "idle"; // idle, waiting, ready
let bestTime = localStorage.getItem("reactionBest") || null;

// Initialize best time display
if (bestTime) {
  bestTimeEl.textContent = bestTime;
}

// Start the reaction test
function startGame() {
  gameState = "waiting";
  gameArea.style.background = "#e67e22";
  gameArea.textContent = "Wait for green...";
  startBtn.disabled = true;

  const delay = Math.random() * 2000 + 1000; // 1–3 seconds
  timeoutId = setTimeout(() => {
    gameState = "ready";
    gameArea.style.background = "green";
    gameArea.textContent = "CLICK NOW!";
    startTime = Date.now();
  }, delay);
}

// Handle clicks/taps
gameArea.addEventListener("click", () => {
  if (gameState === "waiting") {
    // Clicked too early
    clearTimeout(timeoutId);
    gameArea.style.background = "#c0392b";
    gameArea.textContent = "Too soon! ❌";
    startBtn.disabled = false;
    gameState = "idle";
  } else if (gameState === "ready") {
    // Calculate reaction time
    const reactionTime = Date.now() - startTime;
    lastTimeEl.textContent = reactionTime;

    if (!bestTime || reactionTime < bestTime) {
      bestTime = reactionTime;
      localStorage.setItem("reactionBest", bestTime);
      bestTimeEl.textContent = bestTime;
    }

    gameArea.style.background = "#2980b9";
    gameArea.textContent = `Your Time: ${reactionTime} ms`;
    startBtn.disabled = false;
    gameState = "idle";
  }
});

function goHome() {
  window.location.href = "../../index.html";
}

startBtn.addEventListener("click", startGame);
