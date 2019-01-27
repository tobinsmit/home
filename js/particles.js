// Window/Resolution values
var windowResMultipiler = 1;
console.log("Pixel ratio: " + window.devicePixelRatio);
windowResMultipiler = Math.ceil(window.devicePixelRatio);
const topPadding = 110 * windowResMultipiler; // 110
var lagTime = 15; // 10
var wh = window.innerHeight;
var ww = window.innerWidth;
var ch = windowResMultipiler * wh;
var cw = windowResMultipiler * ww;
var nDraws = 0;
var avgDrawTime = 0;

// Particle values
const startPosDeviation = 20; // 100, 20
const startVelDeviation = 10; // 0, 10
const friction = 0.93; // 0.92
var particleSize = 1 * windowResMultipiler; // 1 * _
var sizeHalfFloor = Math.floor(particleSize/2)
var sizeHalfCeil = Math.ceil(particleSize/2)
const particleRadius = 1; // 1 ?
const particleDarkness = 200;
const particleDarkChangeCoef = 1;
const particleDarknessMin = 100;
const homeForceCoef = 0.01; // 0.1
const mouseForceCoef = 5 * 1000 * Math.pow(windowResMultipiler, 3); // 5 // force = min(coef/mouseDistanceSquared, coef)

// Text values
var fontSize = ww/10
var fontSize = 100;
var fontSize = fontSize * windowResMultipiler;
var words = "Tobin Smit";
// words = words.replace(" ", String.fromCharCode(8202));
const lines = words.split('\n');

// Setup
var canvas = $('canv');
var context = canvas.getContext("2d");
var fakeCanvas = $('fakeCanv');
var fakecontext = fakeCanvas.getContext("2d");
var data;
var particles = [];
var mouse = {x: 0, y: 0};


function Particle(x,y){
  this.home = {
    x : x,
    y: y
  };
  this.x = this.home.x + (Math.random()-0.5)*startPosDeviation;
  this.y = this.home.y + (Math.random()-0.5)*startPosDeviation;
  this.vx = (Math.random()-0.5)*startVelDeviation;
  this.vy = (Math.random()-0.5)*startVelDeviation;
  this.darkness = particleDarkness;
}

Particle.prototype.move = function() {
  // console.log("Particle.move")

  var homedx = this.home.x - this.x;
  var homedy = this.home.y - this.y;
  var homeDistance = Math.sqrt(Math.pow(homedx,2) + Math.pow(homedy,2))
  var homeForce = homeDistance * homeForceCoef;
  var homeAngle = Math.atan2(homedy, homedx);

  if (mouse.x >= 0 && mouse.y >= 0) {
    var mousedx = this.x - mouse.x;
    var mousedy = this.y - mouse.y;
    // var mousedx = this.x - 0;
    // var mousedy = this.y - 0;
    var mouseDistanceSquared = Math.pow(mousedx,2) + Math.pow(mousedy,2);
    var mouseForce = Math.min(mouseForceCoef / mouseDistanceSquared, mouseForceCoef);
    var mouseAngle = Math.atan2(mousedy, mousedx);
  } else {
    var mouseForce = 0;
    var mouseAngle = 0;
  }

  this.vx += homeForce * Math.cos(homeAngle) + mouseForce * Math.cos(mouseAngle);
  this.vy += homeForce * Math.sin(homeAngle) + mouseForce * Math.sin(mouseAngle);
  
  this.vx *= friction;
  this.vy *= friction;
  
  this.x += this.vx;
  this.y += this.vy;

  this.darkness = Math.max(particleDarkness - particleDarkChangeCoef * homeDistance / Math.pow(windowResMultipiler,0.5), particleDarknessMin);
}

