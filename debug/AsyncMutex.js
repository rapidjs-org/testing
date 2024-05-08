"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncMutex = void 0;
const Promisification_1 = require("./Promisification");
class AsyncMutex {
    constructor() {
        this.acquireQueue = [];
        this.isLocked = false;
    }
    lock(expression) {
        return new Promise(resolveOuter => {
            new Promise(resolveInner => {
                if (this.isLocked) {
                    this.acquireQueue.push(resolveInner);
                    return;
                }
                this.isLocked = true;
                resolveInner();
            })
                .then(async () => {
                var _a;
                const value = await new Promisification_1.Promisification(expression).resolve();
                this.isLocked = !!this.acquireQueue.length;
                ((_a = this.acquireQueue.shift()) !== null && _a !== void 0 ? _a : (() => { }))();
                resolveOuter(value);
            });
        });
    }
}
exports.AsyncMutex = AsyncMutex;
//# sourceMappingURL=AsyncMutex.js.map