Gridifier.HorizontalGrid.ReversedPrepender = function(gridifier, 
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

        me._connectorsCleaner = new Gridifier.HorizontalGrid.ConnectorsCleaner(
            me._connectors, me._connections, me._settings
        );
        me._connectorsShifter = new Gridifier.ConnectorsShifter(
            me._gridifier, me._connections, me._settings
        );
        me._connectorsSelector = new Gridifier.HorizontalGrid.ConnectorsSelector(me._guid);
        me._connectorsSorter = new Gridifier.HorizontalGrid.ConnectorsSorter();
        me._itemCoordsExtractor = new Gridifier.HorizontalGrid.ItemCoordsExtractor(me._gridifier, me._sizesResolverManager);
        me._connectionsIntersector = new Gridifier.HorizontalGrid.ConnectionsIntersector(me._connections);

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

Gridifier.HorizontalGrid.ReversedPrepender.prototype.reversedPrepend = function(item) {
    this._initConnectors();

    var connection = this._createConnectionPerItem(item);
    Logger.log(                 // @system-log-start
        "connection created",
        "---",
        this._connectors.get(),
        this._connections.get()
    );                          // @system-log-end
    var wereItemsNormalized = this._connections.normalizeHorizontalPositionsOfAllConnectionsAfterPrepend(
        connection, this._connectors.get()
    );
    Logger.log( // @system-log-start
        "normalizeHorizontalPositionsOfAllConnectionsAfterPrepend",
        "---",
        this._connectors.get(),
        this._connections.get()
    );          // @system-log-end
    this._connections.attachConnectionToRanges(connection);

    this._connectorsCleaner.deleteAllTooRightConnectorsFromMostLeftConnector();
    Logger.log(                 // @system-log-start
        "deleteAllTooRightConnectorsFromMostLeftConnector",
        "---",
        this._connectors.get(),
        this._connections.get()
    );                          // @system-log-end
    this._connectorsCleaner.deleteAllIntersectedFromLeftConnectors();
    Logger.log( // @system-log-start
        "deleteAllIntersectedFromLeftConnectors",
        "---",
        this._connectors.get(),
        this._connections.get()
    );          // @system-log-end

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
        var colConnections = this._connections.getLastColHorizontallyExpandedConnections();

        for(var i = 0; i < colConnections.length; i++) {
            if(colConnections[i].itemGUID == connection.itemGUID) {
                colConnections.splice(i, 1);
                i--;
            }
        }

        this._renderer.renderConnections(colConnections);
        this._renderer.showConnections(connection);
    }
}

Gridifier.HorizontalGrid.ReversedPrepender.prototype._initConnectors = function() {
    if(this._operation.isInitialOperation(Gridifier.OPERATIONS.REVERSED_PREPEND)) {
        this.createInitialConnector();
        return;
    }

    if(!this._operation.isCurrentOperationSameAsPrevious(Gridifier.OPERATIONS.REVERSED_PREPEND)) {
        this.recreateConnectorsPerAllConnectedItems();
        Logger.log(     // @system-log-start
            "initConnectors",
            "isCurrentOperationSameAsPrevious -> recreateConnectorsPerAllConnectedItems",
            this._connectors.get(),
            this._connections.get()
        );              // @system-log-end
        this._connectorsCleaner.deleteAllIntersectedFromLeftConnectors();
        Logger.log(                 // @system-log-start
            "initConnectors",
            "isCurrentOperationSameAsPrevious -> deleteAllIntersectedFromLeftConnectors",
            this._connectors.get(),
            this._connections.get()
        );                          // @system-log-end
        this._connectorsCleaner.deleteAllTooRightConnectorsFromMostLeftConnector();
        Logger.log(                 // @system-log-start
            "initConnectors",
            "isCurrentOperationSameAsPrevious -> deleteAllTooRightConnectorsFromMostLeftConnector",
            this._connectors.get(),
            this._connections.get()
        );                          // @system-log-end
    }
}

