/**
 * Module containing a print interface for application formatted
 * message logging.
 */


// TODO: Intercept app log


enum Layer {
    FG,
    BG
}


function log(message: string) {
    process.stdout.write(`${message}\n`);
}

function colorFrom(layer: Layer, r: number, g: number, b: number|string): string {
    return `${(layer === Layer.FG) ? "38;2;" : "48;2;"}${r};${g};${b}`;
}

function styleWrapStr(str: string, styles: string|string[]): string {
    styles = !Array.isArray(styles) ? [ styles ]: styles;

    return `${styles.map((style: string) => `\x1b[${style}m`).join("")}${str}\x1b[0m`;
}


export function fileName(message: string) {
    log(styleWrapStr(`• ${message}`, [ colorFrom(Layer.FG, 225, 225, 235) ]));
}

export function badge(message: string, r: number, g: number, b: number) {
    log(styleWrapStr(` ${message} `, [ "1", colorFrom(Layer.BG, r, g, b) ].concat(((r + g + b) < 550) ? [ "97" ] : [])));
}

export function success(message: string) {
    log(styleWrapStr(`✔ ${message} `, colorFrom(Layer.FG, 25, 225, 125)));
}

export function failure(message: string) {
    log(styleWrapStr(`✘ ${message} `, colorFrom(Layer.FG, 225, 25, 125)));
}

export function error(caption: string, err: Error) {
    log(`${styleWrapStr(`${caption}:`, colorFrom(Layer.FG, 225, 25, 125))} ${err.message}`);
    err.stack && log(err.stack);

    process.exit(1);
}