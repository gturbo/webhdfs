var gulp = require('gulp'),
    jade = require('gulp-jade'),
    connect = require('gulp-connect'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    gutil = require('gulp-util');

var jsSources = ['public/javascripts/*.js'],
    jadeSources = ['src/templates/*.jade'],
    outputDir = 'routes/generated';
var server = require('gulp-express');




gulp.task('server', function () {
    // Start the server at the beginning of the task
    server.run(['app.js']);
    // Restart the server when file changes
    gulp.watch(['routes/**/*.html'], server.run);
    gulp.watch(['app.js', 'routes/**/*.js', 'routes/**/*.jade'], [server.run]);
});


var testFiles = [
    'public/javascripts/zepto.js',
    'public/javascripts/*.js',
    'public/javascripts/models/*.js',
    'test/*.js'
];

// test in client

gulp.task('test', function() {
    gulp.src(testFiles)
        .pipe(karma({
            configFile: 'test/karma.conf.js',
            action: 'watch'
        }));
});



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

var karma = require('gulp-karma');

