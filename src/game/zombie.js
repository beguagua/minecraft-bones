window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/game/zombie.js',
  exports: ['Zombie'],
  dependencies: ['Vector2', 'clamp', 'distance']
});

window.Zombie = class Zombie {
  constructor(x, y) {
    this.position = new Vector2(x, y);
    this.velocity = new Vector2(0, 0);
    this.size = { width: 30, height: 50 };
    this.speed = 60;
    this.health = 50;
    this.maxHealth = 50;
    this.attackDamage = 15;
    this.attackRange = 40;
    this.detectionRange = 150;
    this.attackCooldown = 1500;
    this.lastAttackTime = 0;
    this.facingRight = false;
    this.animationTime = 0;
    this.state = 'wander'; // wander, chase, attack
    
    // Animação estilo Minecraft (movimentos robóticos)
    this.bobOffset = 0;
    this.armSwing = 0;
    this.legSwing = 0;
    this.headTilt = 0;
  }
  
  update(deltaTime, player, worldBounds) {
    const dt = deltaTime / 1000;
    
    // Animações estilo Minecraft
    this.animationTime += dt;
    this.bobOffset = Math.sin(this.animationTime * 6) * 1.5;
    this.armSwing = Math.sin(this.animationTime * 8) * 20;
    this.legSwing = Math.sin(this.animationTime * 9) * 12;
    this.headTilt = Math.sin(this.animationTime * 3) * 5;
    
    // Comportamento de IA
    const distToPlayer = distance(this.position.x, this.position.y, player.position.x, player.position.y);
    
    switch(this.state) {
      case 'wander':
        this.wander(dt);
        if (distToPlayer < this.detectionRange) {
          this.state = 'chase';
        }
        break;
        
      case 'chase':
        this.chasePlayer(dt, player);
        if (distToPlayer < this.attackRange) {
          this.state = 'attack';
          this.lastAttackTime = Date.now();
        } else if (distToPlayer > this.detectionRange * 2) {
          this.state = 'wander';
        }
        break;
        
      case 'attack':
        this.attackPlayer(dt, player);
        if (distToPlayer > this.attackRange) {
          this.state = 'chase';
        }
        break;
    }
    
    // Atualizar posição
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
    
    // Manter dentro dos limites
    this.position.x = clamp(this.position.x, 0, worldBounds.width - this.size.width);
    this.position.y = clamp(this.position.y, 0, worldBounds.height - this.size.height);
  }
  
  wander(dt) {
    // Movimento aleatório lento de zumbi
    if (Math.random() < 0.02) {
      const angle = Math.random() * Math.PI * 2;
      this.velocity = new Vector2(Math.cos(angle) * this.speed * 0.3, Math.sin(angle) * this.speed * 0.3);
      this.facingRight = this.velocity.x > 0;
    } else {
      this.velocity = this.velocity.multiply(0.9);
    }
  }
  
  chasePlayer(dt, player) {
    const dir = player.position.subtract(this.position).normalize();
    this.velocity = dir.multiply(this.speed);
    this.facingRight = dir.x > 0;
  }
  
  attackPlayer(dt, player) {
    this.velocity = this.velocity.multiply(0.3);
    
    if (Date.now() - this.lastAttackTime > this.attackCooldown) {
      const distToPlayer = distance(this.position.x, this.position.y, player.position.x, player.position.y);
      if (distToPlayer < this.attackRange) {
        player.takeDamage(this.attackDamage);
        this.lastAttackTime = Date.now();
      }
    }
  }
  
  takeDamage(damage) {
    this.health -= damage;
    if (this.health < 0) this.health = 0;
  }
  
  draw(ctx) {
    ctx.save();
    
    // Posição base com animação de balanço
    const x = this.position.x + this.size.width / 2;
    const y = this.position.y + this.size.height / 2 + this.bobOffset;
    
    ctx.translate(x, y);
    if (!this.facingRight) ctx.scale(-1, 1);
    
    // Corpo do zumbi (verde escuro)
    ctx.fillStyle = '#2A5F2A';
    ctx.fillRect(-12, -15, 24, 20);
    
    // Cabeça (verde mais claro)
    ctx.fillStyle = '#4A8F4A';
    ctx.save();
    ctx.rotate((this.headTilt * Math.PI) / 180);
    ctx.fillRect(-8, -28, 16, 13);
    ctx.restore();
    
    // Olhos (vazios, pretos)
    ctx.fillStyle = '#000000';
    ctx.fillRect(-5, -24, 3, 3);
    ctx.fillRect(2, -24, 3, 3);
    
    // Braços estendidos (estilo zumbi)
    ctx.fillStyle = '#2A5F2A';
    ctx.save();
    ctx.rotate((this.armSwing * Math.PI) / 180);
    ctx.fillRect(-15, -12, 8, 18);
    ctx.fillRect(7, -12, 8, 18);
    ctx.restore();
    
    // Pernas arrastando
    const legDrag = this.state === 'chase' ? this.legSwing : 5;
    ctx.fillStyle = '#2A5F2A';
    ctx.fillRect(-8 + legDrag/3, 5, 6, 12);
    ctx.fillRect(2 - legDrag/3, 5, 6, 12);
    
    // Detalhes de decomposição
    ctx.fillStyle = '#1A3F1A';
    ctx.fillRect(-10, -10, 3, 3);
    ctx.fillRect(7, -8, 2, 2);
    
    ctx.restore();
    
    // Barra de vida
    if (this.health < this.maxHealth) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(this.position.x, this.position.y - 8, this.size.width, 3);
      
      const healthPercent = this.health / this.maxHealth;
      ctx.fillStyle = healthPercent > 0.3 ? '#00FF00' : '#FF0000';
      ctx.fillRect(this.position.x, this.position.y - 8, this.size.width * healthPercent, 3);
    }
  }
  
  isDead() {
    return this.health <= 0;
  }
  
  getBounds() {
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.size.width,
      height: this.size.height
    };
  }
};