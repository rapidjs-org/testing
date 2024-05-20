# [rJS Test](https://github.com/t-ski/rJS Test) Unit Testing `dom`

rJS Test test suite for unit testing providing the expression asymmetrical `DOMTest` class.

``` cli
npx rjs:test dom <tests-path>
```

> Integrated in [`rapidjs-org/test`](https://github.com/t-ski/rJS Test)

## Test Anatomy

### Expressions

(#### Actual)

``` ts
.actual(expression: any)
.expected(expression: any)
```

(#### Expected)

### Value-based Assertion

``` ts
new DOMTest("Example label")
.actual(<expression>)
.expected(<expression>);
```

### Error-based Assertion

``` ts
new DOMTest("Example label")
.actual(<expression>)
.error("<error-message>", <ErrorConstructor>);
```

<sup>[View More Examples](../../examples/dom)</sup>

## Comparison Strategy

...

**✅ &thinsp; SUCCESS**

``` js
.actual(<expression>)
.expected(<expression>)
```
  
**❌ &thinsp; FAILURE**

``` js
.actual(<expression>)
.expected(<expression>)
```

## Configuration

...

##

<sub>&copy; Thassilo Martin Schiepanski</sub>