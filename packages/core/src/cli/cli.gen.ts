#!/usr/bin/env node


import { cpSync } from "fs";
import { join, resolve as resolvePath } from "path";

import { Args } from "./Args";


function print(message: string) {
	console.log(`\x1b[34m\x1b[> \x1b[22m${message}\x1b[0m`);
}

function handleError(err: Error|unknown) {
	console.error(`\n\x1b[31m${err.toString()}\x1b[0m`);
}


process.on("uncaughtException", handleError);
process.on("unhandledRejection", handleError);


const command: string = Args.parsePositional(0);

if(!command) throw new SyntaxError("Missing command (pos 0)");


switch(command) {
	case "suite":
		console.log(Args.parseOption("path", "P") ?? "")
		const targetPath = resolvePath(Args.parseOption("path", "P") ?? "", Args.parseOption("name", "N") ?? "generated-suite");

		cpSync(join(__dirname, "../../template/"), targetPath, {
			recursive: true
		});

		print(`Generated suite package template '${targetPath}'`);

		break;
	default:
		throw new SyntaxError(`Unknown command '${command}'`);
}