Gridifier.HorizontalGrid.ReversedPrepender.prototype.createInitialConnector = function() {
    this._connectors.addPrependConnector(
        Gridifier.Connectors.SIDES.BOTTOM.RIGHT,
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

Gridifier.HorizontalGrid.ReversedPrepender.prototype.recreateConnectorsPerAllConnectedItems = function() {
    this._connectors.flush();

    var connections = this._connections.get();
    for(var i = 0; i < connections.length; i++) {
        this._addItemConnectors(connections[i], connections[i].itemGUID);
    }

    if(this._connectors.count() == 0)
        this.createInitialConnector();
}

Gridifier.HorizontalGrid.ReversedPrepender.prototype._addItemConnectors = function(itemCoords, itemGUID) {
    if((itemCoords.y2 + 1) <= this._gridifier.getGridY2()) {
        this._connectors.addPrependConnector(
            Gridifier.Connectors.SIDES.BOTTOM.RIGHT,
            parseFloat(itemCoords.x2),
            parseFloat(itemCoords.y2 + 1),
            Dom.toInt(itemGUID)
        );
    }

    this._connectors.addPrependConnector(
        Gridifier.Connectors.SIDES.LEFT.TOP,
        parseFloat(itemCoords.x1 - 1),
        parseFloat(itemCoords.y1),
        Dom.toInt(itemGUID)
    );
}

Gridifier.HorizontalGrid.ReversedPrepender.prototype._createConnectionPerItem = function(item) {
    var sortedConnectors = this._filterConnectorsPerNextConnection();
    var itemConnectionCoords = this._findItemConnectionCoords(item, sortedConnectors);

    var connection = this._connections.add(item, itemConnectionCoords);
    if(this._settings.isNoIntersectionsStrategy()) {
        this._connections.expandHorizontallyAllColConnectionsToMostWide(connection);
        Logger.log(  // @system-log-start
            "createConnectionPerItem",
            "isNoIntersectionsStrategy -> expandHorizontallyAllColConnectionsToMostWide",
            sortedConnectors,
            this._connections.get()
        );          // @system-log-end
    }
    this._addItemConnectors(itemConnectionCoords, this._guid.getItemGUID(item));

    return connection;
}

Gridifier.HorizontalGrid.ReversedPrepender.prototype._filterConnectorsPerNextConnection = function() {
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
        var connectorsSide = Gridifier.Connectors.SIDES.LEFT.TOP;

        this._connectorsSelector.attachConnectors(connectors);
        this._connectorsSelector.selectOnlyMostLeftConnectorFromSide(connectorsSide);
        connectors = this._connectorsSelector.getSelectedConnectors();
        Logger.log(                     // @system-log-start
            "createConnectionPerItem",
            "filterConnectorsPerNextConnection -> isNoIntersectionsStrategy() -> selectOnlyMostTopConnectorFromSide(LEFT.TOP)",
            connectors,
            this._connections.get()
        );                              // @system-log-end
        
        this._connectorsShifter.attachConnectors(connectors);
        this._connectorsShifter.shiftAllWithSpecifiedSideToTopGridCorner(connectorsSide);
        connectors = this._connectorsShifter.getAllConnectors();
        Logger.log(                     // @system-log-start
            "createConnectionPerItem",
            "filterConnectorsPerNextConnection -> isNoIntersectionsStrategy() -> shiftAllWithSpecifiedSideToTopGridCorner(LEFT.TOP)",
            connectors,
            this._connections.get()
        );                              // @system-log-end
    }

    this._connectorsSorter.attachConnectors(connectors);
    this._connectorsSorter.sortConnectorsForPrepend(Gridifier.PREPEND_TYPES.REVERSED_PREPEND);

    return this._connectorsSorter.getConnectors();
}

Gridifier.HorizontalGrid.ReversedPrepender.prototype._findItemConnectionCoords = function(item, sortedConnectors) {
    var itemConnectionCoords = null;
    Logger.startLoggingFindItemConnectionCoords(); // @system-log
    
    for(var i = 0; i < sortedConnectors.length; i++) {
        Logger.logFindItemConnectionCoordsInspectConnector(sortedConnectors[i], this._connections.get()); // @system-log
        var itemCoords = this._itemCoordsExtractor.connectorToReversedPrependedItemCoords(item, sortedConnectors[i]);
        if(itemCoords.y2 > this._normalizer.normalizeHighRounding(this._gridifier.getGridY2())) {
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

        var connectionsBeforeCurrent = this._connections.getAllConnectionsBeforeX(itemCoords.x1);
        if(this._connections.isAnyConnectionItemGUIDBiggerThan(connectionsBeforeCurrent, item)) {
            Logger.logFindItemConnectionCoordsWrongSorting( // @system-log-start
                sortedConnectors[i], itemCoords, connectionsBeforeCurrent, this._connections.get()
            );                                              // @system-log-end
            continue;
        }

        if(this._settings.isNoIntersectionsStrategy()) {
            if(this._connections.isIntersectingMoreThanOneConnectionItemHorizontally(itemConnectionCoords)) {
                Logger.logFindItemConnectionCoordsHorizontalIntersectionsError( // @system-log-start
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