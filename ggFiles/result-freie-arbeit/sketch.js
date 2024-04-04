/*jshint esversion: 6 */

/* ############################################################################ 

Kurs «Generative Gestaltung» an der TH Köln
Christian Noss
christian.noss@th-koeln.de
https://twitter.com/cnoss
https://cnoss.github.io/generative-gestaltung/

############################################################################ */

const saveParams = {
  sketchName: "gg-sketch"
}

// Params for canvas
const canvasParams = {
  holder: document.getElementById('canvas'),
  state: false,
  mouseX: false,
  mouseY: false,
  mouseLock: false,
  background: 0,
  gui: true,
  mode: 'canvas', // canvas or svg … SVG mode is experimental 
};
getCanvasHolderSize();

// Params for the drawing
const drawingParams = {
  bgAlpha: 18,
  dotSize: 10,
  dotSizeMin: 10,
  dotSizeStep: 10,
  triangleSize: 30,
  triangleSizeMin: 20,
  triangleSizeMax: 40,
  difficulty: 3,
  difficultyMin: 1,
  difficultyMax: 5,
  playMusic: false,
  volume: 35,
  gameSounds: false,
  gameVolume: 10,
  gameVolumeMax: 20,
};

// Params for logging
const loggingParams = {
  targetDrawingParams: document.getElementById('drawingParams'),
  targetCanvasParams: document.getElementById('canvasParams'),
  state: false
};

let dot;
let dots = [];

let player;
let triangleColor = 260;
let impactColorTimer = 1000;
let gameOver = false;

let layout;
let timeControl;
let gate;

let color1 = 120;
let currentFrameRate = 50;
let speedController = 25 / currentFrameRate;

let dotAmount;
let deletedDots = 0;
let deleting = false;
let connectionDistance;
let hasContactWithLine = false;
let scoreFromDeletedDots = 0;

let speedOfPoints = 1;
let spawnControl = 40;

var song;
var playingMusic = false;
var destructionSound;



/* ###########################################################################
Classes
############################################################################ */

//Selection buttons before game would be nice
function dificultyHandler(difficulty){
  //More ways to adjust dificulty
  //gateSpeed
  //gateOpeningSize
  //gateAmount
  //pointSize
  //connectionSize
  //...

  switch (difficulty){
    case 1:  
      speedOfPoints = 0.7;
      spawnControl = 65;
      break;
    case 2:
      speedOfPoints = 0.85;
      spawnControl = 55;
      break;
    case 3: 
      speedOfPoints = 1;
      spawnControl = 40;
      break;
    case 4:
      speedOfPoints = 1.2;
      spawnControl = 35;
      break;
    case 5:
      speedOfPoints = 1.3;
      spawnControl = 30;
      break;
  }
}

class TimeControl{
  constructor(){
    this.startTime = millis();
    this.timeScore = 0;
    this.color = 0;
    this.dotAmount = 20;
    this.connectionDistance = 0;
    this.distanceChange = 0.2;
  }

  updatePlayedTime(){
    if (!gameOver) {
      this.timeScore = Math.floor((millis() - this.startTime) / 75);
      this.totalScore = timeControl.timeScore + scoreFromDeletedDots;
    }
  }

  updateColor(){
    this.color = map(dotAmount, 4, 25, 120, 0)
    //this.color = map(this.totalScore, 0, 3000, 120, 0)
    color1 = this.color; 
  }

  updateDotBehavior(){
    //More Adjustment
    this.dotAmount = Math.floor(width/170) + Math.floor(this.timeScore / spawnControl) - deletedDots;
    dotAmount = this.dotAmount;

    //this.connectionDistance = map(this.timeScore, 0, 1800, 80, 300);
    // >>>>Macht nur Sinn wenn ich hinkriege das Kreis und linien sich verlässslich treffen
    this.connectionDistance += this.distanceChange;
    if(this.connectionDistance < 0 || this.connectionDistance > 300){
      this.distanceChange *= -1;
    }
    connectionDistance = this.connectionDistance;
  }
}

class Gate{
  constructor(){
    this.gateAmount = 0;
    this.gateSpeed = 3;
    
    this.y2 = [];
    this.openingSizes = [];
    this.getRandomValues();
    this.gateDistance;
    this.x = 0;

    this.drawing = false;
    this.distancesReceived = false;

    this.eventMarks = [];
    this.eventSteps = 1000;
    for (let mark = this.eventSteps; mark < 1000000; mark += this.eventSteps) {
      this.eventMarks.push(mark)
    }
  }

