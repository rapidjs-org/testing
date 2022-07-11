import { Test } from "./Test";


export class UnitTest extends Test {

    private static badgeColor: number[] = [255, 155, 195];
    
    constructor(caption: string, func: ((...args) => any)) {
        if(!(func instanceof Function) && typeof(func) !== "function") {
            throw new TypeError("Unit test requires function argument");
        }

        super(caption, func);

        super.badgeColor = UnitTest.badgeColor;
    }

    public invokeInterfaceProperty(...args: any[]) {
        return this.interfaceProperty(...args);
    }

    protected handleInvocationError(err: Error) {
        this.pushWarning("Could not apply function to given arguments");
    }

}