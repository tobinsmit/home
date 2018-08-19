const startPosDeviation = 0; // 100
const startVelDeviation = 0; // 0
const friction = 0.93; // 0.92
const particleSize = 1; // 1
const sizeHalfFloor = Math.floor(particleSize/2)
const sizeHalfCeil = Math.ceil(particleSize/2)
const particleRadius = 1; // 1 ?
const particleDarkness = 200;
const particleDarkChangeCoef = 1;
const particleDarknessMin = 100;
const homeForceCoef = 0.01; // 0.1
const mouseForceCoef = 5000; // 10000 // force = min(coef/mouseDistanceSquared, coef)
const lagTime = 15; // 10

var fontSize = ww/10;
var fontSize = 100;
// const words = "Hello World";
var words = "Tobin Smit";
// words = words.replace(" ", String.fromCharCode(8202));
const lines = words.split('\n');

var canvas = $('canv');
var context = canvas.getContext("2d");
var fakeCanvas = $('fakeCanv');
var fakecontext = fakeCanvas.getContext("2d");
var data;
var particles = [];
var mouse = {x: 0, y: 0};
var wh = window.innerHeight;
var ww = window.innerWidth;



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

  this.darkness = Math.max(particleDarkness - particleDarkChangeCoef * homeDistance, particleDarknessMin);
}

function initScene(){
  console.log("initScene");
  var wh = window.innerHeight;
  var ww = window.innerWidth;
  canvas.height = wh;
  canvas.width = ww;
  fakeCanvas.height = wh;
  fakeCanvas.width = ww;

  // Temporary rect to measure text
  fakecontext.clearRect(0, 0, canvas.width, canvas.height);
  context.clearRect(0, 0, canvas.width, canvas.height);


  // Find max font size for it all to fit
  var maxLineWidth = 0;
  fakecontext.font = "bold " + fontSize + "px 'Patua One'";
  for(var i = 0; i < lines.length; i++) {
    var thisLineWidth = fakecontext.measureText(lines[i]).width;
    if (thisLineWidth > maxLineWidth) {
      maxLineWidth = thisLineWidth;
    }
  }
  while (maxLineWidth > ww-50 || fontSize * lines.length > wh - 50) {
    fontSize -= 5;
    fakecontext.font = "bold " + fontSize + "px 'Patua One'";

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
    ypos = wh/2 - fontSize * (lines.length / 2 - (i + 0.5) );
    ypos = 110 + fontSize * (i + 0.5);
    fakecontext.fillText(lines[i], ww/2, ypos)
  }

  // Save data and clear rect
  data = fakecontext.getImageData(0, 0, ww, wh).data;
  context.clearRect(0, 0, ww, wh);
  // context.globalCompositeOperation = "screen";

  // Create particles
  // particles = [];
  var index = 0;
  for(var x = 0; x < ww; x += particleSize) {
    for(var y = 0; y < wh; y += particleSize) {
      const dataIndex = (y * ww + x) * 4 + 3;
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

}

function drawPixels() {
  for(var i = 0; i < particles.length; i++) {
    particles[i].move();
  }

  var imageData = context.createImageData(ww,wh);
  var actualData = imageData.data;

  var index;
  var goodX;
  var goodY;
  var realX;
  var realY;
  
  for(var i = 0; i < particles.length; i++) {
    goodX = Math.floor(particles[i].x);
    goodY = Math.floor(particles[i].y);
    
    for(realX = goodX - sizeHalfFloor; realX <= goodX + sizeHalfCeil && realX >= 0 && realX < ww; realX++) {
      for(realY = goodY - sizeHalfFloor; realY <= goodY + sizeHalfCeil && realY >= 0 && realY < wh; realY++) {
        index = (realY * imageData.width + realX) * 4 + 3;
        // actualData[index] = this.brightness;
        actualData[index] = particles[i].darkness;
      }
    }
  }
  
  imageData.data = actualData;
  context.putImageData(imageData,0,0);

  setTimeout(drawPixels,lagTime);
}

// Mouse handlers
function onMouseMove(e){
  $('staticTitle').style.visibility = "hidden";
  $('canv').style.display = "initial";
  // $('fakeCanv').style.display = "initial";
  // console.log("mouse move")
  mouse.x = e.clientX;
  mouse.y = e.clientY;
}
function onTouchMove(e){
  // console.log("touch move")
  if(e.touches.length > 0 ){
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
  }
}
function onTouchEnd(e){
  // console.log("touch end")
  mouse.x = -1;
  mouse.y = -1;
}




window.addEventListener("resize", initScene);
window.addEventListener("mousemove", onMouseMove);
window.addEventListener("touchmove", onTouchMove);
window.addEventListener("touchend", onTouchEnd);

initScene();
drawPixels();
// window.dispatchEvent(new Event('mousemove'));

function $(id) {
  return document.getElementById(id);
}

