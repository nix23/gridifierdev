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
                                                      transformedItemMarker,
                                                      emptySpaceNormalizer,
                                                      sizesResolverManager,
                                                      eventEmitter) {
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
    this._emptySpaceNormalizer = null;
    this._sizesResolverManager = null;
    this._eventEmitter = null;

    this._reappendQueue = null;
    this._reappendNextQueuedItemsBatchTimeout = null;
    this._reappendedQueueData = null;
    this._reappendStartGridX2 = 0;
    this._reappendStartGridY2 = 0;
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
        me._emptySpaceNormalizer = emptySpaceNormalizer;
        me._sizesResolverManager = sizesResolverManager;
        me._eventEmitter = eventEmitter;
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

Gridifier.SizesTransformer.ItemsReappender.prototype.isReversedAppendShouldBeUsedPerItemInsert = function(item) {
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
    this._reappendStartGridX2 = this._gridifier.getGridX2();
    this._reappendStartGridY2 = this._gridifier.getGridY2();
    this._reappendStartViewportWidth = this._sizesResolverManager.viewportWidth();
    this._reappendStartViewportHeight = this._sizesResolverManager.viewportHeight();

    this._reappendNextQueuedItemsBatch();
}

Gridifier.SizesTransformer.ItemsReappender.prototype._reappendNextQueuedItemsBatch = function(checkSameProcess) {
    var batchSize = this._settings.getRetransformQueueBatchSize();
    if(batchSize > this._reappendQueue.length)
        batchSize = this._reappendQueue.length;

    this._sizesResolverManager.startCachingTransaction();

    var checkIfIsSameReappendProcess = checkSameProcess || false;
    var isSameReappendProcess = true;
    if(checkIfIsSameReappendProcess) {
        if(this._settings.isVerticalGrid()) {
            if(this._reappendStartGridX2 != this._gridifier.getGridX2())
                isSameReappendProcess = false;

            if(this._sizesResolverManager.viewportWidth() != this._reappendStartViewportWidth)
                isSameReappendProcess = false;
        }
        else if(this._settings.isHorizontalGrid()) {
            if(this._reappendStartGridY2 != this._gridifier.getGridY2()) {
                isSameReappendProcess = false;
            }

            if(this._sizesResolverManager.viewportHeight() != this._reappendStartViewportHeight)
                isSameReappendProcess = false;
        }
    }

    if(!isSameReappendProcess) {
        this._sizesResolverManager.stopCachingTransaction();
        return;
    }

    var reappendedItemGUIDS = [];

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
            this._connectorsCleaner.deleteAllIntersectedFromRightConnectors();
        /* @system-log-start */
        Logger.log( 
            "reappendItems",
            "deleteAllIntersectedFromBottomOrXXXConnectors",
            this._connectors.get(),
            this._connections.get()
        );
        /* @system-log-end */

        reappendedItemGUIDS.push(this._guid.getItemGUID(nextItemToReappend));
    }

    this._sizesResolverManager.stopCachingTransaction();
    var reappendedConnections = this._connections.getConnectionsByItemGUIDS(reappendedItemGUIDS);
    this._gridifier.getRenderer().renderTransformedConnections(reappendedConnections);

    this._reappendedQueueData = this._reappendedQueueData.concat(this._reappendQueue.splice(0, batchSize));
    if(this._reappendQueue.length == 0) {
        //if(this._settings.isNoIntersectionsStrategy()) {
        //    this._emptySpaceNormalizer.normalizeFreeSpace();
        //}
        this._eventEmitter.emitItemsReappendExecutionEndPerDragifier();
        this._eventEmitter.emitGridRetransformEvent();
        this._reappendNextQueuedItemsBatchTimeout = null;
        /* @system-log-start */
        Logger.stopLoggingOperation();
        /* @system-log-end */
        return;
    }

    var me = this;
    var batchTimeout = this._settings.getRetransformQueueBatchTimeout();

    this._reappendNextQueuedItemsBatchTimeout = setTimeout(function() {
        me._reappendNextQueuedItemsBatch.call(me, true);
    }, batchTimeout);
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