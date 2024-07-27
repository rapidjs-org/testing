# rJS Testing

Context-sensitive, (a)sync-uniform testing framework for JavaScript and TypeScript.

``` cli
npm install -D rapidjs-org/testing
```

<sub>division.test.js</sub>
&thinsp;
<sub>[View More Examples](./examples/)</sub>

``` js
function divide(a, b) {
  if(b === 0) throw new SyntaxError("Division by zero");
  return a / b;
}

new UnitTest("Computes quotient of positive integers")
.actual(divide(4, 2))
.expected(2);

new UnitTest("Throws error for division by zero")
.actual(() => divide(2, 0))
.error("Division by zero", SyntaxError);
```

#### Official Test Suites

| Alias &thinsp; <sub>Underlying Package</sub> | Test Class | Purpose |
| :- | :- | :- |
| `unit` &thinsp; <sub>`rapidjs-org/testing--unit`</sub> | `UnitTest` | Unit testing <sup>([Read Documentation](./packages/@unit/README.md))</sup> |
| `http` &thinsp; <sub>`rapidjs-org/testing--http`</sub> | `HTTPTest` | HTTP(S) testing <sup>([Read Documentation](./packages/@http/README.md))</sup> |

## Test Cases

To summarise, a test case is an assertion on how a related test subject (application with a JavaScript API) shall behave. A test case is usually implemented through pairing an actual with an expected value for comparison. rJS Testing is accessible through context-specific test classes whose instances represent individual test cases. An assertion either represents a value-, or an error-based call chain upon a test class instance. Rather than expecting the test cases to compile actual and expected values individually, assertions work on arbitrary expressions that contextually abstract value evaluations.

### Value-based Assertion

``` ts
new <Suite>Test(label: string)
.actual(...expression: unknown[])
.expected(...expression: unknown[]);
```

Value-based assertion represents the primary test case type. It compares the evaluated values of the actual and the expected expressions. How the evaluation works is context-dependent: The procedure is abstracted through the applied test suite, i.e. underlying test class. Test suites can come either with a symmetrical, or an asymmetrical expression interface. For instance, the fundamental unit test suite (`unit`) compares symmetrically on the very given expressions evaluated by JavaScript alone. On the other hand, the more elaborate HTTP test suite (`http`) asymmetrically accepts request information as an actual expression to perform an HTTP request, but expects the respective response information for comparison.

> The common methods `actual()` and `expected()` are named in relation with atomic value assertions. Abstract expession evaluation, such as comparing a URL with an expected response, might not fit that terminology. For this, the methods have aliases `eval()` and `expect()` that serve a more generic assertion scenario.

#### Example with `unit`

**✅ &thinsp; SUCCESS**

``` js
new UnitTest("Computes quotient of integers")
.actual(4 / 2)
.expected(2);
```

**❌ &thinsp; FAILURE**

``` js
new UnitTest("Computes quotient of integers")
.actual(4 / 2)
.expected(3);   // Incorrect result
```

**❌ &thinsp; UNCAUGHT ERROR**

``` ts
new UnitTest("Computes quotient of integers")
.actual(4 / n)  // Throws error (process termination)
.expected(2);
```

### Error-based Assertion

``` ts
new <Suite>Test(label: string)
.actual(...expression: unknown[])
.error(errorMessage: string, ErrorPrototype?: ErrorConstructor);
```

Error-based assertion describes the secondary type of test case. It works on an intercepted error from the actual expression evaluation. Other than an ordinary expectation call, it implicitly expects the respective error message and optionally error constructor (i.e. error class identifier).

> JavaScript applies a call-by-value rather than call-by-name evaluation strategy on function parameters. This is, any synchronous, non-function actual expression must be wrapped in an anonymous function to not throw the error out of the test case scope.

#### Example with `unit`

**✅ &thinsp; SUCCESS**

``` ts
new UnitTest("Computes quotient of integers")
.actual(() => 4 / n)
.error("n is not defined", ReferenceError);
```

**❌ &thinsp; FAILURE**

``` ts
new UnitTest("Computes quotient of integers")
.actual(() => 4 / n)
.expect("Forgot to define n!", SyntaxError);  // Incorrect error
```

**❌ &thinsp; UNCAUGHT ERROR (THROWS OUT OF SCOPE)**

``` ts
new UnitTest("Computes quotient of integers")
.actual(4 / n)  // Throws error outside of test case scope (process termination)
.error("n is not defined", ReferenceError);
```

## Expression Evaluation

Without further ado, the actual as well as the expected expressions can be functions or promises (i.e. asynchronous). In that case, they are evaluated progressively until a definite (not further function or promise) value could be obtained. Test cases integrating asynchronous expressions are furthermore evaluated in order of appearance (mutex) to prevent race conditions.

