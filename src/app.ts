/**
 * Interface module performing the test run by test file evaluation.
 */


import { isAbsolute, join } from "path";
import { existsSync, readdir } from "fs";


import * as print from "./print";

import { Test } from "./Test";


const args = process.argv.slice(2);
const testDirPath: string = !isAbsolute(args[0]) ? join(require.main.path, args[0]) : args[0];

if(!existsSync(testDirPath)) {
    throw new ReferenceError(`Given test file directory '${testDirPath}' does not exist`);
}


/*
 * Accordingly wrap and clean up test results and environment.
 */
process.on("exit", () => {
    if(process.exitCode === 1) {
        // Manual exit
        return;
    }

    const testResults: number[] = Test.evalResults();
    const testResultsDepiction: string = `(${testResults[0]}/${testResults[0] + testResults[1]})`;

    // Error has occurred throughout test suite execution
    if(!Test.suiteSuccessful()) {
        print.failure(`Test suite run failed ${testResultsDepiction}.`);

        process.exit(1);
    }

    // No test has failed => SUCCESS
    print.success(`Test suite run succeeded ${testResultsDepiction}.`);
});


// RUN TEST SUITE
// Evaluate each *.test.js file in the test directory in order of scan
readdir(testDirPath, {
    withFileTypes: true
}, (_, dirents) => {
    (dirents || []).forEach(dirent => {
        const testFilePath: string = join(testDirPath, dirent.name);

        if(dirent.isDirectory()
        || !/\.test\.js$/i.test(dirent.name)) {
            return;
        }
        
        print.fileName(dirent.name);

        try {
            require(testFilePath);
        } catch(err) {
            print.error("An error occured upon test file evaluation", err);
        }
    });
});