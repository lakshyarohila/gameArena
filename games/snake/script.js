const game = document.getElementById("game");
const scoreEl = document.getElementById("score");

const width = 20;
const cellCount = width * width;

let snake;
let direction;
let food;
let score;
let cells = [];
let intervalId;

// Create grid cells
function createGrid() {
  game.innerHTML = "";
  cells = [];

  for (let i = 0; i < cellCount; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    game.appendChild(cell);
    cells.push(cell);
  }
}

// Draw snake on grid
function drawSnake() {
  cells.forEach(cell => cell.classList.remove("snake"));
  snake.forEach(i => {
    if (cells[i]) cells[i].classList.add("snake");
  });
}

// Draw food
function drawFood() {
  cells.forEach(cell => cell.classList.remove("food"));
  if (cells[food]) cells[food].classList.add("food");
}

// Snake movement logic
function moveSnake() {
  const head = snake[snake.length - 1];
  const next = head + direction;

  // Wall collision (left/right/top/bottom)
  if (
    next < 0 || next >= cellCount ||
    (direction === 1 && head % width === width - 1) ||
    (direction === -1 && head % width === 0)
  ) {
    return gameOver();
  }

  // Self collision
  if (snake.includes(next)) {
    return gameOver();
  }

  snake.push(next);

  // Eat food
  if (next === food) {
    score++;
    scoreEl.textContent = `Score: ${score}`;
    placeFood();
  } else {
    snake.shift(); // Move forward
  }

  drawSnake();
}

// Place food in random empty cell
function placeFood() {
  let empty = [...Array(cellCount).keys()].filter(i => !snake.includes(i));
  food = empty[Math.floor(Math.random() * empty.length)];
  drawFood();
}

// Handle key press
function handleKey(e) {
  switch (e.key) {
    case "ArrowUp":
      if (direction !== width) direction = -width;
      break;
    case "ArrowDown":
      if (direction !== -width) direction = width;
      break;
    case "ArrowLeft":
      if (direction !== 1) direction = -1;
      break;
    case "ArrowRight":
      if (direction !== -1) direction = 1;
      break;
  }
}

// Game Over
function gameOver() {
  clearInterval(intervalId);
  alert(`💀 Game Over!\nFinal Score: ${score}`);
}

// Restart game
function restartGame() {
  snake = [210, 211]; // Center of grid
  direction = 1;      // Start moving right
  score = 0;
  scoreEl.textContent = "Score: 0";

  placeFood();
  drawSnake();
  clearInterval(intervalId);
  intervalId = setInterval(moveSnake, 200);
}

// Go back to homepage
function goHome() {
  window.location.href = "../../index.html";
}

// Init
document.addEventListener("keydown", handleKey);
createGrid();
restartGame();
