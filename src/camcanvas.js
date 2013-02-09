var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
window.requestAnimationFrame = requestAnimationFrame;

var v, canvas, gCtx, pixelOperationFunction=passEmboss;
var backBuffer = document.createElement('canvas');
var bCtx = backBuffer.getContext('2d');

function setFunction (fName) { 
	pixelOperationFunction=fName;
} 

function init() {
  v = document.getElementById('v');
  canvas = document.getElementById('qr-canvas');
  gCtx = canvas.getContext('2d');
  navigator.webkitGetUserMedia({video:true}, callbackStreamIsReady);
}

function callbackStreamIsReady(stream) {
  v.src = URL.createObjectURL(stream);
  v.play();
  window.requestAnimationFrame(draw);
}

function draw() {
  var w = canvas.clientWidth;
  var h = canvas.clientHeight;
  backBuffer.width = w;
  backBuffer.height = h;
  bCtx.drawImage(v, 0, 0, w, h);
  pixelOperationFunction(w,h);
  window.requestAnimationFrame(draw);
}

function passInverse(w,h) { 
   var pixels = bCtx.getImageData(0, 0, w, h);
   var pixelData = pixels.data;
   for (var i = 0; i < pixelData.length; i+=4) { 
     //pixelData.data[i+0]=r;
     var rr = pixelData[i+0];
     var gg = pixelData[i+1];
     var bb = pixelData[i+2];
     var average = parseInt((rr+gg+bb)/3);

     var diffMedia = 255-average; 
     average = diffMedia; 

     pixelData[parseInt(i+0)]=average;
     pixelData[parseInt(i+1)]=average;
     pixelData[parseInt(i+2)]=average;
     pixelData[parseInt(i+3)]=255;
   } 
   pixels.data = pixelData;
   gCtx.putImageData(pixels, 0, 0);
} 

function passGray(w,h) { 
   var pixels = bCtx.getImageData(0, 0, w, h);
   var pixelData = pixels.data;
   for (var i = 0; i < pixelData.length; i+=4) { 
     //pixelData.data[i+0]=r;
     var rr = pixelData[i+0];
     var gg = pixelData[i+1];
     var bb = pixelData[i+2];

     var average = parseInt((rr+gg+bb)/3);
     pixelData[parseInt(i+0)]=average;
     pixelData[parseInt(i+1)]=average;
     pixelData[parseInt(i+2)]=average;
     pixelData[parseInt(i+3)]=255;
   } 
   pixels.data = pixelData;
   gCtx.putImageData(pixels, 0, 0);
} 

function passNormal(w,h) { 
   var pixels = bCtx.getImageData(0, 0, w, h);
   gCtx.putImageData(pixels, 0, 0);
} 
	
function passRed(w,h) { 
   var pixels = bCtx.getImageData(0, 0, w, h);
   var pixelData = pixels.data;
   for (var i = 0; i < pixelData.length; i+=4) { 
     //pixelData.data[i+0]=r;
     pixelData[parseInt(i+1)]=0;
     pixelData[parseInt(i+2)]=0;
     pixelData[parseInt(i+3)]=255;
   } 
   pixels.data = pixelData;
   gCtx.putImageData(pixels, 0, 0);
} 
				
function passEmboss(w,h) { 
   var pixels = bCtx.getImageData(0, 0, w, h);
   var pixelData = pixels.data;
   for (var i = 0; i < pixelData.length; i+=4) { 
     //pixelData.data[i+0]=r;
     var rr = pixelData[i+0];
     var gg = pixelData[i+1];
     var bb = pixelData[i+2];
     var average = parseInt((rr+gg+bb)/3);
     if(i>7) { 
       mOld = pixelData[i-8+0];
       mOld = pixelData[i-8+1];
       mOld = pixelData[i-8+2];
       var diffMedia = 255-average; 
       average = diffMedia; 

       mNew = parseInt((mOld + average )/ 2);

       pixelData[i-8+0]=mNew;
       pixelData[i-8+1]=mNew;
       pixelData[i-8+2]=mNew;
     }
   } 
   pixels.data = pixelData;
   gCtx.putImageData(pixels, 0, 0);
} 

