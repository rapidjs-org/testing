const { divide } = require("./sync");


new UnitTest("Calculates quotient of positive integers")
.actual(divide(4, 2))
.expected(2);

new UnitTest("Calculates quotient of negative and positive integer")
.actual(divide(-4, 2))
.expected(-2);

new UnitTest("Calculates quotient of floating points")
.actual(divide(4.5, 2.5))
.expected(1.8);

new UnitTest("NaN quotient of non-numeric values")
.actual(() => divide(null, undefined))
.expected(NaN);

new UnitTest("Throws error for division by zero")
.actual(() => divide(2, 0))
.error("Division by zero", SyntaxError);