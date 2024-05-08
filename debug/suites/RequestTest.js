"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestTest = void 0;
const http_1 = require("http");
const assert_1 = require("assert");
const Test_1 = require("../Test");
class RequestTest extends Test_1.Test {
    static configure(configuration) {
        RequestTest.configuration = Object.assign(Object.assign({}, RequestTest.configuration), configuration);
    }
    constructor(title) {
        super(title);
    }
    evalActualExpression(path, options = {}) {
        const body = options.body;
        delete options.body;
        return new Promise((resolve, reject) => {
            const reqOptions = Object.assign(Object.assign(Object.assign({}, RequestTest.configuration), { method: "GET", headers: {}, path: path }), options);
            const req = (0, http_1.request)(reqOptions, res => {
                const body = [];
                res.on("data", (chunk) => {
                    body.push(chunk);
                });
                res.on("end", () => {
                    var _a;
                    let parsedBody = Buffer.concat(body).toString();
                    try {
                        parsedBody = JSON.parse(parsedBody);
                    }
                    catch (_b) { }
                    resolve({
                        status: (_a = res.statusCode) !== null && _a !== void 0 ? _a : -1,
                        headers: res.headers,
                        body: parsedBody
                    });
                });
                res.on("error", err => reject(err));
            })
                .on("error", err => reject(err));
            body && req.write(body);
            req.end();
        });
    }
    isEqual(actual, expected) {
        return !Object.keys(this.getDisplayValues(actual, expected).actual).length;
    }
    getDisplayValues(actual, expected) {
        // Match messages, unless expected object is a response parameters object (containing a response key)
        // Weak equality, i.e. only compare provided fields (selective)
        const filteredActual = {};
        const filteredExpected = {};
        ["status", "message"]
            .forEach(simpleKey => {
            const indexedActual = actual;
            const indexedExpected = actual;
            if (!indexedExpected[simpleKey])
                return;
            try {
                (0, assert_1.deepStrictEqual)(indexedActual[simpleKey], indexedExpected[simpleKey]);
            }
            catch (_a) {
                filteredActual[simpleKey] = indexedActual[simpleKey];
                filteredExpected[simpleKey] = indexedExpected[simpleKey];
            }
        });
        for (const name in (expected.headers || {})) {
            const actualHeader = actual.headers[name.toLowerCase()];
            const expectedHeader = expected.headers[name];
            if (actualHeader === expectedHeader)
                continue;
            filteredActual.headers = filteredActual.headers || {};
            filteredActual.headers[name] = actualHeader;
            filteredExpected.headers = filteredExpected.headers || {};
            filteredActual.headers[name] = expectedHeader;
        }
        return {
            actual: filteredActual,
            expected: filteredExpected
        };
    }
}
exports.RequestTest = RequestTest;
RequestTest.suiteTitle = "Request";
RequestTest.suiteColor = [177, 66, 179];
RequestTest.configuration = {
    hostname: "localhost",
    port: 80
};
;
//# sourceMappingURL=RequestTest.js.map