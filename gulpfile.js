'use strict';

/* VARIABLES
 ********************************************************/
var gulp = require('gulp');
    // Sass
var sass = require('gulp-sass');
var rename = require("gulp-rename");
var bourbon = require('node-bourbon');
var autoprefixer = require('gulp-autoprefixer');
    // Jade
var jade = require('gulp-jade');
var jadeInheritance = require('gulp-jade-inheritance');
var changed = require('gulp-changed');
var cached = require('gulp-cached');
var gulpif = require('gulp-if'); // set to (Build,Jade)
var filter = require('gulp-filter');
    // Tools
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var plumber = require('gulp-plumber'); // set to (Sass,Jade)
var wiredep = require('wiredep').stream;
    // Destination path
var appDir = 'app/';
var distDir = 'app/';
var buildDir = 'dist/';

/* PREPROCESSING
 ********************************************************/
// Sass
gulp.task('sass', function () {
  gulp.src(appDir+'sass/index.scss')
    .pipe(plumber())
    .pipe(sass({includePaths: require('node-bourbon').includePaths}).on('error', sass.logError))
    .pipe(autoprefixer({ browsers: ['last 25 versions'] }))
    .pipe(rename('theme.css'))
    .pipe(gulp.dest(appDir+'css/'))
    .pipe(reload({ stream:true }));
});
// Jade
gulp.task('jade', function() {
  return gulp.src(appDir+'jade/**/*.jade')
    .pipe(plumber())
    .pipe(changed(distDir, {extension: '.html'}))
    .pipe(gulpif(global.isWatching, cached('jade')))
    .pipe(jadeInheritance({basedir: appDir+'jade/'}))
    .pipe(filter(function (file) {
      return !/\/^_/.test(file.path) && !/^_/.test(file.relative);
    }))
    .pipe(jade({pretty: true}))
    .pipe(gulp.dest(distDir))
    .pipe(reload({ stream:true }));
});
gulp.task('setWatch', function() {
  global.isWatching = true;
});
// BrowserSync
gulp.task('serve', function() {
  browserSync.init({
    server: {baseDir: distDir},
    notify: false
  })
});
// Bower Wiredep
gulp.task('bower', function () {
  gulp.src(appDir+'*.html')
    .pipe(wiredep({
      directories: 'app/bower/'
    }))
    .pipe(gulp.dest(distDir))
    .pipe(reload({ stream:true }));
});

/* WATCH
 ********************************************************/
gulp.task('watch', ['serve','setWatch','jade'], function() {
  gulp.watch(appDir+'sass/**/*.+(scss|sass)', ['sass']);
  gulp.watch(appDir+'jade/**/*.jade', ['jade']);
  gulp.watch('bower.json', ['bower']);
});
// combination tasks
gulp.task('default', ['watch']);

/* BUILD TASKS
 ********************************************************/
// Variables build
var clean = require('gulp-clean');
var size = require('gulp-size');
var imagemin = require('gulp-imagemin');
var uglify = require('gulp-uglify');
var useref = require('gulp-useref');
var minifyCss = require('gulp-minify-css');

// Clean dir
gulp.task('clean', function () {
  return gulp.src('dist/', {read: false})
    .pipe(clean());
});
// Transfer the HTML, CSS, JS into dist
gulp.task('useref', function () {
  var assets = useref.assets();
  return gulp.src('app/*.html')
    .pipe(assets)
    .pipe(gulpif('*.js', uglify()))
    .pipe(gulpif('*.css', minifyCss({compatibility: 'ie8'})))
    .pipe(assets.restore())
    .pipe(useref())
    .pipe(gulp.dest('dist/'));
});
// Transferring Fonts
gulp.task('fonts', function () {
  gulp.src('app/fonts/**/*')
    .pipe(gulp.dest('dist/fonts/'));
});
// Transferring and compress img
gulp.task('img', function () {
  return gulp.src('app/images/**/*')
    .pipe(imagemin({
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest('dist/images/'));
});
// We transfer the remaining files (.ico, .htaccess, etc ...)
gulp.task('extras', function () {
  return gulp.src([
    'app/.*',
    'app/*.*',
    '!app/*.html',
    // dop custom files
    'app/**/theme.js',
    'app/**/custom.js',
    'app/**/custom.css'
  ]).pipe(gulp.dest('dist/'))
});

// Build folder DIST
gulp.task('dist', ['useref','img','fonts','extras'], function () {
  return gulp.src('dist/**/*').pipe(size({title: 'build'}))
});
// Build folder DIST (only after compiling Jade)
gulp.task('build', ['clean'], function () {
  gulp.start('dist')
});
