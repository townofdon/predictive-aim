// https://editor.p5js.org/townofdon/sketches/SKwR4wEsD

// PREDICTIVE AIM USING MATHS
// INSTRUCTIONS
// - LEFT CLICK TO SHOOT PROJECTILE - ENEMY WILL TRY TO INTERCEPT
// - RIGHT CLICK TO CHANGE START POSITION

const enemy = { x: 200, y: 390, r: 20 };
const player = { x: 200, y: 200, r: 20 };

const projectiles = [];

const PROJECTILE_RADIUS = 10;
const PROJECTILE_SPEED_PLAYER = 150;
const PROJECTILE_SPEED_ENEMY = 200;

class Projectile {
  constructor(px, py, vx, vy, color) {
    this.enabled = true;
    this.position = createVector(px, py);
    this.velocity = createVector(vx, vy);
    this.color = color;
  }

  draw() {
    if (!this.enabled) return;
    fill(this.color);
    circle(this.position.x, this.position.y, PROJECTILE_RADIUS);
  }

  move(deltaTime) {
    if (!this.enabled) return;
    this.position.set(
      this.position.x + this.velocity.x * deltaTime,
      this.position.y + this.velocity.y * deltaTime
    );
    if (this.isOutsideBounds()) {
      this.disable();
    }
  }

  disable() {
    this.enabled = false;
  }

  isOutsideBounds() {
    if (this.position.x + PROJECTILE_RADIUS < 0) return true;
    if (this.position.x - PROJECTILE_RADIUS > 400) return true;
    if (this.position.y + PROJECTILE_RADIUS < 0) return true;
    if (this.position.y - PROJECTILE_RADIUS > 400) return true;
    return false;
  }
}

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(50);

  projectiles.forEach(projectile => {
    projectile.move(deltaTime * 0.001);
  });
  
  projectiles.filter(p => p.enabled).forEach(projectile => {
    const didHitOther = other => (
      other &&
      other.enabled &&
      other.color !== projectile.color &&
      p5.Vector.dist(projectile.position, other.position) < 5
    );
    const match = projectiles.find(didHitOther);
    if (match) {
      match.disable();
      projectile.disable();
    }
  })

  projectiles.forEach(projectile => {
    projectile.draw();
  });

  drawEnemy();
  drawPlayer();
}

function mousePressed(event) {
  const isSecondary = event.button > 0;
  if (isSecondary) {
    movePlayerToMouse();
  } else {
    firePlayerProjectileFromMouse();
  }
}

function firePlayerProjectileFromMouse() {
  const x = mouseX;
  const y = mouseY;
  const playerPosition = createVector(player.x, player.y);
  const mousePosition = createVector(x, y);
  const heading = mousePosition.copy().sub(playerPosition).normalize();
  const velocity = heading.copy().mult(PROJECTILE_SPEED_PLAYER);
  const projectile = new Projectile(player.x, player.y, velocity.x, velocity.y, 200);
  projectiles.push(projectile);

  const predict = getPredictVector(projectile);
  if (predict) {
    const enemyProjectile = new Projectile(enemy.x, enemy.y, predict.x, predict.y, "red");
    projectiles.push(enemyProjectile);
  }
}

function movePlayerToMouse() {
  player.x = mouseX;
  player.y = mouseY;
}

function drawEnemy() {
  fill("red");
  circle(enemy.x, enemy.y, enemy.r);
}

function drawPlayer() {
  fill("green");
  circle(player.x, player.y, player.r);
}

// Construct a triangle with three points, A, B, C, where
// A => target position
// B => turret position
// C => intercept position
function getPredictVector(projectile) {
  const enemyPosition = createVector(enemy.x, enemy.y);
  const vectorToProjectile = enemyPosition.copy().sub(projectile.position);
  // angle at point A
  const angle = projectile.velocity.angleBetween(vectorToProjectile);
  const alpha = angle < 0 ? TWO_PI + angle : angle;
  // distance from point A to B
  const dC = vectorToProjectile.mag();
  // speed of target
  const sA = PROJECTILE_SPEED_PLAYER;
  // speed of turret projectile
  const sB = PROJECTILE_SPEED_ENEMY;
  // ratio of speeds
  const r = sA / sB;
  // collect quadratic terms
  const a = (1 - (r * r)) || 0.0000000001; // avoid divide by zero
  const b = 2 * dC * r * Math.cos(alpha);
  const c = -dC * dC;
  const [numSolutions, root1, root2] = solveQuadratic(a, b, c);

  if (numSolutions <= 0) {
    return null;
  }

  // get the shortest positive root
  const root = (root1 > 0 && root2 > 0) ? Math.min(root1, root2) : Math.max(root1, root2);

  // distance from point B to C
  const dA = root;
  // solve for time
  const t = dA / sB;
  // intercept point
  const point = projectile.position.copy().add(
    projectile.velocity.copy().mult(t)
  );
  const bToC = point.copy().sub(enemyPosition);
  return bToC.normalize().mult(PROJECTILE_SPEED_ENEMY);
}

function solveQuadratic(a, b, c) {
  const discriminant = (b * b) - (4 * a * c);
  if (discriminant < 0 || a === 0) {
    return [0, 0, 0];
  }
  const numSolutions = discriminant === 0 ? 1 : 2;
  const root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
  const root2 = (-b - Math.sqrt(discriminant)) / (2 * a);
  
  if (root1 < 0 && root2 < 0) {
    return [0, 0, 0];
  }

  return [numSolutions, root1, root2];
}
