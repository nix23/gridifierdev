Gridifier.Disconnector = function(gridifier,
                                  collector,
                                  connections,
                                  connectors,
                                  settings,
                                  guid,
                                  appender,
                                  reversedAppender) {
    var me = this;

    this._gridifier = null;
    this._collector = null;
    this._connections = null;
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

// @todo -> Check if sort and GUIDS swap is required
Gridifier.Disconnector.prototype.disconnect = function(items) {
    var items = this._collector.toDOMCollection(items);
    this._collector.ensureAllItemsAreConnectedToGrid(items);

    var connectionsToDisconnect = this._findConnectionsToDisconnect(items);
    for(var i = 0; i < connectionsToDisconnect.length; i++) {
        this._connections.removeConnection(connectionsToDisconnect[i]);
        this._guid.removeItemGUID(connectionsToDisconnect[i].item);
    }
    if(this._connections.get().length == 0)
        this._recreateConnectors();
    
    for(var i = 0; i < connectionsToDisconnect.length; i++)
        this._connectedItemMarker.unmarkItemAsConnected(connectionsToDisconnect[i].item);
    
    var renderer = this._gridifier.getRenderer();
    renderer.hideConnections(connectionsToDisconnect);
}

Gridifier.Disconnector.prototype._findConnectionsToDisconnect = function(items) {
    var connectionsToDisconnect = [];

    for(var i = 0; i < items.length; i++) {
        var itemConnection = this._connections.findConnectionByItem(items[i]);
        connectionsToDisconnect.push(itemConnection);
    }

    return connectionsToDisconnect;
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