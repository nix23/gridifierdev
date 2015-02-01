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

Gridifier.SizesTransformer.ItemsToReappendFinder.prototype.findAllOnSizesTransform = function(firstTransformedConnection) {
    var connectionsToReappend = [];
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
        // @todo -> custom sort dispersion should have custom y1(VG) and custom x1(HG)
        else if(this._settings.isCustomSortDispersion() || this._settings.isCustomAllEmptySpaceSortDispersion() ||
                this._settings.isNoIntersectionsStrategy()) {
            if(connections[i].y2 >= firstTransformedConnection.y1) {
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
        firstConnectionToReappend: sortedConnectionsToReappend[0]
    };
}