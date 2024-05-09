import { Promisification } from "./Promisification";


export class AsyncMutex {
    private readonly acquireQueue: (() => void)[] = [];

    private isLocked = false;

    public lock<T = void>(expression: T|(() => T)): Promise<T> {
        return new Promise<T>((resolveOuter, rejectOuter) => {
            new Promise<void>(resolveInner => {
                if(this.isLocked) {
                    this.acquireQueue.push(resolveInner);

                    return;
                }

                this.isLocked = true;

                resolveInner();
            })
            .then(async () => {
                const value: T = await new Promisification<T>(expression).resolve();

                this.isLocked = !!this.acquireQueue.length;

                (this.acquireQueue.shift() ?? (() => {}))();

                resolveOuter(value);
            })
            .catch((err: Error) => rejectOuter(err));
        });
    }
}