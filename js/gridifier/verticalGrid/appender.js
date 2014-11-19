Gridifier.VerticalGrid.Appender = function(gridifier, settings, connectors, connections, guid, renderer, normalizer) {
    var me = this;

    this._gridifier = null;
    this._settings = null;

    this._connectors = null;
    this._connections = null;
    this._connectorsCleaner = null;
    this._itemCoordsExtractor = null;
    this._connectionsIntersector = null;
    this._guid = null;
    this._renderer = null;
    this._normalizer = normalizer;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._settings = settings;

        me._connectors = connectors;
        me._connections = connections;

        me._connectorsCleaner = new Gridifier.VerticalGrid.ConnectorsCleaner(
            me._connectors, me._connections
        );
        me._itemCoordsExtractor = new Gridifier.VerticalGrid.ItemCoordsExtractor(me._gridifier);
        me._connectionsIntersector = new Gridifier.VerticalGrid.ConnectionsIntersector(me._connections);

        me._guid = guid;
        me._renderer = renderer;
        me._normalizer = normalizer;
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

Gridifier.VerticalGrid.Appender.prototype.append = function(item) { //console.log("connections: ", this._connections.get());
    this._guid.markIfIsFirstAppendedItem(item);
    this._initConnectors();
    var connection = this._createConnectionPerItem(item);
    this._connectorsCleaner.deleteAllIntersectedFromBottomConnectors();
    this._renderer.showConnections(connection);
}

Gridifier.VerticalGrid.Appender.prototype._initConnectors = function() {
    if(this._gridifier.isInitialOperation(Gridifier.OPERATIONS.APPEND)) {
        this.createInitialConnector();
        return;
    }

    if(!this._gridifier.isCurrentOperationSameAsPrevious(Gridifier.OPERATIONS.APPEND)) {
        this.recreateConnectorsPerAllConnectedItems();
        this._connectors.deleteAllPrependedItemConnectorsExceptSide(Gridifier.Connectors.SIDES.BOTTOM.RIGHT);
        this._connectorsCleaner.deleteAllIntersectedFromBottomConnectors();
        this._connectorsCleaner.deleteAllTooHighConnectorsFromMostBottomConnector();
    }
}

Gridifier.VerticalGrid.Appender.prototype.createInitialConnector = function() {
    this._connectors.addAppendConnector(
        Gridifier.Connectors.SIDES.BOTTOM.RIGHT,
        Dom.toInt(this._gridifier.getGridX2()),
        0
    );
}

Gridifier.VerticalGrid.Appender.prototype.recreateConnectorsPerAllConnectedItems = function() {
    this._connectors.flush();

    var connections = this._connections.get();
    for(var i = 0; i < connections.length; i++) {
        this._addItemConnectors(connections[i], connections[i].itemGUID);
    }

    if(this._connectors.count() == 0)
        this.createInitialConnector();
}

Gridifier.VerticalGrid.Appender.prototype._addItemConnectors = function(itemCoords, itemGUID) {
    if((itemCoords.x1 - 1) >= 0) {
        this._connectors.addAppendConnector(
            Gridifier.Connectors.SIDES.LEFT.TOP,
            //Dom.toInt(itemCoords.x1 - 1),
            itemCoords.x1 - 1,
            Dom.toInt(itemCoords.y1),
            Dom.toInt(itemGUID)
        );
    }

    this._connectors.addAppendConnector(
        Gridifier.Connectors.SIDES.BOTTOM.RIGHT,
        //Dom.toInt(itemCoords.x2),
        itemCoords.x2,
        Dom.toInt(itemCoords.y2 + 1),
        Dom.toInt(itemGUID)
    );
}

Gridifier.VerticalGrid.Appender.prototype._createConnectionPerItem = function(item) {
    //console.log("");
    //console.log("Creating connection per item: ", item);
    var sortedConnectors = this._filterConnectorsPerNextConnection();
    var itemConnectionCoords = this._findItemConnectionCoords(item, sortedConnectors);
    
    this._addItemConnectors(itemConnectionCoords, this._guid.getItemGUID(item));
    return this._connections.add(item, itemConnectionCoords);
}

Gridifier.VerticalGrid.Appender.prototype._filterConnectorsPerNextConnection = function() {
    var connectors = this._connectors.getClone();

    if(this._settings.isDefaultIntersectionStrategy()) {
        var connectorsShifter = new Gridifier.ConnectorsShifter(this._gridifier, connectors, this._connections);
        connectorsShifter.shiftAllConnectors();
        connectors = connectorsShifter.getAllConnectors();
    }
    else if(this._settings.isNoIntersectionsStrategy()) {
        var connectorsSide = Gridifier.Connectors.SIDES.BOTTOM.RIGHT;

        var connectorsSelector = new Gridifier.VerticalGrid.ConnectorsSelector(connectors);
        connectorsSelector.selectOnlyMostBottomConnectorFromSide(connectorsSide);
        connectors = connectorsSelector.getSelectedConnectors();

        var connectorsShifter = new Gridifier.ConnectorsShifter(this._gridifier, connectors, this._connections);
        connectorsShifter.shiftAllWithSpecifiedSideToRightGridCorner(connectorsSide);
        connectors = connectorsShifter.getAllConnectors();
    }

    var connectorsSorter = new Gridifier.VerticalGrid.ConnectorsSorter(connectors);
    connectorsSorter.sortConnectorsForAppend(Gridifier.APPEND_TYPES.DEFAULT_APPEND);

    return connectorsSorter.getConnectors();
}

Gridifier.VerticalGrid.Appender.prototype._findItemConnectionCoords = function(item, sortedConnectors) {
    var itemConnectionCoords = null;
    
    for(var i = 0; i < sortedConnectors.length; i++) {
        var itemCoords = this._itemCoordsExtractor.connectorToAppendedItemCoords(item, sortedConnectors[i]);
        //console.log("sortedConnector: ", sortedConnectors[i]);
        //console.log("itemCoords: ", itemCoords);
        if(itemCoords.x1 < this._normalizer.normalizeLowRounding(0))
            continue;
        //console.log("x1 passed");
        var maybeIntersectableConnections = this._connectionsIntersector.findAllMaybeIntersectableConnectionsOnAppend(sortedConnectors[i]);
        if(this._connectionsIntersector.isIntersectingAnyConnection(maybeIntersectableConnections, itemCoords))
            continue;
        //console.log("intersections passed");
        itemConnectionCoords = itemCoords;

        var connectionsBelowCurrent = this._connections.getAllConnectionsBelowY(itemCoords.y2);
        if(this._connections.isAnyConnectionItemGUIDSmallerThan(connectionsBelowCurrent, item)) 
            itemConnectionCoords = null;

        if(this._settings.isNoIntersectionsStrategy()) {
            if(this._connections.isIntersectingMoreThanOneConnectionItemVertically(itemConnectionCoords))
                itemConnectionCoords = null;
        }

        if(itemConnectionCoords != null)
            break;
    }

    return itemConnectionCoords;
}