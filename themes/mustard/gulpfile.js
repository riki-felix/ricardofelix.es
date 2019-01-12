var gulp         = require("gulp"),
    sass         = require("gulp-sass"),
    autoprefixer = require("gulp-autoprefixer"),
    projectURL   = 'http://localhost:1313/',
    rename       = require('gulp-rename');
;


const browserSync = require( 'browser-sync' ).create(); // Reloads browser and injects CSS. Time-saving synchronised browser testing.

		// Compile SCSS files to CSS
		gulp.task("scss", function (done) {
		    gulp.src("src/scss/*.scss")
		        .pipe(sass({
		            outputStyle : "compressed"
		        }))
		        .pipe( autoprefixer( AUTOPREFIXER_BROWSERS ) )
            .pipe( rename( { suffix: '.min' } ) )
		        .pipe(gulp.dest("static/css"))
            done();
		})
    // Browsers you care about for autoprefixing.
    // Browserlist https        ://github.com/ai/browserslist
    const AUTOPREFIXER_BROWSERS = [
        'last 2 version',
        '> 1%',
        'ie >= 9',
        'ie_mob >= 10',
        'ff >= 30',
        'chrome >= 34',
        'safari >= 7',
        'opera >= 23',
        'ios >= 7',
        'android >= 4',
        'bb >= 10'
      ];

		// Watch asset folder for changes
		gulp.task('default', gulp.parallel('scss',function(done) {
		    gulp.watch("src/scss/**/*", gulp.series('scss'));
        done();
		}));
