<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Cobrinha da Glicemia</title>
<style>
body {
  display:flex; flex-direction:column; align-items:center;
  font-family:Arial,sans-serif;
  background:linear-gradient(135deg,#d0f0c0,#f8c291);
  margin:0; height:100vh; justify-content:flex-start;
}
h1 { margin:10px; }
#glycemiaBarContainer {
  width:400px; height:25px; border:2px solid #333;
  border-radius:12px; background:#ccc; margin-bottom:10px;
}
#glycemiaBar {
  height:100%; width:100px; background:green;
  border-radius:12px; transition: width 0.2s, background 0.2s;
}
.game-container {
  display:flex; flex-direction:row; align-items:center; gap:20px;
}
canvas { background:#fff; border:3px solid #333; max-width:70vw; max-height:70vh; }
#score,#timer { font-size:20px; margin:10px; }
#gameOver,#startScreen { text-align:center; margin-top:20px; }
button {
  padding:10px 20px; font-size:18px;
  border:none; border-radius:10px; background:#333;
  color:white; cursor:pointer; transition:0.3s;
}
button:hover { background:#555; }
#leaderboard {
  margin-top:20px; background:white; padding:10px;
  border-radius:10px; border:2px solid #333;
}

/* --- CONTROLES EM CRUZ (D-PAD) --- */
#controls {
  display:grid;
  grid-template-columns: 60px 60px 60px;
  grid-template-rows: 60px 60px 60px;
  gap:5px;
}
.control-btn {
  font-size:22px; border-radius:12px;
  background:#333; color:white; border:none;
}
.control-btn:active { background:#555; }
#btn-up   { grid-column:2; grid-row:1; }
#btn-left { grid-column:1; grid-row:2; }
#btn-down { grid-column:2; grid-row:3; }
#btn-right{ grid-column:3; grid-row:2; }
/* botão central vazio */
#controls div { grid-column:2; grid-row:2; }
</style>
</head>
<body>
<h1>👨‍⚕️ Cobrinha da Glicemia</h1>

<div id="glycemiaBarContainer">
  <div id="glycemiaBar"></div>
</div>

<div class="game-container">
  <canvas id="gameCanvas" width="400" height="400"></canvas>

  <!-- CONTROLES EM CRUZ -->
  <div id="controls" style="display:none;">
    <button id="btn-up" class="control-btn">⬆️</button>
    <button id="btn-left" class="control-btn">⬅️</button>
    <div></div> <!-- espaço vazio no meio -->
    <button id="btn-right" class="control-btn">➡️</button>
    <button id="btn-down" class="control-btn">⬇️</button>
  </div>

  <div>
    <div id="score">Glicemia: 100</div>
    <div id="timer">⏱ Tempo: 0s</div>
  </div>
</div>

<div id="startScreen">
  <h2>Bem-vindo ao Jogo!</h2>
  <input type="text" id="playerName" placeholder="Digite seu nome">
  <br><br>
  <button onclick="startGame()">Start</button>
</div>

<div id="gameOver" style="display:none;">
  <h2>Fim de Jogo!</h2>
  <p>A glicemia deve ficar entre 50 e 200.</p>
  <button onclick="restartGame()">Jogar Novamente</button>
</div>

<div id="leaderboard">
  <h3>🏆 Ranking dos Jogadores</h3>
  <ol id="rankingList"></ol>
</div>

<script>
const canvas=document.getElementById("gameCanvas");
const ctx=canvas.getContext("2d");
const scoreElement=document.getElementById("score");
const timerElement=document.getElementById("timer");
const startScreen=document.getElementById("startScreen");
const gameOverElement=document.getElementById("gameOver");
const rankingList=document.getElementById("rankingList");
const glycemiaBar=document.getElementById("glycemiaBar");
const controls=document.getElementById("controls");

const box=20;
let snake,direction,food,foodTimeout,glicemia,foodType,game,timeElapsed,timerInterval,playerName;
let gameStarted=false;
let leaderboard=[];

const playerImg=new Image(); playerImg.src="https://cdn-icons-png.flaticon.com/512/4140/4140048.png";
const burgerImg=new Image(); burgerImg.src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png";
const appleImg=new Image(); appleImg.src="https://cdn-icons-png.flaticon.com/512/415/415682.png";

function init(){
  snake=[{x:9*box,y:10*box}];
  direction=null;
  glicemia=100;
  spawnFood();
  timeElapsed=0;
  gameStarted=false;
  updateScore();
  updateGlycemiaBar();
  timerElement.innerHTML="⏱ Tempo: 0s";
}

function startGame(){
  playerName=document.getElementById("playerName").value || "Jogador";
  startScreen.style.display="none";
  gameOverElement.style.display="none";
  canvas.style.display="block";
  scoreElement.style.display="block";
  timerElement.style.display="block";
  controls.style.display="grid"; // mostra controles
  init();
  if(game) clearInterval(game);
  game=setInterval(draw,120);
}

function spawnFood(){
  foodType=Math.random()>0.5?"hamburguer":"fruta";
  food={x:Math.floor(Math.random()*(canvas.width/box))*box,y:Math.floor(Math.random()*(canvas.height/box))*box};
  if(foodTimeout) clearTimeout(foodTimeout);
  foodTimeout=setTimeout(()=>{spawnFood();},5000);
}

document.addEventListener("keydown",event=>{
  changeDirection(event.key.replace("Arrow","").toUpperCase());
});

function changeDirection(dir){
  if(dir==="LEFT" && direction!=="RIGHT") direction="LEFT";
  else if(dir==="UP" && direction!=="DOWN") direction="UP";
  else if(dir==="RIGHT" && direction!=="LEFT") direction="RIGHT";
  else if(dir==="DOWN" && direction!=="UP") direction="DOWN";

  if(!gameStarted && direction){
    gameStarted=true;
    timerInterval=setInterval(()=>{
      timeElapsed++;
      timerElement.innerHTML="⏱ Tempo: "+timeElapsed+"s";
    },1000);
  }
}

// Botões → chamam changeDirection
document.getElementById("btn-up").onclick=()=>changeDirection("UP");
document.getElementById("btn-down").onclick=()=>changeDirection("DOWN");
document.getElementById("btn-left").onclick=()=>changeDirection("LEFT");
document.getElementById("btn-right").onclick=()=>changeDirection("RIGHT");

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(let i=0;i<snake.length;i++){ctx.drawImage(playerImg,snake[i].x,snake[i].y,box,box);}
  if(foodType==="hamburguer") ctx.drawImage(burgerImg,food.x,food.y,box,box);
  else ctx.drawImage(appleImg,food.x,food.y,box,box);

  let snakeX=snake[0].x; let snakeY=snake[0].y;
  if(direction==="LEFT") snakeX-=box;
  if(direction==="UP") snakeY-=box;
  if(direction==="RIGHT") snakeX+=box;
  if(direction==="DOWN") snakeY+=box;

  if(snakeX===food.x && snakeY===food.y){
    if(foodType==="hamburguer") glicemia+=15; else glicemia-=10;
    spawnFood();
    updateScore();
    updateGlycemiaBar();
  } else snake.pop();

  let newHead={x:snakeX,y:snakeY};
  if(snakeX<0||snakeY<0||snakeX>=canvas.width||snakeY>=canvas.height||collision(newHead,snake)||glicemia<50||glicemia>200){
    endGame(); return;
  }
  snake.unshift(newHead);
}

