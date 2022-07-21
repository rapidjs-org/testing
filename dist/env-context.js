"use strict";
/**
 * == SUB-PORCESS ==
 * Sub-module for maintaining a test enviornment context for event
 * related module executions.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
console.log = (...message) => {
    process.stdout.write(`\x1b[2m${message.join(" ")}\x1b[0m\n`);
};
console.info = console.log;
console.warn = console.log;
console.error = console.log;
process.on("message", (eventFilePath) => {
    if (!(0, fs_1.existsSync)(eventFilePath)) {
        return;
    }
    require(eventFilePath);
    console.log("");
    process.send(1);
});
process.send(0);
