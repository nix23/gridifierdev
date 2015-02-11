Gridifier.VerticalGrid.ReversedAppender = function(gridifier,
                                                   settings,
                                                   connectors,
                                                   connections,
                                                   guid,
                                                   renderer,
                                                   normalizer) {
    var me = this;

    this._gridifier = null;
    this._settings = null;

    this._connectors = null;
    this._connections = null;
    this._connectorsCleaner = null;
    this._connectorsShifter = null;
    this._connectorsSelector = null;
    this._connectorsSorter = null;
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
            me._connectors, me._connections, me._settings
        );
        me._connectorsShifter = new Gridifier.ConnectorsShifter(
            me._gridifier, me._connections
        );
        me._connectorsSelector = new Gridifier.VerticalGrid.ConnectorsSelector(me._guid);
        me._connectorsSorter = new Gridifier.VerticalGrid.ConnectorsSorter();
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

Gridifier.VerticalGrid.ReversedAppender.prototype.reversedAppend = function(item, disableMarking) {
    var disableMarking = disableMarking || false;
    if(!disableMarking)
        this._guid.markIfIsFirstAppendedItem(item);

    this._initConnectors();

    var connection = this._createConnectionPerItem(item);
    Logger.log(                 // @system-log-start
        "connection created",
        "---",
        this._connectors.get(),
        this._connections.get()
    );                          // @system-log-end
    this._connections.attachConnectionToRanges(connection);

    this._connectorsCleaner.deleteAllTooHighConnectorsFromMostBottomConnector();
    Logger.log(                 // @system-log-start
        "deleteAllTooHighConnectorsFromMostBottomConnector",
        "---",
        this._connectors.get(),
        this._connections.get()
    );                          // @system-log-end
    this._connectorsCleaner.deleteAllIntersectedFromBottomConnectors();
    Logger.log( // @system-log-start
        "deleteAllIntersectedFromBottomConnectors",
        "",
        this._connectors.get(),
        this._connections.get()
    );          // @system-log-end

    if(this._settings.isDefaultIntersectionStrategy())
        this._renderer.showConnections(connection);
    else if(this._settings.isNoIntersectionsStrategy()) {
        var rowConnections = this._connections.getLastRowVerticallyExpandedConnections();

        for(var i = 0; i < rowConnections.length; i++) {
            if(rowConnections[i].itemGUID == connection.itemGUID) {
                rowConnections.splice(i, 1);
                i--;
            }
        }

        this._renderer.renderConnections(rowConnections);
        this._renderer.showConnections(connection);
    }
}

Gridifier.VerticalGrid.ReversedAppender.prototype._initConnectors = function() {
    if(this._gridifier.isInitialOperation(Gridifier.OPERATIONS.REVERSED_APPEND)) {
        this.createInitialConnector();
        return;
    }

    if(!this._gridifier.isCurrentOperationSameAsPrevious(Gridifier.OPERATIONS.REVERSED_APPEND)) {
        this.recreateConnectorsPerAllConnectedItems();
        Logger.log(                     // @system-log-start
            "initConnectors",
            "isCurrentOperationSameAsPrevious -> recreateConnectorsPerAllConnectedItems",
            this._connectors.get(),
            this._connections.get()
        );                              // @system-log-end
        this._connectors.deleteAllPrependedItemConnectorsExceptSide(Gridifier.Connectors.SIDES.BOTTOM.LEFT);
        Logger.log(                 // @system-log-start
            "initConnectors",
            "isCurrentOperationSameAsPrevious -> deleteAllPrependedItemConnectorsExceptSide(BOTTOM.LEFT)",
            this._connectors.get(),
            this._connections.get()
        );                          // @system-log-end
        this._connectorsCleaner.deleteAllIntersectedFromBottomConnectors();
        Logger.log(                 // @system-log-start
            "initConnectors",
            "isCurrentOperationSameAsPrevious -> deleteAllIntersectedFromBottomConnectors",
            this._connectors.get(),
            this._connections.get()
        );                          // @system-log-end
        this._connectorsCleaner.deleteAllTooHighConnectorsFromMostBottomConnector();
        Logger.log(                 // @system-log-start
            "initConnectors",
            "isCurrentOperationSameAsPrevious -> deleteAllTooHighConnectorsFromMostBottomConnector",
            this._connectors.get(),
            this._connections.get()
        );                          // @system-log-end
    }
}

