window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/game/skeleton.js',
  exports: ['Skeleton'],
  dependencies: ['Vector2', 'clamp', 'distance']
});

window.Skeleton = class Skeleton {
  constructor(x, y) {
    this.position = new Vector2(x, y);
    this.velocity = new Vector2(0, 0);
    this.size = { width: 28, height: 48 };
    this.speed = 70;
    this.health = 40;
    this.maxHealth = 40;
    this.attackDamage = 20;
    this.attackRange = 50;
    this.detectionRange = 180;
    this.attackCooldown = 1200;
    this.lastAttackTime = 0;
    this.facingRight = false;
    this.animationTime = 0;
    this.state = 'patrol'; // patrol, chase, attack
    this.arrows = [];
    this.lastShootTime = 0;
    this.shootCooldown = 2500;
    
    // Animação esqueleto (movimentos secos e quebradiços)
    this.boneRattle = 0;
    this.bobOffset = 0;
    this.armAngle = 0;
    this.legSwing = 0;
  }
  
  update(deltaTime, player, worldBounds) {
    const dt = deltaTime / 1000;
    
    // Animações de esqueleto
    this.animationTime += dt;
    this.boneRattle = Math.sin(this.animationTime * 15) * 3;
    this.bobOffset = Math.sin(this.animationTime * 7) * 2;
    this.armAngle = this.state === 'attack' ? Math.sin(this.animationTime * 10) * 45 : Math.sin(this.animationTime * 5) * 10;
    this.legSwing = Math.sin(this.animationTime * 12) * 15;
    
    // Comportamento de IA
    const distToPlayer = distance(this.position.x, this.position.y, player.position.x, player.position.y);
    
    switch(this.state) {
      case 'patrol':
        this.patrol(dt);
        if (distToPlayer < this.detectionRange) {
          this.state = 'chase';
        }
        break;
        
      case 'chase':
        this.chasePlayer(dt, player);
        if (distToPlayer < this.detectionRange * 0.8) {
          this.state = 'attack';
        } else if (distToPlayer > this.detectionRange * 2) {
          this.state = 'patrol';
        }
        break;
        
      case 'attack':
        this.attackPlayer(dt, player);
        if (distToPlayer > this.detectionRange) {
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
    
    // Atualizar flechas
    this.updateArrows(dt, player, worldBounds);
  }
  
  patrol(dt) {
    // Patrulha aleatória
    if (Math.random() < 0.03) {
      const angle = Math.random() * Math.PI * 2;
      this.velocity = new Vector2(Math.cos(angle) * this.speed * 0.4, Math.sin(angle) * this.speed * 0.4);
      this.facingRight = this.velocity.x > 0;
    } else {
      this.velocity = this.velocity.multiply(0.8);
    }
  }
  
  chasePlayer(dt, player) {
    const dir = player.position.subtract(this.position).normalize();
    
    // Esqueletos mantêm distância
    const distToPlayer = dir.magnitude();
    if (distToPlayer < 100) {
      this.velocity = dir.multiply(-this.speed * 0.5);
    } else {
      this.velocity = dir.multiply(this.speed);
    }
    
    this.facingRight = dir.x > 0;
  }
  
  attackPlayer(dt, player) {
    this.velocity = this.velocity.multiply(0.5);
    
    // Atira flechas em vez de ataque corpo a corpo
    if (Date.now() - this.lastShootTime > this.shootCooldown) {
      this.shootArrow(player);
      this.lastShootTime = Date.now();
    }
  }
  
  shootArrow(player) {
    const dir = player.position.subtract(this.position).normalize();
    this.arrows.push({
      position: this.position.clone(),
      velocity: dir.multiply(300),
      lifetime: 3000,
      damage: this.attackDamage
    });
  }
  
  updateArrows(dt, player, worldBounds) {
    for (let i = this.arrows.length - 1; i >= 0; i--) {
      const arrow = this.arrows[i];
      
      // Atualizar posição
      arrow.position = arrow.position.add(arrow.velocity.multiply(dt));
      arrow.lifetime -= dt * 1000;
      
      // Remover se sair dos limites ou expirar
      if (arrow.lifetime <= 0 || 
          arrow.position.x < 0 || arrow.position.x > worldBounds.width ||
          arrow.position.y < 0 || arrow.position.y > worldBounds.height) {
        this.arrows.splice(i, 1);
        continue;
      }
      
      // Verificar colisão com player
      const arrowBounds = {
        x: arrow.position.x - 2,
        y: arrow.position.y - 2,
        width: 4,
        height: 4
      };
      
      const playerBounds = player.getBounds();
      if (this.checkCollision(arrowBounds, playerBounds)) {
        player.takeDamage(arrow.damage);
        this.arrows.splice(i, 1);
      }
    }
  }
  
  checkCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
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
    
    // Adicionar tremido de ossos
    ctx.translate(this.boneRattle, 0);
    
    // Corpo do esqueleto (branco/amarelado)
    ctx.fillStyle = '#F0F0DC';
    ctx.fillRect(-10, -15, 20, 18);
    
    // Cabeça de caveira
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-7, -28, 14, 13);
    
    // Olhos ocos (pretos)
    ctx.fillStyle = '#000000';
    ctx.fillRect(-5, -24, 3, 3);
    ctx.fillRect(2, -24, 3, 3);
    
    // Nariz caveira
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(-2, -18);
    ctx.lineTo(2, -18);
    ctx.closePath();
    ctx.fill();
    
    // Braços (finos, estilo osso)
    ctx.fillStyle = '#F0F0DC';
    ctx.save();
    ctx.rotate((this.armAngle * Math.PI) / 180);
    ctx.fillRect(-12, -12, 6, 16);
    ctx.fillRect(6, -12, 6, 16);
    ctx.restore();
    
    // Pernas (finas)
    ctx.fillStyle = '#F0F0DC';
    const legMove = this.state === 'chase' ? this.legSwing : 0;
    ctx.fillRect(-7 + legMove/3, 3, 5, 14);
    ctx.fillRect(2 - legMove/3, 3, 5, 14);
    
    // Arco (segurado)
    if (this.state === 'attack') {
      ctx.strokeStyle = '#8B4513';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(10, -10, 8, -Math.PI/3, Math.PI/3);
      ctx.stroke();
      
      // Flecha no arco
      ctx.strokeStyle = '#654321';
      ctx.beginPath();
      ctx.moveTo(10, -18);
      ctx.lineTo(10, -2);
      ctx.stroke();
    }
    
    ctx.restore();
    
    // Desenhar flechas
    ctx.fillStyle = '#654321';
    for (const arrow of this.arrows) {
      ctx.save();
      ctx.translate(arrow.position.x, arrow.position.y);
      const angle = Math.atan2(arrow.velocity.y, arrow.velocity.x);
      ctx.rotate(angle);
      ctx.fillRect(-10, -1, 20, 2);
      ctx.fillRect(8, -3, 6, 6);
      ctx.restore();
    }
    
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