'use strict';

/* VARIABLES
 ********************************************************/
var gulp = require('gulp');
    // Sass
var sass = require('gulp-sass');
var rename = require("gulp-rename");
var bourbon = require('node-bourbon');
var minifyCss = require('gulp-minify-css'); // set to (Sass,Build)
var autoprefixer = require('gulp-autoprefixer');
    // Jade
var jade = require('gulp-jade');
var jadeInheritance = require('gulp-jade-inheritance');
var prettify = require('gulp-prettify');
var changed = require('gulp-changed');
var cached = require('gulp-cached');
var gulpif = require('gulp-if'); // set to (Jade,Build)
var filter = require('gulp-filter');
    // Tools
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var plumber = require('gulp-plumber'); // set to (Sass,Jade)
var wiredep = require('wiredep').stream;
    // Destination path
var appDir = 'app/';
var buildDir = 'dist/';

/* PREPROCESSING
 ********************************************************/
  // Sass
  gulp.task('sass', function () {
    gulp.src(appDir+'sass/index.scss')
      .pipe(plumber())
      .pipe(sass({includePaths: require('node-bourbon').includePaths}).on('error', sass.logError))
      .pipe(autoprefixer({ browsers: ['last 25 versions'] }))
      .pipe(rename('theme.min.css'))
      .pipe(minifyCss({compatibility: 'ie8'}))
      .pipe(gulp.dest(appDir+'css/'))
      .pipe(reload({ stream:true }));
  });
  // Jade
  gulp.task('jade', function() {
    return gulp.src(appDir+'jade/**/*.jade')
      .pipe(changed(appDir, {extension: '.html'}))
      .pipe(gulpif(global.isWatching, cached('jade')))
      .pipe(jadeInheritance({basedir: appDir+'jade/'}))
      .pipe(filter(function (file) {
        return !/\/^_/.test(file.path) && !/^_/.test(file.relative);
      }))
      .pipe(plumber())
      .pipe(jade({pretty: true}))
      .pipe(prettify({indent_size: 2}))
      .pipe(gulp.dest(appDir))
      .pipe(reload({ stream:true }));
  });
  gulp.task('setWatch', function() {
    global.isWatching = true;
  });
  // BrowserSync
  gulp.task('serve', ['setWatch','jade','sass','bower'], function() {
    browserSync.init({
      server: {baseDir: appDir},
      notify: false
    })
  });
  // Bower Wiredep
  gulp.task('bower', function () {
    gulp.src([
        appDir+'jade/**/_styles.jade',
        appDir+'jade/**/_scripts.jade'
      ])
      .pipe(wiredep({
        ignorePath: /^(\.\.\/)*\.\./
      }))
      .pipe(gulp.dest(appDir+'jade/'))
  });

/* WATCH
 ********************************************************/
gulp.task('watch', function() {
  gulp.watch(appDir+'sass/**/*.+(scss|sass)', ['sass']);
  gulp.watch(appDir+'jade/**/*.jade', ['jade']);
  gulp.watch('bower.json', ['bower']);
  gulp.watch([
    appDir+'js/*.js'
  ]).on('change', reload);
});
// combination tasks
gulp.task('default', ['serve','watch']);


/* BUILD TASKS
 ********************************************************/
// Variables build
var clean = require('gulp-clean');
var size = require('gulp-size');
var imagemin = require('gulp-imagemin');
var uglify = require('gulp-uglify');
var useref = require('gulp-useref');

// Clean dir
gulp.task('clean', function () {
  return gulp.src(buildDir, {read: false})
    .pipe(clean());
});
// Transfer the HTML, CSS, JS into dist
gulp.task('useref', function () {
  var assets = useref.assets();
  return gulp.src(appDir+'*.html')
    .pipe(assets)
    .pipe(gulpif('*.js', uglify()))
    .pipe(gulpif('*.css', minifyCss({compatibility: 'ie8'})))
    .pipe(assets.restore())
    .pipe(useref())
    .pipe(gulp.dest(buildDir));
});
// Transferring Fonts
gulp.task('fonts', function () {
  gulp.src(appDir+'fonts/**/*')
    .pipe(gulp.dest(buildDir+'fonts/'));
});
// Transferring and compress img
gulp.task('img', function () {
  return gulp.src(appDir+'images/**/*')
    .pipe(imagemin({
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest(buildDir+'images/'));
});
// We transfer the remaining files (.ico, .htaccess, etc ...)
gulp.task('extras', function () {
  return gulp.src([
    appDir+'.*',
    appDir+'*.*',
    '!'+appDir+'*.html',
    // dop custom files
    appDir+'**/theme.js',
    appDir+'**/custom.js',
    appDir+'**/custom.css'
  ]).pipe(gulp.dest(buildDir))
});

// Build folder DIST
gulp.task('dist', ['useref','img','fonts','extras'], function () {
  return gulp.src(buildDir+'**/*').pipe(size({title: 'build'}))
});
// Build folder DIST (only after compiling Jade)
gulp.task('build', ['clean'], function () {
  gulp.start('dist')
});


/* DEPLOOY
 ********************************************************/
var runSequence = require('run-sequence');
var gutil = require('gulp-util');
var ftp = require('vinyl-ftp');
var dirProject = '02/test1';

gulp.task('http', function () {
  var conn = ftp.create({
    host:     '92.53.96.55',
    user:     'podolskiis',
    password: '**********',
    parallel: 10,
    log: gutil.log
  });
  var globs = [
    buildDir+'**/*'
  ];
  return gulp.src(globs, {base: buildDir, buffer: false})
    .pipe(conn.dest(
      '/activ.sergeypodolsky.ru/public_html/work/2016/'+dirProject
    ));
});

/* BUILD and DEPLOOY  in the loop
 ********************************************************/
gulp.task('build:http', function(cb) {
  runSequence(
    'clean',
    ['useref','img','fonts','extras'],
    'http',
    cb);
});