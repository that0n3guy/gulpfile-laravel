/////////////////////////////////
// TO use:
//      install gulp globally: sudo npm install -g gulp
//      install locally: npm install --save-dev gulp gulp-clean gulp-flatten gulp-continuous-concat gulp-plumber gulp-watch gulp-scss gulp-util gulp-less gulp-autoprefixer gulp-minify-css gulp-concat gulp-uglify gulp-livereload gulp-notify tiny-lr

//      type "gulp" for production (minified) stuff
//      type "gulp dev" for dev stuff with watching enabled and livereload (https://github.com/vohof/gulp-livereload)
//      type "gulp clean" to delete/clean out your target folders.  Sometimes this is easier than just physicially deleteing the target folders.

// Features:
//      Consistant output of plugin.css so it can easily be included weather minified or not
//      support for fonts
//      support for images... change that section below to do w/ them as you please.
//      watch and livereload support for dev.

// Some references:
//      http://www.abishek.me/using-gulpjs-with-your-laravel-application/
//      http://webdevtuts.co.uk/getting-started-with-gulp-js/
/////////////////////////////////

//Note: remember "watch" does not work with new/deleted files.  You just have to re-run "gulp dev"

/////////////////////////////////
// Stuff you may want to edit:
////////////////////////////////
// Main source and target directories
//   These are currently set for use with laravel.  See my example source folder structure  here: http://screencast.com/t/XWeafjr4Q4l
var assetsource = 'app/assets';
var assettarget = 'public/build'

// specify source and targets for the sections below.
//   This is just to simplify editing.  It can all be edited here instead of in each function below
var source = {
    scss: [assetsource + '/scss/**/*.{css,scss}'],
    js: [assetsource + '/js/**/*.js'],
    //plugins
    pluginscss: [assetsource + '/plugins/**/*.{css,scss}'],
    pluginjs: [assetsource + '/plugins/jquery/*.js', assetsource + '/plugins/**/*.js'],
    pluginfonts: [assetsource + '/plugins/**/*.{ttf,woff,eof,svg}'],

    //bootstrap
    bootstrapjs: [assetsource + '/bootstrap/javascripts/bootstrap/*.js'],
    bootstrapscss: [assetsource + '/bootstrap/stylesheets/bootstrap.scss'],
    bootstrapfonts: [assetsource + '/bootstrap/fonts/bootstrap/*'],
    // "static" stuff
    images: [assetsource + '/images/**/*'],
    fonts: [assetsource + '/fonts/**/*']
};
var target = {
    scss: assettarget + '/css',
    js: assettarget + '/js',
    //plugins
    plugincss: assettarget + '/plugins/css',
    pluginscss: assettarget + '/plugins/css',
    pluginjs: assettarget + '/plugins/js',
    pluginfonts: assettarget + '/plugins/fonts',
    //bootstrap
    bootstrapjs: assettarget + '/bootstrap/javascripts',
    bootstrapscss: assettarget + '/bootstrap/stylesheets',
    bootstrapfonts: assettarget + '/bootstrap/fonts',
    // "static" stuff
    images: assettarget + '/images',
    fonts: assettarget + '/fonts'
};

///////////////////////////////////
// Stuff you may not want to edit
///////////////////////////////////

var gulp = require('gulp');
var gutil = require('gulp-util');
var lr = require('tiny-lr');
var watch = require('gulp-watch');
var plumber = require('gulp-plumber');
var clean = require('gulp-clean');
var flatten = require('gulp-flatten');

// Include CSS components
//   to use less for Compilation... just find/replace "scss" to "less" and "npm install --save-dev gulp-less" (not tested.. but should work)
var scss = require('gulp-sass')
var autoprefixer = require('gulp-autoprefixer');
var minifycss = require('gulp-minify-css');

// Include JS componentss
var concat = require('gulp-concat'); // I use this instead of gulp-concat because gulp-concat does't work with watch.
var uglify = require('gulp-uglify');

// Include utilities
var livereload = require('gulp-livereload');
var server = lr();

// by default, this is run as production
var config = {'env': 'prod'};


//scss Compilation
//   to use less for Compilation... just find/replace "scss" to "less" and "npm install --save-dev gulp-less"
gulp.task('scss', function () {
    if (config.env == 'dev') {
        gulp.src(source.scss)
            .pipe(watch())
            .pipe(plumber()) // This will keeps pipes working after error event
            .pipe(scss().on('error', gutil.log))
            .pipe(gulp.dest(target.scss))
            .pipe(livereload(server));
    } else {
        gulp.src(source.scss)
            .pipe(scss().on('error', gutil.log))
            .pipe(autoprefixer('last 10 versions'))
            .pipe(minifycss())
            .pipe(gulp.dest(target.scss));
    }
});

