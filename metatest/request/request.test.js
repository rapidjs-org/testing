RequestTest.configure({
    port: 7979,
    commonPathname: "/api"
});


new RequestTest("Create dog")
.actual("/dogs", {
    method: "POST",
    body: {
        name: "Husky"
    }
})
.expected({
    status: 203,
    headers: {
        "Content-Length": 16
    }
});

/* new RequestTest("Get dogs")
.actual("/dogs", {
    headers: {
        "Accept-Language": "en;q=1.0, de;q=0.75, *;q=0.5"
    }
})
.expected("Only body"); */

/* new RequestTest("Create dog")
.post("/dogs", {
    name: "Husky"
})
.expected(200);   // only status */