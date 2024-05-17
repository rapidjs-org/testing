const express = require("express");


const CITIES_DB = new Map(Object.entries(require("./cities.json")));
const ROUTER = express.Router();
const APP = express()
.use(express.json())
.use("/api", ROUTER)
.use(ROUTER);


ROUTER.get("/cities", (_, res) => {
    res.send(Object.values(Object.fromEntries(CITIES_DB)));
});

ROUTER.get("/cities/:id", (req, res) => {
    const city = CITIES_DB.get(req.params.id);
    
    if(city) {
        res.send(city);

        return;
    }

    res.sendStatus(404);
    res.end();
});

ROUTER.post("/cities", (req, res) => {
    const id = CITIES_DB.size;
    
    CITIES_DB.set(id, req.body);
    
    res.send(id.toString());
});


let server;

module.exports.listen = function(port) {
    return new Promise(resolve => {
        server = APP.listen(port, () => {
            console.log(`REST API listening on port ${port}`);

            resolve();
        });
    });
};

module.exports.close = function() {
    return new Promise(resolve => {
        server.close(resolve);
    });
};