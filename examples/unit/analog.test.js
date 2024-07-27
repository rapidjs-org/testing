const REF = 1;

new UnitTest("Equality")
.actual(REF)
.expected(1);

new UnitTest("Tolerance")
.actual(REF > 0.8 && REF < 1.2)
.expected(true);

new UnitTest("Not equal")
.actual(REF !== 1)
.expected(false);