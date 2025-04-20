//
let player;
let stars = [];
let mouseStars = [];
let trail = [];

// 
function setup() {
  createCanvas(600, 400);
  createPlayer();
  createObstacles(); // Reduced number of obstacles (stars)
}

//
function draw() {
  background(20);
  drawBorders();
  drawExit();
  displayInstructions(); // Display directions
  movePlayer();
  drawTrail();
  drawPlayer();
  drawMouseStars();
  moveObstacles();
  drawObstacles();
  checkWin();
}

//
function createPlayer() {
  player = {
    x: 50,
    y: height / 2,
    size: 30,
    speed: 3
  };
}

function drawPlayer() {
  push();
  translate(player.x, player.y);

  // 
  fill(200); // light gray body
  ellipse(0, 30, 40, 50); 
  fill(255);
  ellipse(0, 40, 25, 30); 

  //
  noFill();
  stroke(200);
  strokeWeight(6);
  arc(-20, 40, 30, 40, PI / 2, PI); 
  noStroke();

  // 
  fill(200);
  ellipse(-10, 55, 10, 15); // left leg
  ellipse(10, 55, 10, 15);  // right leg

  // 
  fill(150); // grey head
  ellipse(0, -5, player.size * 1.6); 

  // 
  fill(0);
  triangle(-10, -20, -5, -35, 0, -15); // left ear
  triangle(10, -20, 5, -35, 0, -15);   // right ear

  //
  fill(0, 255, 0);
  ellipse(-5, -10, 5);
  ellipse(5, -10, 5);

  //
  fill(0, 255, 0);
  triangle(-3, 2, 0, -2, 3, 2);

  // 
  noFill();
  stroke(0, 255, 0);
  strokeWeight(1.5);
  arc(0, 5, 12, 8, 0, PI);
  noStroke();

  pop();
}

function movePlayer() {
  if (keyIsDown(LEFT_ARROW)) player.x -= player.speed;
  if (keyIsDown(RIGHT_ARROW)) player.x += player.speed;
  if (keyIsDown(UP_ARROW)) player.y -= player.speed;
  if (keyIsDown(DOWN_ARROW)) player.y += player.speed;

  // Save trail
  trail.push({ x: player.x, y: player.y, color: color(random(255), random(255), random(255)) });
  if (trail.length > 50) trail.shift();
}

function drawTrail() {
  for (let i = 0; i < trail.length; i++) {
    fill(trail[i].color);
    noStroke();
    ellipse(trail[i].x, trail[i].y, 6);
  }
}

// 
function mousePressed() {
  mouseStars.push({ x: mouseX, y: mouseY });
}

function drawMouseStars() {
  for (let s of mouseStars) {
    drawStar(s.x, s.y, 5, 15, 5);
  }
}

// 
function createObstacles() {
  for (let i = 0; i < 10; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      size: random(10, 30),
      color: color(random(255), random(255), random(255)),
      dx: random(-2, 2),  
      dy: random(-2, 2)   
    });
  }
}

function moveObstacles() {
  for (let s of stars) {
    s.x += s.dx;
    s.y += s.dy;

    if (s.x > width) s.x = 0;
    if (s.x < 0) s.x = width;
    if (s.y > height) s.y = 0;
    if (s.y < 0) s.y = height;
  }
}

function drawObstacles() {
  for (let s of stars) {
    push();
    fill(s.color);
    stroke(255);
    strokeWeight(1);
    drawStar(s.x, s.y, s.size / 2 + random(0.5), s.size + random(0.5), 5); // sparkle effect
    pop();
  }
}

//
function drawStar(x, y, radius1, radius2, npoints) {
  let angle = TWO_PI / npoints;
  let halfAngle = angle / 2.0;
  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius2;
    let sy = y + sin(a) * radius2;
    vertex(sx, sy);
    sx = x + cos(a + halfAngle) * radius1;
    sy = y + sin(a + halfAngle) * radius1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

// ==== BORDERS & EXIT ====
function drawBorders() {
  stroke(255, 0, 0); 
  strokeWeight(5); 
  noFill();
  rect(0, 0, width, height);
}

function drawExit() {
  fill(0, 255, 0);
  rect(width - 50, height / 2 - 30, 40, 60);
}

function checkWin() {
  if (
    player.x > width - 50 &&
    player.y > height / 2 - 30 &&
    player.y < height / 2 + 30
  ) {
    textSize(40);
    fill(255, 255, 0);
    textAlign(CENTER);
    text("You Win!", width / 2, height / 2);
    // noLoop(); 
  }
}

//
function displayInstructions() {
  fill(255);
  textSize(20);
  textAlign(LEFT);
  text("Use Arrow Keys to Move", 20, 30);
  text("Click to Create Stars", 20, 60);
  text("Reach the Green Box to Win", 20, 90);
}
