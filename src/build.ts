import "source-map-support/register";
import {program} from "commander";
import {existsSync, readFileSync} from "fs";
import {resolve} from "path";
import {buildCommands, runCmd} from "./commands";
import chalk from "chalk";
import {ChildProcess, spawn} from "child_process";
import BuildConfig from "./config";

program
    .version("0.0.1")
    .name("Build")
    .description(
        "Command line tool for building all or individual packages for production or in a development file watching mode (with windows terminal support)",
    );


program
    .command("run <command>")
    .description("Run a specific command. Uses ids set in your build config. You can also pass multiple with a comma separating them which will run commands in that order. E.g. `build run someTypescriptCommand` or `build run command1,command2`")
    .option("-c, --config <path>", "Use a different .buildrc file")
    .option("-q, --quiet", "Pass this option to not print command output")
    .option("-f, --from", "Relative path to use as the working directory")
    .option("-p, --print", "Prints commands as they are run")
    .action((cmd: string, options) => {
        const cmds = cmd.split(",").map((c) => c.toLowerCase());
        const configpath = resolve(process.cwd(), options.config || ".buildrc");
        if (!existsSync(configpath)) {
            console.log(chalk`{red !} Could not find file ${configpath}`);
            return;
        }
        const config = JSON.parse(readFileSync(configpath, "utf-8"));
        let commands = buildCommands(config, false);
        commands = commands.filter((v) => cmds.includes(v.id.toLowerCase()));
        for (const cmd of commands) {
            if (cmd.id && (cmd.id && cmds.includes(cmd.id.toLowerCase()))) runCmd(cmd, options);
        }
    })


program
    .command("build")
    .description("Run all build scripts in order")
    .option("-c, --config <path>", "Use a different .buildrc file")
    .option("-q, --quiet", "Pass this option to not print command output")
    .option("-f, --from", "Relative path to use as the working directory")
    .option("-p, --print", "Prints commands as they are run")
    .option("-e, --exclude <command>", "Exclude a command or multiple commands separated by a comma. Uses id names")
    .action(async (options) => {
        const configpath = resolve(process.cwd(), options.config || ".buildrc");
        if (!existsSync(configpath)) {
            console.log(chalk`{red !} Could not find file ${configpath}`);
            return;
        }
        const config = JSON.parse(readFileSync(configpath, "utf-8"));
        const commands = buildCommands(config, false);
        const cmds = (options.exclude as string || "").split(",").map((c) => c.toLowerCase());
        for (const cmd of commands) {
            if (!cmd.id || (cmd.id && !cmds.includes(cmd.id.toLowerCase()))) runCmd(cmd, options);
        }
    });

program
    .command("dev")
    .description("Run all build commands in dev mode concurrently")
    .option(
        "-w, --no-terminal",
        "Don't use windows terminals when on win32. (This can also be disabled in your .builrc)",
    )
    .option("-f, --from", "Relative path to use as the working directory")
    .option("-c, --config <path>", "Use a different .buildrc file")
    .option("-e, --exclude <command>", "Exclude a command or multiple commands separated by a comma. Uses id names")
    .action(async (options) => {
        const configpath = resolve(process.cwd(), options.config || ".buildrc");
        if (!existsSync(configpath)) {
            console.log(chalk`{red !} Could not find file ${configpath}`);
            return;
        }
        const config: BuildConfig = JSON.parse(
            readFileSync(configpath, "utf-8"),
        );
        const commands = buildCommands(config, true);
        const cmds = (options.exclude as string || "").split(",").map((c) => c.toLowerCase());
        if (
            process.platform === "win32" &&
            config.enableTerminal !== false &&
            options.terminal
        ) {
            let wtcmd = "";

            for (const cmd of commands) {
                if (!cmd.id || (cmd.id && !cmds.includes(cmd.id.toLowerCase()))) wtcmd += `new-tab --title ${cmd.name} --startingDirectory ./ ${cmd.command}; `;
            }

            wtcmd = wtcmd.replace(/; $/, "");

            spawn("wt.exe", wtcmd.split(" "), {
                stdio: "inherit",
                cwd: options.from
                    ? resolve(process.cwd(), options.from)
                    : process.cwd(),
            }).on("close", (code) => {
                if (code !== 0) {
                    console.log(
                        chalk`{red There was a problem while running windows terminals} {gray code ${code}}`,
                    );
                    process.exit(0);
                }
            });
        } else {
            const proc: { name: string; c: ChildProcess }[] = [];
            let killing = false;

            for (const cmd of commands) {
                if (!cmd.id || (cmd.id && !cmds.includes(cmd.id))) {
                    const c = cmd.command.split(" ");
                    const pr = spawn(<string>c.shift(), c, {
                        stdio: "inherit",
                        cwd: options.from
                            ? resolve(process.cwd(), options.from)
                            : process.cwd(),
                    });
                    pr.on("close", (code) => {
                        if (!killing) {
                            if (code !== 0) {
                                for (const p of proc) {
                                    p.c.kill();
                                    console.log(chalk`{red Killed ${cmd.name}}`);
                                }
                            } else {
                                console.log(
                                    chalk`{green ${cmd.name} closed its self with code ${code}`,
                                );
                            }
                        }
                    });
                    proc.push({name: cmd.name, c: pr});
                }
            }

            const end = () => {
                if (!killing) {
                    killing = true;
                    for (const p of proc) {
                        p.c.kill();
                        console.log(chalk`{green Killed ${p.name}}`);
                    }
                    process.exit();
                }
            };

            process.on("exit", () => end());
            process.on("SIGINT", () => end());
        }
    });

program.parse(process.argv);
