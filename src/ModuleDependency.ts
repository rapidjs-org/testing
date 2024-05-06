const { join, basename } = require("path");
const { existsSync, readdir } = require("fs");


/* const TEST_PATH = join(process.cwd(), process.argv.slice(2)[1] || "");
if(!existsSync(TEST_PATH)) throw new ReferenceError(`Test directory not found '${TEST_PATH}'`);
const BEFORE_SCRIPT_FILENAME = "_before.js";
const AFTER_SCRIPT_FILENAME = "_after.js";
const INTERMEDIATE_TIMEOUT = 3000;


const evalIntermediateScript = (scriptFilename) => {
	if(!existsSync(join(TEST_PATH, scriptFilename))) return Promise.resolve();

	console.log(`\n\x1b[2m→ \x1b[1mINTERMEDIATE SCRIPT\x1b[22m\x1b[2m ${scriptFilename}\x1b[0m\n`);
    
	let exp = require(join(TEST_PATH, scriptFilename));
	exp = (exp instanceof Function) ? exp() : exp;
	return ((exp instanceof Promise)
		? new Promise(async (resolve, reject) => {
			const timeout = setTimeout(() => reject(new RangeError(`Intermediate script timeout on '${scriptFilename}'`)), INTERMEDIATE_TIMEOUT);
			await exp;
			clearTimeout(timeout);
			resolve();
		})
		: Promise.resolve());
}; */