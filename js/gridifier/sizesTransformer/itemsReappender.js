Gridifier.SizesTransformer.ItemsReappender = function(appender,
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

    this._insertTypeChangeConnectors = null;
    this._lastReappendedItemInsertType = null;

    this._css = {
    };

    this._construct = function() {
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

        me._insertTypeChangeConnectors = new Gridifier.SizesTransformer.InsertTypeChangeConnectors(
            me,
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
    if(this._guid.wasItemPrepended(this._guid.getItemGUID(item)) 
       && !this._settings.isMirroredPrepend()) {
        if(this._settings.isDefaultPrepend())
            return false;
        else if(this._settings.isReversedPrepend())
            return true;
    }
    else if(this._guid.wasItemAppended(this._guid.getItemGUID(item))) {
        if(this._settings.isDefaultAppend())
            return false;
        else if(this._settings.isReversedAppend())
            return true;
    }
}

Gridifier.SizesTransformer.ItemsReappender.prototype._getNextReappendedItemInsertType = function(item) {
    if(this._guid.wasItemPrepended(this._guid.getItemGUID(item)))
        return Gridifier.OPERATIONS.PREPEND;
    else if(this._guid.wasItemAppended(this._guid.getItemGUID(item)))
        return Gridifier.OPERATIONS.APPEND;
}

Gridifier.SizesTransformer.ItemsReappender.prototype._isNextReappendedItemInsertTypeChanged = function(item) {
    return this._lastReappendedItemInsertType != this._getNextReappendedItemInsertType(item);
}

Gridifier.SizesTransformer.ItemsReappender.prototype.storeHowNextReappendedItemWasInserted = function(item) {
    this._lastReappendedItemInsertType = this._getNextReappendedItemInsertType(item);
}

Gridifier.SizesTransformer.ItemsReappender.prototype.reappendItems = function(itemsToReappend) {
    var lastReappendedItemGUID = null;

    for(var i = 0; i < itemsToReappend.length; i++) {
        if(this.isReversedAppendShouldBeUsedPerItemInsert(itemsToReappend[i]))
            var reappendType = Gridifier.APPEND_TYPES.REVERSED_APPEND;
        else
            var reappendType = Gridifier.APPEND_TYPES.DEFAULT_APPEND;

        this._reappendItem(reappendType, itemsToReappend[i], lastReappendedItemGUID);

        if(this._settings.isVerticalGrid())
            this._connectorsCleaner.deleteAllIntersectedFromBottomConnectors();
        else if(this._settings.isHorizontalGrid())
            // @todo -> Delete horizontal grid connectors here
            ;
        Logger.log( // @system-log-start
            "reappendItems",
            "deleteAllIntersectedFromBottomOrXXXConnectors",
            this._connectors.get(),
            this._connections.get()
        );          // @system-log-end

        lastReappendedItemGUID = this._guid.getItemGUID(itemsToReappend[i]);
    }
}

Gridifier.SizesTransformer.ItemsReappender.prototype._reappendItem = function(reappendType,
                                                                              itemToReappend,
                                                                              lastReappendedItemGUID) {
    if(this._isNextReappendedItemInsertTypeChanged(itemToReappend)) {
        this._insertTypeChangeConnectors.recreate(
            reappendType, itemToReappend, lastReappendedItemGUID
        );
    }

    var isTransformedItem = this._transformedItemMarker.isTransformedItem(itemToReappend); // @system-log
    var loggerItemType = (isTransformedItem) ? "Transformed" : "Depended";                 // @system-log
    if(reappendType == Gridifier.APPEND_TYPES.REVERSED_APPEND) {
        Logger.startLoggingSubaction(   // @system-log-start
            "reappend" + loggerItemType + "ItemWithReversedAppend",
            "reversedAppend item with GUID: " + this._guid.getItemGUID(itemToReappend)
        );                              // @system-log-end
        this._reversedAppender.reversedAppend(itemToReappend, true);
    }
    else if(reappendType == Gridifier.APPEND_TYPES.DEFAULT_APPEND) {
        Logger.startLoggingSubaction(   // @system-log-start
            "reappend" + loggerItemType + "ItemWithDefaultAppend",
            "defaultAppend item with GUID: " + this._guid.getItemGUID(itemToReappend)
        );                              // @system-log-end
        this._appender.append(itemToReappend, true);
    }
    Logger.stopLoggingSubaction(); // @system-log
}