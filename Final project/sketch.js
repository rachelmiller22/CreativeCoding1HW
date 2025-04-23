let gameState = "start"; // "start", "play", "levelFailed", "gameOver", "gameComplete"
let bgMusic;

function preload() {
  soundFormats('mp3', 'ogg');
  bgMusic = loadSound('assets/music.mp3');
}

function setup() {
  createCanvas(600, 400);
  textAlign(CENTER, CENTER);
  textSize(20);
}

function draw() {
  background(30);

  if (gameState === "start") {
    // draw your title screen
    text("Click to Start", width/2, height/2);
  }
  else if (gameState === "play") {
    // *once* we’re in play, ensure music is running
    if (!bgMusic.isPlaying()) {
      bgMusic.loop();
      bgMusic.setVolume(0.5);
    }
    // draw your actual game (ropes, candy, Nom, etc.)
    runLevel();
  }
  else if (gameState === "levelFailed") {
    // …
  }
  // etc.
}

function mousePressed() {
  if (gameState === "start") {
    // user has clicked “Start” → begin the game
    gameState = "play";
  }
  else if (gameState === "play") {
    // here you do your normal “cut the rope” logic:
    // e.g. detect if they clicked on a rope, drop the candy, etc.
    handleCut();
  }
  // optionally handle clicks in other states…
}


// --- Global Variables ---
let nomPeekXStart; let nomPeekXTarget; let nomPeekProgress = 0; let nomPeekDirection = 1; let nomPeekSpeed = 0.005; let nomPeekHoldTime = 4000; let nomPeekStartTime;
let nomScale = 0.35; // Keep Nom Larger
let nomInitialY;
let blinkInterval = 3000; let lastBlinkTime; let isBlinking = false; let blinkProgress = 0; let blinkSpeed = 0.15;
let antennaAngleLeft = 0; let antennaAngleRight = 0; let antennaAmplitude = 5;
let spaceshipX, spaceshipY; let spaceshipSpeed = 0.5; let spaceshipScale = 0.15;
let venusX, venusY; let venusScale = 0.45; let venusSpeedX = 0.3; let venusArc = 0; let venusArcSpeed = 0.003; let venusArcAmplitude = 70; let venusDone = false; let venusRotation = 0; let venusRotationSpeed = 0.01;
let starfield = []; let numStars = 250; let starMoveSpeed = 0.3; let starBrightnessFlickerSpeed = 0.02;
let backgroundRocks = []; let numRocks = 20; let spaceRockSpeed = 0.7;
let shootingStars = [];
let candyX, candyY; let ropeSegments = []; let segmentLength = 10; let gravity = 0.4; let tension = 0.8; let tearDistance = 35; let cutConnections = []; let nomGameX, nomGameY; let levelData; let currentLevel = 1; let candyIndex = -1; let winDelay = 1500; let hasWonLevel = false; let winTimer = 0; let candyOffScreen = false; let anchorPoints = [];
const NUM_LEVELS = 5;
// Removed: let levelButtons = []; // Replaced by menu system
let hintBulbX, hintBulbY, hintBulbSize = 40;
let showHint = false;
const levelHints = [ "Hint: Cut the rope to drop the candy!", "Hint: Cut the left rope first to make it swing right!", "Hint: Cut the right rope first to make it swing left!", "Hint: A longer rope swings slower. Cut the high rope!", "Hint: Cut both ropes quickly to drop through the gap!" ];
const NOM_PLATFORM_OFFSET_Y = -25;
// Menu Variables
let isMenuOpen = false;
let menuButtonX = 15, menuButtonY = 15, menuButtonW = 70, menuButtonH = 30;
let menuPanelX, menuPanelY, menuPanelW = 180, menuPanelH; // Panel dimensions calculated later
let menuButtons = []; // Buttons inside the panel


// --- Preload Assets ---
function preload() {
    console.log("Preloading assets...");
    try {
        titleImg = loadImage("title.png");
        spaceshipImg = loadImage("spaceship.png");
        nomImg = loadImage("nom.png");
        spaceRockImage = loadImage("spacerock.png");
    } catch (e) { console.error("Error loading images.", e); }
    console.log("Assets preloaded.");
}

// --- Setup Canvas and Initial State ---
function setup() {
    createCanvas(800, 600);
    console.log("Canvas created.");
    hintBulbX = width - hintBulbSize - 15; hintBulbY = 15;
    lastBlinkTime = millis();
    // Calculate Menu Panel position (centered)
    menuPanelH = 60 + (NUM_LEVELS + 1) * 45; // Height based on items
    menuPanelX = width / 2 - menuPanelW / 2;
    menuPanelY = height / 2 - menuPanelH / 2;
    resetGame(true);
    console.log("Initial game reset complete.");
}

// --- Reset Game State ---
function resetGame(isInitialSetup = false) {
    console.log(`Resetting game. Initial Setup: ${isInitialSetup}, Current Level: ${currentLevel}`);
    cutConnections = []; hasWonLevel = false; winTimer = 0; candyOffScreen = false; ropeSegments = []; anchorPoints = []; candyIndex = -1;
    showHint = false;
    isMenuOpen = false; // Close menu on reset

    starfield = []; backgroundRocks = []; shootingStars = [];
    for (let i = 0; i < numStars; i++) { starfield.push({ x: random(width), y: random(height), size: random(1, 3), brightness: random(100, 255), flickerDirection: random([-1, 1]) }); }
    for (let i = 0; i < numRocks; i++) { backgroundRocks.push({ x: random(width), y: random(-100, height + 100), size: random(30, 70), rotation: random(TWO_PI), rotationSpeed: random(-0.015, 0.015) }); }
    for (let i = 0; i < 3; i++) { shootingStars.push(createShootingStar()); }

    if (!isInitialSetup && gameState !== "gameComplete" && gameState !== "gameOver") {
        loadLevelData(currentLevel);
        if (gameState === "gameOver" || gameState === "gameComplete") { console.log("Reset triggered game end state after loadLevelData."); return; }
         console.log(`Level ${currentLevel} data loaded.`);
    } else if (gameState === "gameComplete" || gameState === "gameOver") {
         // Don't load level data if game just ended, wait for start screen transition
    }

     if (isInitialSetup || gameState === "start") {
        console.log("Initializing start screen elements.");
        let sw = (typeof spaceshipImg !== 'undefined') ? spaceshipImg.width : 100; let sh = (typeof spaceshipImg !== 'undefined') ? spaceshipImg.height : 100; spaceshipX = width + sw * spaceshipScale / 2; spaceshipY = height + sh * spaceshipScale / 2;
        let niw = (typeof nomImg !== 'undefined') ? nomImg.width : 200; nomPeekXStart = -niw * nomScale - 40; nomPeekXTarget = 20; nomPeekProgress = 0; nomPeekDirection = 1; nomPeekSpeed = 0.006; nomPeekHoldTime = 4000; nomPeekStartTime = millis(); nomInitialY = height * 0.75;
        venusX = -100; venusY = height * 0.15; venusDone = false; venusArc = 0; venusRotation = 0; lastBlinkTime = millis();
     }
     console.log("Game reset finished.");
}