Gridifier.VerticalGrid.ReversedAppender.prototype.createInitialConnector = function() {
    this._connectors.addAppendConnector(
        Gridifier.Connectors.SIDES.RIGHT.TOP,
        0,
        0
    );
    Logger.log(                 // @system-log-start
        "initConnectors",
        "isInitialOperation -> createInitialConnector",
        this._connectors.get(),
        this._connections.get()
    );                          // @system-log-end
}

Gridifier.VerticalGrid.ReversedAppender.prototype.recreateConnectorsPerAllConnectedItems = function() {
    this._connectors.flush();

    var connections = this._connections.get(); 
    for(var i = 0; i < connections.length; i++) {
        this._addItemConnectors(connections[i], connections[i].itemGUID);
    }

    if(this._connectors.count() == 0)
        this.createInitialConnector();
}

Gridifier.VerticalGrid.ReversedAppender.prototype._addItemConnectors = function(itemCoords, itemGUID) {
    if((itemCoords.x2 + 1) <= this._gridifier.getGridX2()) {
        this._connectors.addAppendConnector(
            Gridifier.Connectors.SIDES.RIGHT.TOP,
            parseFloat(itemCoords.x2 + 1),
            Dom.toInt(itemCoords.y1),
            Dom.toInt(itemGUID)
        );
    }

    this._connectors.addAppendConnector(
        Gridifier.Connectors.SIDES.BOTTOM.LEFT,
        parseFloat(itemCoords.x1),
        Dom.toInt(itemCoords.y2 + 1),
        Dom.toInt(itemGUID)
    );
}

Gridifier.VerticalGrid.ReversedAppender.prototype._createConnectionPerItem = function(item) {
    var sortedConnectors = this._filterConnectorsPerNextConnection();
    var itemConnectionCoords = this._findItemConnectionCoords(item, sortedConnectors);
    var connection = this._connections.add(item, itemConnectionCoords);

    if(this._settings.isNoIntersectionsStrategy()) {
        this._connections.expandVerticallyAllRowConnectionsToMostTall(connection);
        Logger.log(  // @system-log-start
            "createConnectionPerItem",
            "isNoIntersectionsStrategy -> expandVerticallyAllRowConnectionsToMostTall",
            sortedConnectors,
            this._connections.get()
        );          // @system-log-end
    }
    this._addItemConnectors(itemConnectionCoords, this._guid.getItemGUID(item));

    return connection;
}

