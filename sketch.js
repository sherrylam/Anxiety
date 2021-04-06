var animation;
var playerSprite;

// adventure manager global  
var adventureManager;

function preload() {
  // loads all the image files
  animation = loadAnimation('assets/character_sprite1.png', 'assets/character_sprite4.png');

  adventureManager = new AdventureManager('data/adventureStates.csv', 'data/interactionTable.csv', 'data/clickableLayout.csv');
}

function setup() {
  createCanvas(1000, 800);
  
  // change how many frames (of draw loop) each animation frame is
  // visible for. bigger #s = slower speed
  animation.frameDelay = 10;

  // create a sprite from a single image
  playerSprite = createSprite(width/2, height/2, 200, 200);
  playerSprite.addAnimation("walk", animation);

  // use this to track movement from toom to room in adventureManager.draw()
  adventureManager.setPlayerSprite(playerSprite);

    // This will load the images, go through state and interation tables, etc
  adventureManager.setup();
}

function draw() { 
  background(220);
  // draws background rooms and handles movement from one to another
  adventureManager.draw();
  
  if( adventureManager.getStateName() !== "Splash") {
      
    // responds to keydowns
    moveSprite();

    // this is a function of p5.js, not of this sketch
    drawSprite(playerSprite);
  } 
}

function keyPressed() {   
  // dispatch to elsewhere
  adventureManager.keyPressed(key); 
}

function mouseReleased() {
  adventureManager.mouseReleased();
}

function moveSprite() {
  if(keyIsDown(RIGHT_ARROW))
    playerSprite.velocity.x = 8;
  else if(keyIsDown(LEFT_ARROW))
    playerSprite.velocity.x = -8;
  else
    playerSprite.velocity.x = 0;

  if(keyIsDown(DOWN_ARROW))
    playerSprite.velocity.y = 8;
  else if(keyIsDown(UP_ARROW))
    playerSprite.velocity.y = -8;
  else
    playerSprite.velocity.y = 0;
}