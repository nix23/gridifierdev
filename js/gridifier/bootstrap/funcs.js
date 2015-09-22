var proto = function(c, def) {
    for(var prop in def)
        c.prototype[prop] = def[prop];
}

var self = function(fns, c) {
    var c = c || gridifier;

    for(var fnName in fns) {
        (function(fnName, c) {
            gridifier[fnName] = function() {
                return fns[fnName].apply(c, arguments);
            }
        })(fnName, c);
    }
}

var err = function(msg) {
    throw new Error(CP.ERR + msg);
}

var nop = function() { return function() {}; }