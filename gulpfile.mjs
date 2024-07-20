// Updated gulpfile.js to use dynamic import for del due to ERR_REQUIRE_ESM error

import { exec } from "child_process";
import { deleteSync } from "del";
import gulp from "gulp";
import replace from "gulp-replace";
import zip from "gulp-zip";

const { src, dest, series, parallel, task } = gulp;

const OUT_DIR = "./dist/";
const SRC_DIR = "./src/";
const PACK_DIR = "./dist-pack/";
const PACK_NAME = "caption-mask.zip";

// Updated cleanDist and cleanPack functions to use dynamic import for del
const cleanDist = async () => {
  await deleteSync([OUT_DIR]);
};

const cleanPack = async () => {
  await deleteSync([PACK_DIR]);
};

const cleanAll = parallel(cleanDist, cleanPack);

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

async function getVersion() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const packagePath = path.join(__dirname, "package.json");
  const packageJson = await fs.readFile(packagePath, "utf8");
  const version = JSON.parse(packageJson).version;
  return version;
}

const manifest = async () => {
  const version = await getVersion();
  console.log(`Version: ${version}`);

  return src(["./src/manifest.json"])
    .pipe(replace("$VERSION", version))
    .pipe(dest(OUT_DIR));
};

const copyIcons = () => {
  return src(`${SRC_DIR}/icons/**`, { base: SRC_DIR, encoding: false }).pipe(
    dest(`${OUT_DIR}`)
  );
};

const parcelBuild = (entryFile, outputDir, outputFile) => () => {
  // Ensure the output directory path is correct
  const outputFullPath = path.join(outputDir, outputFile);
  // Use --dist-dir to specify the directory and include the outputFile in the entryFile path if necessary
  const cmdStr = `parcel build ${entryFile} --no-source-maps --dist-dir ${outputDir}`;
  return exec(cmdStr, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    if (stdout) {
      console.log(`stdout: ${stdout}`);
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
    }
  });
};

// Adjust the usage of parcelBuild function according to the new signature
task(
  "buildContent",
  parcelBuild("./src/content/content.ts", OUT_DIR, "content.js")
);
task(
  "buildBackgound",
  parcelBuild("./src/background/background.ts", OUT_DIR, "background.js")
);
task(
  "buildInject",
  parcelBuild("./src/inject/inject.ts", OUT_DIR, "inject.js")
);
task(
  "buildPopup",
  parcelBuild("./src/popup/popup.html", OUT_DIR, "popup.html")
);

const buildJs = parallel(
  "buildContent",
  "buildBackgound",
  "buildInject",
  "buildPopup"
);

const build = series(cleanDist, parallel(buildJs, manifest, copyIcons));

const pack = async () => {
  return src("dist/**/*").pipe(zip(PACK_NAME)).pipe(dest(PACK_DIR));
};

const buildPack = series(build, cleanPack, pack);

export {
  build,
  buildJs,
  cleanAll as clean,
  buildPack as default,
  manifest,
  pack,
};
