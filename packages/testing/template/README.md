# [rJS Test](https://github.com/t-ski/rJS Test) <Suite> Testing

rJS Test test suite for <purpose> testing providing the expression <symmetrical|asymmetrical> `<Suite>Test` class.

``` cli
npx rjs-test <package-reference> <tests-path>
```

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
new <Suite>Test("Example label")
.actual(<expression>)
.expected(<expression>);
```

### Error-based Assertion

``` ts
new <Suite>Test("Example label")
.actual(<expression>)
.error("<error-message>", <ErrorConstructor>);
```

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