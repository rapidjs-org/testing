#!/usr/bin/env node


import { existsSync, readFileSync } from "fs";
import { join, resolve as resolvePath } from "path";

import { TColor } from "../types";
import { TResults, ESuite, init } from "../api";

import { Args } from "./Args";
import { Printer } from "./Printer";


async function runSuite(): Promise<TResults> {
	if(!Args.parsePositional(0)) throw new ReferenceError(`Missing test suite name (pos 0)`);

	let classModulePath: string;
	switch(Args.parsePositional(0).toLowerCase()) {
		case "help":
			console.log(readFileSync(join(__dirname, "../../help.txt")).toString());
			process.exit(0);
		case "unit":
			classModulePath = ESuite.UNIT;
			break;
		case "request":
			classModulePath = ESuite.REQUEST;
			break;
		case "dom":
			classModulePath = ESuite.DOM;
			break;
		default:
			classModulePath = resolvePath(Args.parsePositional(0));

			if(!existsSync(classModulePath)) throw new ReferenceError(`Custom test suite module not found '${classModulePath}'`);
	}
	
	if(!Args.parsePositional(1)) throw new ReferenceError(`Missing test directory path (pos 1)`);

	const TestClass = Object.values(await import(resolvePath(classModulePath)))[0] as { suiteTitle: string; suiteColor: TColor; };
	Printer.printBadge((TestClass.suiteTitle || "").replace(/( ?test(s)?)?$/i, " tests"), TestClass.suiteColor ?? [ 225, 225, 225 ]);
		
	return await init(resolvePath(classModulePath), Args.parsePositional(1));
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
	}s)\x1b[0m\n`);
	
	process.exit(counter.failure ? 1 : 0);
})
.catch((err: Error) => {
	console.error(`\n\x1b[31m${err.stack ?? `${err.name}: ${err.message}`}\x1b[0m`);

	process.exit(1);
});


process.on("exit", () => console.log(""));


/* process.on("SIGTERM", () => process.exit(1));
process.on("SIGINT", () => process.exit(1)); */