import https from "https";
import { OutgoingHttpHeaders } from "http2";

import { isString } from "./util";
import { readOption } from "./options";
import { Test } from "./Test";


type THeaders = Record<string, string|number|(string|number)[]>;


/*
 * Request object interface.
 * Network tests to provide case individual information using the stated pattern:
 */
interface IRequestOptions {
    method?: string;
    headers?: THeaders;
	searchParams?: Record<string, string|number|boolean>;
	body?: unknown;
}

/*
 * Response object interface.
 * Network tests to resolve with and check for case individual information using
 * the stated pattern:
 */
interface IResponseData {
    status?: number;
    headers?: THeaders;
    message?: string;
}


/**
 * Class representing a network test context for independent endpoint
 * request interfaces.
 * Implicit HTTP(S) communication behavior.
 */
export class NetworkTest extends Test<string> {
    
    private static badgeColor: number[] = [ 170, 131, 226 ];
    private static commonHost: string;

    /**
	 * Set a common hostname for all subsequent test objects
	 * (concatenated href URL components).
	 * @param {string} hostname Common hostname
	 */
    public static setCommonHost(hostname: string) {
    	NetworkTest.commonHost = hostname;
    }

    /**
	 * Create a network test object.
     * @param {string} location Endpoint URL to approach (a pathname is either prepended with the common host or 'localhost' (default))
	 * @param {string} [caption] Optional test caption (generic caption otherwise)
     */
    constructor(location: string, caption?: string) {
    	if(!isString(location)) {
    		throw new TypeError("Network test requires destination location argument (URL or pathname)");
    	}
        
    	super(location, caption, `Network Test (➞ '${location}')`);
        
    	super.badgeColor = NetworkTest.badgeColor;
    }

    /**
	 * Filter a response object for case individual properties.
	 * Prevents exhaustive comparisons / expected result provision.
	 * @param {IResponseData|Object} expectedResult Expected response object (All-optional-properties interface of IResponseObject)
	 * @param {IResponseData} actualResult Actual response object
	 * @returns {IResponseData|Object} Filtered response object (that is to be passed to further processing)
	 */
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

    /**
     * Perform an request to the interface location with the given parameters.
	 * @async
     * @param {IRequestOptions} [options={}] Request options / parameters
     * @param {Object} [body] Optional request body to provide
     * @returns {Promise<IResponseData>} Promise resolving to a response object
     */
    protected invokeInterfaceProperty(options: IRequestOptions = {}): Promise<IResponseData> {
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
    					? (options.body
    						? "POST"
    						: "GET")
    					: options.method,
    				headers: options.headers as OutgoingHttpHeaders,
    				timeout: readOption("timeout", "T", 5000).number()
    			}, res => {
    				res.on("data", data => {
    					resolve({
    						status: res.statusCode,
    						headers: res.headers as THeaders,
    						message: String(data)
    					});
    				});
    			});
            
    		req.on("error", err => {
    			reject(err);
    		});
            
    		options.body
            && req.write(JSON.stringify(options.body));

    		req.end();
    	});
    }

    /**
	 * Compare two re
	 * @param {IResponseData|Object} expectedResult Expected response object only stating relevant properties (filter basis)
	 * @param {IResponseData} actualResult Actual response object
	 * @returns {Boolean} Whether the relevant response properties are present in the actual response object
	 */
    protected compareEqual(expectedResult: IResponseData, actualResult: IResponseData): boolean {  
    	let isSuccessful = true;
        
    	// Only test for provided expected response properties

    	if(expectedResult.status
        && expectedResult.status !== actualResult.status) {
    		this.pushWarning("Mismatching status codes");
            
    		isSuccessful = false;
    	}

    	const expectedHeaders: THeaders = expectedResult.headers || {};
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

    /**
     * Define a class sepcific invocation error warning push.
     * @param {Error} err Invocation error
     */
    protected handleInvocationError(err: Error) {
    	this.pushWarning(`Could not perform request to '${this.interfaceProperty}': "${err.message}"`);
    }

}