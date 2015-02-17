Gridifier.HorizontalGrid.TransformerConnectors = function(gridifier,
                                                          connectors,
                                                          connections,
                                                          guid,
                                                          appender,
                                                          reversedAppender,
                                                          normalizer,
                                                          sizesTransformer,
                                                          connectorsCleaner,
                                                          transformedItemMarker,
                                                          operation) {
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
    this._operation = null;

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
        me._operation = operation;
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

Gridifier.HorizontalGrid.TransformerConnectors.prototype.setItemsReappenderInstance = function(itemsReappender) {
    this._itemsReappender = itemsReappender;
}

Gridifier.HorizontalGrid.TransformerConnectors.prototype.recreateConnectorsPerFirstItemReappendOnTransform = function(firstItemToReappend,
                                                                                                                      firstConnectionToReappend) {
    if(this._itemsReappender.isReversedAppendShouldBeUsedPerItemInsert(firstItemToReappend)) {
        this._operation.setLastOperation(Gridifier.OPERATIONS.REVERSED_APPEND);
        this._recreateConnectorsPerReversedItemReappend(firstItemToReappend, firstConnectionToReappend);
    }
    else {
        this._operation.setLastOperation(Gridifier.OPERATIONS.APPEND);
        this._recreateConnectorsPerDefaultItemReappend(firstItemToReappend, firstConnectionToReappend);
    }
}

// @todo -> Change to use firstConnectionToReappend
Gridifier.HorizontalGrid.TransformerConnectors.prototype._recreateConnectorsPerReversedItemReappend = function(firstItemToReappend,
                                                                                                               firstConnectionToReappend) {
    this._connections.reinitRanges();
    this._reversedAppender.recreateConnectorsPerAllConnectedItems();
    Logger.log( // @system-log-start
        "recreateConnectorsPerReversedTransformedConnectionAppend",
        "recreateConnectorsPerAllConnectedItems(ra)",
        this._connectors.get(),
        this._connections.get()
    );          // @system-log-end
    this._connectorsCleaner.deleteAllIntersectedFromRightConnectors();
    Logger.log( // @system-log-start
        "recreateConnectorsPerReversedTransformedConnectionAppend",
        "deleteAllIntersectedFromRightConnectors",
        this._connectors.get(),
        this._connections.get()
    );          // @system-log-end
}

Gridifier.HorizontalGrid.TransformerConnectors.prototype._recreateConnectorsPerDefaultItemReappend = function(firstItemToReappend,
                                                                                                              firstConnectionToReappend) {
    this._connections.reinitRanges();
    this._appender.recreateConnectorsPerAllConnectedItems();
    Logger.log( // @system-log-start
        "recreateConnectorsPerDefaultTransformedConnectionAppend",
        "recreateConnectorsPerAllConnectedItems",
        this._connectors.get(),
        this._connections.get()
    );          // @system-log-end
    this._connectorsCleaner.deleteAllIntersectedFromRightConnectors();
    Logger.log( // @system-log-start
        "recreateConnectorsPerDefaultTransformedConnectionAppend",
        "deleteAllIntersectedFromRightConnectors",
        this._connectors.get(),
        this._connections.get()
    );          // @system-log-end
}