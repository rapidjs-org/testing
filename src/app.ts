/**
 * Interface module performing the test run by test file evaluation.
 */


import * as print from "./print";


print.fileName("test.js");
print.badge("TEST SUITE A", 245, 122, 154);
print.badge("TEST SUITE B", 245, 225, 174);
print.success("Success in test 1");
print.failure("Failure in test 2");



/*
 * Accordingly wrap and clean up test results and environment.
 */
process.on("exit", _ => {
    

    const closingFrame = str => {
        return `\n${getStrFrame(str)}\n${str}\n`;
    };

    // Error has occurred throughout test suite execution
    if(Test.hasError) {
        out.log(closingFrame(`\n• ${formatStr("Test suite aborted due to an error.\n", Color.RED)}`));

        return;
    }

    const appendix = ` (${formatStr(Test.resultCount.succeeded, Color.BLUE)}/${formatStr(Test.resultCount.succeeded + Test.resultCount.failed, Color.BLUE)} successful)`;

    // At least one test has failed => FAILURE
    if(Test.resultCount.failed > 0) {
        out.log(closingFrame(`\n➜ ${formatStr("Test suite failed", Color.RED)}${appendix}.\n`));
        
        process.exit(1);
    }

    // No test has failed => SUCCESS
    out.log(closingFrame(`\n➜ ${formatStr("Test suite succeeded", Color.GREEN)}${appendix}.\n`));
});