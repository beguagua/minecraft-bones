window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/core/game.js',
  exports: ['Game'],
  dependencies: ['Player', 'Zombie', 'Skeleton', 'Willager', 'InputManager', 'Renderer', 'distance']
});

window.Game = class Game {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.renderer = null;
    this.input = null;
    this.player = null;
    this.enemies = [];
    this.boss = null;
    this.gameState = 'playing'; // playing, paused, gameover, victory
    this.wave = 1;
    this.enemiesPerWave = 3;
    this.maxEnemies = 10;
  }
  
  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.renderer = new Renderer(canvas);
    this.input = new InputManager();
    this.player = new Player(100, 100);
    
    this.renderer.setWorldBounds(2000, 2000);
    
    this.spawnWave();
  }
  
  spawnWave() {
    this.enemies = [];
    
    // Spawn baseado na wave
    const enemyCount = Math.min(this.enemiesPerWave + this.wave, this.maxEnemies);
    
    for (let i = 0; i < enemyCount; i++) {
      const x = 300 + (i * 150) + Math.random() * 100;
      const y = 100 + Math.random() * 200;
      
      if (this.wave >= 3 && Math.random() < 0.5) {
        this.enemies.push(new Skeleton(x, y));
      } else {
        this.enemies.push(new Zombie(x, y));
      }
    }
    
    // Boss na wave 5
    if (this.wave === 5 && !this.boss) {
      this.boss = new Willager(1000, 500);
    }
  }
  
  update(deltaTime) {
    if (this.gameState !== 'playing') return;
    
    // Update player
    this.player.update(deltaTime, this.input, this.renderer.worldBounds);
    
    // Update camera
    this.renderer.updateCamera(this.player);
    
    // Update enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(deltaTime, this.player, this.renderer.worldBounds);
      
      // Check player attacks
      if (this.player.checkEnemyHit(enemy)) {
        enemy.takeDamage(this.player.attackDamage);
      }
      
      // Remove dead enemies
      if (enemy.isDead()) {
        this.enemies.splice(i, 1);
      }
    }
    
    // Update boss
    if (this.boss && !this.boss.isDead()) {
      this.boss.update(deltaTime, this.player, this.renderer.worldBounds);
      
      // Check player attacks on boss
      if (this.player.checkEnemyHit(this.boss)) {
        this.boss.takeDamage(this.player.attackDamage);
      }
      
      // Boss defeated
      if (this.boss.isDead()) {
        this.gameState = 'victory';
      }
    }
    
    // Check wave completion
    if (this.enemies.length === 0 && (!this.boss || this.boss.isDead())) {
      this.wave++;
      if (this.wave <= 5) {
        setTimeout(() => this.spawnWave(), 2000);
      } else if (this.boss && this.boss.isDead()) {
        this.gameState = 'victory';
      }
    }
    
    // Check game over
    if (this.player.isDead()) {
      this.gameState = 'gameover';
    }
  }
  
  render() {
    this.renderer.clear();
    this.renderer.drawBackground();
    
    this.ctx.save();
    
    // Aplicar transformação da camera
    this.ctx.translate(-this.renderer.camera.x, -this.renderer.camera.y);
    
    // Draw game objects
    this.player.draw(this.ctx);
    
    for (const enemy of this.enemies) {
      enemy.draw(this.ctx);
    }
    
    if (this.boss && !this.boss.isDead()) {
      this.boss.draw(this.ctx);
    }
    
    this.ctx.restore();
    
    // Draw UI
    this.drawUI();
  }
  
  drawUI() {
    // Wave info
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.fillText(`Wave ${this.wave}/5`, 20, 40);
    
    // Enemy count
    this.ctx.font = '18px Arial';
    this.ctx.fillText(`Enemies: ${this.enemies.length}`, 20, 65);
    
    // Boss info
    if (this.boss && !this.boss.isDead()) {
      this.ctx.fillStyle = '#FF00FF';
      this.ctx.font = 'bold 20px Arial';
      this.ctx.fillText('WILLAGER BOSS', 20, 90);
    }
    
    // Game state messages
    if (this.gameState === 'gameover') {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = '#FF0000';
      this.ctx.font = 'bold 48px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
      
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = '24px Arial';
      this.ctx.fillText('O Willager derrotou você...', this.canvas.width / 2, this.canvas.height / 2 + 40);
      this.ctx.textAlign = 'left';
    }
    
    if (this.gameState === 'victory') {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = '#00FF00';
      this.ctx.font = 'bold 48px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('VITÓRIA!', this.canvas.width / 2, this.canvas.height / 2);
      
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = '24px Arial';
      this.ctx.fillText('Você derrotou o Willager!', this.canvas.width / 2, this.canvas.height / 2 + 40);
      this.ctx.fillText('O mundo de Minecraft está salvo!', this.canvas.width / 2, this.canvas.height / 2 + 70);
      this.ctx.textAlign = 'left';
    }
  }
  
  reset() {
    this.wave = 1;
    this.enemies = [];
    this.boss = null;
    this.gameState = 'playing';
    this.player = new Player(100, 100);
    this.spawnWave();
  }
};