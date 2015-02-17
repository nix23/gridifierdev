Gridifier.Operations.Append = function(gridSizesUpdater,
                                       collector, 
                                       connections,
                                       connectionsSorter,
                                       guid, 
                                       settings,
                                       appender,
                                       reversedAppender,
                                       sizesTransformer) {
    var me = this;

    this._gridSizesUpdater = null;
    this._collector = null;
    this._connections = null;
    this._connectionsSorter = null;
    this._guid = null;
    this._settings = null;
    this._appender = null;
    this._reversedAppender = null;
    this._sizesTransformer = null;

    this._css = {
    };

    this._construct = function() {
        me._gridSizesUpdater = gridSizesUpdater;
        me._collector = collector;
        me._connections = connections;
        me._connectionsSorter = connectionsSorter;
        me._guid = guid;
        me._settings = settings;
        me._appender = appender;
        me._reversedAppender = reversedAppender;
        me._sizesTransformer = sizesTransformer;
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

Gridifier.Operations.Append.prototype.execute = function(items) {
    var items = this._collector.toDOMCollection(items);
    SizesResolverManager.startCachingTransaction();

    this._collector.ensureAllItemsAreAttachedToGrid(items);
    this._collector.ensureAllItemsCanBeAttachedToGrid(items);

    items = this._collector.filterCollection(items);
    items = this._collector.sortCollection(items);
    
    for(var i = 0; i < items.length; i++) {
        this._guid.markNextAppendedItem(items[i]);
        this._append(items[i]);
    }

    SizesResolverManager.stopCachingTransaction();
    this._gridSizesUpdater.scheduleGridSizesUpdate();
    
    return this;
}

Gridifier.Operations.Append.prototype._append = function(item) {
    if(this._settings.isDefaultAppend()) {
        Logger.startLoggingOperation(                   // @system-log-start
            Logger.OPERATION_TYPES.APPEND,
            "Item GUID: " + this._guid.getItemGUID(item)
        );                                              // @system-log-end
        this._appender.append(item);
        Logger.stopLoggingOperation();// @system-log
    }
    else if(this._settings.isReversedAppend()) {
        Logger.startLoggingOperation(                   // @system-log-start
            Logger.OPERATION_TYPES.REVERSED_APPEND,
            "Item GUID: " + this._guid.getItemGUID(item)
        );                                              // @system-log-end
        this._reversedAppender.reversedAppend(item);
        Logger.stopLoggingOperation();// @system-log
    }
}

Gridifier.Operations.Append.prototype.executeInsertBefore = function(items, beforeItem) {
    var connections = this._connections.get();
    if(connections.length == 0) {
        this._append(items);
        return;
    }

    var connectionsToRetransform = [];
    connections = this._connectionsSorter.sortConnectionsPerReappend(connections);

    if(typeof beforeItem == "undefined") {
        var beforeItem = connections[0].item;
    }
    else {
        // @todo -> Ensure beforeItem exists(transform to DOM, than Check by guids)
        // (Or check in cycle)
    }

    var lastConnectionGUID = null;
    for(var i = 0; i < connections.length; i++) {
        if(this._guid.getItemGUID(connections[i].item) == this._guid.getItemGUID(beforeItem)) {
            connectionsToRetransform = connectionsToRetransform.concat(
                connections.splice(i, connections.length - i)
            );
            break;
        }

        lastConnectionGUID = connections[i].itemGUID;
    }
    
    this._connections.reinitRanges();
    this._guid.reinitMaxGUID(lastConnectionGUID);

    if(this._settings.isDefaultAppend())
        this._appender.recreateConnectorsPerAllConnectedItems();
    else if(this._settings.isReversedAppend())
        this._reversedAppender.recreateConnectorsPerAllConnectedItems();

    this.execute(items);
    this._connections.restore(connectionsToRetransform);
    this._connections.remapAllItemGUIDS();

    this._sizesTransformer.retransformFrom(connectionsToRetransform[0]);
}