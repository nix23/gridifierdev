Gridifier.HorizontalGrid.Connections = function(gridifier, guid, settings) {
    var me = this;

    this._gridifier = null;
    this._guid = null;
    this._settings = null;

    this._itemCoordsExtractor = null;
    this._sizesTransformer = null;
    this._connectionsCore = null;
    this._connectionsHorizontalIntersector = null;

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

        me._connectionsCore = new Gridifier.Connections(
            me._gridifier, me, me._guid, me._sizesTransformer, me._sorter
        );
        me._connectionsHorizontalIntersector = new Gridifier.HorizontalGrid.ConnectionsHorizontalIntersector(
            me, me._settings, me._itemCoordsExtractor
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

Gridifier.HorizontalGrid.Connections.prototype.setSizesTransformerInstance = function(sizesTransformer) {
    this._sizesTransformer = sizesTransformer;
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
    return this._connectionsHorizontalIntersector.getLastColHorizontallyExpandedConnections();
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

Gridifier.HorizontalGrid.Connections.prototype.findConnectionByItem = function(item) {
    return this._connectionsCore.findConnectionByItem(item);
}

Gridifier.HorizontalGrid.Connections.prototype.remapAllItemGUIDS = function() {
    this._connectionsCore.remapAllItemGUIDS();
}

Gridifier.HorizontalGrid.Connections.prototype.add = function(item, itemConnectionCoords) {
    var connection = this._connectionsCore.createItemConnection(item, itemConnectionCoords);
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
    return this._connectionsCore.getConnectionsByItemGUIDS(itemGUIDS);
}

Gridifier.HorizontalGrid.Connections.prototype.syncConnectionParams = function(connectionsData) {
    this._connectionsCore.syncConnectionParams(connectionsData);
}

Gridifier.HorizontalGrid.Connections.prototype.getMinConnectionWidth = function() {
    return this._connectionsCore.getMinConnectionWidth();
}

Gridifier.HorizontalGrid.Connections.prototype.getMinConnectionHeight = function() {
    return this._connectionsCore.getMinConnectionHeight();
}

Gridifier.HorizontalGrid.Connections.prototype.isAnyConnectionItemGUIDSmallerThan = function(comparableConnections, 
                                                                                             item) {
    return this._connectionsCore.isAnyConnectionItemGUIDSmallerThan(comparableConnections, item);
}

Gridifier.HorizontalGrid.Connections.prototype.isAnyConnectionItemGUIDBiggerThan = function(comparableConnections,
                                                                                            item) {
    return this._connectionsCore.isAnyConnectionItemGUIDBiggerThan(comparableConnections, item);
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


Gridifier.HorizontalGrid.Connections.prototype.getAllConnectionsBeforeX = function(x) {
    var connections = [];
    for(var i = 0; i < this._connections.length; i++) {
        if(this._connections[i].x2 < x)
            connections.push(this._connections[i]);
    }

    return connections;
}

Gridifier.HorizontalGrid.Connections.prototype.getMaxYFromAllConnections = function() {
    var maxY = 0;
    for(var i = 0; i < this._connections.length; i++) {
        if(this._connections[i].y2 > maxY)
            maxY = this._connections[i].y2;
    }

    return maxY;
}

Gridifier.HorizontalGrid.Connections.prototype.isIntersectingMoreThanOneConnectionItemHorizontally = function(itemCoords) {
    return this._connectionsHorizontalIntersector.isIntersectingMoreThanOneConnectionItemHorizontally(itemCoords);
}

Gridifier.HorizontalGrid.Connections.prototype.getMostWideFromAllHorizontallyIntersectedConnections = function(itemCoords) {
    return this._connectionsHorizontalIntersector.getMostWideFromAllHorizontallyIntersectedConnections(itemCoords);
}

Gridifier.HorizontalGrid.Connections.prototype.getAllHorizontallyIntersectedConnections = function(itemCoords) {
    return this._connectionsHorizontalIntersector.getAllHorizontallyIntersectedConnections(itemCoords);
}

Gridifier.HorizontalGrid.Connections.prototype.expandHorizontallyAllColConnectionsToMostWide = function(newConnection) {
    this._connectionsHorizontalIntersector.expandHorizontallyAllColConnectionsToMostWide(newConnection);
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