function collision(head,array){return array.some(part=>head.x===part.x && head.y===part.y);}
function updateScore(){ scoreElement.innerHTML="Glicemia: "+glicemia; }
function updateGlycemiaBar(){
  let perc=Math.min(Math.max(glicemia,0),200)/200*100;
  glycemiaBar.style.width=perc+"%";
  if(glicemia<50||glicemia>180) glycemiaBar.style.background="red";
  else if(glicemia>140) glycemiaBar.style.background="yellow";
  else glycemiaBar.style.background="green";
}
function endGame(){
  clearInterval(game); clearInterval(timerInterval); if(foodTimeout) clearTimeout(foodTimeout);
  gameOverElement.style.display="block";
  controls.style.display="none"; 
  leaderboard.push({name:playerName,time:timeElapsed});
  leaderboard.sort((a,b)=>b.time-a.time);
  updateLeaderboard();
}
function restartGame(){
  startScreen.style.display="block";
  gameOverElement.style.display="none";
  canvas.style.display="none";
  scoreElement.style.display="none";
  timerElement.style.display="none";
  controls.style.display="none";
}
function updateLeaderboard(){
  rankingList.innerHTML="";
  leaderboard.slice(0,5).forEach(player=>{
    let li=document.createElement("li"); li.textContent=`${player.name} - ${player.time}s`; rankingList.appendChild(li);
  });
}
</script>
</body>
</html>
