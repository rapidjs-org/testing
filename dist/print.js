"use strict";
/**
 * Module containing a print interface for application formatted
 * message logging.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.close = exports.event = exports.error = exports.warning = exports.failure = exports.success = exports.badge = exports.fileName = void 0;
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
const util_1 = require("./util");
const options_1 = require("./options");
// Individual log interception (make subtle)
let lastLogWasIndividual = false;
console.log = (...message) => {
    // TODO: Object log?
    if ((0, options_1.readOption)("no-individual-log").boolean()) {
        return;
    }
    process.stdout.write(styleWrapStr(`${!lastLogWasIndividual ? "─── INDIVIDUAL LOG ───\n" : ""}${message.join(" ")}\n`, ["2", colorFrom(Layer.FG, 222, 231, 244)]));
    lastLogWasIndividual = true;
};
console.info = console.log;
console.warn = console.log;
console.error = console.log;
var Layer;
(function (Layer) {
    Layer[Layer["FG"] = 0] = "FG";
    Layer[Layer["BG"] = 1] = "BG";
})(Layer || (Layer = {}));
function log(message, noPad = false) {
    process.stdout.write(`${styleWrapStr(lastLogWasIndividual ? "───\n\n" : "", ["2", colorFrom(Layer.FG, 222, 231, 244)])}${message}${!noPad ? "\n" : ""}\n`);
    lastLogWasIndividual = false;
}
function logLine(length) {
    log(styleWrapStr(Array.from({ length: length }, () => "─").join(""), "2"));
}
function colorFrom(layer, r, g, b) {
    return `${(layer === Layer.FG) ? "38;2;" : "48;2;"}${r};${g};${b}`;
}
function styleWrapStr(str, styles) {
    styles = !Array.isArray(styles) ? [styles] : styles;
    return `${styles.map((style) => `\x1b[${style}m`).join("")}${str}\x1b[0m`;
}
/**
 * Log a file name in an according style.
 * @param {string} message File name
 */
function fileName(message) {
    log(styleWrapStr(`• ${message}`, [colorFrom(Layer.FG, 136, 151, 170)]));
}
exports.fileName = fileName;
/**
 * Log a badge in an according style.
 * @param {string} message Badge message
 * @param {number} r Red value (for RGB)
 * @param {number} g Red value (for RGB)
 * @param {number} b Red value (for RGB)
 */
function badge(message, r, g, b) {
    log(styleWrapStr(` ${message} `, ["1", colorFrom(Layer.BG, r, g, b)].concat(((r + g + b) < 550) ? ["97"] : [])));
}
exports.badge = badge;
/**
 * Log a success message in an according style.
 * @param {string} message Success message
 */
function success(message) {
    log(styleWrapStr(`✔ ${message} `, colorFrom(Layer.FG, 25, 225, 125)));
}
exports.success = success;
/**
 * Log a failure message in an according style.
 * @param {string} message Failure message
 * @param {*} expectedResult Expected test result to display (type-accordingly formatted)
 * @param {*} actualResult Actual test result to display (type-accordingly formatted)
 */
function failure(message, expectedResult, actualResult) {
    const formatResult = result => {
        const cropValue = (value) => {
            return ((0, util_1.isString)(value)
                && !(0, options_1.readOption)("no-crop").boolean()
                && (value.length > config.valueCropTolerance))
                ? `${value.slice(0, config.valueCropTolerance)}...`
                : value;
        };
        if (!(0, util_1.isObject)(result)) {
            return styleWrapStr(cropValue(result), colorFrom(Layer.FG, 255, 199, 28));
        }
        // TODO: Obj flattening?
        const formatObjProps = (obj) => {
            for (const prop in obj) {
                if ((0, util_1.isObject)(obj[prop])) {
                    obj[prop] = formatObjProps(obj[prop]);
                }
                else if ((0, util_1.isString)(obj[prop])) {
                    obj[prop] = cropValue(obj[prop]);
                    for (const escape in config.escapeSubstitutionMap) {
                        obj[prop] = obj[prop].replace(new RegExp(escape.replace(/(.)/g, "\\$1"), "g"), `${config.escapeSubstitutionIndicator}${config.escapeSubstitutionMap[escape]}`);
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
        result = result.replace(/(\{)|(\})|(,)/g, (match) => {
            switch (match) {
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
        for (const escape in config.escapeSubstitutionMap) {
            result = result.replace(new RegExp(`${config.escapeSubstitutionIndicator}${config.escapeSubstitutionMap[escape]}`.replace(/(.)/g, "$1"), "g"), /^["']$/.test(escape) ? `\\${escape}` : escape);
        }
        return result;
    };
    message = `✘ ${message}`;
    log(styleWrapStr(message, colorFrom(Layer.FG, 225, 25, 120)));
    console.group();
    if (expectedResult) {
        log(styleWrapStr("\nExpected result:", ["2", colorFrom(Layer.FG, 136, 151, 170)]));
        log(formatResult(expectedResult), true);
    }
    if (actualResult) {
        log(styleWrapStr("\nActual result:", ["2", colorFrom(Layer.FG, 136, 151, 170)]));
        log(formatResult(actualResult));
    }
    else {
        log("", true);
    } // TODO: Highlight diffs?
    console.groupEnd();
    (expectedResult || actualResult)
        && logLine(message.length);
}
exports.failure = failure;
/**
 * Log a warning message in an according style.
 * @param {string} message Warning message
 */
function warning(message) {
    log(styleWrapStr(message, ["2", "3", colorFrom(Layer.FG, 136, 151, 170)]), true);
}
exports.warning = warning;
/**
 * Log an error (message) in an according style.
 * @param {string} caption Error caption
 * @param {Error} err Respective error object
 */
function error(caption, err) {
    log(`${styleWrapStr(`${caption}:`, colorFrom(Layer.FG, 225, 25, 120))} ${err.message}`);
    err.stack && log(err.stack);
    process.exit(1);
}
exports.error = error;
/**
 * Log an event occurrence message in an according style.
 * @param {string} name Event name
 */
function event(name) {
    log(styleWrapStr(`↺ ${name}`, ["2", "3", colorFrom(Layer.FG, 136, 151, 170)]));
}
exports.event = event;
/**
 * Log an application termination / closing message in an according style.
 * @param {string} message Close message
 * @param {boolean} succeeded Whether the test suite was successful
 */
function close(message, succeeded = true) {
    message = `➜ ${message}`;
    logLine(message.length);
    log(styleWrapStr(message, succeeded ? colorFrom(Layer.FG, 25, 225, 125) : colorFrom(Layer.FG, 225, 25, 120)));
} // TODO: Recurring colors mapping
exports.close = close;
log("", true); // Initial app log padding
