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
const HOME = require('os').homedir();

const SYSTEM = JSON.parse(fs.readFileSync("src/system.json"));
const STATIC_FILES = [
  "src/system.json",
  "src/template.json",
  "src/wh3e.js",
  "src/assets/**/*",
  "src/lang/**/*",
  "src/module/**/*",
  "src/templates/**/*"
];
const LESS_SRC = "src/less/wh3e.less";
const PACK_SRC = "src/packs";
const BUILD_DIR = "build";
const DIST_DIR = "dist";
const CSS_DEST = path.join(BUILD_DIR, "css");
const FOUNDRY_DIR = ".local/share/FoundryVTT/Data/systems";
const SYSTEM_NAME = "whitehack3e";

/* ----------------------------------------- */
/*  Compile Compendia
/* ----------------------------------------- */

compilePacks = () => {
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
/*  Compile LESS files to CSS
/* ----------------------------------------- */

compileCSS = () => {
  return gulp
    .src(LESS_SRC)
    .pipe(less())
    .pipe(
      gulp.dest(CSS_DEST)
    );
}

/* ----------------------------------------- */
/*  Copy static files
/* ----------------------------------------- */

copyFiles = () => {
  return gulp
    .src(STATIC_FILES, {
      base: "src",
    })
    .pipe(gulp.dest(BUILD_DIR));
}

/* ----------------------------------------- */
/*  Copy Docs files for github pages
/* ----------------------------------------- */

copyDocFiles = () => {
  return gulp
    .src("src/assets/fonts/**/*", {
      base: "src/assets/fonts",
    })
    .pipe(gulp.dest("docs/assets/fonts"));
}

/* ----------------------------------------- */
/*  Create distribution archive
/* ----------------------------------------- */

createZip = () => {
  return gulp
    .src(`${BUILD_DIR}/**/*`)
    .pipe(zip(`foundryvtt-${SYSTEM.name}-v${SYSTEM.version}.zip`))
    .pipe(gulp.dest(DIST_DIR));
}

/* ----------------------------------------- */
/*  Other Functions
/* ----------------------------------------- */

cleanBuild = () => {
  return gulp.src(`${BUILD_DIR}`, { allowEmpty: true }, { read: false }).pipe(clean());
}

watchUpdates = () => {
  gulp.watch("src/**/*", gulp.series(cleanBuild, compileCSS, copyFiles, copyDocFiles, compilePacks));
}

deployLocal = () => {
  return gulp.src(`${BUILD_DIR}/**/*`, {base: `${BUILD_DIR}`}).pipe(gulp.dest(HOME + path.sep + FOUNDRY_DIR + path.sep + SYSTEM_NAME));
}

/* ----------------------------------------- */
/*  Export Tasks
/* ----------------------------------------- */

exports.clean = gulp.series(cleanBuild);
exports.compile = gulp.series(compilePacks);
exports.compileCSS = gulp.series(compileCSS);
exports.copy = gulp.series(copyFiles);
exports.build = gulp.series(cleanBuild, compileCSS, copyFiles, copyDocFiles, compilePacks);
exports.dist = gulp.series(createZip);
exports.default = gulp.series(cleanBuild, compileCSS, copyFiles, copyDocFiles, compilePacks, watchUpdates);
exports.deploy = gulp.series(exports.build, deployLocal);