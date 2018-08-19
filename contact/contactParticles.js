  
// var l=document.location + "";
// l=l.replace(/%20/g," ");
// l=l.replace(/%0A/g,"\n");
// var index=l.indexOf('?t=');
// if(index==-1) document.location=l + "?t=Tobin%20is%20interested%20in%20solving%20all%20kinds%20of%20problems.%0AShoot%20him%20an%20email%20at%20tobinksmit@gmail.com";
// At%20mi%20hac%20lacus%20laoreet%20varius.%20Sem%20porttitor%20odio.%20Sed%20ultricies%20lacus.%20Eget%20erat%20nisl.%20%0AConsequat%20a%20in%20volutpat%20odio%20aliquam.%20Curabitur%20bibendum%20eleifend.%20Vel%20porttitor%20nec%20viverra%20wisi.%0AAliquam%20condimentum%20suspendisse%20diam%20tristique%20vestibulum%20augue%20tincidunt%20semper.%20%0AParturient%20rutrum%20consectetuer.%20Quam%20congue%20vitae%20non%20gravida%20molestie.%20Lacus%20adipisicing%20amet.%20%0AInterdum%20mi%20integer%20nonummy.At%20at%20erat%20vitae%20ante%20nec%20lorem%20at%20vestibulum.%20Sequi%20praesent%20tempor.%20%0AQuam%20lectus%20ultricies.%20Suspendisse%20malesuada%20sed.%20Tellus%20nonummy%20tristique.%20%0ANec%20purus%20massa%20leo%20ridiculus%20ut.%20Arcu%20fusce%20lectus.%20Eget%20ac%20sed%20diam%20vestibulum%20natoque%0Amalesuada%20vulputate%20eget%20massa%20magna%20aliquam.%20Rutrum%20aenean%20donec%20ultrices%20molestie%20%0Aelementum%20urna%20quisque.Maecenas%20vestibulum%20eu%20justo%20nec%20orci.%20A%20sollicitudin%20ullamcorper.%20%0AId%20fringilla%20enim%20est%20ante%20eu.%20Tempus%20hac%20varius%20et%20lectus%20neque.%20Donec%20risus%20molestie%20leo%20non%20sit.%0A%20Quam%20sit%20massa.%20Nisl%20vestibulum%20nibh%20placerat%20vel%20quam%20fames%20sed%20feugiat%20massa%20ac%20non.%20%0ADuis%20euismod%20commodo.%20Ligula%20ac%20est%20erat%20ac.%20Luctus%20vulputate%20quam.%20Nulla%20nunc%20ipsum.%20%0ANascetur%20ipsum%20turpis.%20Et%20amet%20proin%20vivamus%20justo%20metus%20lorem%20ultrices%20aliquet.%20
var message = "I'm happy to talk.\nShoot me an email at tobinksmit@gmail.com"
var pixels=new Array();
var canv=$('canv');
var ctx=canv.getContext('2d');
var wordCanv=$('wordCanv');
var wordCtx=wordCanv.getContext('2d');
var mx=-1;
var my=-1;
var words="";
var txt=new Array();
var cw=0;
var ch=0;
var resolution=1;
var n=0;
var timerRunning=false;
var resHalfFloor=0;
var resHalfCeil=0;

function canv_mousemove(evt)
{
  console.log("Mouse event");
  mx=evt.clientX-canv.offsetLeft;
  my=evt.clientY-canv.offsetTop;
}

function Pixel(homeX,homeY) {
  console.log("Pixel");
  this.homeX=homeX;
  this.homeY=homeY;
  
  // this.x=Math.random()*cw; // og
  // this.y=Math.random()*ch;  
  this.x=homeX; // mine
  this.y=homeY;
  
  //tmp
  // this.xVelocity=Math.random()*10-5; // og
  // this.yVelocity=Math.random()*10-5;
  this.xVelocity=(Math.random()-0.5)*0; // mine
  this.yVelocity=(Math.random()-0.5)*0;
}

