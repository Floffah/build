#!/usr/bin/env node
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {rmSync, existsSync} = require("fs");
const {build} = require("estrella");

const dev = process.argv.includes("--watch") || process.argv.includes("--dev");

if(existsSync("./dist")) rmSync("./dist", {recursive: true});

build({
    bundle: true,
    target: "node16.0",
    platform: "node",
    watch: dev,
    color: true,
    logLevel: "info",
    minify: !dev,
    minifyIdentifiers: !dev,
    minifySyntax: !dev,
    minifyWhitespace: !dev,
    format: "cjs",
    entryPoints: ["./src/build.ts", "./src/index.ts"],
    //outfile: "./dist/build.cjs",
    outdir: "./dist",
    external: [],
    sourcemap: dev,
    tslint: false
});
