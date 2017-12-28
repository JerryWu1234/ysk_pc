var gulp = require('gulp');
var riot = require('gulp-riot');
var uglify = require('gulp-uglify');
var watch = require('gulp-watch');
var concat = require('gulp-concat');

var components =
    "components/*.html";

function dist() {
    gulp.src(components)
        .pipe(riot())
        .pipe(uglify())
        .pipe(concat('riot_components.js'))
        .pipe(gulp.dest('dist'));
    console.log("build success!")
}

gulp.task('dist', dist);

gulp.task('dev', function () {
    return watch(components, function () {
        dist()
    })
});
