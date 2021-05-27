import {getConfig} from "../util/configs";
import {buildCommands, BuiltCommand} from "../util/commands";
import execa from "execa";
import chalk from "chalk";
import {resolve} from "path";
import {RunCommandOpts} from "./run";

export interface BuildCommandOpts {
    config: string;
    quiet: boolean;
    from: string;
    print: boolean;
    exclude: string;
}

export default async function buildCommand(opts: BuildCommandOpts) {
    const config = getConfig(opts.config, opts.from);
    const cmds = buildCommands(config, false);
    const exclude = (opts.exclude ?? "").split(",").map((c) => c.toLowerCase());

    for (const cmd of cmds) {
        if (!cmd.id || (cmd.id && !exclude.includes(cmd.id.toLowerCase()))) await runBuiltCommand(cmd, opts);
    }
}

export async function runBuiltCommand(cmd: BuiltCommand, opts: BuildCommandOpts | RunCommandOpts) {
    if (!opts.quiet) console.log(chalk`{green.underline Building ${cmd.name}}`);
    if (opts.print && !opts.quiet) console.log(chalk`{gray ${cmd.command}}`);
    try {
        await execa.command(cmd.command, {
            stdio: opts.quiet ? undefined : "inherit",
            cwd: opts.from
                ? resolve(opts.from)
                : process.cwd(),
        });
    } catch (e) {
        console.log(chalk`\n{red There was a problem while building ${cmd.name}.} {gray ${typeof e === "string" ? e : e.message}}`);
        process.exit(1);
    }
}
