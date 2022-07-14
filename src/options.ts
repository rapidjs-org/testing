/**
 * Module containing a CLI option parsing and resolution interface.
 */


import { isAbsolute, join } from "path";


const args = process.argv.slice(2);

if(args.length === 0) {
	throw new ReferenceError("Missing test directory argument (index 0)");
}


interface IResolveInterface {
	string: () => string;
	number: () => number;
	boolean: () => boolean;
}


const testDirPathArg = args.shift();
const readStorage: Map<string, IResolveInterface> = new Map();


/**
 * Create an option / argument type resolve interface.
 * @param {*} value Value
 * @returns {IResolveInterface} Resolve interface
 */
function createResolveInterface(value: unknown): IResolveInterface {
	return {
		string: () => value ? value.toString() : null,
		number: () => value ? parseFloat(value.toString()) : null,
		boolean: () => !!value
	};
}


/**
 * Statically provided test directory path (first CLI argument).
 * Translated to absolute local path representation.
 * @constant {string}
 */
export const TEST_DIR_PATH: string = !isAbsolute(testDirPathArg) ? join(process.cwd(), testDirPathArg) : testDirPathArg;


/**
 * Read a CLI option.
 * @param {string} name Option name (--<shorthand>)
 * @param {string} [shorthand] Optional option name shorthand (-<shorthand>)
 * @param {*} [defaultValue] Optional default value to use if no associated value given
 * @returns {IResolveInterface} Value resolve interface (for type accordance)
 */
export function readOption(name: string, shorthand?: string, defaultValue?: unknown) {
	if(readStorage.has(name)) {
		return readStorage.get(name);
	}

	const topArgIndex = Math.max(args.lastIndexOf(`--${name}`), shorthand ? args.lastIndexOf(`-${shorthand}`) : -1);
	
	const result: IResolveInterface = createResolveInterface((topArgIndex > -1)
		? args[topArgIndex + 1] || (defaultValue || true)
		: defaultValue);	// TODO: Fix
	
	readStorage.set(name, result);

	return result;
}