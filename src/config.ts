export default interface BuildConfig {
    /**
     * Whether or not to enable the windows terminal when on windows and in dev mode
     * @TJS-default false
     */
    enableTerminal?: boolean;
    /**
     * Platforms to support and build commands for
     */
    allowedTargets: ("win" | "linux")[];
    /**
     * The commands to run.
     * Will run in the order found.
     */
    commands: Command[];
    /**
     * What to prefix package names with
     * @TJS-default ""
     */
    packagePrefix?: string;
}

export type Command =
    TSBuildCommand
    | CustomBuildCommand
    | SnowpackBuildCommand
    | StorybookBuildCommand
    | NextBuildCommand
    | ESBuildCommand;

/**
 * Base build command
 */
export interface BuildCommand {
    /**
     * The type of build
     */
    type: "typescript" | "custom" | "snowpack" | "storybook" | "next" | "esbuild";
    /**
     * Environments to run in
     */
    runInEnvironments?: ("dev" | "prod")[];
    /**
     * Name of the build
     */
    id: string;
    /**
     * The name of the package/workspace to give yarn
     */
    package: string;
    /**
     * Enable if you dont want to prefix this with the package prefix
     */
    dontUsePackagePrefix?: boolean;
}

/**
 * Typescript build information
 */
export interface TSBuildCommand extends BuildCommand {
    /**
     * The type of build
     */
    type: "typescript";
    /**
     * Relative path to an alternate config
     */
    alternateConfig?: string;
}

export interface CustomBuildCommand extends BuildCommand {
    /**
     * The type of build
     */
    type: "custom";
    /**
     * The command to run in that workspace while in production mode
     */
    command: string;
    /**
     * The command to run in that workspace while in development mode
     */
    devcommand?: string;
}

export interface SnowpackBuildCommand extends BuildCommand {
    /**
     * The type of build
     */
    type: "snowpack"
    /**
     * Relative path to an alternate config
     */
    alternateConfig: string;
}

export interface StorybookBuildCommand extends BuildCommand {
    /**
     * The type of build
     */
    type: "storybook";
    /**
     * The port to use in development mode
     * @TJS-default 6006
     */
    port?: number;
    /**
     * The out directory to pass in production mode
     */
    out?: string;
}

export interface NextBuildCommand extends BuildCommand {
    type: "next"
    /**
     * Port to use in development mode
     * @TJS-default 3000
     */
    port: number;
}

export interface ESBuildCommand extends BuildCommand {
    type: "esbuild";
    /**
     * File(s) to process
     */
    in: string | string[];
    /**
     * File to bundle to or directory to bundle to.
     * Treated as a file when {@link ESBuildCommand.in} is a string, treated as a directory when {@link ESBuildCommand.in} is an array of strings
     * @TJS-default "dist"
     */
    out?: string;
    /**
     * Override what package to use.
     * If this isn't defined, build will use esbuild if estrella isn't installed, and use estrella if it is installed.
     */
    use?: "esbuild"|"estrella";
    /**
     * Path to a config file.
     * Can be a json or js file.
     * @TJS-required
     */
    config: string;
}
