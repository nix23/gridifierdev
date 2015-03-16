Gridifier.VerticalGrid.ConnectionsVerticalIntersector = function(connections,
                                                                 settings,
                                                                 itemCoordsExtractor) {
    var me = this;

    this._connections = null;
    this._settings = null;
    this._itemCoordsExtractor = null;

    this._lastRowVerticallyExpandedConnections = [];

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

Gridifier.VerticalGrid.ConnectionsVerticalIntersector.prototype.getLastRowVerticallyExpandedConnections = function() {
    return this._lastRowVerticallyExpandedConnections;
}

Gridifier.VerticalGrid.ConnectionsVerticalIntersector.prototype.isIntersectingMoreThanOneConnectionItemVertically = function(itemCoords) {
    var me = this;

    var connections = this._connections.get();
    var intersectedConnectionItemIndexes = [];

    var isIntersectingVerticallyAnyFromAlreadyIntersectedItems = function(connection) {
        if(intersectedConnectionItemIndexes.length == 0)
            return false;

        for(var i = 0; i < intersectedConnectionItemIndexes.length; i++) {
            var maybeIntersectableConnection = connections[intersectedConnectionItemIndexes[i]];
            var isAbove = (connection.y1 < maybeIntersectableConnection.y1 && connection.y2 < maybeIntersectableConnection.y1);
            var isBelow = (connection.y1 > maybeIntersectableConnection.y1 && connection.y2 > maybeIntersectableConnection.y2);

            if(!isAbove && !isBelow)
                return true;
        }

        return false;
    };

    var intersectedConnectionItemsCount = 0;
    for(var i = 0; i < connections.length; i++) {
        var maybeIntersectableConnection = connections[i];
        var isAbove = (itemCoords.y1 < maybeIntersectableConnection.y1 && itemCoords.y2 < maybeIntersectableConnection.y1);
        var isBelow = (itemCoords.y1 > maybeIntersectableConnection.y2 && itemCoords.y2 > maybeIntersectableConnection.y2);

        if(!isAbove && !isBelow && !isIntersectingVerticallyAnyFromAlreadyIntersectedItems(maybeIntersectableConnection)) {
            intersectedConnectionItemIndexes.push(i);
            intersectedConnectionItemsCount++;
        }
    }

    return intersectedConnectionItemsCount > 1;
}

Gridifier.VerticalGrid.ConnectionsVerticalIntersector.prototype.getMostTallFromAllVerticallyIntersectedConnections = function(itemCoords) {
    var me = this;

    var connections = this._connections.get();
    var mostTallVerticallyIntersectedConnection = null;

    for(var i = 0; i < connections.length; i++) {
        var maybeIntersectableConnection = connections[i];
        var isAbove = (itemCoords.y1 < maybeIntersectableConnection.y1 && itemCoords.y2 < maybeIntersectableConnection.y1);
        var isBelow = (itemCoords.y1 > maybeIntersectableConnection.y2 && itemCoords.y2 > maybeIntersectableConnection.y2);

        if(!isAbove && !isBelow) {
            if(mostTallVerticallyIntersectedConnection == null)
                mostTallVerticallyIntersectedConnection = maybeIntersectableConnection;
            else {
                var maybeIntersectableConnectionHeight = Math.abs(
                    maybeIntersectableConnection.y2 - maybeIntersectableConnection.y1
                );
                var mostTallVerticallyIntersectedConnectionHeight = Math.abs(
                    mostTallVerticallyIntersectedConnection.y2 - mostTallVerticallyIntersectedConnection.y1
                );

                if(maybeIntersectableConnectionHeight > mostTallVerticallyIntersectedConnectionHeight)
                    mostTallVerticallyIntersectedConnection = maybeIntersectableConnection;
            }
        }
    }

    return mostTallVerticallyIntersectedConnection;
}

Gridifier.VerticalGrid.ConnectionsVerticalIntersector.prototype.getAllVerticallyIntersectedConnections = function(itemCoords) {
    var me = this;

    var connections = this._connections.get();
    var verticallyIntersectedConnections = [];

    for(var i = 0; i < connections.length; i++) {
        var maybeIntersectableConnection = connections[i];
        var isAbove = (itemCoords.y1 < maybeIntersectableConnection.y1 && itemCoords.y2 < maybeIntersectableConnection.y1);
        var isBelow = (itemCoords.y1 > maybeIntersectableConnection.y2 && itemCoords.y2 > maybeIntersectableConnection.y2);

        if(!isAbove && !isBelow)
            verticallyIntersectedConnections.push(maybeIntersectableConnection);
    }

    return verticallyIntersectedConnections;
}

Gridifier.VerticalGrid.ConnectionsVerticalIntersector.prototype.expandVerticallyAllRowConnectionsToMostTall = function(newConnection) {
    var mostTallConnection = this.getMostTallFromAllVerticallyIntersectedConnections(newConnection);
    if(mostTallConnection == null)
        return;

    var rowConnectionsToExpand = this.getAllVerticallyIntersectedConnections(newConnection);
    this._lastRowVerticallyExpandedConnections = rowConnectionsToExpand;

    for(var i = 0; i < rowConnectionsToExpand.length; i++) {
        rowConnectionsToExpand[i].y1 = mostTallConnection.y1;
        rowConnectionsToExpand[i].y2 = mostTallConnection.y2;

        if(this._settings.isVerticalGridTopAlignmentType())
            rowConnectionsToExpand[i].verticalOffset = 0;
        else if(this._settings.isVerticalGridCenterAlignmentType()) {
            var y1 = rowConnectionsToExpand[i].y1;
            var y2 = rowConnectionsToExpand[i].y2;

            var targetSizes = this._itemCoordsExtractor.getItemTargetSizes(rowConnectionsToExpand[i].item);
            // @todo -> Check if (-1) is required
            var itemHeight = targetSizes.targetHeight - 1;

            //var itemHeight = rowConnectionsToExpand[i].itemHeightWithMargins - 1;
            // @todo fix to return Math.round(Math.abs(y2 - y1 + 1) / 2) - Math.round(itemHeight / 2);
            rowConnectionsToExpand[i].verticalOffset = Math.round(Math.abs(y2 - y1) / 2) - Math.round(itemHeight / 2);
        }
        else if(this._settings.isVerticalGridBottomAlignmentType()) {
            var y1 = rowConnectionsToExpand[i].y1;
            var y2 = rowConnectionsToExpand[i].y2;

            var targetSizes = this._itemCoordsExtractor.getItemTargetSizes(rowConnectionsToExpand[i].item);
            var itemHeight = targetSizes.targetHeight - 1;

            //var itemHeight = rowConnectionsToExpand[i].itemHeightWithMargins - 1;
            // @todo fix (y2 - y1 + 1)
            //rowConnectionsToExpand[i].verticalOffset = Math.abs(y2 - y1) - itemHeight;
            rowConnectionsToExpand[i].verticalOffset = Math.abs(y2 - y1) - itemHeight;
        }
    }
}