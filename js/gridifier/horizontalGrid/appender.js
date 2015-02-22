Gridifier.HorizontalGrid.Appender = function(gridifier, 
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

Gridifier.HorizontalGrid.Appender.prototype.append = function(item) {
    this._initConnectors();
    
    var connection = this._createConnectionPerItem(item);
    Logger.log(                 // @system-log-start
        "connection created",
        "---",
        this._connectors.get(),
        this._connections.get()
    );                          // @system-log-end
    this._connections.attachConnectionToRanges(connection);
    this._connectorsCleaner.deleteAllTooLeftConnectorsFromMostRightConnector();
    Logger.log(                 // @system-log-start
        "deleteAllTooLeftConnectorsFromMostRightConnector",
        "---",
        this._connectors.get(),
        this._connections.get()
    );                          // @system-log-end
    this._connectorsCleaner.deleteAllIntersectedFromRightConnectors();
    Logger.log(                 // @system-log-start
        "deleteAllIntersectedFromRightConnectors",
        "---",
        this._connectors.get(),
        this._connections.get()
    );                          // @system-log-end
    
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

Gridifier.HorizontalGrid.Appender.prototype._initConnectors = function() {
    if(this._operation.isInitialOperation(Gridifier.OPERATIONS.APPEND)) {
        this.createInitialConnector();
        return;
    }

    if(!this._operation.isCurrentOperationSameAsPrevious(Gridifier.OPERATIONS.APPEND)) {
        this.recreateConnectorsPerAllConnectedItems();
        Logger.log(                     // @system-log-start
            "initConnectors",
            "isCurrentOperationSameAsPrevious -> recreateConnectorsPerAllConnectedItems",
            this._connectors.get(),
            this._connections.get()
        );                              // @system-log-end
        this._connectorsCleaner.deleteAllIntersectedFromRightConnectors();
        Logger.log(                 // @system-log-start
            "initConnectors",
            "isCurrentOperationSameAsPrevious -> deleteAllIntersectedFromRightConnectors",
            this._connectors.get(),
            this._connections.get()
        );                          // @system-log-end
        this._connectorsCleaner.deleteAllTooLeftConnectorsFromMostRightConnector();
        Logger.log(                 // @system-log-start
            "initConnectors",
            "isCurrentOperationSameAsPrevious -> deleteAllTooLeftConnectorsFromMostRightConnector",
            this._connectors.get(),
            this._connections.get()
        );                          // @system-log-end
    }
}

Gridifier.HorizontalGrid.Appender.prototype.createInitialConnector = function() {
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

Gridifier.HorizontalGrid.Appender.prototype.recreateConnectorsPerAllConnectedItems = function() {
    this._connectors.flush();

    var connections = this._connections.get();
    for(var i = 0; i < connections.length; i++) {
        this._addItemConnectors(connections[i], connections[i].itemGUID);
    }

    if(this._connectors.count() == 0) 
        this.createInitialConnector();
}

Gridifier.HorizontalGrid.Appender.prototype._addItemConnectors = function(itemCoords, itemGUID) {
    if((itemCoords.y2 + 1) <= this._gridifier.getGridY2()) {
        this._connectors.addAppendConnector(
            Gridifier.Connectors.SIDES.BOTTOM.LEFT,
            parseFloat(itemCoords.x1),
            parseFloat(itemCoords.y2 + 1),
            Dom.toInt(itemGUID)
        );
    }

    this._connectors.addAppendConnector(
        Gridifier.Connectors.SIDES.RIGHT.TOP,
        parseFloat(itemCoords.x2 + 1),
        parseFloat(itemCoords.y1),
        Dom.toInt(itemGUID)
    );
}

Gridifier.HorizontalGrid.Appender.prototype._createConnectionPerItem = function(item) {
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

Gridifier.HorizontalGrid.Appender.prototype._filterConnectorsPerNextConnection = function() {
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
        var connectorsSide = Gridifier.Connectors.SIDES.RIGHT.TOP;

        this._connectorsSelector.attachConnectors(connectors);
        this._connectorsSelector.selectOnlyMostRightConnectorFromSide(connectorsSide);
        connectors = this._connectorsSelector.getSelectedConnectors();
        Logger.log(                     // @system-log-start
            "createConnectionPerItem",
            "filterConnectorsPerNextConnection -> isNoIntersectionsStrategy() -> selectOnlyMostRightConnectorFromSide(RIGHT.TOP)",
            connectors,
            this._connections.get()
        );                              // @system-log-end
        
        this._connectorsShifter.attachConnectors(connectors);
        this._connectorsShifter.shiftAllWithSpecifiedSideToTopGridCorner(connectorsSide);
        connectors = this._connectorsShifter.getAllConnectors();
        Logger.log(                     // @system-log-start
            "createConnectionPerItem",
            "filterConnectorsPerNextConnection -> isNoIntersectionsStrategy() -> shiftAllWithSpecifiedSideToTopGridCorner(RIGHT.TOP)",
            connectors,
            this._connections.get()
        );                              // @system-log-end
    }
    
    this._connectorsSorter.attachConnectors(connectors); 
    this._connectorsSorter.sortConnectorsForAppend(Gridifier.APPEND_TYPES.DEFAULT_APPEND);
    
    return this._connectorsSorter.getConnectors();
}

Gridifier.HorizontalGrid.Appender.prototype._findItemConnectionCoords = function(item, sortedConnectors) {
    var itemConnectionCoords = null;
    Logger.startLoggingFindItemConnectionCoords(); // @system-log
    
    for(var i = 0; i < sortedConnectors.length; i++) {
        Logger.logFindItemConnectionCoordsInspectConnector(sortedConnectors[i], this._connections.get()); // @system-log
        var itemCoords = this._itemCoordsExtractor.connectorToAppendedItemCoords(item, sortedConnectors[i]);

        if(itemCoords.y2 > this._normalizer.normalizeHighRounding(this._gridifier.getGridY2())) {
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
        
        var connectionsBehindCurrent = this._connections.getAllConnectionsBehindX(itemCoords.x2);
        if(this._connections.isAnyConnectionItemGUIDSmallerThan(connectionsBehindCurrent, item)) {
            Logger.logFindItemConnectionCoordsWrongSorting( // @system-log-start
                sortedConnectors[i], itemCoords, connectionsBehindCurrent, this._connections.get()
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