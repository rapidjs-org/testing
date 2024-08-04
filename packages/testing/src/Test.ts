import { EventEmitter } from "events";
import { deepEqual } from "assert";

import { TColor } from "../../common.types";
import { AsyncMutex } from "./AsyncMutex";
import { Promisification } from "./Promisification";
import { FormatError } from "./FormatError";

import _config from "./config.json";

interface IDifference<T> {
	actual: Partial<T> | string;
	expected: Partial<T> | string;
}

export abstract class Test<T = unknown> {
	private static runningTests = 0;
	private static completeTimeout: NodeJS.Timeout;
	private static mutex = new AsyncMutex();

	public static readonly suiteTitle: string;
	public static readonly suiteColor: TColor | [number, number, number];

	public static readonly event = new EventEmitter();

	#hasConsumedActual = false;
	#hasConsumedExpected = false;

	public readonly title: string;
	public readonly sourcePosition?: string;

	public wasSuccessful: boolean;
	public difference: IDifference<T>;

	public static tryComplete() {
		if (--Test.runningTests > 0) return;

		Test.completeTimeout = setTimeout(() => Test.event.emit("complete"), _config.completeTimeout);
	}

	constructor(title: string) {
		this.title = title;

		try {
			throw new Error();
		} catch (err: unknown) {
			try {
				this.sourcePosition = (err as Error).stack
					.split(/\n/g)
					.filter((line: string) => /\.test\.js([^\w\d]|$)/.test(line.trim()))
					.map((line: string) => line.trim())
					.join("\n");
			} catch {}
		}

		clearTimeout(Test.completeTimeout);
		Test.runningTests++;

		Test.event.emit("create", this);
	}

	private async promisifyExpression(...expression: unknown[]): Promise<T[]> {
		const resolvedExpression: T[] = [];

		for (const expr of expression) {
			resolvedExpression.push(await new Promisification<T>(expr).resolve());
		}

		return resolvedExpression;
	}

	protected evalActualExpression(...expression: unknown[]): T | Promise<T> {
		return expression[0] as T;
	}

	protected evalExpectedExpression(...expression: unknown[]): T | Promise<T> {
		return expression[0] as T;
	}

	protected getDifference(actual: T, expected: T): IDifference<T> {
		try {
			deepEqual(actual, expected);

			return {
				actual: null,
				expected: null
			};
		} catch {
			return {
				actual,
				expected
			};
		}
	}

	public eval(...expression: unknown[]) {
		return this.actual(...expression);
	} // alias
	public actual(...expression: unknown[]) {
		const actualExpression: unknown[] = expression;

		if (this.#hasConsumedActual) throw new SyntaxError("Test case was already consumed");
		this.#hasConsumedActual = true;

		const expected = (...expression: unknown[]) => {
			if (this.#hasConsumedExpected) throw new SyntaxError("Test case was already consumed");
			this.#hasConsumedExpected = true;

			Test.mutex.lock(async () => {
				const expectedExpression: unknown[] = expression;

				let actual: T;
				try {
					actual = await new Promisification<T>(
						this.evalActualExpression(...(await this.promisifyExpression(...actualExpression)))
					).resolve();
				} catch (err: unknown) {
					throw new FormatError(err, "Cannot consume actual value", this.sourcePosition);
				}

				let expected: T;
				try {
					expected = await new Promisification<T>(
						this.evalExpectedExpression(...(await this.promisifyExpression(...expectedExpression)))
					).resolve();
				} catch (err: unknown) {
					throw new FormatError(err, "Cannot consume expected value:", this.sourcePosition);
				}

				this.difference = this.getDifference(actual, expected);

				const isAtomic = (value: unknown): boolean => {
					return [undefined, null].includes(value) || ["string", "number", "boolean"].includes(typeof value);
				};
				const wasPartiallySuccessful = (value: Partial<T> | string): boolean => {
					return [undefined, null].includes(value) || (!isAtomic(value) && !Object.keys(value).length);
				};

				this.wasSuccessful =
					(isAtomic(this.difference.actual) ? this.difference.actual == this.difference.expected : true) &&
					wasPartiallySuccessful(this.difference.actual) &&
					wasPartiallySuccessful(this.difference.expected);

				Test.tryComplete();
			});
		};

		return {
			expect: expected, // alias
			expected,

			error: (message: string, ErrorPrototype?: ErrorConstructor) => {
				if (this.#hasConsumedExpected) throw new SyntaxError("Test case was already consumed");
				this.#hasConsumedExpected = true;

				Test.mutex.lock(async () => {
					this.difference = {
						actual: null,
						expected: `${ErrorPrototype?.name ? `${ErrorPrototype.name}:` : "thrown:"} ${message}`
					};

					try {
						const actual: T = await new Promisification<T>(
							this.evalActualExpression(...(await this.promisifyExpression(...actualExpression)))
						).resolve();

						this.wasSuccessful = false;

						this.difference.actual = actual;
					} catch (err: unknown) {
						this.wasSuccessful =
							(ErrorPrototype ? err.constructor === ErrorPrototype : true) &&
							message === (err instanceof Error ? err.message : err);

						this.difference.actual = (err as Error).toString();
					} finally {
						Test.tryComplete();
					}
				});
			}
		};
	}
}

// TODO: Difference helpers?
