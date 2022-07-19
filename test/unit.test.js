const testOne = new UnitTest(x => x + 1, "Test 1");

testOne
.case(5)
.for("6");

const testTwo = new UnitTest(x => x);

testTwo
.case("abc")
.for("abc", "String equality")
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