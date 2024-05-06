RequestTest.configure({
    hostname: "http://localhost:8080",
    commonPathname: "/api"
});


new RequestTest("Get dogs")
.do("/dogs", {
    headers: {
        "Accept-Language": "en;q=1.0, de;q=0.75, *;q=0.5"
    }
})
.expect("Only body");

new RequestTest("Create dog")
.do("/dogs", {
    method: "POST",
    body: {
        name: "Husky"
    }
})
.expect({
    status: 200
});

new RequestTest("Create dog")
.post("/dogs", {
    name: "Husky"
})
.expect(200);   // only status