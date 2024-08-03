import { Test } from "@rapidjs.org/testing";


interface IObject {
	[ key: string ]: string|number|boolean|IObject;
}


export class CustomTest extends Test<IObject> {
	public static readonly suiteTitle: string = "Custom";
	public static readonly suiteColor: [number, number, number] = [ 255, 255, 0 ];
	
    constructor(title: string) {
    	super(title);
    }
	
    protected async evalActualExpression(obj: IObject): Promise<IObject> {
    	return Object.fromEntries(
			Object.entries(obj)
			.map((entry: [ string, unknown ]) => [ entry[0].toLowerCase(), entry[1] ])
		) as IObject;
	}

    protected isEqual(actual: IObject, expected: IObject): boolean {
		return !Object.keys(this.filterComparedValues(actual, expected).actual).length;
	}

	protected filterComparedValues(actual: IObject, expected: IObject) {
		return {
			actual: actual,
			expected: expected
		}
	}
}