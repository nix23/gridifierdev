Gridifier.VerticalGrid.Connections = function(gridifier, guid, settings, sizesResolverManager) {
    var me = this;

    this._gridifier = null;
    this._guid = null;
    this._settings = null;
    this._sizesResolverManager = null;

    this._itemCoordsExtractor = null;
    this._sizesTransformer = null;
    this._connectionsCore = null;
    this._connectionsVerticalIntersector = null;

    this._connections = [];
    this._ranges = null;
    this._sorter = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._guid = guid;
        me._settings = settings;
        me._sizesResolverManager = sizesResolverManager;

        me._ranges = new Gridifier.VerticalGrid.ConnectionsRanges(me);
        me._ranges.init();

        me._sorter = new Gridifier.VerticalGrid.ConnectionsSorter(
            me, me._settings, me._guid
        );
        me._itemCoordsExtractor = new Gridifier.VerticalGrid.ItemCoordsExtractor(
            me._gridifier, me._sizesResolverManager
        );

        me._connectionsCore = new Gridifier.Connections(
            me._gridifier, me, me._guid, me._sorter, me._sizesResolverManager
        );
        me._connectionsVerticalIntersector = new Gridifier.VerticalGrid.ConnectionsVerticalIntersector(
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

Gridifier.VerticalGrid.Connections.prototype.setSizesTransformerInstance = function(sizesTransformer) {
    this._sizesTransformer = sizesTransformer;
    this._connectionsCore.setSizesTransformerInstance(sizesTransformer);
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
    return this._connectionsVerticalIntersector.getLastRowVerticallyExpandedConnections();
}

Gridifier.VerticalGrid.Connections.prototype.get = function() {
    return this._connections;
}

Gridifier.VerticalGrid.Connections.prototype.count = function() {
    return this._connections.length;
}

Gridifier.VerticalGrid.Connections.prototype.restore = function(connections) {
    this._connections = this._connections.concat(connections);
}

Gridifier.VerticalGrid.Connections.prototype.restoreOnCustomSortDispersionMode = function(connections) {
    var currentConnections = this._sorter.sortConnectionsPerReappend(this._connections);
    var lastConnection = currentConnections[currentConnections.length - 1];

    if(this._settings.isDefaultAppend()) {
        var minX = lastConnection.x1;
        var maxY = lastConnection.y1;

        var nextFakeX = minX - 1;
        for(var i = 0; i < connections.length; i++) {
            connections[i].x1 = nextFakeX;
            connections[i].x2 = nextFakeX;
            connections[i].y1 = maxY;
            connections[i].y2 = maxY;
            nextFakeX--;
        }
    }
    else if(this._settings.isReversedAppend()) {
        var maxX = lastConnection.x2;
        var maxY = lastConnection.y1;

        var nextFakeX = maxX + 1;
        for(var i = 0; i < connections.length; i++) {
            connections[i].x1 = nextFakeX;
            connections[i].x2 = nextFakeX;
            connections[i].y1 = maxY;
            connections[i].y2 = maxY;
            nextFakeX++;
        }
    }

    this.restore(connections);
}

Gridifier.VerticalGrid.Connections.prototype.getMaxX2 = function() {
    return this._connectionsCore.getMaxX2();
}

Gridifier.VerticalGrid.Connections.prototype.getMaxY2 = function() {
    return this._connectionsCore.getMaxY2();
}

Gridifier.VerticalGrid.Connections.prototype.findConnectionByItem = function(item) {
    return this._connectionsCore.findConnectionByItem(item);
}

Gridifier.VerticalGrid.Connections.prototype.remapAllItemGUIDS = function() {
    this._connectionsCore.remapAllItemGUIDS();
}

Gridifier.VerticalGrid.Connections.prototype.remapAllItemGUIDSInSortedConnections = function(connections) {
    this._connectionsCore.remapAllItemGUIDSInSortedConnections(connections);
}

Gridifier.VerticalGrid.Connections.prototype.add = function(item, itemConnectionCoords) {
    var connection = this._connectionsCore.createItemConnection(item, itemConnectionCoords);
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

Gridifier.VerticalGrid.Connections.prototype.getConnectionsByItemGUIDS = function(itemGUIDS) {
    return this._connectionsCore.getConnectionsByItemGUIDS(itemGUIDS);
}

Gridifier.VerticalGrid.Connections.prototype.syncConnectionParams = function(connectionsData) {
    this._connectionsCore.syncConnectionParams(connectionsData);
}

Gridifier.VerticalGrid.Connections.prototype.getMinConnectionWidth = function() {
    return this._connectionsCore.getMinConnectionWidth();
}

Gridifier.VerticalGrid.Connections.prototype.getMinConnectionHeight = function() {
    return this._connectionsCore.getMinConnectionHeight();
}

Gridifier.VerticalGrid.Connections.prototype.isAnyConnectionItemGUIDSmallerThan = function(comparableConnections, 
                                                                                           item) {
    return this._connectionsCore.isAnyConnectionItemGUIDSmallerThan(comparableConnections, item);
}

Gridifier.VerticalGrid.Connections.prototype.isAnyConnectionItemGUIDBiggerThan = function(comparableConnections,
                                                                                          item) {
    return this._connectionsCore.isAnyConnectionItemGUIDBiggerThan(comparableConnections, item);
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

Gridifier.VerticalGrid.Connections.prototype.getAllConnectionsAboveY = function(y) {
    // @todo -> Place CSD here too :)
    var connections = [];
    for(var i = 0; i < this._connections.length; i++) {
        if(this._connections[i].y2 < y)
            connections.push(this._connections[i]);
    }

    return connections;
}

Gridifier.VerticalGrid.Connections.prototype.getMaxYFromAllConnections = function() {
    var maxY = 0;
    for(var i = 0; i < this._connections.length; i++) {
        if(this._connections[i].y2 > maxY)
            maxY = this._connections[i].y2;
    }

    return maxY;
}

Gridifier.VerticalGrid.Connections.prototype.isIntersectingMoreThanOneConnectionItemVertically = function(itemCoords) {
    return this._connectionsVerticalIntersector.isIntersectingMoreThanOneConnectionItemVertically(itemCoords);
}

Gridifier.VerticalGrid.Connections.prototype.getMostTallFromAllVerticallyIntersectedConnections = function(itemCoords) {
    return this._connectionsVerticalIntersector.getMostTallFromAllVerticallyIntersectedConnections(itemCoords);
}

Gridifier.VerticalGrid.Connections.prototype.getAllVerticallyIntersectedConnections = function(itemCoords) {
    return this._connectionsVerticalIntersector.getAllVerticallyIntersectedConnections(itemCoords);
}

Gridifier.VerticalGrid.Connections.prototype.expandVerticallyAllRowConnectionsToMostTall = function(newConnection) {
    this._connectionsVerticalIntersector.expandVerticallyAllRowConnectionsToMostTall(newConnection);
}

Gridifier.VerticalGrid.Connections.prototype.normalizeVerticalPositionsOfAllConnectionsAfterPrepend = function(newConnection,
                                                                                                               connectors) {
    if(newConnection.y1 >= 0)
        return false;

    var increaseVerticalPositionBy = Math.round(Math.abs(newConnection.y1));
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