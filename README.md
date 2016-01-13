# JavaScript QRCode reader for HTML5 enabled browser.

This is a port of Lazarsoft’s qrcode reader

[![Build Status](https://travis-ci.org/edi9999/jsqrcode.svg?branch=master&style=flat)](https://travis-ci.org/edi9999/jsqrcode)

# Installation

    npm install qrcode-reader

# Usage

    QrCode=require(‘qrcode-reader’);

Create a new instance of QrCode:

    qr= new QrCode();

Set it's callback to a custom function

    qr.callback= function(result){alert(result)}

Decode an image by it's URL or Data URI:

    qr.decode(url or DataURL);

Decode an image by context.getImageData:
Works with [web workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers).

    var context = canvas.getContext("2d");
    var data = context.getImageData(0, 0, width, height);

    qr.decode(data);

Decode from canvas with "qr-canvas" ID:

    qr.decode()

# Building it yourself

If you want, you can build the script yourself.

First clone the repository, then from the directory of this repository, do :

    npm install
    gulp compile

You will have one jsfile called `index.js` that you can run from node.

You can then run the tests by running

    npm test

# Make it work in the browser

After building yourself the script index.js, you can do :

    npm install --global browserify
    browserify -o qrcode.js -s QrCode index.js

This way if you do in your HTML :

    <script src="qrcode.js"></script>
    you will have access to the global variable `QrCode`
