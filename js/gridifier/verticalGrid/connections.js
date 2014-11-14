Gridifier.VerticalGrid.Connections = function(guid) {
    var me = this;

    this._guid = guid;

    this._connections = [];

    this._css = {
    };

    this._construct = function() {
        me._guid = guid;
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

Gridifier.VerticalGrid.Connections.prototype.get = function() {
    return this._connections;
}

Gridifier.VerticalGrid.Connections.prototype.count = function() {
    return this._connections.length;
}

Gridifier.VerticalGrid.Connections.prototype.add = function(item, itemConnectionCoords) {
    var connection = itemConnectionCoords;
    connection.item = item;
    connection.itemGUID = Dom.toInt(this._guid.getItemGUID(item));

    this._connections.push(connection);
    return connection;
}

Gridifier.VerticalGrid.Connections.prototype.removeConnection = function(connection) {
    for(var i = 0; i < this._connections.length; i++) {
        if(this._guid.getItemGUID(connection.item) == this._guid.getItemGUID(this._connections[i].item)) {
            this._connections.splice(i, 1);
            return;
        }
    }
}

Gridifier.VerticalGrid.Connections.prototype.getAllConnectionsBelowY = function(y) {
    var connections = [];
    for(var i = 0; i < this._connections.length; i++) {
        if(this._connections[i].y1 > y)
            connections.push(this._connections[i]);
    }

    return connections;
}

Gridifier.VerticalGrid.Connections.prototype.isAnyConnectionItemGUIDSmallerThan = function(comparableConnections, 
                                                                                           item) {
    var connectionItemGUID = this._guid.getItemGUID(item);

    for(var i = 0; i < comparableConnections.length; i++) {
        var comparableConnectionItemGUID = this._guid.getItemGUID(comparableConnections[i].item);
        if(comparableConnectionItemGUID < connectionItemGUID)
            return true;
    }

    return false;
}

Gridifier.VerticalGrid.Connections.prototype.getAllConnectionsAboveY = function(y) {
    var connections = [];
    for(var i = 0; i < this._connections.length; i++) {
        if(this._connections[i].y2 < y)
            connections.push(this._connections[i]);
    }

    return connections;
}

Gridifier.VerticalGrid.Connections.prototype.isAnyConnectionItemGUIDBiggerThan = function(comparableConnections,
                                                                                          item) {
    var connectionItemGUID = this._guid.getItemGUID(item);

    for(var i = 0; i < comparableConnections.length; i++) {
        var comparableConnectionItemGUID = this._guid.getItemGUID(comparableConnections[i].item);
        if(comparableConnectionItemGUID > connectionItemGUID)
            return true;
    }

    return false;
}

Gridifier.VerticalGrid.Connections.prototype.isIntersectingMoreThanOneConnectionItemVertically = function(itemCoords) {
    var me = this;
    var intersectedConnectionItemIndexes = [];

    var isIntersectingVerticallyAnyFromAlreadyIntersectedItems = function(connection) {
        if(intersectedConnectionItemIndexes.length == 0)
            return false;

        for(var i = 0; i < intersectedConnectionItemIndexes.length; i++) {
            var maybeIntersectableConnection = me._connections[intersectedConnectionItemIndexes[i]];
            var isAbove = (connection.y1 < maybeIntersectableConnection.y1 && connection.y2 < maybeIntersectableConnection.y1);
            var isBelow = (connection.y1 > maybeIntersectableConnection.y1 && connection.y2 > maybeIntersectableConnection.y2);

            if(!isAbove && !isBelow)
                return true;
        }

        return false;
    };

    var intersectedConnectionItemsCount = 0;
    for(var i = 0; i < this._connections.length; i++) {
        var maybeIntersectableConnection = this._connections[i];
        var isAbove = (itemCoords.y1 < maybeIntersectableConnection.y1 && itemCoords.y2 < maybeIntersectableConnection.y1);
        var isBelow = (itemCoords.y1 > maybeIntersectableConnection.y2 && itemCoords.y2 > maybeIntersectableConnection.y2);

        if(!isAbove && !isBelow && !isIntersectingVerticallyAnyFromAlreadyIntersectedItems(maybeIntersectableConnection)) {
            intersectedConnectionItemIndexes.push(i);
            intersectedConnectionItemsCount++;
        }
    }

    return intersectedConnectionItemsCount > 1;
}

Gridifier.VerticalGrid.Connections.prototype.getLastPrependedConnection = function() {
    var lastPrependedConnection = null;

    for(var i = 0; i < this._connections.length; i++) {
        if(this._guid.wasItemPrepended(this._connections[i].itemGUID)) {
            if(lastPrependedConnection == null)
                lastPrependedConnection = this._connections[i];
            else {
                if(this._connections[i].itemGUID < lastPrependedConnection.itemGUID)
                    lastPrependedConnection = this._connections[i];
            }
        }
    }

    return lastPrependedConnection;
}

Gridifier.VerticalGrid.Connections.prototype.getMaxYFromAllConnections = function() {
    var maxY = 0;
    for(var i = 0; i < this._connections.length; i++) {
        if(this._connections[i].y2 > maxY)
            maxY = this._connections[i].y2;
    }

    return maxY;
}

Gridifier.VerticalGrid.Connections.prototype.normalizeVerticalPositionsOfAllConnectionsAfterPrepend = function(newConnection,
                                                                                                               connectors) {
    if(newConnection.y1 >= 0)
        return false;

    var increaseVerticalPositionBy = Math.round(Math.abs(newConnection.y1)) - 1;
    newConnection.y2 = Math.abs(newConnection.y1 - newConnection.y2);
    newConnection.y1 = 0;

    for(var i = 0; i < this._connections.length; i++) {
        if(newConnection.itemGUID == this._connections[i].itemGUID)
            continue;

        this._connections[i].y1 += increaseVerticalPositionBy + 1;
        this._connections[i].y2 += increaseVerticalPositionBy + 1;
    }

    for(var i = 0; i < connectors.length; i++)
        connectors[i].y += increaseVerticalPositionBy + 1;

    return true;
}