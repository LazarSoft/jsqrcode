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


let qrcode = {};
qrcode.imagedata = null;
qrcode.width = 0;
qrcode.height = 0;
qrcode.qrCodeSymbol = null;
qrcode.debug = false;
qrcode.maxImgSize = 1024*1024;

qrcode.sizeOfDataLengthInfo =  [  [ 10, 9, 8, 8 ],  [ 12, 11, 16, 10 ],  [ 14, 13, 16, 12 ] ];

qrcode.callback = null;

qrcode.vidSuccess = function (stream) 
{
    qrcode.localstream = stream;
    if(qrcode.webkit)
        qrcode.video.src = window.webkitURL.createObjectURL(stream);
    else
    if(qrcode.moz)
    {
        qrcode.video.mozSrcObject = stream;
        qrcode.video.play();
    }
    else
        qrcode.video.src = stream;
    
    qrcode.gUM=true;
    
    qrcode.canvas_qr2 = document.createElement('canvas');
    qrcode.canvas_qr2.id = "qr-canvas";
    qrcode.qrcontext2 = qrcode.canvas_qr2.getContext('2d');
    qrcode.canvas_qr2.width = qrcode.video.videoWidth;
    qrcode.canvas_qr2.height = qrcode.video.videoHeight;
    setTimeout(qrcode.captureToCanvas, 500);
}
        
qrcode.vidError = function(error)
{
    qrcode.gUM=false;
    return;
}

qrcode.captureToCanvas = function()
{
    if(qrcode.gUM)
    {
        try{
            if(qrcode.video.videoWidth == 0)
            {
                setTimeout(qrcode.captureToCanvas, 500);
                return;
            }
            else
            {
                qrcode.canvas_qr2.width = qrcode.video.videoWidth;
                qrcode.canvas_qr2.height = qrcode.video.videoHeight;
            }
            qrcode.qrcontext2.drawImage(qrcode.video,0,0);
            try{
                qrcode.decode();
            }
            catch(e){       
                console.log(e);
                setTimeout(qrcode.captureToCanvas, 500);
            };
        }
        catch(e){       
                console.log(e);
                setTimeout(qrcode.captureToCanvas, 500);
        };
    }
}

qrcode.setWebcam = function(videoId)
{
    let n=navigator;
    qrcode.video=document.getElementById(videoId);

    let options = true;
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
        n.getUserMedia({video: options, audio: false}, qrcode.vidSuccess, qrcode.vidError);
    else
    if(n.webkitGetUserMedia)
    {
        qrcode.webkit=true;
        n.webkitGetUserMedia({video:options, audio: false}, qrcode.vidSuccess, qrcode.vidError);
    }
    else
    if(n.mozGetUserMedia)
    {
        qrcode.moz=true;
        n.mozGetUserMedia({video: options, audio: false}, qrcode.vidSuccess, qrcode.vidError);
    }
}

