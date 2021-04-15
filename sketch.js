
// sprites
var animation;
var playerSprite;
var npcanimation;
var npcSprite;

// adventure manager global  
var adventureManager;

// clickables
var clickablesManager;
var clickables; 

// indexes into the clickable array (constants)
const playGameIndex = 0;  

function preload() {
  // loads all the image files
  animation = loadAnimation('assets/character_sprite1.png', 'assets/character_sprite4.png')
  npcanimation = loadAnimation('assets/npc_sprite1.png', 'assets/npc_sprite4.png')

  adventureManager = new AdventureManager('data/adventureStates.csv', 'data/interactionTable.csv');
  clickablesManager = new ClickableManager('data/clickableLayout.csv');
}

function setup() {
  createCanvas(1000, 800);

  // setup the clickables = this will allocate the array
  clickables = clickablesManager.setup();
  
  // change how many frames (of draw loop) each animation frame is
  // visible for. bigger #s = slower speed
  animation.frameDelay = 10;

  //npc sprite
  npcSprite = createSprite(width/2, height/2, 100,100);
  npcSprite.addAnimation("wag", npcanimation);

  // create a sprite from a single image
  playerSprite = createSprite(width/2, height/2, 200, 200);
  playerSprite.addAnimation("walk", animation);

  // use this to track movement from toom to room in adventureManager.draw()
  adventureManager.setPlayerSprite(playerSprite);

  // based on the state name in the clickableLayout
  adventureManager.setClickableManager(clickablesManager);

    // This will load the images, go through state and interation tables, etc
  adventureManager.setup();

  // call OUR function to setup additional information about the p5.clickables
  // that are not in the array 
  setupClickables();
}

function draw() { 
  background(220);
  // draws background rooms and handles movement from one to another
  adventureManager.draw();

  // draw the p5.clickables, in front of the mazes but behind the sprites 
  clickablesManager.draw();
  
  if( adventureManager.getStateName() !== "Splash" &&
      adventureManager.getStateName() !== "Instructions") {
      
    // responds to keydowns
    moveSprite();

    // this is a function of p5.js, not of this sketch
    drawSprite(playerSprite);
  } 

  if( adventureManager.getStateName() == "Chaos" |
      adventureManager.getStateName() == "ChaosTalk" |
      adventureManager.getStateName() == "Relief") {
    drawSprite(npcSprite);
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
  //right
  if(keyIsDown(68)) {
    playerSprite.animation.play();
    playerSprite.velocity.x = 8;
    playerSprite.mirrorX(1);
  }
  //left
  else if(keyIsDown(65)) {
    playerSprite.animation.play();
    playerSprite.velocity.x = -8;
    playerSprite.mirrorX(-1);
  }
  else {
    playerSprite.velocity.x = 0;
    playerSprite.animation.stop();
  }
  //down
  if(keyIsDown(83)) {
    playerSprite.animation.play();
    playerSprite.velocity.y = 8;
  }
  //up
  else if(keyIsDown(87)) {
    playerSprite.animation.play();
    playerSprite.velocity.y = -8;
  }
  else {
    playerSprite.velocity.y = 0;
  }
}

//-------------- CLICKABLE CODE  ---------------//

function setupClickables() {
  // All clickables to have same effects
  for( let i = 0; i < clickables.length; i++ ) {
    clickables[i].onHover = clickableButtonHover;
    clickables[i].onOutside = clickableButtonOnOutside;
    clickables[i].onPress = clickableButtonPressed; 
  }
}

// tint when mouse is over
clickableButtonHover = function () {
  this.color = "#F7F7F7";
  this.noTint = false;
  this.tint = "#F7F7F7";
}

// color a light gray if off
clickableButtonOnOutside = function () {
  // backto our gray color
  this.color = "#F7F7F7";
}

clickableButtonPressed = function() {
  // these clickables are ones that change your state
  // so they route to the adventure manager to do this
  adventureManager.clickablePressed(this.name); 
}
