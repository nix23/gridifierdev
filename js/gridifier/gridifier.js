Gridifier = function(grid, settings) {
    var me = this;

    this._grid = null;
    this._settings = null;
    this._collector = null;
    this._guid = null;

    this._connectors = null;
    this._connections = null;
    this._renderer = null;
    this._sizesTransformer = null;
    this._normalizer = null;

    this._mirroredPrepender = null;
    this._prepender = null;
    this._reversedPrepender = null;

    this._appender = null;
    this._reversedAppender = null;

    this._lastOperation = null;

    this._css = {
    };

    this._construct = function() {
        me._extractGrid(grid);
        me._adjustGridCss();

        me._settings = new Gridifier.Settings(settings);
        me._collector = new Gridifier.Collector(me._settings,  me._grid);
        me._guid = new Gridifier.GUID();
        me._normalizer = new Gridifier.Normalizer();

        if(me._settings.isVerticalGrid()) {
            me._connections = new Gridifier.VerticalGrid.Connections(me._guid, me._settings);
        }
        else if(me._settings.isHorizontalGrid()) {
            me._connections = new Gridifier.HorizontalGrid.Connections(me._guid, me._settings);
        }

        me._connectors = new Gridifier.Connectors(me._guid, me._connections);
        me._renderer = new Gridifier.Renderer(me, me._connections, me._settings, me._normalizer);

        if(me._settings.isVerticalGrid()) {
            me._mirroredPrepender = new Gridifier.VerticalGrid.MirroredPrepender(
                // @todo, pass params
            );
            me._prepender = new Gridifier.VerticalGrid.Prepender(
                me, me._settings, me._connectors, me._connections, me._guid, me._renderer, me._normalizer
            );
            me._reversedPrepender = new Gridifier.VerticalGrid.ReversedPrepender(
                // @todo, pass params
            );
            me._appender = new Gridifier.VerticalGrid.Appender(
                me, me._settings, me._connectors, me._connections, me._guid, me._renderer, me._normalizer
            );
            me._reversedAppender = new Gridifier.VerticalGrid.ReversedAppender(
                // @todo, pass params
            );
        }
        else if(me._settings.isHorizontalGrid()) {
            me._mirroredPrepender = new Gridifier.HorizontalGrid.MirroredPrepender(
                // @todo, pass params
            );
            me._prepender = new Gridifier.HorizontalGrid.Prepender(
                // @todo, pass params
            );
            me._reversedPrepender = new Gridifier.HorizontalGrid.ReversedPrepender(
                // @todo, pass params
            );
            me._appender = new Gridifier.HorizontalGrid.Appender(
                // @todo, pass params
            );
            me._reversedAppender = new Gridifier.HorizontalGrid.ReversedAppender(
                // @todo, pass params
            );
        }

        me._sizesTransformer = new Gridifier.SizesTransformer(
            me,
            me._settings,
            me._connectors,
            me._connections,
            me._guid,
            me._appender,
            me._reversedAppender,
            me._normalizer
        );

        // @tmp, replace this :)
        // @todo -> Log this action???
        var processResizeEventTimeout = null;
        var processResizeEvent = 100;
        $(window).resize(function() {
            var $firstItem = null;
            var $gridItems = $(".grid .gridItem");
            if($gridItems.length == 0)
                return;
            
            $.each($gridItems, function() {
                var currItemGUID = parseInt($(this).attr("data-gridifier-item-id"), 10);

                if($firstItem == null)
                    $firstItem = $(this);
                else {
                    var firstItemGUID = parseInt($firstItem.attr("data-gridifier-item-id"), 10);
                    if(currItemGUID < firstItemGUID)
                        $firstItem = $(this);
                }
            });
            
            if(processResizeEventTimeout != null) {
                clearTimeout(processResizeEventTimeout);
                processResizeEventTimeout = null;
            }
            
            processResizeEventTimeout = setTimeout(function() {
                me.transformSizes($firstItem);
            }, processResizeEvent);
        });

        // @todo -> run first iteration?(Process items that were at start)
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

Gridifier.prototype._extractGrid = function(grid) {
    if(Dom.isJqueryObject(grid))
        this._grid = grid.get(0);
    else if(Dom.isNativeDOMObject(grid))
        this._grid = grid;
    else
        new Gridifier.Error(Gridifier.Error.ERROR_TYPES.EXTRACT_GRID);
}

Gridifier.prototype._adjustGridCss = function() {
    Dom.css.set(this._grid, {"position": "relative"});
}

// Setting -> gridifier item marker(Function???)

Gridifier.prototype.addToGrid = function(items) {
    var items = this._collector.toDOMCollection(items);
    for(var i = 0; i < items.length; i++) {
        this._grid.appendChild(items[i]);
    }
   this._collector.attachToGrid(items);

    return this;
}

Gridifier.prototype.getGridX2 = function() {
    return SizesResolverManager.outerWidth(this._grid) - 1;
}

Gridifier.prototype.getGridY2 = function() {
    return SizesResolverManager.outerHeight(this._grid) - 1;
}

Gridifier.prototype.getGrid = function() {
    return this._grid;
}

Gridifier.prototype.markAsGridItem = function(items) {
    var items = this._collector.toDOMCollection(items);
    this._collector.attachToGrid(items);

    return this;
}

// @todo After SizesTransforms maybe should decrease grid height,
// if elements become smaller?
Gridifier.prototype.updateGridSizes = function() {
    var connections = this._connections.get();
    if(connections.length == 0)
        return;

    if(this._settings.isVerticalGrid()) {
        var gridHeight = connections[0].y2;
        for(var i = 1; i < connections.length; i++) {
            if(connections[i].y2 > gridHeight)
                gridHeight = connections[i].y2;
        }

        if(this.getGridY2() < gridHeight)
            Dom.css.set(this._grid, {"height": gridHeight + "px"});
        // @todo -> Fire event here
    }
    else if(this._settings.isHorizontalGrid()) {
        var gridWidth = connections[0].x2;
        for(var i = 1; i < connections.length; i++) {
            if(connections[i].x2 > gridWidth)
                gridWidth = connections[i].x2;
        }

        if(this.getGridX2() < gridWidth)
            Dom.css.set(this._grid, {"width": gridWidth + "px"});
        // @todo -> Fire event here
    }
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

// @todo extend all classes from base class? (Appender, prepender, etc...)

Gridifier.prototype.collect = function() {

}

Gridifier.prototype.isInitialOperation = function(currentOperation) {
    if(this._lastOperation == null) {
        this._lastOperation = currentOperation;
        return true;
    }

    return false;
}

Gridifier.prototype.isCurrentOperationSameAsPrevious = function(currentOperation) {
    if(this._lastOperation != currentOperation) {
        this._lastOperation = currentOperation;
        return false;
    }

    return true;
}

Gridifier.prototype.setLastOperation = function(lastOperation) {
    this._lastOperation = lastOperation;
}

Gridifier.prototype.findConnectionByItem = function(item) {
    var connections = this._connections.get();
    if(connections.length == 0) 
        new Gridifier.Error(Gridifier.Error.ERROR_TYPES.CONNECTIONS.NO_CONNECTIONS);
    
    var itemGUID = this._guid.getItemGUID(item);
    var connectionItem = null;
    for(var i = 0; i < connections.length; i++) {
        if(itemGUID == this._guid.getItemGUID(connections[i].item))
            connectionItem = connections[i];
    }

    if(connectionItem == null) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.CONNECTIONS.CONNECTION_BY_ITEM_NOT_FOUND,
            {item: item, connections: connections}
        );
    }

    return connectionItem;
}

Gridifier.prototype._applyPrepend = function(item) {
    if(this._settings.isMirroredPrepend())
        this._mirroredPrepender.mirroredPrepend(item);
    else if(this._settings.isDefaultPrepend()) {
        Logger.startLoggingOperation(       // @system-log-start
            Logger.OPERATION_TYPES.PREPEND,
            "Item GUID: " + this._guid.getItemGUID(item)
        );                                  // @system-log-end
        this._prepender.prepend(item);
        Logger.stopLoggingOperation(); // @system-log
    }
    else if(this._settings.isReversedPrepend())
        this._reversedPrepender.reversedPrepend(item);
}

// @todo -> append, prepend, delete, insert
Gridifier.prototype.prepend = function(items) {
    var items = this._collector.toDOMCollection(items);
    SizesResolverManager.startCachingTransaction();

    this._collector.ensureAllItemsAreAttachedToGrid(items);
    this._collector.ensureAllItemsCanBeAttachedToGrid(items);

    items = this._collector.filterCollection(items);
    items = this._collector.sortCollection(items);

    for(var i = 0; i < items.length; i++) {
        this._guid.markNextPrependedItem(items[i]);
        this._applyPrepend(items[i]);
        // @todo after each operation update grid width/height
        $(this).trigger("gridifier.gridSizesChange");
    }

    this.updateGridSizes();
    SizesResolverManager.stopCachingTransaction();

    return this;
}

// @todo -> Render connectors and debug after each step
Gridifier.prototype._applyAppend = function(item) {
    if(this._settings.isDefaultAppend()) {
        Logger.startLoggingOperation(                   // @system-log-start
            Logger.OPERATION_TYPES.APPEND,
            "Item GUID: " + this._guid.getItemGUID(item)
        );                                              // @system-log-end
        this._appender.append(item);
        Logger.stopLoggingOperation();// @system-log
    }
    else if(this._settings.isReversedAppend()) {
        this._reversedAppender.reversedAppend(item);
    }
}

Gridifier.prototype.append = function(items) { 
    var items = this._collector.toDOMCollection(items);
    SizesResolverManager.startCachingTransaction();

    this._collector.ensureAllItemsAreAttachedToGrid(items);
    this._collector.ensureAllItemsCanBeAttachedToGrid(items);

    items = this._collector.filterCollection(items);
    items = this._collector.sortCollection(items);
    
    for(var i = 0; i < items.length; i++) {
        this._guid.markNextAppendedItem(items[i]);
        this._applyAppend(items[i]);
        // @todo after each operation update grid width/height(Also when width height is decreasing)
        // @todo also update demo layout builder heading height label
        $(this).trigger("gridifier.gridSizesChange");
    }
    
    SizesResolverManager.stopCachingTransaction();
    this.updateGridSizes();

    return this;
}

Gridifier.prototype.toggleSizes = function(item, newWidth, newHeight) {
    var items = this._collector.toDOMCollection(item);
    SizesResolverManager.startCachingTransaction();

    this._collector.ensureAllItemsAreAttachedToGrid(items);
    this._collector.ensureAllItemsCanBeAttachedToGrid(items);

    var item = items[0];
    var connection = this.findConnectionByItem(item);

    if(this._sizesTransformer.areConnectionSizesToggled(connection)) {
        var targetSizes = this._sizesTransformer.getConnectionSizesPerUntoggle(connection);
        this._sizesTransformer.unmarkConnectionPerToggle(connection);
    }
    else {
        this._sizesTransformer.markConnectionPerToggle(connection);
        var targetSizes = this._sizesTransformer.initConnectionTransform(connection, newWidth, newHeight);
    }

    Logger.startLoggingOperation(   // @system-log-start
        Logger.OPERATION_TYPES.TOGGLE_SIZES,
        "Item GUID: " + this._guid.getItemGUID(item) +
        " target width: " + targetSizes.targetWidth + " target height: " + targetSizes.targetHeight
    );                              // @system-log-end
    this._sizesTransformer.transformConnectionSizes(
        connection, targetSizes.targetWidth, targetSizes.targetHeight
    );
    Logger.stopLoggingOperation(); // @system-log

    this._renderer.renderTransformedGrid();
    SizesResolverManager.stopCachingTransaction();
    // @todo -> Should update here sizes too? -> Happens in renderTransformedGrid
}

Gridifier.prototype.transformSizes = function(item, newWidth, newHeight) {
    var items = this._collector.toDOMCollection(item);
    SizesResolverManager.startCachingTransaction();

    this._collector.ensureAllItemsAreAttachedToGrid(items);
    this._collector.ensureAllItemsCanBeAttachedToGrid(items);

    var item = items[0];
    var connection = this.findConnectionByItem(item);

    var targetSizes = this._sizesTransformer.initConnectionTransform(connection, newWidth, newHeight);
    Logger.startLoggingOperation( // @system-log-start
        Logger.OPERATION_TYPES.TRANSFORM_SIZES,
        "Item GUID: " + this._guid.getItemGUID(item) + 
        " new width: " + newWidth + " new height: " + newHeight +
        " target width: " + targetSizes.targetWidth + " target height: " + targetSizes.targetHeight
    );                            // @system-log-end
    this._sizesTransformer.transformConnectionSizes(
        connection, targetSizes.targetWidth, targetSizes.targetHeight
    );
    Logger.stopLoggingOperation(); // @system-log

    this._renderer.renderTransformedGrid();
    SizesResolverManager.stopCachingTransaction();
    // @todo -> Should update here sizes too? -> Happens in renderTransformedGrid
}

// @todo -> transformBatchSizes = f([{i,w,h},{i,w,h},...]) First process all one after one,
// than renderTransformedLayout

// @todo -> Add to items numbers besides GUIDS, and rebuild them on item deletes
// @todo -> Add methods appendAfter, prependBefore or insertBefore, insertAfter(item)

Gridifier.HorizontalGrid = {};
Gridifier.VerticalGrid = {};

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