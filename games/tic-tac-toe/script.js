// games/tic-tac-toe/script.js

const board = document.getElementById("game-board");
const statusDiv = document.getElementById("status");

let currentPlayer = "X";
let cells = [];
let boardState = Array(9).fill("");

const winCombos = [
  [0,1,2], [3,4,5], [6,7,8], // rows
  [0,3,6], [1,4,7], [2,5,8], // cols
  [0,4,8], [2,4,6]           // diagonals
];

function drawBoard() {
  board.innerHTML = "";
  cells = [];

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.addEventListener("click", handleClick);
    board.appendChild(cell);
    cells.push(cell);
  }

  boardState.fill("");
  currentPlayer = "X";
  updateStatus();
}

function handleClick(e) {
  const index = e.target.dataset.index;

  if (boardState[index] !== "") return;

  boardState[index] = currentPlayer;
  cells[index].textContent = currentPlayer;

  if (checkWin(currentPlayer)) {
    statusDiv.textContent = `🎉 Player ${currentPlayer} Wins!`;
    disableBoard();
    return;
  }

  if (boardState.every(cell => cell !== "")) {
    statusDiv.textContent = "🤝 It's a Tie!";
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateStatus();
}

function updateStatus() {
  statusDiv.textContent = `Player ${currentPlayer}'s Turn`;
}

function disableBoard() {
  cells.forEach(cell => cell.removeEventListener("click", handleClick));
}

function checkWin(player) {
  return winCombos.some(combo =>
    combo.every(index => boardState[index] === player)
  );
}

function restartGame() {
  drawBoard();
}

function goHome() {
  window.location.href = "../../index.html";
}

drawBoard();
