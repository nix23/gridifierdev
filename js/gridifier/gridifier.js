Gridifier = function(grid, settings) { 
    var me = this;

    this._grid = null;
    this._gridSizesUpdater = null;
    this._settings = null;
    this._collector = null;
    this._guid = null;
    this._eventEmitter = null;
    this._operation = null;

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
        me._grid = new Gridifier.Grid(grid);
        me._eventEmitter = new Gridifier.EventEmitter(me);
        me._settings = new Gridifier.Settings(settings, me._eventEmitter);
        me._collector = new Gridifier.Collector(me._settings,  me.getGrid());
        me._guid = new Gridifier.GUID();
        me._normalizer = new Gridifier.Normalizer();
        me._operation = new Gridifier.Operation();

        me._grid.setCollectorInstance(me._collector);

        if(me._settings.isVerticalGrid()) {
            me._connections = new Gridifier.VerticalGrid.Connections(
                me, me._guid, me._settings
            );
            me._connectionsSorter = new Gridifier.VerticalGrid.ConnectionsSorter(
                me._connections, me._settings, me._guid
            );
        }
        else if(me._settings.isHorizontalGrid()) {
            me._connections = new Gridifier.HorizontalGrid.Connections(
                me, me._guid, me._settings
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
                me, me._settings, me._connectors, me._connections, me._guid, me._renderer, me._normalizer, me._operation
            );
            me._reversedPrepender = new Gridifier.VerticalGrid.ReversedPrepender(
                me, me._settings, me._connectors, me._connections, me._guid, me._renderer, me._normalizer, me._operation
            );
            me._appender = new Gridifier.VerticalGrid.Appender(
                me, me._settings, me._connectors, me._connections, me._guid, me._renderer, me._normalizer, me._operation
            );
            me._reversedAppender = new Gridifier.VerticalGrid.ReversedAppender(
                me, me._settings, me._connectors, me._connections, me._guid, me._renderer, me._normalizer, me._operation
            );
        }
        else if(me._settings.isHorizontalGrid()) {
            me._prepender = new Gridifier.HorizontalGrid.Prepender(
                me, me._settings, me._connectors, me._connections, me._guid, me._renderer, me._normalizer, me._operation
            );
            me._reversedPrepender = new Gridifier.HorizontalGrid.ReversedPrepender(
                me, me._settings, me._connectors, me._connections, me._guid, me._renderer, me._normalizer, me._operation
            );
            me._appender = new Gridifier.HorizontalGrid.Appender(
                me, me._settings, me._connectors, me._connections, me._guid, me._renderer, me._normalizer, me._operation
            );
            me._reversedAppender = new Gridifier.HorizontalGrid.ReversedAppender(
                me, me._settings, me._connectors, me._connections, me._guid, me._renderer, me._normalizer, me._operation
            );
        }

        me._sizesTransformer = new Gridifier.SizesTransformer(
            me,
            me._settings,
            me._connectors,
            me._connections,
            me._connectionsSorter,
            me._guid,
            me._appender,
            me._reversedAppender,
            me._normalizer,
            me._operation
        );
        me._connections.setSizesTransformerInstance(me._sizesTransformer);

        me._toggleOperation = new Gridifier.TransformerOperations.Toggle(
            me._collector, me._connections, me._guid, me._sizesTransformer
        );
        me._transformOperation = new Gridifier.TransformerOperations.Transform(
            me._collector, me._connections, me._guid, me._sizesTransformer
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
            me._sizesTransformer
        );

        // @todo -> Remove from local var
        var dragifier = new Gridifier.Dragifier(
            me, 
            me._appender,
            me._reversedAppender,
            me._connections, 
            me._connectors, 
            me._guid, 
            me._settings
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
    SizesResolverManager.startCachingTransaction();
    this.retransformAllSizes();
    SizesResolverManager.stopCachingTransaction();
}

// Write tests soon per everything :}
// Method names -> gridify, watchify?
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
    // @todo -> Drop from connections unfiltered items
    this._settings.setFilter(filterFunctionName);
    return this;
}

Gridifier.prototype.collect = function() {
    ;
}

Gridifier.prototype.prepend = function(items, batchSize, batchTimeout) {
    if(this._settings.isMirroredPrepend()) {
        this.insertBefore(items, batchSize, batchTimeout);
        return this;
    }

    this._operationsQueue.schedulePrependOperation(items, batchSize, batchTimeout);
    return this;
}

Gridifier.prototype.append = function(items, batchSize, batchTimeout) {
    this._operationsQueue.scheduleAppendOperation(items, batchSize, batchTimeout);
    return this;
}

Gridifier.prototype.insertBefore = function(items, beforeItem, batchSize, batchTimeout) {
    this._operationsQueue.scheduleInsertBeforeOperation(
        items, beforeItem, batchSize, batchTimeout
    );
    return this;
}

Gridifier.prototype.retransformAllSizes = function() {
    this._transformOperation.executeRetransformAllSizes();
}

Gridifier.prototype.toggleSizes = function(maybeItem, newWidth, newHeight) {
    this._toggleOperation.execute(maybeItem, newWidth, newHeight);
}

Gridifier.prototype.transformSizes = function(maybeItem, newWidth, newHeight) {
    this._transformOperation.execute(maybeItem, newWidth, newHeight);
}

// @todo -> Add to items numbers besides GUIDS, and rebuild them on item deletes(Also use in sorting per drag?)

Gridifier.Api = {};
Gridifier.HorizontalGrid = {};
Gridifier.VerticalGrid = {};
Gridifier.Operations = {};
Gridifier.TransformerOperations = {};

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

Gridifier.GRID_ITEM_MARKING_STRATEGIES = {BY_CLASS: "class", BY_DATA_ATTR: "data"};
Gridifier.GRID_ITEM_MARKING_DEFAULTS = {CLASS: "gridifier-item", DATA_ATTR: "data-gridifier-item"};

Gridifier.OPERATIONS = {PREPEND: 0, REVERSED_PREPEND: 1, APPEND: 2, REVERSED_APPEND: 3, MIRRORED_PREPEND: 4};