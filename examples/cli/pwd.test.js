new CLITest("Print working directory (pwd)")
.actual("pwd")
.expected({
    stdout: process.cwd()
});

new CLITest("pwd with an undefined argument")
.actual("pwd", [ "-x" ])
.expected({
    stderr: [
        "/bin/sh: line 0: pwd: -x: invalid option",
        "pwd: usage: pwd [-LP]"
    ]
});