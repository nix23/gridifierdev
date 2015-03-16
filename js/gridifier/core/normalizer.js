Gridifier.Normalizer = function(gridifier, sizesResolverManager) {
    var me = this;

    this._gridifier = null;
    this._sizesResolverManager = null;

    // @todo -> Make option to disable/enable this option, and write docs about it.
    // (How it works, and why it can be disabled on px-valued items)
    // this._roundingNormalizationValue = 2; // @todo -> Looks like without Math.floor in SR 1 pixel is enough(Per IE)
    // This is required per % w/h support in IE8 and... FF!!!! (omg)
    this._roundingNormalizationValue = 1;

    this._itemWidthAntialiasPercentageValue = 0;
    this._itemWidthAntialiasPxValue = 0;
    this._itemHeightAntialiasPercentageValue = 0;
    this._itemHeightAntialiasPxValue = 0;

    this._areZIndexesUpdatesEnabled = true;
    this._areZIndexesUpdatesBinded = false;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._sizesResolverManager = sizesResolverManager;

        me.setItemWidthAntialiasPercentageValue(me._itemWidthAntialiasPercentageValue);
        me.setItemHeightAntialiasPercentageValue(me._itemHeightAntialiasPercentageValue);
        me.setItemWidthAntialiasPxValue(me._itemWidthAntialiasPxValue);
        me.setItemHeightAntialiasPxValue(me._itemHeightAntialiasPxValue);

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

Gridifier.Normalizer.prototype.normalizeLowRounding = function(valueToNormalize) {
    return valueToNormalize - this._roundingNormalizationValue;
}

Gridifier.Normalizer.prototype.normalizeHighRounding = function(valueToNormalize) {
    return valueToNormalize + this._roundingNormalizationValue;
}

Gridifier.Normalizer.prototype.setItemWidthAntialiasPercentageValue = function(newItemWidthPtValue) {
    this._itemWidthAntialiasPercentageValue = newItemWidthPtValue;
    this.updateItemWidthAntialiasPxValue();
}

Gridifier.Normalizer.prototype.setItemWidthAntialiasPxValue = function(newItemWidthPxValue) {
    this._itemWidthAntialiasPxValue = newItemWidthPxValue;
    this.updateItemWidthAntialiasPxValue();
}

Gridifier.Normalizer.prototype.setItemHeightAntialiasPercentageValue = function(newItemHeightPtValue) {
    this._itemHeightAntialiasPercentageValue = newItemHeightPtValue;
    this.updateItemHeightAntialiasPxValue();
}

Gridifier.Normalizer.prototype.setItemHeightAntialiasPxValue = function(newItemHeightPxValue) {
    this._itemHeightAntialiasPxValue = newItemHeightPxValue;
    this.updateItemHeightAntialiasPxValue();
}

Gridifier.Normalizer.prototype.updateItemWidthAntialiasPxValue = function() {
    if(this._itemWidthAntialiasPercentageValue == 0 && this._itemWidthAntialiasPxValue == 0) {
        this._sizesResolverManager.setOuterWidthAntialiasValue(0);
        return;
    }

    if(this._itemWidthAntialiasPercentageValue != 0)
        var newItemWidthAntialiasPxValue = (this._gridifier.getGridX2() + 1) * (this._itemWidthAntialiasPercentageValue / 100);
    else
        var newItemWidthAntialiasPxValue = this._itemWidthAntialiasPxValue;

    this._sizesResolverManager.setOuterWidthAntialiasValue(newItemWidthAntialiasPxValue);
}

Gridifier.Normalizer.prototype.updateItemHeightAntialiasPxValue = function() {
    if(this._itemHeightAntialiasPercentageValue == 0 && this._itemHeightAntialiasPxValue == 0) {
        this._sizesResolverManager.setOuterHeightAntialiasValue(0);
        return;
    }

    if(this._itemHeightAntialiasPercentageValue != 0)
        var newItemHeightAntialiasPxValue = (this._gridifier.getGridY2() + 1) * (this._itemHeightAntialiasPercentageValue / 100);
    else
        var newItemHeightAntialiasPxValue = this._itemHeightAntialiasPxValue;

    this._sizesResolverManager.setOuterHeightAntialiasValue(newItemHeightAntialiasPxValue);
}

Gridifier.Normalizer.prototype.updateItemAntialiasValues = function() {
    this.updateItemWidthAntialiasPxValue();
    this.updateItemHeightAntialiasPxValue();
}

Gridifier.Normalizer.prototype.disableZIndexesUpdates = function() {
    this._areZIndexesUpdatesEnabled = false;
}

Gridifier.Normalizer.prototype.bindZIndexesUpdates = function() {
    if(!this._areZIndexesUpdatesEnabled || this._areZIndexesUpdatesBinded)
        return;

    this._gridifier.onConnectionCreate(function(connectionsObj) {
        var connections = connectionsObj.get();
        var connectionsSorter = connectionsObj.getConnectionsSorter();

        var sortedConnections = connectionsSorter.sortConnectionsPerReappend(connections);
        var nextItemZIndex = 1;
        for(var i = 0; i < sortedConnections.length; i++) {
            sortedConnections[i].item.style.zIndex = nextItemZIndex;
            nextItemZIndex++;
        }
    });

    this._areZIndexesUpdatesBinded = true;
}