// --- Load Level Specific Data --- <<<< UPDATED FUNCTION (Incl. Level 5) >>>>
function loadLevelData(level) {
    levelData = {};
    ropeSegments = [];
    anchorPoints = [];
    candyIndex = -1;
    console.log(`Loading data for level ${level}...`);
    segmentLength = 10;

    const calculateNomY = (platformData) => platformData.y - platformData.height / 2 + NOM_PLATFORM_OFFSET_Y;

    switch (level) {
        case 1:
            levelData.platform={x:width*0.5,y:height*0.9,width:150,height:20}; levelData.nomStart={x:levelData.platform.x,y:calculateNomY(levelData.platform)}; levelData.anchors=[{x:width*0.5,y:height*0.15}]; levelData.candyStart={x:width*0.5,y:height*0.4}; levelData.numSegments=10;
            let a1=levelData.anchors[0]; anchorPoints.push({x:a1.x,y:a1.y}); ropeSegments.push({x:a1.x,y:a1.y,px:a1.x,py:a1.y,attached:true,isCut:false}); let s1=a1; let e1=levelData.candyStart; let l1=dist(s1.x,s1.y,e1.x,e1.y); let sl1=l1>0?l1/(levelData.numSegments+1):10; for(let i=1;i<=levelData.numSegments;i++){let r=i/(levelData.numSegments+1); let sx=lerp(s1.x,e1.x,r); let sy=lerp(s1.y,e1.y,r); ropeSegments.push({x:sx,y:sy,px:sx,py:sy,attached:false,isCut:false,segmentLength:sl1});} ropeSegments.push({x:e1.x,y:e1.y,px:e1.x,py:e1.y,attached:false,isCut:false,segmentLength:sl1}); candyIndex=ropeSegments.length-1; segmentLength=sl1;
            break;
        case 2:
            levelData.platform={x:width*0.8,y:height*0.9,width:120,height:20}; levelData.nomStart={x:levelData.platform.x,y:calculateNomY(levelData.platform)}; levelData.anchors=[{x:width*0.25,y:height*0.2},{x:width*0.75,y:height*0.3}]; levelData.candyStart={x:width*0.5,y:height*0.45}; levelData.segmentsA1toCandy=8; levelData.segmentsCandytoA2=8; let tvs2=levelData.segmentsA1toCandy+levelData.segmentsCandytoA2+1;
            let a1_2=levelData.anchors[0]; let a2_2=levelData.anchors[1]; let cs2=levelData.candyStart; anchorPoints.push({x:a1_2.x,y:a1_2.y}); ropeSegments.push({x:a1_2.x,y:a1_2.y,px:a1_2.x,py:a1_2.y,attached:true,isCut:false}); let lA1C2=dist(a1_2.x,a1_2.y,cs2.x,cs2.y); let lCA22=dist(cs2.x,cs2.y,a2_2.x,a2_2.y); let etl2=lA1C2+lCA22; let vsl2=etl2>0?etl2/tvs2:10; for(let i=1;i<=levelData.segmentsA1toCandy;i++){let r=i/(levelData.segmentsA1toCandy+1); let sx=lerp(a1_2.x,cs2.x,r); let sy=lerp(a1_2.y,cs2.y,r); ropeSegments.push({x:sx,y:sy,px:sx,py:sy,attached:false,isCut:false,segmentLength:vsl2});} ropeSegments.push({x:cs2.x,y:cs2.y,px:cs2.x,py:cs2.y,attached:false,isCut:false,segmentLength:vsl2}); candyIndex=ropeSegments.length-1; for(let i=1;i<=levelData.segmentsCandytoA2;i++){let r=i/(levelData.segmentsCandytoA2+1); let sx=lerp(cs2.x,a2_2.x,r); let sy=lerp(cs2.y,a2_2.y,r); ropeSegments.push({x:sx,y:sy,px:sx,py:sy,attached:false,isCut:false,segmentLength:vsl2});} anchorPoints.push({x:a2_2.x,y:a2_2.y}); ropeSegments.push({x:a2_2.x,y:a2_2.y,px:a2_2.x,py:a2_2.y,attached:true,isCut:false}); segmentLength=vsl2;
            break;
        case 3:
            levelData.platform={x:width*0.3,y:height*0.85,width:120,height:20}; levelData.nomStart={x:levelData.platform.x,y:calculateNomY(levelData.platform)}; levelData.anchors=[{x:width*0.3,y:height*0.2},{x:width*0.8,y:height*0.15}]; levelData.candyStart={x:width*0.55,y:height*0.4}; levelData.segmentsA1toCandy=7; levelData.segmentsCandytoA2=9; let tvs3=levelData.segmentsA1toCandy+levelData.segmentsCandytoA2+1;
            let a1_3=levelData.anchors[0]; let a2_3=levelData.anchors[1]; let cs3=levelData.candyStart; anchorPoints.push({x:a1_3.x,y:a1_3.y}); ropeSegments.push({x:a1_3.x,y:a1_3.y,px:a1_3.x,py:a1_3.y,attached:true,isCut:false}); let lA1C3=dist(a1_3.x,a1_3.y,cs3.x,cs3.y); let lCA23=dist(cs3.x,cs3.y,a2_3.x,a2_3.y); let etl3=lA1C3+lCA23; let vsl3=etl3>0?etl3/tvs3:10; for(let i=1;i<=levelData.segmentsA1toCandy;i++){let r=i/(levelData.segmentsA1toCandy+1); let sx=lerp(a1_3.x,cs3.x,r); let sy=lerp(a1_3.y,cs3.y,r); ropeSegments.push({x:sx,y:sy,px:sx,py:sy,attached:false,isCut:false,segmentLength:vsl3});} ropeSegments.push({x:cs3.x,y:cs3.y,px:cs3.x,py:cs3.y,attached:false,isCut:false,segmentLength:vsl3}); candyIndex=ropeSegments.length-1; for(let i=1;i<=levelData.segmentsCandytoA2;i++){let r=i/(levelData.segmentsCandytoA2+1); let sx=lerp(cs3.x,a2_3.x,r); let sy=lerp(cs3.y,a2_3.y,r); ropeSegments.push({x:sx,y:sy,px:sx,py:sy,attached:false,isCut:false,segmentLength:vsl3});} anchorPoints.push({x:a2_3.x,y:a2_3.y}); ropeSegments.push({x:a2_3.x,y:a2_3.y,px:a2_3.x,py:a2_3.y,attached:true,isCut:false}); segmentLength=vsl3;
            break;
        case 4: // Big Swing
            levelData.platform={x:width*0.25,y:height*0.75,width:110,height:20}; levelData.nomStart={x:levelData.platform.x,y:calculateNomY(levelData.platform)}; levelData.anchors=[{x:width*0.15,y:height*0.1},{x:width*0.85,y:height*0.3}]; levelData.candyStart={x:width*0.4,y:height*0.5}; levelData.segmentsA1toCandy=12; levelData.segmentsCandytoA2=12; let tvs4=levelData.segmentsA1toCandy+levelData.segmentsCandytoA2+1;
            let a1_4=levelData.anchors[0]; let a2_4=levelData.anchors[1]; let cs4=levelData.candyStart; anchorPoints.push({x:a1_4.x,y:a1_4.y}); ropeSegments.push({x:a1_4.x,y:a1_4.y,px:a1_4.x,py:a1_4.y,attached:true,isCut:false}); let lA1C4=dist(a1_4.x,a1_4.y,cs4.x,cs4.y); let lCA24=dist(cs4.x,cs4.y,a2_4.x,a2_4.y); let etl4=lA1C4+lCA24; let vsl4=etl4>0?etl4/tvs4:10; for(let i=1;i<=levelData.segmentsA1toCandy;i++){let r=i/(levelData.segmentsA1toCandy+1); let sx=lerp(a1_4.x,cs4.x,r); let sy=lerp(a1_4.y,cs4.y,r); ropeSegments.push({x:sx,y:sy,px:sx,py:sy,attached:false,isCut:false,segmentLength:vsl4});} ropeSegments.push({x:cs4.x,y:cs4.y,px:cs4.x,py:cs4.y,attached:false,isCut:false,segmentLength:vsl4}); candyIndex=ropeSegments.length-1; for(let i=1;i<=levelData.segmentsCandytoA2;i++){let r=i/(levelData.segmentsCandytoA2+1); let sx=lerp(cs4.x,a2_4.x,r); let sy=lerp(cs4.y,a2_4.y,r); ropeSegments.push({x:sx,y:sy,px:sx,py:sy,attached:false,isCut:false,segmentLength:vsl4});} anchorPoints.push({x:a2_4.x,y:a2_4.y}); ropeSegments.push({x:a2_4.x,y:a2_4.y,px:a2_4.x,py:a2_4.y,attached:true,isCut:false}); segmentLength=vsl4;
            break;
         case 5: // V-Shape Drop Through Obstacle
             levelData.platform = { x: width * 0.5, y: height * 0.9, width: 150, height: 20 }; levelData.nomStart = { x: levelData.platform.x, y: calculateNomY(levelData.platform) }; levelData.anchors = [ { x: width * 0.3, y: height * 0.15 }, { x: width * 0.7, y: height * 0.15 } ]; levelData.candyStart = { x: width * 0.5, y: height * 0.3 }; levelData.segmentsA1toCandy = 5; levelData.segmentsCandytoA2 = 5; levelData.obstacle = { x: width * 0.5, y: height * 0.6, width: 130, height: 15 }; let tvs5=levelData.segmentsA1toCandy+levelData.segmentsCandytoA2+1;
             // Rope Init
             let a1_5=levelData.anchors[0]; let a2_5=levelData.anchors[1]; let cs5=levelData.candyStart; anchorPoints.push({x:a1_5.x,y:a1_5.y}); ropeSegments.push({x:a1_5.x,y:a1_5.y,px:a1_5.x,py:a1_5.y,attached:true,isCut:false}); let lA1C5=dist(a1_5.x,a1_5.y,cs5.x,cs5.y); let lCA25=dist(cs5.x,cs5.y,a2_5.x,a2_5.y); let etl5=lA1C5+lCA25; let vsl5=etl5>0?etl5/tvs5:10; for(let i=1;i<=levelData.segmentsA1toCandy;i++){let r=i/(levelData.segmentsA1toCandy+1); let sx=lerp(a1_5.x,cs5.x,r); let sy=lerp(a1_5.y,cs5.y,r); ropeSegments.push({x:sx,y:sy,px:sx,py:sy,attached:false,isCut:false,segmentLength:vsl5});} ropeSegments.push({x:cs5.x,y:cs5.y,px:cs5.x,py:cs5.y,attached:false,isCut:false,segmentLength:vsl5}); candyIndex=ropeSegments.length-1; for(let i=1;i<=levelData.segmentsCandytoA2;i++){let r=i/(levelData.segmentsCandytoA2+1); let sx=lerp(cs5.x,a2_5.x,r); let sy=lerp(cs5.y,a2_5.y,r); ropeSegments.push({x:sx,y:sy,px:sx,py:sy,attached:false,isCut:false,segmentLength:vsl5});} anchorPoints.push({x:a2_5.x,y:a2_5.y}); ropeSegments.push({x:a2_5.x,y:a2_5.y,px:a2_5.x,py:a2_5.y,attached:true,isCut:false}); segmentLength=vsl5;
             break;

        default: // << Set gameComplete state if level > NUM_LEVELS
            console.log("Level " + level + " does not exist. Setting gameState to gameComplete.");
            gameState = "gameComplete";
            return; // Stop processing level data
    }
    // Common init
    if (candyIndex !== -1 && candyIndex < ropeSegments.length) { candyX = ropeSegments[candyIndex].x; candyY = ropeSegments[candyIndex].y; }
    if (levelData.nomStart && gameState !== "gameComplete") { nomGameX = levelData.nomStart.x; nomGameY = levelData.nomStart.y; console.log(`Nom position set to: (${nomGameX.toFixed(2)}, ${nomGameY.toFixed(2)})`); } else if (gameState !== "gameOver" && gameState !== "gameComplete") { console.error("Error: levelData.nomStart is undefined for level", level); nomGameX = width / 2; nomGameY = height * 0.9; }
    hasWonLevel = false; winTimer = 0; cutConnections = []; candyOffScreen = false; console.log("Rope segments created:", ropeSegments.length, "Candy Index:", candyIndex);
}


