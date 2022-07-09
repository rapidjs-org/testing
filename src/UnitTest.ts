import { isObject } from "./util";
import * as print from "./print";

import { Test } from "./Test";


export class UnitTest extends Test {

    constructor(caption: string, func: ((...args) => any)) {
        super(caption, func);
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

    public invokeInterfaceProperty(...args: any[]) {
        return this.interfaceProperty(...args);
    }
    
    public compareEqual(expectedResult, actualResult): boolean {
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
            print.warning("Result type mismatch");
        }

        return true;
    }

}