Gridifier.VerticalGrid.ConnectorsCleaner = function(connectors, connections, settings) {
    var me = this;

    this._connectors = null;
    this._connections = null;
    this._settings = null;

    this._connectorsNormalizer = null;

    this._connectionItemIntersectionStrategy = null;

    this._css = {
    };

    this._construct = function() {
        me._connectors = connectors;
        me._connections = connections;
        me._settings = settings;

        me._connectorsNormalizer = new Gridifier.ConnectorsNormalizer(
            me._connections, me._connectors, me._settings
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

Gridifier.VerticalGrid.ConnectorsCleaner.CONNECTION_ITEM_INTERSECTION_STRATEGIES = {
    CONNECTOR_INSIDE_CONNECTION_ITEM: 0,
    CONNECTOR_INSIDE_OR_BEFORE_CONNECTION_ITEM: 1
};

Gridifier.VerticalGrid.ConnectorsCleaner.MAX_VALID_VERTICAL_DISTANCE = {
    FROM_MOST_BOTTOM_CONNECTOR: 3000,
    FROM_MOST_TOP_CONNECTOR: 3000
};

Gridifier.VerticalGrid.ConnectorsCleaner.prototype.setConnectorInsideItemIntersectionStrategy = function() {
    var intersectionStrategies = Gridifier.VerticalGrid.ConnectorsCleaner.CONNECTION_ITEM_INTERSECTION_STRATEGIES;
    this._connectionItemIntersectionStrategy = intersectionStrategies.CONNECTOR_INSIDE_CONNECTION_ITEM;
}

Gridifier.VerticalGrid.ConnectorsCleaner.prototype.setConnectorInsideOrBeforeItemIntersectionStrategy = function() {
    var intersectionStrategies = Gridifier.VerticalGrid.ConnectorsCleaner.CONNECTION_ITEM_INTERSECTION_STRATEGIES;
    this._connectionItemIntersectionStrategy = intersectionStrategies.CONNECTOR_INSIDE_OR_BEFORE_CONNECTION_ITEM;
}

Gridifier.VerticalGrid.ConnectorsCleaner.prototype._updateConnectorIntersectionStrategy = function() {
    if(this._settings.isDisabledSortDispersion()) {
        this.setConnectorInsideOrBeforeItemIntersectionStrategy();
    }
    else if(this._settings.isCustomSortDispersion() ||
        this._settings.isCustomAllEmptySpaceSortDispersion()) {
        this.setConnectorInsideItemIntersectionStrategy();
    }
}

Gridifier.VerticalGrid.ConnectorsCleaner.prototype.isConnectorInsideItemIntersectionStrategy = function() {
    this._updateConnectorIntersectionStrategy();
    var intersectionStrategies = Gridifier.VerticalGrid.ConnectorsCleaner.CONNECTION_ITEM_INTERSECTION_STRATEGIES;
    return (this._connectionItemIntersectionStrategy == intersectionStrategies.CONNECTOR_INSIDE_CONNECTION_ITEM);
}

Gridifier.VerticalGrid.ConnectorsCleaner.prototype.isConnectorInsideOrBeforeItemIntersectionStrategy = function() {
    this._updateConnectorIntersectionStrategy();
    var intersectionStrategies = Gridifier.VerticalGrid.ConnectorsCleaner.CONNECTION_ITEM_INTERSECTION_STRATEGIES;
    return (this._connectionItemIntersectionStrategy == intersectionStrategies.CONNECTOR_INSIDE_OR_BEFORE_CONNECTION_ITEM);
}

Gridifier.VerticalGrid.ConnectorsCleaner.prototype._isMappedConnectorIntersectingAnyTopConnectionItem = function(mappedConnector) {
    var connections = this._connections.get();

    for(var i = 0; i < mappedConnector.connectionIndexes.length; i++) {
        for(var j = 0; j < mappedConnector.connectionIndexes[i].length; j++) {
            var connection = connections[mappedConnector.connectionIndexes[i][j]];
            this._connectorsNormalizer.applyConnectionRoundingPerConnector(connection, mappedConnector);

            if(this.isConnectorInsideOrBeforeItemIntersectionStrategy())
                var verticalIntersectionCond = mappedConnector.y >= connection.y1;
            else if(this.isConnectorInsideItemIntersectionStrategy())
                var verticalIntersectionCond = mappedConnector.y >= connection.y1
                                                && mappedConnector.y <= connection.y2;

            if(mappedConnector.x >= connection.x1 && mappedConnector.x <= connection.x2
                && verticalIntersectionCond) {
                this._connectorsNormalizer.unapplyConnectionRoundingPerConnector(connection, mappedConnector);
                return true;
            }

            this._connectorsNormalizer.unapplyConnectionRoundingPerConnector(connection, mappedConnector);
        }
    }

    return false;
}

Gridifier.VerticalGrid.ConnectorsCleaner.prototype.deleteAllIntersectedFromTopConnectors = function() {
    var connectors = this._connectors.get();
    var mappedConnectors = this._connectors.getClone();

    mappedConnectors.sort(function(firstConnector, secondConnector) {
        if(firstConnector.y == secondConnector.y)
            return 0;
        else if(firstConnector.y > secondConnector.y)
            return -1;
        else
            return 1;
    });
    mappedConnectors = this._connections.mapAllIntersectedAndUpperConnectionsPerEachConnector(
        mappedConnectors
    );

    for(var i = 0; i < mappedConnectors.length; i++) {
        if(this._isMappedConnectorIntersectingAnyTopConnectionItem(mappedConnectors[i]))
            connectors[mappedConnectors[i].connectorIndex].isIntersected = true;
        else
            connectors[mappedConnectors[i].connectorIndex].isIntersected = false;
    }

    for(var i = 0; i < connectors.length; i++) {
        if(connectors[i].isIntersected) {
            connectors.splice(i, 1);
            i--;
        }
    }
}

Gridifier.VerticalGrid.ConnectorsCleaner.prototype.deleteAllTooLowConnectorsFromMostTopConnector = function() {
    var connectors = this._connectors.get();
    if(connectors.length == 0) return;

    var mostTopConnector = connectors[0];
    for(var i = 1; i < connectors.length; i++) {
        if(connectors[i].y < mostTopConnector.y)
            mostTopConnector = connectors[i];
    }

    var cc = Gridifier.VerticalGrid.ConnectorsCleaner;
    var maxValidY = mostTopConnector.y + this._settings.getMaxInsertionRange();
    for(var i = 0; i < connectors.length; i++) {
        if(connectors[i].y > maxValidY) {
            connectors.splice(i, 1);
            i--;
        }
    }
}

Gridifier.VerticalGrid.ConnectorsCleaner.prototype._isMappedConnectorIntersectingAnyBottomConnectionItem = function(mappedConnector) {
    var connections = this._connections.get();

    for(var i = 0; i < mappedConnector.connectionIndexes.length; i++) {
        for(var j = 0; j < mappedConnector.connectionIndexes[i].length; j++) {
            var connection = connections[mappedConnector.connectionIndexes[i][j]];
            this._connectorsNormalizer.applyConnectionRoundingPerConnector(connection, mappedConnector);

            if(this.isConnectorInsideOrBeforeItemIntersectionStrategy())
                var verticalIntersectionCond = ((mappedConnector.y) <= (connection.y2));
            else if(this.isConnectorInsideItemIntersectionStrategy())
                var verticalIntersectionCond = ((mappedConnector.y) <= (connection.y2)
                && (mappedConnector.y) >= connection.y1);

            if(mappedConnector.x >= connection.x1 && mappedConnector.x <= connection.x2
                && verticalIntersectionCond) {
                this._connectorsNormalizer.unapplyConnectionRoundingPerConnector(connection, mappedConnector);
                return true;
            }

            this._connectorsNormalizer.unapplyConnectionRoundingPerConnector(connection, mappedConnector);
        }
    }

    return false;
}

Gridifier.VerticalGrid.ConnectorsCleaner.prototype.deleteAllIntersectedFromBottomConnectors = function() {
    var connectors = this._connectors.get();
    var mappedConnectors = this._connectors.getClone();

    mappedConnectors.sort(function(firstConnector, secondConnector) {
        if(firstConnector.y == secondConnector.y)
            return 0;
        else if(firstConnector.y < secondConnector.y)
            return -1;
        else 
            return 1;
    });

    mappedConnectors = this._connections.mapAllIntersectedAndLowerConnectionsPerEachConnector(
        mappedConnectors
    );

    for(var i = 0; i < mappedConnectors.length; i++) {
        if(this._isMappedConnectorIntersectingAnyBottomConnectionItem(mappedConnectors[i])) 
            connectors[mappedConnectors[i].connectorIndex].isIntersected = true;
        else
            connectors[mappedConnectors[i].connectorIndex].isIntersected = false;
    }

    for(var i = 0; i < connectors.length; i++) {
        if(connectors[i].isIntersected) {
            connectors.splice(i, 1);
            i--;
        }
    }
}

Gridifier.VerticalGrid.ConnectorsCleaner.prototype.deleteAllTooHighConnectorsFromMostBottomConnector = function() {
    var connectors = this._connectors.get();
    if(connectors.length == 0) return;

    var mostBottomConnector = connectors[0];
    for(var i = 1; i < connectors.length; i++) {
        if(connectors[i].y > mostBottomConnector.y)
            mostBottomConnector = connectors[i];
    }

    var cc = Gridifier.VerticalGrid.ConnectorsCleaner;
    var minValidY = mostBottomConnector.y - this._settings.getMaxInsertionRange();
    for(var i = 0; i < connectors.length; i++) {
        if(connectors[i].y < minValidY) {
            connectors.splice(i, 1);
            i--;
        }
    }
}