``` ts
.actual(4)                    // ≙ 4
.actual(2**2)                 // ≙ 4
.actual(Math.pow(2, 2))       // ≙ 4
.actual(
  () => 2**2
)                             // ≙ 4

.actual(() => {
  return () => 2**2;
})                            // ≙ 4

.actual(() => {
  return new Promise(resolve => {
    setTimeout(() => resolve(() => {
      return () => 2**2;
    }, 1000);
  });
})                            // ≙ 4
```

This strategy results in a single image of compared values (deterministic; or stochastic within deterministic bounds if testable). A test case, i.e. an evaluation of a full call chain, is hence considered as consumed. This means a test case can not be resolved via `.expected()` or `.error()` more than once. Additionally, rJS Testing simplifies testing by merely providing the two above positive assertion interfaces. From a formal perspective, this is sufficient: Given an arbitrary actual value, the expected value can be tested. Any complementary value that would expect a negative assertion (“not equal to”) could easily be inverted to a positive assertion expecting the specific complementary value. Any more abstract assertion, such as an array has at least a certain element, could either be solved through a dedicated test suite, or a complex epression.

``` js
// with Jest
expect(STR).toHaveLength(12)
expect(STR).not.toHaveLength(13)
expect(STR.length).toBe(12)

// with rJS Testing
.actual(STR.length == 13).expected(false)
.actual(STR.length).expected(12)
```

## CLI

The command line interface represents the default user interface for rJS Testing. In short, the `rjs-test` command takes a test suite suited for the context, and a path to the test files which are scanned recursively.

``` cli
npx rjs-test <test-suite-reference> <tests-path> [--<arg:key>|-<arg:shorthand>[ <arg-option>]?]*
```

`<test-suite-reference>`

