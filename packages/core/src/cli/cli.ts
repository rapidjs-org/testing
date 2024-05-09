#!/usr/bin/env node


import { readFileSync } from "fs";
import { join, resolve as resolvePath } from "path";

import { TColor } from "../types";
import { TResults, init } from "../api";

import { Args } from "./Args";
import { Printer } from "./Printer";

import OFFICIAL_SUITES from "./suites.json";


async function runSuite(): Promise<TResults> {
	if(Args.parsePositional(0) === "help" || Args.parseFlag("help", "H")) {
		console.log(readFileSync(join(__dirname, "../../help.txt")).toString());
		
		process.exit(0);
	}

	const testSuiteModuleReference: string = Args.parsePositional(0);

	if(!testSuiteModuleReference) throw new ReferenceError(`Missing test suite name (pos 0)`);
	if(!Args.parsePositional(1)) throw new ReferenceError(`Missing test directory path (pos 1)`);

	let testSuiteModulePath: string;
	try {
		testSuiteModulePath = require
		.resolve((OFFICIAL_SUITES as { [ key: string ]: string; })[testSuiteModuleReference] ?? testSuiteModuleReference);
	} catch {
		testSuiteModulePath = resolvePath(testSuiteModuleReference);
	}
	
	try {
		const TestClass = Object.values(await import(testSuiteModulePath))[0] as { suiteTitle: string; suiteColor: TColor; };
		Printer.printBadge((TestClass.suiteTitle || "").replace(/( ?test(s)?)?$/i, " tests"), TestClass.suiteColor ?? [ 225, 225, 225 ]);
	} catch {}

	return await init(testSuiteModulePath, Args.parsePositional(1));
}


runSuite()
.then((results: TResults) => {
	const counter = {
		success: 0,
		failure: 0
	};

	for(let filepath in results.record) {
		console.log(`\n• ${filepath}\x1b[0m`);

		for(let test of results.record[filepath]) {
			counter.success += +test.wasSuccessful;
			counter.failure += +!test.wasSuccessful;

			if(test.wasSuccessful) {
				console.log(`\x1b[32m✔ ∟ ${test.title}\x1b[0m`);

				continue;
			}
			
			const printObj = (obj: unknown) => {
				if([ "string", "number", "boolean" ].includes(typeof(obj))){
					return `\x1b[34m${obj}\x1b[0m`;
				}
				if([ undefined, null ].includes(obj)){
					return `\x1b[2m\x1b[31m${obj}\x1b[0m`;
				}
				const color = (code: number, str: string) => `\x1b[0m\x1b[${code}m${str}\x1b[0m\x1b[2m`;
				return `\x1b[2m${
					JSON.stringify(obj, null, 2)
						.replace(/:( *("|').*\2 *)(,?\n)/g, `:${color(34, "$1")}$3`)
						.replace(/:( *[0-9]+(\.[0-9]+)? *)(,?\n)/g, `:${color(33, "$1")}$3`)
						.replace(/:( *(true|false) *)(,?\n)/g, `:${color(33, "$1")}$3`)
						.replace(/(\n *("|')*.*\2):/g, `${color(35, "$1")}:`)
				}\x1b[0m`;
			};

			console.log(`\x1b[31m✘ \x1b[1m∟ ${test.title}\x1b[0m${
				test.sourcePosition ? ` \x1b[2m(${test.sourcePosition})\x1b[0m` : ""
			}\n`);
			console.log("\x1b[1m\x1b[2mEXPECTED:\x1b[0m\n");
			console.log(printObj(test.displayExpected));
			console.log("\n\x1b[1m\x1b[2mACTUAL:\x1b[0m\n");
			console.log(printObj(test.displayActual));
			console.log(`\x1b[0m\x1b[2m${
				Array.from({ length: test.title.length + 2 }, () => "–").join("")
			}\x1b[0m`);
		}
	}
	
	console.log(`\n${
		!counter.failure
		? "\x1b[32m✔ Test suite \x1b[1msucceeded\x1b[22m"
		: "\x1b[31m✘ Test suite \x1b[1mfailed\x1b[22m"
	} (${
		Math.round((counter.success / (counter.success + counter.failure) || 1) * 100)
	}% (${counter.success}/${counter.success + counter.failure}) successful, ${
		Math.round(results.time * 0.001)
	}s)\x1b[0m`);
	
	process.exit(counter.failure ? 1 : 0);
})
.catch((err: Error) => {
	const testFileMentionRegex = /([^/]+\.test\.js)([^\w\d]|$)/;

	let errorStackLines: string[] = (err.stack ?? `${err.name}: ${err.message}`).split(/\n/g);
	errorStackLines = errorStackLines
	.slice(0, errorStackLines.length - errorStackLines.slice()
		.reverse()
		.findIndex((line: string) => testFileMentionRegex.test(line)));

	console.error(`\n\x1b[31m${
		[
			errorStackLines.slice(0, -1),
			errorStackLines.slice(-1)[0]
			.replace(testFileMentionRegex, "\x1b[1m$1\x1b[22m$2")
		].flat().join("\n")
	}\x1b[0m`);

	process.exit(1);
});