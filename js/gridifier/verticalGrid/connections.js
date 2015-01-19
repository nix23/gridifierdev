Gridifier.VerticalGrid.Connections = function(guid, settings) {
    var me = this;

    this._guid = null;
    this._settings = null;

    this._connections = [];
    this._ranges = null;

    this._lastRowVerticallyExpandedConnections = null;

    this._css = {
    };

    this._construct = function() {
        me._guid = guid;
        me._settings = settings;
        me._ranges = new Gridifier.VerticalGrid.ConnectionsRanges(me);
        me._ranges.init();
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

Gridifier.VerticalGrid.Connections.prototype.attachConnectionToRanges = function(connection) {
    this._ranges.attachConnection(connection, this._connections.length - 1);
}

Gridifier.VerticalGrid.Connections.prototype.reinitRanges = function() {
    this._ranges.init();
}

Gridifier.VerticalGrid.Connections.prototype.getAllHorizontallyIntersectedAndUpperConnections = function(connector) {
    //return this._ranges.getAllConnectionsFromIntersectedAndUpperRanges(connector.y);
    return this._ranges.getAllConnectionsFromIntersectedAndUpperRanges(connector.y);
}

Gridifier.VerticalGrid.Connections.prototype.getAllHorizontallyIntersectedConnections = function(connector) {
    return this._ranges.getAllConnectionsFromIntersectedRange(connector.y);
}

Gridifier.VerticalGrid.Connections.prototype.getAllHorizontallyIntersectedAndLowerConnections = function(connector) {
    return this._ranges.getAllConnectionsFromIntersectedAndLowerRanges(connector.y);
}

Gridifier.VerticalGrid.Connections.prototype.mapAllIntersectedAndLowerConnectionsPerEachConnector = function(sortedConnectors) {
    return this._ranges.mapAllIntersectedAndLowerConnectionsPerEachConnector(sortedConnectors);
}

Gridifier.VerticalGrid.Connections.prototype.mapAllIntersectedAndUpperConnectionsPerEachConnector = function(sortedConnectors) {
    return this._ranges.mapAllIntersectedAndUpperConnectionsPerEachConnector(sortedConnectors);
}

Gridifier.VerticalGrid.Connections.prototype.getLastRowVerticallyExpandedConnections = function() {
    return this._lastRowVerticallyExpandedConnections;
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
    if(!connection.hasOwnProperty("verticalOffset"))
        connection.verticalOffset = 0; // Used with noIntersections strategy
    if(!connection.hasOwnProperty("isDragged"))
        connection.isDragged = false;

    if(this._settings.isNoIntersectionsStrategy()) {
        connection.itemHeightWithMargins = SizesResolverManager.outerHeight(item, true);
    }

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

Gridifier.VerticalGrid.Connections.prototype.getMinConnectionWidth = function() {
    if(this._connections.length == 0)
        return 0;

    var minConnectionWidth = this._connections[0].x2 - this._connections[0].x1 + 1;
    for(var i = 1; i < this._connections.length; i++) {
        var connectionWidth = this._connections[i].x2 - this._connections[i].x1 + 1;
        if(connectionWidth < minConnectionWidth)
            minConnectionWidth = connectionWidth;
    }

    return minConnectionWidth;
}

Gridifier.VerticalGrid.Connections.prototype.getMinConnectionHeight = function() {
    if(this._connections.length == 0)
        return 0;

    var minConnectionHeight = this._connections[0].y2 - this._connections[0].y1 + 1;
    for(var i = 1; i < this._connections.length; i++) {
        var connectionHeight = this._connections[i].y2 - this._connections[i].y1 + 1;
        if(connectionHeight < minConnectionHeight)
            minConnectionHeight = connectionHeight;
    }

    return minConnectionHeight;
}

Gridifier.VerticalGrid.Connections.prototype.getAllConnectionsBelowY = function(y) {
    var connections = [];
    for(var i = 0; i < this._connections.length; i++) {
        if(this._connections[i].y1 - 10000 > y) // @todo -> Delete, for testing
        //if(this._connections[i].y1 > y)
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

Gridifier.VerticalGrid.Connections.prototype.getMostTallFromAllVerticallyIntersectedConnections = function(itemCoords) {
    var me = this;
    var mostTallVerticallyIntersectedConnection = null;

    for(var i = 0; i < this._connections.length; i++) {
        var maybeIntersectableConnection = this._connections[i];
        var isAbove = (itemCoords.y1 < maybeIntersectableConnection.y1 && itemCoords.y2 < maybeIntersectableConnection.y1);
        var isBelow = (itemCoords.y1 > maybeIntersectableConnection.y2 && itemCoords.y2 > maybeIntersectableConnection.y2);

        if(!isAbove && !isBelow) {
            if(mostTallVerticallyIntersectedConnection == null)
                mostTallVerticallyIntersectedConnection = maybeIntersectableConnection;
            else {
                var maybeIntersectableConnectionHeight = Math.abs(
                    maybeIntersectableConnection.y2 - maybeIntersectableConnection.y1
                );
                var mostTallVerticallyIntersectedConnectionHeight = Math.abs(
                    mostTallVerticallyIntersectedConnection.y2 - mostTallVerticallyIntersectedConnection.y1
                );

                if(maybeIntersectableConnectionHeight > mostTallVerticallyIntersectedConnectionHeight)
                    mostTallVerticallyIntersectedConnection = maybeIntersectableConnection;
            }
        }
    }

    return mostTallVerticallyIntersectedConnection;
}

Gridifier.VerticalGrid.Connections.prototype.getAllVerticallyIntersectedConnections = function(itemCoords) {
    var me = this;
    var verticallyIntersectedConnections = [];

    for(var i = 0; i < this._connections.length; i++) {
        var maybeIntersectableConnection = this._connections[i];
        var isAbove = (itemCoords.y1 < maybeIntersectableConnection.y1 && itemCoords.y2 < maybeIntersectableConnection.y1);
        var isBelow = (itemCoords.y1 > maybeIntersectableConnection.y2 && itemCoords.y2 > maybeIntersectableConnection.y2);

        if(!isAbove && !isBelow) 
            verticallyIntersectedConnections.push(maybeIntersectableConnection);
    }

    return verticallyIntersectedConnections;
}

Gridifier.VerticalGrid.Connections.prototype.expandVerticallyAllRowConnectionsToMostTall = function(newConnection) {
    var mostTallConnection = this.getMostTallFromAllVerticallyIntersectedConnections(newConnection);
    if(mostTallConnection == null)
        return;
    
    var rowConnectionsToExpand = this.getAllVerticallyIntersectedConnections(newConnection);
    this._lastRowVerticallyExpandedConnections = rowConnectionsToExpand;

    for(var i = 0; i < rowConnectionsToExpand.length; i++) {
        rowConnectionsToExpand[i].y1 = mostTallConnection.y1;
        rowConnectionsToExpand[i].y2 = mostTallConnection.y2;

        if(this._settings.isVerticalGridTopAlignmentType())
            rowConnectionsToExpand[i].verticalOffset = 0;
        else if(this._settings.isVerticalGridCenterAlignmentType()) {
            var y1 = rowConnectionsToExpand[i].y1;
            var y2 = rowConnectionsToExpand[i].y2;
            var itemHeight = rowConnectionsToExpand[i].itemHeightWithMargins - 1;
            rowConnectionsToExpand[i].verticalOffset = Math.round(Math.abs(y2 - y1) / 2) - Math.round(itemHeight / 2);
        }
        else if(this._settings.isVerticalGridBottomAlignmentType()) {
            var y1 = rowConnectionsToExpand[i].y1;
            var y2 = rowConnectionsToExpand[i].y2;
            var itemHeight = rowConnectionsToExpand[i].itemHeightWithMargins - 1;
            rowConnectionsToExpand[i].verticalOffset = Math.abs(y2 - y1) - itemHeight;
        }
    }
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

    var increaseVerticalPositionBy = Math.round(Math.abs(newConnection.y1));
    this._lastVerticalIncreaseOfEachConnection = increaseVerticalPositionBy;
    newConnection.y2 = Math.abs(newConnection.y1 - newConnection.y2);
    newConnection.y1 = 0;

    for(var i = 0; i < this._connections.length; i++) {
        if(newConnection.itemGUID == this._connections[i].itemGUID)
            continue;

        this._connections[i].y1 += increaseVerticalPositionBy;
        this._connections[i].y2 += increaseVerticalPositionBy;
    }

    for(var i = 0; i < connectors.length; i++)
        connectors[i].y += increaseVerticalPositionBy;

    this._ranges.shiftAllRangesBy(increaseVerticalPositionBy);
    this._ranges.createPrependedRange(newConnection.y1, newConnection.y2);

    return true;
}