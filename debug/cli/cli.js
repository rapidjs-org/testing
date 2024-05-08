#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const api_1 = require("../api");
const Args_1 = require("./Args");
const Printer_1 = require("./Printer");
async function runSuite() {
    var _a;
    var _b;
    if (!Args_1.Args.parsePositional(0))
        throw new ReferenceError(`Missing test suite name (pos 0)`);
    let classModulePath;
    switch (Args_1.Args.parsePositional(0).toLowerCase()) {
        case "help":
            console.log((0, fs_1.readFileSync)((0, path_1.join)(__dirname, "../../help.txt")).toString());
            process.exit(0);
        case "unit":
            classModulePath = api_1.ESuite.UNIT;
            break;
        case "request":
            classModulePath = api_1.ESuite.REQUEST;
            break;
        case "dom":
            classModulePath = api_1.ESuite.DOM;
            break;
        default:
            classModulePath = (0, path_1.resolve)(Args_1.Args.parsePositional(0));
            if (!(0, fs_1.existsSync)(classModulePath))
                throw new ReferenceError(`Custom test suite module not found '${classModulePath}'`);
    }
    if (!Args_1.Args.parsePositional(1))
        throw new ReferenceError(`Missing test directory path (pos 1)`);
    const TestClass = Object.values(await (_a = (0, path_1.resolve)(classModulePath), Promise.resolve().then(() => __importStar(require(_a)))))[0];
    Printer_1.Printer.printBadge((TestClass.suiteTitle || "").replace(/( ?test(s)?)?$/i, " tests"), (_b = TestClass.suiteColor) !== null && _b !== void 0 ? _b : [225, 225, 225]);
    return await (0, api_1.init)((0, path_1.resolve)(classModulePath), Args_1.Args.parsePositional(1));
}
runSuite()
    .then((results) => {
    const counter = {
        success: 0,
        failure: 0
    };
    for (let filepath in results.record) {
        console.log(`\n• ${filepath}\x1b[0m`);
        for (let test of results.record[filepath]) {
            counter.success += +test.wasSuccessful;
            counter.failure += +!test.wasSuccessful;
            if (test.wasSuccessful) {
                console.log(`\x1b[32m✔ ∟ ${test.title}\x1b[0m`);
                continue;
            }
            const printObj = (obj) => {
                if (["string", "number", "boolean"].includes(typeof (obj))) {
                    return `\x1b[34m${obj}\x1b[0m`;
                }
                if ([undefined, null].includes(obj)) {
                    return `\x1b[2m\x1b[31m${obj}\x1b[0m`;
                }
                const color = (code, str) => `\x1b[0m\x1b[${code}m${str}\x1b[0m\x1b[2m`;
                return `\x1b[2m${JSON.stringify(obj, null, 2)
                    .replace(/:( *("|').*\2 *)(,?\n)/g, `:${color(34, "$1")}$3`)
                    .replace(/:( *[0-9]+(\.[0-9]+)? *)(,?\n)/g, `:${color(33, "$1")}$3`)
                    .replace(/:( *(true|false) *)(,?\n)/g, `:${color(33, "$1")}$3`)
                    .replace(/(\n *("|')*.*\2):/g, `${color(35, "$1")}:`)}\x1b[0m`;
            };
            console.log(`\x1b[31m✘ \x1b[1m∟ ${test.title}\x1b[0m${test.sourcePosition ? ` \x1b[2m(${test.sourcePosition})\x1b[0m` : ""}\n`);
            console.log("\x1b[1m\x1b[2mEXPECTED:\x1b[0m\n");
            console.log(printObj(test.displayExpected));
            console.log("\n\x1b[1m\x1b[2mACTUAL:\x1b[0m\n");
            console.log(printObj(test.displayActual));
            console.log(`\x1b[0m\x1b[2m${Array.from({ length: test.title.length + 2 }, () => "–").join("")}\x1b[0m`);
        }
    }
    console.log(`\n${!counter.failure
        ? "\x1b[32m✔ Test suite \x1b[1msucceeded\x1b[22m"
        : "\x1b[31m✘ Test suite \x1b[1mfailed\x1b[22m"} (${Math.round((counter.success / (counter.success + counter.failure) || 1) * 100)}% (${counter.success}/${counter.success + counter.failure}) successful, ${Math.round(results.time * 0.001)}s)\x1b[0m\n`);
    process.exit(counter.failure ? 1 : 0);
})
    .catch((err) => {
    var _a;
    console.error(`\n\x1b[31m${(_a = err.stack) !== null && _a !== void 0 ? _a : `${err.name}: ${err.message}`}\x1b[0m`);
    process.exit(1);
});
process.on("exit", () => console.log(""));
/* process.on("SIGTERM", () => process.exit(1));
process.on("SIGINT", () => process.exit(1)); */ 
//# sourceMappingURL=cli.js.map