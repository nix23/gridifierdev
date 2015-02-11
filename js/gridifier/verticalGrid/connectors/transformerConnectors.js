Gridifier.VerticalGrid.TransformerConnectors = function(gridifier,
                                                        connectors,
                                                        connections,
                                                        guid,
                                                        appender,
                                                        reversedAppender,
                                                        normalizer,
                                                        sizesTransformer,
                                                        connectorsCleaner,
                                                        transformedItemMarker) {
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
    this._transformedItemMarker = null;
    this._itemsReappender = null;

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

Gridifier.VerticalGrid.TransformerConnectors.prototype.setItemsReappenderInstance = function(itemsReappender) {
    this._itemsReappender = itemsReappender;
}

// @todo -> Determine, if gluing connectors are required.
// If yes, I think this method should accept firstConnectionToReappend(not transformedConnection)
Gridifier.VerticalGrid.TransformerConnectors.prototype.maybeAddGluingConnectorOnFirstPrependedConnection = function(transformedConnection) {
    // @todo -> item before can be not neccesarilly with < GUID(in CSD mode)
    var itemBeforeTransformedGUID = this._guid.getMaxGUIDBefore(
        this._guid.getItemGUID(transformedConnection.item), this._connections.get()
    );
    if(itemBeforeTransformedGUID == null)
        return;

    if(!this._guid.isFirstPrependedItem(itemBeforeTransformedGUID))
        return;
    
    if(this.isReversedAppendShouldBeUsedPerItemInsert(transformedConnection.item)) {
        this.addGluingReversedAppendConnectorOnFirstPrependedConnection();
        Logger.log( // @system-log-start
            "maybeAddGluingConnectorOnFirstPrependedConnection",
            "addGluingReversedAppendConnectorOnFirstPrependedConnection",
            this._connectors.get(),
            this._connections.get()
        );          // @system-log-end
    }
    else {
        this.addGluingDefaultAppendConnectorOnFirstPrependedConnection();
        Logger.log( // @system-log-start
            "maybeAddGluingConnectorOnFirstPrependedConnection",
            "addGluingDefaultAppendConnectorOnFirstPrependedConnection",
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

Gridifier.VerticalGrid.TransformerConnectors.prototype.recreateConnectorsPerFirstItemReappendOnTransform = function(firstItemToReappend,
                                                                                                                    firstConnectionToReappend) {
    if(this._itemsReappender.isReversedAppendShouldBeUsedPerItemInsert(firstItemToReappend)) {
        this._gridifier.setLastOperation(Gridifier.OPERATIONS.REVERSED_APPEND);
        this._recreateConnectorsPerReversedItemReappend(firstItemToReappend, firstConnectionToReappend);
    }
    else {
        this._gridifier.setLastOperation(Gridifier.OPERATIONS.APPEND);
        this._recreateConnectorsPerDefaultItemReappend(firstItemToReappend, firstConnectionToReappend);
    }
}

// @todo -> Change to use firstConnectionToReappend
Gridifier.VerticalGrid.TransformerConnectors.prototype._recreateConnectorsPerReversedItemReappend = function(firstItemToReappend,
                                                                                                             firstConnectionToReappend) {
    this._connections.reinitRanges();

    // First prepended item should be processed separately(To not align to corner).
    if(this._guid.wasItemPrepended(this._guid.getItemGUID(firstItemToReappend))
       && this._connections.count() == 0) {
        if(this._transformedItemMarker.isTransformedItem(firstItemToReappend)) {
            var transformedItemTargetPxSizes = this._transformedItemMarker.getTransformedItemTargetPxSizes(firstItemToReappend);
            var firstItemToReappendWidth = transformedItemTargetPxSizes.targetPxWidth;
        }
        else {
            var firstItemToReappendWidth = SizesResolverManager.outerWidth(firstItemToReappend, true);
        }

        // @todo -> Fix this, and delete fractional PT render
        var lastRenderedLeftOffset = parseFloat(firstConnectionToReappend.lastRenderedLeftOffset);
        var transformedConnectionNewPtX1 = this._normalizer.unnormalizeFractionalValueForRender(lastRenderedLeftOffset);
        var transformedConnectionNewX1 = (this._gridifier.getGridX2() + 1) * (transformedConnectionNewPtX1 / 100);
        var transformedConnectionNewX2 = transformedConnectionNewX1 + firstItemToReappendWidth - 1;

        this._connectors.flush();

        // @todo -> Check logic, and if x1 normalization is required
        // @todo -> Check if normalizeLowRounding(0) is required
        if(transformedConnectionNewX2 - firstItemToReappendWidth + 1 >= 0
           && transformedConnectionNewX2 <= this._gridifier.getGridX2()) {
            this._connectors.addAppendConnector(
                // @old -> Gridifier.Connectors.SIDES.RIGHT.TOP
                Gridifier.Connectors.SIDES.LEFT.TOP,
                parseFloat(transformedConnectionNewX2 - firstItemToReappendWidth + 1),
                Dom.toInt(firstConnectionToReappend.y1)
            );
            Logger.log( // @system-log-start
                "recreateConnectorsPerReversedTransformedConnectionAppend",
                "transformed item was prepened, is first and can be inserted from left",
                this._connectors.get(),
                this._connections.get()
            );          // @system-log-end
        }
        else if(this._gridifier.getGridX2() - firstItemToReappendWidth + 1 >= 0) {
            this._connectors.addAppendConnector(
                // @old -> Gridifier.Connectors.SIDES.RIGHT.TOP
                Gridifier.Connectors.SIDES.LEFT.TOP,
                parseFloat(this._gridifier.getGridX2() - firstItemToReappendWidth + 1),
                Dom.toInt(firstConnectionToReappend.y1)
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
        this._connectorsCleaner.deleteAllIntersectedFromBottomConnectors();
        Logger.log( // @system-log-start
            "recreateConnectorsPerReversedTransformedConnectionAppend",
            "deleteAllIntersectedFromBottomConnectors",
            this._connectors.get(),
            this._connections.get()
        );          // @system-log-end
    }
}

Gridifier.VerticalGrid.TransformerConnectors.prototype._recreateConnectorsPerDefaultItemReappend = function(firstItemToReappend,
                                                                                                            firstConnectionToReappend) {
    this._connections.reinitRanges();

    // First prepended item should be processed separately(To not align to corner).
    if(this._guid.wasItemPrepended(this._guid.getItemGUID(firstItemToReappend))
       && this._connections.count() == 0) {
        if(this._transformedItemMarker.isTransformedItem(firstItemToReappend)) {
            var transformedItemTargetPxSizes = this._transformedItemMarker.getTransformedItemTargetPxSizes(firstItemToReappend);
            var firstItemToReappendWidth = transformedItemTargetPxSizes.targetPxWidth;
        }
        else {
            var firstItemToReappendWidth = SizesResolverManager.outerWidth(firstItemToReappend, true);
        }
        
        //var lastRenderedLeftOffset = parseFloat(firstConnectionToReappend.lastRenderedLeftOffset);
        //var transformedConnectionNewPtX1 = this._normalizer.unnormalizeFractionalValueForRender(lastRenderedLeftOffset);
        //var transformedConnectionNewX1 = (this._gridifier.getGridX2() + 1) * (transformedConnectionNewPtX1 / 100);
        var transformedConnectionNewX1 = parseFloat(firstConnectionToReappend.lastRenderedLeftOffset);
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