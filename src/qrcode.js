/*
   Copyright 2011 Lazar Laszlo (lazarsoft@gmail.com, www.lazarsoft.info)
   
   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

/*
var qrcode = {};
qrcode.imagedata = null;
qrcode.width = 0;
qrcode.height = 0;
qrcode.qrCodeSymbol = null;
qrcode.debug = false;
qrcode.maxImgSize = 1024*1024;

qrcode.sizeOfDataLengthInfo =  [  [ 10, 9, 8, 8 ],  [ 12, 11, 16, 10 ],  [ 14, 13, 16, 12 ] ];

qrcode.callback = null;
*/

function qrcodereader() {
	this.imagedata = null;
	this.width = 0;
	this.height = 0;
	this.qrCodeSymbol = null;
	this.debug = false;
	this.maxImgSize = 1024*1024;
	this.sizeOfDataLengthInfo =  [  [ 10, 9, 8, 8 ],  [ 12, 11, 16, 10 ],  [ 14, 13, 16, 12 ] ];
	this.callback = null;
}

qrcodereader.prototype.vidSuccess = function (stream) 
{
    this.localstream = stream;
    if(this.webkit)
        this.video.src = window.webkitURL.createObjectURL(stream);
    else
    if(this.moz)
    {
        this.video.mozSrcObject = stream;
        this.video.play();
    }
    else
        this.video.src = stream;
    
    this.gUM=true;
    
    this.canvas_qr2 = document.createElement('canvas');
    this.canvas_qr2.id = "qr-canvas";
    this.qrcontext2 = this.canvas_qr2.getContext('2d');
    this.canvas_qr2.width = this.video.videoWidth;
    this.canvas_qr2.height = this.video.videoHeight;
    setTimeout(this.captureToCanvas, 500);
}
        
qrcodereader.prototype.vidError = function(error)
{
    this.gUM=false;
    return;
}

qrcodereader.prototype.captureToCanvas = function()
{
    if(this.gUM)
    {
        try{
            if(this.video.videoWidth == 0)
            {
                setTimeout(this.captureToCanvas, 500);
                return;
            }
            else
            {
                this.canvas_qr2.width = this.video.videoWidth;
                this.canvas_qr2.height = this.video.videoHeight;
            }
            this.qrcontext2.drawImage(this.video,0,0);
            try{
                this.decode();
            }
            catch(e){       
                console.log(e);
                setTimeout(this.captureToCanvas, 500);
            };
        }
        catch(e){       
                console.log(e);
                setTimeout(this.captureToCanvas, 500);
        };
    }
}

qrcodereader.prototype.setWebcam = function(videoId)
{
    var n=navigator;
    this.video=document.getElementById(videoId);

    var options = true;
    if(navigator.mediaDevices && navigator.mediaDevices.enumerateDevices)
    {
        try{
            navigator.mediaDevices.enumerateDevices()
            .then(function(devices) {
              devices.forEach(function(device) {
                console.log("deb1");
                if (device.kind === 'videoinput') {
                  if(device.label.toLowerCase().search("back") >-1)
                    options=[{'sourceId': device.deviceId}] ;
                }
                console.log(device.kind + ": " + device.label +
                            " id = " + device.deviceId);
              });
            })
            
        }
        catch(e)
        {
            console.log(e);
        }
    }
    else{
        console.log("no navigator.mediaDevices.enumerateDevices" );
    }
    
    if(n.getUserMedia)
        n.getUserMedia({video: options, audio: false}, this.vidSuccess, this.vidError);
    else
    if(n.webkitGetUserMedia)
    {
        this.webkit=true;
        n.webkitGetUserMedia({video:options, audio: false}, this.vidSuccess, this.vidError);
    }
    else
    if(n.mozGetUserMedia)
    {
        this.moz=true;
        n.mozGetUserMedia({video: options, audio: false}, this.vidSuccess, this.vidError);
    }
}

