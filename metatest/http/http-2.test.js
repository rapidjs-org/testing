// Check multiple files

HTTPTest.configure({
    commonPathname: "/api"
});


const movieData = require("./__helper.env");


new HTTPTest("Get movies")
.actual(movieData.MOVIES_PATH)
.expected({
    headers: {
        "Content-Length": 78
    },
    body: movieData.MOVIES.concat(movieData.NEW_MOVIE)
});