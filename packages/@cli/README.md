# [rJS Testing](https://github.com/rapidjs-org/testing) CLITest `cli`

rJS Testing CLI testing suite (`CLITest`): Test command line interfaces based on stdout and -err.

``` cli
npm i -D @rapidjs.org/testing-cli
```

``` cli
npx rjs-test cli <tests-path>
```

> Integrated in [`rapidjs-org/testing`](https://github.com/rapidjs-org/testing).

## Configuration

In order to define common CLI aspects, they can be defined through the static `.configure()` method:

``` ts
HTTPTest.configure(configuration: RequestOptions & {
  commonBinary?: string;
});
```

## Test Anatomy

### Expressions

#### Actual

``` ts
.actual(binary: string, arg?: string[])
.actual(args: string[]) // imply binary if defined a common
```

#### Expected

``` ts
.expected(binary: string, arg?: string[])
.expected(args: string[]) // imply binary if defined a common
```

### Value-based Assertion

``` ts
new CLITest("List files")
.actual(<expression>)
.expected(<expression>);
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