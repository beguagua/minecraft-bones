window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/game/willager.js',
  exports: ['Willager'],
  dependencies: ['Vector2', 'clamp', 'distance']
});

window.Willager = class Willager {
  constructor(x, y) {
    this.position = new Vector2(x, y);
    this.velocity = new Vector2(0, 0);
    this.size = { width: 40, height: 60 };
    this.speed = 80;
    this.health = 200;
    this.maxHealth = 200;
    this.attackDamage = 35;
    this.attackRange = 60;
    this.detectionRange = 200;
    this.attackCooldown = 1000;
    this.lastAttackTime = 0;
    this.facingRight = false;
    this.animationTime = 0;
    this.state = 'idle'; // idle, patrol, chase, attack, special
    this.specialCooldown = 8000;
    this.lastSpecialTime = 0;
    this.kyronPower = 0;
    
    // Animações do Willager (cinza, corrompido)
    this.corruptionGlow = 0;
    this.madBob = 0;
    this.armFlail = 0;
    this.headShake = 0;
    this.eyeGlow = 0;
  }
  
  update(deltaTime, player, worldBounds) {
    const dt = deltaTime / 1000;
    
    // Animações de corrupção do Kyron
    this.animationTime += dt;
    this.corruptionGlow = Math.sin(this.animationTime * 4) * 0.3 + 0.7;
    this.madBob = Math.sin(this.animationTime * 10) * 3;
    this.armFlail = Math.sin(this.animationTime * 12) * 40;
    this.headShake = Math.sin(this.animationTime * 8) * 8;
    this.eyeGlow = Math.sin(this.animationTime * 6) * 50 + 205;
    
    // Comportamento de IA do vilão
    const distToPlayer = distance(this.position.x, this.position.y, player.position.x, player.position.y);
    
    switch(this.state) {
      case 'idle':
        this.idle(dt);
        if (distToPlayer < this.detectionRange) {
          this.state = 'chase';
        }
        break;
        
      case 'patrol':
        this.patrol(dt);
        if (distToPlayer < this.detectionRange) {
          this.state = 'chase';
        }
        break;
        
      case 'chase':
        this.chasePlayer(dt, player);
        if (distToPlayer < this.attackRange) {
          this.state = 'attack';
        } else if (distToPlayer > this.detectionRange * 2) {
          this.state = 'patrol';
        }
        
        // Ataque especial quando perto
        if (distToPlayer < 150 && Date.now() - this.lastSpecialTime > this.specialCooldown) {
          this.state = 'special';
          this.lastSpecialTime = Date.now();
        }
        break;
        
      case 'attack':
        this.attackPlayer(dt, player);
        if (distToPlayer > this.attackRange) {
          this.state = 'chase';
        }
        break;
        
      case 'special':
        this.specialAttack(dt, player);
        if (this.animationTime % 1 > 0.8) {
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
  
  idle(dt) {
    // Willager parado, mas animado
    this.velocity = new Vector2(0, 0);
  }
  
  patrol(dt) {
    // Patrulha maligna
    if (Math.random() < 0.02) {
      const angle = Math.random() * Math.PI * 2;
      this.velocity = new Vector2(Math.cos(angle) * this.speed * 0.5, Math.sin(angle) * this.speed * 0.5);
      this.facingRight = this.velocity.x > 0;
    } else {
      this.velocity = this.velocity.multiply(0.85);
    }
  }
  
  chasePlayer(dt, player) {
    const dir = player.position.subtract(this.position).normalize();
    this.velocity = dir.multiply(this.speed);
    this.facingRight = dir.x > 0;
  }
  
  attackPlayer(dt, player) {
    this.velocity = this.velocity.multiply(0.4);
    
    if (Date.now() - this.lastAttackTime > this.attackCooldown) {
      const distToPlayer = distance(this.position.x, this.position.y, player.position.x, player.position.y);
      if (distToPlayer < this.attackRange) {
        player.takeDamage(this.attackDamage);
        this.lastAttackTime = Date.now();
      }
    }
  }
  
  specialAttack(dt, player) {
    // Explosão de energia Kyron
    this.velocity = new Vector2(0, 0);
    
    const distToPlayer = distance(this.position.x, this.position.y, player.position.x, player.position.y);
    if (distToPlayer < 120) {
      player.takeDamage(50); // Dano massivo
    }
  }
  
  takeDamage(damage) {
    this.health -= damage;
    this.kyronPower = Math.min(this.kyronPower + damage * 0.5, 100);
    if (this.health < 0) this.health = 0;
  }
  
  draw(ctx) {
    ctx.save();
    
    // Posição base com animação de doido
    const x = this.position.x + this.size.width / 2;
    const y = this.position.y + this.size.height / 2 + this.madBob;
    
    ctx.translate(x, y);
    if (!this.facingRight) ctx.scale(-1, 1);
    
    // Aura de corrupção Kyron
    ctx.fillStyle = `rgba(128, 0, 128, ${this.corruptionGlow * 0.3})`;
    ctx.beginPath();
    ctx.arc(0, 0, 35, 0, Math.PI * 2);
    ctx.fill();
    
    // Corpo do Willager (cinza corrompido)
    const grayShade = Math.floor(80 + this.kyronPower * 0.8);
    ctx.fillStyle = `rgb(${grayShade}, ${grayShade}, ${grayShade})`;
    ctx.fillRect(-15, -18, 30, 25);
    
    // Cabeça (cinza escuro)
    ctx.fillStyle = '#4A4A4A';
    ctx.save();
    ctx.rotate((this.headShake * Math.PI) / 180);
    ctx.fillRect(-10, -35, 20, 17);
    ctx.restore();
    
    // Olhos brilhantes (corrupção Kyron)
    ctx.fillStyle = `rgb(${this.eyeGlow}, 0, ${this.eyeGlow})`;
    ctx.fillRect(-7, -30, 4, 4);
    ctx.fillRect(3, -30, 4, 4);
    
    // Boca zangada
    ctx.strokeStyle = '#2A2A2A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-5, -20);
    ctx.lineTo(5, -20);
    ctx.stroke();
    
    // Braços corrompidos (movendo loucamente)
    ctx.fillStyle = '#5A5A5A';
    ctx.save();
    ctx.rotate((this.armFlail * Math.PI) / 180);
    ctx.fillRect(-20, -15, 10, 20);
    ctx.fillRect(10, -15, 10, 20);
    ctx.restore();
    
    // Pernas
    const legMove = this.state === 'chase' ? Math.sin(this.animationTime * 15) * 5 : 0;
    ctx.fillStyle = '#5A5A5A';
    ctx.fillRect(-8 + legMove, 7, 6, 15);
    ctx.fillRect(2 - legMove, 7, 6, 15);
    
    // Minério Kyron no peito
    ctx.fillStyle = '#8B008B';
    ctx.fillRect(-5, -10, 10, 8);
    ctx.strokeStyle = '#FF00FF';
    ctx.lineWidth = 1;
    ctx.strokeRect(-5, -10, 10, 8);
    
    ctx.restore();
    
    // Barra de vida do chefe
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(this.position.x - 10, this.position.y - 20, this.size.width + 20, 6);
    
    const healthPercent = this.health / this.maxHealth;
    ctx.fillStyle = healthPercent > 0.3 ? '#FF00FF' : '#FF0000';
    ctx.fillRect(this.position.x - 10, this.position.y - 20, (this.size.width + 20) * healthPercent, 6);
    
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.position.x - 10, this.position.y - 20, this.size.width + 20, 6);
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