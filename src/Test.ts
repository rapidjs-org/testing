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
    
    protected readonly interfaceProperty: ((...args) => any);

    private activations: number = 0;
    private conductions: number = 0;
    
    constructor(caption: string, interfaceProperty: ((...args) => any)) {
        this.id = Test.idCounter++;
        this.caption = caption;
        this.interfaceProperty = interfaceProperty;
    }
    
    protected abstract invokeInterfaceProperty(...args);

    protected abstract compareEqual<T>(expectedResult: T, actualResult: T): boolean;

    public conduct(...args) {
        (this.id !== Test.lastActiveId)
        && print.badge(`${this.caption}${(this.activations++ > 0) ? ` (${this.activations})` : ""}`, 255, 155, 195);

        Test.lastActiveId = this.id;
        
        let actualResult;
        try {
            actualResult = this.invokeInterfaceProperty(...args);
        } catch(err) {
            // TODO: Caption now, too?
            print.error("An error occurred upon interface invocation", err);
        }

        return {

            for: (expectedResult, caption?: string) => {
                // TODO: Only allow for use once?

                caption = caption || `Test ${++this.conductions}`;
                
                if(this.compareEqual(expectedResult, actualResult)) {
                    // Success
                    Test.counter.succeeded++;

                    print.success(caption);

                    return;
                }

                // Failure
                Test.counter.failed++;

                print.failure(caption, expectedResult, actualResult);
            }

        };
    }

}