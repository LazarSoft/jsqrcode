var gulp = require('gulp');
var watch= require('gulp-watch');
var concat= require('gulp-concat');

gulp.task('watch', function () {
    path="src/*.js"
	gulp.src(path)
		.pipe(watch(function(files) {
            gulp.src(path)
            .pipe(concat('index.js'))
            .pipe(gulp.dest('.'))
		}));
});

gulp.task('default',['watch']);
