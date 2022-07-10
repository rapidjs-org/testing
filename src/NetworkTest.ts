import https from "https";

import * as print from "./print";
import { Test } from "./Test";


interface IRequestOptions {

}

interface IResponseData {

}


const testTimeoutDuration: number = 5000; // TODO: How provide custom value?

export class NetworkTest extends Test {
    
    private static badgeColor: number[] = [125, 155, 255];
    private static commonHost: string;

    private testTimeout: number|NodeJS.Timeout;

    public static setCommonHost(hostname: string) {
        NetworkTest.commonHost = hostname;
    }

    constructor(caption: string, location: string) {
        super(caption, location);

        super.badgeColor = NetworkTest.badgeColor;
    }

    protected invokeInterfaceProperty(options: IRequestOptions = {}, body?: Object): Promise<IResponseData> {
        this.testTimeout = setTimeout(_ => {
            print.warning("A network test timed out");  // TODO: Info on how to change
            process.exit(1);
        }, testTimeoutDuration);

        const location: string = this.interfaceProperty;
        
        const hasExplicitHost: boolean = (location.charAt(0) != "/");

        const hostname: string = !hasExplicitHost
        ? NetworkTest.commonHost || "localhost"
        : location.split("/", 2)[0];

        const path: string = hasExplicitHost
        ? location.split("/", 2)[1] || ""
        : location;

        return new Promise((resolve, reject) => {
            const req = https
            .request({
                hostname: hostname,
                path: path,
                method: "GET"   // TODO: How?
            }, res => {
                res.on("data", data => {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: String(data)
                    }); // TODO: What to return?
                });
            });
            
            req.on("error", err => {
                reject(err);
            });
            
            body
            && req.write(JSON.stringify(body));

            req.end();
        });
    }

    protected compareEqual(expectedResult: Object, actualResult: Promise<IResponseData>): Promise<boolean|Error> {  
        return new Promise(resolve => {
            actualResult
            .then((actualResult: IResponseData) => {
                console.log(actualResult)
                // TODO: Implement
                // actualResult ==~ expectedResult

                resolve(true);
            })
            .catch((err: Error) => {
                resolve(err);

                print.warning(`Could not perform request to '${this.interfaceProperty}'`);
                print.warning(`Skipping more instructions of test object`);
            })
            .finally(() => {
                clearTimeout(this.testTimeout);
            });
        });
    }

}