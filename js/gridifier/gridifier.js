Gridifier = function(grid, settings) { 
    var me = this;

    this._grid = null;
    this._gridSizesUpdater = null;
    this._settings = null;
    this._collector = null;
    this._guid = null;
    this._eventEmitter = null;
    this._operation = null;
    this._resorter = null;
    this._filtrator = null;
    this._disconnector = null;
    this._sizesResolverManager = null;
    this._lifecycleCallbacks = null;
    this._itemClonesManager = null;

    this._connectors = null;
    this._connections = null;
    this._connectionsSorter = null;
    this._renderer = null;
    this._sizesTransformer = null;
    this._normalizer = null;

    this._prepender = null;
    this._reversedPrepender = null;

    this._appender = null;
    this._reversedAppender = null;

    this._operationsQueue = null;
    this._toggleOperation = null;
    this._transformOperation = null;

    this._css = {
    };

    this._construct = function() {
        me._sizesResolverManager = new Gridifier.SizesResolverManager();
        me._grid = new Gridifier.Grid(grid, me._sizesResolverManager);
        me._eventEmitter = new Gridifier.EventEmitter(me);
        me._guid = new Gridifier.GUID();
        me._settings = new Gridifier.Settings(settings, me, me._guid, me._eventEmitter, me._sizesResolverManager);
        me._collector = new Gridifier.Collector(me._settings,  me.getGrid(), me._sizesResolverManager);

        me._settings.setCollectorInstance(me._collector);

        me._normalizer = new Gridifier.Normalizer(me, me._sizesResolverManager);
        me._operation = new Gridifier.Operation();
        me._lifecycleCallbacks = new Gridifier.LifecycleCallbacks(me._collector);
        me._itemClonesManager = new Gridifier.ItemClonesManager(me._grid, me._collector);

        me._grid.setCollectorInstance(me._collector);

        if(me._settings.isVerticalGrid()) {
            me._connections = new Gridifier.VerticalGrid.Connections(
                me, me._guid, me._settings, me._sizesResolverManager, me._eventEmitter
            );
            me._connectionsSorter = new Gridifier.VerticalGrid.ConnectionsSorter(
                me._connections, me._settings, me._guid
            );
        }
        else if(me._settings.isHorizontalGrid()) {
            me._connections = new Gridifier.HorizontalGrid.Connections(
                me, me._guid, me._settings, me._sizesResolverManager, me._eventEmitter
            );
            me._connectionsSorter = new Gridifier.HorizontalGrid.ConnectionsSorter(
                me._connections, me._settings, me._guid
            );
        }

        me._gridSizesUpdater = new Gridifier.GridSizesUpdater(
            me._grid, me._connections, me._settings, me._eventEmitter
        );

        me._connectors = new Gridifier.Connectors(me._guid, me._connections);
        me._renderer = new Gridifier.Renderer(me, me._connections, me._settings, me._normalizer);

        if(me._settings.isVerticalGrid()) {
            me._prepender = new Gridifier.VerticalGrid.Prepender(
                me, me._settings, me._sizesResolverManager, me._connectors, me._connections, me._guid, me._renderer, me._normalizer, me._operation
            );
            me._reversedPrepender = new Gridifier.VerticalGrid.ReversedPrepender(
                me, me._settings, me._sizesResolverManager, me._connectors, me._connections, me._guid, me._renderer, me._normalizer, me._operation
            );
            me._appender = new Gridifier.VerticalGrid.Appender(
                me, me._settings, me._sizesResolverManager, me._connectors, me._connections, me._guid, me._renderer, me._normalizer, me._operation
            );
            me._reversedAppender = new Gridifier.VerticalGrid.ReversedAppender(
                me, me._settings, me._sizesResolverManager, me._connectors, me._connections, me._guid, me._renderer, me._normalizer, me._operation
            );
        }
        else if(me._settings.isHorizontalGrid()) {
            me._prepender = new Gridifier.HorizontalGrid.Prepender(
                me, me._settings, me._sizesResolverManager, me._connectors, me._connections, me._guid, me._renderer, me._normalizer, me._operation
            );
            me._reversedPrepender = new Gridifier.HorizontalGrid.ReversedPrepender(
                me, me._settings, me._sizesResolverManager, me._connectors, me._connections, me._guid, me._renderer, me._normalizer, me._operation
            );
            me._appender = new Gridifier.HorizontalGrid.Appender(
                me, me._settings, me._sizesResolverManager, me._connectors, me._connections, me._guid, me._renderer, me._normalizer, me._operation
            );
            me._reversedAppender = new Gridifier.HorizontalGrid.ReversedAppender(
                me, me._settings, me._sizesResolverManager, me._connectors, me._connections, me._guid, me._renderer, me._normalizer, me._operation
            );
        }

        me._resorter = new Gridifier.Resorter(
            me, me._collector, me._connections, me._settings, me._guid
        );
        me._disconnector = new Gridifier.Disconnector(
            me, me._collector, me._connections, me._connectors, me._settings, me._guid, me._appender, me._reversedAppender
        );
        me._filtrator = new Gridifier.Filtrator(
            me, me._collector, me._connections, me._settings, me._guid, me._disconnector
        );

        me._sizesTransformer = new Gridifier.SizesTransformer.Core(
            me,
            me._settings,
            me._collector,
            me._connectors,
            me._connections,
            me._connectionsSorter,
            me._guid,
            me._appender,
            me._reversedAppender,
            me._normalizer,
            me._operation,
            me._sizesResolverManager
        );
        me._connections.setSizesTransformerInstance(me._sizesTransformer);

        me._toggleOperation = new Gridifier.TransformerOperations.Toggle(
            me._collector, me._connections, me._guid, me._sizesTransformer, me._sizesResolverManager
        );
        me._transformOperation = new Gridifier.TransformerOperations.Transform(
            me._collector, me._connections, me._guid, me._sizesTransformer, me._sizesResolverManager
        );

        me._operationsQueue = new Gridifier.Operations.Queue(
            me._gridSizesUpdater,
            me._collector, 
            me._connections,
            me._connectionsSorter,
            me._guid, 
            me._settings, 
            me._prepender,
            me._reversedPrepender,
            me._appender,
            me._reversedAppender,
            me._sizesTransformer,
            me._sizesResolverManager
        );

        // @todo -> Remove from local var
        var dragifier = new Gridifier.Dragifier(
            me, 
            me._appender,
            me._reversedAppender,
            me._collector,
            me._connections, 
            me._connectors, 
            me._guid, 
            me._settings,
            me._sizesResolverManager
        );

        // @todo -> run first iteration?(Process items that were at start)
        me._bindEvents();
    };

    this._bindEvents = function() {
        var processResizeEventTimeout = null;
        //var processResizeEvent = 100;
        // @todo get from settings??
        // @todo -> Make this adjustable or enable by default???(Resize timeouts)
        Event.add(window, "resize", function() {
            // if(processResizeEventTimeout != null) {
            //     clearTimeout(processResizeEventTimeout);
            //     processResizeEventTimeout = null;
            // }
            
            // @todo -> Make this as optional parameter???
           //processResizeEventTimeout = setTimeout(function() {
            me.triggerResize();
            //}, processResizeEvent);
        });
    };

    this._unbindEvents = function() {
        // @todo -> Remove resize handler
    };

    this.destruct = function() {
        me._unbindEvents();
    };

    this._construct();
    return this;
}

