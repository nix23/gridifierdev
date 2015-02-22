Gridifier.VerticalGrid.Prepender = function(gridifier, 
                                            settings, 
                                            sizesResolverManager,
                                            connectors, 
                                            connections, 
                                            guid, 
                                            renderer, 
                                            normalizer,
                                            operation) {
    var me = this;

    this._gridifier = null;
    this._settings = null;
    this._sizesResolverManager = null;

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
    this._normalizer = null;
    this._operation = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._settings = settings;
        me._sizesResolverManager = sizesResolverManager;

        me._connectors = connectors;
        me._connections = connections;

        me._connectorsCleaner = new Gridifier.VerticalGrid.ConnectorsCleaner(
            me._connectors, me._connections, me._settings
        );
        me._connectorsShifter = new Gridifier.ConnectorsShifter(
            me._gridifier, me._connections, me._settings
        );
        me._connectorsSelector = new Gridifier.VerticalGrid.ConnectorsSelector(me._guid);
        me._connectorsSorter = new Gridifier.VerticalGrid.ConnectorsSorter();
        me._itemCoordsExtractor = new Gridifier.VerticalGrid.ItemCoordsExtractor(me._gridifier, me._sizesResolverManager);
        me._connectionsIntersector = new Gridifier.VerticalGrid.ConnectionsIntersector(me._connections);

        me._guid = guid;
        me._renderer = renderer;
        me._normalizer = normalizer;
        me._operation = operation;
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

Gridifier.VerticalGrid.Prepender.prototype.prepend = function(item) {
    this._initConnectors();

    var connection = this._createConnectionPerItem(item);
    Logger.log(                 // @system-log-start
        "connection created",
        "---",
        this._connectors.get(),
        this._connections.get()
    );                          // @system-log-end
    var wereItemsNormalized = this._connections.normalizeVerticalPositionsOfAllConnectionsAfterPrepend(
        connection, this._connectors.get()
    );
    Logger.log( // @system-log-start
        "normalizeVerticalPositionsOfAllConnectionsAfterPrepend",
        "",
        this._connectors.get(),
        this._connections.get()
    );          // @system-log-end
    this._connections.attachConnectionToRanges(connection);

    this._connectorsCleaner.deleteAllTooLowConnectorsFromMostTopConnector();
    Logger.log(                 // @system-log-start
        "deleteAllTooLowConnectorsFromMostTopConnector",
        "---",
        this._connectors.get(),
        this._connections.get()
    );                          // @system-log-end
    this._connectorsCleaner.deleteAllIntersectedFromTopConnectors();
    Logger.log(                 // @system-log-start
        "deleteAllIntersectedFromTopConnectors",
        "---",
        this._connectors.get(),
        this._connections.get()
    );                          // @system-log-end

    if(wereItemsNormalized) {
        this._renderer.renderConnections(this._connections.get(), [connection]);
        Logger.log( // @system-log-start
            "renderConnectionsAfterPrependNormalization",
            "",
            this._connectors.get(),
            this._connections.get()
        );          // @system-log-end
    }

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

Gridifier.VerticalGrid.Prepender.prototype._initConnectors = function() {
    if(this._operation.isInitialOperation(Gridifier.OPERATIONS.PREPEND)) {
        this.createInitialConnector();
        return;
    }

    if(!this._operation.isCurrentOperationSameAsPrevious(Gridifier.OPERATIONS.PREPEND)) {
        this.recreateConnectorsPerAllConnectedItems();
        Logger.log(     // @system-log-start
            "initConnectors",
            "isCurrentOperationSameAsPrevious -> recreateConnectorsPerAllConnectedItems",
            this._connectors.get(),
            this._connections.get()
        );              // @system-log-end
        this._connectorsCleaner.deleteAllIntersectedFromTopConnectors();
        Logger.log(                 // @system-log-start
            "initConnectors",
            "isCurrentOperationSameAsPrevious -> deleteAllIntersectedFromTopConnectors",
            this._connectors.get(),
            this._connections.get()
        );                          // @system-log-end
        this._connectorsCleaner.deleteAllTooLowConnectorsFromMostTopConnector();
        Logger.log(                 // @system-log-start
            "initConnectors",
            "isCurrentOperationSameAsPrevious -> deleteAllTooLowConnectorsFromMostTopConnector",
            this._connectors.get(),
            this._connections.get()
        );                          // @system-log-end
    }
}

Gridifier.VerticalGrid.Prepender.prototype.createInitialConnector = function() {
    this._connectors.addPrependConnector(
        Gridifier.Connectors.SIDES.RIGHT.BOTTOM,
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

Gridifier.VerticalGrid.Prepender.prototype.recreateConnectorsPerAllConnectedItems = function() {
    this._connectors.flush();

    var connections = this._connections.get();
    for(var i = 0; i < connections.length; i++) {
        this._addItemConnectors(connections[i], connections[i].itemGUID);
    }

    if(this._connectors.count() == 0)
        this.createInitialConnector();
}

Gridifier.VerticalGrid.Prepender.prototype._addItemConnectors = function(itemCoords, itemGUID) {
    if((itemCoords.x2 + 1) <= this._gridifier.getGridX2()) {
        this._connectors.addPrependConnector(
            Gridifier.Connectors.SIDES.RIGHT.BOTTOM,
            parseFloat(itemCoords.x2 + 1),
            parseFloat(itemCoords.y2),
            Dom.toInt(itemGUID)
        );
    }

    this._connectors.addPrependConnector(
        Gridifier.Connectors.SIDES.TOP.LEFT,
        parseFloat(itemCoords.x1),
        parseFloat(itemCoords.y1 - 1),
        Dom.toInt(itemGUID)
    );
}

Gridifier.VerticalGrid.Prepender.prototype._createConnectionPerItem = function(item) {
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

Gridifier.VerticalGrid.Prepender.prototype._filterConnectorsPerNextConnection = function() {
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
        var connectorsSide = Gridifier.Connectors.SIDES.TOP.LEFT;

        this._connectorsSelector.attachConnectors(connectors);
        this._connectorsSelector.selectOnlyMostTopConnectorFromSide(connectorsSide);
        connectors = this._connectorsSelector.getSelectedConnectors();
        Logger.log(                     // @system-log-start
            "createConnectionPerItem",
            "filterConnectorsPerNextConnection -> isNoIntersectionsStrategy() -> selectOnlyMostTopConnectorFromSide(TOP.LEFT)",
            connectors,
            this._connections.get()
        );                              // @system-log-end
        
        this._connectorsShifter.attachConnectors(connectors);
        this._connectorsShifter.shiftAllWithSpecifiedSideToLeftGridCorner(connectorsSide);
        connectors = this._connectorsShifter.getAllConnectors();
        Logger.log(                     // @system-log-start
            "createConnectionPerItem",
            "filterConnectorsPerNextConnection -> isNoIntersectionsStrategy() -> shiftAllWithSpecifiedSideToLeftGridCorner(TOP.LEFT)",
            connectors,
            this._connections.get()
        );                              // @system-log-end
    }

    this._connectorsSorter.attachConnectors(connectors);
    this._connectorsSorter.sortConnectorsForPrepend(Gridifier.PREPEND_TYPES.DEFAULT_PREPEND);

    return this._connectorsSorter.getConnectors();
}

Gridifier.VerticalGrid.Prepender.prototype._findItemConnectionCoords = function(item, sortedConnectors) {
    var itemConnectionCoords = null;
    Logger.startLoggingFindItemConnectionCoords(); // @system-log

    for(var i = 0; i < sortedConnectors.length; i++) {
        Logger.logFindItemConnectionCoordsInspectConnector(sortedConnectors[i], this._connections.get()); // @system-log
        var itemCoords = this._itemCoordsExtractor.connectorToPrependedItemCoords(item, sortedConnectors[i]);
        if(itemCoords.x2 > this._normalizer.normalizeHighRounding(this._gridifier.getGridX2())) {
            Logger.logFindItemConnectionCoordsOutOfLayoutBounds(   // @system-log-start
                sortedConnectors[i], itemCoords, this._connections.get()
            );                                                     // @system-log-end
            continue;
        }

        var maybeIntersectableConnections = this._connectionsIntersector.findAllMaybeIntersectableConnectionsOnPrepend(sortedConnectors[i]);
        if(this._connectionsIntersector.isIntersectingAnyConnection(maybeIntersectableConnections, itemCoords)) {
            Logger.logFindItemConnectionCoordsIntersectionFound( // @system-log-start
                sortedConnectors[i], itemCoords, maybeIntersectableConnections, this._connections.get()
            );                                                   // @system-log-end
            continue;
        }

        itemConnectionCoords = itemCoords;

        var connectionsAboveCurrent = this._connections.getAllConnectionsAboveY(itemCoords.y1);
        if(this._connections.isAnyConnectionItemGUIDBiggerThan(connectionsAboveCurrent, item)) {
            Logger.logFindItemConnectionCoordsWrongSorting( // @system-log-start
                sortedConnectors[i], itemCoords, connectionsAboveCurrent, this._connections.get()
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