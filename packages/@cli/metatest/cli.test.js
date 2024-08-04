// With common bin
new CLITest("Print working directory (1)")
.actual()
.expected({
    stdout: __dirname
});

// With explicit bin
new CLITest("Print working directory (2)")
.actual("pwd")
.expected({
    stdout: __dirname
});

// With args
new CLITest("Echo 'foo' (1)")
.actual("echo", [ "foo" ])
.expected({
    stdout: "foo",
    stderr: null
});

// Condensed
new CLITest("Echo 'foo' (2)")
.actual("echo foo")
.expected("foo");

// stderr
new CLITest("Print working directory; with undefined argument")
.actual("pwd -x")
.expected({
    stderr: [
        "/bin/sh: line 0: pwd: -x: invalid option",
        "pwd: usage: pwd [-LP]"
    ]
});