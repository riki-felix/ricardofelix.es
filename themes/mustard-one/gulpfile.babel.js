import { src, dest, watch, series, parallel } from 'gulp';
import yargs from 'yargs';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass(dartSass);
import cleanCss from 'gulp-clean-css';
import gulpif from 'gulp-if';
import postcss from 'gulp-postcss';
import sourcemaps from 'gulp-sourcemaps';
import autoprefixer from 'autoprefixer';
import imagemin from 'gulp-imagemin';
import del from 'del';
import named from 'vinyl-named';
import zip from "gulp-zip";
import info from "./package.json";
import replace from "gulp-replace";
  const PRODUCTION = yargs.argv.prod;
  export const clean = () => del(['dist']);
    
  export const styles = () => {
  return src(['src/scss/bundle.scss'])
    .pipe(gulpif(!PRODUCTION, sourcemaps.init()))
    .pipe(sass().on('error', sass.logError))
    .pipe(gulpif(PRODUCTION, postcss([ autoprefixer ])))
    .pipe(gulpif(PRODUCTION, cleanCss({compatibility:'ie8'})))
    .pipe(gulpif(!PRODUCTION, sourcemaps.write()))
    .pipe(dest('static/css'))
  }
  export const images = () => {
  return src('src/images/**/*.{jpg,jpeg,png,svg,gif}')
    .pipe(gulpif(PRODUCTION, imagemin()))
    .pipe(dest('static/images'));
  }
  export const copy = () => {
    return src(['src/**/*','!src/{images,js,scss}','!src/{images,js,scss}/**/*'])
    .pipe(dest('dist'));
  }
    
    export const compress = () => {
      return src([
        "**/*",
        "!node_modules{,/**}",
        "!bundled{,/**}",
        "!src{,/**}",
        "!.babelrc",
        "!.gitignore",
        "!gulpfile.babel.js",
        "!package.json",
        "!package-lock.json",
      ])
      .pipe(
        gulpif(
          file => file.relative.split(".").pop() !== "zip",
          replace("_themename", info.name)
        )
      )
      .pipe(zip(`${info.name}.zip`))
      .pipe(dest('bundled'));
    };
    export const watchForChanges = () => {
      watch('src/scss/**/*.scss', series(styles));
      watch('src/images/**/*.{jpg,jpeg,png,svg,gif}', series(images));
      watch(['src/**/*','!src/{images,js,scss}','!src/{images,js,scss}/**/*'], series(copy));
    } 
    export const dev = series(clean, parallel(styles, images, copy), watchForChanges);
    export const build = series(clean, parallel(styles, images, copy), compress);
    export default dev;