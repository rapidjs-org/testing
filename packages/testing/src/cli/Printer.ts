import { TColor } from "../types";

export class Printer {
	private static colorStr(str: string, colorCode: number | TColor): string {
		const escape: string = `\x1b[${Array.isArray(colorCode) ? `38;2;$${colorCode.join(";")}` : colorCode}m`;
		return `${escape}${str.replace(/(\x1b\[39m)/g, `$1${escape}`)}\x1b[39m`;
	}

	public static newline() {
		console.log();
	}

	public static log(message: string) {
		console.log(`${message}\x1b[0m`);
	}

	public static badge(message: string, color: TColor) {
		Printer.newline();
		Printer.log(
			`\x1b[1m\x1b[48;2;${color.join(";")}m${
				color.reduce((acc: number, c: number) => acc + c, 0) < 255 * 2 ? "\x1b[37m" : ""
			} ${message.toUpperCase().trim()} \x1b[0m`
		);
	}

	public static warn(message: string) {
		Printer.newline();
		Printer.log(`\x1b[2m${Printer.colorStr(message, 37)}\x1b[0m`);
	}

	public static success(message: string) {
		Printer.log(Printer.colorStr(`✔ ${message}`, 32));
	}

	public static failure(message: string) {
		Printer.log(Printer.colorStr(`✘ ${message}`, 31));
	}

	public static value(value: unknown) {
		const colorValue = (value: string): string => {
			if (['"undefined"', "null"].includes(value)) {
				return Printer.colorStr(value.replace(/"/g, ""), 33);
			}
			if (["true", "false"].includes(value)) {
				return Printer.colorStr(value, 34);
			}
			if (/^("|').*\1$/.test(value)) {
				const strValue = /\\n/.test(value) ? `\n${value.slice(1, -1).replace(/\\n/g, "\n")}` : value;
				return Printer.colorStr(strValue, 35);
			}
			if (/^\d*(\.\d+)?$/.test(value)) {
				return Printer.colorStr(value, 36);
			}
			return `\x1b[2m${value}\x1b[22m`;
		};

		Printer.log(
			JSON.stringify(value, (_, value: unknown) => (value === undefined ? `undefined` : value), 2)
				.split(/\n/g)
				.map((line: string) => {
					const parts = line.split(/:(.*)/);
					if (!parts[1]) return colorValue(line);

					const isTrailing = /,$/.test(parts[1]);
					parts[0] = parts[0].slice(0, -1).replace('"', "");
					parts[1] = parts[1].slice(0, parts[1].length - +isTrailing).trim();

					return `\x1b[2m${Printer.colorStr(
						!/^[_\w][_\w\d]*$/.test(parts[0].trimStart())
							? `${parts[0].match(/^\s*/)[0]}'${parts[0].trimStart()}'`
							: parts[0],
						33
					)}:\x1b[22m ${colorValue(parts[1])}${isTrailing ? "," : ""}`;
				})
				.join("\n")
		);
	}
}
