Gridifier.Operations.Append = function(gridSizesUpdater,
                                       collector, 
                                       connections,
                                       connectionsSorter,
                                       guid, 
                                       settings,
                                       appender,
                                       reversedAppender,
                                       sizesTransformer,
                                       sizesResolverManager) {
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
    this._sizesResolverManager = null;

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
        me._sizesResolverManager = sizesResolverManager;
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
    this._sizesResolverManager.startCachingTransaction();

    this._collector.ensureAllItemsAreAttachedToGrid(items);
    this._collector.ensureAllItemsCanBeAttachedToGrid(items);

    items = this._collector.filterCollection(items);
    items = this._collector.sortCollection(items);
    
    for(var i = 0; i < items.length; i++) {
        this._guid.markNextAppendedItem(items[i]);
        this._append(items[i]);
    }

    this._sizesResolverManager.stopCachingTransaction();
    this._gridSizesUpdater.scheduleGridSizesUpdate();
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
        this.execute(items);
        return;
    }

    var connectionsToRetransform = [];
    connections = this._connectionsSorter.sortConnectionsPerReappend(connections);

    if(typeof beforeItem == "undefined" || beforeItem == null) {
        var beforeItem = connections[0].item;
    }
    else {
        var beforeItem = (this._collector.toDOMCollection(beforeItem))[0];
        // This check is required, if afterItem is jQuery find result without DOMElem
        if(typeof beforeItem == "undefined" || beforeItem == null)
            var beforeItem = connections[0].item;
    }

    var beforeItemGUID = null;
    var targetItemFound = false;
    for(var i = 0; i < connections.length; i++) {
        if(this._guid.getItemGUID(connections[i].item) == this._guid.getItemGUID(beforeItem)) {
            targetItemFound = true;
            beforeItemGUID = connections[i].itemGUID;
            connectionsToRetransform = connectionsToRetransform.concat(
                connections.splice(i, connections.length - i)
            );
            break;
        }
    }
    
    if(!targetItemFound) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.APPENDER.WRONG_INSERT_BEFORE_TARGET_ITEM,
            beforeItem
        );
        return;
    }
    
    this._connections.reinitRanges();
    this._guid.reinitMaxGUID(beforeItemGUID - 1);

    if(this._settings.isDefaultAppend())
        this._appender.recreateConnectorsPerAllConnectedItems();
    else if(this._settings.isReversedAppend())
        this._reversedAppender.recreateConnectorsPerAllConnectedItems();

    this.execute(items);
    // @todo -> Process customSd mode
    if(this._settings.isDisabledSortDispersion()) {
        this._connections.restore(connectionsToRetransform);
        this._connections.remapAllItemGUIDSInSortedConnections(connectionsToRetransform);
    }
    else if(this._settings.isCustomAllEmptySpaceSortDispersion()) {
        this._connections.restoreOnCustomSortDispersionMode(connectionsToRetransform);
        this._connections.remapAllItemGUIDS();
    }

    this._sizesTransformer.retransformFrom(connectionsToRetransform[0]);
}

Gridifier.Operations.Append.prototype.executeInsertAfter = function(items, afterItem) {
    var connections = this._connections.get();
    if(connections.length == 0) {
        this.execute(items);
        return;
    }

    var connectionsToRetransform = [];
    connections = this._connectionsSorter.sortConnectionsPerReappend(connections);

    if(typeof afterItem == "undefined" || afterItem == null) {
        var afterItem = connections[connections.length - 1].item;
    }
    else {
        var afterItem = (this._collector.toDOMCollection(afterItem))[0];
        // This check is required, if afterItem is jQuery find result without DOMElem
        if(typeof afterItem == "undefined" || afterItem == null)
            var afterItem = connections[connections.length - 1].item;
    }

    var afterItemGUID = null;
    var targetItemFound = false;
    for(var i = 0; i < connections.length; i++) {
        if(this._guid.getItemGUID(connections[i].item) == this._guid.getItemGUID(afterItem)) {
            targetItemFound = true;
            afterItemGUID = connections[i].itemGUID;
            connectionsToRetransform = connectionsToRetransform.concat(
                connections.splice(i + 1, connections.length - i - 1)
            );
            break;
        }
    }

    if(!targetItemFound) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.APPENDER.WRONG_INSERT_AFTER_TARGET_ITEM,
            afterItem
        );
        return;
    }

    this._connections.reinitRanges();
    this._guid.reinitMaxGUID(afterItemGUID + 1);

    if(this._settings.isDefaultAppend())
        this._appender.recreateConnectorsPerAllConnectedItems();
    else if(this._settings.isReversedAppend())
        this._reversedAppender.recreateConnectorsPerAllConnectedItems();

    this.execute(items);
    // @todo -> Process custom SD
    if(this._settings.isDisabledSortDispersion()) {
        this._connections.restore(connectionsToRetransform);
        this._connections.remapAllItemGUIDSInSortedConnections(connectionsToRetransform);
    }
    else if(this._settings.isCustomAllEmptySpaceSortDispersion()) {
        this._connections.restoreOnCustomSortDispersionMode(connectionsToRetransform);
        this._connections.remapAllItemGUIDS();
    }

    if(connectionsToRetransform.length > 0)
        this._sizesTransformer.retransformFrom(connectionsToRetransform[0]);
}