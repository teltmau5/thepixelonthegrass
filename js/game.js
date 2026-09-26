// Main game controller: state, update loop, rendering, UI wiring.

(function () {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const coinCounterEl = document.getElementById('coin-counter');
  const overlayEl = document.getElementById('overlay');
  const overlayTitleEl = document.getElementById('overlay-title');
  const overlayMessageEl = document.getElementById('overlay-message');
  const restartButton = document.getElementById('restart-button');

  let player = null;
  let dangerZones = [];
  let dangerSpawnWarnings = [];
  let coins = [];
  let coinsCollected = 0;
  let state = 'playing'; // 'playing' | 'gameover' | 'win'
  let lastTimestamp = null;
  let dangerSpawnTimer = 0;
  let nextSpawnWarningTime = CONFIG.DANGER_SPAWN_INTERVAL - CONFIG.DANGER_SPAWN_WARNING_TIME;

  function initGame() {
    const staticZones = generateDangerZones(CONFIG);
    dangerZones = staticZones.map(zone =>
      new DangerZone(zone.x, zone.y, zone.w, zone.h, CONFIG.DANGER_MOVE_SPEED)
    );
    coins = generateCoins(CONFIG, staticZones);
    player = new Player(
      CONFIG.SPAWN_X,
      CONFIG.SPAWN_Y,
      CONFIG.PLAYER_SIZE,
      CONFIG.PLAYER_SPEED,
      CONFIG.PLAYER_COLOR
    );
    coinsCollected = 0;
    dangerSpawnWarnings = [];
    dangerSpawnTimer = 0;
    nextSpawnWarningTime = CONFIG.DANGER_SPAWN_INTERVAL - CONFIG.DANGER_SPAWN_WARNING_TIME;
    state = 'playing';
    updateHud();
    hideOverlay();
  }

  function updateHud() {
    coinCounterEl.textContent = `Coins: ${coinsCollected}/${CONFIG.COIN_COUNT}`;
  }

  function showOverlay(title, message) {
    overlayTitleEl.textContent = title;
    overlayMessageEl.textContent = message;
    overlayEl.classList.remove('hidden');
  }

  function hideOverlay() {
    overlayEl.classList.add('hidden');
  }

  function triggerGameOver() {
    state = 'gameover';
    showOverlay('You Died', 'You touched a red danger zone.');
  }

  function triggerWin() {
    state = 'win';
    showOverlay('You Win!', 'You collected all 5 coins.');
  }

  function checkDangerCollision() {
    const playerRect = player.getRect();
    for (const zone of dangerZones) {
      if (rectsOverlap(playerRect, zone)) {
        triggerGameOver();
        return;
      }
    }
  }

  function checkCoinCollection() {
    const pickupDistance = CONFIG.PLAYER_SIZE / 2 + CONFIG.COIN_SIZE / 2;
    for (const coin of coins) {
      if (coin.collected) continue;
      if (distance(player.x, player.y, coin.x, coin.y) < pickupDistance) {
        coin.collected = true;
        coinsCollected += 1;
        updateHud();
      }
    }

    if (coinsCollected >= CONFIG.COIN_COUNT) {
      triggerWin();
    }
  }

  function spawnNewDangerZone() {
    // Generate a new danger zone similar to initial spawn but with stricter constraints
    let placed = false;
    for (let attempt = 0; attempt < CONFIG.DANGER_MAX_ATTEMPTS && !placed; attempt++) {
      const w = randInt(CONFIG.DANGER_ZONE_MIN_SIZE, CONFIG.DANGER_ZONE_MAX_SIZE);
      const h = randInt(CONFIG.DANGER_ZONE_MIN_SIZE, CONFIG.DANGER_ZONE_MAX_SIZE);
      const x = randInt(CONFIG.DANGER_EDGE_MARGIN, CONFIG.CANVAS_WIDTH - w - CONFIG.DANGER_EDGE_MARGIN);
      const y = randInt(CONFIG.DANGER_EDGE_MARGIN, CONFIG.CANVAS_HEIGHT - h - CONFIG.DANGER_EDGE_MARGIN);
      const candidate = { x, y, w, h };

      const hitsSpawn = circleOverlapsRect(
        CONFIG.SPAWN_X,
        CONFIG.SPAWN_Y,
        CONFIG.SPAWN_SAFE_RADIUS,
        candidate
      );

      if (!hitsSpawn) {
        dangerZones.push(new DangerZone(x, y, w, h, CONFIG.DANGER_MOVE_SPEED));
        placed = true;
      }
    }
  }

  function updateDangerSpawning(dt) {
    dangerSpawnTimer += dt;

    // Show warning when approaching spawn time
    if (dangerSpawnTimer >= nextSpawnWarningTime && dangerSpawnWarnings.length === 0) {
      // Pick a random spawn location and show warning
      const w = randInt(CONFIG.DANGER_ZONE_MIN_SIZE, CONFIG.DANGER_ZONE_MAX_SIZE);
      const h = randInt(CONFIG.DANGER_ZONE_MIN_SIZE, CONFIG.DANGER_ZONE_MAX_SIZE);
      const x = randInt(CONFIG.DANGER_EDGE_MARGIN, CONFIG.CANVAS_WIDTH - w - CONFIG.DANGER_EDGE_MARGIN);
      const y = randInt(CONFIG.DANGER_EDGE_MARGIN, CONFIG.CANVAS_HEIGHT - h - CONFIG.DANGER_EDGE_MARGIN);
      dangerSpawnWarnings.push(
        new DangerSpawnWarning(x, y, w, h, CONFIG.DANGER_SPAWN_WARNING_TIME)
      );
    }

    // Update warnings and spawn zone when warning expires
    dangerSpawnWarnings = dangerSpawnWarnings.filter(warning => {
      const stillActive = warning.update(dt);
      if (!stillActive) {
        // Warning expired, spawn the actual zone
        dangerZones.push(new DangerZone(warning.x, warning.y, warning.w, warning.h, CONFIG.DANGER_MOVE_SPEED));
      }
      return stillActive;
    });

    // Reset spawn timer when interval is reached
    if (dangerSpawnTimer >= CONFIG.DANGER_SPAWN_INTERVAL) {
      dangerSpawnTimer = 0;
      nextSpawnWarningTime = CONFIG.DANGER_SPAWN_INTERVAL - CONFIG.DANGER_SPAWN_WARNING_TIME;
    }
  }

  function update(dt) {
    player.update(dt, keys, { width: CONFIG.CANVAS_WIDTH, height: CONFIG.CANVAS_HEIGHT });
    
    // Update danger zones
    for (const zone of dangerZones) {
      zone.update(dt, { width: CONFIG.CANVAS_WIDTH, height: CONFIG.CANVAS_HEIGHT });
    }

    updateDangerSpawning(dt);
    checkDangerCollision();
    if (state === 'playing') checkCoinCollection();
  }

  function drawGrass() {
    const tile = CONFIG.TILE_SIZE;
    const cols = Math.ceil(CONFIG.CANVAS_WIDTH / tile);
    const rows = Math.ceil(CONFIG.CANVAS_HEIGHT / tile);

    for (let ty = 0; ty < rows; ty++) {
      for (let tx = 0; tx < cols; tx++) {
        ctx.fillStyle = (tx + ty) % 2 === 0 ? CONFIG.GRASS_COLOR_A : CONFIG.GRASS_COLOR_B;
        ctx.fillRect(tx * tile, ty * tile, tile, tile);
      }
    }
  }

  function drawDangerZones() {
    for (const zone of dangerZones) {
      zone.draw(ctx, CONFIG.DANGER_COLOR, CONFIG.DANGER_BORDER_COLOR);
    }
  }

  function drawDangerWarnings() {
    for (const warning of dangerSpawnWarnings) {
      warning.draw(ctx, CONFIG.DANGER_SPAWN_WARNING_COLOR, CONFIG.DANGER_SPAWN_WARNING_BORDER);
    }
  }

  function drawCoins() {
    const half = CONFIG.COIN_SIZE / 2;
    for (const coin of coins) {
      if (coin.collected) continue;
      ctx.fillStyle = CONFIG.COIN_COLOR;
      ctx.fillRect(coin.x - half, coin.y - half, CONFIG.COIN_SIZE, CONFIG.COIN_SIZE);
      ctx.strokeStyle = CONFIG.COIN_BORDER_COLOR;
      ctx.lineWidth = 1;
      ctx.strokeRect(coin.x - half + 0.5, coin.y - half + 0.5, CONFIG.COIN_SIZE - 1, CONFIG.COIN_SIZE - 1);
    }
  }

  function render() {
    drawGrass();
    drawDangerZones();
    drawDangerWarnings();
    drawCoins();
    player.draw(ctx);
  }

  function gameLoop(timestamp) {
    if (lastTimestamp === null) lastTimestamp = timestamp;
    const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.05); // clamp to avoid big jumps
    lastTimestamp = timestamp;

    if (state === 'playing') {
      update(dt);
    }
    render();

    requestAnimationFrame(gameLoop);
  }

  restartButton.addEventListener('click', initGame);

  window.addEventListener('keydown', (e) => {
    if ((state === 'gameover' || state === 'win') && e.key.toLowerCase() === 'r') {
      initGame();
    }
  });

  initGame();
  requestAnimationFrame(gameLoop);
})();