// --- Main Draw Loop --- <<<< UPDATED FUNCTION >>>>
function draw() {
    background(0);
    // Draw background elements first
    if (gameState !== "start") drawStarfield(false); else drawStarfield(true);
    drawShootingStars();
    drawBackgroundRocks();

    // State-specific drawing
    switch (gameState) {
        case "start":
            drawMovingVenus();
            animateStartScreenSpaceship();
            drawNomPeeking();
            drawStartScreenUI();
            break;
        case "play":
            playGame();
            break;
        case "levelFailed":
            drawPlatform();
            drawObstacle();
            drawRope();
            drawCandy();
            drawPlayNom();
            drawLevelFailedScreen();
            break;
        case "gameComplete": // << Handle new state
            drawGameCompleteScreen();
            break;
        case "gameOver": // Should not be reached
             console.warn("Reached gameOver state unexpectedly. Redirecting to gameComplete.");
             gameState = "gameComplete";
             drawGameCompleteScreen();
            break;
    }

    // --- Draw Persistent UI Elements (Menu Button & Panel) ---
    drawMenuButton(); // Always draw the main menu button
    if (isMenuOpen) {
        drawMenuPanel(); // Draw the panel if open
    }
} // End of draw()


// --- Start Screen Specific Functions ---

// <<<< UPDATED FUNCTION (Removed Level Buttons) >>>>
function drawStartScreenUI() {
    // Title image
    imageMode(CENTER);
    if (typeof titleImg !== 'undefined') image(titleImg, width / 2, height * 0.35, titleImg.width * 0.3, titleImg.height * 0.3); else { fill(255); textSize(40); textAlign(CENTER,CENTER); text("Feed Nom!", width/2, height*0.35); }

    // Instructions / Engage Text
    fill(200);
    textAlign(CENTER, CENTER);
    textFont("monospace");
    textSize(24);
    text("Click 'Menu' (Top-Left) for Level Select\nor Click 'Engage!' to Start", width / 2, height * 0.7); // Updated instructions

    // Engage Button (Pulse)
    textSize(32);
    fill(220);
    let pulse = sin(millis() * 0.005) * 5 + 32;
    textSize(pulse);
    fill(220, 220, 100);
    text("Engage!", width / 2, height * 0.85);
}