Gridifier.prototype.addToGrid = function(items) {
    this._grid.addToGrid(items);
    return this;
}

Gridifier.prototype.getGridX2 = function() {
    return this._grid.getGridX2();
}

Gridifier.prototype.getGridY2 = function() {
    return this._grid.getGridY2();
}

Gridifier.prototype.getGrid = function() {
    return this._grid.getGrid();
}

Gridifier.prototype.getCalculatedGridWidth = function() {
    return this._connections.getMaxX2();
}

Gridifier.prototype.getCalculatedGridHeight = function() {
    return this._connections.getMaxY2();
}

Gridifier.prototype.getRenderer = function() {
    return this._renderer;
}

Gridifier.prototype.markAsGridItem = function(items) {
    this._grid.markAsGridItem(items);
    return this;
}

Gridifier.prototype.scheduleGridSizesUpdate = function() {
    this._gridSizesUpdater.scheduleGridSizesUpdate();
}

Gridifier.prototype.triggerResize = function() {
    this._sizesResolverManager.startCachingTransaction();
    this.retransformAllSizes();
    this._sizesResolverManager.stopCachingTransaction();
}

// Write tests soon per everything :}
// Method names -> gridify, watchify?
// @todo -> User can write this method???? Why should it be inside lib?
Gridifier.prototype.watch = function() {
    // @todo -> Watch per DOM appends-prepends through setTimeout,
    //  and process changes.
    // Or don't think about appends-prepends, Just use WATCH_INSERT_TYPE param.(By def append)
    // We don't need depend on DOM structure of the wrapper.
    //  Process deletes.
    // Or custom watch logic -> Depending on some param of new item append or prepend
}

