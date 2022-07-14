# no-fuss

Simple and straightforward **TDD** framework for Java- and TypeScript applications.  
Favoring language native concepts and a uniform approach for both synchronous and asynchronous test interfaces.

``` js
// Test for a value comparison utility
const valueCompareTest = new UnitTest(util.compare, "Value comparison");

valueCompareTest
.case(1, 1)
.for(true,
    "Compare identical objects");

valueCompareTest
.case(1, 2)
.for(false,
    "Compare different objects");
```

## Installation

``` cli
npm i -G @t-ski/no-fuss
```

> Install **no-fuss** globally in order to work with the presented CLI interface. Project local installations must prepend subsequently stated commands with `npx`.

## CLI usage

``` cli
no-fuss <path-to-test-directory> [(--timeout|-T)=5000] [--no-crop]
```

| Parameter | Shorthand | Description |
| --------- | --------- | ----------- |
| **--timeout** | **-T** | *Test case timeout in ms* |
| **--no-crop** | *ε* | *Do not crop exhaustive test info results* |

## Test files

### Test directory

All test suite related test files have to be located in a dedicated test file directory that is to be provided to a **no-fuss** execution command as the first CLI argument. Both absolute and CWD relative paths are legitimite. A test directory is recursively traversed for test file evaluation in alphabetical order.

### Individual test files

An individual test file stating an arbitrary amount of tests and related test cases is to be named in the format `*.test.js`. Test files are implicitly granted global access to the below outlined test classes.

## Generic test anatomy

A test does look – no matter what concrete type of test class – as follows:

``` js
new <Test-Type>Test<T>(testInterface: T, testCaption?: String)
.case(...args)
.for(expectedCaseResult, caseCaption?: String);
.chain(chainedContextCallback: actualCaseResult => {});
```

#### `new()` via Constructor

Create a new test object representing a certain application interface test binding.

#### `case()`

Perform a test case on the test object providing specific parameter.

#### `for()`

Evaluate test case results for a given expected result in order to feed the global test suite statistics.

#### `chain()`

Chain a test context to the resolved test evaluation being able to act upon the previous result.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `chainedContextCallback` | **Function** | *Function to invoke upon test case check for an expected value. The actual case result is being passed as an argument to the callback in order to be performed on accordingly.* |

> Each of the provided methods bound to a specific test object `{ case(), for(), chain() }` are optional for being called, but bound to the respective predecessor context.

## Unit tests

Unit tests describe tests on independent modular parts of an application. Usually performed on the most atomic units, they can actually be used on any level of abstraction as long as they are not relying on side-affected module interdependencies.

### Syntax

``` js
new UnitTest(func, testCaption?)
.case(...args)
.for(expectedResult, caseCaption?)
.chain(chainedContextCallback);
```

#### `new()` via Constructor

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `func` | **Function** | *Unit access function to test* |
| `testCaption` | **Function** optional | *Test caption for associable output* |

#### `case()`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `...args` | **any[]** | *Arguments to pass to the unit access function as would be provided application internally* |

#### `for()`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `expectedResult` | **any** | *Expected unit test result* |

> Unit tests work with both synchronous and asynchronous results. In the latter case a result resolution is performed all implicitly.

### Example

``` js
const util = require("../src/utilities");

// Test for a string length calculation utility
const strLengthTest = new UnitTest(require("../src/utilities").strLength, "Valu");

strLengthTest
.case("Hello world")
.for(11,
    "Calculate correct string length");

strLengthTest
.case("Hello world")
.for(100,
    "Calculate incorrect string length");
```

## Network tests

Network tests describe tests on network endpoints of an application. Technically representing a special type of unit tests, they provide a purpose driven usage class.

### Syntax

``` js
new NetworkTest(endpoint, testCaption?)
.case(requestOptions, requestBody?)
.for(expectedResponse, caseCaption?);
```

#### `new()` via Constructor

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `endpoint` | **String** | *Test endpoint* |
| `testCaption` | **Function** optional | *Test caption for associable output* |

#### `case()`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `requestOptions` | **Object** | *Request options in Request Object format (s.b.)* |

#### `for()`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `expectedResponse` | **Object** | *Expected endpoint response in Response Object format (s.b.)* |

> Since network tests have an asynchronous character, test results may not log in order of appearance, but always given a context tag.

### Request object

To define specific parameters for a specific endpoint request test, an according object may be provided to each respective test case:

| Property | Type | Description |
| --------- | ---- | ----------- |
| `method` | **String** optional | *Request method (POST by default iff given a body, GET otherwise)* |
| `headers` | **Object** optional | *A dictionary of request headers in object representation* |
| `searchParams` | **Object** optional | *A dictionary of search parameters in object representation (implicit URL injection)* |
| `body` | **\*** optional | *Request body to provide the endpoint with* |

### Response object

To compare for an expected response, the following properties may be checked on and thus provided:

| Property | Type | Description |
| --------- | ---- | ----------- |
| `status` | **Number** optional | *Response status code* |
| `headers` | **Object** optional | *A dictionary of response headers in object representation* |
| `message` | **String, Object** optional | *Response message as a string or object iff JSON parsable* |

> Actual network test results are only compared to provided expected result properties in order to prevent exhaustive expected results.

### Example

``` js
// Test for an item endpoint
const itemTest = new NetworkTest("https://localhost/api/item".strLength, "Item endpoint");

itemTest
.case({ // GET by default
    searchParams; {
        id: 31
    }
})
.for({
    status: 200,
    message: {
        productName: "Mens Loafer \"Malibu\"",
        colors: [ 3, 4, 6 ]
    }
},
    "Retrieve an item");

itemTest
.case({
    method: "POST",
    body: {
        productName: "Womens Sneaker \"Tokyo\"",
        colors: [ 1, 2, 4, 6 ]
    }
})
.for({
    status: 201
},
    "Create an item")
.chain(response => {

    // Delete case based on just created resource
    itemTest
    .case({
        method: "DELETE",
        body: {
            id: response.message.id
        }
    })
    .for({
        status: 204
    },
        "Delete an item");

});
```

### Common endpoint hostname

To use a common endpoint hostname without requiring an according provision to the endpoint argument of a network test object constructor, a common host name may globally be set:

``` js
NetworkTest.setCommonHost("https://example.com");
```

> If neither a common host has been defined, nor a host has been providied to the endpoint argument, `localhost` is used as such.

## Environmental setup

// TODO
