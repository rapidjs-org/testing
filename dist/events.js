"use strict";
/**
 * Module containing a virtual event emitter to listen for
 * and perform individual test environment manipulations.
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
exports.emitEvent = exports.onInit = void 0;
const path_1 = require("path");
const child_process_1 = require("child_process");
const print = __importStar(require("./print"));
const options_1 = require("./options");
let hasInit;
let initCallback;
let currentPending;
const envContext = (0, child_process_1.fork)((0, path_1.join)(__dirname, "env-context"));
envContext.on("error", err => {
    throw err;
});
envContext.on("message", (signal) => {
    if (signal == 0) {
        hasInit = true;
        initCallback && initCallback();
        return;
    }
    currentPending && currentPending();
});
function onInit(callback) {
    if (!hasInit) {
        initCallback = callback;
        return;
    }
    initCallback();
}
exports.onInit = onInit;
/**
 * Emit a global event. Each event triggers the execution
 * of a related event module located on the top level of
 * the test directory.
 * @param {string} name Event name
 * @param {Function} callback Function to invoke once the event handler has completed
 */
function emitEvent(name, callback) {
    const eventFilePath = (0, path_1.join)(options_1.TEST_DIR_PATH, `${name}.event.js`);
    print.event(name);
    envContext.send(eventFilePath);
    currentPending = callback;
}
exports.emitEvent = emitEvent;
