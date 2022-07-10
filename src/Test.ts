import * as print from "./print";


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
    
    protected readonly interfaceProperty;
    protected badgeColor: number[];

    private activations: number = 0;
    private conductions: number = 0;
    
    constructor(caption: string, interfaceProperty) {
        this.id = Test.idCounter++;
        this.caption = caption;
        this.interfaceProperty = interfaceProperty;
    }
    
    protected abstract invokeInterfaceProperty(...args);

    protected abstract compareEqual(expectedResult, actualResult): boolean|Promise<any>;

    public conduct(...args) {
        (this.id !== Test.lastActiveId)
        && print.badge(`${this.caption}${(this.activations++ > 0) ? ` (${this.activations})` : ""}`, this.badgeColor[0], this.badgeColor[1], this.badgeColor[2]);

        Test.lastActiveId = this.id;
        
        let actualResult;
        try {
            actualResult = this.invokeInterfaceProperty(...args);
        } catch(err) {
            // TODO: Caption now, too?
            print.error("An error occurred upon interface invocation", err);
        }

        return {

            for: async (expectedResult, caption?: string) => {
                // TODO: Only allow for use once?
                let isEqual: boolean|Promise<boolean|Error>|Error;

                caption = caption || `Test ${++this.conductions}`;

                isEqual = this.compareEqual(expectedResult, actualResult);
                if(isEqual instanceof Promise) {
                    isEqual = await isEqual;
                }

                if(isEqual === true) {
                    // Success
                    Test.counter.succeeded++;
                    
                    print.success(caption);

                    return;
                }

                Test.counter.failed++;

                (isEqual instanceof Error)
                ? print.failure(caption)  // Erroneous failure
                : print.failure(caption, expectedResult, actualResult);  // Correct failure
            }

        };
    }

}