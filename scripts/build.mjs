import { readFile, readdir, mkdir, rm, copyFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { zipSync } from "fflate";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "dist");
const packDir = path.join(root, "dist-pack");
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));

await rm(outDir, { recursive: true, force: true });
await mkdir(path.join(outDir, "icons"), { recursive: true });

await build({
  entryPoints: {
    background: path.join(root, "src/background.ts"),
    content: path.join(root, "src/content.ts"),
    options: path.join(root, "src/options/options.ts"),
  },
  outdir: outDir,
  bundle: true,
  format: "iife",
  platform: "browser",
  target: "chrome95",
  minify: true,
  sourcemap: false,
  legalComments: "none",
});

const manifestTemplate = await readFile(path.join(root, "src/manifest.json"), "utf8");
const manifest = manifestTemplate.replace("$VERSION", packageJson.version);
if (manifest.includes("$VERSION")) throw new Error("Manifest version replacement failed.");
JSON.parse(manifest);
await writeFile(path.join(outDir, "manifest.json"), `${manifest.trim()}\n`);
await copyFile(path.join(root, "src/icons/icon128.png"), path.join(outDir, "icons/icon128.png"));
await copyFile(path.join(root, "src/options/options.html"), path.join(outDir, "options.html"));
await copyFile(path.join(root, "src/options/options.css"), path.join(outDir, "options.css"));

async function collectFiles(directory, relative = "") {
  const files = {};
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const relativePath = path.posix.join(relative, entry.name);
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) Object.assign(files, await collectFiles(absolutePath, relativePath));
    else files[relativePath] = new Uint8Array(await readFile(absolutePath));
  }
  return files;
}

if (process.argv.includes("--pack")) {
  await rm(packDir, { recursive: true, force: true });
  await mkdir(packDir, { recursive: true });
  const zip = zipSync(await collectFiles(outDir), { level: 9 });
  await writeFile(path.join(packDir, `caption-mask-${packageJson.version}.zip`), zip);
}
