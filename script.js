const gridSize = 25;
const cellSize = 24; // taille d'une case en pixels
const maxPos = (gridSize - 1) * cellSize;

const safeZones = [
  "0-0", "1-0",
  "0-1", "1-1"
];

const gameArea = document.querySelector("#game-area");
const player = document.getElementById("player1");

// Fonction explode déclarée ici, accessible globalement
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

    // Crée l’effet visuel
    const explosion = document.createElement("div");
    explosion.classList.add("explosion");
    explosion.style.left = explosionX + "px";
    explosion.style.top = explosionY + "px";
    explosion.style.position = "absolute";
    explosion.style.width = cellSize + "px";
    explosion.style.height = cellSize + "px";
    gameArea.appendChild(explosion);

    // 💥 Supprimer les blocs cassables
    document.querySelectorAll(".block-breakable").forEach(block => {
      const blockX = parseInt(block.style.left);
      const blockY = parseInt(block.style.top);
      if (blockX === explosionX && blockY === explosionY) {
        block.remove();
      }
    });

    // 💣 Vérifie si un ennemi est touché
    document.querySelectorAll(".enemy").forEach(enemy => {
      const enemyX = parseInt(enemy.style.left);
      const enemyY = parseInt(enemy.style.top);

      if (enemyX === explosionX && enemyY === explosionY) {
        enemy.remove();

        //Afficher un message
        const msg = document.getElementById("message");
        msg.textContent = "✅ Ennemi éliminé !";
        msg.style.display = "block";

        setTimeout(() => {
          msg.style.display = "none";
        }, 2000);

      }
      });

      // Vérifier si le joueur est touché
      const playerX = parseInt(player.style.left);
      const playerY = parseInt(player.style.top);
      if (playerX === explosionX && playerY === explosionY) {
        afficherMessage("💀 Tu as été touché ! Rechargement...");
        
        // Recommencer la partie après un court délai
        setTimeout(() => {
          location.reload(); // recharge la page
        }, 2000); // 2 secondes pour voir le message
      }

    setTimeout(() => {
      explosion.remove();
    }, 500);
  });
}


window.addEventListener("DOMContentLoaded", () => {
  player.style.position = "absolute";
  player.style.left = "0px";
  player.style.top = "0px";

  // Ensuite, un ennemi toutes les 30 secondes (30000 ms)
  setInterval(spawnEnemy, 30000);

  generateBlocks();
  spawnEnemy(); // premier ennemi au début

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

  //Mouvement
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
      case 32: // espace
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

//Générer des blocs aléatoire
function generateBlocks() {
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const posKey = `${x}-${y}`;
      if (safeZones.includes(posKey)) continue;

      const rand = Math.random();
      let blockType = null;
      if (rand < 0.3) {
        blockType = "block-indestructible"; // 30% des blocs sont incassables
      } else if (rand < 0.7) {
        blockType = "block-breakable"; // 70% des blocs sont cassables
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

let enemyCount = 0;

//Générer le spawn des ennemies
function spawnEnemy() {
  let x, y, key;

  let attempts = 0;
  do {
    x = Math.floor(Math.random() * gridSize);
    y = Math.floor(Math.random() * gridSize);
    key = `${x}-${y}`;
    attempts++;
    if (attempts > 100) return; // éviter boucle infinie
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

//Vérifier le spawn des ennemies 
function isOccupied(x, y) {
  const objects = document.querySelectorAll(".block-indestructible, .block-breakable, .enemy");
  const posX = x * cellSize;
  const posY = y * cellSize;

  for (let obj of objects) {
    const objX = parseInt(obj.style.left);
    const objY = parseInt(obj.style.top);
    if (objX === posX && objY === posY) {
      return true; // Cette case est déjà prise
    }
  }

  return false; // Rien sur cette case
}

function afficherMessage(msg) {
  const message = document.getElementById("message");
  message.textContent = msg;
  message.style.display = "block";

  setTimeout(() => {
    message.style.display = "none";
  }, 2000);
}
