import { Promisification } from "./Promisification";


export class AsyncMutex {
    private readonly acquireQueue: (() => void)[] = [];

    private isLocked = false;

    lock<T = void>(expression: T|(() => T)): Promise<T> {
        return new Promise<T>(resolveOuter => {
            new Promise<void>(resolveInner => {
                if(this.isLocked) {
                    this.acquireQueue.push(resolveInner);

                    return;
                }

                this.isLocked = true;

                resolveInner();
            })
            .then(() => {
                new Promisification(expression)
                .then((value: T) => {
                    this.isLocked = !!this.acquireQueue.length;

                    (this.acquireQueue.shift() ?? (() => {}))();

                    resolveOuter(value);
                });
            });
        });
    }
}