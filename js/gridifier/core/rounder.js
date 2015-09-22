var Rounder = function() {
    // This is required per % w/h support in IE8 and... FF!!!! (omg)
    this._fixRoundingVal = 1;
}

proto(Rounder, {
    fixLowRounding: function(val) {
        return val - this._fixRoundingVal;
    },

    fixHighRounding: function(val) {
        return val + this._fixRoundingVal;
    }
});