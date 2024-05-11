module.exports.delayExecution = function(timeout, cb) {
    if(timeout < 0) throw new RangeError("Negative timeout");
    
    return new Promise(resolve => {
        setTimeout(() => resolve(cb()), timeout);
    });
}