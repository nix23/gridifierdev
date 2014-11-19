Gridifier.VerticalGrid.ItemCoordsExtractor = function(gridifier) {
    var me = this;

    this._gridifier = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
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

// @todo Dom to int -> parseFloat(this is for strings???)
Gridifier.VerticalGrid.ItemCoordsExtractor.prototype.connectorToAppendedItemCoords = function(item, connector) {
    //console.log("outerWidth in coordsExtractor: ", SizesResolver.outerWidth(item, true, true));

    return {
        x1: connector.x - SizesResolver.outerWidth(item, true, true) + 1,
        //x1: Dom.toInt(connector.x - SizesResolver.outerWidth(item, true, true) + 1),
        //x2: Dom.toInt(connector.x),
        x2: connector.x,
        y1: Dom.toInt(connector.y),
        y2: Dom.toInt(connector.y + SizesResolver.outerHeight(item, true) - 1)
    };
}

Gridifier.VerticalGrid.ItemCoordsExtractor.prototype.connectorToPrependedItemCoords = function(item, connector) {
    return {
        x1: Dom.toInt(connector.x),
        x2: Dom.toInt(connector.x + SizesResolver.outerWidth(item, true) - 1),
        y1: Dom.toInt(connector.y - SizesResolver.outerHeight(item, true) + 1),
        y2: Dom.toInt(connector.y)
    };
}