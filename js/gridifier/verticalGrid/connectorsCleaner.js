Gridifier.VerticalGrid.ConnectorsCleaner = function(connectors, connections) {
    var me = this;

    this._connectors = null;
    this._connections = null;

    this._connectionItemIntersectionStrategy = null;

    this._css = {
    };

    this._construct = function() {
        me._connectors = connectors;
        me._connections = connections;

        me.setConnectorInsideOrBeforeItemIntersectionStrategy();
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

Gridifier.VerticalGrid.ConnectorsCleaner.prototype.isConnectorInsideItemIntersectionStrategy = function() {
    var intersectionStrategies = Gridifier.VerticalGrid.ConnectorsCleaner.CONNECTION_ITEM_INTERSECTION_STRATEGIES;
    return (this._connectionItemIntersectionStrategy == intersectionStrategies.CONNECTOR_INSIDE_CONNECTION_ITEM);
}

Gridifier.VerticalGrid.ConnectorsCleaner.prototype.isConnectorInsideOrBeforeItemIntersectionStrategy = function() {
    var intersectionStrategies = Gridifier.VerticalGrid.ConnectorsCleaner.CONNECTION_ITEM_INTERSECTION_STRATEGIES;
    return (this._connectionItemIntersectionStrategy == intersectionStrategies.CONNECTOR_INSIDE_OR_BEFORE_CONNECTION_ITEM);
}

Gridifier.VerticalGrid.ConnectorsCleaner.prototype._isMappedConnectorIntersectingAnyTopConnectionItem = function(mappedConnector) {
    // var connections = this._connections.get();
    // for(var i = 0; i < connections.length; i++) {
    //     if(this.isConnectorInsideOrBeforeItemIntersectionStrategy()) 
    //         var verticalIntersectionCond = (connector.y >= connections[i].y1);
    //     else if(this.isConnectorInsideItemIntersectionStrategy())
    //         var verticalIntersectionCond = (connector.y >= connections[i].y1 
    //                                                           && connector.y <= connections[i].y2);

    //     if(connector.x >= connections[i].x1 && connector.x <= connections[i].x2 
    //         && verticalIntersectionCond)
    //         return true;
    // }

    // return false;
    var connections = this._connections.get();

    for(var i = 0; i < mappedConnector.connectionIndexes.length; i++) {
        for(var j = 0; j < mappedConnector.connectionIndexes[i].length; j++) {
            var connection = connections[mappedConnector.connectionIndexes[i][j]];

            if(this.isConnectorInsideOrBeforeItemIntersectionStrategy())
                var verticalIntersectionCond = (mappedConnector.y >= connection.y1);
            else if(this.isConnectorInsideItemIntersectionStrategy())
                var verticalIntersectionCond = (mappedConnector.y >= connection.y1 
                                                && mappedConnector.y <= connection.y2);

            if(mappedConnector.x >= connection.x1 && mappedConnector.x <= connection.x2
                && verticalIntersectionCond)
                return true;
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

    // var connectors = this._connectors.get();
    // for(var i = 0; i < connectors.length; i++) {
    //     if(this.isConnectorIntersectingAnyTopConnectionItem(connectors[i])) {
    //         connectors.splice(i, 1);
    //         i--;
    //     }
    // }
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
    var maxValidY = mostTopConnector.y + cc.MAX_VALID_VERTICAL_DISTANCE.FROM_MOST_TOP_CONNECTOR;
    for(var i = 0; i < connectors.length; i++) {
        if(connectors[i].y > maxValidY) {
            connectors.splice(i, 1);
            i--;
        }
    }
}

Gridifier.VerticalGrid.ConnectorsCleaner.prototype._isMappedConnectorIntersectingAnyBottomConnectionItem = function(mappedConnector) {
    //var connections = this._connections.get();
    //var connections = this._connections.getAllHorizontallyIntersectedAndLowerConnections(connector);
    //if(time > 0.199)
      //  console.log("time = " + time);
    // console.log("CONN COUNT = ", connections.length);
    // console.log("connector info = ", $.parseJSON(JSON.stringify(connector)));

    // for(var i = 0; i < connections.length; i++) {
    //     if(this.isConnectorInsideOrBeforeItemIntersectionStrategy()) 
    //         var verticalIntersectionCond = (connector.y <= connections[i].y2);
    //     else if(this.isConnectorInsideItemIntersectionStrategy())
    //         var verticalIntersectionCond = (connector.y <= connections[i].y2 
    //                                                           && connector.y >= connections[i].y1);

    //     if(connector.x >= connections[i].x1 && connector.x <= connections[i].x2
    //         && verticalIntersectionCond) 
    //         return true;
    // }
    var connections = this._connections.get();

    for(var i = 0; i < mappedConnector.connectionIndexes.length; i++) {
        for(var j = 0; j < mappedConnector.connectionIndexes[i].length; j++) {
            var connection = connections[mappedConnector.connectionIndexes[i][j]];

            if(this.isConnectorInsideOrBeforeItemIntersectionStrategy())
                var verticalIntersectionCond = (mappedConnector.y <= connection.y2);
            else if(this.isConnectorInsideItemIntersectionStrategy())
                var verticalIntersectionCond = (mappedConnector.y <= connection.y2
                                                && mappedConnector.y >= connection.y1);

            if(mappedConnector.x >= connection.x1 && mappedConnector.x <= connection.x2
                && verticalIntersectionCond)
                return true;
        }
    }
    
    return false;
}

Gridifier.VerticalGrid.ConnectorsCleaner.prototype.deleteAllIntersectedFromBottomConnectors = function() {
    timer.start();
    var connectors = this._connectors.get();
    console.log("get connectors = " + timer.get());
    timer.start();
    var mappedConnectors = this._connectors.getClone();
    console.log("clone connectors = " + timer.get());

    timer.start();
    mappedConnectors.sort(function(firstConnector, secondConnector) {
        if(firstConnector.y == secondConnector.y)
            return 0;
        else if(firstConnector.y < secondConnector.y)
            return -1;
        else 
            return 1;
    });
    console.log("sort connectors = " + timer.get());
    timer.start();
    mappedConnectors = this._connections.mapAllIntersectedAndLowerConnectionsPerEachConnector(
        mappedConnectors
    );
    console.log("map connectors = " + timer.get());

    timer.start();
    for(var i = 0; i < mappedConnectors.length; i++) {
        if(this._isMappedConnectorIntersectingAnyBottomConnectionItem(mappedConnectors[i])) 
            connectors[mappedConnectors[i].connectorIndex].isIntersected = true;
        else
            connectors[mappedConnectors[i].connectorIndex].isIntersected = false;
    }
    console.log("isIntersecting = " + timer.get());

    timer.start();
    for(var i = 0; i < connectors.length; i++) {
        if(connectors[i].isIntersected) {
            connectors.splice(i, 1);
            i--;
        }
    }
    console.log("isIntersecting = " + timer.get());
    console.log("");

    // for(var i = 0; i < connectors.length; i++) {
    //     if(this.isConnectorIntersectingAnyBottomConnectionItem(connectors[i])) {
    //         connectors.splice(i, 1);
    //         i--;
    //     }
    // }
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
    var minValidY = mostBottomConnector.y - cc.MAX_VALID_VERTICAL_DISTANCE.FROM_MOST_BOTTOM_CONNECTOR;
    for(var i = 0; i < connectors.length; i++) {
        if(connectors[i].y < minValidY) {
            connectors.splice(i, 1);
            i--;
        }
    }
}