window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/main.js',
  exports: ['game', 'gameLoop'],
  dependencies: ['Game', 'GameLoop']
});

// Variáveis globais
window.game = null;
window.gameLoop = null;

// Inicialização do jogo
async function initGame() {
  const canvas = document.getElementById('gameCanvas');
  
  // Ajustar canvas para mobile
  if (window.innerWidth <= 768) {
    canvas.width = Math.min(window.innerWidth - 20, 800);
    canvas.height = Math.min(window.innerHeight - 200, 600);
  }
  
  window.game = new Game();
  window.gameLoop = new GameLoop();
  
  window.game.init(canvas);
}

// Começar jogo
function startGame() {
  const menu = document.getElementById('menu');
  menu.classList.add('hidden');
  
  if (!window.game) {
    initGame().then(() => {
      window.gameLoop.start(window.game);
    });
  } else {
    window.game.reset();
    window.gameLoop.start(window.game);
  }
}

// Detectar mobile
function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Ajustar para diferentes tamanhos de tela
function resizeCanvas() {
  const canvas = document.getElementById('gameCanvas');
  const container = document.querySelector('.game-container');
  
  if (isMobile()) {
    const maxWidth = window.innerWidth - 20;
    const maxHeight = window.innerHeight - 200;
    
    const aspectRatio = 4/3;
    let width = maxWidth;
    let height = width / aspectRatio;
    
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
    
    canvas.width = Math.min(width, 800);
    canvas.height = Math.min(height, 600);
  }
}

// Inicializar quando página carregar
document.addEventListener('DOMContentLoaded', () => {
  resizeCanvas();
  
  // Adicionar listener para resize
  window.addEventListener('resize', resizeCanvas);
  
  // Prevenir zoom em mobile
  document.addEventListener('touchmove', (e) => {
    if (e.scale !== 1) {
      e.preventDefault();
    }
  }, { passive: false });
  
  // Prevenir double tap zoom
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
  
  // Mostrar controles mobile se necessário
  if (isMobile()) {
    document.querySelector('.mobile-controls').style.display = 'flex';
  }
});

// Funções utilitárias para o jogo
function updateUI() {
  if (window.game) {
    const waveElement = document.getElementById('wave');
    if (waveElement) {
      waveElement.textContent = window.game.wave;
    }
  }
}

// Loop de atualização da UI
setInterval(updateUI, 100);

// Controle de visibilidade da página
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pausar jogo quando aba não estiver visível
    if (window.gameLoop) {
      window.gameLoop.stop();
    }
  } else {
    // Resumar jogo quando aba voltar
    if (window.game && window.game.gameState === 'playing') {
      window.gameLoop.start(window.game);
    }
  }
});

// Exportar funções para acesso global
window.startGame = startGame;
window.initGame = initGame;