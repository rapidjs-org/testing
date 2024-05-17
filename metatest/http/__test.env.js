const movieData = require("./__helper.env");


let server;


HTTPTest.configure({
    port: 7979
});


module.exports.BEFORE = function() {
    return new Promise(resolve => {
        server = require("http")
        .createServer((req, res) => {
            const end = (message, status = 200) => {
                res.statusCode = status;

                res.end(JSON.stringify(message));
            };

            if(/^\/api\//.test(req.url)) {
                end(null, 500);

                return;
            }
            
            switch(req.method.toUpperCase()) {
                case "GET": {
                    if(req.url !== movieData.MOVIES_PATH) break;
                    
                    end(movieData.MOVIES);

                    return;
                }
                case "POST": {
                    if(req.url !== movieData.MOVIES_PATH) break;

                    const body = [];
                    req.on("data", chunk => body.push(chunk));
                    req.on("end", () => {
                        const movie = JSON.parse(Buffer.concat(body).toString());

                        movieData.MOVIES.push(movie);
                        
                        end(movie);
                    });
                    return;
                }
            }

            end(null, 404);
        })
        .listen(7979, () => {
            console.log("Test HTTP API server listening");

            resolve();
        });
    });
}

module.exports.AFTER = function() {
    server.close();
    
    console.log("Test HTTP API server gracefully terminated");
}