/**
 * Module containing application-wide utility functions.
 */


export function isObject(value): boolean {
	return (!!value) && (value.constructor === Object);
}

export function isString(value): boolean {
	return (value instanceof String || typeof(value) === "string");
}