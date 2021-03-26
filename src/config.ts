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
    packagePrefix: string;
}

export type Command = TSBuildCommand | CustomBuildCommand;

/**
 * Base build command
 */
export interface BuildCommand {
    /**
     * The type of build
     * Currently implemented:
     *  - typescript
     *  - custom
     * Unimplemented:
     *  - snowpack
     *  - storybook
     */
    type: "typescript" | "custom" | "snowpack" | "storybook";
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
     * Whether or not to use an alternate config
     */
    useAlternateConfig: boolean;
    /**
     * Relative path to the alternate config
     */
    alternateConfig: string;
}

export interface CustomBuildCommand extends BuildCommand {
    /**
     * The type of build
     */
    type: "custom";
    /**
     * The command to run in that workspace
     */
    command: string;
}