// (Keep drawNomPeeking & drawSingleNom - Includes scale increase & image guard)
function drawNomPeeking(){ let nomX=lerp(nomPeekXStart,nomPeekXTarget,nomPeekProgress); push(); translate(nomX,nomInitialY); scale(nomScale); let eyeHeightScale=1; if(isBlinking){let blinkPhase=map(blinkProgress,0,1,0,PI); eyeHeightScale=0.1+0.9*abs(sin(blinkPhase+PI/2)); blinkProgress+=blinkSpeed; if(blinkProgress>=1){isBlinking=false; blinkProgress=0; lastBlinkTime=millis()+random(blinkInterval*0.5,blinkInterval*1.5);}}else if(millis()-lastBlinkTime>blinkInterval){isBlinking=true; blinkProgress=0;} let time=millis()*0.001; antennaAngleLeft=radians(sin(time*TWO_PI*0.8)*antennaAmplitude); antennaAngleRight=radians(sin(time*TWO_PI*1.1+PI/4)*antennaAmplitude*1.2); drawSingleNom(0,0,eyeHeightScale,antennaAngleLeft,antennaAngleRight); pop(); let timeSinceStart=millis()-nomPeekStartTime; if(nomPeekDirection===1){nomPeekProgress+=nomPeekSpeed; if(nomPeekProgress>=1){nomPeekProgress=1; nomPeekDirection=0; nomPeekStartTime=millis();}}else if(nomPeekDirection===0){if(timeSinceStart>=nomPeekHoldTime){nomPeekDirection=-1; nomPeekStartTime=millis();}}else{nomPeekProgress-=nomPeekSpeed*1.5; if(nomPeekProgress<=0){nomPeekProgress=0; nomPeekDirection=1; nomPeekStartTime=millis()+random(500,1500);}}}
function drawSingleNom(x,y,eyeScaleY=1,antennaAngleL=0,antennaAngleR=0){ push(); translate(x,y); imageMode(CENTER); let nomDrawScale=0.15; if(typeof nomImg!=='undefined') image(nomImg,0,0,nomImg.width*nomDrawScale,nomImg.height*nomDrawScale); else { fill(100,100,255); ellipse(0,0,50,50); } let eyeOffsetX=25*nomDrawScale; let eyeOffsetY=-15*nomDrawScale; let eyeSize=10*nomDrawScale; let antennaBaseLX=-35*nomDrawScale; let antennaBaseLY=-30*nomDrawScale; let antennaBaseRX=35*nomDrawScale; let antennaBaseRY=-30*nomDrawScale; let antennaEndX=10*nomDrawScale; let antennaEndY=-15*nomDrawScale; let antennaStrokeWeight=2*nomDrawScale; fill(0); noStroke(); ellipse(-eyeOffsetX,eyeOffsetY,eyeSize,eyeSize*max(0.1,eyeScaleY)); ellipse(eyeOffsetX,eyeOffsetY,eyeSize,eyeSize*max(0.1,eyeScaleY)); stroke(100); strokeWeight(max(1,antennaStrokeWeight)); noFill(); push(); translate(antennaBaseLX,antennaBaseLY); rotate(antennaAngleL); line(0,0,-antennaEndX,antennaEndY); pop(); push(); translate(antennaBaseRX,antennaBaseRY); rotate(antennaAngleR); line(0,0,antennaEndX,antennaEndY); pop(); pop();}

// --- Background Element Drawing Functions ---

