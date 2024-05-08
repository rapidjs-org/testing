"use strict";
/* let lastLogWasIndividual: boolean = false;
console.log = (...message: string[]) => {
    process.stdout.write(styleWrapStr(`${
        !lastLogWasIndividual ? "─── INDIVIDUAL LOG ───\n" : ""
    }${message.join(" ")}\n`, ["2", colorFrom(Layer.FG, 222, 231, 244) ] ));
    
    lastLogWasIndividual = true;
}
console.info = console.log;
console.warn = console.log;
console.error = console.log; */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Printer = void 0;
class Printer {
    static printBadge(message, color) {
        console.log(`\x1b[1m\x1b[48;2;${color.join(";")}m${(color.reduce((acc, c) => acc + c, 0) < (255 * 2)) ? "\x1b[37m" : ""} ${message.toUpperCase().trim()} \x1b[0m`);
    }
    static printSuccess(message) {
        console.log(`\x1b[32m✔\x1b[0m ${message}`);
    }
    static printFailure(message) {
        console.log(`\x1b[31mx\x1b[0m ${message}`);
    }
}
exports.Printer = Printer;
//# sourceMappingURL=Printer.js.map