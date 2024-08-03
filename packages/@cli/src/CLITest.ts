import { Test } from "@rapidjs.org/testing";

import { TColor } from "../../common.types";

interface IObject {
	[key: string]: string | number | boolean | IObject;
}

export class CLITest extends Test<IObject> {
	public static readonly suiteTitle: string = "CLI";
	public static readonly suiteColor: TColor = [73, 220, 177]; // 108, 55, 55

	constructor(title: string) {
		super(title);
	}

	protected evalActualExpression(obj: IObject): Promise<IObject> {
		return new Promise((resolve) => {
			resolve(
				Object.fromEntries(
					Object.entries(obj).map((entry: [string, unknown]) => [entry[0].toLowerCase(), entry[1]])
				) as IObject
			);
		});
	}

	protected isEqual(actual: IObject, expected: IObject): boolean {
		return !Object.keys(this.filterComparedValues(actual, expected).actual).length;
	}

	protected filterComparedValues(actual: IObject, expected: IObject) {
		return {
			actual: actual,
			expected: expected
		};
	}
}
