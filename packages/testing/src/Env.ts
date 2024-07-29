import { resolve as resolvePath } from "path";

import { Promisification } from "./Promisification";
import { FormatError } from "./FormatError";
import { Args } from "./cli/Args";

import _config from "./config.json";

type TIndexedValue = { [key: string]: unknown };

interface IEnvApi {
	BEFORE?: () => void;
	AFTER?: () => void;
}

export class Env {
	private readonly rootDirPath: string;

	private api: IEnvApi;

	constructor(rootDirPath: string) {
		this.rootDirPath = rootDirPath;
	}

	public async call(identifier: string): Promise<void> {
		if (Args.parseFlag("no-env")) return;

		try {
			this.api =
				this.api ?? ((await import(resolvePath(this.rootDirPath, _config.envModuleFilename))) as IEnvApi);
		} catch (err: unknown) {
			if ((err as { code: string }).code !== "MODULE_NOT_FOUND") {
				throw new FormatError(err, `Cannot evaluate environment module '${_config.envModuleFilename}'`);
			}
			this.api = {};
		}

		if (!(this.api as TIndexedValue)[identifier]) {
			return;
		}

		const heading = `– ENV –– ${identifier} ––––`;

		console.log(`\n\x1b[2m${heading.replace("ENV", "\x1b[1mENV\x1b[22m\x1b[2m")}\x1b[0m`);

		try {
			await new Promisification((this.api as TIndexedValue)[identifier]).resolve();
		} catch (err: unknown) {
			throw new FormatError(err, `Cannot evaluate environment export '${identifier}'`);
		}

		console.log(`\x1b[2m${"–".repeat(heading.length)}\x1b[0m`);
	}
}
