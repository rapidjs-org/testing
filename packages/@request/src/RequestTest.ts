import { ClientRequest, RequestOptions, request as httpRequest } from "http";
import { join } from "path";
import { deepEqual } from "assert";

import { Test } from "@t-ski/otes";

import { TColor } from "../../common.types";


type THeaders = { [ key: string ]: string; };

type TConfiguration = RequestOptions & {
	pathRoot?: string;
};

interface IResponse {
	status?: number;
	headers?: THeaders;
	body?: unknown;
}


export class RequestTest extends Test<IResponse> {
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
	} = {}): Promise<IResponse> {	// TODO: Overloads
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

	protected getDifference(actual: IResponse, expected: IResponse) {
    	// Weak equality, i.e. only compare provided fields

		type TIndexedObject = { [ key: string ]: unknown; };

		const displayExpected: TIndexedObject = Object.assign({}, (expected as TIndexedObject));
		const displayActual: TIndexedObject = Object.assign({}, (actual as TIndexedObject));

		displayExpected["headers"] = Object.fromEntries(
			Object.entries(displayExpected["headers"])
			.map((entry: string[]) => [ entry[0].toLowerCase(), entry[1] ])
		);
		
		const filterObj = (sourceObj: TIndexedObject, targetObj: TIndexedObject) => {
			for(let key in targetObj) {
				if(sourceObj[key]) continue;

				delete targetObj[key];
			}

			for(let key in sourceObj) {
				try {
					deepEqual(sourceObj[key], targetObj[key]);
					
					delete sourceObj[key];
					delete targetObj[key];
				} catch {}
			}
		};

		filterObj(displayExpected["headers"] as TIndexedObject, displayActual["headers"] as TIndexedObject);
		if(!Object.entries(displayActual["headers"] ?? {}).length) {
			delete displayExpected["headers"];
			delete displayActual["headers"];
		}
		
		filterObj(displayExpected, displayActual);
		
		return {
			actual: displayActual,
			expected: displayExpected
		}
	}
}