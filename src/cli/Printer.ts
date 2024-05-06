/* let lastLogWasIndividual: boolean = false;
console.log = (...message: string[]) => {
    process.stdout.write(styleWrapStr(`${
		!lastLogWasIndividual ? "─── INDIVIDUAL LOG ───\n" : ""
	}${message.join(" ")}\n`, ["2", colorFrom(Layer.FG, 222, 231, 244) ] ));
	
    lastLogWasIndividual = true;
}
console.info = console.log;
console.warn = console.log;
console.error = console.log; */


import { TColor } from "../types";


export class Printer {
	public static printBadge(message: string, color: TColor) {
        console.log(`\x1b[48;2;${color.join(";")}m \x1b[1m${message.toUpperCase().trim()} \x1b[0m\n`);
	}

	public static printSuccess(message: string) {
        console.log(`\x1b[32m✔\x1b[0m ${message}`);
	}
	
	public static printFailure(message: string) {
        console.log(`\x1b[31mx\x1b[0m ${message}`);
	}
}