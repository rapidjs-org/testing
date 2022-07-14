import { join } from "path";
import { existsSync } from "fs";

import * as print from "./print";
import { TEST_DIR_PATH } from "./options";


/**
 * Emit a global event. Each event triggers the execution
 * of a related event module located on the top level of
 * the test directory.
 * @param {string} name Event name
 */
export function emitEvent(name: string) {
	const eventFilePath: string = join(TEST_DIR_PATH, `${name}.event.js`);

	if(!existsSync(eventFilePath)) {
		return;
	}

	require(eventFilePath);

	print.event(name);
}