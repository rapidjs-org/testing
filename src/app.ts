/**
 * Main module initiating the test suite run with a test directory traversal.
 */


import { join } from "path";
import { existsSync, readdir } from "fs";

import * as print from "./print";
import { TEST_DIR_PATH } from "./options";
import { Test } from "./Test";
import { UnitTest } from "./UnitTest";
import { NetworkTest } from "./NetworkTest";


if(!existsSync(TEST_DIR_PATH)) {
	throw new ReferenceError(`Given test file directory '${TEST_DIR_PATH}' does not exist`);
}


// Provide globals for test scripts in order not to require any includes
global.NetworkTest = NetworkTest;
global.UnitTest = UnitTest;


/*
 * Accordingly wrap and clean up test results and environment.
 */
process.on("exit", () => {
	if(process.exitCode === 1) {
		// Manual exit
		return;
	}

	const testResults: number[] = Test.evalResults();
	const testResultsDepiction = `(${testResults[0]}/${testResults[0] + testResults[1]} successful)`;

	// Error has occurred throughout test suite execution
	if(!Test.suiteSuccessful()) {
		print.close(`Test suite run failed ${testResultsDepiction}.`, false);

		process.exit(1);
	}

	// No test has failed => SUCCESS
	print.close(`Test suite run succeeded ${testResultsDepiction}.`);
});


/**
 * Recursively traverse a given directory for test file evaluation.
 * @param {string} path Path to directory to traverse
 */
function traverseTestDir(path: string) {
	readdir(path, {
		withFileTypes: true
	}, (_, dirents) => {
		(dirents || []).forEach(dirent => {
			const testFilePath: string = join(path, dirent.name);
    
			if(dirent.isDirectory()) {
				traverseTestDir(testFilePath);

				return;
			}

			if(!/\.test\.js$/i.test(dirent.name)) {
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
}


// TODO: Setup / Clearup


// RUN TEST SUITE
// Evaluate each *.test.js file in the test directory in order of scan
traverseTestDir(TEST_DIR_PATH);

print.badge("TEST SUITE", 251, 234, 157);