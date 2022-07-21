"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkTest = void 0;
const https_1 = __importDefault(require("https"));
const util_1 = require("./util");
const options_1 = require("./options");
const Test_1 = require("./Test");
/**
 * Class representing a network test context for independent endpoint
 * request interfaces.
 * Implicit HTTP(S) communication behavior.
 */
class NetworkTest extends Test_1.Test {
    /**
     * Create a network test object.
     * @param {string} location Endpoint URL to approach (a pathname is either prepended with the common host or 'localhost' (default))
     * @param {string} [caption] Optional test caption (generic caption otherwise)
     */
    constructor(location, caption) {
        if (!(0, util_1.isString)(location)) {
            throw new TypeError("Network test requires destination location argument (URL or pathname)");
        }
        super(location, caption, `Network Test (➞ '${location}')`);
        super.badgeColor = NetworkTest.badgeColor;
    }
    /**
     * Set a common hostname for all subsequent test objects
     * (concatenated href URL components).
     * @param {string} hostname Common hostname
     */
    static setCommonHost(hostname) {
        NetworkTest.commonHost = hostname;
    }
    /**
     * Filter a response object for case individual properties.
     * Prevents exhaustive comparisons / expected result provision.
     * @param {IResponseData|Object} expectedResult Expected response object (All-optional-properties interface of IResponseObject)
     * @param {IResponseData} actualResult Actual response object
     * @returns {IResponseData|Object} Filtered response object (that is to be passed to further processing)
     */
    filterActualResult(expectedResult, actualResult) {
        actualResult = Object.assign({}, actualResult);
        if (!expectedResult.status && actualResult.status) {
            delete actualResult.status;
        }
        const updatedHeaders = {};
        const expectedHeaders = expectedResult.headers || {}; // TODO: Header name case sensitivity?
        for (const header in expectedHeaders) {
            if (expectedHeaders[header] && actualResult.headers[header]) {
                updatedHeaders[header] = actualResult.headers[header];
            }
        }
        if (Object.keys(updatedHeaders).length === 0) {
            delete actualResult.headers;
        }
        else {
            actualResult.headers = updatedHeaders;
        }
        if (!expectedResult.message && actualResult.message) {
            delete actualResult.message;
        }
        return actualResult;
    }
    /**
     * Perform an request to the interface location with the given parameters.
     * @async
     * @param {IRequestOptions} [options={}] Request options / parameters
     * @param {Object} [body] Optional request body to provide
     * @returns {Promise<IResponseData>} Promise resolving to a response object
     */
    invokeInterfaceProperty(options = {}) {
        const location = this.interfaceProperty;
        const hasExplicitHost = (location.charAt(0) != "/");
        const hostname = !hasExplicitHost
            ? NetworkTest.commonHost || "localhost"
            : location.split("/", 2)[0];
        let path = hasExplicitHost
            ? `/${location.split("/", 2)[1] || ""}`
            : location;
        if (options.searchParams) {
            const searchQueryStr = Object.keys(options.searchParams)
                .map((key) => {
                return `${key}=${encodeURIComponent(options.searchParams[key].toString())}`;
            }).join("&");
            path += `?${searchQueryStr}`;
        }
        return new Promise((resolve, reject) => {
            const req = https_1.default
                .request({
                hostname: hostname,
                path: path,
                method: !options.method
                    ? (options.body
                        ? "POST"
                        : "GET")
                    : options.method,
                headers: options.headers,
                timeout: (0, options_1.readOption)("timeout", "T", 5000).number()
            }, res => {
                res.on("data", data => {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        message: String(data)
                    });
                });
            });
            req.on("error", err => {
                reject(err);
            });
            options.body
                && req.write(JSON.stringify(options.body));
            req.end();
        });
    }
    /**
     * Compare two re
     * @param {IResponseData|Object} expectedResult Expected response object only stating relevant properties (filter basis)
     * @param {IResponseData} actualResult Actual response object
     * @returns {Boolean} Whether the relevant response properties are present in the actual response object
     */
    compareEqual(expectedResult, actualResult) {
        let isSuccessful = true;
        // Only test for provided expected response properties
        if (expectedResult.status
            && expectedResult.status !== actualResult.status) {
            this.pushWarning("Mismatching status codes");
            isSuccessful = false;
        }
        const expectedHeaders = expectedResult.headers || {};
        for (const header in expectedHeaders) {
            if (actualResult.headers[header] != expectedHeaders[header]) {
                this.pushWarning(`Mismatching values for header '${header}'`);
                isSuccessful = false;
            }
            if (!actualResult.headers[header]) {
                this.pushWarning(`Missing response header '${header}'`);
                isSuccessful = false;
            }
        }
        try {
            actualResult.message = JSON.parse(actualResult.message);
            // eslint-disable-next-line
        }
        catch (_a) { }
        if (!super.compareEqual(actualResult.message, expectedResult.message)) {
            this.pushWarning("Mismatching message data");
            isSuccessful = false;
        }
        return isSuccessful;
    }
    /**
     * Define a class sepcific invocation error warning push.
     * @param {Error} err Invocation error
     */
    handleInvocationError(err) {
        this.pushWarning(`Could not perform request to '${this.interfaceProperty}': "${err.message}"`);
    }
}
exports.NetworkTest = NetworkTest;
NetworkTest.badgeColor = [168, 147, 232];
