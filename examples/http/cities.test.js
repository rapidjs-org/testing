new HTTPTest("Create city (Sydney)")
.actual("/cities", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: {
        "name": "Sydney", "country": "Australia"
    }
})
.expected({
    status: 200,
    body: 3
});

new HTTPTest("Get specific city (Amsterdam)")
.actual("/cities/0")
.expected({
    status: 200,
    body: {
        "name": "Amsterdam", "country": "Netherlands"
    }
});

new HTTPTest("Get non-existing city")
.actual("/cities/100")
.expected({
    status: 404
});

new HTTPTest("Get all cities")
.actual("/cities")
.expected({
    status: 200,
    body: [
        {
            "name": "Amsterdam",
            "country": "Netherlands"
        },
        {
            "name": "New York",
            "country": "USA"
        },
        {
            "name": "Tokyo",
            "country": "Japan"
        },
        {
            "name": "Sydney",
            "country": "Australia"
        }
    ]
});