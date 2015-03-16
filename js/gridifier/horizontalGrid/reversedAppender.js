Gridifier.HorizontalGrid.ReversedAppender = function(gridifier,
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

Gridifier.HorizontalGrid.ReversedAppender.prototype.reversedAppend = function(item) {
    this._initConnectors();

    var connection = this._createConnectionPerItem(item);
    /* @system-log-start */
    Logger.log(
        "connection created",
        "---",
        this._connectors.get(),
        this._connections.get()
    );
    /* @system-log-end */
    this._connections.attachConnectionToRanges(connection);

    this._connectorsCleaner.deleteAllTooLeftConnectorsFromMostRightConnector();
    /* @system-log-start */
    Logger.log(
        "deleteAllTooLeftConnectorsFromMostRightConnector",
        "---",
        this._connectors.get(),
        this._connections.get()
    );
    /* @system-log-end */
    this._connectorsCleaner.deleteAllIntersectedFromRightConnectors();
    /* @system-log-start */
    Logger.log(
        "deleteAllIntersectedFromRightConnectors",
        "",
        this._connectors.get(),
        this._connections.get()
    );
    /* @system-log-end */

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

        this._renderer.renderConnectionsAfterDelay(colConnections);
        this._renderer.showConnections(connection);
    }
}

Gridifier.HorizontalGrid.ReversedAppender.prototype._initConnectors = function() {
    if(this._operation.isInitialOperation(Gridifier.OPERATIONS.REVERSED_APPEND)) {
        this.createInitialConnector();
        return;
    }

    if(!this._operation.isCurrentOperationSameAsPrevious(Gridifier.OPERATIONS.REVERSED_APPEND)) {
        this.recreateConnectorsPerAllConnectedItems();
        /* @system-log-start */
        Logger.log(
            "initConnectors",
            "isCurrentOperationSameAsPrevious -> recreateConnectorsPerAllConnectedItems",
            this._connectors.get(),
            this._connections.get()
        );
        /* @system-log-end */
        this._connectorsCleaner.deleteAllIntersectedFromRightConnectors();
        /* @system-log-start */
        Logger.log(
            "initConnectors",
            "isCurrentOperationSameAsPrevious -> deleteAllIntersectedFromRightConnectors",
            this._connectors.get(),
            this._connections.get()
        );
        /* @system-log-end */
        this._connectorsCleaner.deleteAllTooLeftConnectorsFromMostRightConnector();
        /* @system-log-start */
        Logger.log(
            "initConnectors",
            "isCurrentOperationSameAsPrevious -> deleteAllTooLeftConnectorsFromMostRightConnector",
            this._connectors.get(),
            this._connections.get()
        );
        /* @system-log-end */
    }
}

Gridifier.HorizontalGrid.ReversedAppender.prototype.createInitialConnector = function() {
    this._connectors.addAppendConnector(
        Gridifier.Connectors.SIDES.TOP.LEFT,
        0,
        parseFloat(this._gridifier.getGridY2())
    );
    /* @system-log-start */
    Logger.log(
        "initConnectors",
        "isInitialOperation -> createInitialConnector",
        this._connectors.get(),
        this._connections.get()
    );
    /* @system-log-end */
}

Gridifier.HorizontalGrid.ReversedAppender.prototype.recreateConnectorsPerAllConnectedItems = function() {
    this._connectors.flush();

    var connections = this._connections.get(); 
    for(var i = 0; i < connections.length; i++) {
        this._addItemConnectors(connections[i], connections[i].itemGUID);
    }

    if(this._connectors.count() == 0)
        this.createInitialConnector();
}

Gridifier.HorizontalGrid.ReversedAppender.prototype._addItemConnectors = function(itemCoords, itemGUID) {
    if((itemCoords.y1 - 1) >= 0) {
        this._connectors.addAppendConnector(
            Gridifier.Connectors.SIDES.TOP.LEFT,
            parseFloat(itemCoords.x1),
            parseFloat(itemCoords.y1 - 1),
            Dom.toInt(itemGUID)
        );
    }

    this._connectors.addAppendConnector(
        Gridifier.Connectors.SIDES.RIGHT.BOTTOM,
        parseFloat(itemCoords.x2 + 1),
        parseFloat(itemCoords.y2),
        Dom.toInt(itemGUID)
    );
}

Gridifier.HorizontalGrid.ReversedAppender.prototype._createConnectionPerItem = function(item) {
    var sortedConnectors = this._filterConnectorsPerNextConnection();
    var itemConnectionCoords = this._findItemConnectionCoords(item, sortedConnectors);
    var connection = this._connections.add(item, itemConnectionCoords);

    if(this._settings.isNoIntersectionsStrategy()) {
        this._connections.expandHorizontallyAllColConnectionsToMostWide(connection);
        /* @system-log-start */
        Logger.log(
            "createConnectionPerItem",
            "isNoIntersectionsStrategy -> expandHorizontallyAllColConnectionsToMostWide",
            sortedConnectors,
            this._connections.get()
        );
        /* @system-log-end */
    }
    this._addItemConnectors(itemConnectionCoords, this._guid.getItemGUID(item));

    return connection;
}

