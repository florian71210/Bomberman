const gridSize = 25;
const cellSize = 24; // taille d'une case en pixels
const maxPos = (gridSize - 1) * cellSize;

//Gestion de la safe zone
const safeZones = [
  "0-0", "1-0",
  "0-1", "1-1"
];

const gameArea = document.querySelector("#game-area");
const player = document.getElementById("player1");

let ennemisTues = 0;
const scoreCible = 5;

//Gestion de l'explosion
function explode(x, y) {
  const directions = [
    { dx: 0, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 }
  ];

  directions.forEach(dir => {
    const explosionX = x + dir.dx * cellSize;
    const explosionY = y + dir.dy * cellSize;

    const explosion = document.createElement("div");
    explosion.classList.add("explosion");
    explosion.style.left = explosionX + "px";
    explosion.style.top = explosionY + "px";
    explosion.style.position = "absolute";
    explosion.style.width = cellSize + "px";
    explosion.style.height = cellSize + "px";
    gameArea.appendChild(explosion);

    document.querySelectorAll(".block-breakable").forEach(block => {
      const blockX = parseInt(block.style.left);
      const blockY = parseInt(block.style.top);
      if (blockX === explosionX && blockY === explosionY) {
        block.remove();
      }
    });

    document.querySelectorAll(".enemy").forEach(enemy => {
      const enemyX = parseInt(enemy.style.left);
      const enemyY = parseInt(enemy.style.top);

      if (enemyX === explosionX && enemyY === explosionY) {
        enemy.remove();
        ennemisTues++;
        //Affiche un message quand un monstre est éliminée
        const msg = document.getElementById("message");
        msg.textContent = `✅ Ennemi éliminé (${ennemisTues}/${scoreCible})`;
        msg.style.display = "block";

        setTimeout(() => {
          msg.style.display = "none";
        }, 2000);

        if (ennemisTues >= scoreCible) {
          victoire();
        }
      }
    });
    //Affiche un message quand l'explosion touche le player1
    const playerX = parseInt(player.style.left);
    const playerY = parseInt(player.style.top);
    if (playerX === explosionX && playerY === explosionY) {
      gameOver("💥 Tu as été touché par une bombe !");
    }

    setTimeout(() => {
      explosion.remove();
    }, 500);
  });
}
//Affiche un message quand on gagne
function victoire() {
  const message = document.getElementById("game-message");
  message.textContent = "🎉 Bravo ! Tu as gagné !";
  message.classList.remove("hidden");

  setTimeout(() => {
    location.reload();
  }, 4000);
}

