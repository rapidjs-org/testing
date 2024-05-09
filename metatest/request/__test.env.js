let server;


module.exports.BEFORE = function() {
    return new Promise(resolve => {
        server = require("http")
        .createServer((req, res) => {
            if(/^\/api\//.test(req.url)) {
                res.statusCode = 500;
                res.end();

                return;
            }

            
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