module.exports.BEFORE = function() {
    console.log("Prepare test environment");

    return new Promise(resolve => setTimeout(resolve, 500));
}

module.exports.AFTER = function() {
    console.log("Cleanup test environment");
    
    return new Promise(resolve => setTimeout(resolve, 500));
}