Gridifier.Operations.Prepend = function(gridSizesUpdater,
                                        collector, 
                                        guid, 
                                        settings,
                                        prepender,
                                        reversedPrepender,
                                        sizesResolverManager) {
    var me = this;

    this._gridSizesUpdater = null;
    this._collector = null;
    this._guid = null;
    this._settings = null;
    this._prepender = null;
    this._reversedPrepender = null;
    this._sizesResolverManager = null;

    this._css = {
    };

    this._construct = function() {
        me._gridSizesUpdater = gridSizesUpdater;
        me._collector = collector;
        me._guid = guid;
        me._settings = settings;
        me._prepender = prepender;
        me._reversedPrepender = reversedPrepender;
        me._sizesResolverManager = sizesResolverManager;
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

Gridifier.Operations.Prepend.prototype.execute = function(items) {
    var items = this._collector.toDOMCollection(items);
    this._sizesResolverManager.startCachingTransaction();

    this._collector.ensureAllItemsAreAttachedToGrid(items);
    this._collector.ensureAllItemsCanBeAttachedToGrid(items);

    items = this._collector.filterCollection(items);
    items = this._collector.sortCollection(items);

    for(var i = 0; i < items.length; i++) {
        this._guid.markNextPrependedItem(items[i]);
        this._prepend(items[i]);
    }

    this._sizesResolverManager.stopCachingTransaction();
    this._gridSizesUpdater.scheduleGridSizesUpdate();
}

Gridifier.Operations.Prepend.prototype._prepend = function(item) {
    if(this._settings.isDefaultPrepend()) {
        Logger.startLoggingOperation(       // @system-log-start
            Logger.OPERATION_TYPES.PREPEND,
            "Item GUID: " + this._guid.getItemGUID(item)
        );                                  // @system-log-end
        this._prepender.prepend(item);
        Logger.stopLoggingOperation(); // @system-log
    }
    else if(this._settings.isReversedPrepend()) {
        Logger.startLoggingOperation(       // @system-log-start
            Logger.OPERATION_TYPES.REVERSED_PREPEND,
            "Item GUID: " + this._guid.getItemGUID(item)
        );                                  // @system-log-end
        this._reversedPrepender.reversedPrepend(item);
        Logger.stopLoggingOperation(); // @system-log
    }
}