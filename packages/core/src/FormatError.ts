export class FormatError {
    constructor(sourceError: Error|unknown, message: string, customStack?: string|string[]) {
        const pivotError: Error|unknown = ((sourceError as Error & { errors: Error[] }).errors ?? [ sourceError ])[0];
        
        return pivotError.constructor(`${
            message.trim()
        }\n${
            " ".repeat(pivotError.constructor.name.length + 2)
        }${
            (pivotError as Error).message ?? sourceError
        }\n${
            ((pivotError as Error).stack ?? "")
            .trim()
            .split(/\n/g)
            .filter((line: string) => !(new RegExp(`^${pivotError.constructor.name}( \\[[^\\]]+\\])?:`)).test(line))
            .map((line: string) => line.replace(/^[ ]*/, " ".repeat(4)))
            .join("\n")
        }\n${
            [ customStack ?? "" ]
            .flat()
            .join("\n")
        }`);
    }
}