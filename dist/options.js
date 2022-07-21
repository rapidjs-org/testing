"use strict";
/**
 * Module containing a CLI option parsing and resolution interface.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.readOption = exports.TEST_DIR_PATH = void 0;
const path_1 = require("path");
const args = process.argv.slice(2);
if (args.length === 0) {
    throw new ReferenceError("Missing test directory argument (index 0)");
}
const testDirPathArg = args.shift();
const readStorage = new Map();
/**
 * Create an option / argument type resolve interface.
 * @param {*} value Value
 * @returns {IResolveInterface} Resolve interface
 */
function createResolveInterface(value) {
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
exports.TEST_DIR_PATH = !(0, path_1.isAbsolute)(testDirPathArg) ? (0, path_1.join)(process.cwd(), testDirPathArg) : testDirPathArg;
/**
 * Read a CLI option.
 * @param {string} name Option name (--<shorthand>)
 * @param {string} [shorthand] Optional option name shorthand (-<shorthand>)
 * @param {*} [defaultValue] Optional default value to use if no associated value given
 * @returns {IResolveInterface} Value resolve interface (for type accordance)
 */
function readOption(name, shorthand, defaultValue) {
    if (readStorage.has(name)) {
        return readStorage.get(name);
    }
    const topArgIndex = Math.max(args.lastIndexOf(`--${name}`), shorthand ? args.lastIndexOf(`-${shorthand}`) : -1);
    const result = createResolveInterface((topArgIndex > -1)
        ? args[topArgIndex + 1] || (defaultValue || true)
        : defaultValue);
    readStorage.set(name, result);
    return result;
}
exports.readOption = readOption;
