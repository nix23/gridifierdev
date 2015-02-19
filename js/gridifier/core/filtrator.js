Gridifier.Filtrator = function(gridifier,
                               collector,
                               connections,
                               settings,
                               guid,
                               disconnector) {
    var me = this;

    this._gridifier = null;
    this._collector = null;
    this._connections = null;
    this._settings = null;
    this._guid = null;
    this._connectedItemMarker = null;
    this._disconnector = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._collector = collector;
        me._connections = connections;
        me._settings = settings;
        me._guid = guid;
        me._connectedItemMarker = new Gridifier.ConnectedItemMarker();
        me._disconnector = disconnector;
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

Gridifier.Filtrator.prototype.filter = function() {
    var allItems = this._collector.collect();
    var connectedItems = this._collector.collectAllConnectedItems();
    var disconnectedItems = this._collector.collectAllDisconnectedItems();

    var allItemsToShow = this._collector.sortCollection(this._collector.filterCollection(allItems));
    var connectedItemsToShow = this._collector.filterCollection(connectedItems);
    var disconnectedItemsToShow = this._collector.filterCollection(disconnectedItems);
    var connectedItemsToHide = this._findConnectedItemsToHide(connectedItems);

    this._disconnector.disconnect(connectedItemsToHide);
    this._recreateGUIDS(allItemsToShow);
    this._recreateConnections(allItemsToShow);
}

Gridifier.Filtrator.prototype._findConnectedItemsToHide = function(connectedItems) {
    var connectedItemsToHide = [];

    for(var i = 0; i < connectedItems.length; i++) {
        var filteredItems = this._collector.filterCollection([connectedItems[i]]);
        if(filteredItems.length == 0)
            connectedItemsToHide.push(connectedItems[i]);
    }

    return connectedItemsToHide;
}

Gridifier.Filtrator.prototype._recreateGUIDS = function(orderedPerAppendItems) {
    this._guid.reinit();
    for(var i = 0; i < orderedPerAppendItems.length; i++) {
        this._guid.markNextAppendedItem(orderedPerAppendItems[i]);
    }
}

Gridifier.Filtrator.prototype._recreateConnections = function(allItemsToShow) {
    var connections = this._connections.get();
    connections.splice(0, connections.length);

    // Created connections should be correctly parsed by SizesTransformer sorter.
    if(this._settings.isHorizontalGrid()) {
        this._recreateAllHorizontalGridConnectionsPerReappend(allItemsToShow);
    }
    else if(this._settings.isVerticalGrid()) {
        this._recreateAllVerticalGridConnectionsPerReappend(allItemsToShow);
    }
}

Gridifier.Filtrator.prototype._recreateAllHorizontalGridConnectionsPerReappend = function(allItemsToShow) {
    var nextFakeX = 0;

    for(var i = 0; i < allItemsToShow.length; i++) {
        var itemToShowFakeCoords = {};
        itemToShowFakeCoords.x1 = nextFakeX;
        itemToShowFakeCoords.x2 = nextFakeX;
        itemToShowFakeCoords.y1 = 0;
        itemToShowFakeCoords.y2 = 0;

        this._connections.add(allItemsToShow[i], itemToShowFakeCoords);
        nextFakeX++;
    }
}

Gridifier.Filtrator.prototype._recreateAllVerticalGridConnectionsPerReappend = function(allItemsToShow) {
    var nextFakeY = 0;

    for(var i = 0; i < allItemsToShow.length; i++) {
        var itemToShowFakeCoords = {};
        itemToShowFakeCoords.x1 = 0;
        itemToShowFakeCoords.x2 = 0;
        itemToShowFakeCoords.y1 = nextFakeY;
        itemToShowFakeCoords.y2 = nextFakeY;
        
        this._connections.add(allItemsToShow[i], itemToShowFakeCoords);
        nextFakeY++;
    }
}