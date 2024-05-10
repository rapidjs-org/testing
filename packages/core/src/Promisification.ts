import _config from "./config.json";

export class Promisification<T> {
	private readonly expression: unknown;

	constructor(expression: unknown) {
		this.expression = expression;
	}

	private abort(message: string) {
		throw new RangeError(message);
	}

	public resolve(): Promise<T> {
		return new Promise<T>(async (resolveInner, rejectInner) => {
			const promisificationTimeout = setTimeout(
				() => this.abort("Processing timeout"),
				_config.promisificationTimeout
			);

			let resolveValue: unknown = this.expression;

			let i = 0;
			while (
				resolveValue instanceof Function ||
				resolveValue instanceof Promise
			) {
				try {
					resolveValue =
						resolveValue instanceof Function
							? resolveValue()
							: resolveValue;

					resolveValue =
						resolveValue instanceof Promise
							? await resolveValue
							: resolveValue;
				} catch (err: unknown) {
					rejectInner(err);

					return;
				}

				if (i++ < 100) continue;

				this.abort("Excessive iteration");

				break;
			}

			clearTimeout(promisificationTimeout);

			resolveInner(resolveValue as T);
		});
	}
}
