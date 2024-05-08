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
exports.Env = void 0;
const path_1 = require("path");
const AsyncMutex_1 = require("./AsyncMutex");
const Promisification_1 = require("./Promisification");
const config_json_1 = __importDefault(require("./config.json"));
class Env {
    constructor(rootDirPath) {
        this.mutex = new AsyncMutex_1.AsyncMutex();
        this.mutex.lock(async () => {
            this.api = await new Promisification_1.Promisification(async () => {
                var _a;
                try {
                    return await (_a = (0, path_1.resolve)(rootDirPath, config_json_1.default.envModuleFilename), Promise.resolve().then(() => __importStar(require(_a))));
                }
                catch (err) {
                    if (err.code === "MODULE_NOT_FOUND")
                        return {};
                    throw err;
                }
            }).resolve();
        });
    }
    call(identifier) {
        return new Promise((resolve) => {
            this.mutex.lock(async () => {
                if (!this.api[identifier]) {
                    resolve();
                    return;
                }
                console.log(`\n\x1b[2m––– ENV: ${identifier} –––\x1b[0m`);
                await new Promisification_1.Promisification(this.api[identifier]).resolve();
                resolve();
            });
        });
    }
}
exports.Env = Env;
//# sourceMappingURL=Env.js.map