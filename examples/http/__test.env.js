const restService = require("./lib/rest.service");


const PORT = 8000;


HTTPTest.configure({
    commonPathname: "/api",
    port: PORT
});


module.exports.BEFORE = async function() {
    return await restService.listen(PORT);
}

module.exports.AFTER = async function() {
    return await restService.close();
}