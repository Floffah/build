import {resolve} from "path";
import {canResolve} from "../util/modules";
import {BuildConfig} from "estrella";
import {BuildOptions} from "esbuild";

export interface EsbuildCommandOpts {
    use?: "esbuild" | "estrella",
    in?: string,
    out?: string,
    config?: string;
    watch?: boolean
}

export default async function esbuildCommand(opts: EsbuildCommandOpts) {
    let config: ((dev: boolean) => BuildConfig | BuildOptions) | BuildConfig | BuildOptions = {};

    if (opts.config && canResolve(resolve(opts.config))) {
        config = require(resolve(opts.config)) as ((dev: boolean) => BuildConfig | BuildOptions) | BuildConfig | BuildOptions;
    }

    if (typeof config === "function") {
        config = config(!!opts.watch) as BuildConfig | BuildOptions;
    }

    const original: BuildConfig | BuildOptions = {...config};

    const dev = !!opts.watch;


    config = {
        ...config,
        watch: dev,
        minify: !dev,
        minifyIdentifiers: !dev,
        minifySyntax: !dev,
        minifyWhitespace: !dev,
        color: dev,
        logLevel: dev ? "info" : "warning",
    }

    if (opts.in && opts.out) {
        const entrypoints = opts.in.split(",");

        config = {
            ...config,
            entryPoints: opts.in.split(","),
        }

        if (entrypoints.length > 1) config.outdir = opts.out;
        else config.outfile = opts.out;
    }

    config = {...config, ...original} as BuildConfig | BuildOptions;

    const lib = await import(opts.use ?? "esbuild");

    lib.build(config);
}
