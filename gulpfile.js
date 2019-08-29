const gulp = require('gulp');
const { src, dest, series, parallel, task } = gulp;
const replace = require('gulp-replace');
const zip = require('gulp-zip')

const { exec } = require('child_process');
const del = require('del')

const OUT_DIR = './dist/'
const SRC_DIR = './src/'
const PACK_DIR = './dist-pack/'
const PACK_NAME = 'caption-mask.zip'


const cleanDist = async () => {
  await del([OUT_DIR]);
}

const cleanPack = async () => {
  await del([PACK_DIR]);
}

const cleanAll = parallel(cleanDist, cleanPack)



function getVersion() {
  delete require.cache[require.resolve('./package.json')];
  return require('./package.json').version;
}

const manifest = () => {
  return src(['./src/manifest.json'])
    .pipe(replace('$VERSION', getVersion()))
    .pipe(dest(OUT_DIR))
}

const copyIcons = () => {
  return src(`${SRC_DIR}/icons/**`, { base: SRC_DIR })
    .pipe(dest(`${OUT_DIR}`))
}


const parcelBuild = (entryFile, outputFile) => () => {
  return exec(`parcel build ${entryFile} --no-source-maps --out-file ${outputFile}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    if (stdout) { console.log(`stdout: ${stdout}`); }
    if (stderr) { console.log(`stderr: ${stderr}`); }
  });
};
task('buildContent', parcelBuild('./src/content/content.ts', 'content.js'))
task('buildBackgound', parcelBuild('./src/background/background.ts', 'background.js'))
task('buildInject', parcelBuild('./src/inject/inject.ts', 'inject.js'))
task('buildPopup', parcelBuild('./src/popup/popup.html', 'popup.html'))
const buildJs = parallel('buildContent', 'buildBackgound', 'buildInject', 'buildPopup')
const build = series(cleanDist, parallel(buildJs, manifest, copyIcons))

const pack = () =>
  gulp.src('dist/**/*')
    .pipe(zip(PACK_NAME))
    .pipe(gulp.dest(PACK_DIR))

const buildPack = series(build, cleanPack, pack)



exports.manifest = manifest
exports.buildJs = buildJs

exports.clean = cleanAll
exports.build = build
exports.pack = pack
exports.buildPack = buildPack

exports.default = buildPack
