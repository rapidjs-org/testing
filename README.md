# rJS Testing

Context-sensitive, (a)sync-uniform testing framework for JavaScript and TypeScript.

### 📖 &hairsp; [Read the Docs](./packages/testing/README.md)

``` cli
npm install -D @rapidjs-org/testing
```

``` js
function divide(a, b) {
  if(b === 0) throw new SyntaxError("Division by zero");
  return a / b;
}

new UnitTest("Computes quotient of positive integers")
.actual(divide(4, 2))
.expected(2);

new UnitTest("Throws error for division by zero")
.actual(() => divide(2, 0))
.error("Division by zero", SyntaxError);
```

### 🔧 &hairsp; Testing Suites

**🔩 &hairsp; [Unit](./packages/@unit/README.md)** &hairsp; `unit`

> Test arbitrary units of code based on deep expected value comparisons.

**🔩 &hairsp; [HTTP](./packages/@http/README.md)** &hairsp; `http`

> Test HTTP(S) endpoints based on expectation filtered responses.

**🔩 &hairsp; [CLI](./packages/@cli/README.md)** &hairsp; `cli`

> Test command line interfaces based on expected stdout or stderr.

##

<sub>© Thassilo Martin Schiepanski</sub>