  getRandomValues(){
    for (let i = 0; i < this.gateAmount; i++) {
      this.openingSizes.push(random(2 * drawingParams.triangleSize, 4 * drawingParams.triangleSize  ));
      this.y2.push(random(100, height - 100 - this.openingSizes[i]));
    }
    this.gateDistance = random (200, 300);
    this.distancesReceived = true;
  }

  updateGates(){
    for (let i = 0; i < this.eventMarks.length; i++) {
      if(timeControl.totalScore > this.eventMarks[i] && timeControl.totalScore < this.eventMarks[i] + player.pointsPerDot * 2){
        this.drawing = true;
      }
    }

    if(!this.drawing){
      this.gateAmount = 0;
      this.x = 0;
      this.gateDistanceToGate0 = 0;
      this.openingSizes = [];
      this.gateDistances = [];
      this.y2 = [];
      this.distancesReceived = false;
    }else if(this.drawing){
      this.gateAmount = Math.floor(1 + (timeControl.timeScore + scoreFromDeletedDots) / 1000);
      if(!this.distancesReceived){
        this.getRandomValues();
      }
    }
  }

  drawGates(){
    if(this.drawing){
      stroke(color1, 100, 100, 100)
      this.gateDistanceToGate0 = 0;

      for (let i = 0; i < this.gateAmount; i++) {
        let x = this.x - this.gateDistance * i;
        let y2 = this.y2[i];
        let y3 = y2 + this.openingSizes[i];

        line(x, 0, x, y2)
        line(x, y3, x, height)

        this.playerContactHandler(x, 0, x, y2 - 5);
        this.playerContactHandler(x, y3 + 5, x, height);

        if(i === this.gateAmount - 1 && x > width){
          this.drawing = false;
        }
      }
      this.x += this.gateSpeed;
    }
  }

  playerContactHandler(x1, y1, x2, y2){
    if(playerLineOverlapCalc(x1, y1, x2, y2, 30)){
      gameOver = true;
    }
  }

}

class Dot{

  //Hier wird einmalig angelegt
  constructor(x, y){
    this.x = x;
    this.y = y;
    this.directionX = 1;
    this.directionY = 1;
    this.speedX = random(0, 2.5) * speedController;
    this.speedY = random(0, 2.5)  * speedController;
    this.color = color1
    this.dotAlpha = 100;
    this.deleteDot = false;
    this.deleteTime = 0;
    this.dotDeleting = false;
  }

  //Hier ändern sich sachen live
  drawDot(){
    noStroke();
    fill(color1, 100, 100, this.dotAlpha)
    ellipse(this.x, this.y, drawingParams.dotSize);

    if(this.x > width || this.x < 0)
      this.directionX *= -1;

    if(this.y > height || this.y < 0)
      this.directionY *= -1;  
    // Point Movement !!!
    this.x += 5 * this.directionX * this.speedX * speedOfPoints;
    this.y += 5 * this.directionY * this.speedY * speedOfPoints;
  }

  connectDots(dot2){
    let distance = dist(this.x, this.y, dot2.x, dot2.y)

    stroke(color1, 100, 100, drawingParams.lineAlpha);
    if(distance <= connectionDistance && distance >= 1 && !this.deleteDot && !dot2.deleteDot){
      line(this.x ,this.y, dot2.x, dot2.y);

      if(!gameOver){
         player.checkLineContact(this, dot2);
      }
    }
  
  }

  deleteDotAnimation(dotsToDelete, i){    
    this.dotDeleting = true;
    if(this.dotDeleting = true){
      this.deleteTime++
      dots[dotsToDelete[i]].dotAlpha -= 2;
    }
    if(this.deleteTime > currentFrameRate*2){
      dots.splice(dotsToDelete[i], 1);
      deletedDots++;
      this.deleteTime = 0;
    }
  }
}




/* ###########################################################################
Custom Functions
############################################################################ */

function musicHandler(){
  if(!gameOver){
    if(drawingParams.gameSounds){
      destructionSound.setVolume(drawingParams.gameVolume / 100);
    }else{
      destructionSound.setVolume(0);
    }
  }
 
  
  if(drawingParams.playMusic && !playingMusic){
    song.play();
    song.setLoop(true);
    playingMusic = true;
  }
  if(!drawingParams.playMusic){
    song.stop();
    playingMusic = false;
  }
  if(!gameOver){
    song.setVolume(drawingParams.volume / 100);
  }else{
    song.rate(0.5)
    song.setVolume(drawingParams.volume / 200);
  }
}

