Gridifier.HorizontalGrid.ConnectionsSorter = function(connections, settings, guid) {
    var me = this;

    this._connections = null;
    this._settings = null;
    this._guid = null;

    this._css = {
    };

    this._construct = function() {
        me._connections = connections;
        me._settings = settings;
        me._guid = guid;
    };

    this._bindEvents = function() {
        ;
    };

    this._unbindEvents = function() {
        ;
    };

    this.destruct = function() {
        me._unbindEvents();
    };

    this._construct();
    return this;
}

Gridifier.HorizontalGrid.ConnectionsSorter.prototype.sortConnectionsPerReappend = function(connections) {
    var me = this;

    if(this._settings.isDisabledSortDispersion()) {
        connections.sort(function(firstConnection, secondConnection) {
            if(me._guid.getItemGUID(firstConnection.item) > me._guid.getItemGUID(secondConnection.item))
                return 1;

            return -1;
        });
    }
    else if(this._settings.isCustomSortDispersion() || 
            this._settings.isCustomAllEmptySpaceSortDispersion()) {
        if(this._settings.isDefaultAppend()) {
            connections.sort(function(firstConnection, secondConnection) {
                if(firstConnection.x1 == secondConnection.x1) {
                    if(firstConnection.y2 < secondConnection.y2)
                        return -1;
                    else 
                        return 1;
                }
                else {
                    if(firstConnection.x1 < secondConnection.x1)
                        return -1;
                    else
                        return 1;
                }
            });
        }
        else if(this._settings.isReversedAppend()) {
            connections.sort(function(firstConnection, secondConnection) {
                if(firstConnection.x1 == secondConnection.x1) {
                    if(firstConnection.y1 > secondConnection.y1)
                        return -1;
                    else
                        return 1;
                }
                else {
                    if(firstConnection.x1 < secondConnection.x1)
                        return -1;
                    else
                        return 1;
                }
            });
        }
    }

    return connections;
}