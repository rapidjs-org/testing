module.exports.divide = function(a, b) {
    if(b === 0) throw new SyntaxError("Division by zero");
    
    return a / b;
}