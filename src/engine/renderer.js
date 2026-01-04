window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/engine/renderer.js',
  exports: ['Renderer'],
  dependencies: []
});

window.Renderer = class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.camera = { x: 0, y: 0 };
    this.worldBounds = { width: 2000, height: 2000 };
  }
  
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  drawBackground() {
    // Fundo estilo Minecraft (céu azul com blocos)
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98D8E8');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Nuvens estilo Minecraft
    this.drawClouds();
    
    // Chão de blocos
    this.drawGround();
  }
  
  drawClouds() {
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    
    // Nuvens simples (estilo Minecraft)
    const cloudY = 50;
    const clouds = [
      { x: 100 - this.camera.x * 0.2, size: 40 },
      { x: 400 - this.camera.x * 0.2, size: 60 },
      { x: 700 - this.camera.x * 0.2, size: 35 }
    ];
    
    for (const cloud of clouds) {
      this.ctx.fillRect(cloud.x, cloudY, cloud.size, 20);
      this.ctx.fillRect(cloud.x - 10, cloudY + 5, cloud.size + 20, 15);
      this.ctx.fillRect(cloud.x + 5, cloudY + 10, cloud.size - 10, 10);
    }
  }
  
  drawGround() {
    const blockSize = 32;
    const startY = this.canvas.height - 100;
    
    this.ctx.fillStyle = '#8B7355';
    
    for (let x = -blockSize; x < this.canvas.width + blockSize; x += blockSize) {
      for (let y = startY; y < this.canvas.height; y += blockSize) {
        const worldX = x + this.camera.x;
        const worldY = y;
        
        // Adicionar variação de cor nos blocos
        const variation = (worldX + worldY) % 3;
        this.ctx.fillStyle = variation === 0 ? '#8B7355' : 
                            variation === 1 ? '#9B8365' : '#7B6345';
        
        this.ctx.fillRect(x, y, blockSize, blockSize);
        
        // Linhas dos blocos
        this.ctx.strokeStyle = '#6B5335';
        this.ctx.strokeRect(x, y, blockSize, blockSize);
      }
    }
  }
  
  updateCamera(target) {
    this.camera.x = target.position.x - this.canvas.width / 2;
    this.camera.y = target.position.y - this.canvas.height / 2;
    
    // Limitar camera aos limites do mundo
    this.camera.x = Math.max(0, Math.min(this.camera.x, this.worldBounds.width - this.canvas.width));
    this.camera.y = Math.max(0, Math.min(this.camera.y, this.worldBounds.height - this.canvas.height));
  }
  
  setWorldBounds(width, height) {
    this.worldBounds = { width, height };
  }
  
  screenToWorld(screenX, screenY) {
    return {
      x: screenX + this.camera.x,
      y: screenY + this.camera.y
    };
  }
  
  worldToScreen(worldX, worldY) {
    return {
      x: worldX - this.camera.x,
      y: worldY - this.camera.y
    };
  }
};