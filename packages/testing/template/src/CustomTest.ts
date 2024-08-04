import { Test } from "@rapidjs.org/testing";


interface IObject {
	[ key: string ]: string|number|boolean|IObject;
}


export class CustomTest extends Test<IObject> {
	public static readonly suiteTitle: string = "Custom";
	public static readonly suiteColor: [number, number, number] = [ 255, 255, 0 ];
	
    protected evalActualExpression(arg1: string, arg2: boolean): IObject {
		// HINT:
		// evalActualExpression() and analog. evalExpectedExpression() are
		// ought to compile a value sharing a common type. he evaluation can
		// base on an arbitrary amount of heterogeneous arguments.
		// E.g.: Obtaining an HTTP response based on endpoint information.
    	return {
			arg1, arg2
		}
	}

	protected getDifference(actual: IObject, expected: IObject) {
		// HINT:
		// Filter the previously evaluated test expression values for
		// differences in respect to the test purpose.
		// E.g.: Filtering explicitly provided HTTP response properties on
		//		 the actaul HTTP response that differ.
		return {
			actual: actual,
			expected: expected
		}
	}
}