// (Keep drawMovingVenus - includes scale increase)
function drawMovingVenus() { push(); let currentY = venusY + sin(venusArc) * venusArcAmplitude; translate(venusX, currentY); rotate(venusRotation); scale(venusScale); drawVenus(); pop(); venusX += venusSpeedX; venusArc += venusArcSpeed; venusRotation += venusRotationSpeed; let venusDrawRadius = 40 * venusScale; if (venusX > width + venusDrawRadius * 2 + 20) { venusX = -venusDrawRadius * 2 - 20; venusY = random(height * 0.1, height * 0.4); venusArc = random(TWO_PI); venusDone = false; } }
// (Keep other background functions: drawStarfield, drawShootingStars, createShootingStar, drawBackgroundRocks, animateStartScreenSpaceship, drawVenus)
function drawStarfield(startScreen = false) { for (let star of starfield) { if (startScreen) { star.brightness += starBrightnessFlickerSpeed * star.flickerDirection * 10; star.brightness = constrain(star.brightness, 50, 255); if (star.brightness >= 255 || star.brightness <= 50) star.flickerDirection *= -1; star.x -= starMoveSpeed * 0.5; if (star.x < -star.size) star.x = random(width, width * 1.2); } else { star.x -= starMoveSpeed; if (star.x < -star.size) star.x = random(width, width * 1.2); } fill(star.brightness); noStroke(); ellipse(star.x, star.y, star.size, star.size); } }
function drawShootingStars() { for (let i = shootingStars.length - 1; i >= 0; i--) { let s = shootingStars[i]; stroke(255, s.brightness); strokeWeight(s.size); line(s.x, s.y, s.x - s.length, s.y - s.length * s.slope); s.x += s.speedX; s.y += s.speedY; s.brightness *= 0.96; s.length = max(0, s.length * 0.98); let margin = 100; if (s.brightness < 5 || s.x < -margin || s.x > width + margin || s.y < -margin || s.y > height + margin) { shootingStars.splice(i, 1); } } if (shootingStars.length < 4 && random() < 0.02) { shootingStars.push(createShootingStar()); } }
function createShootingStar() { let edge = floor(random(4)); let x, y, speedX, speedY; let baseSpeed = random(4, 8); let angleVariation = PI / 6; if (edge === 0) { x = random(width); y = -20; let angle = random(PI / 2 - angleVariation, PI / 2 + angleVariation); speedX = cos(angle) * baseSpeed; speedY = sin(angle) * baseSpeed; } else if (edge === 1) { x = width + 20; y = random(height); let angle = random(PI - angleVariation, PI + angleVariation); speedX = cos(angle) * baseSpeed; speedY = sin(angle) * baseSpeed; } else if (edge === 2) { x = random(width); y = height + 20; let angle = random(-PI / 2 - angleVariation, -PI / 2 + angleVariation); speedX = cos(angle) * baseSpeed; speedY = sin(angle) * baseSpeed; } else { x = -20; y = random(height); let angle = random(-angleVariation, angleVariation); speedX = cos(angle) * baseSpeed; speedY = sin(angle) * baseSpeed; } return { x: x, y: y, length: random(15, 40), slope: speedY / (speedX || 0.001), speedX: speedX, speedY: speedY, brightness: random(200, 255), size: random(1, 2.5) }; }
function drawBackgroundRocks() { for (let rock of backgroundRocks) { push(); translate(rock.x, rock.y); rotate(rock.rotation); imageMode(CENTER); if(typeof spaceRockImage!=='undefined') image(spaceRockImage, 0, 0, rock.size, rock.size); else {fill(80);ellipse(0,0,rock.size,rock.size);} pop(); rock.rotation += rock.rotationSpeed; let speedMultiplier = map(rock.size, 30, 70, 0.8, 1.2); rock.x -= spaceRockSpeed * speedMultiplier; if (rock.x < -rock.size / 2) { rock.x = width + rock.size / 2 + random(50); rock.y = random(-100, height + 100); } } }
function animateStartScreenSpaceship() { if(typeof spaceshipImg === 'undefined') return; push(); translate(spaceshipX, spaceshipY); rotate(radians(-45)); imageMode(CENTER); image(spaceshipImg, 0, 0, spaceshipImg.width * spaceshipScale, spaceshipImg.height * spaceshipScale); if (frameCount % 4 < 2) { fill(255, random(150, 255), 0, random(150, 200)); noStroke(); let exhaustOffset = spaceshipImg.height * spaceshipScale * 0.6; let exhaustWidth = spaceshipImg.width * spaceshipScale * 0.2; let exhaustLength = random(30, 50) * spaceshipScale * 5; triangle(-exhaustWidth / 2, exhaustOffset, exhaustWidth / 2, exhaustOffset, 0, exhaustOffset + exhaustLength); } pop(); let speedFactor = width / 800; spaceshipX -= spaceshipSpeed * speedFactor; spaceshipY -= spaceshipSpeed * (height / width) * speedFactor; let offScreenMargin = max(spaceshipImg.width, spaceshipImg.height) * spaceshipScale; if (spaceshipX < -offScreenMargin && spaceshipY < -offScreenMargin) { spaceshipX = width + offScreenMargin / 2; spaceshipY = height + offScreenMargin / 2; } }
function drawVenus() { noStroke(); let radius = 40; let detailLevel = 300; colorMode(HSB, 360, 100, 100, 100); let baseHue = random(25, 45); for (let i = 0; i < detailLevel; i++) { let angle = random(TWO_PI); let distance = radius * pow(random(), 0.7); let x = cos(angle) * distance; let y = sin(angle) * distance; let noiseCoordX = (x * 0.08 + cos(venusRotation * 2)) * 0.5; let noiseCoordY = (y * 0.08 + sin(venusRotation * 2)) * 0.5; let noiseTime = millis() * 0.00005; let noiseValue = noise(noiseCoordX + noiseTime, noiseCoordY + noiseTime); let h = baseHue + map(noiseValue, 0.3, 0.7, -10, 10); let s = 70 + map(distance, 0, radius, 20, -10) + map(noiseValue, 0.2, 0.8, -15, 15); let b = 80 + map(distance, 0, radius, -30, 10) + map(noiseValue, 0.4, 0.6, -20, 20); let alpha = map(distance, 0, radius, 90, 40); fill(h % 360, constrain(s, 50, 100), constrain(b, 40, 100), constrain(alpha, 30, 90)); let ellipseSize = map(distance, 0, radius, 6, 2) + random(-1, 1); ellipse(x, y, ellipseSize, ellipseSize); } colorMode(RGB, 255); }


// --- Gameplay State Functions ---

