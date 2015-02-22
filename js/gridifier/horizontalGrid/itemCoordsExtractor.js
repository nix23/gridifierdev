Gridifier.HorizontalGrid.ItemCoordsExtractor = function(gridifier, sizesResolverManager) {
    var me = this;

    this._gridifier = null;
    this._sizesResolverManager = null;
    this._transformedItemMarker = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._sizesResolverManager = sizesResolverManager;
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

Gridifier.HorizontalGrid.ItemCoordsExtractor.prototype._getItemSizesPerAppend = function(item) {
    if(this._transformedItemMarker.isTransformedItem(item)) {
        var itemTargetPxSizes = this._transformedItemMarker.getTransformedItemTargetPxSizes(item);

        return {
            targetWidth: parseFloat(itemTargetPxSizes.targetPxWidth),
            targetHeight: parseFloat(itemTargetPxSizes.targetPxHeight)
        };
    }
    else {
        return {
            targetWidth: this._sizesResolverManager.outerWidth(item, true),
            targetHeight: this._sizesResolverManager.outerHeight(item, true)
        };
    }
}

Gridifier.HorizontalGrid.ItemCoordsExtractor.prototype.getItemTargetSizes = function(item) {
    return this._getItemSizesPerAppend(item);
}

Gridifier.HorizontalGrid.ItemCoordsExtractor.prototype.connectorToAppendedItemCoords = function(item, connector) {
    var targetSizes = this._getItemSizesPerAppend(item);

    return {
        x1: parseFloat(connector.x),
        x2: parseFloat(connector.x + targetSizes.targetWidth - 1),
        y1: parseFloat(connector.y),
        y2: parseFloat(connector.y + targetSizes.targetHeight - 1)
    };
}

Gridifier.HorizontalGrid.ItemCoordsExtractor.prototype.connectorToReversedAppendedItemCoords = function(item, connector) {
    var targetSizes = this._getItemSizesPerAppend(item);

    return {
        x1: parseFloat(connector.x),
        x2: parseFloat(connector.x + targetSizes.targetWidth - 1),
        y1: parseFloat(connector.y - targetSizes.targetHeight + 1),
        y2: parseFloat(connector.y)
    };
}

Gridifier.HorizontalGrid.ItemCoordsExtractor.prototype.connectorToPrependedItemCoords = function(item, connector) {
    var targetSizes = this._getItemSizesPerAppend(item);

    return {
        x1: parseFloat(connector.x - targetSizes.targetWidth + 1),
        x2: parseFloat(connector.x),
        y1: parseFloat(connector.y - targetSizes.targetHeight + 1),
        y2: parseFloat(connector.y)
    };
}

Gridifier.HorizontalGrid.ItemCoordsExtractor.prototype.connectorToReversedPrependedItemCoords = function(item, connector) {
    var targetSizes = this._getItemSizesPerAppend(item);

    return {
        x1: parseFloat(connector.x - targetSizes.targetWidth + 1),
        x2: parseFloat(connector.x),
        y1: parseFloat(connector.y),
        y2: parseFloat(connector.y + targetSizes.targetHeight - 1)
    };
}