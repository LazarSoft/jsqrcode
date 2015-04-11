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

Decode an image by it's URL or Data URI

	qr.decode(url or DataURL).

Decode from canvas with "qr-canvas" ID: 

	qrcode.decode()


# In the browser


Include the scripts in the following order:

    <script type="text/javascript" src="grid.js"></script>
    <script type="text/javascript" src="version.js"></script>
    <script type="text/javascript" src="detector.js"></script>
    <script type="text/javascript" src="formatinf.js"></script>
    <script type="text/javascript" src="errorlevel.js"></script>
    <script type="text/javascript" src="bitmat.js"></script>
    <script type="text/javascript" src="datablock.js"></script>
    <script type="text/javascript" src="bmparser.js"></script>
    <script type="text/javascript" src="datamask.js"></script>
    <script type="text/javascript" src="rsdecoder.js"></script>
    <script type="text/javascript" src="gf256poly.js"></script>
    <script type="text/javascript" src="gf256.js"></script>
    <script type="text/javascript" src="decoder.js"></script>
    <script type="text/javascript" src="qrcode.js"></script>
    <script type="text/javascript" src="findpat.js"></script>
    <script type="text/javascript" src="alignpat.js"></script>
    <script type="text/javascript" src="databr.js"></script>
