var gulp = require('gulp');
var watch= require('gulp-watch');
var concat= require('gulp-concat');

var path=[
  "grid.js",
  "version.js",
  "detector.js",
  "formatinf.js",
  "errorlevel.js",
  "bitmat.js",
  "datablock.js",
  "bmparser.js",
  "datamask.js",
  "rsdecoder.js",
  "gf256poly.js",
  "gf256.js",
  "decoder.js",
  "qrcode.js",
  "findpat.js",
  "alignpat.js",
  "databr.js",
  "qrcode.node.js"
];

path.forEach(function(p,i){
  path[i]="src/"+p;
});

gulp.task('watch', function () {
  gulp.src(path)
  .pipe(watch(function(files) {
    gulp.src(path)
    .pipe(concat('index.js'))
    .pipe(gulp.dest('.'));
  }));
});

gulp.task('compile',function(){
  gulp.src(path)
  .pipe(concat('index.js'))
  .pipe(gulp.dest('.'));
});

gulp.task('default',['watch']);
