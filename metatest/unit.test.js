/// Check shifted sum


let shift = 10;

function timeoutCb(value, delay) {
    return new Promise(resolve => {
        setTimeout(() => {
            shift = shift + value;
            resolve(shift);
        }, delay);
    });
}


new UnitTest("+ 4")
.actual(shift + 4).expected(14);

new UnitTest("Timeout + 4")
.actual(async () => {
    return await timeoutCb(shift + 4, 500);
})
.expected(14);

new UnitTest("Timeout + 4", () => timeoutScope)
.actual(() => {
    return timeoutCb(shift + 4, 1000);
})
.expected(18);