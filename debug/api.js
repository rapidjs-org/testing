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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = exports.ESuite = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const Test_1 = require("./Test");
const AsyncMutex_1 = require("./AsyncMutex");
const Env_1 = require("./Env");
const RECORD = {};
const importMutex = new AsyncMutex_1.AsyncMutex();
function traversePath(path, fileCallback = () => { }) {
    const handleFilepath = (filepath) => {
        if (!/^[^#].*\.test\.js$/.test((0, path_1.basename)(filepath)))
            return;
        fileCallback(filepath);
        importMutex.lock(() => { var _a; return _a = filepath, Promise.resolve().then(() => __importStar(require(_a))); });
    };
    if ((0, fs_1.lstatSync)(path).isFile()) {
        handleFilepath(path);
        return;
    }
    (0, fs_1.readdir)(path, {
        withFileTypes: true
    }, (err, dirents) => {
        if (err)
            throw err;
        dirents.forEach(dirent => {
            const filepath = (0, path_1.join)(path, dirent.name);
            if (dirent.isDirectory()) {
                traversePath(filepath);
                return;
            }
            handleFilepath(filepath);
        });
    });
}
exports.ESuite = {
    UNIT: (0, path_1.join)(__dirname, "./suites/UnitTest"),
    REQUEST: (0, path_1.join)(__dirname, "./suites/RequestTest"),
    DOM: (0, path_1.join)(__dirname, "./suites/DomTest")
};
async function init(apiArg, testDirPath) {
    const testSuiteAPI = (typeof (apiArg) === "string")
        ? await (_a = (0, path_1.resolve)(apiArg), Promise.resolve().then(() => __importStar(require(_a))))
        : apiArg;
    const TestClass = Object.entries(testSuiteAPI)[0];
    if (TestClass[0] === "default" || (Object.getPrototypeOf(TestClass[1]).name !== "Test")) {
        throw new SyntaxError("Test suite module must provide a single named concrete Test class export");
    }
    if (!(0, fs_1.existsSync)(testDirPath))
        throw new ReferenceError(`Test directory not found '${testDirPath}'`);
    // @ts-ignore
    global[TestClass[0]] = TestClass[1];
    const testEnv = new Env_1.Env(testDirPath);
    return new Promise(async (resolve, reject) => {
        const captureError = async (err) => {
            await testEnv.call("AFTER");
            reject(err);
            return;
        };
        process.on("uncaughtException", captureError);
        process.on("unhandledRejection", captureError);
        await testEnv.call("BEFORE");
        const startTime = Date.now();
        Test_1.Test.event.on("complete", async () => {
            const time = Date.now() - startTime;
            testEnv.call("AFTER");
            resolve({
                time,
                record: RECORD
            });
        });
        let activeFilepath;
        Test_1.Test.event.on("create", (test) => {
            var _a;
            RECORD[activeFilepath] = [(_a = RECORD[activeFilepath]) !== null && _a !== void 0 ? _a : [], test].flat();
        });
        traversePath((0, path_1.resolve)(testDirPath), (filepath) => {
            activeFilepath = filepath;
        });
    });
}
exports.init = init;
//# sourceMappingURL=api.js.map