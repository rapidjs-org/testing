HTTPTest.configure({
    commonPathname: "/api"
});


const movieData = require("./__helper.env");


new HTTPTest("Create movie")
.actual(movieData.MOVIES_PATH, {
    method: "POST",
    body: movieData.NEW_MOVIE
})
.expected({
    status: 200,
    body: movieData.NEW_MOVIE
});

new HTTPTest("Get movies")
.actual(movieData.MOVIES_PATH)
.expected({
    headers: {
        "Content-Length": 78
    },
    body: movieData.MOVIES.concat(movieData.NEW_MOVIE)
});

/* new HTTPTest("Create movie")
.post(movieData.MOVIES_PATH, {
    name: "Husky"
})
.expected(200);     */ // only status */

/* new HTTPTest("Get movies")
.actual(movieData.MOVIES_PATH, {
    headers: {
        "Accept-Language": "en;q=1.0, de;q=0.75, *;q=0.5"
    }
})
.expected("abc");   */ // only body */