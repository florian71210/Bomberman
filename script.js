const gridSize = 15;
const cellSize = 40; // taille d'une case en pixels
const maxPos = (gridSize - 1) * cellSize;

const safeZones = [
  "0-0", "1-0","0-1",
];

const gameArea = document.querySelector("#game-area");
const player = document.getElementById("player1");

// Fonction explode déclarée ici, accessible globalement
function explode(x, y) {
  const directions = [
    { dx: 0, dy: 0 },       // centre
    { dx: -1, dy: 0 },      // gauche
    { dx: 1, dy: 0 },       // droite
    { dx: 0, dy: -1 },      // haut
    { dx: 0, dy: 1 }        // bas
  ];

  directions.forEach(dir => {
    const explosionX = x + dir.dx * cellSize;
    const explosionY = y + dir.dy * cellSize;

    // Crée une animation visuelle d'explosion
    const explosion = document.createElement("div");
    explosion.classList.add("explosion");
    explosion.style.left = explosionX + "px";
    explosion.style.top = explosionY + "px";
    explosion.style.position = "absolute";
    explosion.style.width = cellSize + "px";
    explosion.style.height = cellSize + "px";
    gameArea.appendChild(explosion);

    // Supprimer le bloc cassable s’il est touché
    const blocks = document.querySelectorAll(".block-breakable");
    blocks.forEach(block => {
      const blockX = parseInt(block.style.left);
      const blockY = parseInt(block.style.top);

      if (blockX === explosionX && blockY === explosionY) {
        block.remove(); // 💥 destruction du bloc cassable
      }
    });

    // Faire disparaître l’explosion après 500ms ,,,kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk i2lkmxcjlm2cvxv vcx  
    setTimeout(() => {
      explosion.remove();
    }, 500);
  });
} ;

window.addEventListener("DOMContentLoaded", () => {
  player.style.position = "absolute";
  player.style.left = "0px";
  player.style.top = "0px";

  generateBlocks();

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

function generateBlocks() {
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const posKey = `${x}-${y}`;
      if (safeZones.includes(posKey)) continue;

      const rand = Math.random();
      let blockType = null;
      if (rand < 0.3) {
        blockType = "block-indestructible"; // 30% des blocs sont incassables
      } else if (rand < 0.6) {
        blockType = "block-breakable"; // 60% des blocs sont cassables
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

