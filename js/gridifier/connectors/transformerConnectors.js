Gridifier.TransformerConnectors = function(gridifier,
                                           settings,
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
    this._settings = null;
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
        me._settings = settings;
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

Gridifier.TransformerConnectors.prototype.setItemsReappenderInstance = function(itemsReappender) {
    this._itemsReappender = itemsReappender;
}

Gridifier.TransformerConnectors.prototype.recreateConnectorsPerFirstItemReappendOnTransform = function(firstItemToReappend,
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
Gridifier.TransformerConnectors.prototype._recreateConnectorsPerReversedItemReappend = function(firstItemToReappend,
                                                                                                firstConnectionToReappend) {
    this._connections.reinitRanges();
    this._reversedAppender.recreateConnectorsPerAllConnectedItems();
    Logger.log( // @system-log-start
        "recreateConnectorsPerReversedTransformedConnectionAppend",
        "recreateConnectorsPerAllConnectedItems(ra)",
        this._connectors.get(),
        this._connections.get()
    );          // @system-log-end

    if(this._settings.isVerticalGrid()) {
        this._connectorsCleaner.deleteAllIntersectedFromBottomConnectors();
        var logFunction = "deleteAllIntersectedFromBottomConnectors"; // @system-log
    }
    else if(this._settings.isHorizontalGrid()) {
        this._connectorsCleaner.deleteAllIntersectedFromRightConnectors();
        var logFunction = "deleteAllIntersectedFromRightConnectors"; // @system-log
    }

    Logger.log( // @system-log-start
        "recreateConnectorsPerReversedTransformedConnectionAppend",
        logFunction,
        this._connectors.get(),
        this._connections.get()
    );          // @system-log-end
}

Gridifier.TransformerConnectors.prototype._recreateConnectorsPerDefaultItemReappend = function(firstItemToReappend,
                                                                                               firstConnectionToReappend) {
    this._connections.reinitRanges();
    this._appender.recreateConnectorsPerAllConnectedItems();
    Logger.log( // @system-log-start
        "recreateConnectorsPerDefaultTransformedConnectionAppend",
        "recreateConnectorsPerAllConnectedItems",
        this._connectors.get(),
        this._connections.get()
    );          // @system-log-end
    
    if(this._settings.isVerticalGrid()) {
        this._connectorsCleaner.deleteAllIntersectedFromBottomConnectors();
        var logFunction = "deleteAllIntersectedFromBottomConnectors"; // @system-log
    }
    else if(this._settings.isHorizontalGrid()) {
        this._connectorsCleaner.deleteAllIntersectedFromRightConnectors();
        var logFunction = "deleteAllIntersectedFromRightConnectors"; // @system-log
    }

    Logger.log( // @system-log-start
        "recreateConnectorsPerDefaultTransformedConnectionAppend",
        logFunction,
        this._connectors.get(),
        this._connections.get()
    );          // @system-log-end
}