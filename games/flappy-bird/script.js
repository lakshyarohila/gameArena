
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Bird object
const bird = {
  x: 50,
  y: 150,
  width: 30,
  height: 30,
  gravity: 0.4,
  lift: -6,
  velocity: 0,
};

// Game variables
let pipes = [];
const pipeGap = 120;
const pipeWidth = 50;
let score = 0;
let gameOver = false;

function drawBird() {
  // Body
  ctx.fillStyle = "yellow";
  ctx.beginPath();
  ctx.ellipse(bird.x + bird.width / 2, bird.y + bird.height / 2, bird.width / 2, bird.height / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(bird.x + bird.width * 0.65, bird.y + bird.height * 0.35, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(bird.x + bird.width * 0.65, bird.y + bird.height * 0.35, 2, 0, Math.PI * 2);
  ctx.fill();

  // Beak
  ctx.fillStyle = "orange";
  ctx.beginPath();
  ctx.moveTo(bird.x + bird.width, bird.y + bird.height / 2);
  ctx.lineTo(bird.x + bird.width + 6, bird.y + bird.height / 2 - 4);
  ctx.lineTo(bird.x + bird.width + 6, bird.y + bird.height / 2 + 4);
  ctx.closePath();
  ctx.fill();
}

function drawPipes() {
  for (let pipe of pipes) {
    // Pipe colors
    const mainColor = "#228B22"; 
    const rimColor = "#006400"; 
    // Top pipe
    ctx.fillStyle = mainColor;
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);

    // Top rim
    ctx.fillStyle = rimColor;
    ctx.fillRect(pipe.x - 2, pipe.top - 10, pipeWidth + 4, 10);

    // Bottom pipe
    ctx.fillStyle = mainColor;
    ctx.fillRect(pipe.x, pipe.top + pipeGap, pipeWidth, canvas.height - pipe.top - pipeGap);

    // Bottom rim
    ctx.fillStyle = rimColor;
    ctx.fillRect(pipe.x - 2, pipe.top + pipeGap, pipeWidth + 4, 10);
  }
}

function updatePipes() {
  for (let pipe of pipes) {
    pipe.x -= 2;

    // Increase score
    if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
      score++;
      pipe.passed = true;
    }

    // Collision detection
    const collision =
      bird.x < pipe.x + pipeWidth &&
      bird.x + bird.width > pipe.x &&
      (bird.y < pipe.top || bird.y + bird.height > pipe.top + pipeGap);

    if (collision) {
      gameOver = true;
    }
  }

  // Remove off-screen pipes
  if (pipes.length && pipes[0].x < -pipeWidth) {
    pipes.shift();
  }

  // Add new pipe
  if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 150) {
    const newTop = Math.floor(Math.random() * 200 + 50);
    pipes.push({
      x: canvas.width,
      top: newTop,
      passed: false,
    });
  }
}

function drawScore() {
  ctx.fillStyle = "black";
  ctx.font = "24px Arial";
  ctx.fillText("Score: " + score, 10, 30);
}

function update() {
  if (gameOver) {
    ctx.fillStyle = "black";
    ctx.font = "36px Arial";
    ctx.fillText("Game Over", 120, 250);
    ctx.font = "20px Arial";
    ctx.fillText("Final Score: " + score, 140, 290);
    return;
  }

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Bird physics
  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  if (bird.y + bird.height > canvas.height) {
    gameOver = true;
  }

  drawBird();
  updatePipes();
  drawPipes();
  drawScore();

  requestAnimationFrame(update);
}

function flap() {
  bird.velocity = bird.lift;
}

function startGame() {
  // Reset game state
  bird.y = 150;
  bird.velocity = 0;
  pipes = [];
  score = 0;
  gameOver = false;
  update();
}

function goHome() {
  window.location.href = "../../index.html";
}

// Controls
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    flap();
  }
});

canvas.addEventListener("click", flap);
