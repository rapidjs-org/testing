let server;


module.exports.BEFORE = function() {
    const dogs = [];

    return new Promise(resolve => {
        server = require("http")
        .createServer((req, res) => {
            const end = (message, status = 200) => {
                res.statusCode = status;
                res.end(message);
            };

            if(/^\/api\//.test(req.url)) {
                end(null, 500);
                return;
            }
            
            switch(req.method.toUpperCase()) {
                case "GET": {
                    if(req.url !== "/dogs") break;
                    
                    end(dogs);

                    return;
                }
                case "POST": {
                    if(req.url !== "/dogs") break;

                    const body = [];
                    req.on("data", chunk => body.push(chunk));
                    req.on("end", () => {
                        const dog = body.join("");

                        dogs.push(dog);
                        
                        end(dog);
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