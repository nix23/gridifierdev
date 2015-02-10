Gridifier.Dragifier.Renderer = function(settings) {
    var me = this;

    this._settings = null;
    this._renderFunction = null;

    this._css = {
    };

    this._construct = function() {
        me._settings = settings;

        // @todo -> Parse settings and implement def func
        me._setTransitionRenderFunction();

        me._bindEvents();
    };

    this._bindEvents = function() {

    };

    this._unbindEvents = function() {
    };

    this.destruct = function() {
       me._unbindEvents();
    };

    this._construct();
    return this;
}

Gridifier.Dragifier.Renderer.prototype._setTransitionRenderFunction = function() {
    this._renderFunction = function(item, newLeft, newTop) {
        var newLeft = parseFloat(newLeft);
        var newTop = parseFloat(newTop);

        var currentLeft = parseFloat(item.style.left);
        var currentTop = parseFloat(item.style.top);

        if(newLeft > currentLeft)
            var translateX = newLeft - currentLeft;
        else if(newLeft < currentLeft)
            var translateX = (currentLeft - newLeft) * -1;
        else 
            var translateX = 0;

        if(newTop > currentTop)
            var translateY = newTop - currentTop;
        else if(newTop < currentTop)
            var translateY = (currentTop - newTop) * -1;
        else
            var translateY = 0;

        Dom.css3.transformProperty(item, "translate3d", translateX + "px," + translateY + "px, 0px");
    };
}

Gridifier.Dragifier.Renderer.prototype.render = function(item, newLeft, newTop) {
    this._renderFunction(item, newLeft, newTop);
}