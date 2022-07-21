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
exports.Test = void 0;
const print = __importStar(require("./print"));
const util_1 = require("./util");
const options_1 = require("./options");
/**
 * Abstract class representing a test context to be approached
 * for indivdual parameter test cases.
 * Utilize for concrete test field class derivation.
 */
class Test {
    /**
     * Create a test object representing a specific test entity context.
     * @param {*} interfaceProperty Test interface property to approach accroding to concrete implementation
     * @param {string} [caption] Optional test caption (generic caption otherwise)
     * @param {string} [defaultName] Optional default test caption prefix (for specification)
     */
    constructor(interfaceProperty, caption, defaultName) {
        this.pushedWarnings = [];
        this.activations = 0;
        this.cases = 0;
        this.id = ++Test.idCounter;
        this.interfaceProperty = interfaceProperty;
        this.caption = caption || `${defaultName || "Test"} ${this.id}`;
    }
    /**
     * Retrieve total test results.
     * @returns {number[]} Test results: [0] succeeded, [1] failed
     */
    static evalResults() {
        return [
            Test.counter.succeeded,
            Test.counter.failed
        ];
    }
    /**
     * Check whether the test suite has been successful.
     * (Whether all test cases passed SO FAR; approach upon process termination).
     * @returns {Boolean} Whether the suite has been successful
     */
    static suiteSuccessful() {
        return (Test.counter.failed === 0);
    }
    /**
     * Print all raised warning logs from concrete case application.
     */
    printWarningLog() {
        if (this.pushedWarnings.length === 0) {
            return;
        }
        let warning;
        while (warning = this.pushedWarnings.pop()) {
            print.warning(warning);
        }
        print.warning("");
    }
    /**
     * Check whether two arrays are equal.
     * Strict comparison per same index elements each (===).
     * @param {*[]} arr1 Reference array
     * @param {*[]} arr2 Compared array
     * @returns {Boolean} Whether the arrays are fully equal
     */
    arraysEqual(arr1, arr2) {
        if (!Array.isArray(arr2)) {
            return false;
        }
        return (JSON.stringify(arr1.sort()) === JSON.stringify(arr2.sort()));
    }
    /**
     * Check whether two objects are equal.
     * Key set comparison.
     * Strict comparison per same key elements each (===).
     * Recursive test behavior for sub-objects.
     * @param {Object} obj1 Reference object
     * @param {Object} obj2 Compared object
     * @returns {Boolean} Whether the objects are fully equal
     */
    objectsDeepEqual(obj1, obj2) {
        if (!(0, util_1.isObject)(obj2)) {
            return false;
        }
        if (!this.arraysEqual(Object.keys(obj1), Object.keys(obj2))) {
            return false;
        }
        for (const key in obj1) {
            if (((0, util_1.isObject)(obj1[key]) && !this.objectsDeepEqual(obj1[key], obj2[key]))
                || (Array.isArray(obj1[key]) && !this.arraysEqual(obj1[key], obj2[key]))
                || obj1[key] !== obj2[key]) {
                return false;
            }
        }
        return true;
    }
    /**
     * Filter an actually invoked test result for relevant properties.
     * To be optionally utilized from concrete class implementations.
     * @param {*} _ [~ expectedResult] Expected result for reference (if needed)
     * @param {*} actualResult Actual result to filter
     * @returns {*} Filtered results passed to futher processes
     */
    filterActualResult(_, actualResult) {
        return actualResult;
    }
    /**
     * Compare whether two values are stricitly equal.
     * Implements the comparison helper methods (s.a.).
     * @param {*} expectedResult Expected result for reference
     * @param {*} actualResult Actual result to compare
     * @returns {Boolean} Whether the results are fully equal
     */
    compareEqual(expectedResult, actualResult) {
        if ((0, util_1.isObject)(expectedResult)) {
            return this.objectsDeepEqual(expectedResult, actualResult);
        }
        if (Array.isArray(expectedResult)) {
            return this.arraysEqual(expectedResult, actualResult);
        }
        if (expectedResult != actualResult) {
            return false;
        }
        if (expectedResult !== actualResult) {
            this.pushWarning("Result type mismatch");
        }
        return true;
    }
    /**
     * Push a warning to the warning log queue.
     * Prevents warning log before related test badges.
     * @param message
     */
    pushWarning(message) {
        this.pushedWarnings.push(message);
    }
    /**
     * Perform an individual test case.
     * @param {*[]} args Test invocation arguments
     * @returns { for() } Test results resolution interface (s.b.)
     */
    case(...args) {
        Test.openCases++;
        const testTimeout = setTimeout(_ => {
            print.warning(`Test suite timeout (initiated by test object '${this.caption}')\n`);
            // TODO: Info on how to change timeout limit?
            process.exit(1);
        }, (0, options_1.readOption)("timeout", "T", 5000).number());
        const retrieveCaption = (caption) => {
            return caption || `${this.caption}, Case ${++this.cases}`;
        };
        let actualResult;
        try {
            actualResult = this.invokeInterfaceProperty(...args);
        }
        catch (err) {
            clearTimeout(testTimeout);
            print.error("An error occurred upon interface invocation", err);
            this.handleInvocationError(err);
            this.printWarningLog();
            return {
                for: (_, caption) => {
                    print.failure(retrieveCaption(caption));
                }
            };
        }
        return {
            /**
             * Check for an expected result of the issuing test case.
             * @param {*} expectedResult Expected result
             * @param {string} [caption] Optional test case caption for associable result logs
             */
            for: (expectedResult, caption) => {
                let chainedContext;
                const resolve = () => {
                    clearTimeout(testTimeout);
                    (this.id !== Test.lastActiveId)
                        && print.badge(`${this.caption}${(this.activations++ > 0) ? ` (${this.activations})` : ""}`, this.badgeColor[0], this.badgeColor[1], this.badgeColor[2]);
                    caption = retrieveCaption(caption);
                    this.printWarningLog();
                    Test.lastActiveId = this.id;
                    if (actualResult instanceof Error) {
                        // Error => Failure
                        Test.counter.failed++;
                        print.failure(caption);
                        if (--Test.openCases === 0) {
                            process.exit(0);
                        }
                        return;
                    }
                    const filteredActualResult = this.filterActualResult(expectedResult, actualResult);
                    const isEqual = this.compareEqual(expectedResult, filteredActualResult);
                    if (isEqual) {
                        // Success
                        Test.counter.succeeded++;
                        print.success(caption);
                    }
                    else {
                        // Failure
                        Test.counter.failed++;
                        print.failure(caption, expectedResult, filteredActualResult);
                    }
                    chainedContext
                        && chainedContext(actualResult);
                    if (--Test.openCases === 0) {
                        process.exit(0);
                    }
                };
                (actualResult instanceof Promise)
                    ? (actualResult
                        .then(resolvedResult => {
                        actualResult = resolvedResult;
                    })
                        .catch((err) => {
                        this.handleInvocationError(err);
                        actualResult = err;
                    })
                        .finally(resolve))
                    : setImmediate(resolve); // Have .chain() evaluated first
                return {
                    /**
                     * Chain an evaluation context to the resolution of the issuing a
                     * test case, given the actual result value to perform on.
                     * @param {Function} resultHandler Result handler being invoked immediately given the (filtered) actual result
                     */
                    chain: (chainedContextCallback) => {
                        chainedContext = chainedContextCallback;
                    }
                };
            }
        };
    }
}
exports.Test = Test;
Test.idCounter = 0;
Test.counter = {
    succeeded: 0,
    failed: 0
};
Test.openCases = 0;
