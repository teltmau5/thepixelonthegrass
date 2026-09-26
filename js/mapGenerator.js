// Responsible for randomly building the (session-fixed) layout of danger
// zones and coins. Called once on page load and again on restart.

function generateDangerZones(cfg) {
  const zones = [];
  const count = randInt(cfg.DANGER_ZONE_COUNT_MIN, cfg.DANGER_ZONE_COUNT_MAX);

  for (let i = 0; i < count; i++) {
    let placed = false;

    for (let attempt = 0; attempt < cfg.DANGER_MAX_ATTEMPTS && !placed; attempt++) {
      const w = randInt(cfg.DANGER_ZONE_MIN_SIZE, cfg.DANGER_ZONE_MAX_SIZE);
      const h = randInt(cfg.DANGER_ZONE_MIN_SIZE, cfg.DANGER_ZONE_MAX_SIZE);
      const x = randInt(cfg.DANGER_EDGE_MARGIN, cfg.CANVAS_WIDTH - w - cfg.DANGER_EDGE_MARGIN);
      const y = randInt(cfg.DANGER_EDGE_MARGIN, cfg.CANVAS_HEIGHT - h - cfg.DANGER_EDGE_MARGIN);
      const candidate = { x, y, w, h };

      const hitsSpawn = circleOverlapsRect(
        cfg.SPAWN_X,
        cfg.SPAWN_Y,
        cfg.SPAWN_SAFE_RADIUS,
        candidate
      );

      if (!hitsSpawn) {
        zones.push(candidate);
        placed = true;
      }
    }
  }

  return zones;
}

function generateCoins(cfg, dangerZones) {
  const coins = [];
  const padding = cfg.COIN_SIZE;

  for (let i = 0; i < cfg.COIN_COUNT; i++) {
    let placed = false;

    for (let attempt = 0; attempt < cfg.COIN_MAX_ATTEMPTS && !placed; attempt++) {
      const x = randInt(padding, cfg.CANVAS_WIDTH - padding);
      const y = randInt(padding, cfg.CANVAS_HEIGHT - padding);

      const insideSpawn = distance(x, y, cfg.SPAWN_X, cfg.SPAWN_Y) < cfg.SPAWN_SAFE_RADIUS;
      if (insideSpawn) continue;

      const insideDanger = dangerZones.some((zone) =>
        distancePointToRect(x, y, zone) < cfg.COIN_SIZE
      );
      if (insideDanger) continue;

      const tooCloseToOtherCoin = coins.some(
        (coin) => distance(x, y, coin.x, coin.y) < cfg.COIN_MIN_DISTANCE
      );
      if (tooCloseToOtherCoin) continue;

      coins.push({ x, y, collected: false });
      placed = true;
    }
  }

  return coins;
}