gulp.task('plugin_scss', function () {
    if (config.env == 'dev') {
        gulp.src(source.pluginscss)
            .pipe(watch())
            .pipe(plumber())
            .pipe(scss().on('error', gutil.log))
            .pipe(concat('plugins.css'))
            .pipe(gulp.dest(target.pluginscss))
            .pipe(livereload(server));
    } else {
        gulp.src(source.pluginscss)
            .pipe(scss().on('error', gutil.log))
            .pipe(autoprefixer('last 15 version', 'ie 8'))
            .pipe(minifycss())
            .pipe(concat('plugins.css'))
            .pipe(gulp.dest(target.pluginscss));
    }
});

//plugin fonts
gulp.task('plugin_fonts', function () {
        gulp.src(source.pluginfonts)
            .pipe(flatten())// since we are moving the js and css files... we should probably move fonts too
            .pipe(gulp.dest(target.pluginfonts))
});

//Plugin JS Compilation
gulp.task('plugin_scripts', function () {
    if (config.env == 'dev') {
        gulp.src(source.pluginjs)
            .pipe(watch())
            .pipe(plumber())
            .pipe(concat("plugin.js"))
            .pipe(gulp.dest(target.pluginjs))
            .pipe(livereload(server));
    } else {
        gulp.src(source.pluginjs)
            .pipe(concat("plugin.js"))
            .pipe(uglify({mangle: true}).on('error', gutil.log))
            .pipe(gulp.dest(target.pluginjs));
    }
});

// JS Compilation
gulp.task('scripts', function () {
    if (config.env == 'dev') {
        gulp.src(source.js)
            .pipe(watch())
            .pipe(plumber())
            .pipe(concat("app.js"))
            .pipe(gulp.dest(target.js))
            .pipe(livereload(server));
    } else {
        gulp.src(source.js)
            .pipe(concat("app.js"))
            .pipe(uglify({mangle: true}).on('error', gutil.log))
            .pipe(gulp.dest(target.js));
    }
});

//bootstrap scss, JS, Fonts
gulp.task('bootstrap', function () {
    if (config.env == 'dev') {
        // JS
        gulp.src(source.bootstrapjs)
            .pipe(watch())
            .pipe(plumber())
            .pipe(concat("bootstrap.js"))
            .pipe(gulp.dest(target.bootstrapjs))
            .pipe(livereload(server));
        // scss
        gulp.src(source.bootstrapscss)
            .pipe(watch())
            .pipe(plumber())
            .pipe(scss().on('error', gutil.log))
            .pipe(concat('bootstrap.css'))
            .pipe(gulp.dest(target.bootstrapscss))
            .pipe(livereload(server));
    } else {
        // JS
        gulp.src(source.bootstrapjs)
            .pipe(concat("bootstrap.js"))
            .pipe(uglify({mangle: true}).on('error', gutil.log))
            .pipe(gulp.dest(target.bootstrapjs));
        // scss
        gulp.src(source.bootstrapscss)
            .pipe(scss().on('error', gutil.log))
            .pipe(autoprefixer('last 10 versions'))
            .pipe(concat('bootstrap.css'))
            .pipe(minifycss())
            .pipe(gulp.dest(target.bootstrapscss));
    }
    //fonts
    gulp.src(source.bootstrapfonts)
        .pipe(gulp.dest(target.bootstrapfonts));
});

gulp.task('fonts', function(){
    gulp.src(source.fonts)
        .pipe(gulp.dest(target.fonts));
});

gulp.task('images', function(){
    gulp.src(source.images)
        .pipe(gulp.dest(target.images));
});


// LiveReload
gulp.task('livereload', function(next) {
    server.listen(35729, function(err) {
        if (err) console.error(err);
        next();
    });
});


// clean out the old stuff:
// sometimes this fails... just run it again.
gulp.task('clean', function () {
    console.log('[NOTE] If you get a "Unable to delete" error... just try again');
    for (var folder in target){
        gulp.src(target[folder], {read: false})
            .pipe(plumber())
            .pipe(clean({force: true}));
    }
});

////
//
// Set the dev and prod tasks.
//
////
gulp.task('devconfig', function () {
    console.log('[NOTE] If you get an error... just try again.');
    config.env = 'dev';
    concat = require('gulp-continuous-concat'); // I use this instead of gulp-concat because gulp-concat doesn't work with watch.
});


gulp.task('dev',
        ['devconfig','livereload','prod']
);

gulp.task('prod',
    ['scss','plugin_scss','plugin_fonts',
        'scripts','plugin_scripts','fonts','images',
        'bootstrap']
);

gulp.task('default',['prod']);