Gridifier.HorizontalGrid.ReversedAppender.prototype._filterConnectorsPerNextConnection = function() {
    var connectors = this._connectors.getClone();

    if(this._settings.isDefaultIntersectionStrategy()) {
        this._connectorsShifter.attachConnectors(connectors);
        this._connectorsShifter.shiftAllConnectors();
        connectors = this._connectorsShifter.getAllConnectors();
        /* @system-log-start */
        Logger.log(
            "createConnectionPerItem",
            "filterConnectorsPerNextConnection -> isDefaultIntersectionStrategy() -> shiftAllConnectors",
            connectors,
            this._connections.get()
        );
        /* @system-log-end */
    }
    else if(this._settings.isNoIntersectionsStrategy()) {
        var connectorsSide = Gridifier.Connectors.SIDES.RIGHT.BOTTOM;

        this._connectorsSelector.attachConnectors(connectors);
        this._connectorsSelector.selectOnlyMostRightConnectorFromSide(connectorsSide);
        connectors = this._connectorsSelector.getSelectedConnectors();
        /* @system-log-start */
        Logger.log(
            "createConnectionPerItem",
            "filterConnectorsPerNextConnection -> isNoIntersectionsStrategy() -> selectOnlyMostRightConnectorFromSide(RIGHT.BOTTOM)",
            connectors,
            this._connections.get()
        );
        /* @system-log-end */

        this._connectorsShifter.attachConnectors(connectors);
        this._connectorsShifter.shiftAllWithSpecifiedSideToBottomGridCorner(connectorsSide);
        connectors = this._connectorsShifter.getAllConnectors();
        /* @system-log-start */
        Logger.log(
            "createConnectionPerItem",
            "filterConnectorsPerNextConnection -> isNoIntersectionsStrategy() -> shiftAllWithSpecifiedSideToBottomGridCorner(RIGHT.BOTTOM)",
            connectors,
            this._connections.get()
        );
        /* @system-log-end */
    }

    this._connectorsSorter.attachConnectors(connectors);
    this._connectorsSorter.sortConnectorsForAppend(Gridifier.APPEND_TYPES.REVERSED_APPEND);

    return this._connectorsSorter.getConnectors();
}

Gridifier.HorizontalGrid.ReversedAppender.prototype._findItemConnectionCoords = function(item, sortedConnectors) {
    var itemConnectionCoords = null;
    /* @system-log-start */
    Logger.startLoggingFindItemConnectionCoords();
    /* @system-log-end */
    
    for(var i = 0; i < sortedConnectors.length; i++) {
        /* @system-log-start */
        Logger.logFindItemConnectionCoordsInspectConnector(sortedConnectors[i], this._connections.get());
        /* @system-log-end */
        var itemCoords = this._itemCoordsExtractor.connectorToReversedAppendedItemCoords(item, sortedConnectors[i]);

        if(itemCoords.y1 < this._normalizer.normalizeLowRounding(0)) {
            /* @system-log-start */
            Logger.logFindItemConnectionCoordsOutOfLayoutBounds(
                sortedConnectors[i], itemCoords, this._connections.get()
            );
            /* @system-log-end */
            continue;
        }
        
        var maybeIntersectableConnections = this._connectionsIntersector.findAllMaybeIntersectableConnectionsOnAppend(
            sortedConnectors[i]
        );
        if(this._connectionsIntersector.isIntersectingAnyConnection(maybeIntersectableConnections, itemCoords)) {
            /* @system-log-start */
            Logger.logFindItemConnectionCoordsIntersectionFound(
                sortedConnectors[i], itemCoords, maybeIntersectableConnections, this._connections.get()
            );
            /* @system-log-end */
            continue;
        }
        
        itemConnectionCoords = itemCoords;
        
        var connectionsBehindCurrent = this._connections.getAllConnectionsBehindX(itemCoords.x2);
        if(this._connections.isAnyConnectionItemGUIDSmallerThan(connectionsBehindCurrent, item)) {
            /* @system-log-start */
            Logger.logFindItemConnectionCoordsWrongSorting(
                sortedConnectors[i], itemCoords, connectionsBehindCurrent, this._connections.get()
            );
            /* @system-log-end */
            continue;
        }

        if(this._settings.isNoIntersectionsStrategy()) {
            if(this._connections.isIntersectingMoreThanOneConnectionItemHorizontally(itemConnectionCoords)) {
                /* @system-log-start */
                Logger.logFindItemConnectionCoordsHorizontalIntersectionsError(
                    sortedConnectors[i], itemCoords, this._connections.get()
                );
                /* @system-log-end */
                itemConnectionCoords = null;
            }
        }
        
        if(itemConnectionCoords != null) {
            /* @system-log-start */
            Logger.logFindItemConnectionCoordsFound( 
                sortedConnectors[i], itemConnectionCoords, item, this._connections.get()
            );
            Logger.stopLoggingFindItemConnectionCoords();
            /* @system-log-end */
            break;
        }
    }
    
    return itemConnectionCoords;
}