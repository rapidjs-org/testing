const { delayExecution } = require("./async");


function sum(a, b) {
    return a + b;
}


new UnitTest("Computes deferred sum")
.actual(delayExecution(500, () => sum(2, 4)))
.expected(6);

new UnitTest("Throws error due to negative timeout")
.actual(() => delayExecution(-10, () => sum(2, 4)))
.error("Negative timeout", RangeError);