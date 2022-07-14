/**
 * Module containing a print interface for application formatted
 * message logging.
 */


const config = {
	valueCropTolerance: 100,
	escapeSubstitutionIndicator: "@",
	escapeSubstitutionMap: {
		",": "COMMA",
		"\"": "DOUBLE_QUOTE",
		"'": "SINGLE_QUOTE",
		"{": "OPENING_BRACE",
		"}": "CLOSING_BRACE"
	}
};


import { isString, isObject } from "./util";
import { readOption } from "./options";


// Individual log interception (make subtle)
let lastLogWasIndividual: boolean = false;

console.log = (...message: string[]) => {
    // TODO: Object log?
	if(readOption("no-individual-log").boolean()) {
		return;
	}

    process.stdout.write(styleWrapStr(`${
		!lastLogWasIndividual ? "─── INDIVIDUAL LOG ───\n" : ""
	}${message.join(" ")}\n`, ["2", colorFrom(Layer.FG, 222, 231, 244) ] ));
    
    lastLogWasIndividual = true;
}
console.info = console.log;
console.warn = console.log;
console.error = console.log;


enum Layer {
    FG,
    BG
}


function log(message: string, noPad = false) {
	process.stdout.write(`${
		styleWrapStr(lastLogWasIndividual ? "───\n\n" : "", ["2", colorFrom(Layer.FG, 222, 231, 244) ])
	}${message}${!noPad ? "\n" : ""}\n`, );

	lastLogWasIndividual = false;
}

function logLine(length) {
	log(styleWrapStr(Array.from({ length: length }, () => "─").join(""), "2"));
}

function colorFrom(layer: Layer, r: number, g: number, b: number|string): string {
	return `${(layer === Layer.FG) ? "38;2;" : "48;2;"}${r};${g};${b}`;
}

