import * as print from "./print";

import { Test } from "./Test";


export class UnitTest extends Test {

    constructor(caption: string, func: ((...args) => any)) {
        super(caption, func);
    }

    public invokeInterfaceProperty(...args: any[]) {
        return this.interfaceProperty(...args);
    }
    
    public compareEqual(expectedResult, actualResult): boolean {
        if(expectedResult != actualResult) {
            return false;
        }

        if(expectedResult !== actualResult) {
            print.warning("Loose equality with result type mismatch");
        }

        return true;
    }

}