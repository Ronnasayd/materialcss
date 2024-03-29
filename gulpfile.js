const gulp = require("gulp");
const browserSync = require("browser-sync").create();
const sass = require("gulp-sass");
const rename = require("gulp-rename");
const autoprefixer = require("gulp-autoprefixer");
const minifyjs = require("gulp-uglify");
const sourcemaps = require("gulp-sourcemaps");
const imagemin = require("gulp-imagemin");
const cleanCSS = require("gulp-clean-css");
const cache = require("gulp-cached");
const minimist = require("minimist");
const concat = require("gulp-concat");
const sassPartials = require("gulp-sass-partials-imported");
const jshint = require("gulp-jshint");
const babel = require("gulp-babel");
const webpack = require("webpack-stream");
const path = require("path");

const src_scss = path.resolve(
  __dirname,
  "app",
  "static",
  "src",
  "scss",
  "**",
  "*.scss"
);
const src_css = path.resolve(
  __dirname,
  "app",
  "static",
  "src",
  "css",
  "**",
  "*.css"
);

const src_js = path.resolve(
  __dirname,
  "app",
  "static",
  "src",
  "js",
  "**",
  "*.js"
);

const images_folder = path.resolve(
  __dirname,
  "app",
  "static",
  "images",
  "**",
  "*.{png,jpeg,jpg,svg,ico}"
);

const not_node = "!node_modules/";

const dist_js = path.resolve(__dirname, "app", "static", "dist", "js");
const dist_css = path.resolve(__dirname, "app", "static", "dist", "css");

const html_files = path.resolve(__dirname, "app", "**", "*.html");

const jsHint = () => {
  return gulp
    .src([src_js, not_node], { allowEmpty: true })
    .pipe(cache("jsHint"))
    .pipe(
      jshint({
        esnext: true
      })
    )
    .pipe(jshint.reporter("default"));
};

const minifyJs = () => {
  return gulp
    .src([src_js, not_node], { allowEmpty: true })
    .pipe(cache("minifyJs"))
    .pipe(sourcemaps.init())
    .pipe(
      babel({
        presets: ["@babel/env"]
      })
    )
    .pipe(minifyjs())
    .on("error", function(err) {
      console.log(err.message);
      console.log(err.cause);
      browserSync.notify(err.message, 3000); // Display error in the browser
      this.emit("end"); // Prevent gulp from catching the error and exiting the watch process
    })
    .pipe(
      rename(function(file) {
        file.extname = ".min.js";
      })
    )
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest(dist_js));
};

const webPackJs = () => {
  let basename;
  return gulp
    .src([src_js, not_node], { allowEmpty: true })
    .pipe(cache("webpackJs"))
    .pipe(
      babel({
        presets: ["@babel/env"]
      })
    )
    .pipe(
      rename(function(file) {
        basename = file.basename;
        console.log(basename);
      })
    )
    .pipe(
      webpack({
        mode: "production",
        devtool: "source-map",
        output: {
          filename: () => {
            return basename + ".min.js";
          }
        }
      })
    )
    .pipe(gulp.dest(dist_js));
};

const sassToCssMin = () => {
  return gulp
    .src([src_scss, "!_*.scss", not_node], { allowEmpty: true })
    .pipe(cache("sassToCssMin"))
    .pipe(sassPartials(path.resolve(__dirname, "app", "static", "src", "scss")))
    .pipe(sourcemaps.init({ loadMaps: true, largeFile: true }))
    .pipe(
      sass({
        errLogToConsole: true,
        indentedSyntax: false
      }).on("error", function(err) {
        console.log(err.message);
        browserSync.notify(err.message, 3000); // Display error in the browser
        this.emit("end"); // Prevent gulp from catching the error and exiting the watch process
      })
    )
    .pipe(autoprefixer())
    .on("error", function(err) {
      console.log(err.message, err);
      browserSync.notify(err.message, 3000); // Display error in the browser
      this.emit("end"); // Prevent gulp from catching the error and exiting the watch process
    })
    .pipe(cleanCSS())
    .pipe(
      rename(function(file) {
        file.extname = ".min.css";
      })
    )
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest(dist_css))
    .pipe(browserSync.stream());
};

const minifyCss = () => {
  return gulp
    .src([src_css, "!_*.css", not_node], { allowEmpty: true })
    .pipe(cache("minifyCss"))
    .pipe(sourcemaps.init({ loadMaps: true, largeFile: true }))
    .pipe(autoprefixer())
    .on("error", function(err) {
      console.log(err.message, err);
      browserSync.notify(err.message, 3000); // Display error in the browser
      this.emit("end"); // Prevent gulp from catching the error and exiting the watch process
    })
    .pipe(cleanCSS())
    .pipe(
      rename(function(file) {
        file.extname = ".min.css";
      })
    )
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest(dist_css))
    .pipe(browserSync.stream());
};

//  gulp concatfiles --files <list_of_files:file1,file2,file3> --name <name_of_file:all.js> --dist <destination>
const concatFiles = () => {
  let options = minimist(process.argv.slice(2));
  console.log("files: " + options.files);
  console.log("name: " + options.name);
  console.log("dist: " + options.dist);
  return gulp
    .src(options.files.split(","), { base: "./", allowEmpty: true })
    .pipe(cache("concatFiles"))
    .pipe(sourcemaps.init())
    .pipe(concat(options.name))
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest(options.dist));
};

const browserReload = done => {
  browserSync.reload();
  done();
};

const minifyImages = () => {
  return gulp
    .src([images_folder, not_node], { base: "./", allowEmpty: true })
    .pipe(cache("minifyImages"))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }]
        })
      ])
    )
    .pipe(gulp.dest("./"));
};

// const js_line = gulp.series(jsHint, minifyJs); // Use this line if you want minify the javascript
const js_line = gulp.series(jsHint, webPackJs); // Use this line if  you want webpack javascript

const sass_line = gulp.series(sassToCssMin);
const css_line = gulp.series(minifyCss);
const image_line = gulp.series(minifyImages);

const browserSyncServer = () => {
  browserSync.init({
    open: false,
    server: {
      baseDir: path.resolve(__dirname, "app")
    }
  });

  gulp.watch(src_scss, { interval: 100, usePolling: true }, sass_line);
  gulp.watch(src_css, { interval: 100, usePolling: true }, css_line);
  gulp.watch(
    src_js,
    { interval: 100, usePolling: true },
    gulp.series(js_line, browserReload)
  );
  gulp.watch(images_folder, { interval: 100, usePolling: true }, image_line);
  gulp.watch(
    html_files,
    { interval: 100, usePolling: true },
    gulp.series(browserReload)
  );
};

const server = gulp.series(
  gulp.parallel(js_line, css_line, sass_line, image_line),
  browserSyncServer
);

exports.concatfiles = concatFiles;
exports.default = server;
