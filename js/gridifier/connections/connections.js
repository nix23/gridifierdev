Gridifier.Connections = function(gridifier,
                                 connections,
                                 guid,
                                 connectionsSorter,
                                 sizesResolverManager) {
    var me = this;

    this._gridifier = null;
    this._connections = null;
    this._guid = null;
    this._sizesTransformer = null;
    this._connectionsSorter = null;
    this._sizesResolverManager = null;
    this._connectedItemMarker = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._connections = connections;
        me._guid = guid;
        me._connectionsSorter = connectionsSorter;
        me._sizesResolverManager = sizesResolverManager;
        me._connectedItemMarker = new Gridifier.ConnectedItemMarker();
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

Gridifier.Connections.prototype.getMaxX2 = function() {
    var connections = this._connections.get();

    if(connections.length == 0)
        return 0;
    
    var maxX2 = 0;
    for(var i = 0; i < connections.length; i++) {
        if(connections[i].x2 > maxX2)
            maxX2 = connections[i].x2;
    }

    return maxX2;
}

Gridifier.Connections.prototype.getMaxY2 = function() {
    var connections = this._connections.get();

    if(connections.length == 0)
        return 0;

    var maxY2 = 0;
    for(var i = 0; i < connections.length; i++) {
        if(connections[i].y2 > maxY2)
            maxY2 = connections[i].y2;
    }

    return maxY2;
}

Gridifier.Connections.prototype.setSizesTransformerInstance = function(sizesTransformer) {
    this._sizesTransformer = sizesTransformer;
}

Gridifier.Connections.prototype.findConnectionByItem = function(item, disableWasItemFoundValidation) {
    var connections = this._connections.get();

    if(!disableWasItemFoundValidation) {
        if(connections.length == 0)
            new Gridifier.Error(Gridifier.Error.ERROR_TYPES.CONNECTIONS.NO_CONNECTIONS);
    }

    var itemGUID = this._guid.getItemGUID(item);
    var connectionItem = null;
    for(var i = 0; i < connections.length; i++) {
        if(itemGUID == connections[i].itemGUID) {
            connectionItem = connections[i];
            break;
        }
    }

    if(connectionItem == null) {
        if(!this._sizesTransformer.isTransformerQueueEmpty()) {
            var queuedConnections = this._sizesTransformer.getQueuedConnectionsPerTransform();
            for(var i = 0; i < queuedConnections.length; i++) {
                if(itemGUID == queuedConnections[i].itemGUID) {
                    connectionItem = queuedConnections[i];
                    break;
                }
            }
        }
    }

    if(!disableWasItemFoundValidation) {
        if(connectionItem == null) {
            new Gridifier.Error(
                Gridifier.Error.ERROR_TYPES.CONNECTIONS.CONNECTION_BY_ITEM_NOT_FOUND,
                {item: item, connections: connections}
            );
        }
    }

    return connectionItem;
}

Gridifier.Connections.prototype.remapAllItemGUIDS = function() {
    this._guid.reinit();

    var connections = this._connectionsSorter.sortConnectionsPerReappend(this._connections.get());
    for(var i = 0; i < connections.length; i++) {
        var newConnectionItemGUID = this._guid.markNextAppendedItem(connections[i].item);
        connections[i].itemGUID = newConnectionItemGUID;
    }
}

Gridifier.Connections.prototype.remapAllItemGUIDSInSortedConnections = function(connections) {
    for(var i = 0; i < connections.length; i++) {
        var newConnectionItemGUID = this._guid.markNextAppendedItem(connections[i].item);
        connections[i].itemGUID = newConnectionItemGUID;
    }
}

Gridifier.Connections.prototype.getConnectionsByItemGUIDS = function(itemGUIDS) {
    var connections = this._connections.get();
    var foundConnections = [];

    for(var i = 0; i < connections.length; i++) {
        for(var j = 0; j < itemGUIDS.length; j++) {
            if(connections[i].itemGUID == itemGUIDS[j]) {
                foundConnections.push(connections[i]);
                break;
            }
        }
    }

    return foundConnections;
}

Gridifier.Connections.prototype.createItemConnection = function(item, itemConnectionCoords) {
    var connection = itemConnectionCoords;

    itemConnectionCoords.x1 = Dom.toFixed(itemConnectionCoords.x1, 2);
    itemConnectionCoords.x2 = Dom.toFixed(itemConnectionCoords.x2, 2);
    itemConnectionCoords.y1 = Dom.toFixed(itemConnectionCoords.y1, 2);
    itemConnectionCoords.y2 = Dom.toFixed(itemConnectionCoords.y2, 2);

    connection.item = item;
    connection.itemGUID = Dom.toInt(this._guid.getItemGUID(item));

    if(!connection.hasOwnProperty("horizontalOffset"))
        connection.horizontalOffset = 0;
    if(!connection.hasOwnProperty("verticalOffset"))
        connection.verticalOffset = 0;
    if(!connection.hasOwnProperty(Gridifier.SizesTransformer.RESTRICT_CONNECTION_COLLECT))
        connection[Gridifier.SizesTransformer.RESTRICT_CONNECTION_COLLECT] = false;

    if(!this._connectedItemMarker.isItemConnected(item))
        this._connectedItemMarker.markItemAsConnected(item);

    return connection;
}

Gridifier.Connections.prototype.syncConnectionParams = function(connectionsData) {
    var connections = this._connections.get();

    for(var i = 0; i < connectionsData.length; i++) {
        for(var j = 0; j < connections.length; j++) {
            if(connections[j].itemGUID == connectionsData[i].itemGUID) {
                var restrictCollect = Gridifier.SizesTransformer.RESTRICT_CONNECTION_COLLECT;

                connections[j][restrictCollect] = connectionsData[i][restrictCollect];
                connections[j].verticalOffset = connectionsData[i].verticalOffset;
                connections[j].horizontalOffset = connectionsData[i].horizontalOffset;
                connections[j].x1 = connectionsData[i].x1;
                connections[j].x2 = connectionsData[i].x2;
                connections[j].y1 = connectionsData[i].y1;
                connections[j].y2 = connectionsData[i].y2;

                break;
            }
        }
    }
}

Gridifier.Connections.prototype.getMinConnectionWidth = function() {
    var connections = this._connections.get();

    if(connections.length == 0)
        return 0;

    var me = this;
    var gridX2 = this._gridifier.getGridX2();

    // Sometimes fast dragging breaks coordinates of some connections.
    // In such cases we should recalculate connection item width.
    var getConnectionWidth = function(i) {
        if(connections[i].x1 >= connections[i].x2 || connections[i].x1 < 0
            || connections[i].x2 > gridX2) {
            var connectionWidth = me._sizesResolverManager.outerWidth(connections[i].item, true);
        }
        else {
            var connectionWidth = connections[i].x2 - connections[i].x1 + 1;
        }

        return connectionWidth;
    };

    var minConnectionWidth = getConnectionWidth(0);
    for(var i = 1; i < connections.length; i++) {
        var connectionWidth = getConnectionWidth(i);
        if(connectionWidth < minConnectionWidth)
            minConnectionWidth = connectionWidth;
    }

    return minConnectionWidth;
}

Gridifier.Connections.prototype.getMinConnectionHeight = function() {
    var connections = this._connections.get();

    if(connections.length == 0)
        return 0;

    var me = this;
    var gridY2 = this._gridifier.getGridY2();

    // Sometimes fast dragging breaks coordinates of some connections.
    // In such cases we should recalculate connection item height.
    var getConnectionHeight = function(i) {
        if(connections[i].y1 >= connections[i].y2 || connections[i].y1 < 0
            || connections[i].y2 > gridY2) {
            var connectionHeight = me._sizesResolverManager.outerHeight(connections[i].item, true);
        }
        else {
            var connectionHeight = connections[i].y2 - connections[i].y1 + 1;
        }

        return connectionHeight;
    };

    var minConnectionHeight = getConnectionHeight(0);
    for(var i = 1; i < connections.length; i++) {
        var connectionHeight = getConnectionHeight(i);
        if(connectionHeight < minConnectionHeight)
            minConnectionHeight = connectionHeight;
    }

    return minConnectionHeight;
}


Gridifier.Connections.prototype.isAnyConnectionItemGUIDSmallerThan = function(comparableConnections, 
                                                                              item) {
    var connectionItemGUID = this._guid.getItemGUID(item);

    for(var i = 0; i < comparableConnections.length; i++) {
        var comparableConnectionItemGUID = this._guid.getItemGUID(comparableConnections[i].item);
        if(comparableConnectionItemGUID < connectionItemGUID)
            return true;
    }

    return false;
}

Gridifier.Connections.prototype.isAnyConnectionItemGUIDBiggerThan = function(comparableConnections,
                                                                             item) {
    var connectionItemGUID = this._guid.getItemGUID(item);

    for(var i = 0; i < comparableConnections.length; i++) {
        var comparableConnectionItemGUID = this._guid.getItemGUID(comparableConnections[i].item);
        if(comparableConnectionItemGUID > connectionItemGUID)
            return true;
    }

    return false;
}