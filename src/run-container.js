"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSimple = exports.run = void 0;
exports.imageExists = imageExists;
const dockerode_1 = __importDefault(require("dockerode"));
const execa_1 = __importDefault(require("execa"));
const path = __importStar(require("path"));
async function imageExists(imageName) {
    try {
        await (0, execa_1.default)("docker", ["image", "inspect", imageName], { stdio: "ignore" });
        return true;
    }
    catch (err) {
        // @TODO improve robustness of this sloppy catch
        return false;
    }
}
const run = async (opts) => {
    const docker = new dockerode_1.default();
    const { Image: image, verbose = false } = opts;
    if (!(await imageExists(image))) {
        await (0, execa_1.default)("docker", ["pull", image], verbose ? { stdio: "inherit" } : undefined);
    }
    const { 
    // handled opts
    verbose: _verbose, 
    // unhandled opts
    ...dockerodeContainerCreateOpts } = opts;
    const container = await docker.createContainer(dockerodeContainerCreateOpts);
    await container.start();
    return container;
};
exports.run = run;
const runSimple = async (opts) => {
    if (!opts) {
        throw new Error("expected runSimple RunSimpleOptions configuration object");
    }
    const { autoRemove, bindMounts = {}, cmd, env = {}, image: Image, name, ports = {}, verbose, } = opts;
    const dockerodeConfig = {
        Env: [],
        Image,
        HostConfig: {
            Binds: [],
            PortBindings: {},
        },
    };
    if (autoRemove !== undefined) {
        dockerodeConfig.HostConfig.AutoRemove = !!autoRemove;
    }
    if (cmd !== undefined) {
        dockerodeConfig.Cmd = cmd;
    }
    if (name !== undefined)
        dockerodeConfig.name = name;
    for (const containerPort in ports) {
        const hostPort = ports[containerPort];
        const tcpContainerPort = containerPort.match(/tcp/)
            ? containerPort
            : `${containerPort}/tcp`;
        const nextExposedPorts = dockerodeConfig.ExposedPorts || {};
        dockerodeConfig.ExposedPorts = nextExposedPorts;
        nextExposedPorts[tcpContainerPort] = {};
        dockerodeConfig.HostConfig.PortBindings[tcpContainerPort] = [
            { HostPort: hostPort },
        ];
    }
    for (const hostVolume in bindMounts) {
        const containerVolume = bindMounts[hostVolume];
        dockerodeConfig.HostConfig.Binds.push(`${path.resolve(hostVolume)}:${containerVolume}`);
    }
    for (const key in env) {
        dockerodeConfig.Env.push(`${key}=${env[key]}`);
    }
    return (0, exports.run)({ ...dockerodeConfig, verbose });
};
exports.runSimple = runSimple;
//# sourceMappingURL=run-container.js.map