qrcodereader.prototype.decode = function(src){
    
    if(arguments.length==0)
    {
        if(this.canvas_qr2)
        {
            var canvas_qr = this.canvas_qr2;
            var context = this.qrcontext2;
        }	
        else
        {
            var canvas_qr = document.getElementById("qr-canvas");
            var context = canvas_qr.getContext('2d');
        }
        this.width = canvas_qr.width;
        this.height = canvas_qr.height;
        this.imagedata = context.getImageData(0, 0, this.width, this.height);
        this.result = this.process(context);
        if(this.callback!=null)
            this.callback(this.result);
        return this.result;
    }
    else
    {
        var image = new Image();
        image.crossOrigin = "Anonymous";
        image.onload=function(){
            //var canvas_qr = document.getElementById("qr-canvas");
            var canvas_out = document.getElementById("out-canvas");
            if(canvas_out!=null)
            {
                var outctx = canvas_out.getContext('2d');
                outctx.clearRect(0, 0, 320, 240);
                outctx.drawImage(image, 0, 0, 320, 240);
            }

            var canvas_qr = document.createElement('canvas');
            var context = canvas_qr.getContext('2d');
            var nheight = image.height;
            var nwidth = image.width;
            if(image.width*image.height>this.maxImgSize)
            {
                var ir = image.width / image.height;
                nheight = Math.sqrt(this.maxImgSize/ir);
                nwidth=ir*nheight;
            }

            canvas_qr.width = nwidth;
            canvas_qr.height = nheight;
            
            context.drawImage(image, 0, 0, canvas_qr.width, canvas_qr.height );
            this.width = canvas_qr.width;
            this.height = canvas_qr.height;
            try{
                this.imagedata = context.getImageData(0, 0, canvas_qr.width, canvas_qr.height);
            }catch(e){
                this.result = "Cross domain image reading not supported in your browser! Save it to your computer then drag and drop the file!";
                if(this.callback!=null)
                    this.callback(this.result);
                return;
            }
            
            try
            {
                this.result = this.process(context);
            }
            catch(e)
            {
                console.log(e);
                this.result = "error decoding QR Code";
            }
            if(this.callback!=null)
                this.callback(this.result);
        }
        image.onerror = function ()
        {
            if(this.callback!=null) 
                this.callback("Failed to load the image");
        }
        image.src = src;
    }
}

qrcodereader.prototype.isUrl = function(s)
{
    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regexp.test(s);
}

qrcodereader.prototype.decode_url = function (s)
{
  var escaped = "";
  try{
    escaped = escape( s );
  }
  catch(e)
  {
    console.log(e);
    escaped = s;
  }
  var ret = "";
  try{
    ret = decodeURIComponent( escaped );
  }
  catch(e)
  {
    console.log(e);
    ret = escaped;
  }
  return ret;
}

qrcodereader.prototype.decode_utf8 = function ( s )
{
    if(this.isUrl(s))
        return this.decode_url(s);
    else
        return s;
}

qrcodereader.prototype.process = function(ctx){
    
    var start = new Date().getTime();

    var image = this.grayScaleToBitmap(this.grayscale());
    //var image = this.binarize(128);
    
    if(this.debug)
    {
        for (var y = 0; y < this.height; y++)
        {
            for (var x = 0; x < this.width; x++)
            {
                var point = (x * 4) + (y * this.width * 4);
                this.imagedata.data[point] = image[x+y*this.width]?0:0;
                this.imagedata.data[point+1] = image[x+y*this.width]?0:0;
                this.imagedata.data[point+2] = image[x+y*this.width]?255:0;
            }
        }
        ctx.putImageData(this.imagedata, 0, 0);
    }
    
    //var finderPatternInfo = new FinderPatternFinder(this).findFinderPattern(image);
    
    var detector = new Detector(this, image);

    var qRCodeMatrix = detector.detect();
    
    if(this.debug)
    {
        for (var y = 0; y < qRCodeMatrix.bits.Height; y++)
        {
            for (var x = 0; x < qRCodeMatrix.bits.Width; x++)
            {
                var point = (x * 4*2) + (y*2 * this.width * 4);
                this.imagedata.data[point] = qRCodeMatrix.bits.get_Renamed(x,y)?0:0;
                this.imagedata.data[point+1] = qRCodeMatrix.bits.get_Renamed(x,y)?0:0;
                this.imagedata.data[point+2] = qRCodeMatrix.bits.get_Renamed(x,y)?255:0;
            }
        }
        ctx.putImageData(this.imagedata, 0, 0);
    }
    
    
    var reader = Decoder.decode(this, qRCodeMatrix.bits);
    var data = reader.DataByte;
    var str="";
    for(var i=0;i<data.length;i++)
    {
        for(var j=0;j<data[i].length;j++)
            str+=String.fromCharCode(data[i][j]);
    }
    
    var end = new Date().getTime();
    var time = end - start;
    // console.log(time);
    
    return this.decode_utf8(str);
    //alert("Time:" + time + " Code: "+str);
}

