var gulp = require('gulp'),
    jade = require('gulp-jade'),
    connect = require('gulp-connect'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    gutil = require('gulp-util');

var jsSources = ['public/javascripts/*.js'],
    jadeSources = ['src/templates/*.jade'],
    outputDir = 'routes/generated';




gulp.task('jade', function() {
    gulp.src(jadeSources)
        .pipe(jade({locals: {
            'title':'webhdfs home',
            "path":"/user/biblumix/input"
        }}))
        .on('error', gutil.log)
        .pipe(gulp.dest(outputDir))
        .pipe(connect.reload())
});

gulp.task('js', function() {
    gulp.src(jsSources)
        .pipe(uglify())
        .pipe(concat('script.js'))
        .pipe(gulp.dest(outputDir))
        .pipe(connect.reload())
});

gulp.task('watch', function() {
    gulp.watch(jsSources, ['js']);
    gulp.watch(jadeSources, ['jade']);
});

gulp.task('default', ['js', 'jade', 'watch']);