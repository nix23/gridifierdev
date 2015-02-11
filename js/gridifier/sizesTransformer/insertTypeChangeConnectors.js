Gridifier.SizesTransformer.InsertTypeChangeConnectors = function(itemsReappender,
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

    this._itemsReappender = null;
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

    this._lastReappendedItemInsertType = null;

    this._css = {
    };

    this._construct = function() {
        me._itemsReappender = itemsReappender;
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

Gridifier.SizesTransformer.InsertTypeChangeConnectors.prototype.recreate = function(reappendType,
                                                                                     itemToReappend) {
    this._itemsReappender.storeHowNextReappendedItemWasInserted(itemToReappend);
    this._recreateConnectorsPerAllConnectedItems(reappendType, itemToReappend);
    this._selectOnlyRequiredConnectorsOnPrependedItems(reappendType, itemToReappend);
    this._deleteAllIntersectedConnectors(reappendType, itemToReappend);
}

Gridifier.SizesTransformer.InsertTypeChangeConnectors.prototype._recreateConnectorsPerAllConnectedItems = function(reappendType,
                                                                                                                   itemToReappend) {
    if(reappendType == Gridifier.APPEND_TYPES.REVERSED_APPEND) {
        this._reversedAppender.recreateConnectorsPerAllConnectedItems();
        var reappendLegend = "ra"; // @system-log
    }
    else if(reappendType == Gridifier.APPEND_TYPES.DEFAULT_APPEND) {
        this._appender.recreateConnectorsPerAllConnectedItems();
        var reappendLegend = "da"; // @system-log
    }

    this._logRecreateConnectorsStep(                        // @system-log-start
        "nextReappendedItemInsertTypeChanged -> recreateConnectorsPerAllConnectedItems(" + reappendLegend + ")",
        reappendType,
        itemToReappend
    );                                                      // @system-log-end
}

Gridifier.SizesTransformer.InsertTypeChangeConnectors.prototype._selectOnlyRequiredConnectorsOnPrependedItems = function(reappendType,
                                                                                                                         itemToReappend) {
    this._connectorsSelector.attachConnectors(this._connectors.get());

    if(reappendType == Gridifier.APPEND_TYPES.REVERSED_APPEND) {
        if(this._settings.isVerticalGrid()) {
            var selectedConnectorsSide = Gridifier.Connectors.SIDES.BOTTOM.LEFT;
            var logSide = "BOTTOM.LEFT"; // @system-log
        }
        else if(this._settings.isHorizontalGrid()) {
            // @todo -> select correct side here
            ;
        }
    }
    else if(reappendType == Gridifier.APPEND_TYPES.DEFAULT_APPEND) {
        if(this._settings.isVerticalGrid()) {
            var selectedConnectorsSide = Gridifier.Connectors.SIDES.BOTTOM.RIGHT;
            var logSide = "BOTTOM.RIGHT"; // @system-log
        }
        else if(this._settings.isHorizontalGrid()) {
            // @todo -> select correct side here
            ;
        }
    }

    this._connectorsSelector.selectOnlySpecifiedSideConnectorsOnPrependedItemsExceptFirst(
        selectedConnectorsSide
    );
    this._connectors.set(this._connectorsSelector.getSelectedConnectors());
    this._logRecreateConnectorsStep(                // @system-log-start
        "nextReappendedItemInsertTypeChanged -> " +
        "selectOnlySpecifiedSideConnectorsOnPrependedItemsExceptFirst(" + logSide + ")",
        reappendType,
        itemToReappend
    );                                              // @system-log-end
}

Gridifier.SizesTransformer.InsertTypeChangeConnectors.prototype._deleteAllIntersectedConnectors = function(reappendType,
                                                                                                           itemToReappend) {
    if(this._settings.isVerticalGrid()) {
        this._connectorsCleaner.deleteAllIntersectedFromBottomConnectors();
        var logMethod = "deleteAllIntersectedFromBottomConnectors"; // @system-log
    }
    else if(this._settings.isHorizontalGrid()) {
        // @todo -> clean correct connectors
        ;
    }

    this._logRecreateConnectorsStep(            // @system-log-start
        "nextReappendedItemInsertTypeChanged -> " + logMethod,
        reappendType,
        itemToReappend
    );                                          // @system-log-end
}

Gridifier.SizesTransformer.InsertTypeChangeConnectors.prototype._logRecreateConnectorsStep = function(subheading,        // @system-log-start
                                                                                                      reappendType,
                                                                                                      itemToReappend) {
    var itemGUID = this._guid.getItemGUID(itemToReappend);
    Logger.log(
        this._getLoggerHeadingPrefix(reappendType, itemToReappend), 
        subheading, 
        this._connectors.get(), 
        this._connections.get()
    );
}                                                                                                                        // @system-log-end

Gridifier.SizesTransformer.InsertTypeChangeConnectors.prototype._getLoggerHeadingPrefix = function(reappendType,       // @system-log-start
                                                                                                   itemToReappend) {
    if(this._transformedItemMarker.isTransformedItem(itemToReappend)) {
        if(reappendType == Gridifier.APPEND_TYPES.REVERSED_APPEND)
            return "reappendTransformedItemWithReversedAppend ";
        else if(reappendType == Gridifier.APPEND_TYPES.DEFAULT_APPEND)
            return "reappendTransformedItemWithDefaultAppend ";
    }
    else {
        if(reappendType == Gridifier.APPEND_TYPES.REVERSED_APPEND)
            return "reappendDependedItemWithReversedAppend ";
        else if(reappendType == Gridifier.APPEND_TYPES.DEFAULT_APPEND)
            return "reappendTransformedItemWithDefaultAppend ";
    }
}                                                                                                                     // @system-log-end