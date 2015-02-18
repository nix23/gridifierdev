Gridifier.ConnectionsIntersector = function(connections) {
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

Gridifier.ConnectionsIntersector.prototype.isIntersectingAnyConnection = function(maybeIntersectableConnections, itemCoords) {
    for(var i = 0; i < maybeIntersectableConnections.length; i++) {
        var maybeIntersectableConnection = maybeIntersectableConnections[i];

        // @todo -> Move this to rounding normalizer
        var isAbove = (itemCoords.y1 < maybeIntersectableConnection.y1 && itemCoords.y2 < maybeIntersectableConnection.y1);
        var isBelow = (itemCoords.y1 > maybeIntersectableConnection.y2 && itemCoords.y2 > maybeIntersectableConnection.y2);
        // @todo -> Looks like this is not longer required. This was required because of Math.floor, which were used in SizesResolver
        //          class.
        //var isBefore = (itemCoords.x1 < maybeIntersectableConnection.x1 + 1 && itemCoords.x2 < maybeIntersectableConnection.x1 + 1);
        //var isBehind = (itemCoords.x1 > maybeIntersectableConnection.x2 - 1 && itemCoords.x2 > maybeIntersectableConnection.x2 - 1);
        var isBefore = (itemCoords.x1 < maybeIntersectableConnection.x1 && itemCoords.x2 < maybeIntersectableConnection.x1);
        var isBehind = (itemCoords.x1 > maybeIntersectableConnection.x2 && itemCoords.x2 > maybeIntersectableConnection.x2);

        if(!isAbove && !isBelow && !isBefore && !isBehind)
            return true;
    }

    return false;
}

Gridifier.ConnectionsIntersector.prototype.getAllConnectionsWithIntersectedCenter = function(maybeIntersectionCoords) {
    var connections = this._connections.get();
    var connectionsWithIntersectedCenter = [];

    for(var i = 0; i < connections.length; i++) {
        var connectionWidth = connections[i].x2 - connections[i].x1 + 1;
        var connectionHeight = connections[i].y2 - connections[i].y1 + 1;

        var connectionCenterCoords = {
            x1: connections[i].x1 + connectionWidth / 2,
            x2: connections[i].x1 + connectionWidth / 2,
            y1: connections[i].y1 + connectionHeight / 2,
            y2: connections[i].y1 + connectionHeight / 2
        };
        
        if(this.isIntersectingAnyConnection([connectionCenterCoords], maybeIntersectionCoords)) {
            connectionsWithIntersectedCenter.push(connections[i]);
        }
    }

    return connectionsWithIntersectedCenter;
}