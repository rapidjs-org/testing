const networkA = new NetworkTest("example.com/a", "Resource A");

NetworkTest.setCommonHost("localhost");

networkA
.case({
    searchParams: {
        "queryParam1": "abc def",
        "queryParam2": true
    }
})
.for({
    status: 200,
    headers: {
        "content-type": "text/html",
        "server": "Apache"
    }
})
.chain(result => {
    console.log("Test A1 response message: " + result.message.slice(0, 25) + "...");
});

networkA
.case({})
.for({
    status: 400,
    headers: {
        "content-type": "text/html"
    }
});

networkA
.case()
.for({
    message: "TEST A 3"
});

const networkB = new NetworkTest("b");

networkB
.case({
    method: "POST",
    body: {
        a: 1
    }
})
.for({
    status: 500
}, "Request resource B");