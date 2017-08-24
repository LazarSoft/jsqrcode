JavaScript QRCode reader for HTML5 enabled browser.
===================================================

This was started as a port of Lazarsoft’s qrcode reader.

It is a maintained fork, so feel free to open issues or PR !

Installation
============

```
npm install jsqrcode-modules
```

Usage
=====

```
var qrcode = require('jsqrcode-modules');
```

Set Webcam

```
qrcode.setWebcame(element_id)
```

Set its callback to a custom function:

```
qrcode.callback = function(result) {
  console.log(result)
}
```
