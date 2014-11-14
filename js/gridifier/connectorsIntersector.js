Gridifier.ConnectorsIntersector = function(connections) {
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

Gridifier.ConnectorsIntersector.prototype.getMostLeftFromIntersectedRightItems = function(connector) {
    var connections = this._connections.get();
    var mostLeftConnection = null;

    for(var i = 0; i < connections.length; i++) {
        if(connector.y >= connections[i].y1 && connector.y <= connections[i].y2 
            && connector.x < connections[i].x1) {
            if(mostLeftConnection == null)
                mostLeftConnection = connections[i];
            else {
                if(connections[i].x1 < mostLeftConnection.x1)
                    mostLeftConnection = connections[i];
            }
        }
    }

    return mostLeftConnection;
}

Gridifier.ConnectorsIntersector.prototype.getMostBottomFromIntersectedTopOrTopLeftItems = function(connector) {
    var connections = this._connections.get();
    var mostBottomConnection = null;

    for(var i = 0; i < connections.length; i++) {
        if(((connector.x >= connections[i].x1 && connector.x <= connections[i].x2) || (connector.x > connections[i].x2))
            && connector.y > connections[i].y2) {
            if(mostBottomConnection == null)
                mostBottomConnection = connections[i];
            else {
                if(connections[i].y2 > mostBottomConnection.y2)
                    mostBottomConnection = connections[i];
            }
        }
    }

    return mostBottomConnection;
}

Gridifier.ConnectorsIntersector.prototype.getMostRightFromIntersectedLeftItems = function(connector) {
    var connections = this._connections.get();
    var mostRightConnection = null;

    for(var i = 0; i < connections.length; i++) {
        if(connector.y >= connections[i].y1 && connector.y <= connections[i].y2 
           && connector.x > connections[i].x2) {
            if(mostRightConnection == null)
                mostRightConnection = connections[i];
            else {
                if(connections[i].x > mostRightConnection.x2)
                    mostRightConnection = connections[i];
            }
        }
    }

    return mostRightConnection;
}

Gridifier.ConnectorsIntersector.prototype.getMostTopFromIntersectedBottomOrBottomRightItems = function(connector) {
    var connections = this._connections.get();
    var mostTopConnection = null;

    for(var i = 0; i < connections.length; i++) {
        if(((connector.x >= connections[i].x1 && connector.x <= connections[i].x2) || (connector.x < connections[i].x1))
            && connector.y < connections[i].y1) {
            if(mostTopConnection == null)
                mostTopConnection = connections[i];
            else {
                if(connections[i].y1 < mostTopConnection.y1)
                    mostTopConnection = connections[i];
            }
        }
    }

    return mostTopConnection;
}