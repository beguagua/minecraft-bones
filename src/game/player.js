window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/game/player.js',
  exports: ['Player'],
  dependencies: ['Vector2', 'clamp', 'distance']
});

window.Player = class Player {
  constructor(x, y) {
    this.position = new Vector2(x, y);
    this.velocity = new Vector2(0, 0);
    this.size = { width: 32, height: 52 };
    this.speed = 200;
    this.health = 100;
    this.maxHealth = 100;
    this.attackDamage = 25;
    this.attackRange = 45;
    this.attackCooldown = 600;
    this.lastAttackTime = 0;
    this.facingRight = true;
    this.animationTime = 0;
    this.isAttacking = false;
    this.attackDuration = 300;
    this.attackStartTime = 0;
    
    // Animações estilo Minecraft
    this.bobOffset = 0;
    this.armSwing = 0;
    this.legSwing = 0;
    this.jumpBob = 0;
    this.isGrounded = true;
  }
  
  update(deltaTime, input, worldBounds) {
    const dt = deltaTime / 1000;
    
    // Animações do player
    this.animationTime += dt;
    this.bobOffset = Math.sin(this.animationTime * 8) * 1;
    this.armSwing = this.isAttacking ? 
      Math.sin((Date.now() - this.attackStartTime) * 0.02) * 90 : 
      Math.sin(this.animationTime * 6) * 8;
    this.legSwing = Math.sin(this.animationTime * 10) * 10;
    
    // Movimento
    const movement = input.getMovementInput();
    this.velocity = new Vector2(movement.x * this.speed, movement.y * this.speed);
    
    // Ataque
    if (input.isAttacking() && Date.now() - this.lastAttackTime > this.attackCooldown) {
      this.startAttack();
    }
    
    // Resetar ataque
    if (this.isAttacking && Date.now() - this.attackStartTime > this.attackDuration) {
      this.isAttacking = false;
    }
    
    // Atualizar posição
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
    
    // Manter dentro dos limites
    this.position.x = clamp(this.position.x, 0, worldBounds.width - this.size.width);
    this.position.y = clamp(this.position.y, 0, worldBounds.height - this.size.height);
    
    // Atualizar facing
    if (this.velocity.x !== 0) {
      this.facingRight = this.velocity.x > 0;
    }
  }
  
  startAttack() {
    this.isAttacking = true;
    this.attackStartTime = Date.now();
    this.lastAttackTime = Date.now();
  }
  
  takeDamage(damage) {
    this.health -= damage;
    if (this.health < 0) this.health = 0;
  }
  
  heal(amount) {
    this.health = Math.min(this.health + amount, this.maxHealth);
  }
  
  checkEnemyHit(enemy) {
    if (!this.isAttacking) return false;
    
    const attackBounds = {
      x: this.facingRight ? 
        this.position.x + this.size.width : 
        this.position.x - this.attackRange,
      y: this.position.y + this.size.height / 2 - 20,
      width: this.attackRange,
      height: 40
    };
    
    const enemyBounds = enemy.getBounds();
    return this.checkCollision(attackBounds, enemyBounds);
  }
  
  checkCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }
  
  draw(ctx) {
    ctx.save();
    
    // Posição base com animação de corrida
    const x = this.position.x + this.size.width / 2;
    const y = this.position.y + this.size.height / 2 + this.bobOffset;
    
    ctx.translate(x, y);
    if (!this.facingRight) ctx.scale(-1, 1);
    
    // Corpo do player (azul claro)
    ctx.fillStyle = '#4A90E2';
    ctx.fillRect(-10, -15, 20, 20);
    
    // Cabeça
    ctx.fillStyle = '#FDBCB4';
    ctx.fillRect(-8, -30, 16, 15);
    
    // Cabelo
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(-8, -35, 16, 8);
    
    // Olhos
    ctx.fillStyle = '#000000';
    ctx.fillRect(-5, -25, 2, 2);
    ctx.fillRect(1, -25, 2, 2);
    
    // Braços
    ctx.fillStyle = '#4A90E2';
    ctx.save();
    ctx.rotate((this.armSwing * Math.PI) / 180);
    ctx.fillRect(-12, -12, 8, 18);
    ctx.fillRect(4, -12, 8, 18);
    ctx.restore();
    
    // Espada (se atacando)
    if (this.isAttacking) {
      ctx.save();
      ctx.rotate((this.armSwing * Math.PI) / 180);
      ctx.fillStyle = '#C0C0C0';
      ctx.fillRect(12, -15, 20, 4);
      ctx.fillRect(28, -13, 4, 8);
      ctx.restore();
    }
    
    // Pernas
    ctx.fillStyle = '#2E5090';
    const legMove = this.velocity.x !== 0 ? this.legSwing : 0;
    ctx.fillRect(-6 + legMove/3, 5, 5, 12);
    ctx.fillRect(1 - legMove/3, 5, 5, 12);
    
    // Botas
    ctx.fillStyle = '#654321';
    ctx.fillRect(-6 + legMove/3, 15, 5, 4);
    ctx.fillRect(1 - legMove/3, 15, 5, 4);
    
    ctx.restore();
    
    // Barra de vida
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(this.position.x, this.position.y - 10, this.size.width, 4);
    
    const healthPercent = this.health / this.maxHealth;
    ctx.fillStyle = healthPercent > 0.3 ? '#00FF00' : '#FF0000';
    ctx.fillRect(this.position.x, this.position.y - 10, this.size.width * healthPercent, 4);
    
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.position.x, this.position.y - 10, this.size.width, 4);
  }
  
  getBounds() {
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.size.width,
      height: this.size.height
    };
  }
  
  isDead() {
    return this.health <= 0;
  }
};