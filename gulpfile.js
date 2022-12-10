import autoprefixer from 'autoprefixer';
import bs from 'browser-sync';
import { deleteAsync } from 'del';
import gulp from 'gulp';
import GulpPostCss from 'gulp-postcss';
import pug from 'gulp-pug';
import gulpSass from 'gulp-sass';
import dartSass from 'sass';

const { dest, series, src, watch } = gulp;
const sass = gulpSass(dartSass);

const browserSync = bs.create();

// Compile pug files into HTML
function html() {
  return src(["src/pug/**/*.pug", "!src/pug/templates/*.pug"])
    .pipe(
      pug({
        pretty: true,
      })
    )
    .pipe(dest("dist"));
}

// Compile sass files into CSS
function styles() {
  return src("src/sass/*.{scss,sass}")
    .pipe(
      sass({
        includePaths: ["src/sass"],
        errLogToConsole: true,
        outputStyle: "expanded", //expanded
        onError: browserSync.notify,
      })
    )
    .pipe(GulpPostCss([autoprefixer({ grid: "autoplace" })]))
    .pipe(dest("dist/style"))
    .pipe(browserSync.stream());
}

function copy(source, destination) {
  return function () {
    return src(`./src/${source}`).pipe(dest(`./dist/${destination}/`));
  };
}

// Copy assets
const assets = copy("assets/**/*", "assets");

// Copy js
const js = copy("js/*.js", "js");

async function cleandist() {
  await deleteAsync("dist/**/*", { force: true });
}

// Serve and watch sass/pug files for changes
function watchAndServe() {
  browserSync.init({
    server: "dist",
  });

  watch("src/sass/**/*.(sass|scss)", styles);
  watch("src/pug/*.pug", html);
  watch("src/pug/templates/*.pug", html);
  watch("src/assets/**/*", assets);
  watch("src/js/*.js", js);
  watch("dist/*.html").on("change", browserSync.reload);
}

export const build = series(cleandist, html, styles, assets);
export default series(html, styles, assets, watchAndServe);
