#!/usr/bin/env node

import { readFileSync, cpSync } from "fs";
import { join, resolve as resolvePath } from "path";

import { Args } from "./Args";

if (Args.parsePositional(1) === "help" || Args.parseFlag("help", "H")) {
	console.log(readFileSync(join(__dirname, "../../help.gen.txt")).toString());

	process.exit(0);
}

function print(message: string) {
	console.log(`\x1b[34m\x1b[> \x1b[22m${message}\x1b[0m`);
}

function handleError(err: Error) {
	console.error(`\n\x1b[31m${err.toString()}\x1b[0m`);
}

process.on("uncaughtException", handleError);
process.on("unhandledRejection", handleError);

const command: string = Args.parsePositional(1);

if (!command) throw new SyntaxError("Missing command (pos 1) (gen)");

switch (command) {
	case "template": {
		const targetPath: string = resolvePath(
			Args.parseOption("path", "P") ?? "",
			Args.parseOption("name", "N") ?? "generated-suite"
		);

		cpSync(join(__dirname, "../../template/"), targetPath, {
			recursive: true
		});

		print(`Generated suite package template '${targetPath}'`);

		break;
	}
	default:
		throw new SyntaxError(`Unknown command '${command}' (gen)`);
}