window.addEventListener("DOMContentLoaded", () => {
  player.style.position = "absolute";
  player.style.left = "0px";
  player.style.top = "0px";

  setInterval(spawnEnemy, 3000);

  generateBlocks();
  spawnEnemy();

  let dangerTimeout = null;
  let proximityDuration = 3000;

  setInterval(() => {
    const playerX = parseInt(player.style.left);
    const playerY = parseInt(player.style.top);
    const enemies = document.querySelectorAll(".enemy");

    let isNear = false;

    enemies.forEach(enemy => {
      const enemyX = parseInt(enemy.style.left);
      const enemyY = parseInt(enemy.style.top);
      const dx = Math.abs(playerX - enemyX);
      const dy = Math.abs(playerY - enemyY);
      if ((dx === cellSize && dy === 0) || (dy === cellSize && dx === 0)) {
        isNear = true;
      }
    });
    //Gère quand on reste proche d'un ennemi
    if (isNear && !dangerTimeout) {
      dangerTimeout = setTimeout(() => {
        const currentPlayerX = parseInt(player.style.left);
        const currentPlayerY = parseInt(player.style.top);
        let stillNear = false;

        document.querySelectorAll(".enemy").forEach(enemy => {
          const enemyX = parseInt(enemy.style.left);
          const enemyY = parseInt(enemy.style.top);
          const dx = Math.abs(enemyX - currentPlayerX);
          const dy = Math.abs(enemyY - currentPlayerY);
          if ((dx === cellSize && dy === 0) || (dy === cellSize && dx === 0)) {
            stillNear = true;
          }
        });

        if (stillNear) {
          gameOver("💥 Tu es resté trop proche d’un ennemi !");
        }

        dangerTimeout = null;
      }, proximityDuration);
    }

    if (!isNear && dangerTimeout) {
      clearTimeout(dangerTimeout);
      dangerTimeout = null;
    }
  }, 200);
//Gestion des collissions pour les blocs cassables et incassables
  function canMove(newX, newY) {
    const blocks = document.querySelectorAll(".block-indestructible, .block-breakable");
    for (let block of blocks) {
      const blockX = parseInt(block.style.left);
      const blockY = parseInt(block.style.top);
      if (blockX === newX && blockY === newY) {
        return false;
      }
    }
    return true;
  }
//Gestion des mouvements
  window.addEventListener("keydown", (e) => {
    let left = parseInt(player.style.left);
    let top = parseInt(player.style.top);

    switch (e.keyCode) {
      case 37:
        if (left > 0 && canMove(left - cellSize, top)) {
          player.style.left = (left - cellSize) + "px";
        }
        break;
      case 39:
        if (left < maxPos && canMove(left + cellSize, top)) {
          player.style.left = (left + cellSize) + "px";
        }
        break;
      case 38:
        if (top > 0 && canMove(left, top - cellSize)) {
          player.style.top = (top - cellSize) + "px";
        }
        break;
      case 40:
        if (top < maxPos && canMove(left, top + cellSize)) {
          player.style.top = (top + cellSize) + "px";
        }
        break;
      case 32:
        const bomb = document.createElement("div");
        bomb.classList.add("bomb");
        bomb.style.left = player.style.left;
        bomb.style.top = player.style.top;
        gameArea.appendChild(bomb);

        setTimeout(() => {
          bomb.remove();
          explode(parseInt(bomb.style.left), parseInt(bomb.style.top));
        }, 2000);
        break;
    }
  });
});
//Gestion des spwans des blocs cassables et incassables
function generateBlocks() {
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const posKey = `${x}-${y}`;
      if (safeZones.includes(posKey)) continue;

      const rand = Math.random();
      let blockType = null;
      if (rand < 0.3) {
        blockType = "block-indestructible";
      } else if (rand < 0.7) {
        blockType = "block-breakable";
      }

      if (blockType) {
        const block = document.createElement("div");
        block.classList.add(blockType);
        block.style.left = (x * cellSize) + "px";
        block.style.top = (y * cellSize) + "px";
        gameArea.appendChild(block);
      }
    }
  }
}
//Spwan des ennemies
let enemyCount = 0;

function spawnEnemy() {
  let x, y, key;
  let attempts = 0;
  do {
    x = Math.floor(Math.random() * gridSize);
    y = Math.floor(Math.random() * gridSize);
    key = `${x}-${y}`;
    attempts++;
    if (attempts > 100) return;
  } while (safeZones.includes(key) || isOccupied(x, y));

  const enemy = document.createElement("div");
  enemy.classList.add("enemy");
  enemy.id = "enemy" + enemyCount;
  enemy.style.position = "absolute";
  enemy.style.left = (x * cellSize) + "px";
  enemy.style.top = (y * cellSize) + "px";
  enemy.style.width = cellSize + "px";
  enemy.style.height = cellSize + "px";
  gameArea.appendChild(enemy);

  enemyCount++;
}
//Gestion des spawn des ennemies pour qu'il ne spawn pas sur des blocs occupés
function isOccupied(x, y) {
  const objects = document.querySelectorAll(".block-indestructible, .block-breakable, .enemy");
  const posX = x * cellSize;
  const posY = y * cellSize;

  for (let obj of objects) {
    const objX = parseInt(obj.style.left);
    const objY = parseInt(obj.style.top);
    if (objX === posX && objY === posY) {
      return true;
    }
  }

  return false;
}
//Afficher des messages
function afficherMessage(msg) {
  const message = document.getElementById("message");
  message.textContent = msg;
  message.style.display = "block";

  setTimeout(() => {
    message.style.display = "none";
  }, 2000);
}

function gameOver(message) {
  const msgDiv = document.getElementById("game-message");
  msgDiv.textContent = message;
  msgDiv.classList.remove("hidden");

  setTimeout(() => {
    location.reload();
  }, 3000);
}
