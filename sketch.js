
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

// NPC talking global variables
var talkedToDog = false;
var talkedToDog2 = false;

var sound;

function preload() {
  // loads all the image files
  animation = loadAnimation('assets/character_sprite1.png', 'assets/character_sprite4.png');
  npcanimation = loadAnimation('assets/npc_sprite1.png', 'assets/npc_sprite4.png');

  soundFormats('mp3');
  sound = loadSound('assets/sounds/alarm');
  sound.playMode('untilDone');

  adventureManager = new AdventureManager('data/adventureStates.csv', 'data/interactionTable.csv', 'data/clickableLayout.csv');
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
  if( adventureManager.getStateName() == "Relief" |
      adventureManager.getStateName() == "Exercise" | 
      adventureManager.getStateName() == "Chamomile" | 
      adventureManager.getStateName() == "Journaling" | 
      adventureManager.getStateName() == "Aromatherapy" | 
      adventureManager.getStateName() == "Yoga" | 
      adventureManager.getStateName() == "Breathing" | 
      adventureManager.getStateName() == "Talk" | 
      adventureManager.getStateName() == "Eat")  {
    background(255);
  }
  else {
    background(220);
  }

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

  if(adventureManager.getStateName() !== "Start"){
    sound.stop();
  }
  playSound();
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

function talk() {
  if (talkedToDog === false) {
    print("turning them on");
    talkedToDog = true;
    print("talked to dog");
    }
  
  if(adventureManager.getStateName() == "Chaos") {
    //turn clickables on
    clickables[1].visible = true;
  }
}

function playSound() {
  if( adventureManager.getStateName() == "Start") {
    sound.play();
  }
  else if(adventureManager.getStateName() !== "Start"){
    sound.stop();
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
  this.color = "#454545";
  this.noTint = false;
  this.tint = "#454545";
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

//-------------- SUBCLASS CODE  ---------------//

class MaskRoom extends PNGRoom {
  preload() { 

      //create masks sprite
      this.masks = createSprite(width/2, height/2+50, 1000, 800);
      this.masks.addAnimation('normal', loadAnimation('assets/backgroundsprite/mask0001.png', 'assets/backgroundsprite/mask0003.png'));
      this.masks.frameDelay = 20;

      this.sound = loadSound('assets/sounds/heavy');
  }

  load() {
    super.load();

    this.sound.play();
  }

  unload() {
    super.unload();
    this.sound.stop();
  }

  draw() {
    super.draw();

    drawSprite(this.masks);
  }
}

class SpeechRoom extends PNGRoom {
  preload() { 
    //create thinking sprite
    // randomly places npcs pf this group all over, nothing happens when interacted
    this.NPCAnimation = loadAnimation('assets/backgroundsprite/thinking01.png', 'assets/backgroundsprite/thinking01.png');

    this.NPCgroup = new Group;

    // change this number for more or less
    this.numNPCs = 30;

    // is an array of sprites, note we keep this array because
    // later I will add movement to all of them
    this.NPCSprites = [];

    // this will place them randomly in the room
    for (let i = 0; i < this.numNPCs; i++) {
      // random x and random y poisiton for each sprite
      let randX = random(200, width - 200);
      let randY = random(200, height - 200);

      // create the sprite
      this.NPCSprites[i] = createSprite(randX, randY, 150, 100);

      // add the animation to it (important to load the animation just one time)
      this.NPCSprites[i].addAnimation('regular', this.NPCAnimation);

      // add to the group
      this.NPCgroup.add(this.NPCSprites[i]);
    }

    this.sound = loadSound('assets/sounds/whoosh');
  }

  load() {
    super.load();

    this.sound.play();
  }

  unload() {
    super.unload();
    this.sound.stop();
  }

  draw() {
    super.draw();
    // draws all the sprites in the group
    this.NPCgroup.draw();

    for( let i = 0; i < this.NPCSprites.length; i++ ) {
      this.NPCSprites[i].velocity.x = random(-1,1);
      this.NPCSprites[i].velocity.y = random(-1,1);
    }
  }
}

class ClockRoom extends PNGRoom {
  preload() { 
    //create thinking sprite
    // randomly places npcs pf this group all over, nothing happens when interacted
    this.NPCAnimation = loadAnimation('assets/backgroundsprite/clock01.png', 'assets/backgroundsprite/clock01.png');

    this.NPCgroup = new Group;

    // change this number for more or less
    this.numNPCs = 10;

    // is an array of sprites, note we keep this array because
    // later I will add movement to all of them
    this.NPCSprites = [];

    // this will place them randomly in the room
    for (let i = 0; i < this.numNPCs; i++) {
      // random x and random y poisiton for each sprite
      let randX = random(200, width - 200);
      let randY = random(200, height - 200);

      // create the sprite
      this.NPCSprites[i] = createSprite(randX, randY, 100, 100);

      // add the animation to it (important to load the animation just one time)
      this.NPCSprites[i].addAnimation('regular', this.NPCAnimation);

      // add to the group
      this.NPCgroup.add(this.NPCSprites[i]);
    }
    for( let i = 0; i < this.NPCSprites.length; i++ ) {
      this.NPCSprites[i].rotationSpeed = random(-10,10);
      this.NPCSprites[i].scale = random(.5, 1.5);
    }
    this.sound = loadSound('assets/sounds/clock');
  }

  load() {
    super.load();
    this.sound.play();
  }

  unload() {
    super.unload();
    this.sound.stop();
  }

  draw() {
    super.draw();
    // draws all the sprites in the group
    this.NPCgroup.draw();
  }
}

class JudgingRoom extends PNGRoom {
  preload() { 

      //create judging sprite
      this.judging = createSprite(width/2-50, height/2+50, 1000, 800);
      this.judging.addAnimation('normal', loadAnimation('assets/backgroundsprite/judging0001.png', 'assets/backgroundsprite/judging0004.png'));
      this.judging.frameDelay = 20;

      this.sound = loadSound('assets/sounds/blink');
      this.sound.setLoop(true);
  }

  load() {
    super.load();
    this.sound.play();
  }

  unload() {
    super.unload();
    this.sound.stop();
  }

  draw() {
    super.draw();
    
    drawSprite(this.judging);
  }
}

class DizzyRoom extends PNGRoom {
  preload() { 
    //create dizzy sprite
    this.dizzy = createSprite(width/2, height/2, 1000, 800);
    this.dizzy.addAnimation('normal', loadAnimation('assets/backgroundsprite/dizzy02.png', 'assets/backgroundsprite/dizzy02.png'));
    this.dizzy.rotationSpeed = random(-10,10);
    
    // randomly places npcs pf this group all over, nothing happens when interacted
    this.NPCAnimation = loadAnimation('assets/backgroundsprite/dizzy01.png', 'assets/backgroundsprite/dizzy01.png');

    this.NPCgroup = new Group;

    // change this number for more or less
    this.numNPCs = 5;

    // is an array of sprites, note we keep this array because
    // later I will add movement to all of them
    this.NPCSprites = [];

    // this will place them randomly in the room
    for (let i = 0; i < this.numNPCs; i++) {
      // random x and random y poisiton for each sprite
      let randX = random(200, width - 200);
      let randY = random(200, height - 200);

      // create the sprite
      this.NPCSprites[i] = createSprite(randX, randY, 100, 100);

      // add the animation to it (important to load the animation just one time)
      this.NPCSprites[i].addAnimation('regular', this.NPCAnimation);

      // add to the group
      this.NPCgroup.add(this.NPCSprites[i]);
    }
    for( let i = 0; i < this.NPCSprites.length; i++ ) {
      this.NPCSprites[i].rotationSpeed = random(-10,10);
      this.NPCSprites[i].scale = random(.5, 2);
    }
    this.sound = loadSound('assets/sounds/dizzy');
  }

  load() {
    super.load();
    this.sound.play();
  }

  unload() {
    super.unload();
    this.sound.stop();
  }

  draw() {
    super.draw();
    drawSprite(this.dizzy);
    // draws all the sprites in the group
    this.NPCgroup.draw();
  }
}

class HeartbeatRoom extends PNGRoom {
  preload() { 

      //create heartbeat sprite
      this.heartbeat = createSprite(width/2, height/2, 1000, 800);
      this.heartbeat.addAnimation('normal', loadAnimation('assets/backgroundsprite/heartbeat0001.png', 'assets/backgroundsprite/heartbeat0004.png'));
      this.heartbeat.frameDelay = 20;

      this.sound = loadSound('assets/sounds/heartbeat');
  }

  load() {
    super.load();
    this.sound.play();
  }

  unload() {
    super.unload();
    this.sound.stop();
  }

  draw() {
    super.draw();
    
    drawSprite(this.heartbeat);
  }
}

class SweatRoom extends PNGRoom {
  preload() { 

      //create sweat sprite
      this.sweat = createSprite(width/2, height/2, 1000, 800);
      this.sweat.addAnimation('normal', loadAnimation('assets/backgroundsprite/sweat0001.png', 'assets/backgroundsprite/sweat0007.png'));
      this.sweat.frameDelay = 20;

      this.sound = loadSound('assets/sounds/drip');
  }

  load() {
    super.load();
    this.sound.play();
  }

  unload() {
    super.unload();
    this.sound.stop();
  }

  draw() {
    super.draw();
    
    drawSprite(this.sweat);
  }
}

class ChaosRoom extends PNGRoom {
  preload() { 
    //talk bubble
    this.talkBubble = null;
    talkedToDog = false;

    //create dog sprite
    this.dog = createSprite(width/2, 463, 100, 100);
    this.dog.addAnimation('wag', npcanimation);

    this.chaos = createSprite(width/2, height/2, 1000, 800);
    this.chaos.addAnimation('normal', loadAnimation('assets/backgroundsprite/chaos0001.png', 'assets/backgroundsprite/chaos0004.png'));

    clickables[1].visible = false;

    this.sound = loadSound('assets/sounds/alarm');
    this.sound2 = loadSound('assets/sounds/heartbeat');
    this.sound3 = loadSound('assets/sounds/clock');
  }

  load() {
    // pass to superclass
    super.load();

    this.talkBubble = loadImage('assets/chaosdialogue.png');

    this.sound.play();
    this.sound2.play();
    this.sound3.play();
  }

  unload() {
    super.unload();
    this.talkBubble = null;
    talkedToDog = false;
    print("unloading AHA room");
    this.sound.stop();
    this.sound2.stop();
    this.sound3.stop();
  }

  draw() {
    super.draw();

    drawSprite(this.chaos);
    drawSprite(this.dog);
    playerSprite.overlap(this.dog, talk);

    if (this.talkBubble !== null && talkedToDog === true) {
      image(this.talkBubble, 250, 100);
    }
  }
}

class ReliefRoom extends PNGRoom {
  preload() { 
    //talk bubble
    this.talkBubble = null;
    talkedToDog = false;

    //create dog sprite
    this.dog = createSprite(width/2, 463, 100, 100);
    this.dog.addAnimation('wag', npcanimation);

  }

  load() {
    // pass to superclass
    super.load();

    this.talkBubble = loadImage('assets/reliefdialogue.png');
    this.talkBubble2 = loadImage('assets/reliefdialogue2.png');
  }

  unload() {
    super.unload();
    this.talkBubble = null;
    this.talkBubble2 = null;
    talkedToDog2 = true;
    print("unloading AHA room");
  }

  draw() {
    super.draw();

    drawSprite(this.dog);
    playerSprite.overlap(this.dog, talk);

    if (talkedToDog2 == true && talkedToDog === true) {
      image(this.talkBubble2, 250, 100);
    }
    else if (this.talkBubble !== null && talkedToDog === true) {
      image(this.talkBubble, 250, 100);
    }
  }
}

class ExerciseRoom extends PNGRoom {
  preload() { 

    //create running sprite
    this.exercise = createSprite(width/2-20, height/2+175, 1000, 800);
    this.exercise.addAnimation('normal', loadAnimation('assets/reliefsprite/exercise0001.png', 'assets/reliefsprite/exercise0006.png'));
    this.exercise.frameDelay = 20;
  }

  load() {
    // pass to superclass
    super.load();

    this.info = loadImage('assets/exerciseinfo.png');
  }

  unload() {
    super.unload();
  }

  draw() {
    super.draw();
    image(this.info, 200, 100);

    drawSprite(this.exercise);
  }
}

class ChamomileRoom extends PNGRoom {
  preload() { 

      //create judging sprite
      this.chamomile = createSprite(width/2+50, height/2+150, 1000, 800);
      this.chamomile.addAnimation('normal', loadAnimation('assets/reliefsprite/chamomile0001.png', 'assets/reliefsprite/chamomile0004.png'));
      this.chamomile.frameDelay = 20;
  }

  load() {
    // pass to superclass
    super.load();

    this.info = loadImage('assets/chamomileinfo.png');
  }

  unload() {
    super.unload();
  }

  draw() {
    super.draw();
    image(this.info, 200, 100);
    
    drawSprite(this.chamomile);
  }
}

class JournalRoom extends PNGRoom {
  preload() { 
  }

  load() {
    // pass to superclass
    super.load();

    this.info = loadImage('assets/journalinginfo.png');
  }

  unload() {
    super.unload();
  }

  draw() {
    super.draw();
    image(this.info, 200, 100);
    ellipse(mouseX, mouseY, 5, 5);
  }
}

class AromaRoom extends PNGRoom {
  preload() { 

      //create judging sprite
      this.aroma = createSprite(width/2-10, height/2+20, 1000, 800);
      this.aroma.addAnimation('normal', loadAnimation('assets/reliefsprite/aromatherapy0001.png', 'assets/reliefsprite/aromatherapy0004.png'));
      this.aroma.frameDelay = 20;
  }

  load() {
    // pass to superclass
    super.load();

    this.info = loadImage('assets/aromatherapyinfo.png');
  }

  unload() {
    super.unload();
  }

  draw() {
    super.draw();
    
    drawSprite(this.aroma);
    image(this.info, 200, 50);
  }
}

class YogaRoom extends PNGRoom {
  preload() { 

      //create judging sprite
      this.yoga = createSprite(width/2, height/2+100, 1000, 800);
      this.yoga.addAnimation('normal', loadAnimation('assets/reliefsprite/yoga0001.png', 'assets/reliefsprite/yoga0006.png'));
      this.yoga.frameDelay = 20;
  }

  load() {
    // pass to superclass
    super.load();

    this.info = loadImage('assets/yogainfo.png');
  }

  unload() {
    super.unload();
  }

  draw() {
    super.draw();
    image(this.info, 200, 50);
    
    drawSprite(this.yoga);
  }
}

class BreathingRoom extends PNGRoom {
  preload() { 

      //create judging sprite
      this.breathing = createSprite(width/2, height/2+150, 1000, 800);
      this.breathing.addAnimation('normal', loadAnimation('assets/reliefsprite/breathing0001.png', 'assets/reliefsprite/breathing0014.png'));
      this.breathing.frameDelay = 20;
  }

  load() {
    // pass to superclass
    super.load();

    this.info = loadImage('assets/breathinginfo.png');
  }

  unload() {
    super.unload();
  }

  draw() {
    super.draw();
    image(this.info, 200, 50);
    
    drawSprite(this.breathing);
  }
}

class TalkRoom extends PNGRoom {
  preload() { 

      //create judging sprite
      this.talk = createSprite(width/2, height/2+150, 1000, 800);
      this.talk.addAnimation('normal', loadAnimation('assets/reliefsprite/talk0001.png', 'assets/reliefsprite/talk0004.png'));
      this.talk.frameDelay = 20;
  }

  load() {
    // pass to superclass
    super.load();

    this.info = loadImage('assets/talkinfo.png');
  }

  unload() {
    super.unload();
  }

  draw() {
    super.draw();
    image(this.info, 200, 100);
    
    drawSprite(this.talk);
  }
}

class EatRoom extends PNGRoom {
  preload() { 

      //create judging sprite
      this.eat = createSprite(width/2, height/2, 1000, 800);
      this.eat.addAnimation('normal', loadAnimation('assets/reliefsprite/eat0001.png', 'assets/reliefsprite/eat0004.png'));
      this.eat.frameDelay = 20;
  }

  load() {
    // pass to superclass
    super.load();

    this.info = loadImage('assets/eatinfo.png');
  }

  unload() {
    super.unload();
  }

  draw() {
    super.draw();
    image(this.info, 200, 100);
    
    drawSprite(this.eat);
  }
}