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
        // When noIntersection strategy is use, we should reappend all row items.(Height of 
        // transformed item may become smaller).
        // When customSortDispersion is used, element with bigger guid can be above.(Depending 
        // on the dispersion param).
        else if(this._settings.isCustomSortDispersion() || this._settings.isCustomAllEmptySpaceSortDispersion() ||
                this._settings.isNoIntersectionsStrategy()) {
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
    }

    if(this._settings.isCustomSortDispersion() || this._settings.isCustomAllEmptySpaceSortDispersion() ||
        this._settings.isNoIntersectionsStrategy()) {
        this._addAllIntersectedConnectionsBy(connectionsToReappend);
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

/*
  Any of connectionsToReappend can be recollected in such way, that after recollection it will produce a gap in
  such way, that selected reappend algorithm will not create connector in that item position. So, we should
  reappend also all connections, that are intersected by connectionsToReappend.
  (In all next level on collisions every connection will have some connection around, at which required connector
   will be created and shifted. If somehow this 'gap' will appear on some layout, user can call 'triggerResize'
   to ensure, that all transformed items will be correctly reappended).
 */
Gridifier.SizesTransformer.ItemsToReappendFinder.prototype._addAllIntersectedConnectionsBy = function(connectionsToReappend) {
    var connections = this._connections.get();

    for(var i = 0; i < connections.length; i++) {
        var isIntersectingCurrentConnection = false;

        for(var j = 0; j < connectionsToReappend.length; j++) {
            if(this._settings.isVerticalGrid())
                var intersectionCond = connectionsToReappend[j].y1 <= connections[i].y2;
            else if(this._settings.isHorizontalGrid())
                var intersectionCond = connectionsToReappend[j].x1 <= connections[i].x2;

            if(intersectionCond) {
                connectionsToReappend.push(connections[i]);
                isIntersectingCurrentConnection = true;
                break;
            }
        }

        if(isIntersectingCurrentConnection) {
            connections.splice(i, 1);
            i--;
        }
    }
}