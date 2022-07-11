import { isObject } from "./util";
import * as print from "./print";


const config = {
    testTimeoutDuration: 5000  // TODO: How provide custom value?
};


export abstract class Test {

    private static idCounter: number = 0;
    private static counter: {
        succeeded: number,
        failed: number
    } = {
        succeeded: 0,
        failed: 0
    };
    private static lastActiveId: number;

    public static evalResults(): number[] {
        return [
            Test.counter.succeeded,
            Test.counter.failed
        ];
    }
    
    public static suiteSuccessful(): boolean {
        return (Test.counter.failed === 0);
    }
    
    private readonly id: number;
    private readonly caption: string;
    private readonly pushedWarnings: string[] = [];
    
    protected readonly interfaceProperty;

    private testTimeout: number|NodeJS.Timeout;
    private activations: number = 0;
    private conductions: number = 0;

    protected badgeColor: number[];
    
    constructor(interfaceProperty, caption: string) {
        this.id = ++Test.idCounter;
        this.interfaceProperty = interfaceProperty;
        this.caption = caption;
    }

    protected abstract invokeInterfaceProperty(...args);

    protected abstract handleInvocationError(err: Error);

    private printWarningLog() {
        let warning: string;
        while(warning = this.pushedWarnings.pop()) {
            print.warning(warning);
        }
    }

    private arraysEqual(arr1, arr2): boolean {
        if(!Array.isArray(arr2)) {
            return false;
        }

        return (JSON.stringify(arr1.sort()) === JSON.stringify(arr2.sort()));
    }

    private objectsDeepEqual(obj1, obj2): boolean {
        if(!isObject(obj2)) {
            return false;
        }

        if(!this.arraysEqual(Object.keys(obj1), Object.keys(obj2))) {
            return false;
        }

        for(const key in obj1) {
            if((isObject(obj1[key]) && !this.objectsDeepEqual(obj1[key], obj2[key]))
            || (Array.isArray(obj1[key]) && !this.arraysEqual(obj1[key], obj2[key]))
            || obj1[key] !== obj2[key]) {
                return false;
            }
        }

        return true;
    };

    protected filterActualResult(_, actualResult) {
        return actualResult;
    }
    
    protected compareEqual(expectedResult, actualResult): boolean {
        if(isObject(expectedResult)) {
            return this.objectsDeepEqual(expectedResult, actualResult);
        }

        if(Array.isArray(expectedResult)) {
            return this.arraysEqual(expectedResult, actualResult);
        }

        if(expectedResult != actualResult) {
            return false;
        }

        if(expectedResult !== actualResult) {
            this.pushWarning("Result type mismatch");
        }

        return true;
    }

    protected pushWarning(message: string) {
        this.pushedWarnings.push(message);
    }

    // TODO: Fix test timeout issue

    public conduct(...args) {
        this.testTimeout = setTimeout(_ => {
            print.warning(`Test suite timeout (initiated by test object '${this.caption}')\n`);
            //print.usageInfo("");  // TODO: Info on how to change timeout limit

            process.exit(1);
        }, config.testTimeoutDuration);

        let actualResult;
        try {
            actualResult = this.invokeInterfaceProperty(...args);
        } catch(err) {
            print.error("An error occurred upon interface invocation", err);

            this.handleInvocationError(err);

            this.printWarningLog();

            return {
                for: () => {}  // TODO: Count failure? print failure?
            }
        }

        return {

            for: async (expectedResult, caption?: string) => {
                // TODO: Only allow for use once?
                const resolve = () => {
                    clearTimeout(this.testTimeout);

                    caption = caption || `Test ${this.id}.${++this.conductions}`;

                    !(actualResult instanceof Error)
                    && this.filterActualResult(expectedResult, actualResult)

                    const isEqual: boolean|Promise<boolean|Error>|Error = this.compareEqual(expectedResult, actualResult);
                    
                    (this.id !== Test.lastActiveId)
                    && print.badge(`${this.caption}${(this.activations++ > 0) ? ` (${this.activations})` : ""}`, this.badgeColor[0], this.badgeColor[1], this.badgeColor[2]);
                    
                    Test.lastActiveId = this.id;
                    
                    this.printWarningLog();

                    if(isEqual === true) {
                        // Success
                        Test.counter.succeeded++;
                        
                        print.success(caption);

                        return;
                    }

                    Test.counter.failed++;

                    !(actualResult instanceof Error)
                    ? print.failure(caption, expectedResult, actualResult)
                    : print.failure(caption);
                };

                (actualResult instanceof Promise)
                ? (actualResult
                .then(resolvedResult => {
                    actualResult = resolvedResult;
                })
                .catch((err: Error) => {
                    this.handleInvocationError(err);
                    
                    actualResult = err;
                })
                .finally(resolve))
                : resolve();
            
            }

        };
    }

}