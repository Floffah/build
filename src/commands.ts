import BuildConfig from "./config";

export function buildCommands(
    config: BuildConfig,
    devmode: boolean,
): { name: string; command: string }[] {
    const commands: { name: string; command: string }[] = [];
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
                    name: `${prefix}${cmd.package}`,
                });
            } else if (
                !devmode &&
                (cmd.runInEnvironments ?? ["dev", "prod"]).includes("prod")
            ) {
                commands.push({
                    command: `${b(cmd.package, cmd.dontUsePackagePrefix,)} ${cmd.command}`,
                    name: `${prefix}${cmd.package}`,
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
                    name: `${prefix}${cmd.package}`,
                });
            } else if (
                !devmode &&
                (cmd.runInEnvironments ?? ["dev", "prod"]).includes("prod")
            ) {
                commands.push({
                    command: `${b(cmd.package, cmd.dontUsePackagePrefix,)} tsc${doConf}`,
                    name: `${prefix}${cmd.package}`,
                });
            }
        } else if (cmd.type === "snowpack") {
            if (devmode && (cmd.runInEnvironments ?? ["dev", "prod"]).includes("dev")) {
                commands.push({
                    command: `${b(cmd.package, cmd.dontUsePackagePrefix)} snowpack dev`,
                    name: `${prefix}${cmd.package}`,
                })
            } else if (!devmode && (cmd.runInEnvironments ?? ["dev", "prod"]).includes("prod")) {
                commands.push({
                    command: `${b(cmd.package, cmd.dontUsePackagePrefix)} snowpack build`,
                    name: `${prefix}${cmd.package}`,
                })
            }
        } else if (cmd.type === "storybook") {
            if (devmode && (cmd.runInEnvironments ?? ["dev", "prod"]).includes("dev")) {
                commands.push({
                    command: `${b(cmd.package, cmd.dontUsePackagePrefix)} start-storybook -p ${cmd.port ?? 6006}`,
                    name: `${prefix}${cmd.package}`,
                })
            } else if (!devmode && (cmd.runInEnvironments ?? ["dev", "prod"]).includes("prod")) {
                commands.push({
                    command: `${b(cmd.package, cmd.dontUsePackagePrefix)} build-storybook -o ${cmd.out ?? "docs"}`,
                    name: `${prefix}${cmd.package}`,
                })
            }
        }
    }

    return commands;
}
