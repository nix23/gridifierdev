Gridifier.VerticalGrid.ConnectionsIntersector = function(connections) {
    var me = this;

    this._connections = null;

    this._css = {
    };

    this._construct = function() {
        me._connections = connections;
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

Gridifier.VerticalGrid.ConnectionsIntersector.prototype.isIntersectingAnyConnection = function(maybeIntersectableConnections, itemCoords) {
    for(var i = 0; i < maybeIntersectableConnections.length; i++) {
        var maybeIntersectableConnection = maybeIntersectableConnections[i];

        // @todo -> Move this to rounding normalizer
        var isAbove = (itemCoords.y1 < maybeIntersectableConnection.y1 && itemCoords.y2 < maybeIntersectableConnection.y1);
        var isBelow = (itemCoords.y1 > maybeIntersectableConnection.y2 && itemCoords.y2 > maybeIntersectableConnection.y2);
        var isBefore = (itemCoords.x1 < maybeIntersectableConnection.x1 + 1 && itemCoords.x2 < maybeIntersectableConnection.x1 + 1);
        var isBehind = (itemCoords.x1 > maybeIntersectableConnection.x2 - 1 && itemCoords.x2 > maybeIntersectableConnection.x2 - 1);

        if(!isAbove && !isBelow && !isBefore && !isBehind)
            return true;
    }

    return false;
}

Gridifier.VerticalGrid.ConnectionsIntersector.prototype.findAllMaybeIntersectableConnectionsOnAppend = function(connector) {
    var connections = this._connections.get();
    var maybeIntersectableConnections = [];

    for(var i = 0; i < connections.length; i++) {
        if(connector.y > connections[i].y2)
            continue;

        maybeIntersectableConnections.push(connections[i]);
    }

    return maybeIntersectableConnections;
}

Gridifier.VerticalGrid.ConnectionsIntersector.prototype.findAllMaybeIntersectableConnectionsOnPrepend = function(connector) {
    var connections = this._connections.get();
    var maybeIntersectableConnections = [];

    for(var i = 0; i < connections.length; i++) {
        if(connector.y < connections[i].y1)
            continue;

        maybeIntersectableConnections.push(connections[i]);
    }

    return maybeIntersectableConnections;
}