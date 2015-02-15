Gridifier.ConnectorsShifter = function(gridifier, connections, settings) {
    var me = this;

    this._gridifier = null;
    this._connections = null;
    this._settings = null;

    this._connectorsIntersector = null;
    this._ci = null;

    this._connectors = null;
    this._shiftedConnectors = [];
    this._allConnectors = [];

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._connections = connections;
        me._settings = settings;

        me._connectorsIntersector = new Gridifier.ConnectorsIntersector(
            me._connections, me._settings
        );
        me._ci = me._connectorsIntersector;
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

Gridifier.ConnectorsShifter.SIDE = "shifted";

Gridifier.ConnectorsShifter.prototype.attachConnectors = function(connectors) {
    this._connectors = connectors;
    this._shifterConnectors = [];
    this._allConnectors = [];
}

Gridifier.ConnectorsShifter.prototype.getAllConnectors = function() {
    return this._allConnectors;
}

Gridifier.ConnectorsShifter.prototype._createShiftedConnector = function(x, y, connector) {
    var shiftedConnector = {
        type: connector.type,
        side: Gridifier.ConnectorsShifter.SIDE,
        x: Dom.toInt(x),
        y: Dom.toInt(y),
        itemGUID: Dom.toInt(connector.itemGUID)
    };
    
    this._shiftedConnectors.push(shiftedConnector);
    this._allConnectors.push(shiftedConnector);
}

Gridifier.ConnectorsShifter.prototype.shiftAllConnectors = function() {
    for(var i = 0; i < this._connectors.length; i++) {
        this._allConnectors.push(this._connectors[i]);

        if(Gridifier.Connectors.isLeftTopSideConnector(this._connectors[i])) {
            this._shiftLeftTopConnector(this._connectors[i]);
        }
        else if(Gridifier.Connectors.isLeftBottomSideConnector(this._connectors[i])) {
            this._shiftLeftBottomConnector(this._connectors[i]);
        }
        else if(Gridifier.Connectors.isBottomRightSideConnector(this._connectors[i])) {
            this._shiftBottomRightConnector(this._connectors[i]);
        }
        else if(Gridifier.Connectors.isBottomLeftSideConnector(this._connectors[i])) {
            // Same logic as in shift top left
            this._shiftTopLeftConnector(this._connectors[i]);
        }
        else if(Gridifier.Connectors.isTopLeftSideConnector(this._connectors[i])) {
            this._shiftTopLeftConnector(this._connectors[i]);
        }
        else if(Gridifier.Connectors.isTopRightSideConnector(this._connectors[i])) {
            // Same logic as in shift bottom right
            this._shiftBottomRightConnector(this._connectors[i]);
        }
        else if(Gridifier.Connectors.isRightBottomSideConnector(this._connectors[i])) {
            this._shiftRightBottomConnector(this._connectors[i]);
        }
        else if(Gridifier.Connectors.isRightTopSideConnector(this._connectors[i])) {
            this._shiftRightTopConnector(this._connectors[i]);
        }
    }
}

// @todo -> Refactor, remove isIntersecting functions, and keep just getters, check result == null?
// It's important, because this will boost performance!
Gridifier.ConnectorsShifter.prototype._shiftLeftTopConnector = function(connector) {
    var mostBottomConnection = this._ci.getMostBottomFromIntersectedTopOrTopLeftItems(connector);

    if(mostBottomConnection != null) {
        if(mostBottomConnection.y2 + 1 != connector.y) 
            this._createShiftedConnector(connector.x, mostBottomConnection.y2 + 1, connector);
    }
    else {
        if(connector.y != 0) 
            this._createShiftedConnector(connector.x, 0, connector);
    }
}

Gridifier.ConnectorsShifter.prototype._shiftLeftBottomConnector = function(connector) {
    var mostTopConnection = this._ci.getMostTopFromIntersectedBottomOrBottomLeftItems(connector);

    if(mostTopConnection != null) {
        if(mostTopConnection.y1 - 1 != connector.y)
            this._createShiftedConnector(connector.x, mostTopConnection.y1 - 1, connector);
    }
    else {
        var maxYFromAllConnections = this._connections.getMaxYFromAllConnections();
        if(maxYFromAllConnections != 0) {
            if(maxYFromAllConnections - 1 != connector.y) 
                this._createShiftedConnector(connector.x, maxYFromAllConnections - 1, connector);
        }
    }
}

Gridifier.ConnectorsShifter.prototype._shiftBottomRightConnector = function(connector) {
    var mostLeftConnection = this._ci.getMostLeftFromIntersectedRightItems(connector);

    if(mostLeftConnection != null) {
        if(mostLeftConnection.x1 - 1 != connector.x)
            this._createShiftedConnector(mostLeftConnection.x1 - 1, connector.y, connector);
    }
    else {
        if(connector.x != this._gridifier.getGridX2())
            this._createShiftedConnector(this._gridifier.getGridX2(), connector.y, connector);
    }
}

Gridifier.ConnectorsShifter.prototype._shiftTopLeftConnector = function(connector) {
    var mostRightConnection = this._ci.getMostRightFromIntersectedLeftItems(connector);

    if(mostRightConnection != null) {
        if((mostRightConnection.x2 + 1) != connector.x)
            this._createShiftedConnector(mostRightConnection.x2 + 1, connector.y, connector);
    }
    else {
        if(connector.x != 0) 
            this._createShiftedConnector(0, connector.y, connector);
    }
}

Gridifier.ConnectorsShifter.prototype._shiftRightBottomConnector = function(connector) {
    var mostTopConnection = this._ci.getMostTopFromIntersectedBottomOrBottomRightItems(connector);

    if(mostTopConnection != null) {
        if((mostTopConnection.y1 - 1) != connector.y)
            this._createShiftedConnector(connector.x, mostTopConnection.y1 - 1, connector);
    }
    else {
        var maxYFromAllConnections = this._connections.getMaxYFromAllConnections();
        if(maxYFromAllConnections != 0) {
            if(maxYFromAllConnections - 1 != connector.y) 
                this._createShiftedConnector(connector.x, maxYFromAllConnections - 1, connector);
        }
    }
}

Gridifier.ConnectorsShifter.prototype._shiftRightTopConnector = function(connector) {
    var mostBottomConnection = this._ci.getMostBottomFromIntersectedTopOrTopRightItems(connector);

    if(mostBottomConnection != null) {
        if((mostBottomConnection.y2 + 1) != connector.y)
            this._createShiftedConnector(connector.x, mostBottomConnection.y2 + 1, connector);
    }
    else {
        if(connector.y != 0) {
            this._createShiftedConnector(connector.x, 0, connector);
        }
    }
}

Gridifier.ConnectorsShifter.prototype.shiftAllWithSpecifiedSideToRightGridCorner = function(side) {
    this._allConnectors = this._connectors;
    for(var i = 0; i < this._allConnectors.length; i++) {
        if(this._allConnectors[i].side == side)
            this._allConnectors[i].x = this._gridifier.getGridX2();
    }
}

Gridifier.ConnectorsShifter.prototype.shiftAllWithSpecifiedSideToLeftGridCorner = function(side) {
    this._allConnectors = this._connectors;
    for(var i = 0; i < this._allConnectors.length; i++) {
        if(this._allConnectors[i].side == side)
            this._allConnectors[i].x = 0;
    }
}

Gridifier.ConnectorsShifter.prototype.shiftAllWithSpecifiedSideToTopGridCorner = function(side) {
    this._allConnectors = this._connectors;
    for(var i = 0; i < this._allConnectors.length; i++) {
        if(this._allConnectors[i].side == side)
            this._allConnectors[i].y = 0;
    }
}

Gridifier.ConnectorsShifter.prototype.shiftAllWithSpecifiedSideToBottomGridCorner = function(side) {
    this._allConnectors = this._connectors;
    for(var i = 0; i < this._allConnectors.length; i++) {
        if(this._allConnectors[i].side == side)
            this._allConnectors[i].y = this._gridifier.getGridY2();
    }
}