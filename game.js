const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Adjust the canvas to fit the full screen dynamically
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);  // Ensure canvas resizes when the window size changes

// Game Variables
let sentenceToForm = [];  // Target Chinese sentence in correct order
let currentSentence = [];  // Current formed sentence
let englishSentence = '';
let pinyinSentence = '';
let lives = 3;
let fallingCharacters = [];
let characterSpeed = 2;  // Fixed speed for falling characters
let gameOver = false;
const hitboxMargin = 15;  // Add extra space around characters for a larger hitbox

// DOM Elements
const lifeCount = document.getElementById("life-count");
const chineseSentence = document.getElementById("chinese-sentence");
const englishSentenceEl = document.getElementById("english-sentence");
const pinyinSentenceEl = document.getElementById("pinyin-sentence");
const gameOverScreen = document.getElementById("game-over");
const restartBtn = document.getElementById("restart-btn");
const levelSelection = document.getElementById("level-selection");

// Falling character class
class FallingCharacter {
  constructor(character) {
    this.character = character;
    this.x = Math.random() * (canvas.width - 60);  // Ensure characters are positioned inside the canvas width
    this.y = -30;  // Start slightly above the canvas
    this.size = 40;  // Increase size to make it more clickable
  }

  draw() {
    ctx.font = `${this.size}px Arial`;
    ctx.fillStyle = "#000";
    ctx.fillText(this.character, this.x, this.y);
  }

  update() {
    this.y += characterSpeed;  // Move the character down at a fixed speed
  }
}

// Level selection logic
document.querySelectorAll('.level-btn').forEach(button => {
  button.addEventListener('click', (e) => {
    const level = e.target.getAttribute('data-level');
    loadLevel(level);
  });
});

// Load level-specific data
function loadLevel(level) {
  const script = document.createElement('script');
  script.src = `hsk${level}.js`;  // Load the corresponding HSK JavaScript file
  document.body.appendChild(script);

  // Hide level selection screen after choosing a level
  levelSelection.style.display = 'none';
}

// Function to start the game (triggered after level load)
function startGame(data) {
  sentenceToForm = data.sentenceToForm;
  englishSentence = data.englishSentence;
  pinyinSentence = data.pinyinSentence;

  englishSentenceEl.innerText = englishSentence;
  pinyinSentenceEl.innerText = pinyinSentence;

  // Start game loop
  gameLoop();
}

// Add new falling characters every 2 seconds
setInterval(() => {
  if (!gameOver && sentenceToForm.length > 0) {
    let randomChar = sentenceToForm[Math.floor(Math.random() * sentenceToForm.length)];
    fallingCharacters.push(new FallingCharacter(randomChar));
  }
}, 2000);

// Game Loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw and update falling characters
  for (let i = 0; i < fallingCharacters.length; i++) {
    fallingCharacters[i].draw();
    fallingCharacters[i].update();

    // If the character goes below the canvas without being hit
    if (fallingCharacters[i].y > canvas.height) {
      fallingCharacters.splice(i, 1);  // Remove the character if it goes off the screen
    }
  }

  if (!gameOver) {
    requestAnimationFrame(gameLoop);
  }
}

// Click to shoot a falling character
canvas.addEventListener("click", (e) => {
  const clickX = e.offsetX;
  const clickY = e.offsetY;
  let clicked = false;  // Keep track of whether a valid character was clicked

  for (let i = 0; i < fallingCharacters.length; i++) {
    let char = fallingCharacters[i];

    // Adjust the hitbox size by adding a margin
    if (
      clickX > char.x - hitboxMargin &&
      clickX < char.x + char.size + hitboxMargin &&
      clickY > char.y - char.size - hitboxMargin &&
      clickY < char.y + hitboxMargin
    ) {
      clicked = true;  // A character was clicked

      // Correct character clicked
      if (char.character === sentenceToForm[currentSentence.length]) {
        currentSentence.push(char.character);
        chineseSentence.innerText = currentSentence.join('');
        if (currentSentence.length === sentenceToForm.length) {
          alert('You completed the sentence!');
          resetGame();  // Reset the game without changing the speed
        }
      } else {
        loseLife();  // Only lose a life if the wrong character was clicked
      }
      fallingCharacters.splice(i, 1);  // Remove the character from the array
      break;
    }
  }
});

// Lose a life if wrong character is clicked
function loseLife() {
  lives--;
  lifeCount.innerText = lives;
  if (lives === 0) {
    endGame();
  }
}

// End the game
function endGame() {
  gameOver = true;
  gameOverScreen.style.display = 'block';
}

// Restart the game
restartBtn.addEventListener("click", () => {
  resetGame();
});

function resetGame() {
  gameOver = false;
  lives = 3;
  lifeCount.innerText = lives;
  currentSentence = [];
  chineseSentence.innerText = '';
  fallingCharacters = [];
  gameOverScreen.style.display = 'none';
  gameLoop();  // Speed stays the same after reset
}
