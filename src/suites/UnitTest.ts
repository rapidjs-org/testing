import { TColor } from "../types";
const { Test } = require("../Test");


export class UnitTest extends Test {
	public static readonly suiteTitle: string = "Unit";
	public static readonly suiteColor: TColor = [ 255, 0, 0];
	
	constructor(title) {
		super(title);
	}
};