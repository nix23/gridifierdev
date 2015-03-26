Gridifier.HorizontalGrid.ConnectionsHorizontalIntersector = function(connections,
                                                                     settings,
                                                                     itemCoordsExtractor) {
    var me = this;

    this._connections = null;
    this._settings = null;
    this._itemCoordsExtractor = null;

    this._lastColHorizontallyExpandedConnections = [];

    this._css = {
    };

    this._construct = function() {
        me._connections = connections;
        me._settings = settings;
        me._itemCoordsExtractor = itemCoordsExtractor;
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

Gridifier.HorizontalGrid.ConnectionsHorizontalIntersector.prototype.getLastColHorizontallyExpandedConnections = function() {
    return this._lastColHorizontallyExpandedConnections;
}

Gridifier.HorizontalGrid.ConnectionsHorizontalIntersector.prototype.isIntersectingMoreThanOneConnectionItemHorizontally = function(itemCoords) {
    var me = this;

    var connections = this._connections.get();
    var intersectedConnectionItemIndexes = [];
    
    var isIntersectingHorizontallyAnyFromAlreadyIntersectedItems = function(connection) {
        if(intersectedConnectionItemIndexes.length == 0)
            return false;

        for(var i = 0; i < intersectedConnectionItemIndexes.length; i++) {
            var maybeIntersectableConnection = connections[intersectedConnectionItemIndexes[i]];
            var isBefore = (connection.x1 < maybeIntersectableConnection.x1 && connection.x2 < maybeIntersectableConnection.x1);
            var isBehind = (connection.x1 > maybeIntersectableConnection.x2 && connection.x2 > maybeIntersectableConnection.x2);

            if(!isBefore && !isBehind)
                return true;
        }

        return false;
    };

    var intersectedConnectionItemsCount = 0;
    for(var i = 0; i < connections.length; i++) {
        var maybeIntersectableConnection = connections[i];
        var isBefore = (itemCoords.x1 < maybeIntersectableConnection.x1 && itemCoords.x2 < maybeIntersectableConnection.x1);
        var isBehind = (itemCoords.x1 > maybeIntersectableConnection.x2 && itemCoords.x2 > maybeIntersectableConnection.x2);

        if(!isBefore && !isBehind && !isIntersectingHorizontallyAnyFromAlreadyIntersectedItems(maybeIntersectableConnection)) {
            intersectedConnectionItemIndexes.push(i);
            intersectedConnectionItemsCount++;
        }
    }

    return intersectedConnectionItemsCount > 1;
}

Gridifier.HorizontalGrid.ConnectionsHorizontalIntersector.prototype.getMostWideFromAllHorizontallyIntersectedConnections = function(itemCoords) {
    var me = this;

    var connections = this._connections.get();
    var mostWideHorizontallyIntersectedConnection = null;

    for(var i = 0; i < connections.length; i++) {
        var maybeIntersectableConnection = connections[i];
        var isBefore = (itemCoords.x1 < maybeIntersectableConnection.x1 && itemCoords.x2 < maybeIntersectableConnection.x1);
        var isBehind = (itemCoords.x1 > maybeIntersectableConnection.x2 && itemCoords.x2 > maybeIntersectableConnection.x2);

        if(!isBefore && !isBehind) {
            if(mostWideHorizontallyIntersectedConnection == null)
                mostWideHorizontallyIntersectedConnection = maybeIntersectableConnection;
            else {
                var maybeIntersectableConnectionWidth = Math.abs(
                    maybeIntersectableConnection.x2 - maybeIntersectableConnection.x1
                );
                var mostWideHorizontallyIntersectedConnectionWidth = Math.abs(
                    mostWideHorizontallyIntersectedConnection.x2 - mostWideHorizontallyIntersectedConnection.x1
                );

                if(maybeIntersectableConnectionWidth > mostWideHorizontallyIntersectedConnectionWidth)
                    mostWideHorizontallyIntersectedConnection = maybeIntersectableConnection;
            }
        }
    }

    return mostWideHorizontallyIntersectedConnection;
}

Gridifier.HorizontalGrid.ConnectionsHorizontalIntersector.prototype.getAllHorizontallyIntersectedConnections = function(itemCoords) {
    var me = this;

    var connections = this._connections.get();
    var horizontallyIntersectedConnections = [];

    for(var i = 0; i < connections.length; i++) {
        var maybeIntersectableConnection = connections[i];
        var isBefore = (itemCoords.x1 < maybeIntersectableConnection.x1 && itemCoords.x2 < maybeIntersectableConnection.x1);
        var isBehind = (itemCoords.x1 > maybeIntersectableConnection.x2 && itemCoords.x2 > maybeIntersectableConnection.x2);

        if(!isBefore && !isBehind) 
            horizontallyIntersectedConnections.push(maybeIntersectableConnection);
    }

    return horizontallyIntersectedConnections;
}

Gridifier.HorizontalGrid.ConnectionsHorizontalIntersector.prototype.expandHorizontallyAllColConnectionsToMostWide = function(newConnection) {
    var mostWideConnection = this.getMostWideFromAllHorizontallyIntersectedConnections(newConnection);
    if(mostWideConnection == null)
        return;
    
    var colConnectionsToExpand = this.getAllHorizontallyIntersectedConnections(newConnection);
    var expandedConnectionsWithNewOffsets = [];

    for(var i = 0; i < colConnectionsToExpand.length; i++) {
        colConnectionsToExpand[i].x1 = mostWideConnection.x1;
        colConnectionsToExpand[i].x2 = mostWideConnection.x2;

        if(this._settings.isHorizontalGridLeftAlignmentType()) {
            if(colConnectionsToExpand[i].horizontalOffset != 0)
                expandedConnectionsWithNewOffsets.push(colConnectionsToExpand[i]);

            colConnectionsToExpand[i].horizontalOffset = 0;
        }
        else if(this._settings.isHorizontalGridCenterAlignmentType()) {
            var x1 = colConnectionsToExpand[i].x1;
            var x2 = colConnectionsToExpand[i].x2;

            var targetSizes = this._itemCoordsExtractor.getItemTargetSizes(colConnectionsToExpand[i].item);
            var itemWidth = targetSizes.targetWidth;

            var newHorizontalOffset = (Math.abs(x2 - x1 + 1) / 2) - (itemWidth / 2);

            if(colConnectionsToExpand[i].horizontalOffset != newHorizontalOffset) {
                colConnectionsToExpand[i].horizontalOffset = newHorizontalOffset;
                expandedConnectionsWithNewOffsets.push(colConnectionsToExpand[i]);
            }
        }
        else if(this._settings.isHorizontalGridRightAlignmentType()) {
            var x1 = colConnectionsToExpand[i].x1;
            var x2 = colConnectionsToExpand[i].x2;

            var targetSizes = this._itemCoordsExtractor.getItemTargetSizes(colConnectionsToExpand[i].item);
            var itemWidth = targetSizes.targetWidth;

            var newHorizontalOffset = Math.abs(x2 - x1 + 1) - itemWidth;

            if(colConnectionsToExpand[i].horizontalOffset != newHorizontalOffset) {
                colConnectionsToExpand[i].horizontalOffset = newHorizontalOffset;
                expandedConnectionsWithNewOffsets.push(colConnectionsToExpand[i]);
            }
        }
    }

    // We should rerender only connections with new horizontal offsets(Otherwise some browsers
    // will produce noticeable 'freezes' on rerender cycle)
    this._lastColHorizontallyExpandedConnections = expandedConnectionsWithNewOffsets;
}