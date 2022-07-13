import https from "https";
import { OutgoingHttpHeaders } from "http2";

import { isString } from "./util";
import { Test } from "./Test";


type THeaders = Record<string, string|number|(string|number)[]>;


// TODO: Way to store network responses for further tests use

interface IRequestOptions {
    method?: string;
    headers?: THeaders;
	searchParams?: Record<string, string|number|boolean>;
}

interface IResponseData {
    status: number,
    headers: THeaders,
    message: string
}


export class NetworkTest extends Test {
    
    private static badgeColor: number[] = [ 170, 131, 226 ];
    private static commonHost: string;

    public static setCommonHost(hostname: string) {
    	NetworkTest.commonHost = hostname;
    }

    constructor(location: string, caption?: string) {
    	if(!isString(location)) {
    		throw new TypeError("Network test requires destination location argument (URL or pathname)");
    	}
        
    	super(location, caption, `Network Test (➞ '${location}')`);
        
    	super.badgeColor = NetworkTest.badgeColor;
    }

    protected filterActualResult(expectedResult: IResponseData, actualResult: IResponseData): IResponseData {
    	if(!expectedResult.status && actualResult.status) {
    		delete actualResult.status;
    	}

    	const updatedHeaders: THeaders = {};

    	const expectedHeaders: THeaders = expectedResult.headers || {};  // TODO: Header name case sensitivity?
    	for(const header in expectedHeaders) {
    		if(expectedHeaders[header] && actualResult.headers[header]) {
    			updatedHeaders[header] = actualResult.headers[header];
    		}
    	}

    	if(Object.keys(updatedHeaders).length === 0) {
    		delete actualResult.headers;
    	} else {
    		actualResult.headers = updatedHeaders;
    	}

    	if(!expectedResult.message && actualResult.message) {
    		delete actualResult.message;
    	}
        
    	return actualResult;
    }

    protected invokeInterfaceProperty(options: IRequestOptions = {}, body?: Record<string, unknown>): Promise<IResponseData> {
    	const location: string = this.interfaceProperty;
        
    	const hasExplicitHost: boolean = (location.charAt(0) != "/");

    	const hostname: string = !hasExplicitHost
    		? NetworkTest.commonHost || "localhost"
    		: location.split("/", 2)[0];

    	let path: string = hasExplicitHost
    		? `/${location.split("/", 2)[1] || ""}`
    		: location;

		if(options.searchParams) {
			const searchQueryStr: string = Object.keys(options.searchParams)
			.map((key: string) => {
				return `${key}=${encodeURIComponent(options.searchParams[key].toString())}`;
			}).join("&");
			
			path += `?${searchQueryStr}`;
		}
		
    	return new Promise((resolve, reject) => {
    		const req = https
    			.request({
    				hostname: hostname,
    				path: path,
    				method: !options.method
    					? (body
    						? "POST"
    						: "GET")
    					: options.method,
    				headers: options.headers as OutgoingHttpHeaders
    			}, res => {
    				res.on("data", data => {
    					resolve({
    						status: res.statusCode,
    						headers: res.headers as THeaders,
    						message: String(data)
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

    // TODO: Retrieve dynamic name method? No explicit naming requirement...

    protected compareEqual(expectedResult: IResponseData, actualResult: IResponseData): boolean {  
    	let isSuccessful = true;
        
    	// Only test for provided expected response properties

    	if(expectedResult.status
        && expectedResult.status !== actualResult.status) {
    		this.pushWarning("Mismatching status codes");
            
    		isSuccessful = false;
    	}

    	const expectedHeaders: THeaders = expectedResult.headers || {};  // TODO: Header name case sensitivity?
    	for(const header in expectedHeaders) {
    		if(actualResult.headers[header] != expectedHeaders[header]) {
    			this.pushWarning(`Mismatching values for header '${header}'`);
                
    			isSuccessful = false;
    		}
    		if(!actualResult.headers[header]) {
    			this.pushWarning(`Missing response header '${header}'`);
                
    			isSuccessful = false;
    		}
    	}

    	try {
    		actualResult.message = JSON.parse(actualResult.message);
    		// eslint-disable-next-line
		} catch {}

    	if(!super.compareEqual(actualResult.message, expectedResult.message)) {
    		this.pushWarning("Mismatching message data");

    		isSuccessful = false;
    	}

    	return isSuccessful;
    }

    protected handleInvocationError(err: Error) {
    	this.pushWarning(`Could not perform request to '${this.interfaceProperty}': "${err.message}"`);
    }

}   // TODO: Display location in generic test name