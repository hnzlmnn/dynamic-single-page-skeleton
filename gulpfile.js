'use strict';

var gulp          = require('gulp');
var path          = require('path');
var del           = require('del');
var runSequence   = require('run-sequence');
var compass       = require('gulp-compass');
var browserSync   = require('browser-sync');
var reload        = browserSync.reload;
var rename        = require("gulp-rename");
var concat        = require('gulp-concat');
var merge         = require('gulp-merge');
var gulpUtil      = require('gulp-util');
var useref        = require('gulp-useref');
var gulpif        = require('gulp-if');
var htmlmin       = require('gulp-htmlmin');
var jshint        = require('gulp-jshint');
var changed       = require('gulp-changed');
var preprocess    = require('gulp-preprocess');

//js
var uglify        = require('gulp-uglify');

//css
var cssnano       = require('gulp-cssnano');
var sourcemaps    = require('gulp-sourcemaps');
var autoprefixer  = require('gulp-autoprefixer');

var fs            = require('fs');

/**
 * module needs to export an object containing the configuration
**/
var configfile  = "appconfig.js";
var config        = {};
try {
  config = require("./" + configfile);
} catch(e) {
  console.error("Couldn't load settings! Please provide a valid nodejs module file with the name " + configfile);
}

var AUTOPREFIXER_BROWSERS = [
  "Android 2.3",
  "Android >= 4",
  "Chrome >= 20",
  "Firefox >= 24",
  "Explorer >= 8",
  "iOS >= 6",
  "Opera >= 12",
  "Safari >= 6"
];

var DIST = 'dist';
var dist = function(subpath) {
  return !subpath ? DIST : path.join(DIST, subpath);
};

var TEMP = '.tmp';
var temp = function(subpath) {
  return !subpath ? TEMP : path.join(TEMP, subpath);
};

var handleError = function(err) {
  console.log(err.toString());
  this.emit('end');
};

gulp.task('scripts', ['concatjs'], function() {
  return gulp.src(temp('js/hnzlmnn.js'))
    .pipe(sourcemaps.init())
    .pipe(uglify().on('error', handleError))
    .pipe(sourcemaps.write('.'))
    .pipe(rename({
      suffix: ".min",
    }))
    .pipe(gulp.dest(dist('js')));
});

gulp.task('concatjs', ['lint'], function() {
  var g = gulp.src([
      'bower_components/modernizr/modernizr.js',
      'bower_components/jquery/dist/jquery.js',
      'bower_components/bootstrap-sass/assets/javascripts/bootstrap.js',
      'bower_components/sightglass/index.js',
      'bower_components/rivets/dist/rivets.js',
      'app/js/**/*.js'
    ]);
  if (config.preprocess) {
    g = g.pipe(preprocess(config.preprocess));
  }
  return g.pipe(concat('hnzlmnn.js'))
    .pipe(gulp.dest(temp('js')));
});

gulp.task('lint', function() {
  return gulp.src(['app/js/**/*.js', '!app/js/_vendor/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('unix'));
});

gulp.task('styles', ['compass'], function(cb) {
  gulpUtil.log(temp('sass/**/*.css'));
  runSequence(['concatcss'], ['minify'], cb);
});

gulp.task('concatcss', function() {
  return gulp.src(['app/css/**/*.css', temp('sass/**/*.css')])
    .pipe(concat('hnzlmnn.css'))
    .pipe(gulp.dest(temp('css')));
});

gulp.task('minify', function() {
  return gulp.src(temp('css/hnzlmnn.css'))
    .pipe(sourcemaps.init())
    .pipe(cssnano())
    .pipe(sourcemaps.write('.'))
    .pipe(rename({
      suffix: ".min",
    }))
    .pipe(gulp.dest(dist('css')));
});

gulp.task('compass', function() {
  return gulp.src('app/sass/main.scss')
  .pipe(compass({
    project: path.join(__dirname),
    css: temp('sass'),
    sass: 'app/sass'
  }));
});

gulp.task('html:dist', function () {
  var g = gulp.src('app/*.html');
  if (config.preprocess) {
    g = g.pipe(preprocess(config.preprocess));
  }
  return g.pipe(useref({ noAssets: true }))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(dist()));
});

gulp.task('html:serve', function () {
  var g = gulp.src('app/*.html');
  if (config.preprocess) {
    g = g.pipe(preprocess(config.preprocess));
  }
  return g.pipe(gulp.dest(temp()));
});

gulp.task('fonts', function() {
  return gulp.src([
      'bower_components/bootstrap-sass/assets/fonts/bootstrap/*',
    ], {
      dot: true
    })
    .pipe(changed(temp("fonts")))
    .pipe(gulp.dest(temp("fonts")));
});

gulp.task('copy', function() {
  return gulp.src([
      temp() + '/**/*',
      'app/**/*',
      '!app/index.html',
      '!app/{js,css,sass}',
      '!app/{js,css,sass}/**/*',
      '!**/.DS_Store'
    ], {
      dot: true
    }).pipe(gulp.dest(dist()));
});

gulp.task('clean', function() {
  return del([temp(), dist()]);
});

gulp.task('browsersync', function(cb) {
  browserSync({
    port: 5000,
    notify: false,
    logPrefix: config.logprefix,
    snippetOptions: {},
    // https: true,
    server: {
      baseDir: [temp(), 'app']
    }
  });
  return cb();
});

gulp.task('dist', ['clean'], function(cb) {
  runSequence(['scripts', 'styles', 'fonts'], ['html:dist'], ['copy'], cb);
});

gulp.task('serve', ['clean'], function(cb) {
  gulp.watch("app/sass/**/*.scss", ['styles', reload]);
  gulp.watch("app/**/*.html", ['html:serve', reload]);
  gulp.watch("app/js/**/*.js", ['scripts', reload]);
  gulp.watch("app/css/**/*.css", ['styles', reload]);
  gulp.watch("app/img/**/*", reload);
  return runSequence(['html:serve', 'styles', 'scripts', 'fonts'], 'browsersync', cb);
});

gulp.task('default', ['dist'], function(cb) {
  return cb();
});
