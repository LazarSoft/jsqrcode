var gulp = require('gulp');
var watch = require('gulp-watch');
var concat = require('gulp-concat');
var webpack = require('webpack');

var path = [
  'grid.js',
  'version.js',
  'detector.js',
  'formatinf.js',
  'errorlevel.js',
  'bitmat.js',
  'datablock.js',
  'bmparser.js',
  'datamask.js',
  'rsdecoder.js',
  'gf256poly.js',
  'gf256.js',
  'decoder.js',
  'qrcode.js',
  'findpat.js',
  'alignpat.js',
  'databr.js',
  'qrcode.node.js'
].map(function(p) {
  return 'src/' + p;
});

var compile = function() {
  return gulp.src(path)
    .pipe(concat('index.js'))
    .pipe(gulp.dest('dist'));
};

gulp.task('watch', function() {
  gulp.src(path)
  .pipe(watch(function(files) {
    compile();
  }));
});

gulp.task('compile', function() {
  return compile();
});

gulp.task('compile-browser', ['compile'], function(cb) {
  webpack({
    entry: './dist/index.js',
    output: {
      path: 'dist/',
      filename: 'browser.js'
    },
    plugins: [
      new webpack.optimize.UglifyJsPlugin()
    ]
  }, function(err, stats) {
    if (err) {
      console.log(err);
    }

    cb();
  });
});

gulp.task('default', ['watch']);
