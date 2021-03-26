import "source-map-support/register";
import {program} from "commander";
import {existsSync, readFileSync} from "fs";
import {resolve} from "path";
import {buildCommands} from "./commands";
import chalk from "chalk";
import {ChildProcess, spawn, spawnSync} from "child_process";
import BuildConfig from "./config";

program
    .version("0.0.1")
    .name("Confuscript Project Builder")
    .description(
        "Command line tool for building all or individual confuscript build scripts for production or in a development file watching mode",
    );

program
    .command("build")
    .description("Run all build scripts in order")
    .option("-c, --config <path>", "Use a different .buildrc file")
    .option("-q, --quiet", "Pass this option to not print command output")
    .option("-f, --from", "Relative path to use as the working directory")
    .option("-p, --print", "Prints commands as they are run")
    .action(async (options) => {
        const configpath = resolve(process.cwd(), options.config || ".buildrc");
        if (!existsSync(configpath)) {
            console.log(chalk`{red !} Could not find file ${configpath}`);
            return;
        }
        const config = JSON.parse(readFileSync(configpath, "utf-8"));
        const commands = buildCommands(config, false);
        for (const cmd of commands) {
            console.log(chalk`{green.underline Building ${cmd.name}}`);
            const cmdparts = cmd.command.split(" ");
            console.log(chalk`{gray ${cmd.command}}`);
            const s = spawnSync(<string>cmdparts.shift(), cmdparts, {
                stdio: options.quiet ? undefined : "inherit",
                cwd: options.from
                    ? resolve(process.cwd(), options.from)
                    : process.cwd(),
            });
            if (s.error) {
                console.log(
                    chalk`\n\n{red There was a problem while building ${cmd.name}.} {gray ${s.error.message}}`,
                );
                process.exit();
            }
            if (s.status !== null && s.status !== 0) {
                console.log(
                    chalk`\n\n{red There was a problem while building ${cmd.name}.} {gray code ${s.status}}`,
                );
                process.exit();
            }
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
        if (
            process.platform === "win32" &&
            config.enableTerminal !== false &&
            options.terminal
        ) {
            let wtcmd = "";

            for (const cmd of commands) {
                wtcmd += `new-tab --title ${cmd.name} --startingDirectory ./ ${cmd.command}; `;
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
