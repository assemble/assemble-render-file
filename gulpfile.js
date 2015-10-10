var gulp = require('gulp');
var mocha = require('gulp-mocha');
var stylish = require('jshint-stylish');
var istanbul = require('gulp-istanbul');
var jshint = require('gulp-jshint');

gulp.task('coverage', function () {
  return gulp.src('index.js')
    .pipe(istanbul())
    .pipe(istanbul.hookRequire());
});

gulp.task('mocha', ['coverage'], function () {
  return gulp.src('test/*.js')
    .pipe(mocha({reporter: 'spec'}))
    .pipe(istanbul.writeReports({
      reporters: [ 'text' ],
      reportOpts: {dir: 'coverage', file: 'summary.txt'}
    }))
});

gulp.task('jshint', function () {
  return gulp.src('index.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
});

gulp.task('default', ['mocha', 'jshint']);
