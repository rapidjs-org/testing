/**
 * == SUB-PORCESS ==
 * Sub-module for maintaining a test enviornment context for event
 * related module executions.
 */


import { existsSync } from "fs";


console.log = (...message: string[]) => {
    process.stdout.write(`\x1b[2m${message.join(" ")}\x1b[0m\n`);
}
console.info = console.log;
console.warn = console.log;
console.error = console.log;


process.on("message", (eventFilePath: string) => {
	if(!existsSync(eventFilePath)) {
		return;
	}

	require(eventFilePath);

	console.log("");

	process.send(1);
});


process.send(0);