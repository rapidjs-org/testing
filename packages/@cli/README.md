# [rJS Testing](https://github.com/rapidjs-org/testing) CLITest `cli`

rJS Testing CLI testing suite (`CLITest`): Test command line interfaces based on expected stdout or stderr.

``` cli
npm i -D @rapidjs.org/testing-cli
```

``` cli
npx rjs-testing cli <tests-path>
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
.actual(args: string[]) // Imply binary if defined a common
```

#### Expected

``` ts
.expected(feedback: {
  stdout?: string|string[];         // Either text as is, or array of lines
  stderr?: string|string[];
})
.expected(stdout: string|string[])  // Only check stdout
```

> The execution output to be compared is whitespace normalised, i.e. any non-break whitespace character is condensed to a single space.

### Value-based Assertion

``` ts
new CLITest("Print working directory")
.actual("pwd")
.expected("/Users/rjs/app");
```

## Comparison Strategy

Before a comparison of a binary execution output, it is whitespace normalised. This is, any non-break whitespace character is condensed to a single space.

**✅ &thinsp; SUCCESS**

``` js
.actual("ls", [ "-L" ])
.expected("img1.png img2.png")
```
  
**❌ &thinsp; FAILURE**

``` js
.actual("ls", [ "-L" ])
.expected("img1.png    img2.png")
```

##

<sub>&copy; Thassilo Martin Schiepanski</sub>