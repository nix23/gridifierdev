Gridifier.VerticalGrid.ItemCoordsExtractor = function(gridifier) {
    var me = this;

    this._gridifier = null;
    this._transformedItemMarker = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._transformedItemMarker = new Gridifier.SizesTransformer.TransformedItemMarker();
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

Gridifier.VerticalGrid.ItemCoordsExtractor.prototype._getItemSizesPerAppend = function(item) {
    if(this._transformedItemMarker.isTransformedItem(item)) {
        var itemTargetPxSizes = this._transformedItemMarker.getTransformedItemTargetPxSizes(item);

        return {
            targetWidth: parseFloat(itemTargetPxSizes.targetPxWidth),
            targetHeight: parseFloat(itemTargetPxSizes.targetPxHeight)
        };
    }
    else {
        return {
            targetWidth: SizesResolverManager.outerWidth(item, true),
            targetHeight: SizesResolverManager.outerHeight(item, true)
        };
    }
}

Gridifier.VerticalGrid.ItemCoordsExtractor.prototype.getItemTargetSizes = function(item) {
    return this._getItemSizesPerAppend(item);
}

Gridifier.VerticalGrid.ItemCoordsExtractor.prototype.connectorToAppendedItemCoords = function(item, connector) {
    var targetSizes = this._getItemSizesPerAppend(item);

    return {
        x1: parseFloat(connector.x - targetSizes.targetWidth + 1),
        x2: parseFloat(connector.x),
        y1: Dom.toInt(connector.y),
        y2: Dom.toInt(connector.y + targetSizes.targetHeight - 1)
    };
}

Gridifier.VerticalGrid.ItemCoordsExtractor.prototype.connectorToReversedAppendedItemCoords = function(item, connector) {
    var targetSizes = this._getItemSizesPerAppend(item);

    return {
        x1: parseFloat(connector.x),
        x2: parseFloat(connector.x + targetSizes.targetWidth - 1),
        y1: Dom.toInt(connector.y),
        y2: Dom.toInt(connector.y + targetSizes.targetHeight - 1)
    };
}

Gridifier.VerticalGrid.ItemCoordsExtractor.prototype.connectorToPrependedItemCoords = function(item, connector) {
    var targetSizes = this._getItemSizesPerAppend(item);

    return {
        x1: parseFloat(connector.x),
        x2: parseFloat(connector.x + targetSizes.targetWidth - 1),
        y1: Dom.toInt(connector.y - targetSizes.targetHeight + 1),
        y2: Dom.toInt(connector.y)
    };
}

Gridifier.VerticalGrid.ItemCoordsExtractor.prototype.connectorToReversedPrependedItemCoords = function(item, connector) {
    var targetSizes = this._getItemSizesPerAppend(item);

    return {
        x1: parseFloat(connector.x - targetSizes.targetWidth + 1),
        x2: parseFloat(connector.x),
        y1: Dom.toInt(connector.y - targetSizes.targetHeight + 1),
        y2: Dom.toInt(connector.y)
    };
}