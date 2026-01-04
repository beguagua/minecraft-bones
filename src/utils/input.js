window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/utils/input.js',
  exports: ['InputManager']
});

window.InputManager = class InputManager {
  constructor() {
    this.keys = {};
    this.touches = {};
    this.mobileControls = {
      up: false,
      down: false,
      left: false,
      right: false,
      attack: false,
      jump: false
    };
    
    this.setupKeyboard();
    this.setupTouch();
    this.setupMobileButtons();
  }
  
  setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      e.preventDefault();
    });
    
    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      e.preventDefault();
    });
  }
  
  setupTouch() {
    window.addEventListener('touchstart', (e) => {
      for (let touch of e.touches) {
        this.touches[touch.identifier] = {
          x: touch.clientX,
          y: touch.clientY,
          startX: touch.clientX,
          startY: touch.clientY
        };
      }
      e.preventDefault();
    });
    
    window.addEventListener('touchmove', (e) => {
      for (let touch of e.touches) {
        if (this.touches[touch.identifier]) {
          this.touches[touch.identifier].x = touch.clientX;
          this.touches[touch.identifier].y = touch.clientY;
        }
      }
      e.preventDefault();
    });
    
    window.addEventListener('touchend', (e) => {
      for (let touch of e.changedTouches) {
        delete this.touches[touch.identifier];
      }
      e.preventDefault();
    });
  }
  
  setupMobileButtons() {
    // D-pad buttons
    const buttons = document.querySelectorAll('.d-btn, .action-btn');
    
    buttons.forEach(button => {
      const action = button.dataset.action;
      if (!action) return;
      
      // Mouse events
      button.addEventListener('mousedown', () => {
        this.mobileControls[action] = true;
      });
      
      button.addEventListener('mouseup', () => {
        this.mobileControls[action] = false;
      });
      
      button.addEventListener('mouseleave', () => {
        this.mobileControls[action] = false;
      });
      
      // Touch events
      button.addEventListener('touchstart', (e) => {
        this.mobileControls[action] = true;
        e.preventDefault();
      });
      
      button.addEventListener('touchend', (e) => {
        this.mobileControls[action] = false;
        e.preventDefault();
      });
    });
  }
  
  isKeyPressed(keyCode) {
    return !!this.keys[keyCode];
  }
  
  isMobileControlActive(control) {
    return !!this.mobileControls[control];
  }
  
  getMovementInput() {
    let dx = 0, dy = 0;
    
    // Keyboard input
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) dx = -1;
    if (this.keys['ArrowRight'] || this.keys['KeyD']) dx = 1;
    if (this.keys['ArrowUp'] || this.keys['KeyW']) dy = -1;
    if (this.keys['ArrowDown'] || this.keys['KeyS']) dy = 1;
    
    // Mobile input
    if (this.mobileControls.left) dx = -1;
    if (this.mobileControls.right) dx = 1;
    if (this.mobileControls.up) dy = -1;
    if (this.mobileControls.down) dy = 1;
    
    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      dx *= 0.707;
      dy *= 0.707;
    }
    
    return { x: dx, y: dy };
  }
  
  isAttacking() {
    return this.keys['Space'] || this.mobileControls.attack;
  }
  
  isJumping() {
    return this.keys['KeyW'] || this.keys['ArrowUp'] || this.mobileControls.jump;
  }
  
  reset() {
    this.keys = {};
    this.mobileControls = {
      up: false,
      down: false,
      left: false,
      right: false,
      attack: false,
      jump: false
    };
  }
};