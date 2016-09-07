var expect = require('chai').expect;
var fs = require('fs');
var PNG = require('png-js');
var QrCode = require('../dist/index.js');

it('should work with basic image', function(done) {

  var c = fs.readFileSync(__dirname + '/image.png');
  var p = new PNG(c);

  p.decode(function(data) {

    var qr = new QrCode();
    qr.callback = function(result) {

      expect(result).to.equal('Test');
      done();
    };
    qr.decode(p, data);
  });
});

it('should work with imageData format', function(done) {

  var c = fs.readFileSync(__dirname + '/image.png');
  var p = new PNG(c);

  p.decode(function(data) {

    var qr = new QrCode();
    qr.callback = function(result) {

      expect(result).to.equal('Test');
      done();
    };
    qr.decode({
      height: p.height,
      width: p.width,
      data: data
    });
  });
});
