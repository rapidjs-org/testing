import { Test } from "./Test";


export class NetworkTest extends Test {
    
    private static badgeColor: number[] = [255, 155, 195];
    private static commonHost: string;

    public static setCommonHost(hostname: string) {
        NetworkTest.commonHost = hostname;
    }

    constructor(caption: string, location: string) {
        super(caption, location);

        super.badgeColor = NetworkTest.badgeColor;
    }

    protected invokeInterfaceProperty(...args: any[]) {
        throw new Error("Method not implemented.");
    }

    protected compareEqual(expectedResult, actualResult): boolean {
        throw new Error("Method not implemented.");
    }

}