function checkDots(){
  const dotsToDelete = [];

  dots.forEach((dot, i) => {
    if (dot.deleteDot) {
      dotsToDelete.push(i);
    }
  });

  for (let i = dotsToDelete.length - 1; i >= 0; i--) {
    dots[dotsToDelete[i]].deleteDotAnimation(dotsToDelete, i);
  }

  if(dots.length < dotAmount){
    for (let i = dots.length; i < dotAmount; i++) {
      //push fügt werte ins array hinzu, immer in den ersten freien Platz
      let minX;
      let maxX;
      if(mouseX < width/2){
        minX = mouseX + width/4;
        maxX = width;
      }else{
        minX = 0;
        maxX = mouseX - width/4;
      }
      
      let minY = mouseY + 300;
      dots.push(new Dot(random(minX, maxX), random(0, height)));
    }
  }
}

class Triangle {

  constructor(){
    this.minX = 100;
    this.maxX = width - 100;
    this.minY = 100;
    this.maxY = height - 100;

    this.pointsPerDot = 50;
  }

  drawTriangle(){
      this.x = constrain(mouseX, this.minX, this.maxX);
      this.y = constrain(mouseY, this.minY, this.maxY);
    //Funktioniert nur unregelmäßig (bei langsamen kontakt?)
    if (hasContactWithLine) {
      impactColorTimer = 0;
      fill(0, 100, 100, 100);
    } else if (impactColorTimer < currentFrameRate / 3) {
      fill(0, 100, 100, 100);
      impactColorTimer++;
    } else {
      fill(triangleColor, 100, 100, 100);
    }
    
    noStroke();
    if(true){
      triangle(this.x - drawingParams.triangleSize / 2, this.y + drawingParams.triangleSize / 2, 
        this.x, this.y - drawingParams.triangleSize / 2, 
        this.x + drawingParams.triangleSize / 2, this.y + drawingParams.triangleSize / 2);
    }
  }


  checkOverlap(dot) {
    let distance = dist(dot.x - drawingParams.dotSize / 2, dot.y - drawingParams.dotSize / 2, this.x, this.y)
    if (distance <= drawingParams.triangleSize) {
      triangleColor = color1;
      gameOver = true;
    }
  }

  //umstellung von x1y1x2y2 zu dot1 dot2 vlt das problem?
  checkLineContact(dot1, dot2){
    let x1 = dot1.x;
    let y1 = dot1.y;
    let x2 = dot2.x;
    let y2 = dot2.y;

    //triangle(mouseX, mouseY, x1, y1, x2, y2)
    if(playerLineOverlapCalc(x1, y1, x2, y2, 5)){
      hasContactWithLine = true;
      if(!deleting){
        destructionSound.play();
        scoreFromDeletedDots += this.pointsPerDot * 2;
        dot1.deleteDot = true;
        dot2.deleteDot = true;
      }
      deleting = true;
    }else{
      hasContactWithLine = false
      deleting = false;}
  }
}

function playerLineOverlapCalc(x1, y1, x2, y2, angleTolerance){

  let lineA = dist(x1, y1, x2, y2);
  let lineB = dist(player.x, player.y, x1, y1);
  let lineC = dist(player.x, player.y, x2, y2);

  let cosAlpha = (lineB * lineB + lineC * lineC - lineA * lineA) / (2 * lineB * lineC);
  let angleRad = Math.acos(cosAlpha);
  //Umrechnung in Grad
  let angleDeg = angleRad * (180 / Math.PI);

  let koefA = y2 - y1;
  let koefB = x1 - x2;
  let koefC = x2 * y1 - x1 * y2;

  let distance = Math.abs(koefA * player.x + koefB * player.y + koefC) / Math.sqrt(koefA * koefA + koefB * koefB);

  if(distance <= drawingParams.triangleSize/2 + 1 && angleDeg >= angleTolerance){
    return true;
  }else{
    return false;
  }
}

class Layout{

  constructor(){
    this.layoutColor2 = [2, 2, 2, 100];
    this.gameOverSize = 200;
    this.timeSize = 32;
    this.timeSizeChanger = 1 * speedController;
  }

