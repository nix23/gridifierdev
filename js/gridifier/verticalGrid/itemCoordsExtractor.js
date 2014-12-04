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

Gridifier.VerticalGrid.ItemCoordsExtractor.prototype.connectorToAppendedItemCoords = function(item, connector) {
    return {
        x1: parseFloat(connector.x - SizesResolverManager.outerWidth(item, true) + 1),
        x2: parseFloat(connector.x),
        y1: Dom.toInt(connector.y),
        y2: Dom.toInt(connector.y + SizesResolverManager.outerHeight(item, true) - 1)
    };
}

Gridifier.VerticalGrid.ItemCoordsExtractor.prototype.connectorToPrependedItemCoords = function(item, connector) {
    return {
        x1: parseFloat(connector.x),
        x2: parseFloat(connector.x + SizesResolverManager.outerWidth(item, true) - 1),
        y1: Dom.toInt(connector.y - SizesResolverManager.outerHeight(item, true) + 1),
        y2: Dom.toInt(connector.y)
    };
}