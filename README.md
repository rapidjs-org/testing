# OTES

![GitHub project type](https://img.shields.io/badge/test%20framework-A074E7)
&ensp;
![GitHub package.json version](https://img.shields.io/github/package-json/v/t-ski/otes)

Contextual (a)sync-uniform testing framework built for simplicity.

``` cli
npx otes unit
```

``` js
function divide(a, b) {
    if(b === 0) throw new SyntaxError("Division by zero");
    return a / b;
}

new UnitTest("Calculates quotient of positive integers")
.actual(divide(4, 2))
.expected(2);

new UnitTest("Throws error for division by zero")
.actual(() => divide(2, 0))
.error("Division by zero", SyntaxError);
```

<sup>[View more Examples](./examples/)</sup>

## Install

``` cli
npm install -D t-ski/otes
```

## Test Anatomy

Test files must end with `.test.js` in order to be considered during test suite runs.

### Value-based Assertion

``` ts
new <Suite>Test(label: string)
.actual(...expression)
.expected(...expression);
```

### Error-based Assertion

``` ts
new <Suite>Test(label: string)
.actual(...expression)
.error(errorMessage: string, ErrorPrototype?: ErrorConstructor);
```

## CLI

``` cli
npx otes <test-suite-reference> <tests-path> [--<arg:key>|-<arg:shorthand>[ <arg-option>]?]*
```

### \<test-suite-reference> (required)

Reference to test suite module (concrete test class):

| Name (Alias) | Purpose | Underlying Package |
| :- | :- | :- |
| `unit` | Unit testing ([Read Documentation](./packages/@unit/README.md)) | *t-ski/otes--unit* |
| `http` | HTTP(S) testing ([Read Documentation](./packages/@http/README.md)) | *t-ski/otes--http* |
| `dom` | DOM testing ([Read Documentation](./packages/@dom/README.md)) | *t-ski/otes--dom* |

### \<tests-path> (required)

Path to test target directory (or single test file).

### Flags
--..., -...             ...
--...                   ...

### Options

--..., -...             ...

## API

The CLI is the go-to interface for using OTES. However, the underlying API can also be used within a programatic pipelines.

### Syntax

``` ts
init(testSuiteModuleReference: string, testTargetPath: string): Promise<IResults>
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

> `testSuiteModuleReference` can also be passed a test suite module export object directly (`{ [key: string]: Test }`).

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

### ...

## 

<sub>© Thassilo Martin Schiepanski</sub>