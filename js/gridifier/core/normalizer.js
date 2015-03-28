Gridifier.Normalizer = function(gridifier, sizesResolverManager) {
    var me = this;

    this._gridifier = null;
    this._sizesResolverManager = null;

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

    var me = this;
    var executeUpdatesTimeout = null;

    this._gridifier.onConnectionCreate(function(connectionsObj) {
        var executeUpdates = function() {
            var calculateSizes = function (connections) {
                for(var i = 0; i < connections.length; i++) {
                    connections[i].tmpWidth = Math.abs(connections[i].x2 - connections[i].x1) + 1;
                    connections[i].tmpHeight = Math.abs(connections[i].y2 - connections[i].y1) + 1;

                    connections[i].tmpWidth += parseFloat(connections[i].horizontalOffset);
                    connections[i].tmpHeight += parseFloat(connections[i].verticalOffset);

                    connections[i].tmpArea = Math.round(connections[i].tmpWidth * connections[i].tmpHeight);
                }
            }

            var sortByAreasAsc = function (firstConnection, secondConnection) {
                if(firstConnection.tmpArea > secondConnection.tmpArea)
                    return -1;
                else if(firstConnection.tmpArea < secondConnection.tmpArea)
                    return 1;
                else if(firstConnection.tmpArea == secondConnection.tmpArea)
                    return 0;
            }

            var packConnectionsByAreas = function (connections) {
                var packedConnections = {};
                for(var i = 0; i < connections.length; i++) {
                    if(typeof packedConnections[connections[i].tmpArea] == "undefined") {
                        packedConnections[connections[i].tmpArea] = [];
                    }

                    packedConnections[connections[i].tmpArea].push(connections[i]);
                }

                return packedConnections;
            }

            var connections = connectionsObj.get();
            calculateSizes(connections);
            connections.sort(sortByAreasAsc);
            var packedByAreasConnections = packConnectionsByAreas(connections);

            var connectionsSorter = connectionsObj.getConnectionsSorter();
            var areaProps = [];
            for(var areaProp in packedByAreasConnections) {
                packedByAreasConnections[areaProp] = connectionsSorter.sortConnectionsPerReappend(
                    packedByAreasConnections[areaProp]
                );
                areaProps.push(areaProp);
            }

            areaProps.sort(function (firstArea, secondArea) {
                if(Dom.toInt(firstArea) > Dom.toInt(secondArea))
                    return -1;
                else if(Dom.toInt(firstArea) < Dom.toInt(secondArea))
                    return 1;
                else if(Dom.toInt(firstArea) == Dom.toInt(secondArea))
                    return 0;
            });


            var nextItemZIndex = 1;

            for(var i = 0; i < areaProps.length; i++) {
                for(var j = 0; j < packedByAreasConnections[areaProps[i]].length; j++) {
                    var connection = packedByAreasConnections[areaProps[i]][j];
                    connection.item.style.zIndex = nextItemZIndex;

                    if(me._gridifier.hasItemBindedClone(connection.item)) {
                        var itemClone = me._gridifier.getItemClone(connection.item);
                        itemClone.style.zIndex = nextItemZIndex - 1;
                    }

                    nextItemZIndex++;
                }
            }
        }

        if(executeUpdatesTimeout != null) {
            clearTimeout(executeUpdatesTimeout);
            executeUpdatesTimeout = null;
        }

        executeUpdatesTimeout = setTimeout(function() {
            executeUpdates();
        }, 100);
    });

    this._areZIndexesUpdatesBinded = true;
}