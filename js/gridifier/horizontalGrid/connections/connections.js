Gridifier.HorizontalGrid.Connections = function(gridifier, guid, settings) {
    var me = this;

    this._gridifier = null;
    this._guid = null;
    this._settings = null;

    this._itemCoordsExtractor = null;

    this._connections = [];
    this._ranges = null;
    this._sorter = null;

    this._lastColHorizontallyExpandedConnections = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._guid = guid;
        me._settings = settings;
        me._ranges = new Gridifier.HorizontalGrid.ConnectionsRanges(me);
        me._ranges.init();
        me._sorter = new Gridifier.HorizontalGrid.ConnectionsSorter(
            me, me._settings, me._guid
        );
        me._itemCoordsExtractor = new Gridifier.HorizontalGrid.ItemCoordsExtractor(
            me._gridifier
        );
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

Gridifier.HorizontalGrid.Connections.prototype.attachConnectionToRanges = function(connection) {
    this._ranges.attachConnection(connection, this._connections.length - 1);
}

Gridifier.HorizontalGrid.Connections.prototype.reinitRanges = function() {
    this._ranges.init();
}

Gridifier.HorizontalGrid.Connections.prototype.getAllVerticallyIntersectedAndLeftConnections = function(connector) {
    //return this._ranges.getAllConnectionsFromIntersectedAndUpperRanges(connector.y);
    return this._ranges.getAllConnectionsFromIntersectedAndLeftRanges(connector.x);
}

Gridifier.HorizontalGrid.Connections.prototype.getAllVerticallyIntersectedConnections = function(connector) {
    return this._ranges.getAllConnectionsFromIntersectedRange(connector.x);
}

Gridifier.HorizontalGrid.Connections.prototype.getAllVerticallyIntersectedAndRightConnections = function(connector) {
    return this._ranges.getAllConnectionsFromIntersectedAndRightRanges(connector.x);
}

Gridifier.HorizontalGrid.Connections.prototype.mapAllIntersectedAndRightConnectionsPerEachConnector = function(sortedConnectors) {
    return this._ranges.mapAllIntersectedAndRightConnectionsPerEachConnector(sortedConnectors);
}

Gridifier.HorizontalGrid.Connections.prototype.mapAllIntersectedAndLeftConnectionsPerEachConnector = function(sortedConnectors) {
    return this._ranges.mapAllIntersectedAndLeftConnectionsPerEachConnector(sortedConnectors);
}

Gridifier.HorizontalGrid.Connections.prototype.getLastColHorizontallyExpandedConnections = function() {
    return this._lastColHorizontallyExpandedConnections;
}

Gridifier.HorizontalGrid.Connections.prototype.get = function() {
    return this._connections;
}

Gridifier.HorizontalGrid.Connections.prototype.count = function() {
    return this._connections.length;
}

Gridifier.HorizontalGrid.Connections.prototype.restore = function(connections) {
    this._connections = this._connections.concat(connections);
}

Gridifier.HorizontalGrid.Connections.prototype.remapAllItemGUIDS = function() {
    this._guid.reinit();

    var connections = this._sorter.sortConnectionsPerReappend(this._connections);
    for(var i = 0; i < connections.length; i++) {
        var newConnectionItemGUID = this._guid.markNextAppendedItem(connections[i].item);
        connections[i].itemGUID = newConnectionItemGUID;
    }
}

Gridifier.HorizontalGrid.Connections.prototype.add = function(item, itemConnectionCoords) {
    var connection = itemConnectionCoords;
    connection.item = item;
    connection.itemGUID = Dom.toInt(this._guid.getItemGUID(item));
    // @todo -> Move verticalOffset ot const???
    if(!connection.hasOwnProperty("horizontalOffset"))
        connection.horizontalOffset = 0; // Used with noIntersections strategy
    if(!connection.hasOwnProperty(Gridifier.SizesTransformer.RESTRICT_CONNECTION_COLLECT))
        connection[Gridifier.SizesTransformer.RESTRICT_CONNECTION_COLLECT] = false;
    
    // if(this._settings.isNoIntersectionsStrategy()) {
    //     connection.itemWidthWithMargins = SizesResolverManager.outerWidth(item, true);
    // }

    this._connections.push(connection);
    return connection;
}

Gridifier.HorizontalGrid.Connections.prototype.removeConnection = function(connection) {
    for(var i = 0; i < this._connections.length; i++) {
        if(this._guid.getItemGUID(connection.item) == this._guid.getItemGUID(this._connections[i].item)) {
            this._connections.splice(i, 1);
            return;
        }
    }
}

Gridifier.HorizontalGrid.Connections.prototype.getConnectionsByItemGUIDS = function(itemGUIDS) {
    var connections = [];

    for(var i = 0; i < this._connections.length; i++) {
        for(var j = 0; j < itemGUIDS.length; j++) {
            if(this._connections[i].itemGUID == itemGUIDS[j]) {
                connections.push(this._connections[i]);
                break;
            }
        }
    }

    return connections;
}

Gridifier.HorizontalGrid.Connections.prototype.syncConnectionParams = function(connectionsData) {
    for(var i = 0; i < connectionsData.length; i++) {
        for(var j = 0; j < this._connections.length; j++) {
            if(this._connections[j].itemGUID == connectionsData[i].itemGUID) {
                this._connections[j].horizontalOffset = connectionsData[i].horizontalOffset;
                this._connections[j].x1 = connectionsData[i].x1;
                this._connections[j].x2 = connectionsData[i].x2;
                this._connections[j].y1 = connectionsData[i].y1;
                this._connections[j].y2 = connectionsData[i].y2;

                // if(this._settings.isNoIntersectionsStrategy()) {
                //     this._connections[j].itemWidthWithMargins = connectionsData[i].itemWidthWithMargins;
                // }

                break;
            }
        }
    }
}

Gridifier.HorizontalGrid.Connections.prototype.getMinConnectionWidth = function() {
    if(this._connections.length == 0)
        return 0;

    var me = this;
    var gridX2 = this._gridifier.getGridX2();

    // Sometimes fast dragging breaks coordinates of some connections.
    // In such cases we should recalculate connection item width.
    var getConnectionWidth = function(i) {
        if(me._connections[i].x1 >= me._connections[i].x2 || me._connections[i].x1 < 0
            || me._connections[i].x2 > gridX2) {
            var connectionWidth = SizesResolverManager.outerWidth(me._connections[i].item, true);
        }
        else {
            var connectionWidth = me._connections[i].x2 - me._connections[i].x1 + 1;
        }

        return connectionWidth;
    };

    var minConnectionWidth = getConnectionWidth(0);
    for(var i = 1; i < this._connections.length; i++) {
        var connectionWidth = getConnectionWidth(i);
        if(connectionWidth < minConnectionWidth)
            minConnectionWidth = connectionWidth;
    }

    return minConnectionWidth;
}

Gridifier.HorizontalGrid.Connections.prototype.getMinConnectionHeight = function() {
    if(this._connections.length == 0)
        return 0;

    var me = this;
    var gridY2 = this._gridifier.getGridY2();

    // Sometimes fast dragging breaks coordinates of some connections.
    // In such cases we should recalculate connection item height.
    var getConnectionHeight = function(i) {
        if(me._connections[i].y1 >= me._connections[i].y2 || me._connections[i].y1 < 0
            || me._connections[i].y2 > gridY2) {
            var connectionHeight = SizesResolverManager.outerHeight(me._connections[i].item, true);
        }
        else {
            var connectionHeight = me._connections[i].y2 - me._connections[i].y1 + 1;
        }

        return connectionHeight;
    };

    var minConnectionHeight = getConnectionHeight(0);
    for(var i = 1; i < this._connections.length; i++) {
        var connectionHeight = getConnectionHeight(i);
        if(connectionHeight < minConnectionHeight)
            minConnectionHeight = connectionHeight;
    }

    return minConnectionHeight;
}

Gridifier.HorizontalGrid.Connections.prototype.getAllConnectionsBehindX = function(x) {
    var connections = [];
    for(var i = 0; i < this._connections.length; i++) {
        if(this._connections[i].x1 - 10000 > x) // @todo -> Delete, for testing
        //if(this._connections[i].x1 > x)
            connections.push(this._connections[i]);
    }

    return connections;
}

Gridifier.HorizontalGrid.Connections.prototype.isAnyConnectionItemGUIDSmallerThan = function(comparableConnections, 
                                                                                             item) {
    var connectionItemGUID = this._guid.getItemGUID(item);

    for(var i = 0; i < comparableConnections.length; i++) {
        var comparableConnectionItemGUID = this._guid.getItemGUID(comparableConnections[i].item);
        if(comparableConnectionItemGUID < connectionItemGUID)
            return true;
    }

    return false;
}

Gridifier.HorizontalGrid.Connections.prototype.getAllConnectionsBeforeX = function(x) {
    var connections = [];
    for(var i = 0; i < this._connections.length; i++) {
        if(this._connections[i].x2 < x)
            connections.push(this._connections[i]);
    }

    return connections;
}

Gridifier.HorizontalGrid.Connections.prototype.isAnyConnectionItemGUIDBiggerThan = function(comparableConnections,
                                                                                            item) {
    var connectionItemGUID = this._guid.getItemGUID(item);

    for(var i = 0; i < comparableConnections.length; i++) {
        var comparableConnectionItemGUID = this._guid.getItemGUID(comparableConnections[i].item);
        if(comparableConnectionItemGUID > connectionItemGUID)
            return true;
    }

    return false;
}

Gridifier.HorizontalGrid.Connections.prototype.isIntersectingMoreThanOneConnectionItemHorizontally = function(itemCoords) {
    var me = this;
    var intersectedConnectionItemIndexes = [];
    
    var isIntersectingHorizontallyAnyFromAlreadyIntersectedItems = function(connection) {
        if(intersectedConnectionItemIndexes.length == 0)
            return false;

        for(var i = 0; i < intersectedConnectionItemIndexes.length; i++) {
            var maybeIntersectableConnection = me._connections[intersectedConnectionItemIndexes[i]];
            var isBefore = (connection.x1 < maybeIntersectableConnection.x1 && connection.x2 < maybeIntersectableConnection.x1);
            var isBehind = (connection.x1 > maybeIntersectableConnection.x2 && connection.x2 > maybeIntersectableConnection.x2);

            if(!isBefore && !isBehind)
                return true;
        }

        return false;
    };

    var intersectedConnectionItemsCount = 0;
    for(var i = 0; i < this._connections.length; i++) {
        var maybeIntersectableConnection = this._connections[i];
        var isBefore = (itemCoords.x1 < maybeIntersectableConnection.x1 && itemCoords.x2 < maybeIntersectableConnection.x1);
        var isBehind = (itemCoords.x1 > maybeIntersectableConnection.x2 && itemCoords.x2 > maybeIntersectableConnection.x2);

        if(!isBefore && !isBehind && !isIntersectingHorizontallyAnyFromAlreadyIntersectedItems(maybeIntersectableConnection)) {
            intersectedConnectionItemIndexes.push(i);
            intersectedConnectionItemsCount++;
        }
    }

    return intersectedConnectionItemsCount > 1;
}

Gridifier.HorizontalGrid.Connections.prototype.getMostWideFromAllHorizontallyIntersectedConnections = function(itemCoords) {
    var me = this;
    var mostWideHorizontallyIntersectedConnection = null;

    for(var i = 0; i < this._connections.length; i++) {
        var maybeIntersectableConnection = this._connections[i];
        var isBefore = (itemCoords.x1 < maybeIntersectableConnection.x1 && itemCoords.x2 < maybeIntersectableConnection.x1);
        var isBehind = (itemCoords.x1 > maybeIntersectableConnection.x2 && itemCoords.x2 > maybeIntersectableConnection.x2);

        if(!isBefore && !isBehind) {
            if(mostWideHorizontallyIntersectedConnection == null)
                mostWideHorizontallyIntersectedConnection = maybeIntersectableConnection;
            else {
                // @todo -> Should here add +1 in formulas?
                var maybeIntersectableConnectionWidth = Math.abs(
                    maybeIntersectableConnection.x2 - maybeIntersectableConnection.x1
                );
                var mostWideHorizontallyIntersectedConnectionWidth = Math.abs(
                    mostWideHorizontallyIntersectedConnection.x2 - mostWideHorizontallyIntersectedConnection.x1
                );

                if(maybeIntersectableConnectionWidth > mostWideHorizontallyIntersectedConnectionWidth)
                    mostWideHorizontallyIntersectedConnection = maybeIntersectableConnection;
            }
        }
    }

    return mostWideHorizontallyIntersectedConnection;
}

Gridifier.HorizontalGrid.Connections.prototype.getAllHorizontallyIntersectedConnections = function(itemCoords) {
    var me = this;
    var horizontallyIntersectedConnections = [];

    for(var i = 0; i < this._connections.length; i++) {
        var maybeIntersectableConnection = this._connections[i];
        var isBefore = (itemCoords.x1 < maybeIntersectableConnection.x1 && itemCoords.x2 < maybeIntersectableConnection.x1);
        var isBehind = (itemCoords.x1 > maybeIntersectableConnection.x2 && itemCoords.x2 > maybeIntersectableConnection.x2);

        if(!isBefore && !isBehind) 
            horizontallyIntersectedConnections.push(maybeIntersectableConnection);
    }

    return horizontallyIntersectedConnections;
}

Gridifier.HorizontalGrid.Connections.prototype.expandHorizontallyAllColConnectionsToMostWide = function(newConnection) {
    var mostWideConnection = this.getMostWideFromAllHorizontallyIntersectedConnections(newConnection);
    if(mostWideConnection == null)
        return;
    
    var colConnectionsToExpand = this.getAllHorizontallyIntersectedConnections(newConnection);
    this._lastColHorizontallyExpandedConnections = colConnectionsToExpand;

    for(var i = 0; i < colConnectionsToExpand.length; i++) {
        colConnectionsToExpand[i].x1 = mostWideConnection.x1;
        colConnectionsToExpand[i].x2 = mostWideConnection.x2;

        if(this._settings.isHorizontalGridLeftAlignmentType())
            colConnectionsToExpand[i].horizontalOffset = 0;
        else if(this._settings.isHorizontalGridCenterAlignmentType()) {
            var x1 = colConnectionsToExpand[i].x1;
            var x2 = colConnectionsToExpand[i].x2;

            var targetSizes = this._itemCoordsExtractor.getItemTargetSizes(colConnectionsToExpand[i].item);
            // @todo -> Check if (-1) is required
            var itemWidth = targetSizes.targetWidth - 1;

            //var itemWidth = colConnectionsToExpand[i].itemWidthWithMargins - 1;
            // @todo fix to return Math.round(Math.abs(y2 - y1 + 1) / 2) - Math.round(itemHeight / 2);
            colConnectionsToExpand[i].horizontalOffset = Math.round(Math.abs(x2 - x1) / 2) - Math.round(itemWidth / 2);
        }
        else if(this._settings.isHorizontalGridRightAlignmentType()) {
            var x1 = colConnectionsToExpand[i].x1;
            var x2 = colConnectionsToExpand[i].x2;

            var targetSizes = this._itemCoordsExtractor.getItemTargetSizes(colConnectionsToExpand[i].item);
            // @todo -> Check if (-1) is required
            var itemWidth = targetSizes.targetWidth - 1;
            
            //var itemWidth = colConnectionsToExpand[i].itemWidthWithMargins - 1;
            // @todo fix (y2 - y1 + 1) 
            colConnectionsToExpand[i].horizontalOffset = Math.abs(x2 - x1) - itemWidth;
        }
    }
}

// Gridifier.HorizontalGrid.Connections.prototype.getMaxXFromAllConnections = function() {
//     var maxX = 0;
//     for(var i = 0; i < this._connections.length; i++) {
//         if(this._connections[i].x2 > maxX)
//             maxX = this._connections[i].x2;
//     }

//     return maxX;
// }

Gridifier.HorizontalGrid.Connections.prototype.getMaxYFromAllConnections = function() {
    var maxY = 0;
    for(var i = 0; i < this._connections.length; i++) {
        if(this._connections[i].y2 > maxY)
            maxY = this._connections[i].y2;
    }

    return maxY;
}

Gridifier.HorizontalGrid.Connections.prototype.normalizeHorizontalPositionsOfAllConnectionsAfterPrepend = function(newConnection,
                                                                                                                   connectors) {
    if(newConnection.x1 >= 0)
        return false;

    // @todo -> should round???
    var increaseHorizontalPositionBy = Math.round(Math.abs(newConnection.x1));
    newConnection.x2 = Math.abs(newConnection.x1 - newConnection.x2);
    newConnection.x1 = 0;

    for(var i = 0; i < this._connections.length; i++) {
        if(newConnection.itemGUID == this._connections[i].itemGUID)
            continue;

        this._connections[i].x1 += increaseHorizontalPositionBy;
        this._connections[i].x2 += increaseHorizontalPositionBy;
    }

    for(var i = 0; i < connectors.length; i++)
        connectors[i].x += increaseHorizontalPositionBy;

    this._ranges.shiftAllRangesBy(increaseHorizontalPositionBy);
    this._ranges.createPrependedRange(newConnection.x1, newConnection.x2);

    return true;
}