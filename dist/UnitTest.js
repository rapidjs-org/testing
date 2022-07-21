"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitTest = void 0;
const Test_1 = require("./Test");
// TODO: Resolve options (strict/unstrict equal, assert differing, ...)?
/**
 * Class representing a unit test context for independent functional
 * test interfaces.
 */
class UnitTest extends Test_1.Test {
    /**
     * Create a unit test object.
     * @param {Function} func Function to test
     * @param {string} [caption] Optional test caption (generic caption otherwise)
     */
    constructor(func, caption) {
        if (!(func instanceof Function) && typeof (func) !== "function") {
            throw new TypeError("Unit test requires function argument");
        }
        super(func, caption, "Unit Test");
        super.badgeColor = UnitTest.badgeColor;
    }
    /**
     * Call the interface function with the given arguments.
     * @param {*[]} args Arguments to pass to interface function
     * @returns {*} Invocation result
     */
    invokeInterfaceProperty(...args) {
        return this.interfaceProperty(...args);
    }
    /**
     * Define a class sepcific invocation error warning push.
     * @param {Error} err Invocation error
     */
    handleInvocationError(err) {
        this.pushWarning(`Could not apply function to given arguments: "${err.message}"`);
    }
}
exports.UnitTest = UnitTest;
UnitTest.badgeColor = [255, 225, 194];
