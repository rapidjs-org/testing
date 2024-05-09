import { ClientRequest, RequestOptions, request as httpRequest } from "http";
import { join } from "path";
import { deepStrictEqual } from "assert";

import { Test } from "@t-ski/otes";

import { TColor } from "../../common.types";


type THeaders = { [ key: string ]: string; };

type TConfiguration = RequestOptions & {
	pathRoot?: string;
};

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
	public static readonly suiteColor: TColor = [ 177, 66, 179 ];

    private static configuration: TConfiguration = {
		method: "GET",
		protocol: "http:",
    	hostname: "localhost",
    	port: 80
    };

    public static configure(configuration: TConfiguration) {
    	RequestTest.configuration = {
    		...RequestTest.configuration,
    		...configuration
    	};
    }

    constructor(title: string) {
    	super(title);
    }
	
    protected evalActualExpression(path: string, options: TConfiguration & {
		body?: unknown
	} = {}): Promise<IARequest> {	// TODO: Overloads
    	return new Promise((resolve, reject) => {
    		const reqOptions: RequestOptions = {
    			...RequestTest.configuration,
                
    			path: encodeURI(join(RequestTest.configuration.pathRoot ?? "", path)),
                
    			...options
    		};

    		const req: ClientRequest = httpRequest(reqOptions, res => {
    			const body: Buffer[] = [];
    			res.on("data", (chunk: Buffer) => {
    				body.push(chunk);
    			});
    			res.on("end", () => {
    				let parsedBody = Buffer.concat(body).toString();

    				try { parsedBody = JSON.parse(parsedBody); } catch {}
                    
    				resolve({
						status: res.statusCode ?? -1,
						headers: res.headers as THeaders,
    					body: parsedBody
    				});
    			});
    			res.on("error", err => reject(err));
    		})
    		.on("error", err => reject(err));
			
    		options.body
			&& req.write(
				!((typeof(options.body) === "string") || (options.body instanceof Buffer) || (options.body instanceof Uint8Array))
				? JSON.stringify(options.body)
				: options.body
			);

    		req.end();
    	});
	}

    protected isEqual(actual: IARequest, expected: IEResponse): boolean {
		return !Object.keys(this.getDisplayValues(actual, expected).actual).length;
	}

	protected getDisplayValues(actual: IARequest, expected: IEResponse) {
		// Match messages, unless expected object is a response parameters object (containing a response key)
    	// Weak equality, i.e. only compare provided fields (selective)

		type TIndexedValue = { [ key: string ]: unknown; };

		const filteredActual: TIndexedValue = {};
		const filteredExpected: TIndexedValue = {};
		
    	[ "status", "message" ]
    	.forEach(simpleKey => {
			const indexedActual = actual as unknown as TIndexedValue;
			const indexedExpected = actual as unknown as TIndexedValue;

			if(!indexedExpected[simpleKey]) return;

			try {
				deepStrictEqual(indexedActual[simpleKey], indexedExpected[simpleKey]);
			} catch {
				filteredActual[simpleKey] = indexedActual[simpleKey];
				filteredExpected[simpleKey] = indexedExpected[simpleKey];
			}
		});

    	for(const name in (expected.headers || {})) {
    		const actualHeader = actual.headers[name.toLowerCase()];
    		const expectedHeader = expected.headers[name];

    		if(actualHeader === expectedHeader) continue;
            
    		filteredActual.headers = filteredActual.headers || {};
    		(filteredActual.headers as TIndexedValue)[name] = actualHeader;
    		filteredExpected.headers = filteredExpected.headers || {};
    		(filteredActual.headers as TIndexedValue)[name] = expectedHeader;
    	}

		return {
			actual: filteredActual,
			expected: filteredExpected
		};
	}
};