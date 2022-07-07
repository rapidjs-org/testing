/**
 * Interface module performing the test run by test file evaluation.
 */


import * as print from "./print";


print.fileName("test.js");
print.badge("TEST SUITE A", 245, 122, 154);
print.badge("TEST SUITE B", 245, 225, 174);
print.success("Success in test 1");
print.failure("Failure in test 2");