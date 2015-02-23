Gridifier.SizesTransformer.ItemsReappender = function(gridifier,
                                                      appender,
                                                      reversedAppender,
                                                      connections,
                                                      connectors,
                                                      connectorsCleaner,
                                                      connectorsSelector,
                                                      transformerConnectors,
                                                      settings, 
                                                      guid,
                                                      transformedItemMarker) {
    var me = this;

    this._gridifier = null;
    this._appender = null;
    this._reversedAppender = null;
    this._connections = null;
    this._connectors = null;
    this._connectorsCleaner = null;
    this._connectorsSelector = null;
    this._transformerConnectors = null;
    this._settings = null;
    this._guid = null;
    this._transformedItemMarker = null;

    this._reappendQueue = null;
    this._batchSize = 12;
    this._reappendNextQueuedItemsBatchTimeout = null;
    this._reappendedQueueData = null;
    this._reappendStartViewportWidth = null;
    this._reappendStartViewportHeight = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._appender = appender;
        me._reversedAppender = reversedAppender;
        me._connections = connections;
        me._connectors = connectors;
        me._connectorsCleaner = connectorsCleaner;
        me._connectorsSelector = connectorsSelector;
        me._transformerConnectors = transformerConnectors;
        me._settings = settings;
        me._guid = guid;
        me._transformedItemMarker = transformedItemMarker;
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

// @todo -> Check if horizontal grid works correctly here
Gridifier.SizesTransformer.ItemsReappender.prototype.isReversedAppendShouldBeUsedPerItemInsert = function(item) {
    // if(this._guid.wasItemPrepended(this._guid.getItemGUID(item)) 
    //    && !this._settings.isMirroredPrepend()) {
    //     if(this._settings.isDefaultPrepend())
    //         return false;
    //     else if(this._settings.isReversedPrepend())
    //         return true;
    // }
    // else if(this._guid.wasItemAppended(this._guid.getItemGUID(item))) {
    //     if(this._settings.isDefaultAppend())
    //         return false;
    //     else if(this._settings.isReversedAppend())
    //         return true;
    // }
    if(this._settings.isDefaultAppend())
        return false;
    else if(this._settings.isReversedAppend())
        return true;
}

Gridifier.SizesTransformer.ItemsReappender.prototype.createReappendQueue = function(itemsToReappend,
                                                                                    connectionsToReappend) {
    this._reappendQueue = [];
    this._reappendedQueueData = [];

    for(var i = 0; i < connectionsToReappend.length; i++) {
        this._reappendQueue.push({
            'itemToReappend': itemsToReappend[i],
            'connectionToReappend': connectionsToReappend[i]
        });
    }
}

Gridifier.SizesTransformer.ItemsReappender.prototype.isReappendQueueEmpty = function() {
    return (this._reappendNextQueuedItemsBatchTimeout == null) ? true : false;
} 

Gridifier.SizesTransformer.ItemsReappender.prototype.stopReappendingQueuedItems = function() {
    clearTimeout(this._reappendNextQueuedItemsBatchTimeout);
    this._reappendNextQueuedItemsBatchTimeout = null;

    return {
        reappendQueue: this._reappendQueue,
        reappendedQueueData: this._reappendedQueueData
    };
}

Gridifier.SizesTransformer.ItemsReappender.prototype.getQueuedConnectionsPerTransform = function() {
    var queuedConnections = [];
    for(var i = 0; i < this._reappendQueue.length; i++) {
        queuedConnections.push(this._reappendQueue[i].connectionToReappend);
    }

    return queuedConnections;
}

Gridifier.SizesTransformer.ItemsReappender.prototype.startReappendingQueuedItems = function() {
    //this._lastReappendedItemGUID = null;
    // @todo -> Replace with JS events
    this._reappendStartViewportWidth = $(window).width();
    this._reappendStartViewportHeight = $(window).height();

    this._reappendNextQueuedItemsBatch();
}

Gridifier.SizesTransformer.ItemsReappender.prototype._reappendNextQueuedItemsBatch = function() {
    var batchSize = this._batchSize;
    if(batchSize > this._reappendQueue.length)
        batchSize = this._reappendQueue.length;

    var reappendedItemGUIDS = [];
    // @todo -> Replace with JS events
    // @todo -> Check settings ver.grid/hor.grid
    if($(window).width() != this._reappendStartViewportWidth)
        return;

    for(var i = 0; i < batchSize; i++) {
        var nextItemToReappend = this._reappendQueue[i].itemToReappend;

        if(this.isReversedAppendShouldBeUsedPerItemInsert(nextItemToReappend))
            var reappendType = Gridifier.APPEND_TYPES.REVERSED_APPEND;
        else
            var reappendType = Gridifier.APPEND_TYPES.DEFAULT_APPEND;

        this._reappendItem(reappendType, nextItemToReappend);

        if(this._settings.isVerticalGrid())
            this._connectorsCleaner.deleteAllIntersectedFromBottomConnectors();
        else if(this._settings.isHorizontalGrid())
            // @todo -> Delete horizontal grid connectors here
            ;
        /* @system-log-start */
        Logger.log( 
            "reappendItems",
            "deleteAllIntersectedFromBottomOrXXXConnectors",
            this._connectors.get(),
            this._connections.get()
        );
        /* @system-log-end */

        //this._lastReappendedItemGUID = this._guid.getItemGUID(nextItemToReappend);
        reappendedItemGUIDS.push(this._guid.getItemGUID(nextItemToReappend));
    }

    var reappendedConnections = this._connections.getConnectionsByItemGUIDS(reappendedItemGUIDS);
    this._gridifier.getRenderer().renderTransformedConnections(reappendedConnections);

    this._reappendedQueueData = this._reappendedQueueData.concat(this._reappendQueue.splice(0, batchSize));
    if(this._reappendQueue.length == 0) {
        this._reappendNextQueuedItemsBatchTimeout = null;
        /* @system-log-start */
        Logger.stopLoggingOperation();
        /* @system-log-end */
        return;
    }

    var me = this;
    this._reappendNextQueuedItemsBatchTimeout = setTimeout(function() {
        me._reappendNextQueuedItemsBatch.call(me);
    //}, 25); // Move to const
    }, 25); 
}

Gridifier.SizesTransformer.ItemsReappender.prototype._reappendItem = function(reappendType,
                                                                              itemToReappend) {
    /* @system-log-start */
    var isTransformedItem = this._transformedItemMarker.isTransformedItem(itemToReappend);
    var loggerItemType = (isTransformedItem) ? "Transformed" : "Depended";
    /* @system-log-end */
    if(reappendType == Gridifier.APPEND_TYPES.REVERSED_APPEND) {
        /* @system-log-start */
        Logger.startLoggingSubaction(
            "reappend" + loggerItemType + "ItemWithReversedAppend",
            "reversedAppend item with GUID: " + this._guid.getItemGUID(itemToReappend)
        );
        /* @system-log-end */
        this._reversedAppender.reversedAppend(itemToReappend);
    }
    else if(reappendType == Gridifier.APPEND_TYPES.DEFAULT_APPEND) {
        /* @system-log-start */
        Logger.startLoggingSubaction(
            "reappend" + loggerItemType + "ItemWithDefaultAppend",
            "defaultAppend item with GUID: " + this._guid.getItemGUID(itemToReappend)
        );
        /* @system-log-end */
        this._appender.append(itemToReappend);
    }
    /* @system-log-start */
    Logger.stopLoggingSubaction();
    /* @system-log-end */
}