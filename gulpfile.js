'use strict';

/* VARIABLES
 ********************************************************/
var gulp = require('gulp');
    // Sass
var sass = require('gulp-sass');
var rename = require("gulp-rename");
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
    .pipe(sass().on('error', sass.logError))
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
  // Variables
  var minifyCss = require('gulp-minify-css');
  var cache = require('gulp-cache');
  var imagemin = require('gulp-imagemin');
  var useref = require('gulp-useref');
  var uglify = require('gulp-uglify');
  var del = require('del');
  var runSequence = require('run-sequence');
  var uncss = require('gulp-uncss');

  // CSS и JavaScript
  gulp.task('html', function () {
    return gulp.src(appDir+'*.html')
    .pipe(useref())
    .pipe(gulpif('*.js', uglify()))
    .pipe(gulpif('*.css', minifyCss()))
    .pipe(gulp.dest(buildDir));
  });

  // Копируем постоянные файлы в dist
  gulp.task('htac', function() {
    return gulp.src(appDir+'.htaccess')
    .pipe(gulp.dest(buildDir))
  });
  gulp.task('ico', function() {
    return gulp.src(appDir+'favicon.ico')
    .pipe(gulp.dest(buildDir))
  });
  gulp.task('custom:css', function() {
    return gulp.src(appDir+'css/custom.css')
    .pipe(gulp.dest(buildDir+'css'))
  });
  gulp.task('custom:js', function() {
    return gulp.src(appDir+'js/custom.js')
    .pipe(gulp.dest(buildDir+'js'))
  });
  gulp.task('theme:js', function() {
    return gulp.src(appDir+'js/theme.js')
    .pipe(gulp.dest(buildDir+'js'))
  });

  // Копируем шрифты в dist
  gulp.task('fonts', function() {
    return gulp.src(appDir+'fonts/**/*')
    .pipe(gulp.dest(buildDir+'fonts'))
  });

  // Оптимизация изображений
  gulp.task('img', function(){
    return gulp.src(appDir+'plagins/**/*.+(png|jpg|gif|svg)')
    .pipe(imagemin({ interlaced: true }))
    .pipe(gulp.dest(buildDir+'images'))
  });
  gulp.task('clean:not', function(callback){
    del([
      buildDir+'**/*',
      '!dist/images', '!dist/images/**/*',
      '!dist/fonts', '!dist/fonts/**/*'
    ], callback)
  });

  // Remove unused folders & files
  gulp.task('clean', function(cb){
    del(['dist'], cb);
  });

  // DOP
  // Удалит неиспользуемые CSS селекторы
  gulp.task('un:css', function () {
    return gulp.src(appDir+'css/theme.css')
    .pipe(uncss({
      html: [buildDir+'*.html']
    }))
    .pipe(minifyCss())
    .pipe(rename({suffix:'.maxmin'}))
    .pipe(gulp.dest(buildDir+'css'));
  });

  // Build production site
  gulp.task('dist', function(cb){
    runSequence('html','theme:js', cb);
  });
  gulp.task('dist:all', function(cb){
    runSequence('clean', ['html','htac','ico','custom:css','custom:js','theme:js','fonts','img'], cb);
  });
  // Build production site ! - UN:CSS - !
  // gulp.task('dist', function(cb){
  //   runSequence('clean:not',['html','custom:css','custom:js'],'un:css', cb);
  // });
  // gulp.task('dist:all', function(cb){
  //   runSequence('clean',['html','htac','ico','custom:css','custom:js','fonts','img'],'un:css', cb);
  // });
