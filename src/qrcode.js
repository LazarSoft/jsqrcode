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


QrCode= function ()
  {
  	this.imagedata = null;
	this.width = 0;
	this.height = 0;
	this.qrCodeSymbol = null;
	this.debug = false;

this.sizeOfDataLengthInfo =  [  [ 10, 9, 8, 8 ],  [ 12, 11, 16, 10 ],  [ 14, 13, 16, 12 ] ];

this.callback = null;

this.decode = function(src,data){
	
	if(arguments.length==0)
	{
		var canvas_qr = document.getElementById("qr-canvas");
		var context = canvas_qr.getContext('2d');
		this.width = canvas_qr.width;
		this.height = canvas_qr.height;
		this.imagedata = context.getImageData(0, 0, this.width, this.height);
        // this.result = this.process(context);
        if(this.callback!=null)
            this.callback(this.result);
		return this.result;
	}
	else if (src.width!=undefined) {

		this.width=src.width
		this.height=src.height
		this.imagedata={"data":data}
		// this.imagedata.data=[]
		// this.imagedata.data=data
		this.imagedata.width=src.width
		this.imagedata.height=src.height


			this.result = this.process(null);

		if(this.callback!=null)
            this.callback(this.result);
	}
	else
	{
		var image = new Image();
		var _this=this
		image.onload=function(){
			//var canvas_qr = document.getElementById("qr-canvas");
			var canvas_qr = document.createElement('canvas');
			var context = canvas_qr.getContext('2d');
			var canvas_out = document.getElementById("out-canvas");
			

			body=document.getElementsByTagName('body')[0]
			

			
			if(canvas_out!=null)
            {
                var outctx = canvas_out.getContext('2d');
                outctx.clearRect(0, 0, 320, 240);
				outctx.drawImage(image, 0, 0, 320, 240);
            }
			canvas_qr.width = image.width;
			canvas_qr.height = image.height;
            context.drawImage(image, 0, 0);
			_this.width = image.width;
			_this.height = image.height;
			try{
				_this.imagedata = context.getImageData(0, 0, image.width, image.height);
			}catch(e){
				_this.result = "Cross domain image reading not supported in your browser! Save it to your computer then drag and drop the file!";
				if(_this.callback!=null)
					_this.callback(_this.result);
				return;
			}
			
// _this.result=_this.process(context)

            try
            {
            	window.context=context
                _this.result = _this.process(context);
            }
            catch(e)
            {
                _this.result = "error decoding QR Code:"+e;
            }
			if(_this.callback!=null)
			{
				_this.callback(_this.result);
			}
				
		}
		image.src = src;
	}
}

this.decode_utf8 = function ( s )
{
  return decodeURIComponent( escape( s ) );
}

this.process = function(ctx){
	
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
	
	//var finderPatternInfo = new FinderPatternFinder().findFinderPattern(image);
	
	var detector = new Detector(image,this);

	var qRCodeMatrix = detector.detect();
	
	/*for (var y = 0; y < qRCodeMatrix.bits.Height; y++)
	{
		for (var x = 0; x < qRCodeMatrix.bits.Width; x++)
		{
			var point = (x * 4*2) + (y*2 * this.width * 4);
			this.imagedata.data[point] = qRCodeMatrix.bits.get_Renamed(x,y)?0:0;
			this.imagedata.data[point+1] = qRCodeMatrix.bits.get_Renamed(x,y)?0:0;
			this.imagedata.data[point+2] = qRCodeMatrix.bits.get_Renamed(x,y)?255:0;
		}
	}*/
    if(this.debug)
        ctx.putImageData(this.imagedata, 0, 0);
	
	var reader = Decoder.decode(qRCodeMatrix.bits,this);
	var data = reader.DataByte;
	var str="";
	for(var i=0;i<data.length;i++)
	{
		for(var j=0;j<data[i].length;j++)
			str+=String.fromCharCode(data[i][j]);
	}
	
	var end = new Date().getTime();
	var time = end - start;
    
	return this.decode_utf8(str);
	//alert("Time:" + time + " Code: "+str);
}

this.getPixel = function(x,y){
	if (this.width < x) {
		throw "point error";
	}
	if (this.height < y) {
		throw "point error";
	}
	point = (x * 4) + (y * this.width * 4);
	p = (this.imagedata.data[point]*33 + this.imagedata.data[point + 1]*34 + this.imagedata.data[point + 2]*33)/100;
	return p;
}

this.binarize = function(th){
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

this.getMiddleBrightnessPerArea=function(image)
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

this.grayScaleToBitmap=function(grayScale)
{
	var middle = this.getMiddleBrightnessPerArea(grayScale);
	var sqrtNumArea = middle.length;
	var areaWidth = Math.floor(this.width / sqrtNumArea);
	var areaHeight = Math.floor(this.height / sqrtNumArea);
	var bitmap = new Array(this.height*this.width);
	
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

this.grayscale = function(){
	var ret = new Array(this.width*this.height);
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

  }

function URShift( number,  bits)
{
	if (number >= 0)
		return number >> bits;
	else
		return (number >> bits) + (2 << ~bits);
}


Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};
