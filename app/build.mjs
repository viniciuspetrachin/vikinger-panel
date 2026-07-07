import * as esbuild from "esbuild";

const shared = {
  bundle: true,
  minify: true,
  logLevel: "info",
  target: ["es2020"],
};

// App bundle (Alpine component logic, modularized under frontend/js)
await esbuild.build({
  ...shared,
  entryPoints: ["frontend/js/main.js"],
  outfile: "static/app.bundle.js",
  format: "iife",
});

// CodeMirror editor bundle
await esbuild.build({
  ...shared,
  entryPoints: ["editor-src.js"],
  outfile: "static/editor.bundle.js",
  format: "esm",
});

console.log("build ok");
