# [OTES](https://github.com/t-ski/OTES) Unit Testing `dom`

OTES test suite for unit testing providing the expression asymmetrical `DOMTest` class.

``` cli
npx otes dom <tests-path>
```

> Integrated in [`t-ski/otes`](https://github.com/t-ski/OTES)

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