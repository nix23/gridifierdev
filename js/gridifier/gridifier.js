var Gridifier = function(grid, settings) {
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
    this._responsiveClassesManager = null;
    this._imagesResolver = null;

    this._connectors = null;
    this._connections = null;
    this._connectionsSorter = null;
    this._iterator = null;
    this._renderer = null;
    this._silentRenderer = null;
    this._sizesTransformer = null;
    this._normalizer = null;

    this._prepender = null;
    this._reversedPrepender = null;

    this._appender = null;
    this._reversedAppender = null;

    this._operationsQueue = null;
    this._transformOperation = null;

    this._dragifier = null;

    this._resizeEventHandler = null;

    this._css = {};

    this._construct = function() {
        if(typeof settings == "undefined")
            settings = {};

        me._sizesResolverManager = new Gridifier.SizesResolverManager();
        me._grid = new Gridifier.Grid(grid, me._sizesResolverManager);
        me._eventEmitter = new Gridifier.EventEmitter(me);
        me._guid = new Gridifier.GUID();
        me._settings = new Gridifier.Settings(settings, me, me._guid, me._eventEmitter, me._sizesResolverManager);
        me._collector = new Gridifier.Collector(me._settings, me.getGrid(), me._sizesResolverManager);

        me._settings.setCollectorInstance(me._collector);

        me._normalizer = new Gridifier.Normalizer(me, me._sizesResolverManager);
        me._operation = new Gridifier.Operation();

        me._grid.setCollectorInstance(me._collector);

        if(me._settings.shouldResolveImages()) {
            me._imagesResolver = new Gridifier.ImagesResolver(me);
        }

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

        me._responsiveClassesManager = new Gridifier.ResponsiveClassesManager(
            me, me._settings, me._collector, me._guid, me._eventEmitter
        );

        me._iterator = new Gridifier.Iterator(
            me._settings, me._collector, me._connections, me._connectionsSorter, me._guid
        );

        me._gridSizesUpdater = new Gridifier.GridSizesUpdater(
            me, me._grid, me._connections, me._settings, me._eventEmitter
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
            me, me._collector, me._connections, me._connectionsSorter, me._connectors, me._settings, me._guid, me._appender, me._reversedAppender
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
            me._sizesResolverManager,
            me._eventEmitter
        );
        me._connections.setSizesTransformerInstance(me._sizesTransformer);

        me._transformOperation = new Gridifier.TransformerOperations.Transform(
            me._sizesTransformer, me._sizesResolverManager
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
            me._sizesResolverManager,
            me._eventEmitter
        );

        me._silentRenderer = new Gridifier.SilentRenderer(
            me,
            me._collector,
            me._connections,
            me._operationsQueue,
            me._renderer,
            me._renderer.getRendererConnections(),
            me._sizesResolverManager
        );
        me._renderer.setSilentRendererInstance(me._silentRenderer);

        me._dragifier = new Gridifier.Dragifier(
            me,
            me._appender,
            me._reversedAppender,
            me._collector,
            me._connections,
            me._connectors,
            me._guid,
            me._settings,
            me._sizesResolverManager,
            me._eventEmitter
        );

        me._settings.parseAntialiasingSettings();

        me._bindEvents();
    };

    this._bindEvents = function() {
        var processResizeEventAfterMsDelay = me._settings.getResizeTimeout();
        var processResizeEventTimeout = null;

        me._resizeEventHandler = function() {
            if(processResizeEventAfterMsDelay == null) {
                me.triggerResize();
                return;
            }

            if(processResizeEventTimeout != null) {
                clearTimeout(processResizeEventTimeout);
                processResizeEventTimeout = null;
            }

            processResizeEventTimeout = setTimeout(function() {
                me.triggerResize();
            }, processResizeEventAfterMsDelay);
        };

        Event.add(window, "resize", me._resizeEventHandler);
    };

    this._unbindEvents = function() {
        Event.remove(window, "resize", me._resizeEventHandler);
        if(me.isDragifierEnabled())
            me.disableDragifier();
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

Gridifier.prototype.getGridWidth = function() {
    return Math.round(this.getGridX2() + 1);
}

Gridifier.prototype.getGridHeight = function() {
    return Math.round(this.getGridY2() + 1);
}

Gridifier.prototype.getCollector = function() {
    return this._collector;
}

Gridifier.prototype.getRenderer = function() {
    return this._renderer;
}

Gridifier.prototype.getTransformOperation = function() {
    return this._transformOperation;
}

Gridifier.prototype.getResponsiveClassesManager = function() {
    return this._responsiveClassesManager;
}

Gridifier.prototype.splitToBatches = function(items, batchSize) {
    return this._operationsQueue.splitItemsToBatches(items, batchSize);
}

Gridifier.prototype.markAsGridItem = function(items) {
    this._grid.markAsGridItem(items);
    return this;
}

Gridifier.prototype.scheduleGridSizesUpdate = function() {
    this._gridSizesUpdater.scheduleGridSizesUpdate();
}

Gridifier.prototype.triggerResize = function() {
    this.retransformAllSizes();
}

Gridifier.prototype.toggleBy = function(toggleFunctionName) {
    this._settings.setToggle(toggleFunctionName);
    return this;
}

Gridifier.prototype.sortBy = function(sortFunctionName) {
    this._settings.setSort(sortFunctionName);
    return this;
}

Gridifier.prototype.setRetransformSort = function(retransformSortFn) {
    this._settings.setRetransformSort(retransformSortFn);
    this.retransformAllSizes();
    return this;
}

Gridifier.prototype.setRepackSize = function(newSize) {
    this._settings.setCustomRepackSize(newSize);
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
    return this._collector.collect();
}

Gridifier.prototype.collectAllConnectedItems = function() {
    return this._collector.collectAllConnectedItems();
}

Gridifier.prototype.collectAllDisconnectedItems = function() {
    return this._collector.collectAllDisconnectedItems();
}

Gridifier.prototype.getFirst = function() {
    return this._iterator.getFirst();
}

Gridifier.prototype.getLast = function() {
    return this._iterator.getLast();
}

Gridifier.prototype.getNext = function(item) {
    return this._iterator.getNext(item);
}

Gridifier.prototype.getPrev = function(item) {
    return this._iterator.getPrev(item);
}

Gridifier.prototype.getAll = function() {
    return this._iterator.getAll();
}

Gridifier.prototype.pop = function() {
    var itemToPop = this._iterator.getFirst();
    if(itemToPop != null)
        this.disconnect(itemToPop);

    return itemToPop;
}

Gridifier.prototype.shift = function() {
    var itemToShift = this._iterator.getLast();
    if(itemToShift != null)
        this.disconnect(itemToShift);

    return itemToShift;
}

Gridifier.prototype.disconnect = function(items) {
    var me = this;

    items = me._collector.toDOMCollection(items)
    items = me._collector.filterOnlyConnectedItems(items);

    var execute = function() {
        this._sizesTransformer.stopRetransformAllConnectionsQueue();
        this._disconnector.disconnect(items, Gridifier.Disconnector.DISCONNECT_TYPES.HARD);
        this.retransformAllSizes();
    }

    setTimeout(function() {
        execute.call(me);
    }, Gridifier.REFLOW_OPTIMIZATION_TIMEOUT);
    return this;
}

Gridifier.prototype.setCoordsChanger = function(coordsChangerName) {
    this._settings.setCoordsChanger(coordsChangerName);
    return this;
}

Gridifier.prototype.setDraggableItemDecorator = function(draggableItemDecoratorName) {
    this._settings.setDraggableItemDecorator(draggableItemDecoratorName);
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

Gridifier.prototype.setToggleAnimationMsDuration = function(animationMsDuration) {
    this._settings.setToggleAnimationMsDuration(animationMsDuration);
    return this;
}

Gridifier.prototype.setCoordsChangeAnimationMsDuration = function(animationMsDuration) {
    this._settings.setCoordsChangeAnimationMsDuration(animationMsDuration);
    return this;
}

Gridifier.prototype.setToggleTransitionTiming = function(transitionTiming) {
    this._settings.setToggleTransitionTiming(transitionTiming);
    return this;
}

Gridifier.prototype.setCoordsChangeTransitionTiming = function(transitionTiming) {
    this._settings.setCoordsChangeTransitionTiming(transitionTiming);
    return this;
}

Gridifier.prototype.setAlignmentType = function(alignmentType) {
    this._settings.setAlignmentType(alignmentType);
    this.retransformAllSizes();
    return this;
}

Gridifier.prototype.setRotatePerspective = function(newRotatePerspective) {
    this._settings.setRotatePerspective(newRotatePerspective);
    return this;
}

Gridifier.prototype.setRotateBackface = function(newRotateBackface) {
    this._settings.setRotateBackface(newRotateBackface);
    return this;
}

Gridifier.prototype.enableRotateBackface = function() {
    this._settings.setRotateBackface(true);
    return this;
}

Gridifier.prototype.disableRotateBackface = function() {
    this._settings.setRotateBackface(false);
    return this;
}

Gridifier.prototype.setRotateAngles = function(newRotateAngles) {
    this._settings.setRotateAngles(newRotateAngles);
    return this;
}

Gridifier.prototype.setSortDispersionValue = function(newSortDispersionValue) {
    this._settings.setSortDispersionValue(newSortDispersionValue);
    return this;
}

Gridifier.prototype.setDefaultIntersectionStrategy = function() {
    this._settings.setDefaultIntersectionStrategy();
    this.retransformAllSizes();
    return this;
}

Gridifier.prototype.setNoIntersectionStrategy = function() {
    this._settings.setNoIntersectionStrategy();
    this.retransformAllSizes();
    return this;
}

Gridifier.prototype.setRetransformQueueBatchSize = function(newBatchSize) {
    this._settings.setRetransformQueueBatchSize(newBatchSize);
    return this;
}

Gridifier.prototype.setRetransformQueueBatchTimeout = function(newBatchTimeout) {
    this._settings.setRetransformQueueBatchTimeout(newBatchTimeout);
    return this;
}

Gridifier.prototype.prepend = function(items, batchSize, batchTimeout) {
    if(this._settings.shouldResolveImages()) {
        if(this._settings.isMirroredPrepend())
            var resolverOperation = Gridifier.ImagesResolver.OPERATIONS.INSERT_BEFORE;
        else
            var resolverOperation = Gridifier.ImagesResolver.OPERATIONS.PREPEND;

        this._imagesResolver.scheduleImagesResolve(
            this._collector.toDOMCollection(items),
            resolverOperation,
            {batchSize: batchSize, batchTimeout: batchTimeout, beforeItem: null}
        );
    }
    else {
        if(this._settings.isMirroredPrepend())
            this.insertBefore(items, null, batchSize, batchTimeout);
        else
            this.executePrepend(items, batchSize, batchTimeout);
    }

    return this;
}

Gridifier.prototype.executePrepend = function(items, batchSize, batchTimeout) {
    var execute = function() {
        this._operationsQueue.schedulePrependOperation(items, batchSize, batchTimeout);
    }

    var me = this;
    setTimeout(function() {
        execute.call(me);
    }, Gridifier.REFLOW_OPTIMIZATION_TIMEOUT);
}

Gridifier.prototype.append = function(items, batchSize, batchTimeout) {
    if(this._settings.shouldResolveImages()) {
        this._imagesResolver.scheduleImagesResolve(
            this._collector.toDOMCollection(items),
            Gridifier.ImagesResolver.OPERATIONS.APPEND,
            {batchSize: batchSize, batchTimeout: batchTimeout}
        );
    }
    else {
        this.executeAppend(items, batchSize, batchTimeout);
    }

    return this;
}

Gridifier.prototype.executeAppend = function(items, batchSize, batchTimeout) {
    var execute = function() {
        this._operationsQueue.scheduleAppendOperation(items, batchSize, batchTimeout);
    }

    var me = this;
    setTimeout(function() {
        execute.call(me);
    }, Gridifier.REFLOW_OPTIMIZATION_TIMEOUT);
}

Gridifier.prototype.silentAppend = function(items, batchSize, batchTimeout) {
    if(this._settings.shouldResolveImages()) {
        this._imagesResolver.scheduleImagesResolve(
            this._collector.toDOMCollection(items),
            Gridifier.ImagesResolver.OPERATIONS.SILENT_APPEND,
            {batchSize: batchSize, batchTimeout: batchTimeout}
        );
    }
    else {
        this.executeSilentAppend(items, batchSize, batchTimeout);
    }

    return this;
}

Gridifier.prototype.executeSilentAppend = function(items, batchSize, batchTimeout) {
    this._silentRenderer.scheduleForSilentRender(
        this._collector.toDOMCollection(items)
    );
    this.executeAppend(items, batchSize, batchTimeout);
}

Gridifier.prototype.silentRender = function(items, batchSize, batchTimeout) {
    this._silentRenderer.execute(items, batchSize, batchTimeout);
    return this;
}

Gridifier.prototype.getScheduledForSilentRenderItems = function(onlyInsideViewport) {
    return this._silentRenderer.getScheduledForSilentRenderItems(onlyInsideViewport);
}

Gridifier.prototype.insertBefore = function(items, beforeItem, batchSize, batchTimeout) {
    if(this._settings.shouldResolveImages()) {
        this._imagesResolver.scheduleImagesResolve(
            this._collector.toDOMCollection(items),
            Gridifier.ImagesResolver.OPERATIONS.INSERT_BEFORE,
            {batchSize: batchSize, batchTimeout: batchTimeout, beforeItem: beforeItem}
        );
    }
    else {
        this.executeInsertBefore(items, beforeItem, batchSize, batchTimeout);
    }

    return this;
}

Gridifier.prototype.executeInsertBefore = function(items, beforeItem, batchSize, batchTimeout) {
    var execute = function() {
        this._operationsQueue.scheduleInsertBeforeOperation(
            items, beforeItem, batchSize, batchTimeout
        );
    }

    var me = this;
    setTimeout(function() {
        execute.call(me);
    }, Gridifier.REFLOW_OPTIMIZATION_TIMEOUT);
}

Gridifier.prototype.insertAfter = function(items, afterItem, batchSize, batchTimeout) {
    if(this._settings.shouldResolveImages()) {
        this._imagesResolver.scheduleImagesResolve(
            this._collector.toDOMCollection(items),
            Gridifier.ImagesResolver.OPERATIONS.INSERT_AFTER,
            {batchSize: batchSize, batchTimeout: batchTimeout, afterItem: afterItem}
        );
    }
    else {
        this.executeInsertAfter(items, afterItem, batchSize, batchTimeout);
    }

    return this;
}

Gridifier.prototype.executeInsertAfter = function(items, afterItem, batchSize, batchTimeout) {
    var execute = function() {
        this._operationsQueue.scheduleInsertAfterOperation(
            items, afterItem, batchSize, batchTimeout
        );
    }

    var me = this;
    setTimeout(function() {
        execute.call(me);
    }, Gridifier.REFLOW_OPTIMIZATION_TIMEOUT);
}

Gridifier.prototype.triggerRotate = function(items, rotateTogglerType, batchSize, batchTimeout) {
    var me = this;

    this.setToggle(rotateTogglerType);
    var itemsToRotate = this._collector.toDOMCollection(items);

    if(typeof batchSize == "undefined") {
        this._renderer.rotateItems(itemsToRotate);
        return this;
    }

    this._operationsQueue.scheduleAsyncFnExecutionByBatches(
        itemsToRotate, batchSize, batchTimeout, function(itemBatch) { me._renderer.rotateItems(itemBatch); }
    );
    return this;
}

Gridifier.prototype.retransformAllSizes = function() {
    this._normalizer.updateItemAntialiasValues();
    this._transformOperation.executeRetransformAllSizes();

    return this;
}

Gridifier.prototype.toggleResponsiveClasses = function(maybeItem, className) {
    var items = this._responsiveClassesManager.toggleResponsiveClasses(maybeItem, className);
    this._normalizer.updateItemAntialiasValues();
    this._transformOperation.executeRetransformFromFirstSortedConnection(items);

    return this;
}

Gridifier.prototype.addResponsiveClasses = function(maybeItem, className) {
    var items = this._responsiveClassesManager.addResponsiveClasses(maybeItem, className);
    this._normalizer.updateItemAntialiasValues();
    this._transformOperation.executeRetransformFromFirstSortedConnection(items);

    return this;
}

Gridifier.prototype.removeResponsiveClasses = function(maybeItem, className) {
    var items = this._responsiveClassesManager.removeResponsiveClasses(maybeItem, className);
    this._normalizer.updateItemAntialiasValues();
    this._transformOperation.executeRetransformFromFirstSortedConnection(items);

    return this;
}

Gridifier.prototype.bindDragifierEvents = function() {
    this._dragifier.bindDragifierEvents();
    return this;
}

Gridifier.prototype.unbindDragifierEvents = function() {
    this._dragifier.unbindDragifierEvents();
    return this;
}

Gridifier.prototype.isDragifierEnabled = function() {
    return this._dragifier.isDragifierEnabled();
}

Gridifier.prototype.isItemConnected = function(item) {
    return this._collector.isItemConnected(item);
}

Gridifier.prototype.getConnectedItems = function() {
    var connections = this._connections.get();
    var items = [];

    for(var i = 0; i < connections.length; i++)
        items.push(connections[i].item);

    return items;
}

Gridifier.prototype.setToggle = Gridifier.prototype.toggleBy;
Gridifier.prototype.setSort = Gridifier.prototype.sortBy;
Gridifier.prototype.setFilter = Gridifier.prototype.filterBy;
Gridifier.prototype.collectNew = Gridifier.prototype.collectAllDisconnectedItems;
Gridifier.prototype.appendNew = function(bs, bt) { this.append(this.collectNew(), bs, bt); return this; };
Gridifier.prototype.prependNew = function(bs, bt) { this.prepend(this.collectNew(), bs, bt); return this; };
Gridifier.prototype.collectConnected = Gridifier.prototype.collectAllConnectedItems;
Gridifier.prototype.getForSilentRender = Gridifier.prototype.getScheduledForSilentRenderItems;
Gridifier.prototype.setAlign = Gridifier.prototype.setAlignmentType;
Gridifier.prototype.enableIntersections = Gridifier.prototype.setDefaultIntersectionStrategy;
Gridifier.prototype.disableIntersections = Gridifier.prototype.setNoIntersectionStrategy;
Gridifier.prototype.setToggleDuration = Gridifier.prototype.setToggleAnimationMsDuration;
Gridifier.prototype.setCoordsChangeDuration = Gridifier.prototype.setCoordsChangeAnimationMsDuration;
Gridifier.prototype.setItemWidthPtAntialias = Gridifier.prototype.setItemWidthPercentageAntialias;
Gridifier.prototype.setItemHeightPtAntialias = Gridifier.prototype.setItemHeightPercentageAntialias;
Gridifier.prototype.setWidthPxAntialias = Gridifier.prototype.setItemWidthPxAntialias;
Gridifier.prototype.setHeightPxAntialias = Gridifier.prototype.setItemHeightPxAntialias;
Gridifier.prototype.setWidthPtAntialias = Gridifier.prototype.setItemWidthPercentageAntialias;
Gridifier.prototype.setHeightPtAntialias = Gridifier.prototype.setItemHeightPercentageAntialias;
Gridifier.prototype.retransformGrid = Gridifier.prototype.retransformAllSizes;
Gridifier.prototype.setDragDecorator = Gridifier.prototype.setDraggableItemDecorator;
Gridifier.prototype.add = Gridifier.prototype.addToGrid;
Gridifier.prototype.enableDragifier = Gridifier.prototype.bindDragifierEvents;
Gridifier.prototype.disableDragifier = Gridifier.prototype.unbindDragifierEvents;

Gridifier.Api = {};
Gridifier.HorizontalGrid = {};
Gridifier.VerticalGrid = {};
Gridifier.Operations = {};
Gridifier.TransformerOperations = {};
Gridifier.SizesTransformer = {};

Gridifier.REFLOW_OPTIMIZATION_TIMEOUT = 0;

Gridifier.GRID_TYPES = {VERTICAL_GRID: "verticalGrid", HORIZONTAL_GRID: "horizontalGrid",
                        VERTICAL_GRID_SHORT: "vertical", HORIZONTAL_GRID_SHORT: "horizontal"};

Gridifier.PREPEND_TYPES = {
    MIRRORED_PREPEND: "mirroredPrepend",
    DEFAULT_PREPEND: "defaultPrepend",
    REVERSED_PREPEND: "reversedPrepend",
    MIRRORED_PREPEND_SHORT: "mirrored",
    DEFAULT_PREPEND_SHORT: "default",
    REVERSED_PREPEND_SHORT: "reversed"
};
Gridifier.APPEND_TYPES = {
    DEFAULT_APPEND: "defaultAppend",
    REVERSED_APPEND: "reversedAppend",
    DEFAULT_APPEND_SHORT: "default",
    REVERSED_APPEND_SHORT: "reversed"
};

Gridifier.INTERSECTION_STRATEGIES = {
    DEFAULT: "default",
    NO_INTERSECTIONS: "noIntersections",
    DEFAULT_SHORT: "yes",
    NO_INTERSECTIONS_SHORT: "no"
};
Gridifier.INTERSECTION_STRATEGY_ALIGNMENT_TYPES = {
    FOR_VERTICAL_GRID: {
        TOP: "top", CENTER: "center", BOTTOM: "bottom"
    },
    FOR_HORIZONTAL_GRID: {
        LEFT: "left", CENTER: "center", RIGHT: "right"
    }
};

Gridifier.SORT_DISPERSION_MODES = {
    DISABLED: "disabled",
    CUSTOM: "custom",
    CUSTOM_ALL_EMPTY_SPACE: "customAllEmptySpace",
    CUSTOM_ALL_EMPTY_SPACE_SHORT: "allGrid"
};

Gridifier.GRID_ITEM_MARKING_STRATEGIES = {BY_CLASS: "class", BY_DATA_ATTR: "data", BY_QUERY: "query"};
Gridifier.GRID_ITEM_MARKING_DEFAULTS = {
    CLASS: "gridifier-item",
    DATA_ATTR: "data-gridifier-item",
    QUERY: "div > div"
};

Gridifier.DRAGIFIER_MODES = {INTERSECTION: "intersection", DISCRETIZATION: "discretization"};

Gridifier.OPERATIONS = {PREPEND: 0, REVERSED_PREPEND: 1, APPEND: 2, REVERSED_APPEND: 3, MIRRORED_PREPEND: 4};
Gridifier.DEFAULT_TOGGLE_ANIMATION_MS_DURATION = 500;
Gridifier.DEFAULT_COORDS_CHANGE_ANIMATION_MS_DURATION = 300;
Gridifier.DEFAULT_TOGGLE_TRANSITION_TIMING = "ease";
Gridifier.DEFAULT_COORDS_CHANGE_TRANSITION_TIMING = "ease";

Gridifier.DEFAULT_ROTATE_PERSPECTIVE = "200px";
Gridifier.DEFAULT_ROTATE_BACKFACE = true;
Gridifier.DEFAULT_ROTATE_ANGLES = {
    FRONT_FRAME_INIT: 0, BACK_FRAME_INIT: -180,
    FRONT_FRAME_TARGET: 180, BACK_FRAME_TARGET: 0
};

Gridifier.GRID_TRANSFORM_TYPES = {EXPAND: "expand", FIT: "fit", DISABLED: "disabled"};
Gridifier.DEFAULT_GRID_TRANSFORM_TIMEOUT = 100;

Gridifier.RETRANSFORM_QUEUE_DEFAULT_BATCH_SIZE = 12;
Gridifier.RETRANSFORM_QUEUE_DEFAULT_BATCH_TIMEOUT = 25;