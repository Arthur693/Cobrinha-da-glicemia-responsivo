
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const timerElement = document.getElementById("timer");
const startScreen = document.getElementById("startScreen");
const gameOverElement = document.getElementById("gameOver");
const rankingList = document.getElementById("rankingList");
const glycemiaBar = document.getElementById("glycemiaBar");
const controls = document.getElementById("controls");

const box = 20;
let snake, direction, food, foodTimeout, glicemia, foodType, game, timeElapsed, timerInterval, playerName;
let gameStarted = false;
let leaderboard = [];

const playerImg = new Image(); playerImg.src = "https://cdn-icons-png.flaticon.com/512/4140/4140048.png";
const burgerImg = new Image(); burgerImg.src = "https://cdn-icons-png.flaticon.com/512/3075/3075977.png";
const appleImg = new Image(); appleImg.src = "https://cdn-icons-png.flaticon.com/512/415/415682.png";

function init() {
  snake = [{ x: 9 * box, y: 10 * box }];
  direction = null;
  glicemia = 100;
  spawnFood();
  timeElapsed = 0;
  gameStarted = false;
  updateScore();
  updateGlycemiaBar();
  timerElement.innerHTML = "⏱ Tempo: 0s";
}

function startGame() {
  playerName = document.getElementById("playerName").value || "Jogador";
  startScreen.style.display = "none";
  gameOverElement.style.display = "none";
  canvas.style.display = "block";
  scoreElement.style.display = "block";
  timerElement.style.display = "block";
  init();
  if (game) clearInterval(game);
  game = setInterval(draw, 120);
}

function spawnFood() {
  foodType = Math.random() > 0.5 ? "hamburguer" : "fruta";
  food = {
    x: Math.floor(Math.random() * (canvas.width / box)) * box,
    y: Math.floor(Math.random() * (canvas.height / box)) * box
  };
  if (foodTimeout) clearTimeout(foodTimeout);
  foodTimeout = setTimeout(() => { spawnFood(); }, 5000);
}

document.addEventListener("keydown", event => {
  changeDirection(event.key.replace("Arrow", "").toUpperCase());
});

function changeDirection(dir) {
  if (dir === "LEFT" && direction !== "RIGHT") direction = "LEFT";
  else if (dir === "UP" && direction !== "DOWN") direction = "UP";
  else if (dir === "RIGHT" && direction !== "LEFT") direction = "RIGHT";
  else if (dir === "DOWN" && direction !== "UP") direction = "DOWN";

  if (!gameStarted && direction) {
    gameStarted = true;
    timerInterval = setInterval(() => {
      timeElapsed++;
      timerElement.innerHTML = "⏱ Tempo: " + timeElapsed + "s";
    }, 1000);
  }
}

// Botões de toque
document.getElementById("btn-up").onclick = () => changeDirection("UP");
document.getElementById("btn-down").onclick = () => changeDirection("DOWN");
document.getElementById("btn-left").onclick = () => changeDirection("LEFT");
document.getElementById("btn-right").onclick = () => changeDirection("RIGHT");

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < snake.length; i++) {
    ctx.drawImage(playerImg, snake[i].x, snake[i].y, box, box);
  }
  if (foodType === "hamburguer") ctx.drawImage(burgerImg, food.x, food.y, box, box);
  else ctx.drawImage(appleImg, food.x, food.y, box, box);

  let snakeX = snake[0].x;
  let snakeY = snake[0].y;
  if (direction === "LEFT") snakeX -= box;
  if (direction === "UP") snakeY -= box;
  if (direction === "RIGHT") snakeX += box;
  if (direction === "DOWN") snakeY += box;

  if (snakeX === food.x && snakeY === food.y) {
    if (foodType === "hamburguer") glicemia += 15;
    else glicemia -= 10;
    spawnFood();
    updateScore();
    updateGlycemiaBar();
  } else {
    snake.pop();
  }

  let newHead = { x: snakeX, y: snakeY };
  if (
    snakeX < 0 || snakeY < 0 || snakeX >= canvas.width || snakeY >= canvas.height ||
    collision(newHead, snake) || glicemia < 50 || glicemia > 200
  ) {
    endGame();
    return;
  }

  snake.unshift(newHead);
}

function collision(head, array) {
  return array.some(part => head.x === part.x && head.y === part.y);
}

function updateScore() {
  scoreElement.innerHTML = "Glicemia: " + glicemia;
}

function updateGlycemiaBar() {
  let perc = Math.min(Math.max(glicemia, 0), 200) / 200 * 100;
  glycemiaBar.style.width = perc + "%";
  if (glicemia < 50 || glicemia > 180) glycemiaBar.style.background = "red";
  else if (glicemia > 140) glycemiaBar.style.background = "yellow";
  else glycemiaBar.style.background = "green";
}

function endGame() {
  clearInterval(game);
  clearInterval(timerInterval);
  if (foodTimeout) clearTimeout(foodTimeout);
  gameOverElement.style.display = "block";
  leaderboard.push({ name: playerName, time: timeElapsed });
  leaderboard.sort((a, b) => b.time - a.time);
  updateLeaderboard();
}

function restartGame() {
  startScreen.style.display = "block";
  gameOverElement.style.display = "none";
  canvas.style.display = "none";
  scoreElement.style.display = "none";
  timerElement.style.display = "none";
}

function updateLeaderboard() {
  rankingList.innerHTML = "";
  leaderboard.slice(0, 5).forEach(player => {
    let li = document.createElement("li");
    li.textContent = `${player.name} - ${player.time}s`;
    rankingList.appendChild(li);
  });
}