Gridifier.prototype.toggleBy = function(toggleFunctionName) {
    this._settings.setToggle(toggleFunctionName);
    return this;
}

Gridifier.prototype.sortBy = function(sortFunctionName) {
    this._settings.setSort(sortFunctionName);
    return this;
}

Gridifier.prototype.filterBy = function(filterFunctionName) { 
    this._sizesTransformer.stopRetransformAllConnectionsQueue();
    this._settings.setFilter(filterFunctionName);
    this._filtrator.filter();
    this.retransformAllSizes();

    return this;
}

Gridifier.prototype.resort = function() {
    this._sizesTransformer.stopRetransformAllConnectionsQueue();
    this._resorter.resort();
    this.retransformAllSizes();

    return this;
}

Gridifier.prototype.collect = function() {
    ;
}

Gridifier.prototype.disconnect = function(items) {
    this._lifecycleCallbacks.executePreDisconnectCallbacks(items);

    var execute = function() {
        this._sizesTransformer.stopRetransformAllConnectionsQueue();
        this._disconnector.disconnect(items);
        this.retransformAllSizes();
    }

    var me = this;
    setTimeout(function() { execute.call(me); }, Gridifier.REFLOW_OPTIMIZATION_TIMEOUT);

    return this;
}

Gridifier.prototype.setCoordsChanger = function(coordsChangerName) {
    this._settings.setCoordsChanger(coordsChangerName);
    return this;
}

Gridifier.prototype.setSizesChanger = function(sizesChangerName) {
    this._settings.setSizesChanger(sizesChangerName);
    return this;
}

Gridifier.prototype.setItemWidthPercentageAntialias = function(itemWidthPtAntialias) {
    this._normalizer.bindZIndexesUpdates();
    this._normalizer.setItemWidthAntialiasPercentageValue(itemWidthPtAntialias);

    return this;
}

Gridifier.prototype.setItemHeightPercentageAntialias = function(itemHeightPtAntialias) {
    this._normalizer.bindZIndexesUpdates();
    this._normalizer.setItemHeightAntialiasPercentageValue(itemHeightPtAntialias);

    return this;
}

Gridifier.prototype.setItemWidthPxAntialias = function(itemWidthPxAntialias) {
    this._normalizer.bindZIndexesUpdates();
    this._normalizer.setItemWidthAntialiasPxValue(itemWidthPxAntialias);

    return this;
}

Gridifier.prototype.setItemHeightPxAntialias = function(itemHeightPxAntialias) {
    this._normalizer.bindZIndexesUpdates();
    this._normalizer.setItemHeightAntialiasPxValue(itemHeightPxAntialias);

    return this;
}

Gridifier.prototype.disableZIndexesUpdates = function() {
    this._normalizer.disableZIndexesUpdates();
    return this;
}

Gridifier.prototype.prepend = function(items, batchSize, batchTimeout) {
    if(this._settings.isMirroredPrepend()) {
        // @todo -> should reverse collection
        this.insertBefore(items, null, batchSize, batchTimeout);
        return this;
    }

    this._lifecycleCallbacks.executePreInsertCallbacks(items);
    var execute = function() {
        this._operationsQueue.schedulePrependOperation(items, batchSize, batchTimeout);
    }

    var me = this;
    setTimeout(function() { execute.call(me); }, Gridifier.REFLOW_OPTIMIZATION_TIMEOUT);

    return this;
}