// <<<< UPDATED FUNCTION (Draw Hint Bulb & Hint Text) >>>>
function playGame() {
    // Draw game elements
    drawPlatform();
    drawObstacle(); // Draw obstacle if defined
    drawRope();
    drawCandy();
    drawPlayNom();
    drawHintBulb(); // Draw the hint bulb

    // Update physics and check win/fail conditions
    if (!hasWonLevel && !candyOffScreen) {
        updateRope();
        // Debug: Visualize Win Zone (Optional)
        // if (gameState === "play" && !hasWonLevel && typeof nomGameX !== 'undefined') { let nomTargetY = nomGameY - 10; let currentWinDistance = 45; noFill(); stroke(0, 255, 0, 100); strokeWeight(1); ellipse(nomGameX, nomTargetY, currentWinDistance * 2, currentWinDistance * 2); noStroke(); }
    } else if (hasWonLevel) {
        // Candy sticks to Nom & Level Cleared message/logic
        if (candyIndex !== -1 && candyIndex < ropeSegments.length) { let candySeg = ropeSegments[candyIndex]; candySeg.x = lerp(candySeg.x, nomGameX, 0.15); candySeg.y = lerp(candySeg.y, nomGameY - 20, 0.15); candySeg.px = candySeg.x; candySeg.py = candySeg.y; }
        fill(50, 255, 50); textSize(40); textAlign(CENTER, CENTER); textFont("monospace"); text("Yum!", width / 2, height / 2 - 30); text(`Level ${currentLevel} Cleared!`, width / 2, height / 2 + 10);
        if (millis() - winTimer > winDelay) { currentLevel++; gameState = "play"; resetGame(); }
    }

    // --- Draw Hint Text ---
    if (showHint) {
        let hintText = (currentLevel -1 >= 0 && currentLevel -1 < levelHints.length) ? levelHints[currentLevel - 1] : "No hint available.";
        let padding = 15; let hintBoxY = hintBulbY + hintBulbSize + 5; let textLeadingVal = 18;
        textSize(14); textFont("monospace"); textLeading(textLeadingVal);
        let hintBoxWidth = textWidth(hintText) + padding * 2; if (hintBoxWidth > width * 0.8) hintBoxWidth = width * 0.8; // Limit width
        let numLines = ceil(textWidth(hintText) / (hintBoxWidth - padding*2)); if (numLines === 0) numLines = 1;
        let hintBoxHeight = numLines * textLeadingVal + padding*2 + 5; if(hintBoxHeight < 50) hintBoxHeight = 50;
        let hintBoxX = width - hintBoxWidth - 10; if (hintBoxX < 10) hintBoxX = 10;

        rectMode(CORNER); fill(0, 0, 0, 200); stroke(200, 200, 0); strokeWeight(1); rect(hintBoxX, hintBoxY, hintBoxWidth, hintBoxHeight, 5);
        noStroke(); fill(255, 255, 200); textAlign(CENTER, TOP);
        text(hintText, hintBoxX + padding, hintBoxY + padding, hintBoxWidth - padding * 2);
    }
} // End of playGame

// --- updateRope Function (Keep existing function from v15) ---
function updateRope() { if (ropeSegments.length === 0 || hasWonLevel || candyOffScreen || candyIndex === -1) return; for (let i = 0; i < ropeSegments.length; i++) { const segment = ropeSegments[i]; let isSegmentFalling = !segment.attached; if (isSegmentFalling) { let vx = segment.x - segment.px; let vy = segment.y - segment.py; segment.px = segment.x; segment.py = segment.y; let damping = 0.99; segment.x += vx * damping; segment.y += vy * damping; segment.y += gravity; if (i === candyIndex) { if (segment.y > height + 100) { console.log("Candy off screen - Level Failed!"); candyOffScreen = true; gameState = "levelFailed"; return; } if (levelData && levelData.platform) { let plat = levelData.platform; let candyRadius = 15; if (segment.x > plat.x - plat.width / 2 && segment.x < plat.x + plat.width / 2 && segment.y + candyRadius > plat.y - plat.height / 2 && segment.y < plat.y + plat.height/2 && vy > 0) { segment.y = plat.y - plat.height / 2 - candyRadius; segment.py = segment.y; } } if (levelData && levelData.obstacle) { let obs = levelData.obstacle; let candyRadius = 15; if (segment.x + candyRadius > obs.x - obs.width / 2 && segment.x - candyRadius < obs.x + obs.width / 2 && segment.y + candyRadius > obs.y - obs.height / 2 && segment.y - candyRadius < obs.y + obs.height / 2 && vy > 0) { segment.y = obs.y - obs.height / 2 - candyRadius; segment.py = segment.y; } } } } else { segment.px = segment.x; segment.py = segment.y; } } let iterations = 15; for (let iter = 0; iter < iterations; iter++) { for (let i = 0; i < ropeSegments.length - 1; i++) { const start = ropeSegments[i]; const end = ropeSegments[i + 1]; let currentSegmentLength = start.segmentLength || segmentLength; if (!cutConnections.includes(i)) { let dx = end.x - start.x; let dy = end.y - start.y; let distance = sqrt(dx * dx + dy * dy); if (distance < 0.001) distance = 0.001; let difference = distance - currentSegmentLength; let percent = difference / distance / 2; let offsetX = dx * percent * tension; let offsetY = dy * percent * tension; let startIsMobile = !start.attached; let endIsMobile = !end.attached; if (startIsMobile && endIsMobile) { start.x += offsetX; start.y += offsetY; end.x -= offsetX; end.y -= offsetY; } else if (startIsMobile && !endIsMobile) { start.x += offsetX * 2; start.y += offsetY * 2; } else if (!startIsMobile && endIsMobile) { end.x -= offsetX * 2; end.y -= offsetY * 2; } } } } if (candyIndex !== -1 && candyIndex < ropeSegments.length) { candyX = ropeSegments[candyIndex].x; candyY = ropeSegments[candyIndex].y; } else { candyX = undefined; candyY = undefined; return; } if (!hasWonLevel && !candyOffScreen && typeof candyX !== 'undefined') { let nomTargetY = nomGameY - 10; let currentWinDistance = 45; let maxWinSpeedSq = 225; if (candyIndex < ropeSegments.length) { let candySegment = ropeSegments[candyIndex]; let currentDist = dist(candyX, candyY, nomGameX, nomTargetY); let candySpeedSq = distSq(candySegment.x, candySegment.y, candySegment.px, candySegment.py); if (currentDist < currentWinDistance + 20) { /* console.log(`Debug Win Check: Dist: ${currentDist.toFixed(2)} (Req: <${currentWinDistance}), SpeedSq: ${candySpeedSq.toFixed(2)} (Req: <${maxWinSpeedSq})`); */ } if (currentDist < currentWinDistance && candySpeedSq < maxWinSpeedSq) { console.log(`Win condition met!`); hasWonLevel = true; winTimer = millis(); } } } }