qrcodereader.prototype.getPixel = function(x,y){
    if (this.width < x) {
        throw "point error";
    }
    if (this.height < y) {
        throw "point error";
    }
    var point = (x * 4) + (y * this.width * 4);
    var p = (this.imagedata.data[point]*33 + this.imagedata.data[point + 1]*34 + this.imagedata.data[point + 2]*33)/100;
    return p;
}

qrcodereader.prototype.binarize = function(th){
    var ret = new Array(this.width*this.height);
    for (var y = 0; y < this.height; y++)
    {
        for (var x = 0; x < this.width; x++)
        {
            var gray = this.getPixel(x, y);
            
            ret[x+y*this.width] = gray<=th?true:false;
        }
    }
    return ret;
}

qrcodereader.prototype.getMiddleBrightnessPerArea=function(image)
{
    var numSqrtArea = 4;
    //obtain middle brightness((min + max) / 2) per area
    var areaWidth = Math.floor(this.width / numSqrtArea);
    var areaHeight = Math.floor(this.height / numSqrtArea);
    var minmax = new Array(numSqrtArea);
    for (var i = 0; i < numSqrtArea; i++)
    {
        minmax[i] = new Array(numSqrtArea);
        for (var i2 = 0; i2 < numSqrtArea; i2++)
        {
            minmax[i][i2] = new Array(0,0);
        }
    }
    for (var ay = 0; ay < numSqrtArea; ay++)
    {
        for (var ax = 0; ax < numSqrtArea; ax++)
        {
            minmax[ax][ay][0] = 0xFF;
            for (var dy = 0; dy < areaHeight; dy++)
            {
                for (var dx = 0; dx < areaWidth; dx++)
                {
                    var target = image[areaWidth * ax + dx+(areaHeight * ay + dy)*this.width];
                    if (target < minmax[ax][ay][0])
                        minmax[ax][ay][0] = target;
                    if (target > minmax[ax][ay][1])
                        minmax[ax][ay][1] = target;
                }
            }
            //minmax[ax][ay][0] = (minmax[ax][ay][0] + minmax[ax][ay][1]) / 2;
        }
    }
    var middle = new Array(numSqrtArea);
    for (var i3 = 0; i3 < numSqrtArea; i3++)
    {
        middle[i3] = new Array(numSqrtArea);
    }
    for (var ay = 0; ay < numSqrtArea; ay++)
    {
        for (var ax = 0; ax < numSqrtArea; ax++)
        {
            middle[ax][ay] = Math.floor((minmax[ax][ay][0] + minmax[ax][ay][1]) / 2);
            //Console.out.print(middle[ax][ay] + ",");
        }
        //Console.out.println("");
    }
    //Console.out.println("");
    
    return middle;
}

qrcodereader.prototype.grayScaleToBitmap=function(grayScale)
{
    var middle = this.getMiddleBrightnessPerArea(grayScale);
    var sqrtNumArea = middle.length;
    var areaWidth = Math.floor(this.width / sqrtNumArea);
    var areaHeight = Math.floor(this.height / sqrtNumArea);

    var buff = new ArrayBuffer(this.width*this.height);
    var bitmap = new Uint8Array(buff);

    //var bitmap = new Array(this.height*this.width);
    
    for (var ay = 0; ay < sqrtNumArea; ay++)
    {
        for (var ax = 0; ax < sqrtNumArea; ax++)
        {
            for (var dy = 0; dy < areaHeight; dy++)
            {
                for (var dx = 0; dx < areaWidth; dx++)
                {
                    bitmap[areaWidth * ax + dx+ (areaHeight * ay + dy)*this.width] = (grayScale[areaWidth * ax + dx+ (areaHeight * ay + dy)*this.width] < middle[ax][ay])?true:false;
                }
            }
        }
    }
    return bitmap;
}

qrcodereader.prototype.grayscale = function()
{
    var buff = new ArrayBuffer(this.width*this.height);
    var ret = new Uint8Array(buff);
    //var ret = new Array(this.width*this.height);
    
    for (var y = 0; y < this.height; y++)
    {
        for (var x = 0; x < this.width; x++)
        {
            var gray = this.getPixel(x, y);
            
            ret[x+y*this.width] = gray;
        }
    }
    return ret;
}




function URShift( number,  bits)
{
    if (number >= 0)
        return number >> bits;
    else
        return (number >> bits) + (2 << ~bits);
}

var qrcode = new qrcodereader();

