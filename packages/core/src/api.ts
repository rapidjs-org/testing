import { readdir, existsSync, lstatSync } from "fs";
import { join, resolve as resolvePath } from "path";

import { Test } from "./Test";
import { AsyncMutex } from "./AsyncMutex";
import { Env } from "./Env";

import _config from "./config.json";
import { FormatError } from "./FormatError";


type TRecord = { [ key: string ]: Test[]; };

export type TResults = {
	time: number;
	record: TRecord;
};


interface IOptions {
	
}


const DEFAULT_OPTIONS: IOptions = {

};

const curTestRecord: TRecord = {};
const importMutex = new AsyncMutex();


function traversePath(path: string, fileCallback: ((filepath: string) => void) = () => {}) {
	const handleFilepath = (filepath: string) => {
		if(!/[^#][^/]+\.test\.js$/.test(filepath)) return;
		
		fileCallback(filepath);
		
		importMutex.lock(() => import(filepath))
		.catch((err: Error) => {
			throw new FormatError(err, "Cannot evaluate test file");
		});
	};

	if(lstatSync(path).isFile()) {
		handleFilepath(path);

		return;
	}

	readdir(path, {
		withFileTypes: true
	}, (err, dirents) => {
		if(err) throw err;
		
		dirents.forEach(dirent => {
			const filepath = join(path, dirent.name);
			if(dirent.isDirectory()) {
				traversePath(filepath);
				
				return;
			}
			
			handleFilepath(filepath);
		});
	});
}


export { Test } from "./Test";

export async function init(testSuiteModulePath: string, testTargetPath: string, options?: IOptions): Promise<TResults>;
export async function init(testSuiteAPI: { [ key: string]: Test }, testTargetPath: string, options?: IOptions): Promise<TResults>;
export async function init(apiArg: unknown, testTargetPath: string, options?: IOptions): Promise<TResults> {
	const testSuiteAPI = (typeof(apiArg) === "string")
	? await new Promise<{ [ key: string]: Test }>(async (resolve, reject) => {
		const testSuiteModulePath: string = resolvePath(apiArg);
		!existsSync(testSuiteModulePath)
		? reject(new ReferenceError(`Test suite module not found '${testSuiteModulePath}'`))
		: resolve(await import(testSuiteModulePath));
	})
	: apiArg as { [ key: string]: Test };

	const TestClass = Object.entries(testSuiteAPI)[0];
	if(TestClass[0] === "default" || (Object.getPrototypeOf(TestClass[1]).name !== "Test")) {
		throw new SyntaxError("Test suite module must provide a single named concrete Test class export");
	}
	
	const resolvedTestTargetPath: string = resolvePath(testTargetPath);
	if(!existsSync(resolvedTestTargetPath)) {
		throw new ReferenceError(`Test ${/\.test\.js$/i.test(testTargetPath) ? "file" : "directory"} not found '${resolvedTestTargetPath}'`);
	}

	const optionsWithDefaults: IOptions = {
		...DEFAULT_OPTIONS,
		...options ?? {}
	};	// TODO: Use
	
	// @ts-ignore
	global[TestClass[0]] = TestClass[1];
	
	const testEnv = new Env(testTargetPath);
	
	return new Promise<TResults>(async (resolve, reject) => {
		try {
			await testEnv.call("BEFORE");
		} catch(err: unknown) {
			reject(err);

			return;
		}
		
		let wasAborted = false;	
		const captureError = async (err: Error) => {
			if(wasAborted) return;
			wasAborted = true;
			
			await testEnv.call("AFTER");

			reject(err);

			return;
		};
		process.on("uncaughtException", captureError);
		process.on("unhandledRejection", captureError);
		
		const startTime = Date.now();
		
		Test.event.on("complete", async () => {
			const time = Date.now() - startTime;

			await testEnv.call("AFTER");

			resolve({
				time,
				record: curTestRecord
			});
		});
		
		let activeFilepath: string;
		Test.event.on("create", (test: Test) => {
			curTestRecord[activeFilepath] = [ curTestRecord[activeFilepath] ?? [], test ].flat();
		});
		
		traversePath(resolvedTestTargetPath, (filepath: string) => {
			activeFilepath = filepath;
		});
	});
}