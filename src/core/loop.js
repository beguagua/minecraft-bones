window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/core/loop.js',
  exports: ['GameLoop'],
  dependencies: []
});

window.GameLoop = class GameLoop {
  constructor() {
    this.lastTime = 0;
    this.running = false;
    this.game = null;
  }
  
  start(game) {
    this.game = game;
    this.running = true;
    this.lastTime = performance.now();
    this.loop();
  }
  
  stop() {
    this.running = false;
  }
  
  loop() {
    if (!this.running) return;
    
    const currentTime = performance.now();
    const deltaTime = Math.min(currentTime - this.lastTime, 100); // Cap at 100ms
    this.lastTime = currentTime;
    
    this.game.update(deltaTime);
    this.game.render();
    
    requestAnimationFrame(() => this.loop());
  }
};