Gridifier.SilentRenderer = function(gridifier,
                                    collector,
                                    connections,
                                    operationsQueue,
                                    renderer,
                                    rendererConnections,
                                    sizesResolverManager) {
    var me = this;

    this._gridifier = null;
    this._collector = null;
    this._connections = null;
    this._operationsQueue = null;
    this._renderer = null;
    this._rendererConnections = null;
    this._sizesResolverManager = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._collector = collector;
        me._connections = connections;
        me._operationsQueue = operationsQueue;
        me._renderer = renderer;
        me._rendererConnections = rendererConnections;
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

Gridifier.SilentRenderer.SILENT_RENDER_DATA_ATTR = "data-gridifier-scheduled-for-silent-render";
Gridifier.SilentRenderer.SILENT_RENDER_DATA_ATTR_VALUE = "silentRender";

Gridifier.SilentRenderer.prototype.scheduleForSilentRender = function(items) {
    for(var i = 0; i < items.length; i++) {
        items[i].setAttribute(
            Gridifier.SilentRenderer.SILENT_RENDER_DATA_ATTR,
            Gridifier.SilentRenderer.SILENT_RENDER_DATA_ATTR_VALUE
        );
    }
}

// This is required to avoid duplicate triggering silent render per same item.
// (Causes bags in rotates, etc...)
Gridifier.SilentRenderer.prototype._preUnscheduleForSilentRender = function(items) {
    for(var i = 0; i < items.length; i++) {
        items[i].removeAttribute(Gridifier.SilentRenderer.SILENT_RENDER_DATA_ATTR);
    }
}

Gridifier.SilentRenderer.prototype.unscheduleForSilentRender = function(items, connections) {
    for(var i = 0; i < items.length; i++) {
        items[i].removeAttribute(Gridifier.SilentRenderer.SILENT_RENDER_DATA_ATTR);
        this._rendererConnections.unmarkConnectionItemAsRendered(connections[i]);
    }
}

Gridifier.SilentRenderer.prototype.isScheduledForSilentRender = function(item) {
    return Dom.hasAttribute(item, Gridifier.SilentRenderer.SILENT_RENDER_DATA_ATTR);
}

Gridifier.SilentRenderer.prototype.getScheduledForSilentRenderItems = function(onlyInsideViewport) {
    var filterItemsOnlyInsideViewport = onlyInsideViewport || false;

    var scheduledItems = this._collector.collectByQuery(
        "[" + Gridifier.SilentRenderer.SILENT_RENDER_DATA_ATTR + "=" + Gridifier.SilentRenderer.SILENT_RENDER_DATA_ATTR_VALUE + "]"
    );

    if(!filterItemsOnlyInsideViewport)
        return scheduledItems;

    var gridOffsetLeft = this._sizesResolverManager.offsetLeft(this._gridifier.getGrid());
    var gridOffsetTop = this._sizesResolverManager.offsetTop(this._gridifier.getGrid());
    var viewportDocumentCoords = this._sizesResolverManager.viewportDocumentCoords();

    var itemsInsideViewport = [];
    for(var i = 0; i < scheduledItems.length; i++) {
        var scheduledItemConnection = this._connections.findConnectionByItem(scheduledItems[i], true);
        if(scheduledItemConnection == null)
            continue;

        var isItemOutsideViewport = false;
        var itemX1 = gridOffsetLeft + scheduledItemConnection.x1;
        var itemX2 = gridOffsetLeft + scheduledItemConnection.x2;
        var itemY1 = gridOffsetTop + scheduledItemConnection.y1;
        var itemY2 = gridOffsetTop + scheduledItemConnection.y2;

        var isAbove = (itemY1 < viewportDocumentCoords.y1 && itemY2 < viewportDocumentCoords.y1);
        var isBelow = (itemY1 > viewportDocumentCoords.y2 && itemY2 > viewportDocumentCoords.y2);
        var isBefore = (itemX1 < viewportDocumentCoords.x1 && itemX2 < viewportDocumentCoords.x1);
        var isBehind = (itemX1 > viewportDocumentCoords.x2 && itemX2 > viewportDocumentCoords.x2);

        if(isAbove || isBelow || isBefore || isBehind)
            isItemOutsideViewport = true;

        if(!isItemOutsideViewport)
            itemsInsideViewport.push(scheduledItems[i]);
    }

    return itemsInsideViewport;
}

Gridifier.SilentRenderer.prototype.execute = function(items, batchSize, batchTimeout) {
    var executeSilentRender = function(scheduledItems, scheduledConnections) {
        this.unscheduleForSilentRender(scheduledItems, scheduledConnections);
        this._renderer.showConnections(scheduledConnections);
    }

    var me = this;
    if(typeof items != "undefined" && items != null && items) {
        items = this._collector.toDOMCollection(items);
        var scheduledItems = [];

        for(var i = 0; i < items.length; i++) {
            if(this.isScheduledForSilentRender(items[i]))
                scheduledItems.push(items[i]);
        }

        items = scheduledItems;
        this._preUnscheduleForSilentRender(items);
    }

    var scheduleSilentRendererExecution = function() {
        if(typeof items == "undefined" || items == null || !items) {
            var scheduledItems = this.getScheduledForSilentRenderItems();
        }
        else {
            var scheduledItems = items;
        }

        if(scheduledItems.length == 0)
            return;

        this._preUnscheduleForSilentRender(scheduledItems);
        var scheduledConnections = [];
        for (var i = 0; i < scheduledItems.length; i++) {
            var scheduledItemConnection = this._connections.findConnectionByItem(scheduledItems[i], true);
            if(scheduledItemConnection != null)
                scheduledConnections.push(scheduledItemConnection);
        }

        var connectionsSorter = this._connections.getConnectionsSorter();
        scheduledConnections = connectionsSorter.sortConnectionsPerReappend(scheduledConnections);
        scheduledItems = [];
        for (var i = 0; i < scheduledConnections.length; i++)
            scheduledItems.push(scheduledConnections[i].item);

        if (typeof batchSize == "undefined") {
            executeSilentRender.call(me, scheduledItems, scheduledConnections);
            return;
        }

        if (typeof batchTimeout == "undefined")
            var batchTimeout = 100;

        var itemBatches = this._operationsQueue.splitItemsToBatches(scheduledItems, batchSize);
        var connectionBatches = this._operationsQueue.splitItemsToBatches(scheduledConnections, batchSize);
        for (var i = 0; i < itemBatches.length; i++) {
            (function (itemBatch, i, connectionBatch) {
                setTimeout(function () {
                    executeSilentRender.call(me, itemBatch, connectionBatch);
                }, batchTimeout * i);
            })(itemBatches[i], i, connectionBatches[i]);
        }
    }

    // If 100ms is not enough to silently append all required items, user should call silentRender one more time.
    setTimeout(function() { scheduleSilentRendererExecution.call(me); }, Gridifier.REFLOW_OPTIMIZATION_TIMEOUT + 100);
}