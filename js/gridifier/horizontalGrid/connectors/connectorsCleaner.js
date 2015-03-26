Gridifier.HorizontalGrid.ConnectorsCleaner = function(connectors, connections, settings) {
    var me = this;

    this._connectors = null;
    this._connections = null;
    this._settings = null;

    this._connectionItemIntersectionStrategy = null;

    this._css = {
    };

    this._construct = function() {
        me._connectors = connectors;
        me._connections = connections;
        me._settings = settings;

        if(me._settings.isDisabledSortDispersion()) {
            me.setConnectorInsideOrBeforeItemIntersectionStrategy();
        }
        else if(me._settings.isCustomSortDispersion() ||
                me._settings.isCustomAllEmptySpaceSortDispersion()) {
            me.setConnectorInsideItemIntersectionStrategy();
        }
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

Gridifier.HorizontalGrid.ConnectorsCleaner.CONNECTION_ITEM_INTERSECTION_STRATEGIES = {
    CONNECTOR_INSIDE_CONNECTION_ITEM: 0,
    CONNECTOR_INSIDE_OR_BEFORE_CONNECTION_ITEM: 1
};

Gridifier.HorizontalGrid.ConnectorsCleaner.MAX_VALID_HORIZONTAL_DISTANCE = {
    FROM_MOST_RIGHT_CONNECTOR: 3000,
    FROM_MOST_LEFT_CONNECTOR: 3000
};

Gridifier.HorizontalGrid.ConnectorsCleaner.prototype.setConnectorInsideItemIntersectionStrategy = function() {
    var intersectionStrategies = Gridifier.HorizontalGrid.ConnectorsCleaner.CONNECTION_ITEM_INTERSECTION_STRATEGIES;
    this._connectionItemIntersectionStrategy = intersectionStrategies.CONNECTOR_INSIDE_CONNECTION_ITEM;
}

Gridifier.HorizontalGrid.ConnectorsCleaner.prototype.setConnectorInsideOrBeforeItemIntersectionStrategy = function() {
    var intersectionStrategies = Gridifier.HorizontalGrid.ConnectorsCleaner.CONNECTION_ITEM_INTERSECTION_STRATEGIES;
    this._connectionItemIntersectionStrategy = intersectionStrategies.CONNECTOR_INSIDE_OR_BEFORE_CONNECTION_ITEM;
}

Gridifier.HorizontalGrid.ConnectorsCleaner.prototype.isConnectorInsideItemIntersectionStrategy = function() {
    var intersectionStrategies = Gridifier.HorizontalGrid.ConnectorsCleaner.CONNECTION_ITEM_INTERSECTION_STRATEGIES;
    return (this._connectionItemIntersectionStrategy == intersectionStrategies.CONNECTOR_INSIDE_CONNECTION_ITEM);
}

Gridifier.HorizontalGrid.ConnectorsCleaner.prototype.isConnectorInsideOrBeforeItemIntersectionStrategy = function() {
    var intersectionStrategies = Gridifier.HorizontalGrid.ConnectorsCleaner.CONNECTION_ITEM_INTERSECTION_STRATEGIES;
    return (this._connectionItemIntersectionStrategy == intersectionStrategies.CONNECTOR_INSIDE_OR_BEFORE_CONNECTION_ITEM);
}

Gridifier.HorizontalGrid.ConnectorsCleaner.prototype._isMappedConnectorIntersectingAnyLeftConnectionItem = function(mappedConnector) {
    var connections = this._connections.get();

    for(var i = 0; i < mappedConnector.connectionIndexes.length; i++) {
        for(var j = 0; j < mappedConnector.connectionIndexes[i].length; j++) {
            var connection = connections[mappedConnector.connectionIndexes[i][j]];

            if(this.isConnectorInsideOrBeforeItemIntersectionStrategy())
                var horizontalIntersectionCond = (mappedConnector.x >= connection.x1);
            else if(this.isConnectorInsideItemIntersectionStrategy())
                var horizontalIntersectionCond = (mappedConnector.x >= connection.x1 
                                                  && mappedConnector.x <= connection.x2);

            if(mappedConnector.y >= connection.y1 && mappedConnector.y <= connection.y2
                && horizontalIntersectionCond)
                return true;
        }
    }

    return false;
}

Gridifier.HorizontalGrid.ConnectorsCleaner.prototype.deleteAllIntersectedFromLeftConnectors = function() {
    var connectors = this._connectors.get();
    var mappedConnectors = this._connectors.getClone();

    mappedConnectors.sort(function(firstConnector, secondConnector) {
        if(firstConnector.x == secondConnector.x)
            return 0;
        else if(firstConnector.x > secondConnector.x)
            return -1;
        else
            return 1;
    });
    mappedConnectors = this._connections.mapAllIntersectedAndLeftConnectionsPerEachConnector(
        mappedConnectors
    );

    for(var i = 0; i < mappedConnectors.length; i++) {
        if(this._isMappedConnectorIntersectingAnyLeftConnectionItem(mappedConnectors[i]))
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

Gridifier.HorizontalGrid.ConnectorsCleaner.prototype.deleteAllTooRightConnectorsFromMostLeftConnector = function() {
    var connectors = this._connectors.get();
    if(connectors.length == 0) return;

    var mostLeftConnector = connectors[0];
    for(var i = 1; i < connectors.length; i++) {
        if(connectors[i].x < mostLeftConnector.x)
            mostLeftConnector = connectors[i];
    }

    var cc = Gridifier.HorizontalGrid.ConnectorsCleaner;
    var maxValidX = mostLeftConnector.x + cc.MAX_VALID_HORIZONTAL_DISTANCE.FROM_MOST_LEFT_CONNECTOR;
    for(var i = 0; i < connectors.length; i++) {
        if(connectors[i].x > maxValidX) {
            connectors.splice(i, 1);
            i--;
        }
    }
}

Gridifier.HorizontalGrid.ConnectorsCleaner.prototype._isMappedConnectorIntersectingAnyRightConnectionItem = function(mappedConnector) {
    var connections = this._connections.get();

    for(var i = 0; i < mappedConnector.connectionIndexes.length; i++) {
        for(var j = 0; j < mappedConnector.connectionIndexes[i].length; j++) {
            var connection = connections[mappedConnector.connectionIndexes[i][j]];

            if(this.isConnectorInsideOrBeforeItemIntersectionStrategy())
                var horizontalIntersectionCond = (mappedConnector.x <= connection.x2);
            else if(this.isConnectorInsideItemIntersectionStrategy())
                var horizontalIntersectionCond = (mappedConnector.x <= connection.x2
                                                  && mappedConnector.x >= connection.x1);

            if(mappedConnector.y >= connection.y1 && mappedConnector.y <= connection.y2
                && horizontalIntersectionCond)
                return true;
        }
    }
    
    return false;
}

Gridifier.HorizontalGrid.ConnectorsCleaner.prototype.deleteAllIntersectedFromRightConnectors = function() {
    var connectors = this._connectors.get();
    var mappedConnectors = this._connectors.getClone();

    mappedConnectors.sort(function(firstConnector, secondConnector) {
        if(firstConnector.x == secondConnector.x)
            return 0;
        else if(firstConnector.x < secondConnector.x)
            return -1;
        else 
            return 1;
    });

    mappedConnectors = this._connections.mapAllIntersectedAndRightConnectionsPerEachConnector(
        mappedConnectors
    );

    for(var i = 0; i < mappedConnectors.length; i++) {
        if(this._isMappedConnectorIntersectingAnyRightConnectionItem(mappedConnectors[i])) 
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

Gridifier.HorizontalGrid.ConnectorsCleaner.prototype.deleteAllTooLeftConnectorsFromMostRightConnector = function() {
    var connectors = this._connectors.get();
    if(connectors.length == 0) return;

    var mostRightConnector = connectors[0];
    for(var i = 1; i < connectors.length; i++) {
        if(connectors[i].x > mostRightConnector.x)
            mostRightConnector = connectors[i];
    }

    var cc = Gridifier.HorizontalGrid.ConnectorsCleaner;
    var minValidX = mostRightConnector.x - cc.MAX_VALID_HORIZONTAL_DISTANCE.FROM_MOST_RIGHT_CONNECTOR;
    for(var i = 0; i < connectors.length; i++) {
        if(connectors[i].x < minValidX) {
            connectors.splice(i, 1);
            i--;
        }
    }
}