Pixel.prototype.move = function() {
  // console.log("Pixel.move");
  var homeDX=this.homeX-this.x;
  var homeDY=this.homeY-this.y;
  var homeDistance=Math.sqrt(Math.pow(homeDX,2) + Math.pow(homeDY,2));
  var homeForce=homeDistance*0.01;
  var homeAngle=Math.atan2(homeDY,homeDX);
  
  var cursorForce=0;
  var cursorAngle=0;
  
  if(mx >= 0)
  {
    var cursorDX=this.x-mx;
    var cursorDY=this.y-my;
    var cursorDistanceSquared=Math.pow(cursorDX,2) + Math.pow(cursorDY,2);
    cursorForce=Math.min(10000/cursorDistanceSquared,10000);
    cursorAngle=Math.atan2(cursorDY,cursorDX);
  }
  else
  {
    cursorForce=0;
    cursorAngle=0;
  }
  
  this.xVelocity+=homeForce*Math.cos(homeAngle) + cursorForce*Math.cos(cursorAngle);
  this.yVelocity+=homeForce*Math.sin(homeAngle) + cursorForce*Math.sin(cursorAngle);
  
  this.xVelocity*=0.92;
  this.yVelocity*=0.92;
  
  this.x+=this.xVelocity;
  this.y+=this.yVelocity;
}

function $(id)
{
  return document.getElementById(id);
}

function timer(){
  console.log("timer");
  if(!timerRunning) {
    timerRunning=true;
    setTimeout(timer,33);
      // console.log("drawPixels pixels.length: " + pixels.length);

    for(var i=0;i<pixels.length;i++)
    {
      pixels[i].move();
    }
    
    drawPixels();
    wordsTxt.focus();
    
    n++;
    if(n%10==0 && (cw!=document.body.clientWidth || ch!=document.body.clientHeight)) body_resize();
    timerRunning=false;
  } else {
    setTimeout(timer,10);
  }
}

function drawPixels(){
  console.log("drawPixels count:" + pixels.length);
  var imageData=ctx.createImageData(cw,ch);
  var actualData=imageData.data;

  var index;
  var goodX;
  var goodY;
  var realX;
  var realY;
  
  for(var i=0;i<pixels.length;i++)
  {
    goodX=Math.floor(pixels[i].x);
    goodY=Math.floor(pixels[i].y);
    
    for(realX=goodX-resHalfFloor; realX<=goodX+resHalfCeil && realX>=0 && realX<cw;realX++)
    {
      for(realY=goodY-resHalfFloor; realY<=goodY+resHalfCeil && realY>=0 && realY<ch;realY++)
      {
        index=(realY*imageData.width + realX)*4;
        actualData[index+3]=255;
      }
    }
  }
  
  imageData.data=actualData;
  ctx.putImageData(imageData,0,0);
}

function readWords()
{
  words = $('wordsTxt').value;
  txt = words.split('\n');
}

function init()
{
  console.log("init");
  readWords();
  
  var fontSize=40;
  var wordWidth=0;
  do
  {
    wordWidth=0;
    fontSize-=5;
    wordCtx.font=fontSize+"px sans-serif";
    for(var i=0;i<txt.length;i++)
    {
      var w=wordCtx.measureText(txt[i]).width;
      if(w>wordWidth) wordWidth=w;
    }
  } while(wordWidth>cw-50 || fontSize*txt.length > ch-50)
  
  wordCtx.clearRect(0,0,cw,ch);
  // wordCtx.font = "bold";
  // wordCtx.fontFamily = 'Patua One', 'cursive'; // cant get it to work
  wordCtx.textAlign="center";
  wordCtx.textBaseline="middle";
  for(var i=0;i<txt.length;i++)
  {
    wordCtx.fillText(txt[i],cw/2,ch/2 - fontSize*(txt.length/2-(i+0.5)));
  }
  
  var index=0;
  
  var imageData=wordCtx.getImageData(0,0,cw,ch);
  for(var x=0;x<imageData.width;x+=resolution) //var i=0;i<imageData.data.length;i+=4)
  {
    for(var y=0;y<imageData.height;y+=resolution)
    {
      i=(y*imageData.width + x)*4;
      
      if(imageData.data[i+3]>128) {
        if(index >= pixels.length)
        {
          pixels[index]=new Pixel(x,y);
        }
        else
        {
          pixels[index].homeX=x;
          pixels[index].homeY=y;
        }
        index++;
      }
    }
  }
  
  pixels.splice(index,pixels.length-index);
}

function body_resize()
{
  cw=document.body.clientWidth;
  ch=document.body.clientHeight;
  canv.width=cw;
  canv.height=ch;
  wordCanv.width=cw;
  wordCanv.height=ch;
  
  init();
}

wordsTxt.focus();
wordsTxt.value=message;

resHalfFloor=Math.floor(resolution/2);
resHalfCeil=Math.ceil(resolution/2);

body_resize();
timer();

window.addEventListener("mousemove", canv_mousemove);
window.addEventListener("touchmove", canv_mousemove);
window.addEventListener("load", canv_mousemove);