qrcode.decode = function(src){
    
    if(arguments.length==0)
    {
        if(qrcode.canvas_qr2)
        {
            let canvas_qr = qrcode.canvas_qr2;
            let context = qrcode.qrcontext2;
        }	
        else
        {
            let canvas_qr = document.getElementById("qr-canvas");
            let context = canvas_qr.getContext('2d');
        }
        qrcode.width = canvas_qr.width;
        qrcode.height = canvas_qr.height;
        qrcode.imagedata = context.getImageData(0, 0, qrcode.width, qrcode.height);
        qrcode.result = qrcode.process(context);
        if(qrcode.callback!=null)
            qrcode.callback(qrcode.result);
        return qrcode.result;
    }
    else
    {
        let image = new Image();
        image.crossOrigin = "Anonymous";
        image.onload=function(){
            //var canvas_qr = document.getElementById("qr-canvas");
            let canvas_out = document.getElementById("out-canvas");
            if(canvas_out!=null)
            {
                let outctx = canvas_out.getContext('2d');
                outctx.clearRect(0, 0, 320, 240);
                outctx.drawImage(image, 0, 0, 320, 240);
            }

            let canvas_qr = document.createElement('canvas');
            let context = canvas_qr.getContext('2d');
            let nheight = image.height;
            let nwidth = image.width;
            if(image.width*image.height>qrcode.maxImgSize)
            {
                let ir = image.width / image.height;
                nheight = Math.sqrt(qrcode.maxImgSize/ir);
                nwidth=ir*nheight;
            }

            canvas_qr.width = nwidth;
            canvas_qr.height = nheight;
            
            context.drawImage(image, 0, 0, canvas_qr.width, canvas_qr.height );
            qrcode.width = canvas_qr.width;
            qrcode.height = canvas_qr.height;
            try{
                qrcode.imagedata = context.getImageData(0, 0, canvas_qr.width, canvas_qr.height);
            }catch(e){
                qrcode.result = "Cross domain image reading not supported in your browser! Save it to your computer then drag and drop the file!";
                if(qrcode.callback!=null)
                    qrcode.callback(qrcode.result);
                return;
            }
            
            try
            {
                qrcode.result = qrcode.process(context);
            }
            catch(e)
            {
                console.log(e);
                qrcode.result = "error decoding QR Code";
            }
            if(qrcode.callback!=null)
                qrcode.callback(qrcode.result);
        }
        image.onerror = function ()
        {
            if(qrcode.callback!=null) 
                qrcode.callback("Failed to load the image");
        }
        image.src = src;
    }
}

qrcode.isUrl = function(s)
{
    let regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regexp.test(s);
}

