# [rJS Testing](https://github.com/rapidjs-org/testing) <Suite>Test `<alias>`

rJS Testing <alias> testing suite (`<Suite>Test`): …

## Test Anatomy

### Expressions

#### Actual

``` ts
.actual(expression: any)
```

#### Expected

``` ts
.expected(expression: any)
```

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