// --- Drawing Functions for Game Elements ---

function drawPlatform(){if(levelData&&levelData.platform){fill(100,100,120); noStroke(); rectMode(CENTER); fill(80,80,100); rect(levelData.platform.x,levelData.platform.y+3,levelData.platform.width,levelData.platform.height); fill(120,120,140); rect(levelData.platform.x,levelData.platform.y,levelData.platform.width,levelData.platform.height);}}
function drawObstacle() { if (levelData && levelData.obstacle) { let obs = levelData.obstacle; fill(100, 100, 100, 220); noStroke(); rectMode(CENTER); rect(obs.x, obs.y, obs.width, obs.height); } } // Added back
function drawRope(){if(ropeSegments.length<2)return; stroke(160,82,45,220); strokeWeight(4); noFill(); for(let i=0;i<ropeSegments.length-1;i++){const start=ropeSegments[i]; const end=ropeSegments[i+1]; if(!cutConnections.includes(i)){line(start.x,start.y,end.x,end.y);}} fill(100,60,20); noStroke(); if(anchorPoints&&anchorPoints.length>0){for(const anchor of anchorPoints){ellipse(anchor.x,anchor.y,15,15);}}}
function drawCandy(){if(ropeSegments.length===0||hasWonLevel||candyIndex===-1||candyIndex>=ropeSegments.length)return; let candySeg=ropeSegments[candyIndex]; let currentCandyX=candySeg.x; let currentCandyY=candySeg.y; fill(220,50,50); noStroke(); push(); translate(currentCandyX,currentCandyY); ellipse(0,0,30,30); stroke(255,150,150,200); strokeWeight(3); noFill(); arc(0,0,20,20,radians(frameCount*2),radians(frameCount*2+180)); arc(0,0,25,25,radians(-frameCount*1.5+90),radians(-frameCount*1.5+270)); pop();}
function drawPlayNom(){if(!levelData||!levelData.nomStart||typeof nomGameX==='undefined')return; push(); let bounce=sin(millis()*0.005)*2; translate(nomGameX,nomGameY+bounce); drawSingleNom(0,0,1,0,0); pop();}

// <<<< NEW FUNCTION >>>>
function drawHintBulb() {
    push();
    translate(hintBulbX, hintBulbY);
    // Base (metallic color)
    fill(180, 180, 190); noStroke(); rectMode(CORNER);
    rect(hintBulbSize * 0.3, hintBulbSize * 0.65, hintBulbSize * 0.4, hintBulbSize * 0.25, 2);
    // Bulb Glass
    fill(255, 255, 180, 200); stroke(220, 220, 150); strokeWeight(1);
    ellipseMode(CENTER); ellipse(hintBulbSize / 2, hintBulbSize * 0.4, hintBulbSize * 0.65, hintBulbSize * 0.7);
    // Filament (simple)
    stroke(80); strokeWeight(1.5);
    line(hintBulbSize/2 - 4, hintBulbSize*0.65, hintBulbSize/2 - 4, hintBulbSize * 0.3);
    line(hintBulbSize/2 + 4, hintBulbSize*0.65, hintBulbSize/2 + 4, hintBulbSize * 0.3);
    pop();
}

// <<<< NEW FUNCTION >>>>
function drawMenuButton() {
    push();
    rectMode(CORNER);
    stroke(200); strokeWeight(1); fill(50, 50, 80, 180);
    rect(menuButtonX, menuButtonY, menuButtonW, menuButtonH, 3);
    noStroke(); fill(220); textSize(16); textAlign(CENTER, CENTER); textFont('monospace');
    text("Menu", menuButtonX + menuButtonW / 2, menuButtonY + menuButtonH / 2);
    pop();
}

// <<<< NEW FUNCTION >>>>
function drawMenuPanel() {
    push();
    rectMode(CORNER);
    // Panel Background
    fill(20, 20, 40, 230); // Dark blueish, mostly opaque
    stroke(150); strokeWeight(1);
    rect(menuPanelX, menuPanelY, menuPanelW, menuPanelH, 5);

    // Title
    fill(200); noStroke(); textSize(20); textAlign(CENTER, TOP); textFont('monospace');
    text("MENU", menuPanelX + menuPanelW / 2, menuPanelY + 15);

    // Buttons
    menuButtons = []; // Clear old button bounds
    let btnW = menuPanelW - 40;
    let btnH = 35;
    let btnX = menuPanelX + 20;
    let btnY = menuPanelY + 55; // Start below title

    // Main Menu Button
    menuButtons.push({ x: btnX, y: btnY, w: btnW, h: btnH, action: 'start' });
    fill(80, 50, 50, 200); stroke(180); strokeWeight(1); rect(btnX, btnY, btnW, btnH, 3);
    fill(220); noStroke(); textSize(16); textAlign(CENTER, CENTER);
    text("Main Menu", btnX + btnW / 2, btnY + btnH / 2);
    btnY += btnH + 10; // Move down for next button

    // Level Buttons
    for (let i = 1; i <= NUM_LEVELS; i++) {
        menuButtons.push({ x: btnX, y: btnY, w: btnW, h: btnH, action: 'level', level: i });
        fill(50, 50, 80, 200); stroke(150); rect(btnX, btnY, btnW, btnH, 3);
        fill(200); noStroke();
        text("Level " + i, btnX + btnW / 2, btnY + btnH / 2);
        btnY += btnH + 10; // Move down
    }
    pop();
}


