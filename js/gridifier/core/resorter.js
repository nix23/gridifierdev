Gridifier.Resorter = function(gridifier,
                              collector,
                              connections,
                              settings,
                              guid) {
    var me = this;

    this._gridifier = null;
    this._collector = null;
    this._connections = null;
    this._settings = null;
    this._guid = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._collector = collector;
        me._connections = connections;
        me._settings = settings;
        me._guid = guid;
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

Gridifier.Resorter.prototype.resort = function() {
    var connectedItems = this._collector.sortCollection(
        this._collector.collectAllConnectedItems()
    );

    if(this._settings.isCustomAllEmptySpaceSortDispersion()) {
        if(this._settings.isHorizontalGrid()) {
            this._resortAllHorizontalGridConnectionsPerReappend(connectedItems);
        }
        else if(this._settings.isVerticalGrid()) {
            this._resortAllVerticalGridConnectionsPerReappend(connectedItems);
        }
    }

    this._guid.reinit();
    for(var i = 0; i < connectedItems.length; i++) {
        this._guid.markNextAppendedItem(connectedItems[i]);
    }
}

Gridifier.Resorter.prototype._resortAllHorizontalGridConnectionsPerReappend = function(connectedItems) {
    var nextFakeX = 0;

    for(var i = 0; i < connectedItems.length; i++) {
        var connectedItemConnection = this._connections.findConnectionByItem(connectedItems[i]);
        connectedItemConnection.x1 = nextFakeX;
        connectedItemConnection.x2 = nextFakeX;
        connectedItemConnection.y1 = 0;
        connectedItemConnection.y2 = 0;
        nextFakeX++;
    }
}

Gridifier.Resorter.prototype._resortAllVerticalGridConnectionsPerReappend = function(connectedItems) {
    var nextFakeY = 0;

    for(var i = 0; i < connectedItems.length; i++) {
        var connectedItemConnection = this._connections.findConnectionByItem(connectedItems[i]);
        connectedItemConnection.x1 = 0;
        connectedItemConnection.x2 = 0;
        connectedItemConnection.y1 = nextFakeY;
        connectedItemConnection.y2 = nextFakeY;
        nextFakeY++;
    }
}