Gridifier.VerticalGrid.ReversedAppender.prototype._filterConnectorsPerNextConnection = function() {
    var connectors = this._connectors.getClone();

    if(this._settings.isDefaultIntersectionStrategy()) {
        this._connectorsShifter.attachConnectors(connectors);
        this._connectorsShifter.shiftAllConnectors();
        connectors = this._connectorsShifter.getAllConnectors();
        Logger.log(                     // @system-log-start
            "createConnectionPerItem",
            "filterConnectorsPerNextConnection -> isDefaultIntersectionStrategy() -> shiftAllConnectors",
            connectors,
            this._connections.get()
        );                              // @system-log-end
    }
    else if(this._settings.isNoIntersectionsStrategy()) {
        var connectorsSide = Gridifier.Connectors.SIDES.BOTTOM.LEFT;

        this._connectorsSelector.attachConnectors(connectors);
        this._connectorsSelector.selectOnlyMostBottomConnectorFromSide(connectorsSide);
        connectors = this._connectorsSelector.getSelectedConnectors();
        Logger.log(                     // @system-log-start
            "createConnectionPerItem",
            "filterConnectorsPerNextConnection -> isNoIntersectionsStrategy() -> selectOnlyMostBottomConnectorFromSide(BOTTOM.LEFT)",
            connectors,
            this._connections.get()
        );                              // @system-log-end

        this._connectorsShifter.attachConnectors(connectors);
        this._connectorsShifter.shiftAllWithSpecifiedSideToLeftGridCorner(connectorsSide);
        connectors = this._connectorsShifter.getAllConnectors();
        Logger.log(                     // @system-log-start
            "createConnectionPerItem",
            "filterConnectorsPerNextConnection -> isNoIntersectionsStrategy() -> shiftAllWithSpecifiedSideToLeftGridCorner(BOTTOM.LEFT)",
            connectors,
            this._connections.get()
        );                              // @system-log-end
    }

    this._connectorsSorter.attachConnectors(connectors);
    this._connectorsSorter.sortConnectorsForAppend(Gridifier.APPEND_TYPES.REVERSED_APPEND);

    return this._connectorsSorter.getConnectors();
}

Gridifier.VerticalGrid.ReversedAppender.prototype._findItemConnectionCoords = function(item, sortedConnectors) {
    var itemConnectionCoords = null;
    Logger.startLoggingFindItemConnectionCoords(); // @system-log
    
    for(var i = 0; i < sortedConnectors.length; i++) {
        Logger.logFindItemConnectionCoordsInspectConnector(sortedConnectors[i], this._connections.get()); // @system-log
        var itemCoords = this._itemCoordsExtractor.connectorToReversedAppendedItemCoords(item, sortedConnectors[i]);

        if(itemCoords.x2 > this._normalizer.normalizeHighRounding(this._gridifier.getGridX2())) {
            Logger.logFindItemConnectionCoordsOutOfLayoutBounds(   // @system-log-start
                sortedConnectors[i], itemCoords, this._connections.get()
            );                                                     // @system-log-end
            continue;
        }
        
        var maybeIntersectableConnections = this._connectionsIntersector.findAllMaybeIntersectableConnectionsOnAppend(
            sortedConnectors[i]
        );
        if(this._connectionsIntersector.isIntersectingAnyConnection(maybeIntersectableConnections, itemCoords)) {
            Logger.logFindItemConnectionCoordsIntersectionFound( // @system-log-start
                sortedConnectors[i], itemCoords, maybeIntersectableConnections, this._connections.get()
            );                                                   // @system-log-end
            continue;
        }
        
        itemConnectionCoords = itemCoords;
        
        var connectionsBelowCurrent = this._connections.getAllConnectionsBelowY(itemCoords.y2);
        if(this._connections.isAnyConnectionItemGUIDSmallerThan(connectionsBelowCurrent, item)) {
            Logger.logFindItemConnectionCoordsWrongSorting( // @system-log-start
                sortedConnectors[i], itemCoords, connectionsBelowCurrent, this._connections.get()
            );                                              // @system-log-end
            continue;
        }

        if(this._settings.isNoIntersectionsStrategy()) {
            if(this._connections.isIntersectingMoreThanOneConnectionItemVertically(itemConnectionCoords)) {
                Logger.logFindItemConnectionCoordsVerticalIntersectionsError( // @system-log-start
                    sortedConnectors[i], itemCoords, this._connections.get()
                );                                                            // @system-log-end
                itemConnectionCoords = null;
            }
        }
        
        if(itemConnectionCoords != null) {
            Logger.logFindItemConnectionCoordsFound( // @system-log
                sortedConnectors[i], itemConnectionCoords, item, this._connections.get()
            );                                       // @system-log
            Logger.stopLoggingFindItemConnectionCoords(); // @system-log
            break;
        }
    }
    
    return itemConnectionCoords;
}