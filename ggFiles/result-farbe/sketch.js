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
  mode: 'canvas', // canvas or svg … SVG mode is experimental
};
getCanvasHolderSize();

// Params for the drawing
const drawingParams = {
  fgAlpha: 100,
  fgAlphaMAx: 100,
  bgAlpha: 0,
  bgAlphaMax: 10,

  //Möglich einen start boolean in drawing params einzubauen
  //dann machen die anderen params als Voreinstellung Sinn
  /*################################
  //nicht noch random einbauen?
  angleMultFrom: 0.001,
  angleMultFromStep: 0.001,
  angleMultFromMin: 0.001,
  angleMultFromMax: 0.1,
  angleMultTo: 0.05,
  angleMultToStep: 0.01,
  angleMultToMin: 0.001,
  angleMultToMax: 0.1,
  circleSize: 2000,
  circleSizeStep: 50,
  circleSizeMax: 5000,
  colorRandomFrom: 255,
  colorRandomFromMax: 255,
  colorRandomTo: 255,
  colorRandomToMax: 255,
  //In draw verlagerbar?
  noiseDetail: 1,
  noiseDetailStep: 0.05,
  noiseDetailMin: 0.05,
  noiceDetailMax: 20,
  ###############################*/

};

// Params for logging
const loggingParams = {
  targetDrawingParams: document.getElementById('drawingParams'),
  targetCanvasParams: document.getElementById('canvasParams'),
  state: false
};





/* ###########################################################################
Classes
############################################################################ */





/* ###########################################################################
Custom Functions
############################################################################ */





/* ###########################################################################
P5 Functions
############################################################################ */

var points = [];
var pointColors = [];
var density;
var angleMult;
var angleMultMax = 0.0125;
var angleMultMin = 0.0005;
var lineSize;
var minLineSize = 0.9;
var minDensity = 85;
var maxDensity = 210;
var sizeChangeMode = 0;
var darkener = 1;
var modeSelector;

var r1
var r2 
var g1
var g2
var b1
var b2

let timeControl;
let formTriggerTime = 5;
let formSelector;
let rectangleHeight = 10000;
let rectangleWidth = 10000;
let circleSize = 10000;
let squareSize = 10000;
let smallCircleSize = 10000;

class TimeControl{

  constructor(){
    this.startTime = millis();
    this.formTriggerTime = constrain(random(-6, 12), 0, 12);
    this.rectangleHeight = height/5;
    this.rectangleWidth = width/7;
    this.circleSize = random(height/4, height * 0.8);
    this.squareSize = random(height/4, height * 0.8);
    this.smallCircleSize = random(100, width/11);
  }

  timeSinceStart(){
    let timeSinceStartInSec = (millis()- this.startTime) / 1000;
    return timeSinceStartInSec;
  }

  updateSizes(){
    rectangleHeight = this.rectangleHeight;
    rectangleWidth = this.rectangleWidth;
    circleSize = this.circleSize;
    squareSize = this.squareSize;
    smallCircleSize = this.smallCircleSize;
  }
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
  frameRate(25);
  angleMode(DEGREES);
  smooth();

  // GUI Management
  if (canvasParams.gui) { 
    const sketchGUI = createGui('Params');
    sketchGUI.addObject(drawingParams);
    //noLoop();
  }

  // Anything else
  background(0);
  fill(255);
  stroke(0);
  colorMode(HSB, 360, 100, 100, 100);
  colorMode(RGB, 255, 255, 255, 100);
  noiseDetail(1)
  timeControl = new TimeControl;

  formSelector = Math.floor(random(0, 6));
  var modeSelector = Math.floor(Math.random() * 10);
  //modeSelector = 3;   //For Testing
  
  //  GROWING MODE
  if (modeSelector == 0 || modeSelector == 3 || modeSelector == 9){
    console.log('was los');
    sizeChangeMode = 0.000001; 
    maxDensity = 160; 
    minDensity = 55;
    lineSize = 1;
  }
  //  SHRINKING MODE
  if (modeSelector == 1 || modeSelector == 2){
    sizeChangeMode = - 0.000015; 
    maxDensity = 80; 
    minDensity = 40;
    lineSize = 15;
    darkener = 2;
    formSelector = 6;
    angleMultMin = 0.008;
  }
  //  WIDE CURVES MODE
  if (modeSelector > 6){
    angleMultMax = 0.0025;
  }


  density = random(minDensity, maxDensity);
  var space = width / density;

  for (var x = 0; x < width; x += space){
    for (var y = 0; y < height; y += space){
      var p = createVector(x + random(-10, 10), y + random (-10, 10));
      points.push(p);
    }
  }
  var colorDiffMax = random(0,15)
  for (var x = 0; x < points.length; x++){
    if(modeSelector == 1 || 2){
      colorDiff = random(-25, 25)
    }else{colorDiff = random(-colorDiffMax, colorDiffMax)}
    pointColors.push(colorDiff);
  }


