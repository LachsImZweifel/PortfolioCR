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
  //Dots
  amountOfDots: 16,
  amountOfDotsStep: 4,
  dotSize: 20,
  dotSizeMax: 20,
  //Formation Control
  radius: 200,
  radiusMin: -100,
  radiusMax: 300,
  formationDistancing: 100,
  formationDistancingMax: 280,
  formationDistancingMin: - 100,
  //Rotation
  rotationSpeed: 1,
  rotationSpeedMax: 5,
  rotationSpeedMin: -5,
  rotationSpeedstep: 0.2,
  //Pulsation
  pulsationSpeed: 1.8,
  pulsationSpeedMax: 10,
  pulsationSpeedStep: 0.2,
  pulsationDistanceIn: 100,
  pulsationDistanceInMax: 300,
  pulsationDistanceOut: 0,
  pulsationDistanceOutMax: 300,
  //For and Background
  fgAlpha: 30,
  bgAlpha: 0,
  bgAlphaMax: 25,
  //Inner circle color
  innerCircleColorModeOnOff: 0,
  innerCircleColorModeOnOffMax: 100,
  innerCircleColorModeOnOffStep: 100,
  fgColorInnerCircle: 50,
  fgColorInnerCircleMax: 360,
  //Outer circle color
  outerCircleColorModeOnOff: 0,
  outerCircleColorModeOnOffMax: 100,
  outerCircleColorModeOnOffStep: 100,
  fgColorOuterCircle: 185,
  fgColorOuterCircleMax: 360,
  //Presets
  preset: ['varianteA', 'varianteB', 'varianteC', 'varianteD', 'varianteE', 'varianteF',]
};

// Params for logging
const loggingParams = {
  targetDrawingParams: document.getElementById('drawingParams'),
  targetCanvasParams: document.getElementById('canvasParams'),
  state: false
};

let currentPreset = false;
let sketchGUI;

let pulsation = 0;
let pulsationDirection = 1;
let rotation = 0;
let rotationDirection = 1;




/* ###########################################################################
Classes
############################################################################ */





/* ###########################################################################
Custom Functions
############################################################################ */





