import { TColor } from "../types";
import { Test } from "../Test";


export class UnitTest extends Test {
	public static readonly suiteTitle: string = "Unit";
	public static readonly suiteColor: TColor = [ 38, 155, 227 ];
	
	constructor(title: string) {
		super(title);
	}
};