# [rJS Testing](https://github.com/rapidjs-org/testing) HTTPTest `http`

rJS Testing unit testing suite (`HTTPTest`): Test HTTP(S) endpoints based on expectation filtered responses.

``` cli
npm i -D @rapidjs.org/testing-http
```

``` cli
npx rjs-test http <tests-path>
```

> Integrated in [`rapidjs-org/testing`](https://github.com/t-ski/rJS Testing)

## Configuration

In order to define common request options, they can be defined through the static `.configure()` method:

``` ts
HTTPTest.configure(configuration: RequestOptions & {
  pathRoot?: string;
});
```

## Test Anatomy

### Expressions

The expressions abstract an initial request (actual) and a successive response (expected). 

#### Actual

``` ts
.actual(url: string, requestOptions: RequestOptions)
// https://nodejs.org/api/http.html#httprequesturl-options-callback
```

#### Expected

``` ts
interface IResponse {  // Request information
  status: number;      // 200 (default)
  headers?: {
    [ name: string ]: string;
  };
  body?: any;
}

.expected(response: IResponse)
```

### Value-based Assertion

``` js
new HTTPTest("Get car models")
.actual("/models", {
  headers: {
    "Content-Type": "application/json"
  }
})
.expected({
  status: 200,
  body: [
    {
      manufacturer: "Audi",
      name: "Q5"
    },
    {
      manufacturer: "Ford",
      name: "Bronco"
    },
    {
      manufacturer: "Toyota",
      name: "RAV4"
    }
  ]
});
```

``` ts
new HTTPTest("Create car model")
.actual("/models", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: {
    name: "Q3"
  }
})
.expected({
  status: 422,
  body: "Missing manufacturer name"
});
```

<sup>[View More Examples](../../examples/http)</sup>

## Comparison Strategy

The comparison strategy does only respected properties stated on the expected response object (down to atomic properties). This is, every leaf-most property on the actual value object – corresponding to the HTTP response – that is not on the expected object is discarded before soft deep equal comparison.
  
**✅ &thinsp; SUCCESS**

``` js
.actual("/models", {
  headers: {
    "Content-Type": "application/json"
  }
})
/* results in: {
 *   body: […]
 *   headers: {
 *     "Content-Type": "application/json",
 *     "Content-Length": 225,
 *     "Server": "rapidJS"
 *   },
 *   status: 200,
 *   […]
 * }
 */
.expected({
  status: 200,
  headers: {
    "Content-Length": 225
  }
})
```
  
**❌ &thinsp; FAILURE**

``` js
.actual("/models", {
  headers: {
    "Content-Type": "application/json"
  }
})
// results in: see above
.expected({
  status: 404,
  headers: {
    "Content-Length": 225
  }
})
```

##

<sub>&copy; Thassilo Martin Schiepanski</sub>