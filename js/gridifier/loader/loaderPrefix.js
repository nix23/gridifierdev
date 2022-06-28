(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object' && exports) {
        module.exports = factory();
    } else {
        root.Gridifier = factory();
    }
}(this, function () {
    var Gridifier = function(sourceGrid, sourceSettings) {