import { EventEmitter } from "events";
import { deepEqual } from "assert";

import { TColor } from "../../common.types";
import { AsyncMutex } from "./AsyncMutex";
import { Promisification } from "./Promisification";
import { FormatError } from "./FormatError";

import _config from "./config.json";


export abstract class Test<T = unknown> {
	private static runningTests = 0;
	private static completeTimeout: NodeJS.Timeout;
	private static mutex = new AsyncMutex();

	public static readonly suiteTitle: string;
	public static readonly suiteColor: TColor;
	
	public static readonly event = new EventEmitter();

	private wasConsumed = false;
	
	public readonly title: string;
	public readonly sourcePosition?: string;

	public wasSuccessful: boolean;
	public displayActual: Partial<T>|string;
	public displayExpected: Partial<T>|string;

    constructor(title: string) {
    	this.title = title;
		
    	try {
    		throw new Error();
    	} catch(err) {
    		try {
    			this.sourcePosition = err.stack
				.split(/\n/g)
				.filter((sourceLine: string) => /\.test\.js([^\w\d]|$)/.test(sourceLine.trim()))
				.join("\n");
    		} catch {}
    	}

		clearTimeout(Test.completeTimeout);
		Test.runningTests++;
		
		Test.event.emit("create", this);
    }

	private async promisifyExpression(...expression: unknown[]): Promise<T[]> {
		const resolvedExpression: T[] = [];

		for(let expr of expression) {
			resolvedExpression.push(await new Promisification<T>(expr).resolve());
		}
		
		return resolvedExpression;
	}

    protected evalActualExpression(...expression: unknown[]): T|Promise<T> {
		return expression[0] as unknown as T;
	}
	
    protected evalExpectedExpression(...expression: unknown[]): T|Promise<T> {
		return expression[0] as unknown as T;
	}

    protected getDifference(actual: T, expected: T): {
		actual: Partial<T>;
		expected: Partial<T>;
	} {
		try {
			deepEqual(actual, expected);

			return {
				actual: null,
				expected: null
			};
		} catch {
			return {
				actual, expected
			};
		}
	}

	public eval(...expression: unknown[]) {
		return this.actual(...expression);
	}	// alias
    public actual(...expression: unknown[]) {
		const actualExpression: unknown[] = expression;
		
		if(this.wasConsumed) throw new SyntaxError("Test case was already consumed");
		this.wasConsumed = true;

		const complete = () => {
			if(--Test.runningTests > 0) return;

			Test.completeTimeout = setTimeout(() => Test.event.emit("complete"), _config.completeTimeout);
		};

    	return {

    		expected: (...expression: unknown[]) => {
				Test.mutex.lock(async () => {
					const expectedExpression: unknown[] = expression;
					
					let actual: T;
					try {
						actual = await new Promisification<T>(
							this.evalActualExpression(...await this.promisifyExpression(...actualExpression))
						).resolve();
					} catch(err: unknown) {
						throw new FormatError(err, "Cannot consume actual value", this.sourcePosition);
					}

					let expected: T;
					try {
						expected = await new Promisification<T>(
							this.evalExpectedExpression.apply(null, await this.promisifyExpression(...expectedExpression))
						).resolve();
					} catch(err: unknown) {
						throw new FormatError(err, "Cannot consume expected value", this.sourcePosition);
					}

					const difference: {
						actual: Partial<T>;
						expected: Partial<T>;
					} = this.getDifference(actual, expected);

					this.wasSuccessful = [ undefined, null ].includes(difference.actual) || !Object.keys(difference.actual).length;

					this.displayActual = difference.actual;
					this.displayExpected = difference.expected;

					complete();
				});
    		},

			error: (message: string, ErrorPrototype?: ErrorConstructor) => {
				Test.mutex.lock(async () => {
					this.displayExpected = `${ErrorPrototype?.name ? `${ErrorPrototype.name}: ` : ""}${message}`;

					try {
						const actual:T = await new Promisification<T>(
							this.evalActualExpression(...await this.promisifyExpression(...actualExpression))
						).resolve();
						
						this.wasSuccessful = false;
						
						this.displayActual = actual;
					} catch(err: unknown) {
						this.wasSuccessful
						=  (ErrorPrototype ? (err.constructor === ErrorPrototype) : true)
						&& (message === (((err instanceof Error)) ? err.message : err));
						
						this.displayActual = err.toString();
					} finally {
						complete();
					}
				});
			}

    	};
    }
}

// TODO: Difference helpers?