import Docker from "dockerode";
export declare function imageExists(imageName: string): Promise<boolean>;
export interface RunContainerOptions extends Docker.ContainerCreateOptions {
    Image: string;
    verbose?: boolean;
}
export declare const run: (opts: RunContainerOptions) => Promise<Docker.Container>;
export type RunSimpleOptions = {
    autoRemove?: boolean;
    bindMounts?: {
        [hostPath: string]: string;
    };
    cmd?: Docker.ContainerCreateOptions["Cmd"];
    env?: {
        [key: string]: string;
    };
    image: string;
    name?: string;
    ports?: {
        [containerTcpPort: string]: string;
    };
    verbose?: boolean;
};
export declare const runSimple: (opts: RunSimpleOptions) => Promise<Docker.Container>;
//# sourceMappingURL=run-container.d.ts.map