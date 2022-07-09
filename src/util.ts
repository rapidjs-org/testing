export function isObject(value): boolean {
    return (!!value) && (value.constructor === Object);
};