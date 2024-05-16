#!/usr/bin/env node

import { readFileSync } from "fs";
import { join, resolve as resolvePath } from "path";

import { TColor } from "../types";
import { IResults, init } from "../api";

import { Args } from "./Args";
import { Printer } from "./Printer";

import OFFICIAL_SUITES from "./suites.json";

async function runSuite(): Promise<IResults> {
	if (Args.parsePositional(0) === "help" || Args.parseFlag("help", "H")) {
		console.log(readFileSync(join(__dirname, "../../help.txt")).toString());

		process.exit(0);
	}

	const testSuiteModulePath: string = Args.parsePositional(0);

	if (!testSuiteModulePath) throw new ReferenceError("Missing test suite name (pos 0)");
	if (!Args.parsePositional(1)) throw new ReferenceError("Missing test directory path (pos 1)");

	let testSuiteModuleReference: string;
	try {
		testSuiteModuleReference = require.resolve(
			(OFFICIAL_SUITES as { [key: string]: string })[testSuiteModulePath] ?? testSuiteModulePath
		);
	} catch {
		// TODO: Install if is NPM-ish?

		testSuiteModuleReference = resolvePath(testSuiteModulePath);
	}

	try {
		const TestClass = Object.values(
			(await import(testSuiteModuleReference)) as { [s: string]: unknown } | ArrayLike<unknown>
		)[0] as { suiteTitle: string; suiteColor: TColor };
		Printer.printBadge(
			(TestClass.suiteTitle || "").replace(/( ?test(s)?)?$/i, " tests"),
			TestClass.suiteColor ?? [225, 225, 225]
		);
	} catch {}

	return await init(testSuiteModuleReference, Args.parsePositional(1));
}

runSuite()
	.then((results: IResults) => {
		const counter = {
			success: 0,
			failure: 0
		};

		if (!Object.keys(results.record).length) {
			Printer.warn("No tests defined");

			process.exit(0);
		}

		for (const filepath in results.record) {
			console.log(`\n• ${filepath}\x1b[0m`);

			!results.record[filepath].length && Printer.warn("No test case defined");

			for (const test of results.record[filepath]) {
				counter.success += +test.wasSuccessful;
				counter.failure += +!test.wasSuccessful;

				if (test.wasSuccessful) {
					console.log(`\x1b[32m✔ ∟ ${test.title}\x1b[0m`);

					continue;
				}

				console.log(
					`\x1b[31m✘ \x1b[1m∟ ${test.title}\x1b[0m${
						test.sourcePosition ? ` \x1b[2m(${test.sourcePosition})\x1b[0m` : ""
					}\n`
				);
				console.log("\x1b[1m\x1b[2mEXPECTED:\x1b[0m\n");
				Printer.value(test.difference.expected);
				console.log("\n\x1b[1m\x1b[2mACTUAL:\x1b[0m\n");
				Printer.value(test.difference.actual);
				console.log(
					`\x1b[0m\x1b[2m${Array.from({ length: test.title.length + 2 }, () => "–").join("")}\x1b[0m`
				);
			}
		}

		console.log(
			`\n${
				!counter.failure
					? "\x1b[32m✔ Test suite \x1b[1msucceeded\x1b[22m"
					: "\x1b[31m✘ Test suite \x1b[1mfailed\x1b[22m"
			} (${Math.round(
				(counter.success / (counter.success + counter.failure) || 1) * 100
			)}% (${counter.success}/${counter.success + counter.failure}) successful, ${
				results.time > 1000
					? `${Math.round((results.time * 0.001 + Number.EPSILON) * 100) / 100}s`
					: `${results.time}ms`
			})\x1b[0m`
		);

		process.exit(counter.failure ? 1 : 0);
	})
	.catch((err: Error) => {
		const testFileMentionRegex = /([^/]+\.test\.js)([^\w\d]|$)/;

		const errorStackLines: string[] = (err.stack ?? `${err.name}: ${err.message}`).split(/\n/g);
		/* errorStackLines = errorStackLines
		.slice(0, errorStackLines.length - errorStackLines.slice()
		.reverse()
		.findIndex((line: string) => testFileMentionRegex.test(line))); */

		console.error(
			`\n\x1b[31m${[errorStackLines.slice(0, -1), errorStackLines.slice(-1)[0]]
				.flat()
				.join("\n")
				.replace(testFileMentionRegex, "\x1b[1m$1\x1b[22m$2")}\x1b[0m`
		);

		process.exit(1);
	});
