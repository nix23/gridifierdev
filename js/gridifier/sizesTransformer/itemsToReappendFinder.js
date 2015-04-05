Gridifier.SizesTransformer.ItemsToReappendFinder = function(connections,
                                                            connectionsSorter,
                                                            settings) {
    var me = this;

    me._connections = null;
    me._connectionsSorter = null;
    me._settings = null;

    this._css = {
    };

    this._construct = function() {
        me._connections = connections;
        me._connectionsSorter = connectionsSorter;
        me._settings = settings;
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

Gridifier.SizesTransformer.ItemsToReappendFinder.prototype.findAllOnSizesTransform = function(connectionsToReappend,
                                                                                              firstTransformedConnection) {
    var connections = this._connections.get();

    for(var i = 0; i < connections.length; i++) {
        if(connections[i][Gridifier.SizesTransformer.RESTRICT_CONNECTION_COLLECT])
            continue;

        // Default or no intersections strategy check is required here, because we are
        // reappending items from random position. In such case we should reappend all
        // row items in NIS mode.
        if(this._settings.isDisabledSortDispersion() && this._settings.isDefaultIntersectionStrategy()) {
            if(connections[i].itemGUID >= firstTransformedConnection.itemGUID) {
                connectionsToReappend.push(connections[i]);
                connections.splice(i, 1);
                i--;
            }
        }
        // When noIntersection strategy is use, we should reappend all row/col items.(Height/Width of
        // transformed item may become smaller).
        else if(this._settings.isNoIntersectionsStrategy()) {
            if(this._settings.isVerticalGrid()) {
                var condition = connections[i].y2 >= firstTransformedConnection.y1;
            }
            else if(this._settings.isHorizontalGrid()) {
                var condition = connections[i].x2 >= firstTransformedConnection.x1;
            }

            if(condition) {
                connectionsToReappend.push(connections[i]);
                connections.splice(i, 1);
                i--;
            }
        }
        else if(this._settings.isCustomSortDispersion() || this._settings.isCustomAllEmptySpaceSortDispersion()) {
            if(this._settings.isVerticalGrid()) {
                if(this._settings.isDefaultAppend()) {
                    var condition = (connections[i].y1 > firstTransformedConnection.y1 ||
                                     (connections[i].y1 == firstTransformedConnection.y1 &&
                                      connections[i].x1 <= firstTransformedConnection.x2));
                }
                else if(this._settings.isReversedAppend()) {
                    var condition = (connections[i].y1 > firstTransformedConnection.y1 ||
                                     (connections[i].y1 == firstTransformedConnection.y1 &&
                                      connections[i].x1 >= firstTransformedConnection.x1));
                }
            }
            else if(this._settings.isHorizontalGrid()) {
                if(this._settings.isDefaultAppend()) {
                    var condition = (connections[i].x1 > firstTransformedConnection.x1 ||
                                     (connections[i].x1 == firstTransformedConnection.x1 &&
                                      connections[i].y1 >= firstTransformedConnection.y1));
                }
                else if(this._settings.isReversedAppend()) {
                    var condition = (connections[i].x1 > firstTransformedConnection.x1 ||
                                     (connections[i].x1 == firstTransformedConnection.x1 &&
                                      connections[i].y1 <= firstTransformedConnection.y2));
                }
            }

            if(condition) {
                connectionsToReappend.push(connections[i]);
                connections.splice(i, 1);
                i--;
            }
        }
    }

    var sortedConnectionsToReappend = this._connectionsSorter.sortConnectionsPerReappend(
        connectionsToReappend
    );

    var itemsToReappend = [];
    for(var i = 0; i < sortedConnectionsToReappend.length; i++) {
        itemsToReappend.push(sortedConnectionsToReappend[i].item);
    }

    return {
        itemsToReappend: itemsToReappend,
        connectionsToReappend: connectionsToReappend,
        firstConnectionToReappend: sortedConnectionsToReappend[0]
    };
}