Gridifier.SizesTransformer = function(gridifier,
                                      settings,
                                      connectors,
                                      connections,
                                      connectionsSorter,
                                      guid,
                                      appender,
                                      reversedAppender,
                                      normalizer,
                                      operation) {
    var me = this;

    this._gridifier = null;
    this._settings = null;
    this._connectors = null;
    this._connections = null;
    this._connectionsSorter = null;
    this._guid = null;
    this._appender = null;
    this._reversedAppender = null;
    this._normalizer = null;
    this._operation = null;

    this._connectorsCleaner = null;
    this._connectorsSelector = null;
    this._transformerConnectors = null;

    this._transformedConnectionsSorter = null;
    this._itemNewPxSizesFinder = null;
    this._transformedItemMarker = null;
    this._itemsToReappendFinder = null;
    this._itemsReappender = null;
    this._emptySpaceNormalizer = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._settings = settings;
        me._connectors = connectors;
        me._connections = connections;
        me._connectionsSorter = connectionsSorter;
        me._guid = guid;
        me._appender = appender;
        me._reversedAppender = reversedAppender;
        me._normalizer = normalizer;
        me._operation = operation;

        if(me._settings.isVerticalGrid()) {
            me._connectorsCleaner = new Gridifier.VerticalGrid.ConnectorsCleaner(
                me._connectors, me._connections, me._settings
            );
        }
        else if(me._settings.isHorizontalGrid()) {
            me._connectorsCleaner = new Gridifier.HorizontalGrid.ConnectorsCleaner(
                me._connectors, me._connections, me._settings
            );
        }

        me._connectorsSelector = new Gridifier.VerticalGrid.ConnectorsSelector(me._guid);

        me._transformedConnectionsSorter = new Gridifier.SizesTransformer.TransformedConnectionsSorter(
            me._connectionsSorter
        );
        me._itemNewPxSizesFinder = new Gridifier.SizesTransformer.ItemNewPxSizesFinder(
            me._gridifier, me._connections
        );
        me._transformedItemMarker = new Gridifier.SizesTransformer.TransformedItemMarker();
        me._itemsToReappendFinder = new Gridifier.SizesTransformer.ItemsToReappendFinder(
            me._connections, me._connectionsSorter, me._settings
        );

        me._transformerConnectors = new Gridifier.TransformerConnectors(
            me._gridifier,
            me._settings,
            me._connectors,
            me._connections,
            me._guid,
            me._appender,
            me._reversedAppender,
            me._normalizer,
            me,
            me._connectorsCleaner,
            me._transformedItemMarker,
            me._operation
        );

        me._itemsReappender = new Gridifier.SizesTransformer.ItemsReappender(
            me._gridifier,
            me._appender,
            me._reversedAppender,
            me._connections, 
            me._connectors, 
            me._connectorsCleaner, 
            me._connectorsSelector,
            me._transformerConnectors,
            me._settings, 
            me._guid,
            me._transformedItemMarker
        );
        me._transformerConnectors.setItemsReappenderInstance(me._itemsReappender);

        me._emptySpaceNormalizer = new Gridifier.SizesTransformer.EmptySpaceNormalizer(
            me._connections, me._connectors, me._settings
        );
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

Gridifier.SizesTransformer.RESTRICT_CONNECTION_COLLECT = "restrictConnectionCollect";

Gridifier.SizesTransformer.prototype.isTransformerQueueEmpty = function() {
    return this._itemsReappender.isReappendQueueEmpty();
}

Gridifier.SizesTransformer.prototype.getQueuedConnectionsPerTransform = function() {
    return this._itemsReappender.getQueuedConnectionsPerTransform();
}

Gridifier.SizesTransformer.prototype.transformConnectionSizes = function(transformationData) {
    transformationData = this._transformedConnectionsSorter.sortTransformedConnections(
        transformationData
    );
    transformationData = this._itemNewPxSizesFinder.calculateNewPxSizesPerAllTransformedItems(
        transformationData
    );

    // Timeout is required here because of DOM-tree changes inside transformed item clones creation.
    // (Optimizing getComputedStyle after reflow performance)
    var applyTransform = function() {
        this._transformedItemMarker.markEachConnectionItemWithTransformData(transformationData);

        var connectionsToReappend = [];
        if(!this._itemsReappender.isReappendQueueEmpty()) {
            var currentQueueState = this._itemsReappender.stopReappendingQueuedItems();

            for(var i = 0; i < currentQueueState.reappendQueue.length; i++) {
                var queuedConnection = currentQueueState.reappendQueue[i].connectionToReappend;
                if(queuedConnection[Gridifier.SizesTransformer.RESTRICT_CONNECTION_COLLECT])
                    continue;

                connectionsToReappend.push(queuedConnection);
            }
        }

        var itemsToReappendData = this._itemsToReappendFinder.findAllOnSizesTransform(
            connectionsToReappend, transformationData[0].connectionToTransform
        );

        var itemsToReappend = itemsToReappendData.itemsToReappend;
        var connectionsToReappend = itemsToReappendData.connectionsToReappend;
        var firstConnectionToReappend = itemsToReappendData.firstConnectionToReappend;
        
        this._transformedItemMarker.markAllTransformDependedItems(itemsToReappend);
        this._transformerConnectors.recreateConnectorsPerFirstItemReappendOnTransform(
            itemsToReappend[0], firstConnectionToReappend
        );

        this._itemsReappender.createReappendQueue(itemsToReappend, connectionsToReappend);
        this._itemsReappender.startReappendingQueuedItems();

        // @todo -> Enable this setting
        //if(me._settings.isNoIntersectionsStrategy()) {
        //    me._emptySpaceNormalizer.emptySpaceNormalizer.normalizeFreeSpace();
        //}
    }

    var me = this;
    setTimeout(function() { applyTransform.call(me); }, 0);
}

Gridifier.SizesTransformer.prototype.stopRetransformAllConnectionsQueue = function() {
    var connections = this._connections.get();

    if(!this._itemsReappender.isReappendQueueEmpty()) {
        var currentQueueState = this._itemsReappender.stopReappendingQueuedItems();

        var reappendedConnections = [];
        for(var i = 0; i < currentQueueState.reappendedQueueData.length; i++)
            reappendedConnections.push(currentQueueState.reappendedQueueData[i].connectionToReappend);
        // Sync is required here, because item sorting in CSDAES mode depends on item positions.
        // And if we made resize, first batch was reappended, and than made second resize,
        // we should grab all items according to start positions to not keep item sorting in sync.
        // (That happens because here on second resize we are resizing ALL items again from scratch.
        //   In transform sizes this is redundant, because we are starting AFTER reppended items(if there
        //   are some items in queue), or from first transformed connection)
        this._connections.syncConnectionParams(reappendedConnections);

        for(var i = 0; i < currentQueueState.reappendQueue.length; i++)
            connections.push(currentQueueState.reappendQueue[i].connectionToReappend);
    }
}

Gridifier.SizesTransformer.prototype.retransformAllConnections = function() {
    this.stopRetransformAllConnectionsQueue();
    var connections = this._connections.get();
    
    if(connections.length == 0)
        return;

    var applyRetransform = function() {
        connections = this._connectionsSorter.sortConnectionsPerReappend(connections);

        var itemsToReappend = [];
        var connectionsToKeep = [];
        var connectionsToReappend = [];
        for(var i = 0; i < connections.length; i++) {
            if(!connections[i][Gridifier.SizesTransformer.RESTRICT_CONNECTION_COLLECT]) {
                itemsToReappend.push(connections[i].item);
                connectionsToReappend.push(connections[i]);
            }
            else {
                connectionsToKeep.push(connections[i]);
            }
        }

        var firstConnectionToReappend = null;
        if(connectionsToKeep.length == 0) {
            firstConnectionToReappend = connections[0];
            connections.splice(0, connections.length);
        }
        else {
            for(var i = 0; i < connections.length; i++) {
                var shouldRetransformConnection = true;

                for(var j = 0; j < connectionsToKeep.length; j++) {
                    if(connectionsToKeep[j].itemGUID == connections[i].itemGUID) {
                        shouldRetransformConnection = false;
                        break;
                    }
                }

                if(shouldRetransformConnection) {
                    firstConnectionToReappend = connections[i];
                    break;
                }
            }

            connections.splice(0, connections.length);
            for(var i = 0; i < connectionsToKeep.length; i++)
                connections.push(connectionsToKeep[i]);
        }

        this._transformedItemMarker.markAllTransformDependedItems(itemsToReappend);
        this._transformerConnectors.recreateConnectorsPerFirstItemReappendOnTransform(
            firstConnectionToReappend.item, firstConnectionToReappend
        );

        this._itemsReappender.createReappendQueue(itemsToReappend, connectionsToReappend);
        this._itemsReappender.startReappendingQueuedItems();

        // @todo -> Enable this setting (Is it required here?) Move this declaration after queue flush
        //if(me._settings.isNoIntersectionsStrategy()) {
        //    me._emptySpaceNormalizer.emptySpaceNormalizer.normalizeFreeSpace();
        //}
    }

    var wereItemSizesSyncs = this._syncAllScheduledToTransformItemSizes(connections);
    if(!wereItemSizesSyncs) {
        applyRetransform.call(this);
    }
    // Timeout is required here because of DOM-tree changes inside transformed item clones creation.
    // (Optimizing getComputedStyle after reflow performance)
    else {
        var me = this;
        setTimeout(function() { applyRetransform.call(me); }, 0);
    }
}

// Sync is required, because scheduled connection to transform may has changed % sizes after resizes.
Gridifier.SizesTransformer.prototype._syncAllScheduledToTransformItemSizes = function(connections) {
    var transformationData = [];
    for(var i = 0; i < connections.length; i++) {
        if(this._transformedItemMarker.isTransformedItem(connections[i].item)) {
            var rawSizes = this._transformedItemMarker.getTransformedItemTargetRawSizes(
                connections[i].item
            );
            transformationData.push({
                connectionToTransform: connections[i],
                widthToTransform: rawSizes.targetRawWidth,
                heightToTransform: rawSizes.targetRawHeight
            });
        }
    }

    if(transformationData.length == 0)
        return false;

    transformationData = this._itemNewPxSizesFinder.calculateNewPxSizesPerAllTransformedItems(
        transformationData
    );
    this._transformedItemMarker.markEachConnectionItemWithTransformData(transformationData);

    return true;
}

// This method has no async actions before starting the queue.
// (Used in insertBefore, insertAfter methods. In that methods we should launch reappend
//  queue immediatly, because in CSD mode we can't insertBefore or after next item BEFORE
//  current items positions are recalculated.(Order depends on position)
Gridifier.SizesTransformer.prototype.retransformFrom = function(firstConnectionToRetransform) {
    var connectionsToReappend = [];
    if(!this._itemsReappender.isReappendQueueEmpty()) {
        var currentQueueState = this._itemsReappender.stopReappendingQueuedItems();

        for(var i = 0; i < currentQueueState.reappendQueue.length; i++) {
            var queuedConnection = currentQueueState.reappendQueue[i].connectionToReappend;
            if(queuedConnection[Gridifier.SizesTransformer.RESTRICT_CONNECTION_COLLECT])
                continue;

            connectionsToReappend.push(queuedConnection);
        }
    }

    var itemsToReappendData = this._itemsToReappendFinder.findAllOnSizesTransform(
        connectionsToReappend, firstConnectionToRetransform
    );

    var itemsToReappend = itemsToReappendData.itemsToReappend;
    var connectionsToReappend = itemsToReappendData.connectionsToReappend;
    var firstConnectionToReappend = itemsToReappendData.firstConnectionToReappend;
    
    this._transformedItemMarker.markAllTransformDependedItems(itemsToReappend);
    this._transformerConnectors.recreateConnectorsPerFirstItemReappendOnTransform(
        itemsToReappend[0], firstConnectionToReappend
    );

    this._itemsReappender.createReappendQueue(itemsToReappend, connectionsToReappend);
    this._itemsReappender.startReappendingQueuedItems();

    // @todo -> Enable this setting
    //if(me._settings.isNoIntersectionsStrategy()) {
    //    me._emptySpaceNormalizer.emptySpaceNormalizer.normalizeFreeSpace();
    //}
}