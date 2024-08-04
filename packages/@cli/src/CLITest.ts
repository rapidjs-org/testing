import { exec } from "child_process";

import { Test } from "@rapidjs.org/testing";

import { TColor } from "../../common.types";

interface IOutput {
	stdout: string;
	stderr: string;
}

interface TConfiguration {
	commonBinary?: string;
}

export class CLITest extends Test<IOutput> {
	public static readonly suiteTitle: string = "CLI";
	public static readonly suiteColor: TColor = [73, 220, 177]; // 108, 55, 55

	private static configuration: TConfiguration = {};

	public static configure(configuration: TConfiguration) {
		CLITest.configuration = {
			...CLITest.configuration,
			...configuration
		};
	}

	private normalizeOutput(output: Partial<IOutput>): IOutput {
		const normalizeStdValue = (value: string) => {
			return (value ?? "")
			.replace(/(\n|\r)+/g, "\n")
			.replace(/(\t| )+/g, " ")
			.trim()
			?? null;
		}
		return {
			stdout: normalizeStdValue(output.stdout),
			stderr: normalizeStdValue(output.stderr)
		};
	}
	
	protected evalActualExpression(args: string[]): Promise<IOutput>;
	protected evalActualExpression(binary: string, args?: string[]): Promise<IOutput>;
	protected evalActualExpression(binaryOrArgs: string|string[], args: string[] = []): Promise<IOutput> {
		// TODO: Pipe chain abstraction (?)
		const effectiveBinary: string = (!binaryOrArgs || Array.isArray(binaryOrArgs))
		? CLITest.configuration.commonBinary
		: binaryOrArgs;
		if(!effectiveBinary) throw new SyntaxError("Missing binary to execute");

		const effectiveArgs: string[] = (args ?? [ binaryOrArgs ].flat()) ?? [];

		return new Promise((resolve, reject) => {
			exec([ effectiveBinary, effectiveArgs ].flat().join(" "), (err: Error, stdout: string, stderr: string) => {
				if(err && !stderr) {
					reject(err);

					return;
				}
				
				resolve(this.normalizeOutput({
					stdout, stderr
				}));
			});
		});
	}

	protected evalExpectedExpression(expectedOutput: Partial<IOutput>|string): IOutput {
		return this.normalizeOutput(
			(typeof(expectedOutput) === "string")
			? {	
				stdout: expectedOutput
			}
			: {
				stdout: [ expectedOutput.stdout ].flat().join("\n"),
				stderr: [ expectedOutput.stderr ].flat().join("\n")
			}
		);
	}

	protected getDifference(actual: IOutput, expected: IOutput) {
		const filterObj = (sourceObj: IOutput, targetObj: IOutput) => {
			return {
				...(sourceObj.stdout !== targetObj.stdout)
				? { stdout: sourceObj.stdout }
				: {},
				...(sourceObj.stderr !== targetObj.stderr)
				? { stderr: sourceObj.stderr }
				: {},
			}
		};
		return {
			actual: filterObj(actual, expected),
			expected: filterObj(expected, actual)
		}
	}
}
