import _config from "./config.json";


export class Promisification<T> {
    private readonly expression: unknown;

    constructor(expression: unknown) {
        this.expression = expression;
    }

    private timeout() {
        throw new RangeError("Unwrapping of promise value timed out");
    }

    public async then(resolveCallback: (resolveValue: T) => void) {
        const promisificationTimeout = setTimeout(() => this.timeout(), _config.promisificationTimeout);

        let resolveValue: unknown = this.expression;

        let i = 0;
        while(resolveValue instanceof Function || resolveValue instanceof Promise) {
            resolveValue = (resolveValue instanceof Function)
            ? resolveValue()
            : resolveValue;

            resolveValue = (resolveValue instanceof Promise)
            ? await resolveValue
            : resolveValue;

            if(i++ < 100) continue;
            
            this.timeout();

            break;
        }

        clearTimeout(promisificationTimeout);
        
        resolveCallback(resolveValue as T);
    }
}