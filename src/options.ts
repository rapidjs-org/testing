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


// TODO: Config files?


function createResolveInterface(value: unknown): IResolveInterface {
	return {
		string: () => value ? value.toString() : null,
		number: () => value ? parseFloat(value.toString()) : null,
		boolean: () => !!value
	};
}


export const TEST_DIR_PATH: string = !isAbsolute(testDirPathArg) ? join(process.cwd(), testDirPathArg) : testDirPathArg;


export function readOption(defaultValue: unknown, name: string, shorthand?: string) {
	if(readStorage.has(name)) {
		return readStorage.get(name);
	}

	const topArgIndex = Math.max(args.lastIndexOf(`-${name}`), shorthand ? args.lastIndexOf(`--${shorthand}`) : -1);

	const result: IResolveInterface = createResolveInterface((topArgIndex > -1)
	? args[topArgIndex + 1] || defaultValue
	: defaultValue);
	
	readStorage.set(name, result);

	return result;
}