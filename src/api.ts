import { readdir, existsSync, lstatSync } from "fs";
import { join, basename, resolve as resolvePath } from "path";

import { Test } from "./Test";
import { AsyncMutex } from "./AsyncMutex";
import { Env } from "./Env";

import _config from "./config.json";


type TRecord = { [ key: string ]: Test[]; };

export type TResults = {
	time: number;
	record: TRecord;
};


const RECORD: TRecord = {};

const importMutex = new AsyncMutex();


function traversePath(path: string, fileCallback: ((filepath: string) => void) = () => {}) {
	const handleFilepath = (filepath: string) => {
		if(!/^[^#].*\.test\.js$/.test(basename(filepath))) return;
		
		fileCallback(filepath);

		importMutex.lock(() => import(filepath));
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


export const ESuite = {
	UNIT: join(__dirname, "./suites/UnitTest"),
	REQUEST: join(__dirname, "./suites/RequestTest"),
	DOM: join(__dirname, "./suites/DomTest")
}

export async function init(testSuiteModulePath: string, testDirPath: string): Promise<TResults>;
export async function init(testSuiteAPI: { [ key: string]: Test }, testDirPath: string): Promise<TResults>;
export async function init(apiArg: unknown, testDirPath: string): Promise<TResults> {
	const testSuiteAPI: { [ key: string]: Test } = (typeof(apiArg) === "string")
	? await import(resolvePath(apiArg))
	: apiArg;

	const TestClass = Object.entries(testSuiteAPI)[0];
	if(TestClass[0] === "default" || (Object.getPrototypeOf(TestClass[1]).name !== "Test")) {
		throw new SyntaxError("Test suite module must provide a single named concrete Test class export");
	}
	
	if(!existsSync(testDirPath)) throw new ReferenceError(`Test directory not found '${testDirPath}'`);
	
	// @ts-ignore
	global[TestClass[0]] = TestClass[1];
	
	const testEnv = new Env(testDirPath);

	return new Promise<TResults>(async (resolve, reject) => {		
		const captureError = async (err: Error) => {
			await testEnv.call("AFTER");
			
			reject(err);

			return;
		};
		process.on("uncaughtException", captureError);
		process.on("unhandledRejection", captureError);
		
		await testEnv.call("BEFORE");
		
		const startTime = Date.now();
		
		Test.event.on("complete", async () => {
			const time = Date.now() - startTime;

			testEnv.call("AFTER");

			resolve({
				time,
				record: RECORD
			});
		});
		
		let activeFilepath: string;
		Test.event.on("create", (test: Test) => {
			RECORD[activeFilepath] = [ RECORD[activeFilepath] ?? [], test ].flat();
		});
		
		traversePath(resolvePath(testDirPath), (filepath: string) => {
			activeFilepath = filepath;
		});
	});
}