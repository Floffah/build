import {getConfig} from "../util/configs";
import {buildCommands} from "../util/commands";
import {runBuiltCommand} from "./build";

export interface RunCommandOpts {
    config: string;
    quiet: boolean;
    from: string;
    print: boolean;
}

export default async function runCommand(cmd: string, opts: RunCommandOpts) {
    const config = getConfig(opts.config, opts.from);
    const bcmds = buildCommands(config, false);
    const cmds = cmd.split(",").map((c) => c.toLowerCase());
    let commands = [...bcmds];

    commands = commands.filter((v) => cmds.includes(v.id.toLowerCase())).sort((a, b) => cmds.indexOf(a.id.toLowerCase()) - cmds.indexOf(b.id.toLowerCase()));

    for (const cmd of commands) {
        if (cmd.id && (cmd.id && cmds.includes(cmd.id.toLowerCase()))) await runBuiltCommand(cmd, opts);
    }
}
