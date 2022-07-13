import { isAbsolute, join } from "path";


const args = process.argv.slice(2);

if(args.length === 0) {
	throw new ReferenceError("Missing test directory argument (index 0)");
}


export const TEST_DIR_PATH: string = !isAbsolute(args[0]) ? join(process.cwd(), args[0]) : args[0];


export function readOption(defaultValue: unknown, name: string, shorthand: string) {
	
}