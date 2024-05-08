"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Promisification = void 0;
const config_json_1 = __importDefault(require("./config.json"));
class Promisification {
    constructor(expression) {
        this.expression = expression;
    }
    abort(message) {
        throw new RangeError(message);
    }
    resolve() {
        return new Promise(async (resolveInner, rejectInner) => {
            const promisificationTimeout = setTimeout(() => this.abort("Processing timeout"), config_json_1.default.promisificationTimeout);
            let resolveValue = this.expression;
            let i = 0;
            while (resolveValue instanceof Function || resolveValue instanceof Promise) {
                try {
                    resolveValue = (resolveValue instanceof Function)
                        ? resolveValue()
                        : resolveValue;
                    resolveValue = (resolveValue instanceof Promise)
                        ? await resolveValue
                        : resolveValue;
                }
                catch (err) {
                    rejectInner(err);
                    return;
                }
                if (i++ < 100)
                    continue;
                this.abort("Excessive iteration");
                break;
            }
            clearTimeout(promisificationTimeout);
            resolveInner(resolveValue);
        });
    }
}
exports.Promisification = Promisification;
//# sourceMappingURL=Promisification.js.map