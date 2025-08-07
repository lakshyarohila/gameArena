const game = document.getElementById("game");
const width = 10;

const layout = [
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1,
  1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0,
  1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
];

let cells = [];
let pacmanIndex = 11;
let ghostIndex = 88;
let score = 0;
let gameInterval;

function drawGrid() {
  game.innerHTML = "";
  layout.forEach((type, i) => {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    if (type == 1) cell.classList.add("wall");
    else cell.classList.add("pellet");
    game.appendChild(cell);
    cells.push(cell);
  });

  cells[pacmanIndex].classList.add("pacman");
  cells[ghostIndex].classList.add("ghost");
}
function movePacman(e) {
  cells[pacmanIndex].classList.remove('pacman');

  switch (e.key) {
    case 'ArrowLeft':
      if (pacmanIndex % width !== 0 && !cells[pacmanIndex - 1].classList.contains('wall')) {
        pacmanIndex -= 1;
      }
      break;
    case 'ArrowRight':
      if (pacmanIndex % width < width - 1 && !cells[pacmanIndex + 1].classList.contains('wall')) {
        pacmanIndex += 1;
      }
      break;
    case 'ArrowUp':
      if (pacmanIndex - width >= 0 && !cells[pacmanIndex - width].classList.contains('wall')) {
        pacmanIndex -= width;
      }
      break;
    case 'ArrowDown':
      if (pacmanIndex + width < layout.length && !cells[pacmanIndex + width].classList.contains('wall')) {
        pacmanIndex += width;
      }
      break;
  }

  eatPellet();
  checkLose();
  cells[pacmanIndex].classList.add('pacman');
}

function eatPellet() {
  if (cells[pacmanIndex].classList.contains('pellet')) {
    cells[pacmanIndex].classList.remove('pellet');
    score++;
    if (score === layout.filter(i => i === 0).length) {
      alert('🎉 You Win!');
      clearInterval(gameInterval);
      document.removeEventListener('keydown', movePacman);
    }
  }
}

function moveGhost() {
  const directions = [-1, +1, -width, +width];
  const possible = directions.filter(dir => {
    const nextIndex = ghostIndex + dir;
    return (
      nextIndex >= 0 &&
      nextIndex < layout.length &&
      !cells[nextIndex].classList.contains('wall') &&
      !cells[nextIndex].classList.contains('ghost')
    );
  });

  if (possible.length > 0) {
    cells[ghostIndex].classList.remove('ghost');
    ghostIndex += possible[Math.floor(Math.random() * possible.length)];
    cells[ghostIndex].classList.add('ghost');
    checkLose();
  }
}

function checkLose() {
  if (pacmanIndex === ghostIndex) {
    alert('👻 Game Over!');
    clearInterval(gameInterval);
    document.removeEventListener('keydown', movePacman);
  }
}

function goHome() {
  window.location.href = "../../index.html";
}

function startGame() {
  drawGrid();
  document.addEventListener('keydown', movePacman);
  gameInterval = setInterval(moveGhost, 500);
}

startGame();