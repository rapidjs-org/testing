/**
 * Module containing a virtual event emitter to listen for
 * and perform individual test environment manipulations.
 */


import { join } from "path";
import { fork } from "child_process";

import * as print from "./print";
import { TEST_DIR_PATH } from "./options";


type TCallback = () => void;


let hasInit: boolean;
let initCallback: TCallback;
let currentPending: TCallback;

const envContext = fork(join(__dirname, "env-context"));


envContext.on("error", err => {
	throw err;
});
envContext.on("message", (signal: number) => {
	if(signal == 0) {
		hasInit = true;

		initCallback && initCallback();

		return;
	}

	currentPending && currentPending();
});


export function onInit(callback: TCallback) {
	if(!hasInit) {
		initCallback = callback;

		return;
	}

	initCallback();
}




/**
 * Emit a global event. Each event triggers the execution
 * of a related event module located on the top level of
 * the test directory.
 * @param {string} name Event name
 * @param {Function} callback Function to invoke once the event handler has completed
 */
export function emitEvent(name: string, callback: TCallback) {
	const eventFilePath: string = join(TEST_DIR_PATH, `${name}.event.js`);

	print.event(name);

	envContext.send(eventFilePath);

	currentPending = callback;
}