Reference to the test suite. The test suite is a module implementing the abstract test class ([see here](./#custom-test-suite). Working on the native node module resolution mechanism, the test module reference can be either a path on disc, or a localisable name of a self-contained package. Based on the context, the concrete test suite class (`<Suite>Test`) provides an`.actual().expected()` evaluation mechanism, as well as arbitrary static helpers.

`<tests-path>`

Path to the test target directory (also works on a single test file). Test files are required to end with `.test.js` (i.e. fulfill the test direcotry path relative glob pattern `./**/*.test.js`).

> For test files deployed within a source directory, the source directory corresponds to the test directory. Likewise, an isolated test directory can be utilised.

## Environment Lifecycle Module

Depending on the test context, running individual test cases may require an effective environment setup (e.g. serving a REST-API). For that reason, rJS Testing respects the special environment module `__test.env.js` at the root of the test directory if present. Upon certain lifecycle events corresponding members exported from the module are called.

| Export / Event | Purpose |
| :- | :- |
| `BEFORE` | Evaluates before test files are processed. |
| `AFTER` | Evaluates after all test files were processed. |

### Example

``` js
const restService = require("./lib/rest.service");

module.exports.BEFORE = async function() {
  return await restService.listen(8000);
}

module.exports.AFTER = async function() {
  return await restService.close();
}
```

## Custom Test Suite

Besides the officially provided test suites, implementation of a custom test suite is simple. In fact, a custom test suite is a module that exports a concrete test class extending the abstract rJS Testing `Test` class:

``` ts
abstract class Test<T> {
  static readonly suiteTitle: string;
  static readonly suiteColor: [ number, number, number ];  // RGB
  constructor(title: string);
  protected evalActualExpression(...expression: unknown[]): T | Promise<T>;
  protected evalExpectedExpression(...expression: unknown[]): T | Promise<T>;
  protected getDifference(actual: T, expected: T): {
    actual: Partial<T>;
    expected: Partial<T>;
  };
}
```

> The CLI generator tool helps setting up a template test suite package. Run `rjs-test gen help` for more information.

#### `suiteTitle` and `suiteColor`

Title and color of the related test suite badge printed to the console upon usage.

#### Expression Evaluation upon Generic `<T>`

For convenience, rJS Testing allows the actual and the expected expressions to deviate (e.g. actual is HTTP request information to resolve for a response, but expected is filtered response information). However, the intermediate comparison works on a uniform value typed `T` that is evaluated from both the actual and the expected expression. Given an arbitrary spread of expressions (as passed to `.actual()` and `.expected()`), `.evalActualExpression()` and `.evalExpectedExpression()` compute the comparison values (typed `T`). By default, both methods return the identity of the first expression argument. 

#### Difference Helper

Whether or not a test case is successful depends on the difference computed from the actual and expected expression evaluations through `getDifference()`. rJS Testing does not simply implement a method that checks for contextual equality, but combines display values filtering with an implicit equality check. The difference is hence not (necessarily) the mathematical difference operation, but a production of the actual and expected value to print in case they do not match. Precisely speaking, a test case fails if the partially returned difference values (`.actual` or `.expected`) are not equal (`===`) or at least one is not empty. Emptiness is moreover defined as any value that is `undefined`, `null` or an empty object `{}` (has no abstract properties). By default, the entire values are reflected in case they are not deep equal (non-strict).

## API

Although the CLI is the go-to interface for rJS Testing , the underlying API can also be used within programatic pipelines.

``` ts
rJS Testing.init(testSuiteModuleReference: string, testTargetPath: string): Promise<IResults>
```

``` ts
interface IResults {
  time: number,	// Time in ms
  record: {
    [ key: string ]: Test<T> {
      title: string,
      sourcePosition: string;
      difference: {
        actual: Partial<T>|string;
        expected: Partial<T>|string;
      };
      wasSuccessful: boolean;
    }[];	// <key> ≙ Related test file path
  }
}
```

> The parameter `testSuiteModuleReference` can also be passed a test suite module export object directly (`{ <Suite>Test: Test }`).

#### Example

``` ts
import rJS Testing from "rapidjs-org/testing";

rJS Testing.init("unit", require("path").resolve("./test/"))
.then(results => {
	console.log(results);
});
```

``` ts
{
  time: 297,
  record: {
    "/app/test/unit.test.js": [
      {
        Test {
          title: "Test case 1",
          sourcePosition: "at Object.<anonymous> (/app/test/unit.test.js:9:1)",
          difference: { actual: null, expected: null },
          wasSuccessful: true
        },
        Test {
          title: "Test case 2",
          sourcePosition: "at Object.<anonymous> (/app/test/unit.test.js:17:1)",
          difference: { actual: 18, expected: 20 },
          wasSuccessful: false
        }
      }
    ]
  }
}
```

## Other Frameworks

rJS Testing alleviates the overall usability over existing testing frameworks. The pivotal design decisions are:

- Cluster semantically related test cases within files rather than function scopes
- Provide a uniform, unambiguous assertion interface abstracting contextual behaviour
- Hide expression evaluation behind the assertion interface

**🙂 &hairsp; with Jest**

<sub>user.test.js</sub>
``` js
describe("User", () => {
  describe("get", () => {
    it("gets user (async)", () => {
      expect.assertions(1);
      expect(getUserName(97)).resolves.toBe("Justus");
    });
    it("gets no user (async)", () => {
      expect.assertions(1);
      expect(getUserName(102)).rejects.toEqual({
        error: "Unknown user ID",
      });
    });
    it("throws error for invalid id", () => {
      expect.assertions(2);
      expect(() => getUserName(-1)).toThrow(SyntaxError);
      expect(() => getUserName(-1)).toThrow("Invalid user ID");
    });
  });
  describe("validate name", () => {
    it("validates user name syntactically", () => {
      expect.assertions(1);
      expect(validateUserName("Peter")).not.toBe(false);
    });
  });
});
```

**🙂 &hairsp; with Mocha (Chai)**

<sub>user.spec.js</sub>
``` js
describe("User", () => {
  describe("#getUserName()", () => {
    it("gets user (async)", done => {
      return getUserName(97)
      .then(name => {
        expect.to.equal("Justus");
        done();
      });
    });
    it("gets no user (async)", async () => {
      return expect(await getUserName(102)).to.equal({
        error: "Unknown user ID",
      });
    });
    it("throws error for invalid id", () => {
      return expect(getUserName(-1)).to.throw(SyntaxError, "Invalid user ID");
    });
  });
  describe("#validateUserName()", () => {
    it("validates user name syntactically", () => {
      return expect(validateUserName("Peter")).to.not.equal(false);
    });
  });
});
```

### 😃 &hairsp; with rJS Testing

<sub>user.get.test.js</sub>
``` js
new UnitTest("Gets user (async)")
.actual(getUserName(97))
.expected("Justus");

new UnitTest("Gets no user (async)")
.actual(getUserName(102))
.expected({
  error: "Unknown user ID",
});

new UnitTest("Gets no user (async)")
.actual(getUserName(102))
.error("Invalid user ID", SyntaxError);
```

<sub>user.validate.test.js</sub>
``` js
new UnitTest("Gets no user (async)")
.actual(validateUserName("Peter") !== false)
.expected(true);
```

##

<sub>© Thassilo Martin Schiepanski</sub>
