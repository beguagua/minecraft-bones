window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/utils/math.js',
  exports: ['Vector2', 'clamp', 'lerp', 'distance', 'randomRange']
});

window.Vector2 = class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  
  add(other) {
    return new Vector2(this.x + other.x, this.y + other.y);
  }
  
  subtract(other) {
    return new Vector2(this.x - other.x, this.y - other.y);
  }
  
  multiply(scalar) {
    return new Vector2(this.x * scalar, this.y * scalar);
  }
  
  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  
  normalize() {
    const mag = this.magnitude();
    if (mag === 0) return new Vector2();
    return new Vector2(this.x / mag, this.y / mag);
  }
  
  lerp(other, t) {
    return new Vector2(
      this.x + (other.x - this.x) * t,
      this.y + (other.y - this.y) * t
    );
  }
  
  clone() {
    return new Vector2(this.x, this.y);
  }
};

window.clamp = function(value, min, max) {
  return Math.min(Math.max(value, min), max);
};

window.lerp = function(start, end, t) {
  return start + (end - start) * t;
};

window.distance = function(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
};

window.randomRange = function(min, max) {
  return Math.random() * (max - min) + min;
};