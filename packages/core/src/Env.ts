import { resolve as resolvePath } from "path";

import { AsyncMutex } from "./AsyncMutex";
import { Promisification } from "./Promisification";

import _config from "./config.json";


interface IEnvApi {
    BEFORE?: (() => void);
    AFTER?: (() => void);
}


export class Env {
    private readonly mutex = new AsyncMutex();

    private api: IEnvApi;

    constructor(rootDirPath: string) {
        this.mutex.lock(async () => {
            this.api = await new Promisification<IEnvApi>(async () => {
                try {
                    return await import(resolvePath(rootDirPath, _config.envModuleFilename));
                } catch(err: unknown) {
                    if((err as { code: string; }).code === "MODULE_NOT_FOUND") return {};
                    throw err;
                }
            }).resolve();
        });
    }

    public call(identifier: string): Promise<void> {
		type TIndexedValue = { [ key: string ]: unknown; };

        return new Promise((resolve) => {
            this.mutex.lock(async () => {
                if(!(this.api as TIndexedValue)[identifier]) {
                    resolve();
                    
                    return;
                }

                console.log(`\n\x1b[2m––– ENV: ${identifier} –––\x1b[0m`);
                
                await new Promisification((this.api as TIndexedValue)[identifier]).resolve();

                resolve();
            });
        });
    }
}