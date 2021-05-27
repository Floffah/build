import BuildConfig from "../config";
import {resolve} from "path";
import {existsSync, readFileSync} from "fs";
import chalk from "chalk";

export function getConfig(config = ".buildrc", from?: string): BuildConfig {
    const cwd = from ? resolve(from) : process.cwd();
    const path = resolve(cwd, config);
    if (!existsSync(path)) {
        console.log(chalk`{red.bold !} {red Could not find config file ${path}}`);
        process.exit(1);
    }
    return JSON.parse(readFileSync(path, "utf-8"));
}
