/*global require: false*/

var theme_folder = 'blog',
    path_stag    = '/public_html/',
    host_stag    = '',
    user_stag    = '',
    pass_stag    = '';


var gulp       = require('gulp'),
    concat     = require('gulp-concat'),
    ftp        = require('vinyl-ftp'),
    gutil      = require('gulp-util'),
    imagemin   = require('gulp-imagemin'),
    jshint     = require('gulp-jshint'),
    livereload = require('gulp-livereload'),
    pngquant   = require('imagemin-pngquant'),
    uglify     = require('gulp-uglify'),
    rename     = require('gulp-rename'),
    sass       = require('gulp-sass'),
    imageop    = require('gulp-image-optimization');

gulp.task('deploy', function () {

    'use strict';

    var conn = ftp.create({
        host:     host_stag,
        user:     user_stag,
        password: pass_stag,
        parallel: 10,
        log:      gutil.log
    }),

        globs = [
            'wordpress/wp-content/**',
            '!wordpress/wp-content/cache'
        ];

    // using base = '.' will transfer everything to /public_html correctly
    // turn off buffering in gulp.src for best performance

    return gulp.src(globs, {base: '.', buffer: false})
        .pipe(conn.newer(path_stag)) // only upload newer files
        .pipe(conn.dest(path_stag));
});

gulp.task('deploy-theme', function () {

    'use strict';

    var conn = ftp.create({
        host:     host_stag,
        user:     user_stag,
        password: pass_stag,
        parallel: 10,
        log:      gutil.log
    }),

        globs = [
            'wordpress/wp-content/themes/' + theme_folder + '/**'
        ];

    // using base = '.' will transfer everything to /public_html correctly
    // turn off buffering in gulp.src for best performance

    return gulp.src(globs, {base: '.', buffer: false})
        .pipe(conn.newer(path_stag)) // only upload newer files
        .pipe(conn.dest(path_stag));
});

gulp.task('deploy-plugins', function () {

    'use strict';

    var conn = ftp.create({
        host:     host_stag,
        user:     user_stag,
        password: pass_stag,
        parallel: 10,
        log:      gutil.log
    }),

        globs = [
            'wordpress/wp-content/plugins/**'
        ];

    // using base = '.' will transfer everything to /public_html correctly
    // turn off buffering in gulp.src for best performance

    return gulp.src(globs, {base: '.', buffer: false})
        .pipe(conn.newer(path_stag)) // only upload newer files
        .pipe(conn.dest(path_stag));
});

gulp.task('html', function () {

    'use strict';

    gulp.src('wordpress/wp-content/themes/' + theme_folder + '/*.html')
        .pipe(livereload());
});

gulp.task('imagemin', function () {

    'use strict';

    return gulp.src('html/assets/images/**/*')
        .pipe(imagemin({ progressive: true, svgoPlugins: [{removeViewBox: false}], use: [pngquant()]}))
        .pipe(gulp.dest('html/assets/imagemim'));
});

gulp.task('imageoptimin', function (cb) {

    'use strict';

    gulp.src(['html/assets/images/**/*.png', 'html/assets/images/**/*.jpg', 'html/assets/images/**/*.gif', 'html/assets/images/**/*.jpeg']).pipe(imageop({
        optimizationLevel: 5,
        progressive: true,
        interlaced: true
    })).pipe(gulp.dest('html/assets/imagesoptimin')).on('end', cb).on('error', cb);
});

gulp.task('lint', function () {

    'use strict';

    return gulp.src('development/js/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('php', function () {

    'use strict';

    gulp.src('wordpress/wp-content/themes/' + theme_folder + '/**/*.php')
        .pipe(livereload());
});

gulp.task('sass', function () {

    'use strict';

    gulp.src('development/sass/**/*.scss')
        .pipe(sass({outputStyle: 'compressed'}))
    //.pipe(sass({outputStyle: 'expanded'}))
        .pipe(rename('style.css'))
        .pipe(gulp.dest('html/assets/css'))
        .pipe(gulp.dest('wordpress/wp-content/themes/' + theme_folder + '/assets/css'))
        .pipe(livereload());
});

gulp.task('scripts', function () {

    'use strict';

    return gulp.src('development/js/**/*.js')
        .pipe(concat('development/js/**/*.js'))
        .pipe(rename('main.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('html/assets/js'))
        .pipe(gulp.dest('wordpress/wp-content/themes/' + theme_folder + '/assets/js'))
        .pipe(livereload());
});

gulp.task('watch', function () {

    'use strict';

    gulp.watch('development/sass/**/*.scss', ['sass']);
    gulp.watch('development/js/**/*.js', ['lint', 'scripts']);
    gulp.watch(['wordpress/wp-content/themes/' + theme_folder + '/*.php'], ['php']);
    gulp.watch(['wordpress/wp-content/themes/' + theme_folder + '/*.html'], ['html']);

    livereload.listen();
});

gulp.task('default', ['sass', 'lint', 'scripts', 'watch']);
