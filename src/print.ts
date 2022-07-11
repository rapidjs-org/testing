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


// TODO: Intercept app log


enum Layer {
    FG,
    BG
}


function log(message: string, noPad: boolean = false) {
    console.log(`${message}${!noPad ? "\n" : ""}`, );
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

export function fileName(message: string) {
    log(styleWrapStr(`• ${message}`, [ colorFrom(Layer.FG, 225, 225, 235) ]));
}

export function badge(message: string, r: number, g: number, b: number) {
    log(styleWrapStr(` ${message} `, [ "1", colorFrom(Layer.BG, r, g, b) ].concat(((r + g + b) < 550) ? [ "97" ] : [])));
}

export function success(message: string) {
    log(styleWrapStr(`✔ ${message} `, colorFrom(Layer.FG, 25, 225, 125)));
}

export function failure(message: string, expectedResult?, actualResult?) {
    const formatResult = result => {
        // TODO: No value crop option
        const cropValue = (value) => {
            return (isString(value) && (value.length > config.valueCropTolerance))
            ? `${value.slice(0, config.valueCropTolerance)}...`
            : value;
        };

        if(!isObject(result)) {
            return cropValue(result);
        }

        // TODO: Obj flattening?
        const formatObjProps = (obj: Object) => {
            for(const prop in obj) {
                if(isObject(obj[prop])) {
                    obj[prop] = formatObjProps(obj[prop]);
                } else if(isString(obj[prop])) {
                    obj[prop] = cropValue(obj[prop]);

                    for(const escape in config.escapeSubstitutionMap) {
                        obj[prop] = obj[prop].replace(
                            new RegExp(escape.replace(/(.)/g, "\\$1"), "g"),
                            `${config.escapeSubstitutionIndicator}${config.escapeSubstitutionMap[escape]}`);
                    }
                }
            }
            
            return obj;
        };

        formatObjProps(result);

        result = JSON.stringify(result)
        .replace(/(("|')[^"']+\2):/g, `${styleWrapStr("$1", colorFrom(Layer.FG, 45, 225, 230))}:`)
        .replace(/:\s*(([0-9]+(\.[0-9])?)|(("|')[^"']*\5))\s*([,}])/g, `:${styleWrapStr("$1", colorFrom(Layer.FG, 245, 125, 30))}$6`)
        .replace(/:\s*/g, `: `);
        
        const indentation: string = "  ";
        let openBraces: number = 0;
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

    console.group(styleWrapStr(message, colorFrom(Layer.FG, 225, 25, 125)));
    if(expectedResult) {
        log(styleWrapStr("\nExpected result:", colorFrom(Layer.FG, 215, 215, 225)));
        log(formatResult(expectedResult), true);
    }
    if(actualResult) {
        log(styleWrapStr("\nActual result:", colorFrom(Layer.FG, 215, 215, 225)));
        log(formatResult(actualResult));
    } else {
        log("", true);
    }   // TODO: Highlight diffs?

    console.groupEnd();
    
    logLine(message.length);
}

export function warning(message: string) {
    log(styleWrapStr(message, [ "2", "3", colorFrom(Layer.FG, 235, 235, 245) ]), true);
}

export function error(caption: string, err: Error) {
    log(`${styleWrapStr(`${caption}:`, colorFrom(Layer.FG, 225, 25, 125))} ${err.message}`);
    err.stack && log(err.stack);

    process.exit(1);
}

export function close(message: string, succeeded: boolean = true) {
    message = `➜ ${message}`;

    logLine(message.length);
    log(styleWrapStr(message, succeeded ? colorFrom(Layer.FG, 25, 225, 125) : colorFrom(Layer.FG, 225, 25, 125)));
}   // TODO: Recurring colors mapping


log("", true);    // Initial padding