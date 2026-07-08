import * as esbuild from "esbuild";
import { spawn } from "node:child_process";

const watch = process.argv.includes("--watch");

const shared = {
  bundle: true,
  minify: !watch,
  logLevel: "info",
  target: ["es2020"],
};

// App bundle (Alpine component logic, modularized under frontend/js)
const appOpts = {
  ...shared,
  entryPoints: ["frontend/js/main.js"],
  outfile: "static/app.bundle.js",
  format: "iife",
};

// CodeMirror editor bundle
const editorOpts = {
  ...shared,
  entryPoints: ["editor-src.js"],
  outfile: "static/editor.bundle.js",
  format: "esm",
};

if (watch) {
  // Tailwind em watch como processo filho (regenera static/app.css)
  spawn(
    "node_modules/.bin/tailwindcss",
    ["-c", "tailwind.config.js", "-i", "frontend/input.css", "-o", "static/app.css", "--watch"],
    { stdio: "inherit" }
  );

  const appCtx = await esbuild.context(appOpts);
  const editorCtx = await esbuild.context(editorOpts);
  await appCtx.watch();
  await editorCtx.watch();
  console.log("watch ativo: editar frontend/js/** ou editor-src.js gera os bundles automaticamente");
} else {
  await esbuild.build(appOpts);
  await esbuild.build(editorOpts);
  console.log("build ok");
}
