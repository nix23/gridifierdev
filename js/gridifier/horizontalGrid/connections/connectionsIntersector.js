Gridifier.HorizontalGrid.ConnectionsIntersector = function(connections) {
    var me = this;

    this._connections = null;

    this._intersectorCore = null;

    this._css = {
    };

    this._construct = function() {
        me._connections = connections;
        me._intersectorCore = new Gridifier.ConnectionsIntersector(
            me._connections
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

Gridifier.HorizontalGrid.ConnectionsIntersector.prototype.isIntersectingAnyConnection = function(maybeIntersectableConnections, itemCoords) {
    return this._intersectorCore.isIntersectingAnyConnection(maybeIntersectableConnections, itemCoords);
}

Gridifier.HorizontalGrid.ConnectionsIntersector.prototype.getAllConnectionsWithIntersectedCenter = function(maybeIntersectionCoords) {
    return this._intersectorCore.getAllConnectionsWithIntersectedCenter(maybeIntersectionCoords);
}

Gridifier.HorizontalGrid.ConnectionsIntersector.prototype.findAllMaybeIntersectableConnectionsOnAppend = function(connector) {
    var connections = this._connections.get();
    var maybeIntersectableConnections = [];

    for(var i = 0; i < connections.length; i++) {
        if(connector.x > connections[i].x2)
            continue;

        maybeIntersectableConnections.push(connections[i]);
    }

    return maybeIntersectableConnections;
}

Gridifier.HorizontalGrid.ConnectionsIntersector.prototype.findAllMaybeIntersectableConnectionsOnPrepend = function(connector) {
    var connections = this._connections.get();
    var maybeIntersectableConnections = [];

    for(var i = 0; i < connections.length; i++) {
        if(connector.x < connections[i].x1)
            continue;

        maybeIntersectableConnections.push(connections[i]);
    }

    return maybeIntersectableConnections;
}