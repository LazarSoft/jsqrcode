expect =require('chai').expect;
fs=require('fs');
PNG=require('png-js');

it('should work with basic image',function(done){
    c=fs.readFileSync(__dirname+'/image.png');
    p=new PNG(c);
    p.decode(function(data){
      QrCode=require('../index.js');
      qr=new QrCode();
      qr.callback= function(result){
         expect(result).to.equal('Test');
         done();
      }
      qr.decode(p,data)
    });
})