Gridifier.prototype.append = function(items, batchSize, batchTimeout) {
    this._lifecycleCallbacks.executePreInsertCallbacks(items);

    var execute = function() {
        this._operationsQueue.scheduleAppendOperation(items, batchSize, batchTimeout);
    }

    var me = this;
    setTimeout(function() { execute.call(me); }, Gridifier.REFLOW_OPTIMIZATION_TIMEOUT);

    return this;
}

Gridifier.prototype.silentAppend = function(items, batchSize, batchTimeout) {
   this._renderer.scheduleForSilentRender(
      this._collector.toDOMCollection(items)
   );
   this.append(items, batchSize, batchTimeout);
}

Gridifier.prototype.silentRender = function() {
   var executeSilentRender = function() {
       var scheduledForSilentRenderItems = this._collector.collectByQuery(
           "[" + Gridifier.Renderer.SILENT_RENDER_DATA_ATTR + "=" + Gridifier.Renderer.SILENT_RENDER_DATA_ATTR_VALUE + "]"
       );

       var scheduledForSilentRenderConnections = [];
       for (var i = 0; i < scheduledForSilentRenderItems.length; i++) {
           scheduledForSilentRenderConnections.push(
               this._connections.findConnectionByItem(scheduledForSilentRenderItems[i])
           );
       }

       this._renderer.unscheduleForSilentRender(
           scheduledForSilentRenderItems,
           scheduledForSilentRenderConnections
       );
       this._renderer.showConnections(scheduledForSilentRenderConnections);
   }

   var me = this;
   setTimeout(function() { executeSilentRender.call(me); }, Gridifier.REFLOW_OPTIMIZATION_TIMEOUT + 20);
}

Gridifier.prototype.insertBefore = function(items, beforeItem, batchSize, batchTimeout) {
    this._lifecycleCallbacks.executePreInsertCallbacks(items);

    var execute = function() {
        this._operationsQueue.scheduleInsertBeforeOperation(
            items, beforeItem, batchSize, batchTimeout
        );
    }

    var me = this;
    setTimeout(function() { execute.call(me); }, Gridifier.REFLOW_OPTIMIZATION_TIMEOUT);

    return this;
}

Gridifier.prototype.insertAfter = function(items, afterItem, batchSize, batchTimeout) {
    this._lifecycleCallbacks.executePreInsertCallbacks(items);

    var execute = function() {
        this._operationsQueue.scheduleInsertAfterOperation(
            items, afterItem, batchSize, batchTimeout
        );
    }

    var me = this;
    setTimeout(function() { execute.call(me); }, Gridifier.REFLOW_OPTIMIZATION_TIMEOUT);

    return this;
}

Gridifier.prototype.retransformAllSizes = function() {
    this._normalizer.updateItemAntialiasValues();
    this._transformOperation.executeRetransformAllSizes();
}

Gridifier.prototype.toggleSizes = function(maybeItem, newWidth, newHeight) {
    this._normalizer.updateItemAntialiasValues();
    this._toggleOperation.execute(maybeItem, newWidth, newHeight, false);
}

Gridifier.prototype.transformSizes = function(maybeItem, newWidth, newHeight) {
    this._normalizer.updateItemAntialiasValues();
    this._transformOperation.execute(maybeItem, newWidth, newHeight, false);
}

Gridifier.prototype.toggleSizesWithPaddingBottom = function(maybeItem, newWidth, newPaddingBottom) {
    this._normalizer.updateItemAntialiasValues();
    this._toggleOperation.execute(maybeItem, newWidth, newPaddingBottom, true);
}

Gridifier.prototype.transformSizesWithPaddingBottom = function(maybeItem, newWidth, newPaddingBottom) {
    this._normalizer.updateItemAntialiasValues();
    this._transformOperation.execute(maybeItem, newWidth, newPaddingBottom, true);
}

