process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

import { ClientRequest, RequestOptions, request as httpRequest } from "http";
import { request as httpsRequest } from "https";
import { join } from "path";
import { deepEqual } from "assert";

import { Test } from "@rapidjs.org/testing";

import { TColor } from "../../common.types";

type THeaders = { [key: string]: string };

type TConfiguration = RequestOptions & {
	https?: boolean;
	pathRoot?: string;
};

interface IResponse {
	body?: unknown;
	headers?: THeaders;
	status?: number;
}

export class HTTPTest extends Test<IResponse> {
	public static readonly suiteTitle: string = "HTTP";
	public static readonly suiteColor: TColor = [177, 66, 179];

	private static configuration: TConfiguration = {
		hostname: "localhost",
		https: false,
		method: "GET",
		port: 80
	};

	public static configure(configuration: TConfiguration) {
		HTTPTest.configuration = {
			...HTTPTest.configuration,
			...configuration
		};
	}

	protected evalActualExpression(
		path: string,
		options: TConfiguration & {
			body?: unknown;
		} = {}
	): Promise<IResponse> {
		// TODO: Overloads
		return new Promise((resolve, reject) => {
			const reqOptions: TConfiguration & RequestOptions = {
				...HTTPTest.configuration,

				path: encodeURI(join(HTTPTest.configuration.pathRoot ?? "", path)),

				...options
			};
			reqOptions.protocol = `http${reqOptions.https ? "s" : ""}:`;

			const req: ClientRequest = (reqOptions.https ? httpsRequest : httpRequest)(reqOptions, (res) => {
				const body: Buffer[] = [];
				res.on("data", (chunk: Buffer) => {
					body.push(chunk);
				});
				res.on("end", () => {
					let parsedBody: unknown;
					try {
						parsedBody = JSON.parse(Buffer.concat(body).toString());
					} catch {
						parsedBody = Buffer.concat(body).toString();
					}

					resolve({
						status: res.statusCode ?? -1,
						headers: res.headers as THeaders,
						body: parsedBody
					});
				});
				res.on("error", (err) => reject(err));
			}).on("error", (err) => reject(err));

			options.body &&
				req.write(
					!(
						typeof options.body === "string" ||
						options.body instanceof Buffer ||
						options.body instanceof Uint8Array
					)
						? JSON.stringify(options.body)
						: options.body
				);

			req.end();
		});
	}

	protected getDifference(actual: IResponse, expected: IResponse) {
		// Weak equality, i.e. only compare provided fields

		type TIndexedObject = { [key: string]: unknown };

		const displayExpected: TIndexedObject = Object.assign({}, expected as TIndexedObject);
		const displayActual: TIndexedObject = Object.assign({}, actual as TIndexedObject);

		displayExpected["headers"] = Object.fromEntries(
			Object.entries(displayExpected["headers"] ?? {}).map((entry: string[]) => [
				entry[0].toLowerCase(),
				entry[1]
			])
		);

		const filterObj = (sourceObj: TIndexedObject, targetObj: TIndexedObject) => {
			for (const key in targetObj) {
				if (sourceObj[key]) continue;

				delete targetObj[key];
			}

			for (const key in sourceObj) {
				try {
					deepEqual(sourceObj[key], targetObj[key]);

					delete sourceObj[key];
					delete targetObj[key];
				} catch {}
			}
		};
		filterObj(displayExpected["headers"] as TIndexedObject, displayActual["headers"] as TIndexedObject);
		if (!Object.entries(displayExpected["headers"] ?? {}).length) {
			delete displayExpected["headers"];
			delete displayActual["headers"];
		}
		filterObj(displayExpected, displayActual);

		return {
			actual: displayActual,
			expected: displayExpected
		};
	}
}
