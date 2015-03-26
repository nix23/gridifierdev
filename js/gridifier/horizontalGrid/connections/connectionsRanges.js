Gridifier.HorizontalGrid.ConnectionsRanges = function(connections) {
    var me = this;

    this._connections = null;

    this._ranges = null;

    this._css = {

    }

    this._construct = function() {
        me._connections = connections;
    };

    this._bindEvents = function() {

    };

    this._unbindEvents = function() {

    };

    this.destruct = function() {
        me._unbindEvents();
    }

    this._construct();
    return this;
}

Gridifier.HorizontalGrid.ConnectionsRanges.RANGE_PX_WIDTH = 500;

Gridifier.HorizontalGrid.ConnectionsRanges.prototype.init = function() {
    this._ranges = [];
    this._ranges.push({
        x1: -1,
        x2: Gridifier.HorizontalGrid.ConnectionsRanges.RANGE_PX_WIDTH,
        connectionIndexes: []
    });
    this._attachAllConnections();
}

Gridifier.HorizontalGrid.ConnectionsRanges.prototype.shiftAllRangesBy = function(horizontalIncrease) {
    for(var i = 0; i < this._ranges.length; i++) {
        this._ranges[i].x1 += horizontalIncrease;
        this._ranges[i].x2 += horizontalIncrease;
    }
}

Gridifier.HorizontalGrid.ConnectionsRanges.prototype.createPrependedRange = function(newRangeX1, newRangeX2) {
    this._ranges.unshift({
        x1: -1,
        x2: newRangeX2,
        connectionIndexes: []
    });
}

Gridifier.HorizontalGrid.ConnectionsRanges.prototype._createNextRange = function() {
    var nextRangeX1 = this._ranges[this._ranges.length - 1].x2 + 1;

    this._ranges.push({
        x1: nextRangeX1,
        x2: nextRangeX1 + Gridifier.HorizontalGrid.ConnectionsRanges.RANGE_PX_WIDTH,
        connectionIndexes: []
    });
}

Gridifier.HorizontalGrid.ConnectionsRanges.prototype.attachConnection = function(connection, connectionIndex) {
    while(connection.x2 + 1 > this._ranges[this._ranges.length - 1].x2) {
        this._createNextRange();
    }

    var wasConnectionAttachedAtLeastInOneRange = false;
    for(var i = 0; i < this._ranges.length; i++) {
        var isBeforeRange = connection.x2 < this._ranges[i].x1;
        var isBehindRange = connection.x1 > this._ranges[i].x2;

        if(!isBeforeRange && !isBehindRange) {
            this._ranges[i].connectionIndexes.push(connectionIndex);
            wasConnectionAttachedAtLeastInOneRange = true;
        }
    }

    if(!wasConnectionAttachedAtLeastInOneRange)
        throw new Error("Gridifier core error: connection was not connected to any range: " + connection.itemGUID);
}

Gridifier.HorizontalGrid.ConnectionsRanges.prototype._attachAllConnections = function() {
    var connections = this._connections.get();
    for(var i = 0; i < connections.length; i++) 
        this.attachConnection(connections[i], i);
}

Gridifier.HorizontalGrid.ConnectionsRanges.prototype.mapAllIntersectedAndLeftConnectionsPerEachConnector = function(sortedConnectors) {
    var currentConnectorRangeIndex = this._ranges.length - 1;
    var currentConnectorConnectionIndexes = [];

    for(var connectorIndex = 0; connectorIndex < sortedConnectors.length; connectorIndex++) {
        var currentConnectorRangeIndexFound = false;

        if(currentConnectorRangeIndex == this._ranges.length - 1)
            var isCurrentConnectorRangeSameAsPrevious = false;
        else
            var isCurrentConnectorRangeSameAsPrevious = true;

        while(!currentConnectorRangeIndexFound) { 
            // Sometimes connector y may become 1px to the left than range.
            // (Spot on (width=10%, height=0px, padding-bottom: 25%)).
            // In this such cases we should return connections of all ranges.
            if(currentConnectorRangeIndex > this._ranges.length - 1
                || currentConnectorRangeIndex < 0) {
                currentConnectorRangeIndex = this._ranges.length - 1;
                break;
            }

            if(sortedConnectors[connectorIndex].x >= this._ranges[currentConnectorRangeIndex].x1 &&
                sortedConnectors[connectorIndex].x <= this._ranges[currentConnectorRangeIndex].x2) {
                currentConnectorRangeIndexFound = true;
            }
            else {
                currentConnectorRangeIndex--;
                isCurrentConnectorRangeSameAsPrevious = false;
            }
        }

        if(!isCurrentConnectorRangeSameAsPrevious) {
            currentConnectorConnectionIndexes = [];
            for(var rangeIndex = currentConnectorRangeIndex; rangeIndex >= 0; rangeIndex--)
                currentConnectorConnectionIndexes.push(this._ranges[rangeIndex].connectionIndexes);
        }

        sortedConnectors[connectorIndex].connectionIndexes = currentConnectorConnectionIndexes;
    }

    return sortedConnectors;
}

