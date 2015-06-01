Gridifier.Disconnector = function(gridifier,
                                  collector,
                                  connections,
                                  connectionsSorter,
                                  connectors,
                                  settings,
                                  guid,
                                  appender,
                                  reversedAppender) {
    var me = this;

    this._gridifier = null;
    this._collector = null;
    this._connections = null;
    this._connectionsSorter = null;
    this._connectors = null;
    this._settings = null;
    this._guid = null;
    this._connectedItemMarker = null;
    this._appender = null;
    this._reversedAppender = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._collector = collector;
        me._connections = connections;
        me._connectionsSorter = connectionsSorter;
        me._connectors = connectors;
        me._settings = settings;
        me._guid = guid;
        me._connectedItemMarker = new Gridifier.ConnectedItemMarker();
        me._appender = appender;
        me._reversedAppender = reversedAppender;
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

// Soft disconnect is used in filters.(After hard disconnect items
//  shouldn't show on filter show)
Gridifier.Disconnector.DISCONNECT_TYPES = {SOFT: 0, HARD: 1};

Gridifier.Disconnector.prototype.disconnect = function(items, disconnectType) {
    var items = this._collector.toDOMCollection(items);
    this._collector.ensureAllItemsAreConnectedToGrid(items);

    var disconnectType = disconnectType || Gridifier.Disconnector.DISCONNECT_TYPES.SOFT;
    if(disconnectType == Gridifier.Disconnector.DISCONNECT_TYPES.HARD) {
        for(var i = 0; i < items.length; i++)
            this._collector.markItemAsRestrictedToCollect(items[i]);
    }

    var connectionsToDisconnect = this._findConnectionsToDisconnect(items);
    for(var i = 0; i < connectionsToDisconnect.length; i++) {
        this._connections.removeConnection(connectionsToDisconnect[i]);
        this._guid.removeItemGUID(connectionsToDisconnect[i].item);
    }
    if(this._connections.get().length == 0)
        this._recreateConnectors();
    
    for(var i = 0; i < connectionsToDisconnect.length; i++)
        this._connectedItemMarker.unmarkItemAsConnected(connectionsToDisconnect[i].item);

    this._connections.reinitRanges();
    this._scheduleDisconnectedItemsRender(connectionsToDisconnect);
}

Gridifier.Disconnector.prototype._findConnectionsToDisconnect = function(items) {
    var connectionsToDisconnect = [];

    for(var i = 0; i < items.length; i++) {
        var itemConnection = this._connections.findConnectionByItem(items[i]);
        connectionsToDisconnect.push(itemConnection);
    }

    return this._connectionsSorter.sortConnectionsPerReappend(connectionsToDisconnect);
}

// We should recreate connectors on connections.length == 0,
// because retransformAllSizes will exit before recreating transformerConnectors.
Gridifier.Disconnector.prototype._recreateConnectors = function() {
    this._connectors.flush();

    if(this._settings.isDefaultAppend()) {
        this._appender.createInitialConnector();
    }
    else if(this._settings.isReversedAppend()) {
        this._reversedAppender.createInitialConnector();
    }
}

Gridifier.Disconnector.prototype._scheduleDisconnectedItemsRender = function(disconnectedConnections) {
    var renderer = this._gridifier.getRenderer();
    var connectionBatches = this._gridifier.splitToBatches(disconnectedConnections, 12);

    var itemsToDisconnect = [];
    for(var i = 0; i < connectionBatches.length; i++) {
        for(var j = 0; j < connectionBatches[i].length; j++)
            itemsToDisconnect.push(connectionBatches[i][j].item);
    }

    renderer.markItemsAsScheduledToHide(itemsToDisconnect);
    for(var i = 0; i < connectionBatches.length; i++) {
        (function(connectionBatch, i) {
            setTimeout(function() { renderer.hideConnections(connectionBatch); }, 60 * i);
        })(connectionBatches[i], i);
    }
}