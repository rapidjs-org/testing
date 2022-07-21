"use strict";
/**
 * Module containing application-wide utility functions.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isString = exports.isObject = void 0;
function isObject(value) {
    return (!!value) && (value.constructor === Object);
}
exports.isObject = isObject;
function isString(value) {
    return (value instanceof String || typeof (value) === "string");
}
exports.isString = isString;
