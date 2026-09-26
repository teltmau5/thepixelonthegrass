// Global game configuration / tuning values.
const CONFIG = {
  CANVAS_WIDTH: 240,
  CANVAS_HEIGHT: 160,

  // Grass background
  TILE_SIZE: 8,
  GRASS_COLOR_A: '#3fa34d',
  GRASS_COLOR_B: '#379246',

  // Player
  PLAYER_SIZE: 6,
  PLAYER_SPEED: 70, // pixels per second (internal resolution)
  PLAYER_COLOR: '#8a8a8a',

  // Spawn
  SPAWN_X: 120,
  SPAWN_Y: 80,
  SPAWN_SAFE_RADIUS: 24,

  // Danger zones
  DANGER_COLOR: '#c0392b',
  DANGER_BORDER_COLOR: '#7a1f16',
  DANGER_ZONE_COUNT_MIN: 5,
  DANGER_ZONE_COUNT_MAX: 8,
  DANGER_ZONE_MIN_SIZE: 14,
  DANGER_ZONE_MAX_SIZE: 38,
  DANGER_EDGE_MARGIN: 4,
  DANGER_MAX_ATTEMPTS: 200,
  
  // Danger zone movement
  DANGER_MOVE_SPEED: 60, // pixels per second (slowed down for playability)
  DANGER_SPAWN_INTERVAL: 15, // seconds between spawning new zones
  DANGER_SPAWN_WARNING_TIME: 2, // seconds to show warning before spawn
  DANGER_SPAWN_WARNING_COLOR: '#f39c12',
  DANGER_SPAWN_WARNING_BORDER: '#d68910',

  // Coins
  COIN_COLOR: '#ffd700',
  COIN_BORDER_COLOR: '#a8790a',
  COIN_SIZE: 6,
  COIN_COUNT: 5,
  COIN_MIN_DISTANCE: 24,
  COIN_MAX_ATTEMPTS: 300,
};
