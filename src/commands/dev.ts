import {getConfig} from "../util/configs";
import {buildCommands, BuiltCommand} from "../util/commands";
import {platform} from "os";
import execa from "execa";
import {buildTerminalCommand} from "../util/terminal";
import {resolve} from "path";
import {ChildProcess} from "child_process";
import chalk from "chalk";

export interface DevCommandOpts {
    config: string;
    from: string;
    exclude: string;
    terminal: boolean;
}

export default async function devCommand(opts: DevCommandOpts) {
    const config = getConfig(opts.config, opts.from);
    const cmds = buildCommands(config, true);
    const exclude = (opts.exclude ?? "").split(",").map((c) => c.toLowerCase());

    if (opts.terminal && config.enableTerminal !== false && platform() === "win32") {
        const terminalcmd = buildTerminalCommand(cmds, exclude);
        console.log(chalk`{gray ${terminalcmd}}`)
        await execa.command(terminalcmd, {
            stdio: "inherit",
            cwd: opts.from
                ? resolve(opts.from)
                : process.cwd(),
        });
    } else {
        await runAllBuiltCommands(cmds, opts);
    }
}

export async function runAllBuiltCommands(cmds: BuiltCommand[], opts: DevCommandOpts) {
    const proc: { name: string; c: ChildProcess }[] = [];
    let killing = false;

    for (const cmd of cmds) {
        const child = execa.command(cmd.command, {
            stdio: "inherit",
            cwd: opts.from
                ? resolve(opts.from)
                : process.cwd(),
        });

        child.on("close", (code) => {
            if (!killing) {
                if (code !== 0) {
                    console.log(chalk`{red ${cmd.name} exited with code ${code}. Killing all other processes...`);
                    for (const p of proc) {
                        p.c.kill();
                        console.log(chalk`{red Killed ${cmd.name}}`);
                    }
                    process.exit(1);
                } else {
                    console.log(chalk`{green ${cmd.name} closed its self with code ${code}}`)
                }
            }
        });

        proc.push({
            name: cmd.name,
            c: child
        });
    }
}
