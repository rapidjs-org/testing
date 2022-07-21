"use strict";
/**
 * Main module initiating the test suite run with a test directory traversal.
 */
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
const path_1 = require("path");
const fs_1 = require("fs");
const print = __importStar(require("./print"));
const options_1 = require("./options");
const events_1 = require("./events");
const Test_1 = require("./Test");
const UnitTest_1 = require("./UnitTest");
const NetworkTest_1 = require("./NetworkTest");
if (!(0, fs_1.existsSync)(options_1.TEST_DIR_PATH)) {
    throw new ReferenceError(`Given test file directory '${options_1.TEST_DIR_PATH}' does not exist`);
}
/*
 * Accordingly wrap and clean up test results and environment.
 */
process.on("exit", () => {
    // CLEANUP EVENT
    (0, events_1.emitEvent)("cleanup", () => {
        if (process.exitCode === 1) {
            // Manual exit
            return;
        }
        const testResults = Test_1.Test.evalResults();
        const testResultsDepiction = `(${testResults[0]}/${testResults[0] + testResults[1]} successful)`;
        // Error has occurred throughout test suite execution
        if (!Test_1.Test.suiteSuccessful()) {
            print.close(`Test suite run failed ${testResultsDepiction}.`, false);
            process.exit(1);
        }
        // No test has failed => SUCCESS
        print.close(`Test suite run succeeded ${testResultsDepiction}.`);
    });
});
/**
 * Recursively traverse a given directory for test file evaluation.
 * @param {string} path Path to directory to traverse
 */
function traverseTestDir(path) {
    (0, fs_1.readdir)(path, {
        withFileTypes: true
    }, (_, dirents) => {
        (dirents || []).forEach(dirent => {
            const testFilePath = (0, path_1.join)(path, dirent.name);
            if (dirent.isDirectory()) {
                traverseTestDir(testFilePath);
                return;
            }
            if (!/\.test\.js$/i.test(dirent.name)) {
                return;
            }
            print.fileName(dirent.name);
            try {
                require(testFilePath);
            }
            catch (err) {
                print.error("An error occured upon test file evaluation", err);
            }
        });
    });
}
const packageFilePath = (0, path_1.join)((0, path_1.dirname)(options_1.TEST_DIR_PATH), "package.json");
const packageName = (0, fs_1.existsSync)(packageFilePath)
    ? require(packageFilePath).name
    : null;
print.badge(`TEST SUITE${packageName ? ` [${packageName}]` : ""}`, 201, 241, 248);
// Provide globals for test scripts in order not to require any includes
global.NetworkTest = NetworkTest_1.NetworkTest;
global.UnitTest = UnitTest_1.UnitTest;
(0, events_1.onInit)(() => {
    // SETUP EVENT
    (0, events_1.emitEvent)("setup", () => {
        // RUN TEST SUITE
        // Evaluate each *.test.js file in the test directory in order of scan
        traverseTestDir(options_1.TEST_DIR_PATH);
    });
});
