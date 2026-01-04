window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/engine/camera.js',
  exports: ['Camera'],
  dependencies: ['Vector2', 'clamp', 'lerp']
});

window.Camera = class Camera {
  constructor(width, height) {
    this.position = new window.Vector2(0, 0);
    this.width = width;
    this.height = height;
    this.target = null;
    this.followSpeed = 0.1;
    this.bounds = null;
    this.shake = { x: 0, y: 0, duration: 0, intensity: 0 };
  }
  
  follow(target, speed = 0.1) {
    this.target = target;
    this.followSpeed = speed;
  }
  
  unfollow() {
    this.target = null;
  }
  
  setPosition(x, y) {
    this.position.x = x;
    this.position.y = y;
  }
  
  setBounds(x, y, width, height) {
    this.bounds = {
      left: x,
      top: y,
      right: x + width,
      bottom: y + height
    };
  }
  
  shake(intensity, duration) {
    this.shake.intensity = intensity;
    this.shake.duration = duration;
    this.shake.x = (Math.random() - 0.5) * intensity;
    this.shake.y = (Math.random() - 0.5) * intensity;
  }
  
  update(deltaTime) {
    if (this.target) {
      // Smooth follow with lerp
      const targetX = this.target.position.x || this.target.x || 0;
      const targetY = this.target.position.y || this.target.y || 0;
      
      this.position.x = window.lerp(this.position.x, targetX, this.followSpeed);
      this.position.y = window.lerp(this.position.y, targetY, this.followSpeed);
    }
    
    // Apply bounds
    if (this.bounds) {
      const halfWidth = this.width / 2;
      const halfHeight = this.height / 2;
      
      this.position.x = window.clamp(
        this.position.x,
        this.bounds.left + halfWidth,
        this.bounds.right - halfWidth
      );
      
      this.position.y = window.clamp(
        this.position.y,
        this.bounds.top + halfHeight,
        this.bounds.bottom - halfHeight
      );
    }
    
    // Update camera shake
    if (this.shake.duration > 0) {
      this.shake.duration -= deltaTime;
      if (this.shake.duration <= 0) {
        this.shake.x = 0;
        this.shake.y = 0;
        this.shake.intensity = 0;
      } else {
        // Random walk for shake effect
        this.shake.x += (Math.random() - 0.5) * this.shake.intensity;
        this.shake.y += (Math.random() - 0.5) * this.shake.intensity;
        
        // Damping
        this.shake.x *= 0.9;
        this.shake.y *= 0.9;
        
        // Clamp shake
        this.shake.x = window.clamp(this.shake.x, -this.shake.intensity, this.shake.intensity);
        this.shake.y = window.clamp(this.shake.y, -this.shake.intensity, this.shake.intensity);
      }
    }
  }
  
  getWorldPosition(screenX, screenY) {
    return new window.Vector2(
      screenX + this.position.x - this.width / 2 + this.shake.x,
      screenY + this.position.y - this.height / 2 + this.shake.y
    );
  }
  
  getScreenPosition(worldX, worldY) {
    return new window.Vector2(
      worldX - this.position.x + this.width / 2 - this.shake.x,
      worldY - this.position.y + this.height / 2 - this.shake.y
    );
  }
  
  isInView(worldX, worldY, padding = 0) {
    const halfWidth = this.width / 2 + padding;
    const halfHeight = this.height / 2 + padding;
    
    return worldX >= this.position.x - halfWidth &&
           worldX <= this.position.x + halfWidth &&
           worldY >= this.position.y - halfHeight &&
           worldY <= this.position.y + halfHeight;
  }
};