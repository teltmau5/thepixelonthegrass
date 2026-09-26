// The player-controlled grey dot.

class Player {
  constructor(x, y, size, speed, color) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
    this.color = color;
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
  }

  update(dt, keysState, bounds) {
    let dx = 0;
    let dy = 0;

    if (keysState.ArrowUp) dy -= 1;
    if (keysState.ArrowDown) dy += 1;
    if (keysState.ArrowLeft) dx -= 1;
    if (keysState.ArrowRight) dx += 1;

    if (dx !== 0 && dy !== 0) {
      // Normalize diagonal movement so it isn't faster than straight movement.
      const inv = 1 / Math.sqrt(2);
      dx *= inv;
      dy *= inv;
    }

    this.x += dx * this.speed * dt;
    this.y += dy * this.speed * dt;

    const half = this.size / 2;
    this.x = clamp(this.x, half, bounds.width - half);
    this.y = clamp(this.y, half, bounds.height - half);
  }

  getRect() {
    const half = this.size / 2;
    return { x: this.x - half, y: this.y - half, w: this.size, h: this.size };
  }

  draw(ctx) {
    const half = this.size / 2;
    ctx.fillStyle = this.color;
    ctx.fillRect(Math.round(this.x - half), Math.round(this.y - half), this.size, this.size);
  }
}
