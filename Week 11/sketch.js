let player;
let obstacles = [];
let exit;
let playerSpeed = 4;

function setup() {
  createCanvas(600, 400);

  // Player setup
  player = {
    x: 50,
    y: 50,
    size: 30
  };

  // Add 8 moving star obstacles
  for (let i = 0; i < 8; i++) {
    obstacles.push({
      x: random(width),
      y: random(height),
      size: random(20, 40),
      color: randomColor(),
      speedX: random(-2, 2),
      speedY: random(-2, 2),
      moving: true
    });
  }

  // Exit setup
  exit = {
    x: width - 60,
    y: height - 40,
    w: 50,
    h: 30
  };
}

function draw() {
  background(220);

  // Game objective
  fill(0);
  textSize(16);
  textAlign(CENTER, TOP);
  text("Objective: Use arrow keys reach the box. Avoid the stars. Click to place a frown face!", width / 2, 10);

  // Draw exit
  fill(0, 255, 0);
  rect(exit.x, exit.y, exit.w, exit.h);

  // husky!
  drawPlayer(player.x, player.y, player.size);

  // Move player
  if (keyIsDown(LEFT_ARROW)) player.x -= playerSpeed;
  else if (keyIsDown(RIGHT_ARROW)) player.x += playerSpeed;
  if (keyIsDown(UP_ARROW)) player.y -= playerSpeed;
  else if (keyIsDown(DOWN_ARROW)) player.y += playerSpeed;

  
  if (player.x > width) player.x = 0;
  if (player.x < 0) player.x = width;
  if (player.y > height) player.y = 0;
  if (player.y < 0) player.y = height;

  // Draw and update obstacles
  for (let obs of obstacles) {
    fill(obs.color);

    if (obs.moving) {
      drawStar(obs.x, obs.y, obs.size, obs.size / 2, 5);
      obs.x += obs.speedX;
      obs.y += obs.speedY;

      // Wrap around screen
      if (obs.x > width) obs.x = 0;
      if (obs.x < 0) obs.x = width;
      if (obs.y > height) obs.y = 0;
      if (obs.y < 0) obs.y = height;
    } else {
      textSize(obs.size);
      textAlign(CENTER, CENTER);
      text("😦", obs.x, obs.y);
    }
  }

  // Win condition
  if (
    player.x > exit.x &&
    player.x < exit.x + exit.w &&
    player.y > exit.y &&
    player.y < exit.y + exit.h
  ) {
    textSize(32);
    fill(0);
    textAlign(CENTER, CENTER);
    text("You Win!", width / 2, height / 2);
    noLoop();
  }

  //
  fill(0);
  textAlign(LEFT, BOTTOM);
  if (player.x < 0 || player.x > width || player.y < 0 || player.y > height) {
    fill(255, 0, 0);
    text("Go back!", 10, height - 10);
  } else if (player.x < 100 && player.y < 100) {
    text("You're in the top-left corner!", 10, height - 10);
  } else {
    text("Great job!", 10, height - 10);
  }
}

// Add frown face on click
function mousePressed() {
  obstacles.push({
    x: mouseX,
    y: mouseY,
    size: random(20, 40),
    color: randomColor(),
    speedX: 0,
    speedY: 0,
    moving: false
  });
}

//  husky character
function drawPlayer(x, y, size) {
  let earSize = size * 0.3;
  let eyeSize = size * 0.15;

  // Ears
  fill(100); // dark grey
  triangle(x - size * 0.4, y - size * 0.5, x - size * 0.2, y - size * 0.8, x - size * 0.05, y - size * 0.5);
  triangle(x + size * 0.4, y - size * 0.5, x + size * 0.2, y - size * 0.8, x + size * 0.05, y - size * 0.5);

  // Face
  fill(200); // light grey
  ellipse(x, y, size, size); // outer head
  fill(255); // inner white mask
  ellipse(x, y + size * 0.1, size * 0.7, size * 0.6);

  // Eyes
  fill(0); // outline
  ellipse(x - size * 0.2, y - size * 0.1, eyeSize);
  ellipse(x + size * 0.2, y - size * 0.1, eyeSize);
  fill(0, 255, 0); // green pupils
  ellipse(x - size * 0.2, y - size * 0.1, eyeSize * 0.5);
  ellipse(x + size * 0.2, y - size * 0.1, eyeSize * 0.5);

  // Nose
  fill(0);
  triangle(x - size * 0.05, y + size * 0.1, x + size * 0.05, y + size * 0.1, x, y + size * 0.2);

  // Mouth
  noFill();
  stroke(0);
  strokeWeight(2);
  arc(x, y + size * 0.25, size * 0.3, size * 0.2, 0, PI);
  noStroke();
}

//  Star  function
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

// Colors for stars and frown faces
function randomColor() {
  let colors = [
    color(255, 165, 0), // orange
    color(255, 0, 0),   // red
    color(128, 128, 128) // gray
  ];
  return random(colors);
}