  var minRGBValue = 10;
  var maxRGBValue = 255;
  r1 = random(minRGBValue, 255) / darkener;
  r2 = random(maxRGBValue) / darkener;
  g1 = random(minRGBValue, 255) / darkener;
  g2 = random(maxRGBValue) / darkener;
  b1 = random(minRGBValue, 255) / darkener;
  b2 = random(maxRGBValue) / darkener;

  
  var maxLineSize;
  if (density < 100) {
    maxLineSize = 4;
  } else if (density < 175) {
    maxLineSize = 3;
  } else {
    maxLineSize = 2;
  }

  if (modeSelector > 3) {
    lineSize = random(1, maxLineSize);
  }

  angleMult = random(angleMultMin, angleMultMax);

  //Console Logs
  console.log('Density' + density);
  console.log('angleMult' + angleMult);
  console.log('Mode Selector: ' + modeSelector);
  console.log('Form Selector: ' + formSelector);
  console.log("Line Size Change:" + sizeChangeMode);
  console.log('max color diff: ' + colorDiffMax);
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
  background(0,0,0,drawingParams.bgAlpha);
  noStroke();
  if(timeControl.timeSinceStart() > timeControl.formTriggerTime){
      timeControl.updateSizes();
      let furtherBehavior = random(0,3);
    if(timeControl.timeSinceStart() > timeControl.formTriggerTime + 10 && angleMult < 0.003 && furtherBehavior > 0){
      rectangleHeight *= 3;
    }
    if(timeControl.timeSinceStart() > timeControl.formTriggerTime + 15 && angleMult < 0.003 && furtherBehavior > 1){
      for (let i = 0; i < points.length; i++) {
        points[i].DELETE;
      }
    }
    
  }

  for (let i = 0; i < points.length; i++) {

    var r = map(points[i].x, 0, width, r1, r2)
    var g = map(points[i].y, 0, height, g1, g2)
    var b = map(points[i].x, 0, width, b1, b2)
    var alpha = map(dist(width / 2, height / 2, points[i].x, points[i].y,), 0, drawingParams.circleSize, 400, 0)

    fill(r + pointColors[i], g + pointColors[i], b + pointColors[i], drawingParams.fgAlpha);

    var angle = map(noise(points[i].x * angleMult, points[i].y * angleMult), 0, 1, 0, 720)

    points[i].add(createVector(cos(angle), sin(angle)))

    //0 und zu große werte ausschließen?
    if(lineSize > minLineSize){
      lineSize = lineSize + sizeChangeMode
    }else if(lineSize > 20){
      lineSize = 20;
    }else if(lineSize = minLineSize && modeSelector == 1){
      points[i].DELETE;
    }

    switch (formSelector){
      case 0:
        if (dist(width / 2, height / 2, points[i].x, points[i].y) < circleSize/2 - lineSize){
        ellipse(points[i].x, points[i].y, lineSize);
        }
        break;
      case 1:
        if (
          points[i].y > height/2 - rectangleHeight/2 + lineSize * 0.75 &&
          points[i].y < height/2 + rectangleHeight/2 - lineSize * 0.75
        ) {
            ellipse(points[i].x, points[i].y, lineSize);
        }
        break;
      case 2:
        if (
          points[i].x > width/14 * 3 - rectangleWidth/2 + lineSize * 0.75 &&
          points[i].x < width/14 * 3 + rectangleWidth/2 - lineSize * 0.75 ||
          points[i].x > width/2 - rectangleWidth/2 + lineSize * 0.75 &&
          points[i].x < width/2 + rectangleWidth/2 - lineSize * 0.75 ||
          points[i].x > width/14 * 11 - rectangleWidth/2 + lineSize * 0.75 &&
          points[i].x < width/14 * 11 + rectangleWidth/2 - lineSize * 0.75
        ) {
            ellipse(points[i].x, points[i].y, lineSize);
        }
        break;
      case 3:
        if(
          points[i].x > width/2 - squareSize/2 + lineSize * 0.75 &&
          points[i].x < width/2 + squareSize/2 - lineSize * 0.75 &&
          points[i].y > height/2 - squareSize/2 + lineSize * 0.75 &&
          points[i].y < height/2 + squareSize/2 - lineSize * 0.75
        ){
          ellipse(points[i].x, points[i].y, lineSize);
        }
        break;
      case 4: 
      if(
        dist(width / 2 - smallCircleSize * 5, height / 2, points[i].x, points[i].y) < smallCircleSize/2 - lineSize * 0.75 ||
        dist(width / 2 - smallCircleSize * 3, height / 2, points[i].x, points[i].y) < smallCircleSize * 0.75 - lineSize * 0.75 ||
        dist(width / 2, height / 2, points[i].x, points[i].y) < smallCircleSize - lineSize * 0.75 ||
        dist(width / 2 + smallCircleSize * 3, height / 2, points[i].x, points[i].y) < smallCircleSize * 0.75 - lineSize * 0.75 ||
        dist(width / 2 + smallCircleSize * 5, height / 2, points[i].x, points[i].y) < smallCircleSize/2 - lineSize  * 0.75
      ){
        ellipse(points[i].x, points[i].y, lineSize);
      }
      break;
      default:
        ellipse(points[i].x, points[i].y, lineSize);
        break;
      }
  }
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

