

// DOM
const grid = document.getElementById('grid');
const movesEl = document.getElementById('moves');
const timeEl = document.getElementById('time');
const restartBtn = document.getElementById('restartBtn');
const homeBtn = document.getElementById('homeBtn');

// Game variables
const SYMBOLS = ['🍎','🍌','🍇','🍊','🍓','🍍','🥝','🍉']; // 8 unique -> 16 cards
let cards = [];               // DOM card elements
let deck = [];                // shuffled symbols duplicated
let flippedCards = [];        // currently flipped (max 2)
let lockBoard = false;
let matchedPairs = 0;
let totalPairs = SYMBOLS.length;
let moves = 0;
let timerInterval = null;
let startTime = null;
let timerRunning = false;

// Utilities
function shuffle(array){
  for(let i = array.length -1; i>0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function formatTime(seconds){
  const m = String(Math.floor(seconds / 60)).padStart(2,'0');
  const s = String(seconds % 60).padStart(2,'0');
  return `${m}:${s}`;
}

// Build & render board
function buildDeck(){
  deck = [...SYMBOLS, ...SYMBOLS]; // duplicate
  shuffle(deck);
}

function createBoard(){
  grid.innerHTML = '';
  cards = [];
  deck.forEach((symbol, idx) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.symbol = symbol;
    card.tabIndex = 0;

    const inner = document.createElement('div');
    inner.className = 'inner';

    const front = document.createElement('div');
    front.className = 'front';
    front.textContent = symbol;

    const back = document.createElement('div');
    back.className = 'back';
    back.textContent = '❓';

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);
    grid.appendChild(card);

    // Click & keyboard (Enter/Space)
    card.addEventListener('click', onCardClick);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onCardClick.call(card, e);
      }
    });

    cards.push(card);
  });
}

// Game logic
function onCardClick(e){
  const card = this; // using .call above or event.currentTarget
  if (lockBoard) return;
  if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
  if (!timerRunning) startTimer();

  // Prevent clicking same card twice in pair
  if (flippedCards.length === 1 && flippedCards[0] === card) return;

  card.classList.add('flipped');
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    moves++;
    movesEl.textContent = moves;
    checkForMatch();
  }
}

function checkForMatch(){
  const [a, b] = flippedCards;
  const match = a.dataset.symbol === b.dataset.symbol;

  if (match) {
    // keep flipped, mark matched
    a.classList.add('matched');
    b.classList.add('matched');
    flippedCards = [];
    matchedPairs++;
    if (matchedPairs === totalPairs) {
      setTimeout(winGame, 400);
    }
  } else {
    lockBoard = true;
    setTimeout(() => {
      a.classList.remove('flipped');
      b.classList.remove('flipped');
      flippedCards = [];
      lockBoard = false;
    }, 800);
  }
}

// Timer
function startTimer(){
  timerRunning = true;
  startTime = Date.now();
  timeEl.textContent = '00:00';
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    timeEl.textContent = formatTime(elapsed);
  }, 1000);
}

function stopTimer(){
  timerRunning = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// Win
function winGame(){
  stopTimer();
  setTimeout(() => {
    alert(`🎉 You Win!\nMoves: ${moves}\nTime: ${timeEl.textContent}`);
  }, 200);
}

// Restart
function resetGame(){
  stopTimer();
  flippedCards = [];
  lockBoard = false;
  matchedPairs = 0;
  moves = 0;
  movesEl.textContent = moves;
  timeEl.textContent = '00:00';
  buildDeck();
  createBoard();
}

// Home
function goHome(){
  window.location.href = '../../index.html';
}

// Init
restartBtn.addEventListener('click', resetGame);
homeBtn.addEventListener('click', goHome);

buildDeck();
createBoard();
