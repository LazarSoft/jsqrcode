# JavaScript QRCode reader for HTML5 enabled browser.

This is a port of Lazarsoft’s qrcode reader

[![Build Status](https://travis-ci.org/edi9999/jsqrcode.svg?branch=master&style=flat)](https://travis-ci.org/edi9999/jsqrcode)

# Installation

    npm install qrcode-reader

# Usage

    var QrCode = require('qrcode-reader');

Create a new instance of QrCode:

    var qr = new QrCode();

Set its callback to a custom function:

    qr.callback = function(result) { console.log(result) }

Decode an image by its URL or Data URI:

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

First clone the repository, then from the directory of this repository, do:

    npm install

It will automatically run `npm run compile` after installing and you will have one JavaScript file called `dist/index.js` that you can run from node.

To manually rebuild:

    npm run compile

To run the tests:

    npm test

# Make it work in the browser

Send `dist/index.js` through webpack and create `dist/qrcode.js`:

    npm run compile-browser

This way, you will have access to the global variable `QrCode` if you do the following in your HTML:

    <script src="dist/qrcode.js"></script>

See [examples/browser/index.html](examples/browser/index.html) for a full example.