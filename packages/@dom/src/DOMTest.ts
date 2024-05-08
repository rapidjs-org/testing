import { Test } from "@t-ski/otes";

import { TColor } from "../../common.types";


export class DOMTest extends Test {
	public static readonly suiteTitle: string = "DOM";
	public static readonly suiteColor: TColor = [ 158, 120, 66 ];
    
	constructor(title: string) {
		super(title);
	}
};