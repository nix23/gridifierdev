Gridifier.VerticalGrid.TransformerConnectors = function(gridifier,
                                                        connectors,
                                                        connections,
                                                        guid,
                                                        appender,
                                                        reversedAppender,
                                                        normalizer,
                                                        sizesTransformer,
                                                        connectorsCleaner) {
    var me = this;

    this._gridifier = null;
    this._connectors = null;
    this._connections = null;
    this._guid = null;
    this._appender = null;
    this._reversedAppender = null;
    this._normalizer = null;
    this._sizesTransformer = null;

    this._connectorsCleaner = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._connectors = connectors;
        me._connections = connections;
        me._guid = guid;
        me._appender = appender;
        me._reversedAppender = reversedAppender;
        me._normalizer = normalizer;
        me._sizesTransformer = sizesTransformer;
        me._connectorsCleaner = connectorsCleaner;
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

Gridifier.VerticalGrid.TransformerConnectors.prototype.recreateConnectorsPerConnectionTransform = function(firstConnectionToReappend) {
    if(this._sizesTransformer.isReversedAppendShouldBeUsedPerItemInsert(firstConnectionToReappend.item)) {
        this._gridifier.setLastOperation(Gridifier.OPERATIONS.REVERSED_APPEND);
        this._recreateConnectorsPerReversedTransformedConnectionAppend(firstConnectionToReappend);
    }
    else {
        this._gridifier.setLastOperation(Gridifier.OPERATIONS.APPEND);
        this._recreateConnectorsPerDefaultTransformedConnectionAppend(firstConnectionToReappend);
    }
}

// @todo -> Change to use firstConnectionToReappend
Gridifier.VerticalGrid.TransformerConnectors.prototype._recreateConnectorsPerReversedTransformedConnectionAppend = function(transformedConnection,
                                                                                                                            transformedItemClone) {
    // First prepended item should be processed separately(To not align to corner).
    if(this._guid.wasItemPrepended(this._guid.getItemGUID(transformedConnection.item))
       && this._connections.count() == 0) {
        var transformedItemCloneWidth = SizesResolverManager.outerWidth(transformedItemClone, true);
        this._connectors.flush();

        // @todo -> Check logic, and if x1 normalization is required
        // @todo -> Check if normalizeLowRounding(0) is required
        if(transformedConnection.x2 - transformedItemCloneWidth + 1 >= 0
           && transformedConnection.x2 <= this._gridifier.getGridX2()) {
            this._connectors.addAppendConnector(
                Gridifier.Connectors.SIDES.RIGHT.TOP,
                parseFloat(transformedConnection.x2 - transformedItemCloneWidth + 1),
                Dom.toInt(transformedConnection.y1)
            );
            Logger.log( // @system-log-start
                "recreateConnectorsPerReversedTransformedConnectionAppend",
                "transformed item was prepened, is first and can be inserted from left",
                this._connectors.get(),
                this._connections.get()
            );          // @system-log-end
        }
        else if(this._gridifier.getGridX2() - transformedItemCloneWidth + 1 >= 0) {
            this._connectors.addAppendConnector(
                Gridifier.Connectors.SIDES.RIGHT.TOP,
                parseFloat(this._gridifier.getGridX2() - transformedItemCloneWidth + 1),
                Dom.toInt(transformedConnection.y1)
            );
            Logger.log( // @system-log-start
                "recreateConnectorsPerReversedTransformedConnectionAppend",
                "transformed item was prepended, is first and can be inserted from right",
                this._connectors.get(),
                this._connections.get()
            );          // @system-log-end
        }
        else {
            this._reversedAppender.createInitialConnector();
            Logger.log( // @system-log-start
                "recreateConnectorsPerReversedTransformedConnectionAppend",
                "transformed item was prepended, is first -> createInitialConnector(ra)",
                this._connectors.get(),
                this._connections.get()
            );          // @system-log-end
        }
    }
    else {
        this._reversedAppender.recreateConnectorsPerAllConnectedItems();
        // @todo -> Clean connectors here?
        Logger.log( // @system-log-start
            "recreateConnectorsPerReversedTransformedConnectionAppend",
            "recreateConnectorsPerAllConnectedItems(ra)",
            this._connectors.get(),
            this._connections.get()
        );          // @system-log-end
    }
}

Gridifier.VerticalGrid.TransformerConnectors.prototype._recreateConnectorsPerDefaultTransformedConnectionAppend = function(firstConnectionToReappend) {
    // First prepended item should be processed separately(To not align to corner).
    if(this._guid.wasItemPrepended(this._guid.getItemGUID(firstConnectionToReappend.item))
       && this._connections.count() == 0) {
        if(typeof(firstConnectionToReappend.transformedItemClone) != "undefined") 
            var firstItemToReappendWidth = SizesResolverManager.outerWidth(firstConnectionToReappend.transformedItemClone, true);
        else
            var firstItemToReappendWidth = SizesResolverManager.outerWidth(firstConnectionToReappend.item, true);
        
        var lastRenderedLeftOffset = parseFloat(firstConnectionToReappend.lastRenderedLeftOffset);
        var transformedConnectionNewPtX1 = this._normalizer.unnormalizeFractionalValueForRender(lastRenderedLeftOffset);
        var transformedConnectionNewX1 = (this._gridifier.getGridX2() + 1) * (transformedConnectionNewPtX1 / 100);
        var transformedConnectionNewX2 = transformedConnectionNewX1 + firstItemToReappendWidth - 1;

        this._connectors.flush();

        // @todo -> Check if normalizeHighRounding required
        if(transformedConnectionNewX2 <= this._gridifier.getGridX2()) {
            this._connectors.addAppendConnector(
                Gridifier.Connectors.SIDES.LEFT.TOP,
                parseFloat(transformedConnectionNewX2),
                Dom.toInt(firstConnectionToReappend.y1)
            );
            Logger.log( // @system-log-start
                "recreateConnectorsPerDefaultTransformedConnectionAppend",
                "transformed item was prepended, is first and can be inserted from right",
                this._connectors.get(),
                this._connections.get()
            );          // @system-log-end
        }
        else {
            this._appender.createInitialConnector();
            Logger.log( // @system-log-start
                "recreateConnectorsPerDefaultTransformedConnectionAppend",
                "transformed item was prepended, is first -> createInitialConnector(da)",
                this._connectors.get(),
                this._connections.get()
            );          // @system-log-end
        }
    }
    else {
        this._appender.recreateConnectorsPerAllConnectedItems();
        Logger.log( // @system-log-start
            "recreateConnectorsPerDefaultTransformedConnectionAppend",
            "recreateConnectorsPerAllConnectedItems",
            this._connectors.get(),
            this._connections.get()
        );          // @system-log-end
        this._connectorsCleaner.deleteAllIntersectedFromBottomConnectors();
        Logger.log( // @system-log-start
            "recreateConnectorsPerDefaultTransformedConnectionAppend",
            "deleteAllIntersectedFromBottomConnectors",
            this._connectors.get(),
            this._connections.get()
        );          // @system-log-end
    }
}

// @todo -> Determine, if gluing connectors are required
Gridifier.VerticalGrid.TransformerConnectors.prototype.addGluingDefaultAppendConnectorOnFirstPrependedConnection = function() {
    // var connections = this._connections.get();
    // for(var i = 0; i < connections.length; i++) {
    //     if(this._guid.isFirstPrependedItem(Dom.toInt(connections[i].itemGUID))) {
    //         this._connectors.addAppendConnector(
    //             Gridifier.Connectors.SIDES.LEFT.TOP,
    //             parseFloat(this._gridifier.getGridX2()),
    //             Dom.toInt(connections[i].y1)
    //         );
    //         break;
    //     }
    // }
}

Gridifier.VerticalGrid.TransformerConnectors.prototype.addGluingReversedAppendConnectorOnFirstPrependedConnection = function() {

}