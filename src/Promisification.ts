export class Promisification<T> {
    private static unwrapTimeout = 5000;

    private readonly expression: unknown;

    constructor(expression: unknown) {
        this.expression = expression;
    }

    private timeout() {
        throw new RangeError("Unwrapping of promise value timed out");
    }

    public async then(resolveCallback: (resolveValue: T) => void) {
        const unwrapTimeout = setTimeout(() => this.timeout(), Promisification.unwrapTimeout);

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

        clearTimeout(unwrapTimeout);
        
        resolveCallback(resolveValue as T);
    }
}