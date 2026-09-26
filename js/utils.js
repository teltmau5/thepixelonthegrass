// Small collection of generic helper functions used across the game.

function randRange(min, max) {
  return Math.random() * (max - min) + min;
}

function randInt(min, max) {
  return Math.floor(randRange(min, max + 1));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

// Axis-aligned bounding box overlap test. Rects are {x, y, w, h}.
function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

// Distance from a point to the closest point on a rectangle's edge/interior.
function distancePointToRect(px, py, rect) {
  const closestX = clamp(px, rect.x, rect.x + rect.w);
  const closestY = clamp(py, rect.y, rect.y + rect.h);
  return distance(px, py, closestX, closestY);
}

// True if a circle (cx, cy, radius) overlaps a rectangle.
function circleOverlapsRect(cx, cy, radius, rect) {
  return distancePointToRect(cx, cy, rect) < radius;
}
