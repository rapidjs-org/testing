const anonymousIncrementTest = new UnitTest(x => x + 1, "Test 1");

anonymousIncrementTest
.case(5)
.for("6",
    "Type mismatch number increment");

const anonymousIdentityTest = new UnitTest(x => x);

anonymousIdentityTest
.case("abc")
.for("abc", "Retrieve identical string")
.chain(r => {
    console.log("Unit Test 2 result: " + r);
});

new UnitTest(_ => {
    return new Promise(resolve => {
        setTimeout(_ => {
            resolve(123);
        }, 3500);
    });
}, "Timeout test")
.case().for(124);