// --- Input Handling --- <<<< UPDATED FUNCTION >>>>
function mousePressed() {
    console.log(`Mouse Pressed at (${mouseX}, ${mouseY}), gameState: ${gameState}`);

    // --- Menu Click Handling (Overrides other states if open) ---
    // Check Menu Button Toggle FIRST
    if (mouseX > menuButtonX && mouseX < menuButtonX + menuButtonW &&
        mouseY > menuButtonY && mouseY < menuButtonY + menuButtonH) {
        isMenuOpen = !isMenuOpen;
        console.log("Menu Toggled:", isMenuOpen);
        return; // Consume click, do nothing else
    }

    // If Menu IS open, check clicks inside panel
    if (isMenuOpen) {
        let clickedInPanel = false;
        for (let btn of menuButtons) {
            if (mouseX > btn.x && mouseX < btn.x + btn.w && mouseY > btn.y && mouseY < btn.y + btn.h) {
                console.log("Menu Action:", btn.action, "Level:", btn.level);
                if (btn.action === 'start') {
                    gameState = "start";
                    currentLevel = 1; // Reset level if going to main menu
                    resetGame(true);
                } else if (btn.action === 'level') {
                    currentLevel = btn.level;
                    gameState = "play";
                    resetGame();
                }
                isMenuOpen = false; // Close menu after action
                clickedInPanel = true;
                break;
            }
        }
        // If clicked outside the panel while open, just close it
        if (!clickedInPanel) {
             isMenuOpen = false;
             console.log("Clicked outside menu, closing.");
        }
        return; // Consume click
    }
    // --- End Menu Click Handling ---


    // --- Regular Game State Click Handling (only if menu is closed) ---
    switch (gameState) {
        case "start":
            // Check Engage Button Click Area (Approximate)
            let engageYThreshold = height * 0.55 + 40 + 50;
             if (mouseY > engageYThreshold ) { // Clicked somewhat low on screen
                 console.log("Engage area clicked");
                 currentLevel = 1;
                 gameState = "play";
                 resetGame();
            }
            // Removed level button checks here - handled by menu
            break;

        case "play":
            // Check hint bulb click first
            if (mouseX > hintBulbX && mouseX < hintBulbX + hintBulbSize &&
                mouseY > hintBulbY && mouseY < hintBulbY + hintBulbSize) {
                 showHint = !showHint; // Toggle hint display
                 console.log("Hint Toggled:", showHint);
            }
            // If not clicking bulb and hint is showing, hide hint
            else if (showHint) {
                 showHint = false;
                 console.log("Hint Hidden");
            }
            // If not hint related, process as a rope cut attempt
            else if (!hasWonLevel && !candyOffScreen) {
                let indexToCut = findCutSegment(mouseX, mouseY); // findCutSegment checks cutConnections now
                if (indexToCut !== -1) {
                     console.log(`Adding cut at connection index: ${indexToCut}`);
                     cutConnections.push(indexToCut);
                }
            }
            break;

        case "levelFailed":
             console.log(`Retrying level ${currentLevel}`);
             gameState = "play";
             resetGame();
             break;

        case "gameComplete":
             console.log("Returning to start screen from game complete.");
             gameState = "start";
             currentLevel = 1;
             resetGame(true);
             break;

        case "gameOver": // Should not be reached
            console.log("Restarting game from game over (redirecting to start).");
            gameState = "start"; currentLevel = 1; resetGame(true);
            break;
    }
}


// --- findCutSegment Function --- (Keep existing cleaned-up version) ---
function findCutSegment(x, y) { let closestSegmentIndex=-1; let minDistSq=tearDistance*tearDistance; for (let i=0; i<ropeSegments.length - 1; i++) { if (cutConnections.includes(i)) { continue; } const start=ropeSegments[i]; const end=ropeSegments[i+1]; const dSq=distSqToSegment(x, y, start.x, start.y, end.x, end.y); if (dSq < minDistSq) { minDistSq=dSq; closestSegmentIndex=i; } } return closestSegmentIndex; }
function distSqToSegment(x, y, x1, y1, x2, y2) { const l2=distSq(x1, y1, x2, y2); if (l2 === 0) return distSq(x, y, x1, y1); let t=((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)) / l2; t=max(0, min(1, t)); const projX=x1+t*(x2-x1); const projY=y1+t*(y2-y1); return distSq(x,y,projX,projY); }
function distSq(x1, y1, x2, y2) { const dx=x1-x2; const dy=y1-y2; return dx*dx+dy*dy; }


// --- Game Over / Level Failed / Game Complete Screens ---

function drawLevelFailedScreen() { fill(0,0,0,180); rectMode(CORNER); rect(0,0,width,height); fill(255,80,80); textSize(50); textAlign(CENTER,CENTER); textFont("monospace"); text("Level Failed!",width/2,height/2-40); textSize(28); fill(200); text("Nom didn't get the candy.",width/2,height/2+10); textSize(26); if(frameCount%50<25){ fill(220,220,100); text("Click to Retry",width/2,height*0.7); } }
function drawGameOverScreen() { background(20,0,0); fill(255,50,50); textSize(56); textAlign(CENTER,CENTER); textFont("monospace"); text("Game Over!",width/2,height/2-40); textSize(28); fill(200); text("Nom is still hungry...",width/2,height/2+20); textSize(24); if(frameCount%60<30){ fill(220,220,100); text("Click to Restart",width/2,height*0.7); } }

// <<<< NEW FUNCTION >>>>
function drawGameCompleteScreen() {
    background(0, 20, 50); // Dark blue background
    drawStarfield(false); // Keep stars moving

    fill(80, 255, 80); // Green text
    textSize(56);
    textAlign(CENTER, CENTER);
    textFont("monospace");
    text("Good Job!", width / 2, height * 0.4); // Adjusted Y

    textSize(32);
    fill(200); // White text
    text("Nom is Full!", width / 2, height * 0.5); // Adjusted Y

    textSize(24);
     // Make text pulse
     let alpha = map(sin(millis() * 0.003), -1, 1, 150, 255);
     fill(220, 220, 150, alpha); // Pulsing yellowish
     text("Click to Play Again", width / 2, height * 0.7); // Adjusted Y
}


// --- Window Resize Handling --- <<<< UPDATED FUNCTION >>>>
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    console.log(`Window resized to ${windowWidth}x${windowHeight}. Resetting game.`);
    // Recalculate UI positions based on new size
    hintBulbX = width - hintBulbSize - 15;
    hintBulbY = 15;
    menuPanelX = width / 2 - menuPanelW / 2;
    menuPanelY = height / 2 - menuPanelH / 2;
    // Reset game state appropriate to current state
    if(gameState === "play" || gameState === "levelFailed") {
         resetGame(); // Reset current level
    } else {
         resetGame(true); // Go back to start screen state
    }
}