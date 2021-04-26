// Less configuration
const gulp = require('gulp');
const less = require('gulp-less');
const through2 = require("through2");
const yaml = require("js-yaml");
const Datastore = require("nedb");
const cb = require("cb");
const mergeStream = require("merge-stream");
const clean = require("gulp-clean");
const zip = require("gulp-zip");
const fs = require("fs");
const path = require("path");

gulp.task('less', (cb) => {
  gulp
    .src('less/wh3e.less')
    .pipe(less())
    .pipe(
      gulp.dest('css/')
    );
  cb();
});

gulp.task(
  'default',
  gulp.series('less', (cb) => {
    gulp.watch('less/**/*.less', gulp.series('less'));
    cb();
  })
);

const SYSTEM = JSON.parse(fs.readFileSync("system.json"));
const STATIC_FILES = ["system.json", "assets/**/*"];
const PACK_SRC = "compendia";
const BUILD_DIR = "build";
const DIST_DIR = "dist";

/* ----------------------------------------- */
/*  Compile Compendia
/* ----------------------------------------- */

function compilePacks() {
  // determine the source folders to process
  const folders = fs.readdirSync(PACK_SRC).filter((file) => {
    return fs.statSync(path.join(PACK_SRC, file)).isDirectory();
  });

  // process each folder into a compendium db
  const packs = folders.map((folder) => {
    const db = new Datastore({ filename: path.resolve(__dirname, BUILD_DIR, "packs", `${folder}.db`), autoload: true });
    return gulp.src(path.join(PACK_SRC, folder, "/**/*.yaml")).pipe(
      through2.obj((file, enc, cb) => {
        let json = yaml.loadAll(file.contents.toString());
        db.insert(json);
        cb(null, file);
      })
    );
  });
  return mergeStream.call(null, packs);
}

/* ----------------------------------------- */
/*  Copy static files
/* ----------------------------------------- */

function copyFiles() {
  return gulp
    .src(STATIC_FILES, {
      base: "src",
    })
    .pipe(gulp.dest(BUILD_DIR));
}

/* ----------------------------------------- */
/*  Create distribution archive
/* ----------------------------------------- */

function createZip() {
  return gulp
    .src(`${BUILD_DIR}/**/*`)
    .pipe(zip(`foundryvtt-${SYSTEM.name}-v${SYSTEM.version}.zip`))
    .pipe(gulp.dest(DIST_DIR));
}

/* ----------------------------------------- */
/*  Other Functions
/* ----------------------------------------- */

function cleanBuild() {
  return gulp.src(`${BUILD_DIR}`, { allowEmpty: true }, { read: false }).pipe(clean());
}

function watchUpdates() {
  gulp.watch("src/**/*", gulp.series(cleanBuild, copyFiles, compilePacks));
}

/* ----------------------------------------- */
/*  Export Tasks
/* ----------------------------------------- */

exports.clean = gulp.series(cleanBuild);
exports.compile = gulp.series(compilePacks);
exports.copy = gulp.series(copyFiles);
exports.build = gulp.series(cleanBuild, copyFiles, compilePacks);
exports.dist = gulp.series(createZip);
exports.default = gulp.series(cleanBuild, copyFiles, compilePacks, watchUpdates);