function styleWrapStr(str: string, styles: string|string[]): string {
	styles = !Array.isArray(styles) ? [ styles ]: styles;

	return `${styles.map((style: string) => `\x1b[${style}m`).join("")}${str}\x1b[0m`;
}

/**
 * Log a file name in an according style.
 * @param {string} message File name
 */
export function fileName(message: string) {
	log(styleWrapStr(`• ${message}`, [ colorFrom(Layer.FG, 136, 151, 170) ]));
}

/**
 * Log a badge in an according style.
 * @param {string} message Badge message
 * @param {number} r Red value (for RGB)
 * @param {number} g Red value (for RGB)
 * @param {number} b Red value (for RGB)
 */
export function badge(message: string, r: number, g: number, b: number) {
	log(styleWrapStr(` ${message} `, [ "1", colorFrom(Layer.BG, r, g, b) ].concat(((r + g + b) < 550) ? [ "97" ] : [])));
}

/**
 * Log a success message in an according style.
 * @param {string} message Success message
 */
export function success(message: string) {
	log(styleWrapStr(`✔ ${message} `, colorFrom(Layer.FG, 25, 225, 125)));
}

/**
 * Log a failure message in an according style.
 * @param {string} message Failure message
 * @param {*} expectedResult Expected test result to display (type-accordingly formatted)
 * @param {*} actualResult Actual test result to display (type-accordingly formatted)
 */
export function failure(message: string, expectedResult?, actualResult?) {
	const formatResult = result => {
		const cropValue = (value) => {
			return (isString(value)
			&& readOption("no-crop").boolean()
			&& (value.length > config.valueCropTolerance))
				? `${value.slice(0, config.valueCropTolerance)}...`
				: value;
		};

		if(!isObject(result)) {
			return styleWrapStr(cropValue(result), colorFrom(Layer.FG, 255, 199, 28));
		}

		// TODO: Obj flattening?
		const formatObjProps = (obj: Record<string, unknown>) => {
			for(const prop in obj) {
				if(isObject(obj[prop])) {
					obj[prop] = formatObjProps(obj[prop] as Record<string, unknown>);
				} else if(isString(obj[prop])) {
					obj[prop] = cropValue(obj[prop]);

					for(const escape in config.escapeSubstitutionMap) {
						obj[prop] = (obj[prop] as string).replace(
							new RegExp(escape.replace(/(.)/g, "\\$1"), "g"),
							`${config.escapeSubstitutionIndicator}${config.escapeSubstitutionMap[escape]}`);
					}
				}
			}
            
			return obj;
		};

		formatObjProps(result);

		result = JSON.stringify(result)
			.replace(/(("|')[^"']+\2):/g, `${styleWrapStr("$1", colorFrom(Layer.FG, 136, 151, 170))}:`)
			.replace(/:\s*(([0-9]+(\.[0-9])?)|(("|')[^"']*\5))\s*([,}])/g, `:${styleWrapStr("$1", colorFrom(Layer.FG, 255, 199, 28))}$6`)
			.replace(/:\s*/g, ": ");
        
		const indentation = "  ";
		let openBraces = 0;
		const retrieveIndentation = () => {
			return `\n${Array.from({ length: openBraces }, () => indentation).join("")}`;
		};
        
		result = result.replace(/(\{)|(\})|(,)/g, (match: string) => {
			switch(match) {
			case "{":
				openBraces++;

				return `${match}${retrieveIndentation()}`;
			case "}":
				openBraces--;
                
				return `${retrieveIndentation()}${match}`;
			case ",":
				return `${match}${retrieveIndentation()}`;
			}

			return match;
		});

		for(const escape in config.escapeSubstitutionMap) {
			result = result.replace(
				new RegExp(`${config.escapeSubstitutionIndicator}${config.escapeSubstitutionMap[escape]}`.replace(/(.)/g, "$1"), "g"),
				/^["']$/.test(escape) ? `\\${escape}` : escape);
		}

		return result;
	};

	message = `✘ ${message}`;

	log(styleWrapStr(message, colorFrom(Layer.FG, 225, 25, 120)));
	console.group();
	if(expectedResult) {
		log(styleWrapStr("\nExpected result:", [ "2", colorFrom(Layer.FG, 136, 151, 170) ]));
		log(formatResult(expectedResult), true);
	}
	if(actualResult) {
		log(styleWrapStr("\nActual result:", [ "2", colorFrom(Layer.FG, 136, 151, 170) ]));
		log(formatResult(actualResult));
	} else {
		log("", true);
	}   // TODO: Highlight diffs?

	console.groupEnd();
    
	(expectedResult || actualResult)
	&& logLine(message.length);
}

/**
 * Log a warning message in an according style.
 * @param {string} message Warning message
 */
export function warning(message: string) {
	log(styleWrapStr(message, [ "2", "3", colorFrom(Layer.FG, 136, 151, 170) ]), true);
}

/**
 * Log an error (message) in an according style.
 * @param {string} caption Error caption
 * @param {Error} err Respective error object
 */
export function error(caption: string, err: Error) {
	log(`${styleWrapStr(`${caption}:`, colorFrom(Layer.FG, 225, 25, 120))} ${err.message}`);
	err.stack && log(err.stack);

	process.exit(1);
}

/**
 * Log an event occurrence message in an according style.
 * @param {string} name Event name
 */
export function event(name: string) {
	log(styleWrapStr(`↺ ${name}`, [ "2", "3", colorFrom(Layer.FG, 136, 151, 170) ]));
}

/**
 * Log an application termination / closing message in an according style.
 * @param {string} message Close message
 * @param {boolean} succeeded Whether the test suite was successful
 */
export function close(message: string, succeeded = true) {
	message = `➜ ${message}`;

	logLine(message.length);
	log(styleWrapStr(message, succeeded ? colorFrom(Layer.FG, 25, 225, 125) : colorFrom(Layer.FG, 225, 25, 120)));
}   // TODO: Recurring colors mapping


log("", true);    // Initial app log padding