# [rJS Testing](https://github.com/rapidjs-org/testing) CLITest `cli`

rJS Testing CLI testing suite (`CLITest`): Test command line interfaces based on stdout and -err.

``` cli
npm i -D @rapidjs.org/testing-cli
```

``` cli
npx rjs-test cli <tests-path>
```

> Integrated in [`rapidjs-org/testing`](https://github.com/rapidjs-org/testing).

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

##

<sub>&copy; Thassilo Martin Schiepanski</sub>