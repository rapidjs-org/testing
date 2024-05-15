# OTES

Simple, object-abstracted, (a)sync-uniform testing framework for JavaScript and TypeScript.

``` cli
npm install -D t-ski/otes
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

### Official Tests

| Alias &thinsp; <sub>Underlying Package</sub> | Test Class | Purpose |
| :- | :- | :- |
| `unit` &thinsp; <sub>`t-ski/otes--unit`</sub> | `UnitTest` | Unit testing <sup>([Read Documentation](./packages/@unit/README.md))</sup> |
| `http` &thinsp; <sub>`t-ski/otes--http`</sub> | `HTTPTest` | HTTP(S) testing <sup>([Read Documentation](./packages/@http/README.md))</sup> |
| `dom` &thinsp; <sub>`t-ski/otes--dom`</sub> | `DOMTest`| DOM testing <sup>([Read Documentation](./packages/@dom/README.md))</sup> |

## Test Anatomy

A test case is nothing more than an assertion on how the test subject would behave. More precisely, a test case is thus an actual value that is usually computed through a test subject interface, as well as an explicit related expected value. OTES provides a context sepcific test class whose instances represent individual test cases. For simplicity, assertions either represent a value- (`.actual().expected()`), or error-based (`.actual().error()`) call chain. The actual expression is contextually abstracted for each specific test suite.

### Value-based Assertion

``` ts
new <Suite>Test(label: string)
.actual(...expression)
.expected(...expression);
```

Value-based assertion is meant to compare the actual and the expected value directly. Depending on the test suite context, the given expressions are evaluated first to produce abstract test values. Some test suite contexts might require asymmetrical expressions: For instance, the official HTTP test suite (`http`) accepts HTTP request data as an actual state reference, and expected response data to compare the actual response with.

// TODO: Figure

#### Example: `UnitTest`

``` js
new UnitTest("Computes quotient of positive integers")
.actual(4 / 2)
.expected(2);
```

### Error-based Assertion

``` ts
new <Suite>Test(label: string)
.actual(...expression)
.error(errorMessage: string, ErrorPrototype?: ErrorConstructor);
```

Error-based assertion is meant to intercept an expected error thrown within the actual expression JavaScript function calls apply a call-by-value, rather than call-by-name resolution on arguments. For that reason, any synchronous and non-function actual value evaluation strategy must be wrapped in an anonymous function not to throw the error out of the test case scope.

#### Example: `UnitTest`

**✅ &thinsp; SUCCESS**

``` ts
new UnitTest("Computes quotient of positive integers")
.actual(() => 4 / x)
.error("x is not defined", ReferenceError);
```

**❌ &thinsp; FAILURE**

``` ts
new UnitTest("Computes quotient of positive integers")
.actual(4 / x)  // Throws outside of test case evalution scope
.error("x is not defined", ReferenceError);
```

### Expression Evaluation

In case the actual or expected expressions are functions or promises (i.e. asynchronous), the expressions are evaluated progressively until a final value can be obtained. Also, asynchronous code is evaluated in order until resolved (mutex) to prevent race conditions. Due to a single value that can deterministically be returned, the test cases are consumed, i.e. can only be resolved via `.expected()` or `.error()` once.

``` ts
.actual(4)                    // ≙ 4
.actual(2**2)                 // ≙ 4
.actual(Math.pow(2, 2))       // ≙ 4
.actual(() => 2**2)           // ≙ 4

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

## CLI

``` cli
npx otes <test-suite-reference> <tests-path> [--<arg:key>|-<arg:shorthand>[ <arg-option>]?]*
```

### <sub>`<test-suite-reference>`</sub>

Reference to test suite module (concrete test class).

### <sub>`<tests-path>`</sub>

Path to test target directory (or single test file). Path to test target directory (or single test file). Test files must end with `.test.js` in order to be considered during test suite runs (i.e. fulfill the path relative wildcard pattern `**/*.test.js`).

| Setup | Description |
| :- | :- |
| Separate | Test directory next to source (or library) directory. |
| In-place | Tests in source (or library) directory. |

### Flags

--..., -...             ...
--...                   ...

### Options

--..., -...             ...

## Environment Lifecycle Module

Depending on the type of testing, running tests may require a setup of an effective environme; e.g. an REST-API HTTP server. For that reason, OTES provides an environment module evaluations. This is, a module called `__test.env.js` at the root of the test directory. Certain test suite liefecycle events trigger the evaluation of specific exported members from the environment module:

| Export / Event | Purpose |
| :- | :- |
| `BEFORE` | Evaluates before test files are processed. |
| `AFTER` | Evaluates after all test files were processed. |

### Example

``` js
const restService = require("./lib/rest.service");

module.exports.BEFORE = async function() {
  return await restService.listen(PORT);
}

module.exports.AFTER = async function() {
  return await restService.close();
}
```

## Custom Test Suite

Besides the officially provided test suites – i.e. specific test classes – implementation of a custom test suite is simple. In fact, a custom test suite is a package that exports just a specific test class extending the abstract `Test` class on the OTES API:

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

### `suiteTitle` and `suiteColor`

Title and color of the related test suite badge printed to the console upon usage.

### Expression Evaluation upon Generic `<T>`

For convenience, OTES allows the actual and the expected expressions to deviate (e.g. HTTP request data for actual, and response data for expected expression). However, the intermediate comparison works on a uniform static value typed `T` that is evaluated from both the actual and the expected expression.

Given an arbitrary spread of expressions (as passed to `.actual()` and `.expected()`), `.evalActualExpression()` and `.evalExpectedExpression()` compute the comparison values (typed `T`). By default, both methods return the identity of the first expression argument. 

### Difference Helper

Whether or not a test case succeeds depends on the difference computed from the evaluated actual and expected expressions. The difference is not (necessarily) the mathematical difference operation, but produces the values to print if they are not equal. Equality is thereby defined over the test suite context. Precisely speaking, the test case fails if one of the returned difference values (`.actual` or `.expected`) is not equal to the other, or not empty. Emptiness is  defined as any value that is `undefined`, `null` or an empty object `{}`. By default, the entire values are reflected in case they are not deep equal  (non-strict).

## API

The CLI is the go-to interface for OTES. However, the underlying API can also be used within programatic pipelines.

### Syntax

``` ts
import OTES from "t-ski/otes";

OTES.init(testSuiteModuleReference: string, testTargetPath: string): Promise<IResults>
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

> `testSuiteModuleReference` can also be passed a test suite module export object directly (`{ <Suite>Test: Test }`).

### Example

``` ts
import OTES from "otes";

OTES.init("unit", require("path").resolve("./test/"))
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

## 

<sub>© Thassilo Martin Schiepanski</sub>