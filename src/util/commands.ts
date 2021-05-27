import {resolve} from "path";
import BuildConfig, {
    CustomBuildCommand,
    ESBuildCommand,
    NextBuildCommand,
    SnowpackBuildCommand,
    StorybookBuildCommand,
    TSBuildCommand
} from "../config";
import {canResolve} from "./modules";
import {platform} from "os";

// [do yarn prefix, command, dev command override, dev command override append mode (normally replace) ]
const commands: { [k: string]: (cmd: any, cfg: BuildConfig, dev: boolean) => ([boolean, string] | [boolean, string, string | undefined, boolean | undefined]) } = {
    custom: (cmd: CustomBuildCommand) => [true, cmd.command, cmd.devcommand, false],

    typescript: (cmd: TSBuildCommand) => [true, `tsc` + (cmd.alternateConfig ? `--p ${cmd.alternateConfig}` : ""), `-w`, true],

    snowpack: (cmd: SnowpackBuildCommand) => {
        const extra = cmd.alternateConfig ? ` --config ${cmd.alternateConfig}` : "";
        return [true, "snowpack build" + extra, "snowpack dev" + extra, false];
    },

    storybook: (cmd: StorybookBuildCommand) => [true, `build-storybook -o ${cmd.out ?? "docs"}`, `start-storybook -p ${cmd.port ?? 6006}`, false],

    next: (cmd: NextBuildCommand) => [true, "next build", `next dev -p ${cmd.port ?? 3000}`, false],

    // __filename because this is build with estrella so its all one file anyway
    esbuild: (cmd: ESBuildCommand) => [true, `node "${resolve(__filename)}" esbuild --use ${canResolve("estrella") ? "estrella" : "esbuild"} --in "${Array.isArray(cmd.in) ? cmd.in.join(",") : cmd.in}" --out "${cmd.out ?? "dist"}" --config "${resolve(cmd.config)}"`, "--watch", true]
};

export function buildCommands(config: BuildConfig, dev: boolean) {
    let cmds: BuiltCommand[] = [];

    for (const cmd of config.commands) {
        if ((cmd.runInEnvironments ?? ["dev", "prod"]).includes(dev ? "dev" : "prod") && Object.prototype.hasOwnProperty.call(commands, cmd.type)) {
            const [yarnPrefix, prodCmd, devCmd, appendMode] = commands[cmd.type](cmd, config, dev);

            let finalcmd = "";

            if (!dev) finalcmd = prodCmd;
            else if (dev) {
                if (appendMode && devCmd) finalcmd = prodCmd + " " + devCmd;
                else if (devCmd) finalcmd = devCmd;
            }

            if (yarnPrefix) finalcmd = `${platform() === "win32" ? "yarn.cmd" : "yarn"} workspace ${cmd.dontUsePackagePrefix ? "" : config.packagePrefix}${cmd.package} ` + finalcmd;

            cmds.push({
                command: finalcmd,
                id: cmd.id,
                name: cmd.id ?? cmd.package
            });
        }
    }

    return cmds;
}

export interface BuiltCommand {
    command: string;
    name: string;
    id: string;
}
