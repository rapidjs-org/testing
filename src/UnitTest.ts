import { Test } from "./Test";


/**
 * Class representing a unit test context for independent functional
 * test interfaces.
 */
export class UnitTest extends Test<((...args) => unknown)> {

    private static badgeColor: number[] = [ 118, 230, 255 ];
    
    /**
	 * Create a unit test object.
     * @param {Function} func Function to test
	 * @param {string} [caption] Optional test caption (generic caption otherwise)
     */
    constructor(func: ((...args) => unknown), caption?: string) {
    	if(!(func instanceof Function) && typeof(func) !== "function") {
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
    public invokeInterfaceProperty(...args: unknown[]) {
    	return this.interfaceProperty(...args);
    }

    /**
     * Define a class sepcific invocation error warning push.
     * @param {Error} err Invocation error
     */
    protected handleInvocationError(err: Error) {
    	this.pushWarning(`Could not apply function to given arguments: "${err.message}"`);
    }

}