qrcode.decode_url = function (s)
{
  let escaped = "";
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

qrcode.decode_utf8 = function ( s )
{
    if(qrcode.isUrl(s))
        return qrcode.decode_url(s);
    else
        return s;
}

qrcode.process = function(ctx){
    
    let start = new Date().getTime();

    let image = qrcode.grayScaleToBitmap(qrcode.grayscale());
    //var image = qrcode.binarize(128);
    
    if(qrcode.debug)
    {
        for (let y = 0; y < qrcode.height; y++)
        {
            for (let x = 0; x < qrcode.width; x++)
            {
                let point = (x * 4) + (y * qrcode.width * 4);
                qrcode.imagedata.data[point] = image[x+y*qrcode.width]?0:0;
                qrcode.imagedata.data[point+1] = image[x+y*qrcode.width]?0:0;
                qrcode.imagedata.data[point+2] = image[x+y*qrcode.width]?255:0;
            }
        }
        ctx.putImageData(qrcode.imagedata, 0, 0);
    }
    
    //var finderPatternInfo = new FinderPatternFinder().findFinderPattern(image);
    
    let detector = new Detector(image);

    let qRCodeMatrix = detector.detect();
    
    if(qrcode.debug)
    {
        for (let y = 0; y < qRCodeMatrix.bits.Height; y++)
        {
            for (let x = 0; x < qRCodeMatrix.bits.Width; x++)
            {
                let point = (x * 4*2) + (y*2 * qrcode.width * 4);
                qrcode.imagedata.data[point] = qRCodeMatrix.bits.get_Renamed(x,y)?0:0;
                qrcode.imagedata.data[point+1] = qRCodeMatrix.bits.get_Renamed(x,y)?0:0;
                qrcode.imagedata.data[point+2] = qRCodeMatrix.bits.get_Renamed(x,y)?255:0;
            }
        }
        ctx.putImageData(qrcode.imagedata, 0, 0);
    }
    
    
    let reader = Decoder.decode(qRCodeMatrix.bits);
    let data = reader.DataByte;
    let str="";
    for(let i=0;i<data.length;i++)
    {
        for(let j=0;j<data[i].length;j++)
            str+=String.fromCharCode(data[i][j]);
    }
    
    let end = new Date().getTime();
    let time = end - start;
    console.log(time);
    
    return qrcode.decode_utf8(str);
    //alert("Time:" + time + " Code: "+str);
}

qrcode.getPixel = function(x,y){
    if (qrcode.width < x) {
        throw "point error";
    }
    if (qrcode.height < y) {
        throw "point error";
    }
    let point = (x * 4) + (y * qrcode.width * 4);
    let p = (qrcode.imagedata.data[point]*33 + qrcode.imagedata.data[point + 1]*34 + qrcode.imagedata.data[point + 2]*33)/100;
    return p;
}

qrcode.binarize = function(th){
    let ret = new Array(qrcode.width*qrcode.height);
    for (let y = 0; y < qrcode.height; y++)
    {
        for (let x = 0; x < qrcode.width; x++)
        {
            let gray = qrcode.getPixel(x, y);
            
            ret[x+y*qrcode.width] = gray<=th?true:false;
        }
    }
    return ret;
}

qrcode.getMiddleBrightnessPerArea=function(image)
{
    let numSqrtArea = 4;
    //obtain middle brightness((min + max) / 2) per area
    let areaWidth = Math.floor(qrcode.width / numSqrtArea);
    let areaHeight = Math.floor(qrcode.height / numSqrtArea);
    let minmax = new Array(numSqrtArea);
    for (let i = 0; i < numSqrtArea; i++)
    {
        minmax[i] = new Array(numSqrtArea);
        for (let i2 = 0; i2 < numSqrtArea; i2++)
        {
            minmax[i][i2] = new Array(0,0);
        }
    }
    for (let ay = 0; ay < numSqrtArea; ay++)
    {
        for (let ax = 0; ax < numSqrtArea; ax++)
        {
            minmax[ax][ay][0] = 0xFF;
            for (let dy = 0; dy < areaHeight; dy++)
            {
                for (let dx = 0; dx < areaWidth; dx++)
                {
                    let target = image[areaWidth * ax + dx+(areaHeight * ay + dy)*qrcode.width];
                    if (target < minmax[ax][ay][0])
                        minmax[ax][ay][0] = target;
                    if (target > minmax[ax][ay][1])
                        minmax[ax][ay][1] = target;
                }
            }
            //minmax[ax][ay][0] = (minmax[ax][ay][0] + minmax[ax][ay][1]) / 2;
        }
    }
    let middle = new Array(numSqrtArea);
    for (let i3 = 0; i3 < numSqrtArea; i3++)
    {
        middle[i3] = new Array(numSqrtArea);
    }
    for (let ay = 0; ay < numSqrtArea; ay++)
    {
        for (let ax = 0; ax < numSqrtArea; ax++)
        {
            middle[ax][ay] = Math.floor((minmax[ax][ay][0] + minmax[ax][ay][1]) / 2);
            //Console.out.print(middle[ax][ay] + ",");
        }
        //Console.out.println("");
    }
    //Console.out.println("");
    
    return middle;
}

qrcode.grayScaleToBitmap=function(grayScale)
{
    let middle = qrcode.getMiddleBrightnessPerArea(grayScale);
    let sqrtNumArea = middle.length;
    let areaWidth = Math.floor(qrcode.width / sqrtNumArea);
    let areaHeight = Math.floor(qrcode.height / sqrtNumArea);

    let buff = new ArrayBuffer(qrcode.width*qrcode.height);
    let bitmap = new Uint8Array(buff);

    //var bitmap = new Array(qrcode.height*qrcode.width);
    
    for (let ay = 0; ay < sqrtNumArea; ay++)
    {
        for (let ax = 0; ax < sqrtNumArea; ax++)
        {
            for (let dy = 0; dy < areaHeight; dy++)
            {
                for (let dx = 0; dx < areaWidth; dx++)
                {
                    bitmap[areaWidth * ax + dx+ (areaHeight * ay + dy)*qrcode.width] = (grayScale[areaWidth * ax + dx+ (areaHeight * ay + dy)*qrcode.width] < middle[ax][ay])?true:false;
                }
            }
        }
    }
    return bitmap;
}

qrcode.grayscale = function()
{
    let buff = new ArrayBuffer(qrcode.width*qrcode.height);
    let ret = new Uint8Array(buff);
    //var ret = new Array(qrcode.width*qrcode.height);
    
    for (let y = 0; y < qrcode.height; y++)
    {
        for (let x = 0; x < qrcode.width; x++)
        {
            let gray = qrcode.getPixel(x, y);
            
            ret[x+y*qrcode.width] = gray;
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

