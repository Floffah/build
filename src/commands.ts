import BuildConfig from "./config";
import chalk from "chalk";
import {spawnSync} from "child_process";
import {resolve} from "path";

export type ICommand = { name: string; command: string, id:string };

export function buildCommands(
    config: BuildConfig,
    devmode: boolean,
): ICommand[] {
    const commands: ICommand[] = [];
    const prefix = config.packagePrefix ?? "";
    const yarncmd = process.platform === "win32" ? "yarn.cmd" : "yarn";

    const b = (pkg: string, dontDoPrefix: boolean = false) =>
        `${yarncmd} workspace ${dontDoPrefix ? "" : prefix}${pkg}`;

    for (const cmd of config.commands) {
        if (cmd.type === "custom") {
            if (
                devmode &&
                (cmd.runInEnvironments ?? ["dev", "prod"]).includes("dev")
            ) {
                commands.push({
                    command: `${b(cmd.package, cmd.dontUsePackagePrefix,)} ${cmd.command}`,
                    name: cmd.id ?? cmd.package,
                    id: cmd.id,
                });
            } else if (
                !devmode &&
                (cmd.runInEnvironments ?? ["dev", "prod"]).includes("prod")
            ) {
                commands.push({
                    command: `${b(cmd.package, cmd.dontUsePackagePrefix,)} ${cmd.devcommand}`,
                    name: cmd.id ?? cmd.package,
                    id: cmd.id,
                });
            }
        } else if (cmd.type === "typescript") {
            const doConf = cmd.useAlternateConfig
                ? `--p ${cmd.alternateConfig} `
                : "";
            if (
                devmode &&
                (cmd.runInEnvironments ?? ["dev", "prod"]).includes("dev")
            ) {
                commands.push({
                    command: `${b(cmd.package, cmd.dontUsePackagePrefix,)} tsc${doConf} -w`,
                    name: cmd.id ?? cmd.package,
                    id: cmd.id,
                });
            } else if (
                !devmode &&
                (cmd.runInEnvironments ?? ["dev", "prod"]).includes("prod")
            ) {
                commands.push({
                    command: `${b(cmd.package, cmd.dontUsePackagePrefix,)} tsc${doConf}`,
                    name: cmd.id ?? cmd.package,
                    id: cmd.id,
                });
            }
        } else if (cmd.type === "snowpack") {
            if (devmode && (cmd.runInEnvironments ?? ["dev", "prod"]).includes("dev")) {
                commands.push({
                    command: `${b(cmd.package, cmd.dontUsePackagePrefix)} snowpack dev`,
                    name: cmd.id ?? cmd.package,
                    id: cmd.id,
                })
            } else if (!devmode && (cmd.runInEnvironments ?? ["dev", "prod"]).includes("prod")) {
                commands.push({
                    command: `${b(cmd.package, cmd.dontUsePackagePrefix)} snowpack build`,
                    name: cmd.id ?? cmd.package,
                    id: cmd.id,
                })
            }
        } else if (cmd.type === "storybook") {
            if (devmode && (cmd.runInEnvironments ?? ["dev", "prod"]).includes("dev")) {
                commands.push({
                    command: `${b(cmd.package, cmd.dontUsePackagePrefix)} start-storybook -p ${cmd.port ?? 6006}`,
                    name: cmd.id ?? cmd.package,
                    id: cmd.id,
                })
            } else if (!devmode && (cmd.runInEnvironments ?? ["dev", "prod"]).includes("prod")) {
                commands.push({
                    command: `${b(cmd.package, cmd.dontUsePackagePrefix)} build-storybook -o ${cmd.out ?? "docs"}`,
                    name: cmd.id ?? cmd.package,
                    id: cmd.id,
                })
            }
        } else if(cmd.type === "next") {
            if (devmode && (cmd.runInEnvironments ?? ["dev", "prod"]).includes("dev")) {
                commands.push({
                    command: `${b(cmd.package, cmd.dontUsePackagePrefix)} next dev -p ${cmd.port ?? 3000}`,
                    name: cmd.id ?? cmd.package,
                    id: cmd.id,
                })
            } else if (!devmode && (cmd.runInEnvironments ?? ["dev", "prod"]).includes("prod")) {
                commands.push({
                    command: `${b(cmd.package, cmd.dontUsePackagePrefix)} next build`,
                    name: cmd.id ?? cmd.package,
                    id: cmd.id,
                })
            }
        } else if (cmd.type === "esbuild") {
            if (devmode && (cmd.runInEnvironments ?? ["dev", "prod"]).includes("dev")) {
                commands.push({
                    command: `${b(cmd.package, cmd.dontUsePackagePrefix)} node "${resolve(__dirname, "build")}" esbuild '${JSON.stringify(cmd.options)}' --dev`,
                    name: cmd.id ?? cmd.package,
                    id: cmd.id,
                })
            } else if (!devmode && (cmd.runInEnvironments ?? ["dev", "prod"]).includes("prod")) {
                commands.push({
                    command: `${b(cmd.package, cmd.dontUsePackagePrefix)} node ${resolve(__dirname, "build")} esbuild '${JSON.stringify(cmd.options)}'`,
                    name: cmd.id ?? cmd.package,
                    id: cmd.id,
                })
            }
        }
    }

    return commands;
}

export function runCmd(cmd: ICommand, options: any) {
    console.log(chalk`{green.underline Building ${cmd.name}}`);
    const cmdparts = cmd.command.split(" ");
    if (options.print) console.log(chalk`{gray ${cmd.command}}`);
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