/* ###########################################################################
P5 Functions
############################################################################ */

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
    sketchGUI = createGui('Params');
    sketchGUI.addObject(drawingParams);
    //noLoop();
  }

  // Anything else
  fill(200);
  stroke(0);
  colorMode(HSB, 360, 100, 100, 100);
  angleMode(DEGREES);
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
  fill(drawingParams.fgColorInnerCircle,drawingParams.innerCircleColorModeOnOff,100,drawingParams.fgAlpha);
  translate(width/2, height/2);

  //Presets
  if (drawingParams.preset !== currentPreset) { 
    currentPreset = drawingParams.preset;
    if (drawingParams.preset === 'varianteA') { 
      sketchGUI.update('amountOfDots', 16);
      sketchGUI.update('dotSize', 20);
      sketchGUI.update('radius', 200);
      sketchGUI.update('formationDistancing', 100);
      sketchGUI.update('rotationSpeed', 1);
      sketchGUI.update('pulsationSpeed', 1.8);
      sketchGUI.update('pulsationDistanceIn', 100);
      sketchGUI.update('pulsationDistanceOut', 0);
      sketchGUI.update('fgAlpha', 30);
      sketchGUI.update('bgAlpha', 0);
      sketchGUI.update('innerCircleColorModeOnOff', 0);
      sketchGUI.update('fgColorInnerCircle', 50);
      sketchGUI.update('outerCircleColorModeOnOff', 0);
      sketchGUI.update('fgColorOuterCircle', 185);
    } else if (drawingParams.preset === 'varianteB') { 
      sketchGUI.update('amountOfDots', 80);
      sketchGUI.update('dotSize', 4);
      sketchGUI.update('radius', 200);
      sketchGUI.update('formationDistancing', 100);
      sketchGUI.update('rotationSpeed', 1.6);
      sketchGUI.update('pulsationSpeed', 4.4);
      sketchGUI.update('pulsationDistanceIn', 100);
      sketchGUI.update('pulsationDistanceOut', 0);
      sketchGUI.update('fgAlpha', 50);
      sketchGUI.update('bgAlpha', 4);
      sketchGUI.update('innerCircleColorModeOnOff', 0);
      sketchGUI.update('fgColorInnerCircle', 50);
      sketchGUI.update('outerCircleColorModeOnOff', 100);
      sketchGUI.update('fgColorOuterCircle', 185);
    }
    else if (drawingParams.preset === 'varianteC') { 
      sketchGUI.update('amountOfDots', 28);
      sketchGUI.update('dotSize', 7);
      sketchGUI.update('radius', 100);
      sketchGUI.update('formationDistancing', 220);
      sketchGUI.update('rotationSpeed', 5);
      sketchGUI.update('pulsationSpeed', 4.4);
      sketchGUI.update('pulsationDistanceIn', 100);
      sketchGUI.update('pulsationDistanceOut', 6);
      sketchGUI.update('fgAlpha', 83);
      sketchGUI.update('bgAlpha', 18);
      sketchGUI.update('innerCircleColorModeOnOff', 100);
      sketchGUI.update('fgColorInnerCircle', 30);
      sketchGUI.update('outerCircleColorModeOnOff', 100);
      sketchGUI.update('fgColorOuterCircle', 30);
    }
    else if (drawingParams.preset === 'varianteD') { 
      sketchGUI.update('amountOfDots', 40);
      sketchGUI.update('dotSize', 3);
      sketchGUI.update('radius', 100);
      sketchGUI.update('formationDistancing', 100);
      sketchGUI.update('rotationSpeed', 5);
      sketchGUI.update('pulsationSpeed', 1.8);
      sketchGUI.update('pulsationDistanceIn', 216);
      sketchGUI.update('pulsationDistanceOut', 79);
      sketchGUI.update('fgAlpha', 84);
      sketchGUI.update('bgAlpha', 3);
      sketchGUI.update('innerCircleColorModeOnOff', 100);
      sketchGUI.update('fgColorInnerCircle', 50);
      sketchGUI.update('outerCircleColorModeOnOff', 0);
      sketchGUI.update('fgColorOuterCircle', 185);
    }
    else if (drawingParams.preset === 'varianteE') { 
      sketchGUI.update('amountOfDots', 100);
      sketchGUI.update('dotSize', 4);
      sketchGUI.update('radius', 107);
      sketchGUI.update('formationDistancing', 44);
      sketchGUI.update('rotationSpeed', 3.2);
      sketchGUI.update('pulsationSpeed', 3.2);
      sketchGUI.update('pulsationDistanceIn', 100);
      sketchGUI.update('pulsationDistanceOut', 147); //0 auch gut
      sketchGUI.update('fgAlpha', 100);
      sketchGUI.update('bgAlpha', 19);
      sketchGUI.update('innerCircleColorModeOnOff', 100);
      sketchGUI.update('fgColorInnerCircle', 30);
      sketchGUI.update('outerCircleColorModeOnOff', 100);
      sketchGUI.update('fgColorOuterCircle', 40);
    }
    else if (drawingParams.preset === 'varianteF') { 
      sketchGUI.update('amountOfDots', 36);
      sketchGUI.update('dotSize', 3);
      sketchGUI.update('radius', 72);
      sketchGUI.update('formationDistancing', 178);
      sketchGUI.update('rotationSpeed', 5);
      sketchGUI.update('pulsationSpeed', 1.8);
      sketchGUI.update('pulsationDistanceIn', 100);
      sketchGUI.update('pulsationDistanceOut', 14);
      sketchGUI.update('fgAlpha', 75);
      sketchGUI.update('bgAlpha', 10);
      sketchGUI.update('innerCircleColorModeOnOff', 100);
      sketchGUI.update('fgColorInnerCircle', 50);
      sketchGUI.update('outerCircleColorModeOnOff', 100);
      sketchGUI.update('fgColorOuterCircle', 185);
    }
  }
 
  rotation += rotationDirection * drawingParams.rotationSpeed;
  let radius = drawingParams.Radius;

  pulsation += pulsationDirection * drawingParams.pulsationSpeed;
  pulsationDirection = (pulsation > drawingParams.pulsationDistanceIn || pulsation < -drawingParams.pulsationDistanceOut)
  ?pulsationDirection * -1
  :pulsationDirection;
  

  angleSteps = 360 / drawingParams.amountOfDots;
  for (let angle = 0; angle < 360; angle += angleSteps) {

    xPos = cos(angle + rotation) * (drawingParams.radius - drawingParams.formationDistancing - pulsation);
    yPos = sin(angle + rotation) * (drawingParams.radius - drawingParams.formationDistancing - pulsation);

    ellipse(xPos, yPos, drawingParams.dotSize);
    
  }

  fill(drawingParams.fgColorOuterCircle,drawingParams.outerCircleColorModeOnOff,100,drawingParams.fgAlpha);
  angleSteps = 360 / drawingParams.amountOfDots * 4;
  for (let angle = 0; angle < 360; angle += angleSteps) {

    xPos = cos(angle + rotation) * (drawingParams.radius - pulsation);
    yPos = sin(angle + rotation) * (drawingParams.radius - pulsation);

    ellipse(xPos, yPos, drawingParams.dotSize);
    
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

