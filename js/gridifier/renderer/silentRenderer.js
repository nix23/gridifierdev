Gridifier.SilentRenderer = function(gridifier,
                                    collector,
                                    connections,
                                    operationsQueue,
                                    renderer,
                                    rendererConnections) {
    var me = this;

    this._gridifier = null;
    this._collector = null;
    this._connections = null;
    this._operationsQueue = null;
    this._renderer = null;
    this._rendererConnections = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._collector = collector;
        me._connections = connections;
        me._operationsQueue = operationsQueue;
        me._renderer = renderer;
        me._rendererConnections = rendererConnections;
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

Gridifier.SilentRenderer.prototype.unscheduleForSilentRender = function(items, connections) {
    for(var i = 0; i < items.length; i++) {
        items[i].removeAttribute(Gridifier.SilentRenderer.SILENT_RENDER_DATA_ATTR);
        this._rendererConnections.unmarkConnectionItemAsRendered(connections[i]);
    }
}

Gridifier.SilentRenderer.prototype.isScheduledForSilentRender = function(item) {
    return Dom.hasAttribute(item, Gridifier.SilentRenderer.SILENT_RENDER_DATA_ATTR);
}

Gridifier.SilentRenderer.prototype.execute = function(batchSize, batchTimeout) {
    var executeSilentRender = function(scheduledItems, scheduledConnections) {
        this.unscheduleForSilentRender(scheduledItems, scheduledConnections);
        this._renderer.showConnections(scheduledConnections);
    }

    var me = this;

    var scheduleSilentRendererExecution = function() {
        var scheduledItems = this._collector.collectByQuery(
            "[" + Gridifier.SilentRenderer.SILENT_RENDER_DATA_ATTR + "=" + Gridifier.SilentRenderer.SILENT_RENDER_DATA_ATTR_VALUE + "]"
        );
        var scheduledConnections = [];
        for (var i = 0; i < scheduledItems.length; i++)
            scheduledConnections.push(this._connections.findConnectionByItem(scheduledItems[i]));

        var connectionsSorter = this._connections.getConnectionsSorter();
        scheduledConnections = connectionsSorter.sortConnectionsPerReappend(scheduledConnections);
        scheduledItems = [];
        for (var i = 0; i < scheduledConnections.length; i++)
            scheduledItems.push(scheduledConnections[i].item);

        if (typeof batchSize == "undefined") {
            executeSilentRender.call(me, scheduledItems, scheduledConnections);
            return;
        }

        if (typeof batchTimeout == "undefined" || batchTimeout < Gridifier.REFLOW_OPTIMIZATION_TIMEOUT + 100)
            var batchTimeout = Gridifier.REFLOW_OPTIMIZATION_TIMEOUT + 100;

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

    setTimeout(function() { scheduleSilentRendererExecution.call(me); }, Gridifier.REFLOW_OPTIMIZATION_TIMEOUT + 100);
}