Gridifier.VerticalGrid.ReversedPrepender = function(gridifier, 
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
    this._guid = null;
    this._renderer = null;
    this._normalizer = null;
    this._operation = null;
    this._connectors = null;
    this._connections = null;

    this._connectorsCleaner = null;
    this._connectorsShifter = null;
    this._connectorsSelector = null;
    this._connectorsSorter = null;
    this._itemCoordsExtractor = null;
    this._connectionsIntersector = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._settings = settings;
        me._sizesResolverManager = sizesResolverManager;
        me._guid = guid;
        me._renderer = renderer;
        me._normalizer = normalizer;
        me._operation = operation;
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

Gridifier.VerticalGrid.ReversedPrepender.prototype.reversedPrepend = function(item) {
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
    var wereItemsNormalized = this._connections.normalizeVerticalPositionsOfAllConnectionsAfterPrepend(
        connection, this._connectors.get()
    );
    /* @system-log-start */
    Logger.log(
        "normalizeVerticalPositionsOfAllConnectionsAfterPrepend",
        "---",
        this._connectors.get(),
        this._connections.get()
    );
    /* @system-log-end */
    this._connections.attachConnectionToRanges(connection);

    this._connectorsCleaner.deleteAllTooLowConnectorsFromMostTopConnector();
    /* @system-log-start */
    Logger.log(
        "deleteAllTooLowConnectorsFromMostTopConnector",
        "---",
        this._connectors.get(),
        this._connections.get()
    );
    /* @system-log-end */
    this._connectorsCleaner.deleteAllIntersectedFromTopConnectors();
    /* @system-log-start */
    Logger.log(
        "deleteAllIntersectedFromTopConnectors",
        "---",
        this._connectors.get(),
        this._connections.get()
    );
    /* @system-log-end */

    if(wereItemsNormalized) {
        this._renderer.renderConnections(this._connections.get(), [connection]);
        /* @system-log-start */
        Logger.log(
            "renderConnectionsAfterPrependNormalization",
            "",
            this._connectors.get(),
            this._connections.get()
        );
        /* @system-log-end */
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

        this._renderer.renderConnectionsAfterDelay(rowConnections);
        this._renderer.showConnections(connection);
    }
}

Gridifier.VerticalGrid.ReversedPrepender.prototype._initConnectors = function() {
    if(this._operation.isInitialOperation(Gridifier.OPERATIONS.REVERSED_PREPEND)) {
        this.createInitialConnector();
        return;
    }

    if(!this._operation.isCurrentOperationSameAsPrevious(Gridifier.OPERATIONS.REVERSED_PREPEND)) {
        this.recreateConnectorsPerAllConnectedItems();
        /* @system-log-start */
        Logger.log(
            "initConnectors",
            "isCurrentOperationSameAsPrevious -> recreateConnectorsPerAllConnectedItems",
            this._connectors.get(),
            this._connections.get()
        );
        /* @system-log-end */
        this._connectorsCleaner.deleteAllIntersectedFromTopConnectors();
        /* @system-log-start */
        Logger.log(
            "initConnectors",
            "isCurrentOperationSameAsPrevious -> deleteAllIntersectedFromTopConnectors",
            this._connectors.get(),
            this._connections.get()
        );
        /* @system-log-end */
        this._connectorsCleaner.deleteAllTooLowConnectorsFromMostTopConnector();
        /* @system-log-start */
        Logger.log(
            "initConnectors",
            "isCurrentOperationSameAsPrevious -> deleteAllTooLowConnectorsFromMostTopConnector",
            this._connectors.get(),
            this._connections.get()
        );
        /* @system-log-end */
    }
}

Gridifier.VerticalGrid.ReversedPrepender.prototype.createInitialConnector = function() {
    this._connectors.addPrependConnector(
        Gridifier.Connectors.SIDES.LEFT.BOTTOM,
        this._gridifier.getGridX2(),
        0
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

Gridifier.VerticalGrid.ReversedPrepender.prototype.recreateConnectorsPerAllConnectedItems = function() {
    this._connectors.flush();

    var connections = this._connections.get();
    for(var i = 0; i < connections.length; i++) {
        this._addItemConnectors(connections[i], connections[i].itemGUID);
    }

    if(this._connectors.count() == 0)
        this.createInitialConnector();
}

Gridifier.VerticalGrid.ReversedPrepender.prototype._addItemConnectors = function(itemCoords, itemGUID) {
    if((itemCoords.x1 - 1) >= 0) {
        this._connectors.addPrependConnector(
            Gridifier.Connectors.SIDES.LEFT.BOTTOM,
            parseFloat(itemCoords.x1 - 1),
            parseFloat(itemCoords.y2),
            Dom.toInt(itemGUID)
        );
    }

    this._connectors.addPrependConnector(
        Gridifier.Connectors.SIDES.TOP.RIGHT,
        parseFloat(itemCoords.x2),
        parseFloat(itemCoords.y1 - 1),
        Dom.toInt(itemGUID)
    );
}

Gridifier.VerticalGrid.ReversedPrepender.prototype._createConnectionPerItem = function(item) {
    var sortedConnectors = this._filterConnectorsPerNextConnection();
    var itemConnectionCoords = this._findItemConnectionCoords(item, sortedConnectors);

    var connection = this._connections.add(item, itemConnectionCoords);
    if(this._settings.isNoIntersectionsStrategy()) {
        this._connections.expandVerticallyAllRowConnectionsToMostTall(connection);
        /* @system-log-start */
        Logger.log(
            "createConnectionPerItem",
            "isNoIntersectionsStrategy -> expandVerticallyAllRowConnectionsToMostTall",
            sortedConnectors,
            this._connections.get()
        );
        /* @system-log-end */
    }
    this._addItemConnectors(itemConnectionCoords, this._guid.getItemGUID(item));
    this._guid.markAsPrependedItem(item);

    return connection;
}

Gridifier.VerticalGrid.ReversedPrepender.prototype._filterConnectorsPerNextConnection = function() {
    var connectors = this._connectors.getClone();

    this._connectorsSelector.attachConnectors(connectors);
    this._connectorsSelector.selectOnlySpecifiedSideConnectorsOnAppendedItems(Gridifier.Connectors.SIDES.TOP.RIGHT);
    connectors = this._connectorsSelector.getSelectedConnectors();
    /* @system-log-start */
    Logger.log(
        "createConnectionPerItem",
        "filterConnectorsPerNextConnection -> selectOnlySpecifiedSideConnectorsOnAppendedItems(TOP.RIGHT)",
        connectors,
        this._connections.get()
    );
    /* @system-log-end */

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
        var connectorsSide = Gridifier.Connectors.SIDES.TOP.RIGHT;

        this._connectorsSelector.attachConnectors(connectors);
        this._connectorsSelector.selectOnlyMostTopConnectorFromSide(connectorsSide);
        connectors = this._connectorsSelector.getSelectedConnectors();
        /* @system-log-start */
        Logger.log(
            "createConnectionPerItem",
            "filterConnectorsPerNextConnection -> isNoIntersectionsStrategy() -> selectOnlyMostTopConnectorFromSide(TOP.RIGHT)",
            connectors,
            this._connections.get()
        );
        /* @system-log-end */
        
        this._connectorsShifter.attachConnectors(connectors);
        this._connectorsShifter.shiftAllWithSpecifiedSideToRightGridCorner(connectorsSide);
        connectors = this._connectorsShifter.getAllConnectors();
        /* @system-log-start */
        Logger.log(
            "createConnectionPerItem",
            "filterConnectorsPerNextConnection -> isNoIntersectionsStrategy() -> shiftAllWithSpecifiedSideToLeftGridCorner(TOP.RIGHT)",
            connectors,
            this._connections.get()
        );
        /* @system-log-end */
    }

    this._connectorsSorter.attachConnectors(connectors);
    this._connectorsSorter.sortConnectorsForPrepend(Gridifier.PREPEND_TYPES.REVERSED_PREPEND);

    return this._connectorsSorter.getConnectors();
}

Gridifier.VerticalGrid.ReversedPrepender.prototype._findItemConnectionCoords = function(item, sortedConnectors) {
    var itemConnectionCoords = null;
    /* @system-log-start */
    Logger.startLoggingFindItemConnectionCoords();
    /* @system-log-end */

    for(var i = 0; i < sortedConnectors.length; i++) {
        /* @system-log-start */
        Logger.logFindItemConnectionCoordsInspectConnector(sortedConnectors[i], this._connections.get());
        /* @system-log-end */
        var itemCoords = this._itemCoordsExtractor.connectorToReversedPrependedItemCoords(item, sortedConnectors[i]);
        if(itemCoords.x1 < this._normalizer.normalizeLowRounding(0)) {
            /* @system-log-start */
            Logger.logFindItemConnectionCoordsOutOfLayoutBounds(
                sortedConnectors[i], itemCoords, this._connections.get()
            );
            /* @system-log-end */
            continue;
        }

        var maybeIntersectableConnections = this._connectionsIntersector.findAllMaybeIntersectableConnectionsOnPrepend(sortedConnectors[i]);
        if(this._connectionsIntersector.isIntersectingAnyConnection(maybeIntersectableConnections, itemCoords)) {
            /* @system-log-start */
            Logger.logFindItemConnectionCoordsIntersectionFound(
                sortedConnectors[i], itemCoords, maybeIntersectableConnections, this._connections.get()
            );
            /* @system-log-end */
            continue;
        }

        itemConnectionCoords = itemCoords;

        var connectionsAboveCurrent = this._connections.getAllConnectionsAboveY(itemCoords.y1);
        if(this._connections.isAnyConnectionItemGUIDBiggerThan(connectionsAboveCurrent, item)) {
            /* @system-log-start */
            Logger.logFindItemConnectionCoordsWrongSorting( 
                sortedConnectors[i], itemCoords, connectionsAboveCurrent, this._connections.get()
            );
            /* @system-log-end */
            continue;
        }

        if(this._settings.isNoIntersectionsStrategy()) {
            if(this._connections.isIntersectingMoreThanOneConnectionItemVertically(itemConnectionCoords)) {
                /* @system-log-start */
                Logger.logFindItemConnectionCoordsVerticalIntersectionsError(
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

    if(itemConnectionCoords == null) {
        var errorType = Gridifier.Error.ERROR_TYPES.INSERTER.TOO_WIDE_ITEM_ON_VERTICAL_GRID_INSERT;
        new Gridifier.Error(errorType, item);
    }

    return itemConnectionCoords;
}