  drawLayout(){
    //Rechteck um die Zeit
    fill(color1, 100, 100, 50);
    noStroke();
    rect(width / 2 - 100, 0, 200, 100);

    if(!gameOver){
      // Anzeigen der Zeit seit Beginn in Sekunden im Rechteck
      fill(2, 2, 2, 100);
      textSize(this.timeSize);
      textAlign(CENTER);
      text(`${timeControl.timeScore + scoreFromDeletedDots}`, width / 2, 66);


      // Outline
      stroke(color1, 100, 100, 100)
      noFill();
      rect(100, 100, width - 200, height -200);
    }else{
      // Anzeigen der Zeit seit Beginn in Sekunden im Rechteck
      fill(2, 2, 2, 100);
      textSize(this.timeSize);
      textAlign(CENTER);
      text(`${timeControl.timeScore + scoreFromDeletedDots}`, width / 2, 66);

      this.timeSize += this.timeSizeChanger;
      if(this.timeSize > 40 || this.timeSize < 24){
        this.timeSizeChanger *= -1;
      }

      // Outline
      fill(color1, 100, 100, 50);
      rect(100, 100, width - 200, height -200);
      fill(this.layoutColor2);
      textSize(this.gameOverSize);
      textAlign(CENTER);
      text('GAME OVER', width/2, height/2 + this.gameOverSize * 0.3);
    }
  }
}




/* ###########################################################################
P5 Functions
############################################################################ */

function preload() {
  song = loadSound('RetroArcade.mp3');
  destructionSound = loadSound('destruction3.wav');
}

function setup() {

  let canvas;
  if (canvasParams.mode === 'SVG') {
    canvas = createCanvas(canvasParams.w, canvasParams.h, SVG);
  } else { 
    canvas = createCanvas(canvasParams.w, canvasParams.h);
    canvas.parent("canvas");
  }

  // Display & Render Options
  frameRate(currentFrameRate);
  angleMode(DEGREES);
  smooth();

  // GUI Management
  if (canvasParams.gui) { 
    const sketchGUI = createGui('Params');
    sketchGUI.addObject(drawingParams);
    //noLoop();
  }

  // Anything else
  fill(200);
  stroke(0);
  colorMode(HSB, 360, 100, 100, 100);
  player = new Triangle();
  layout = new Layout;
  timeControl = new TimeControl;
  gate = new Gate;
}



function draw() {

  /* ----------------------------------------------------------------------- */
  // Log globals
  if (!canvasParams.mouseLock) {
    canvasParams.mouseX = mouseX;
    canvasParams.mouseY = mouseY;
    logInfo();
  }

  /* ----------------------------------------------------------------------- */
  // Provide your Code below
  background(2,2,2,drawingParams.bgAlpha);
  layout.drawLayout();
  musicHandler();

  if(!gameOver){
    dificultyHandler(drawingParams.difficulty);
    player.drawTriangle();
    timeControl.updateColor();
    timeControl.updatePlayedTime();
    timeControl.updateDotBehavior();
  }

  gate.drawGates();
  gate.updateGates();

  checkDots();
  dots.forEach((dot, i) => {
    dot.drawDot();
    player.checkOverlap(dot);

    dots.forEach((dot2, i) => {
      dot.connectDots(dot2);
    })
  })
    
}



function keyPressed() {

  if (keyCode === 81) { // Q-Key
  }

  if (keyCode === 87) { // W-Key
  }

  if (keyCode === 89) { // Y-Key
  }

  if (keyCode === 88) { // X-Key
  }

  if (keyCode === 83) { // S-Key
    const suffix = (canvasParams.mode === "canvas") ? '.jpg' : '.svg';
    const fragments = location.href.split(/\//).reverse();
    const suggestion = fragments[1] ? fragments[1] : 'gg-sketch';
    const fn = prompt(`Filename for ${suffix}`, suggestion);
    if (fn !== null) save(fn + suffix);
  }

  if (keyCode === 49) { // 1-Key
  }

  if (keyCode === 50) { // 2-Key
  }

  if (keyCode === 76) { // L-Key
    if (!canvasParams.mouseLock) {
      canvasParams.mouseLock = true;
    } else { 
      canvasParams.mouseLock = false;
    }
    document.getElementById("canvas").classList.toggle("mouseLockActive");
  }


}



function mousePressed() {}



function mouseReleased() {}



function mouseDragged() {}



function keyReleased() {
  if (keyCode == DELETE || keyCode == BACKSPACE) clear();
}





/* ###########################################################################
Service Functions
############################################################################ */



function getCanvasHolderSize() {
  canvasParams.w = canvasParams.holder.clientWidth;
  canvasParams.h = canvasParams.holder.clientHeight;
}



function resizeMyCanvas() {
  getCanvasHolderSize();
  resizeCanvas(canvasParams.w, canvasParams.h);
}



function windowResized() {
  resizeMyCanvas();
}



function logInfo(content) {

  if (loggingParams.targetDrawingParams) {
    loggingParams.targetDrawingParams.innerHTML = helperPrettifyLogs(drawingParams);
  }

  if (loggingParams.targetCanvasParams) {
    loggingParams.targetCanvasParams.innerHTML = helperPrettifyLogs(canvasParams);
  }

}