Gridifier.HorizontalGrid.ConnectionsRanges.prototype.getAllConnectionsFromIntersectedAndRightRanges = function(x) {
    var connectionIndexes = [];
    var intersectedRangeIndex = null;

    for(var i = 0; i < this._ranges.length; i++) {
        if(x >= this._ranges[i].x1 && x <= this._ranges[i].x2) {
            intersectedRangeIndex = i;
            break;
        }
    }

    if(intersectedRangeIndex == null)
        intersectedRangeIndex = 0;

    for(var i = intersectedRangeIndex; i < this._ranges.length; i++) {
        connectionIndexes.push(this._ranges[i].connectionIndexes);
    }

    return connectionIndexes;
}

Gridifier.HorizontalGrid.ConnectionsRanges.prototype.mapAllIntersectedAndRightConnectionsPerEachConnector = function(sortedConnectors) {
    var currentConnectorRangeIndex = 0;
    var currentConnectorConnectionIndexes = [];

    for(var connectorIndex = 0; connectorIndex < sortedConnectors.length; connectorIndex++) {
        var currentConnectorRangeIndexFound = false;

        if(currentConnectorRangeIndex == 0)
            var isCurrentConnectorRangeSameAsPrevious = false;
        else
            var isCurrentConnectorRangeSameAsPrevious = true;

        while(!currentConnectorRangeIndexFound) {
            // Sometimes connector x may become 1px larger than range.
            // (Spot on (width=10%, height=0px, padding-bottom: 25%)).
            // In this such cases we should return connections of all ranges.
            if(currentConnectorRangeIndex > this._ranges.length - 1
                || currentConnectorRangeIndex < 0) {
                currentConnectorRangeIndex = 0;
                break;
            }

            if(sortedConnectors[connectorIndex].x >= this._ranges[currentConnectorRangeIndex].x1 &&
               sortedConnectors[connectorIndex].x <= this._ranges[currentConnectorRangeIndex].x2) {
                currentConnectorRangeIndexFound = true;
            }
            else {
                currentConnectorRangeIndex++;
                isCurrentConnectorRangeSameAsPrevious = false;
            }
        }

        if(!isCurrentConnectorRangeSameAsPrevious) {
            currentConnectorConnectionIndexes = [];
            for(var rangeIndex = currentConnectorRangeIndex; rangeIndex < this._ranges.length; rangeIndex++)
                currentConnectorConnectionIndexes.push(this._ranges[rangeIndex].connectionIndexes);
        }

        sortedConnectors[connectorIndex].connectionIndexes = currentConnectorConnectionIndexes;
    }

    return sortedConnectors;
}

Gridifier.HorizontalGrid.ConnectionsRanges.prototype.getAllConnectionsFromIntersectedRange = function(x) {
    for(var i = 0; i < this._ranges.length; i++) {
        if(x >= this._ranges[i].x1 && x <= this._ranges[i].x2)
            return this._ranges[i].connectionIndexes;
    }

    var isConnectionIndexAdded = function(connectionIndexes, index) {
        for(var i = 0; i < connectionIndexes.length; i++) {
            if(connectionIndexes[i] == index)
                return true;
        }

        return false;
    }

    var connectionIndexes = [];
    for(var i = 0; i < this._ranges.length; i++) {
        for(var j = 0; j < this._ranges[i].connectionIndexes.length; j++) {
            if(!isConnectionIndexAdded(connectionIndexes, this._ranges[i].connectionIndexes[j]))
                connectionIndexes.push(this._ranges[i].connectionIndexes[j]);
        }
    }

    return connectionIndexes;
}

Gridifier.HorizontalGrid.ConnectionsRanges.prototype.getAllConnectionsFromIntersectedAndLeftRanges = function(x) {
    var connectionIndexes = [];
    var intersectedRangeIndex = null;

    for(var i = this._ranges.length - 1; i >= 0; i--) {
        if(x >= this._ranges[i].x1 && x <= this._ranges[i].x2) {
            intersectedRangeIndex = i;
            break;
        }
    }

    if(intersectedRangeIndex == null)
        intersectedRangeIndex = this._ranges.length - 1;

    for(var i = intersectedRangeIndex; i >= 0; i--) {
        connectionIndexes.push(this._ranges[i].connectionIndexes);
    }

    return connectionIndexes;
}