function initScene(){
  console.log("Initiating scene");
  var wh = window.innerHeight;
  var ww = window.innerWidth;
  var ch = windowResMultipiler * wh;
  var cw = windowResMultipiler * ww;
  canvas.height = ch;
  canvas.width = cw;
  canvas.style.height = wh + "px";
  canvas.style.width = ww + "px";
  fakeCanvas.height = ch;
  fakeCanvas.width = cw;
  fakeCanvas.style.height = wh + "px";
  fakeCanvas.style.width = ww + "px";

  // Temporary rect to measure text
  fakecontext.clearRect(0, 0, canvas.width, canvas.height);
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Recalulate rendering constants for drawPixels
  sizeHalfFloor = Math.floor(particleSize/2)
  sizeHalfCeil = Math.ceil(particleSize/2)


  // Find max font size for it all to fit
  var maxLineWidth = 0;
  fakecontext.font = "bold " + fontSize + "px 'Arial'";
  fakecontext.font = "bold " + fontSize + "px 'Patua One', 'Arial'";
  for(var i = 0; i < lines.length; i++) {
    var thisLineWidth = fakecontext.measureText(lines[i]).width;
    if (thisLineWidth > maxLineWidth) {
      maxLineWidth = thisLineWidth;
    }
  }
  while (maxLineWidth > cw-50 || fontSize * lines.length > ch - 50) {
    fontSize -= 5;
    fakecontext.font = "bold " + fontSize + "px 'Patua One', 'Arial'";
    maxLineWidth = 0;
    for(var i = 0; i < lines.length; i++) {
      var thisLineWidth = fakecontext.measureText(lines[i]).width;
      if (thisLineWidth > maxLineWidth) {
        maxLineWidth = thisLineWidth;
      }
    }
  }

  // Add text
  fakecontext.font = "bold " + fontSize + "px 'Patua One'";
  fakecontext.fillStyle = "#0f0";
  fakecontext.textAlign = "center";
  fakecontext.textBaseline = "middle";
  for (var i = 0; i < lines.length; i++) {
    ypos = ch/2 - fontSize * (lines.length / 2 - (i + 0.5) );
    ypos = topPadding + fontSize * (i + 0.5);
    fakecontext.fillText(lines[i], cw/2, ypos)
  }

  // Save data and clear rect
  data = fakecontext.getImageData(0, 0, cw, ch).data;
  context.clearRect(0, 0, cw, ch);
  // context.globalCompositeOperation = "screen";

  // Create particles
  // particles = [];
  var index = 0;
  for(var x = 0; x < cw; x += particleSize) {
    for(var y = 0; y < ch; y += particleSize) {
      const dataIndex = (y * cw + x) * 4 + 3;
      if(data[dataIndex] > 128){
        if (index < particles.length) {
          particles[index].home.x = x;          
          particles[index].home.y = y;
        } else {
          particles[index] = new Particle(x,y);
        }
        index++;
      }
    }
  }
  particles.splice(index);

}

function drawPixels() {
  start = Date.now();
  for (var i = 0; i < particles.length; i++) {
    particles[i].move();
  }

  var imageData = context.createImageData(cw,ch);
  var actualData = imageData.data;

  var index;
  var goodX;
  var goodY;
  var realX;
  var realY;
  
  for(var i = 0; i < particles.length; i++) {
    goodX = Math.floor(particles[i].x);
    goodY = Math.floor(particles[i].y);
    
    for(realX = goodX - sizeHalfFloor; realX <= goodX + sizeHalfCeil && realX >= 0 && realX < cw; realX++) {
      for(realY = goodY - sizeHalfFloor; realY <= goodY + sizeHalfCeil && realY >= 0 && realY < ch; realY++) {
        index = (realY * imageData.width + realX) * 4 + 3;
        // actualData[index] = this.brightness;
        actualData[index] = particles[i].darkness;
      }
    }
  }
  
  imageData.data = actualData;
  context.putImageData(imageData,0,0);

  if (nDraws <= 1){
    end = Date.now();
    avgDrawTime = (avgDrawTime*nDraws + (end-start))/(nDraws+1);
    nDraws++;
    console.log("drawPixels details: " + (end-start) + "ms, avg: " + avgDrawTime + "ms particleSize: " + particleSize);
  }
  if (nDraws == 1 && particleSize < 8 && avgDrawTime > 50) {
    particleSize += 1;
    lagTime = 0;
    avgDrawTime = 0;
    nDraws = 0;
    initScene();
  }


  setTimeout(drawPixels,lagTime);
}

// Mouse handlers
function onMouseMove(e){
  // $('staticTitle').style.visibility = "hidden";
  $('canv').style.display = "initial";
  // $('fakeCanv').style.display = "initial";
  // console.log("mouse move")
  mouse.x = e.clientX * windowResMultipiler;
  mouse.y = e.clientY * windowResMultipiler;
}
function onTouchMove(e){
  // console.log("touch move")
  if(e.touches.length > 0 ){
    mouse.x = e.touches[0].clientX * windowResMultipiler;
    mouse.y = e.touches[0].clientY * windowResMultipiler;
  }
}
function onTouchEnd(e){
  // console.log("touch end")
  mouse.x = -1;
  mouse.y = -1;
}

function $(id) {
  return document.getElementById(id);
}



window.addEventListener("resize", initScene);
window.addEventListener("mousemove", onMouseMove);
window.addEventListener("touchmove", onTouchMove);
window.addEventListener("touchend", onTouchEnd);

// window.dispatchEvent(new Event('mousemove'));

var fontsLoaded = false;
WebFont.load({
  google: {
    families: ['Patua One']
  },
  active: function() {
    setTimeout( function() {
      initScene();
      drawPixels();
    },100);
  }
});


