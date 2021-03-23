/*global require: false*/

var theme_folder = 'blog',
    path_qa   = '/public_html/',
    host_qa    = '',
    user_qa    = '',
    pass_qa    = '',
    path_prod   = '/public_html/',
    user_prod  = '',
    host_prod  = '',
    pass_prod  = '';


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
    imageop    = require('gulp-image-optimization'),
    php2html   = require('gulp-php2html'),
    webp       = require('gulp-webp');

gulp.task('deploy-qa', function () {

    'use strict';

    var conn = ftp.create({
            host:     host_qa,
            user:     user_qa,
            password: pass_qa,
            parallel: 10,
            log:      gutil.log
        }),

        globs = [
            'wordpress/wp-content/theme/'+theme_folder+'/**/*',
            '!wordpress/wp-content/theme/'+theme_folder+'/.editorconfig',
            '!wordpress/wp-content/theme/'+theme_folder+'/.gitignore',
            '!wordpress/wp-content/theme/'+theme_folder+'/.git',
            '!wordpress/wp-content/theme/'+theme_folder+'/.init',
        ];

    // using base = '.' will transfer everything to /public_html correctly
    // turn off buffering in gulp.src for best performance

    return gulp.src(globs, {base: '.', buffer: false})
        .pipe(conn.newer(path_qa)) // only upload newer files
        .pipe(conn.dest(path_qa));
});

gulp.task('deploy-prod', function () {

    'use strict';

    var conn = ftp.create({
            host:     host_prod,
            user:     user_prod,
            password: pass_prod,
            parallel: 10,
            log:      gutil.log
        }),

        globs = [
            'wordpress/wp-content/theme/'+theme_folder+'/**/*',
            '!wordpress/wp-content/theme/'+theme_folder+'/.editorconfig',
            '!wordpress/wp-content/theme/'+theme_folder+'/.gitignore',
            '!wordpress/wp-content/theme/'+theme_folder+'/.git',
            '!wordpress/wp-content/theme/'+theme_folder+'/.init',
        ];

    // using base = '.' will transfer everything to /public_html correctly
    // turn off buffering in gulp.src for best performance

    return gulp.src(globs, {base: '.', buffer: false})
        .pipe(conn.newer(path_prod)) // only upload newer files
        .pipe(conn.dest(path_prod));
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
    var theme = gulp.src('wordpress/wp-content/themes/blog/assets/images/**/*')
        .pipe(imagemin({ progressive: true, svgoPlugins: [{removeViewBox: false}], use: [pngquant()]}))
        .pipe(gulp.dest('wordpress/wp-content/themes/blog/assets/images/'));

    var themeHtml = gulp.src('wordpress/wp-content/themes/blog/assets/images/**/*')
        .pipe(imagemin({ progressive: true, svgoPlugins: [{removeViewBox: false}], use: [pngquant()]}))
        .pipe(gulp.dest('html/assets/img/'));

    var upload = gulp.src('wordpress/wp-content/uploads/**/**/*')
        .pipe(imagemin({ progressive: true, svgoPlugins: [{removeViewBox: false}], use: [pngquant()]}))
        .pipe(gulp.dest('wordpress/wp-content/uploads/'));

    var uploadHtml = gulp.src('wordpress/wp-content/uploads/**/**/*')
        .pipe(imagemin({ progressive: true, svgoPlugins: [{removeViewBox: false}], use: [pngquant()]}))
        .pipe(gulp.dest('html/assets/img/'));

    return [theme, upload, themeHtml, uploadHtml ]
});

gulp.task('webp', function () {
    'use strict';
    var theme = gulp.src('wordpress/wp-content/themes/blog/assets/images/**/*')
        .pipe(webp())
        .pipe(gulp.dest('wordpress/wp-content/themes/blog/assets/images/'));

    var themeHtml = gulp.src('wordpress/wp-content/themes/blog/assets/images/**/*')
        .pipe(webp())
        .pipe(gulp.dest('html/assets/img/'));

    var upload = gulp.src('wordpress/wp-content/uploads/**/**/*')
        .pipe(webp())
        .pipe(gulp.dest('wordpress/wp-content/uploads/'));

    var uploadHtml = gulp.src('wordpress/wp-content/uploads/**/**/*')
        .pipe(webp())
        .pipe(gulp.dest('html/assets/img/'));

    return [theme, upload, themeHtml, uploadHtml ]
});

gulp.task('imageoptimin', function (cb) {

    'use strict';

    gulp.src(['wordpress/wp-content/themes/blog/assets/images/**/*.png', 'wordpress/wp-content/themes/blog/assets/images/**/*.jpg', 'wordpress/wp-content/themes/blog/assets/images/**/*.gif', 'wordpress/wp-content/themes/blog/assets/images/**/*.jpeg']).pipe(imageop({
        optimizationLevel: 5,
        progressive: true,
        interlaced: true
    })).pipe(gulp.dest('wordpress/wp-content/themes/blog/assets/images/')).on('end', cb).on('error', cb);
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

gulp.task('php2html', function (){
    php2html.routes(['/wordpress/wp-content/themes/blog/**'])
        .pipe(php2html())
        .pipe(gulp.dest("./html"));
    }
);

gulp.task('default', ['sass', 'lint', 'scripts', 'watch', 'html', 'imagemin', 'php2html', 'php', 'html']);
