"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Test = void 0;
const events_1 = require("events");
const assert_1 = require("assert");
const Promisification_1 = require("./Promisification");
const config_json_1 = __importDefault(require("./config.json"));
class Test {
    constructor(title) {
        this.wasConsumed = false;
        this.title = title;
        try {
            throw new Error();
        }
        catch (err) {
            try {
                this.sourcePosition = err.stack
                    .split(/\n/g)[2]
                    .match(/(\/[^/ ]*)+/g)[0]
                    .slice(0, -1);
            }
            catch (_a) { }
        }
        clearTimeout(Test.completeTimeout);
        Test.runningTests++;
        Test.event.emit("create", this);
    }
    evalActualExpression(...expressions) {
        return expressions[0];
    }
    isEqual(actual, expected) {
        try {
            (0, assert_1.deepEqual)(actual, expected);
        }
        catch (_a) {
            return false;
        }
        return true;
    }
    getDisplayValues(actual, expected) {
        return { actual, expected };
    }
    actual(...expressions) {
        if (this.wasConsumed)
            throw new SyntaxError("Test case was already consumed");
        this.wasConsumed = true;
        const evalActual = async () => {
            return await new Promisification_1.Promisification(this.evalActualExpression(...expressions
                .map(async (expression) => await new Promisification_1.Promisification(expression).resolve()))).resolve();
        };
        const complete = () => {
            if (--Test.runningTests > 0)
                return;
            Test.completeTimeout = setTimeout(() => Test.event.emit("complete"), config_json_1.default.completeTimeout);
        };
        return {
            expected: async (expression) => {
                const actual = await evalActual();
                const expected = await new Promisification_1.Promisification(expression).resolve();
                this.wasSuccessful = this.isEqual(actual, expected);
                const displayValues = this.getDisplayValues(actual, expected);
                this.displayActual = displayValues.actual;
                this.displayExpected = displayValues.expected;
                complete();
            },
            error: async (message, ErrorPrototype) => {
                this.displayExpected = `${(ErrorPrototype === null || ErrorPrototype === void 0 ? void 0 : ErrorPrototype.name) ? `${ErrorPrototype.name}: ` : ""}${message}`;
                evalActual()
                    .then(() => {
                    this.wasSuccessful = false;
                    this.displayActual = "No error";
                })
                    .catch((err) => {
                    this.wasSuccessful
                        = (ErrorPrototype ? (err.constructor === ErrorPrototype) : true)
                            && (message === (((err instanceof Error)) ? err.message : err));
                    this.displayActual = err.toString();
                })
                    .finally(complete);
            }
        };
    }
}
exports.Test = Test;
Test.runningTests = 0;
Test.event = new events_1.EventEmitter();
//# sourceMappingURL=Test.js.map