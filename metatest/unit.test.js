/// Check shifted sum


let shift = 10;

function timeoutCb(value, delay) {
    return new Promise(resolve => {
        setTimeout(() => {
            shift += value;
            resolve(shift);
        }, delay);
    });
}


new UnitTest("+ 4")
.actual(shift + 4).expected(14);

new UnitTest("Timeout + 4 (1)")
.actual(async () => {
    return await timeoutCb(4, 1000);
})
.expected(18);

new UnitTest("Timeout + 4 (2)")
.actual(() => {
    return timeoutCb(4, 500);
})
.expected(14);

/* new UnitTest("Error")
.actual(() => {
    throw new SyntaxError("Test error");
})
.error("Test error", SyntaxError); */