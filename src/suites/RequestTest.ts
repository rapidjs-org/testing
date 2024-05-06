import { ClientRequest, request as httpRequest } from "http";
import { deepStrictEqual } from "assert";

import { TColor } from "../types";
import { Test } from "../Test";


type THeaders = { [ key: string ]: string; };

interface IARequest {
	status: number;
	headers: THeaders;
	body: unknown;
}

interface IEResponse {
	status?: number;
	headers?: THeaders;
	body?: unknown;
}


export class RequestTest extends Test<IARequest, IEResponse> {
	public static readonly suiteTitle: string = "Request";
	public static readonly suiteColor: TColor = [ 0, 255, 0];

    private static configuration = {
    	hostname: "localhost",
    	port: 80
    };

    public static configure(configuration) {
    	RequestTest.configuration = {
    		...RequestTest.configuration,
    		...configuration
    	};
    }

    constructor(title) {
    	super(title);
    }
	
    protected evalActualExpression(path: string, options: {
		body?: unknown;
	} = {}): Promise<IARequest> {	// TODO: Overloads
    	const body = options.body;
    	delete options.body;

    	return new Promise((resolve, reject) => {
    		const reqOptions = {
    			...RequestTest.configuration,
                
    			method: "GET",
    			headers: {},
    			path: path,
                
    			...options
    		};
            
    		const req: ClientRequest = httpRequest(reqOptions, res => {
    			const body: Buffer[] = [];
    			res.on("data", (chunk: Buffer) => {
    				body.push(chunk);
    			});
    			res.on("end", () => {
    				clearTimeout(requestTimeout);
                    
    				let parsedBody = Buffer.concat(body).toString();
    				try { parsedBody = JSON.parse(parsedBody); } catch {}
                    
    				resolve({
						status: res.statusCode,
						headers: res.headers as THeaders,
    					body: parsedBody
    				});
    			});
    			res.on("error", err => reject(err));
    		})
    			.on("error", err => reject(err));

    		const requestTimeout = setTimeout(() => {
    			req.destroy();
                
    			reject(new RangeError(`Request timeout on \x1b[2m'${JSON.stringify(reqOptions, null, 2)}'\x1b[22m`));
    		}, 5000);

    		body && req.write(body);
    		req.end();
    	});
	}

    protected isEqual(actual: IARequest, expected: IEResponse): boolean {
		return !Object.keys(this.getDisplayValues(actual, expected)).length;
	}

	protected getDisplayValues(actual: IARequest, expected: IEResponse) {
		// Match messages, unless expected object is a response parameters object (containing a response key)
    	// Weak equality, i.e. only compare provided fields (selective)

		const filteredActual: Partial<IARequest> = {};
		const filteredExpected: IEResponse = {};
		
    	[ "status", "message" ]
    	.forEach(simpleKey => {
			if(!expected[simpleKey]) return;
			try {
				deepStrictEqual(actual[simpleKey], expected[simpleKey]);
			} catch {
				filteredActual[simpleKey] = actual[simpleKey];
				filteredExpected[simpleKey] = expected[simpleKey];
			}
		});

    	for(const name in (expected.headers || {})) {
    		const actualHeader = actual.headers[name.toLowerCase()];
    		const expectedHeader = expected.headers[name];

    		if(actualHeader === expectedHeader) continue;
            
    		filteredActual.headers = filteredActual.headers || {};
    		filteredActual.headers[name] = actualHeader;
    		filteredExpected.headers = filteredExpected.headers || {};
    		filteredExpected.headers[name] = expectedHeader;
    	}

		return {
			actual: filteredActual,
			expected: filteredExpected
		};
	}
};