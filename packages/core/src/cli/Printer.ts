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
		console.log(
			`\n\x1b[1m\x1b[48;2;${color.join(";")}m${
				color.reduce((acc: number, c: number) => acc + c, 0) < 255 * 2
					? "\x1b[37m"
					: ""
			} ${message.toUpperCase().trim()} \x1b[0m`
		);
	}

	public static printSuccess(message: string) {
		console.log(`\x1b[32m✔\x1b[0m ${message}`);
	}

	public static printFailure(message: string) {
		console.log(`\x1b[31mx\x1b[0m ${message}`);
	}

	public static value(value: unknown) {
		if (["string", "number", "boolean"].includes(typeof value)) {
			console.log(`\x1b[34m${value as string | number | boolean}\x1b[0m`);

			return;
		}
		if ([undefined, null].includes(value)) {
			console.log(`\x1b[2m\x1b[31m${value as undefined | null}\x1b[0m`);

			return;
		}

		const color = (code: number, str: string) =>
			`\x1b[0m\x1b[${code}m${str}\x1b[0m\x1b[2m`;

		console.log(
			`\x1b[2m${JSON.stringify(value, null, 2)
				.replace(/:( *("|').*\2 *)(,?\n)/g, `:${color(34, "$1")}$3`)
				.replace(
					/:( *[0-9]+(\.[0-9]+)? *)(,?\n)/g,
					`:${color(33, "$1")}$3`
				)
				.replace(/:( *(true|false) *)(,?\n)/g, `:${color(33, "$1")}$3`)
				.replace(/(\n *("|')*.*\2):/g, `${color(35, "$1")}:`)}\x1b[0m`
		);
	}
}