Gridifier.prototype.addPreInsertLifecycleCallback = function(callback) {
    this._lifecycleCallbacks.addPreInsertCallback(callback);
}

Gridifier.prototype.addPreDisconnectLifecycleCallback = function(callback) {
    this._lifecycleCallbacks.addPreDisconnectCallback(callback);
}

Gridifier.prototype.setItemClonesManagerLifecycleCallbacks = function() {
    var me = this;
    this.addPreInsertLifecycleCallback(function(items) {
        for(var i = 0; i < items.length; i++) {
            me._itemClonesManager.createClone(items[i]);
        }
    });

    this.addPreDisconnectLifecycleCallback(function(items) {
        for(var i = 0; i < items.length; i++) {
            me._itemClonesManager.destroyClone(items[i]);
        }
    });
}

Gridifier.prototype.getItemClonesManager = function() {
    return this._itemClonesManager;
}

Gridifier.prototype.hasItemBindedClone = function(item) {
    return this._itemClonesManager.hasBindedClone(item);
}

Gridifier.prototype.getItemClone = function(item) {
    if(!this._itemClonesManager.hasBindedClone(item))
        new Error("Gridifier error: item has no binded clone.(Wrong item?). Item = ", item);

    return this._itemClonesManager.getBindedClone(item);
}

// @todo -> Add to items numbers besides GUIDS, and rebuild them on item deletes(Also use in sorting per drag?)

Gridifier.Api = {};
Gridifier.HorizontalGrid = {};
Gridifier.VerticalGrid = {};
Gridifier.Operations = {};
Gridifier.TransformerOperations = {};
Gridifier.SizesTransformer = {};

Gridifier.REFLOW_OPTIMIZATION_TIMEOUT = 0;

Gridifier.GRID_TYPES = {VERTICAL_GRID: "verticalGrid", HORIZONTAL_GRID: "horizontalGrid"};

Gridifier.PREPEND_TYPES = {MIRRORED_PREPEND: "mirroredPrepend", DEFAULT_PREPEND: "defaultPrepend", REVERSED_PREPEND: "reversedPrepend"};
Gridifier.APPEND_TYPES = {DEFAULT_APPEND: "defaultAppend", REVERSED_APPEND: "reversedAppend"};

Gridifier.INTERSECTION_STRATEGIES = {DEFAULT: "default", NO_INTERSECTIONS: "noIntersections"};
Gridifier.INTERSECTION_STRATEGY_ALIGNMENT_TYPES = {
    FOR_VERTICAL_GRID: {
        TOP: "top", CENTER: "center", BOTTOM: "bottom"
    },
    FOR_HORIZONTAL_GRID: {
        LEFT: "left", CENTER: "center", RIGHT: "right"
    }
};

Gridifier.SORT_DISPERSION_MODES = {DISABLED: "disabled", CUSTOM: "custom", CUSTOM_ALL_EMPTY_SPACE: "customAllEmptySpace"};

Gridifier.GRID_ITEM_MARKING_STRATEGIES = {BY_CLASS: "class", BY_DATA_ATTR: "data", BY_QUERY: "query"};
Gridifier.GRID_ITEM_MARKING_DEFAULTS = {CLASS: "gridifier-item", DATA_ATTR: "data-gridifier-item", QUERY: "div > div"};

Gridifier.OPERATIONS = {PREPEND: 0, REVERSED_PREPEND: 1, APPEND: 2, REVERSED_APPEND: 3, MIRRORED_PREPEND: 4};
Gridifier.DEFAULT_TOGGLE_ANIMATION_MS_DURATION = 500;
Gridifier.DEFAULT_COORDS_CHANGE_ANIMATION_MS_DURATION = 500;

Gridifier.DEFAULT_ROTATE_PERSPECTIVE = "200px";
Gridifier.DEFAULT_ROTATE_BACKFACE = true;

Gridifier.GRID_TRANSFORM_TYPES = {EXPAND: "expand", FIT: "fit"};
Gridifier.DEFAULT_GRID_TRANSFORM_TIMEOUT = 100;