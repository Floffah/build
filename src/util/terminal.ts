import {BuiltCommand} from "./commands";

export function buildTerminalCommand(cmds: BuiltCommand[], exclude: string[]) {
    let final = "";

    for (const cmd of cmds) {
        if (!cmd.id || (cmd.id && !exclude.includes(cmd.id.toLowerCase()))) final += `new-tab --startingDirectory ./ --title ${cmd.name} ${cmd.command}; `;
    }

    final = "wt " + final.replace(/; $/, "");
    return final;
}
