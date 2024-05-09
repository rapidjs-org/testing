export class FormatError {
    constructor(sourceError: Error|unknown, message: string, customStack?: string|string[]) {
        return sourceError
        .constructor(`${
            message.trim()
        }\n${
            " ".repeat(sourceError.constructor.name.length + 2)
        }${
            (sourceError as Error).message ?? sourceError
        }\n${
            ((sourceError as Error).stack ?? "")
            .trim()
            .split(/\n/g)
            .filter((line: string) => !(new RegExp(`^${sourceError.constructor.name}( \\[[^\\]]+\\])?:`)).test(line))
            .map((line: string) => line.replace(/^[ ]*/, " ".repeat(4)))
            .join("\n")
        }\n${
            [ customStack ?? "" ]
            .flat()
            .join("\n")
        }`);
    }
}