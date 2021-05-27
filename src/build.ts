import {program} from "commander";
import buildCommand from "./commands/build";
import devCommand from "./commands/dev";
import runCommand from "./commands/run";
import esbuildCommand from "./commands/esbuild";

program
    .version("0.0.1")
    .name("Build")
    .description(
        "Command line tool for building all or individual monorepo packages for production or development.",
    );

program.command("build")
    .description("Run all build scripts (in order)")
    .option("-c, --config <path>", "Use a different .buildrc file")
    .option("-q, --quiet", "Pass this option to not print command output")
    .option("-f, --from", "Relative path to use as the working directory")
    .option("-p, --print", "Prints commands as they are run")
    .option("-e, --exclude <command>", "Exclude a command or multiple commands separated by a comma. Uses id names")
    .action(async (opts) => await buildCommand(opts));

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
    .action(async (opts) => await devCommand(opts));

program
    .command("run <command>")
    .description("Run a specific command. Uses ids set in your build config. You can also pass multiple with a comma separating them which will run commands in that order. E.g. `build run somecommand` or `build run command1,command2`")
    .option("-c, --config <path>", "Use a different .buildrc file")
    .option("-q, --quiet", "Pass this option to not print command output")
    .option("-f, --from", "Relative path to use as the working directory")
    .option("-p, --print", "Prints commands as they are run")
    .action(async (cmd, opts) => await runCommand(cmd, opts));

program
    .command("esbuild")
    .option("-u, --use <module>", "Module to use. Should be estrella or esbuild.", "esbuild")
    .option("-i, --in <paths>", "In file(s). If multiple, separate with a comma.")
    .option("-o, --out <path>", "Out file/dir. Set to a dir when using multiple in files, otherwise, use a file")
    .option("-c, --config <path>", "Path to a config file to pass to esbuild/estrella (can be a json or js file")
    .option("-w, --watch", "Effectively development mode")
    .action(async (opts) => await esbuildCommand(opts));


program.parse(process.argv);
