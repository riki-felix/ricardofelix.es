// Load plugins
const autoprefixer = require("autoprefixer");
const del = require("del");
const gulp = require("gulp");
const postcss = require("gulp-postcss");
const cssnano = require("cssnano");
const imagemin = require("gulp-imagemin");
const newer = require("gulp-newer");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const sass = require("gulp-sass");

// Clean assets
function clean() {
  return del(["./static/css/**/*"]);
}

// Optimize Images
function images() {
  return gulp
    .src("./src/img/**/*")
    .pipe(newer("./img"))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: false,
              collapseGroups: true
            }
          ]
        })
      ])
    )
    .pipe(gulp.dest("./img"));
}

// CSS task
function css() {
  return gulp
    .src("./src/scss/**/*.scss")
    .pipe(plumber())
    .pipe(sass({ outputStyle: "expanded" }))
    .pipe(postcss([autoprefixer({
      browsers: "last 2 versions",
      cascade: true
    })]))
    .pipe(gulp.dest("./static/css/"))
    .pipe(postcss([cssnano()]))
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest("./static/css/"));
}

// Watch files
function watchFiles() {
  gulp.watch("./src/scss/**/*.scss", css);
  gulp.watch("./src/img/**/*", images);
}

// define complex tasks
const build = gulp.series(clean, gulp.parallel(css, images));
const watch = gulp.parallel(watchFiles);

// export tasks
exports.images = images;
exports.css = css;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = build;
