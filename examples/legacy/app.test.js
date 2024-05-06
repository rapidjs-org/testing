const sumTest = new UnitTest(require("./ref-app").sum, "App sum");

sumTest
.case(1, 2)
.for(3,
    "Calculate positive sum");

sumTest
.case(-1, -2)
.for(-3,
    "Calculate negative sum");