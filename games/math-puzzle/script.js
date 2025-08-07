// games/math-puzzle/script.js

let correctAnswer = 0;
let score = 0;

const questionEl = document.getElementById("question");
const answerEl = document.getElementById("answer");
const feedbackEl = document.getElementById("feedback");
const scoreEl = document.getElementById("score");

function generatePuzzle() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;

  const type = Math.random() > 0.5 ? "+" : "-";

  if (type === "+") {
    correctAnswer = a + b;
    questionEl.textContent = `${a} + ${b} = ?`;
  } else {
    correctAnswer = a - b;
    questionEl.textContent = `${a} - ${b} = ?`;
  }

  answerEl.value = "";
  feedbackEl.textContent = "";
}

function submitAnswer() {
  const userAnswer = parseInt(answerEl.value);

  if (isNaN(userAnswer)) {
    feedbackEl.textContent = "Please enter a number!";
    feedbackEl.style.color = "orange";
    return;
  }

  if (userAnswer === correctAnswer) {
    feedbackEl.textContent = "✅ Correct!";
    feedbackEl.style.color = "lightgreen";
    score++;
    scoreEl.textContent = score;
  } else {
    feedbackEl.textContent = `❌ Wrong! The correct answer was ${correctAnswer}`;
    feedbackEl.style.color = "red";
  }
}

function restartGame() {
  generatePuzzle();
}

function goHome() {
  window.location.href = "../../index.html";
}

generatePuzzle();
