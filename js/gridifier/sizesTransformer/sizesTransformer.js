Gridifier.SizesTransformer = function(gridifier,
                                      settings,
                                      connectors,
                                      connections,
                                      connectionsSorter,
                                      guid,
                                      appender,
                                      reversedAppender,
                                      normalizer) {
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

        if(me._settings.isVerticalGrid()) {
            me._connectorsCleaner = new Gridifier.VerticalGrid.ConnectorsCleaner(
                me._connectors, me._connections, me._settings
            );
        }
        else if(me._settings.isHorizontalGrid()) {
            // @todo -> Implement here
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

        if(me._settings.isVerticalGrid()) {
            me._transformerConnectors = new Gridifier.VerticalGrid.TransformerConnectors(
                me._gridifier,
                me._connectors,
                me._connections,
                me._guid,
                me._appender,
                me._reversedAppender,
                me._normalizer,
                me,
                me._connectorsCleaner,
                me._transformedItemMarker
            );
        }
        else if(me._settings.isHorizontalGrid()) {
            // @todo -> Implement horizontal grid here
        }

        me._itemsReappender = new Gridifier.SizesTransformer.ItemsReappender(
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
        var itemsToReappendData = this._itemsToReappendFinder.findAllOnSizesTransform(
            transformationData[0].connectionToTransform
        );

        var itemsToReappend = itemsToReappendData.itemsToReappend;
        var firstConnectionToReappend = itemsToReappendData.firstConnectionToReappend;

        this._transformedItemMarker.markAllTransformDependedItems(itemsToReappend);
        this._itemsReappender.storeHowNextReappendedItemWasInserted(itemsToReappend[0]);
        this._transformerConnectors.recreateConnectorsPerFirstItemReappendOnTransform(
            itemsToReappend[0], firstConnectionToReappend
        );
        // @todo -> Check, if this is still required
        //this._transformerConnectors.maybeAddGluingConnectorOnFirstPrependedConnection(transformedConections[0]);

        this._itemsReappender.reappendItems(itemsToReappend);

        // @todo -> Enable this setting
        //if(me._settings.isNoIntersectionsStrategy()) {
        //    me._emptySpaceNormalizer.emptySpaceNormalizer.normalizeFreeSpace();
        //}

        this._gridifier.getRenderer().renderTransformedConnections();

        Logger.stopLoggingOperation(); // @system-log
    }

    var me = this;
    setTimeout(function() { applyTransform.call(me); }, 0);
}

Gridifier.SizesTransformer.prototype.retransformAllConnections = function() {
    var connections = this._connections.get();
    if(connections.length == 0)
        return;

    connections = this._connectionsSorter.sortConnectionsPerReappend(connections);

    var itemsToReappend = [];
    var connectionsToKeep = [];
    for(var i = 0; i < connections.length; i++) {
        if(!connections[i][Gridifier.SizesTransformer.RESTRICT_CONNECTION_COLLECT]) {
            itemsToReappend.push(connections[i].item);
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
    this._itemsReappender.storeHowNextReappendedItemWasInserted(firstConnectionToReappend.item);
    this._transformerConnectors.recreateConnectorsPerFirstItemReappendOnTransform(
        firstConnectionToReappend.item, firstConnectionToReappend
    );
    // @todo -> Check, if this is still required
    //this._transformerConnectors.maybeAddGluingConnectorOnFirstPrependedConnection(transformedConections[0]);

    this._itemsReappender.reappendItems(itemsToReappend);

    // @todo -> Enable this setting (Is it required here?)
    //if(me._settings.isNoIntersectionsStrategy()) {
    //    me._emptySpaceNormalizer.emptySpaceNormalizer.normalizeFreeSpace();
    //}

    this._gridifier.getRenderer().renderTransformedConnections();
    
    Logger.stopLoggingOperation(); // @system-log
}