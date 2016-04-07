expect =require('chai').expect;
fs = require('fs');
PNG = require('png-js');
QrCode = require('../dist/index.js');

it('should work with basic image', function(done) {

    c = fs.readFileSync(__dirname + '/image.png');
    p = new PNG(c);

    p.decode(function(data) {

        qr = new QrCode();
        qr.callback = function(result) {

            expect(result).to.equal('Test');
            done();
        }
        qr.decode(p, data);
    });
});

it('should work with imageData format', function(done) {

    c = fs.readFileSync(__dirname + '/image.png');
    p = new PNG(c);

    p.decode(function(data) {

        qr = new QrCode();
        qr.callback = function(result) {

            expect(result).to.equal('Test');
            done();
        }
        qr.decode({
            height: p.height,
            width: p.width,
            data: data
        });
    });
});
