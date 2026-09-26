// A danger zone that moves around the screen and can trigger warnings.

class DangerZone {
  constructor(x, y, w, h, speed) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.speed = speed;
    
    // Random movement direction (normalized)
    const angle = Math.random() * Math.PI * 2;
    this.vx = Math.cos(angle);
    this.vy = Math.sin(angle);
  }

  update(dt, bounds) {
    this.x += this.vx * this.speed * dt;
    this.y += this.vy * this.speed * dt;

    // Bounce off edges
    const margin = 2;
    if (this.x - margin < 0 || this.x + this.w + margin > bounds.width) {
      this.vx *= -1;
      this.x = clamp(this.x, margin, bounds.width - this.w - margin);
    }
    if (this.y - margin < 0 || this.y + this.h + margin > bounds.height) {
      this.vy *= -1;
      this.y = clamp(this.y, margin, bounds.height - this.h - margin);
    }
  }

  getRect() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  draw(ctx, color, borderColor) {
    ctx.fillStyle = color;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x + 0.5, this.y + 0.5, this.w - 1, this.h - 1);
  }
}

// A warning indicator showing where a new danger zone will spawn.
class DangerSpawnWarning {
  constructor(x, y, w, h, duration) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.duration = duration;
    this.elapsed = 0;
  }

  update(dt) {
    this.elapsed += dt;
    return this.elapsed < this.duration;
  }

  getProgress() {
    return this.elapsed / this.duration;
  }

  draw(ctx, color, borderColor) {
    // Pulse opacity based on progress
    const progress = this.getProgress();
    const opacity = 0.3 + 0.4 * Math.sin(progress * Math.PI * 4); // Blink effect

    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x + 0.5, this.y + 0.5, this.w - 1, this.h - 1);
    ctx.globalAlpha = 1.0;
  }
}
