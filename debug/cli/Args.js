"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Args = void 0;
class Args {
    static retrieveKeyIndex(name, shorthand) {
        return Math.max(Args.raw.indexOf(`--${name.toLowerCase()}`), shorthand ? Args.raw.indexOf(`-${shorthand.toUpperCase()}`) : -1);
    }
    static parsePositional(index = 0) {
        for (let i = 0; i < index; i++) {
            if (/^-/.test(Args.raw[index]))
                return;
        }
        return Args.raw[index];
    }
    static parseFlag(key, shorthand) {
        return (Args.retrieveKeyIndex(key, shorthand) >= 0);
    }
    static parseOption(key, shorthand) {
        return Args.raw[Args.retrieveKeyIndex(key, shorthand)];
    }
}
exports.Args = Args;
Args.raw = process.argv.slice(2);
//# sourceMappingURL=Args.js.map