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
    private readonly interfaceProperty: ((...args) => any);

    private readonly activations: number = 0;
    
    constructor(caption: string, interfaceProperty: ((...args) => any)) {
        this.id = Test.idCounter++;
        this.caption = caption;
        this.interfaceProperty = interfaceProperty;
    }

    public conduct(...args) {
        (this.id !== Test.lastActiveId)
        && print.badge(this.caption, 255, 155, 195);

        let result;
        try {
            result = this.interfaceProperty(...args);
        } catch(err) {
            print.error("An error occurred upon interface invocation", err);
        }
    }

    public abstract invokeInterfaceProperty(...args);

    public abstract compareEqual(...args): boolean;

}