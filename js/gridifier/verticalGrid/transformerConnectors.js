Gridifier.VerticalGrid.TransformerConnectors = function(gridifier,
                                                        connectors,
                                                        connections,
                                                        guid,
                                                        appender,
                                                        reversedAppender,
                                                        sizesTransformer,
                                                        connectorsCleaner) {
    var me = this;

    this._gridifier = null;
    this._connectors = null;
    this._connections = null;
    this._guid = null;
    this._appender = null;
    this._reversedAppender = null;
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

Gridifier.VerticalGrid.TransformerConnectors.prototype.recreateConnectorsPerConnectionTransform = function(transformedConnection,
                                                                                                           transformedItemClone) {
    if(this._sizesTransformer.isReversedAppendShouldBeUsedPerItemInsert(transformedConnection.item)) {
        this._gridifier.setLastOperation(Gridifier.OPERATIONS.REVERSED_APPEND);
        this._recreateConnectorsPerReversedTransformedConnectionAppend(transformedConnection, transformedItemClone);
    }
    else {
        this._gridifier.setLastOperation(Gridifier.OPERATIONS.APPEND);
        this._recreateConnectorsPerDefaultTransformedConnectionAppend(transformedConnection, transformedItemClone);
    }
}

Gridifier.VerticalGrid.TransformerConnectors.prototype._recreateConnectorsPerReversedTransformedConnectionAppend = function(transformedConnection,
                                                                                                                            transformedItemClone) {
    // First prepended item should be processed separately(To not align to corner).
    if(this._guid.wasItemPrepended(this._guid.getItemGUID(transformedConnection.item))
       && this._connections.count() == 0) {
        var transformedItemCloneWidth = SizesResolver.outerWidth(transformedItemClone, true);
        this._connectors.flush();

        if(transformedConnection.x2 - transformedItemCloneWidth + 1 >= 0
           && transformedConnection.x2 <= this._gridifier.getGridX2()) {
            this._connectors.addAppendConnector(
                Gridifier.Connectors.SIDES.RIGHT.TOP,
                Dom.toInt(transformedConnection.x2 - transformedItemCloneWidth + 1),
                Dom.toInt(transformedConnection.y1)
            );
        }
        else if(this._gridifier.getGridX2() - transformedItemCloneWidth + 1 >= 0) {
            this._connectors.addAppendConnector(
                Gridifier.Connectors.SIDES.RIGHT.TOP,
                Dom.toInt(this._gridifier.getGridX2() - transformedItemCloneWidth + 1),
                Dom.toInt(transformedConnection.y1)
            );
        }
        else {
            this._reversedAppender.createInitialConnector();
        }
    }
    else {
        this._reversedAppender.recreateConnectorsPerAllConnectedItems();
        // @todo -> Clean connectors here?
    }
}

Gridifier.VerticalGrid.TransformerConnectors.prototype._recreateConnectorsPerDefaultTransformedConnectionAppend = function(transformedConnection,
                                                                                                                           transformedItemClone) {
    // First prepended item should be processed separately(To not align to corner).
    if(this._guid.wasItemPrepended(this._guid.getItemGUID(transformedConnection.item))
       && this._connections.count() == 0) {
        var transformedItemCloneWidth = SizesResolver.outerWidth(transformedItemClone, true);
        this._connectors.flush();

        if(transformedConnection.x1 + transformedItemCloneWidth - 1 <= this._gridifier.getGridX2()) {
            this._connectors.addAppendConnector(
                Gridifier.Connectors.SIDES.LEFT.TOP,
                Dom.toInt(transformedConnection.x1 + transformedItemCloneWidth - 1),
                Dom.toInt(transformedConnection.y1)
            );
        }
        else {
            this._appender.createInitialConnector();
        }
    }
    else {
        this._appender.recreateConnectorsPerAllConnectedItems();
        this._connectorsCleaner.deleteAllIntersectedFromBottomConnectors();
    }
}

Gridifier.VerticalGrid.TransformerConnectors.prototype.addGluingDefaultAppendConnectorOnFirstPrependedConnection = function() {
    var connections = this._connections.get();
    for(var i = 0; i < connections.length; i++) {
        if(this._guid.isFirstPrependedItem(connections[i].itemGUID)) {
            this._connectors.addAppendConnector(
                Gridifier.Connectors.SIDES.LEFT.TOP,
                Dom.toInt(this._gridifier.getGridX2()),
                Dom.toInt(connections[i].y1)
            );
            break;
        }
    }
}

Gridifier.VerticalGrid.TransformerConnectors.prototype.addGluingReversedAppendConnectorOnFirstPrependedConnection = function() {

}