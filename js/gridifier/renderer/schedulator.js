Gridifier.Renderer.Schedulator = function(gridifier, settings, renderer) {
    var me = this;

    this._gridifier = null;
    this._settings = null;
    this._renderer = null;

    // Array[
    //     [0] => {connection: connection, processingType: processingType, left: left, top: top, 
    //             (targetWidth: tw, targetHeight: th)},
    //     [1] => {connection: connection, processingType: processingType, left: left, top: top
    //             (targetWidth: tw, targetHeight: th)},
    //     ...,
    //     n
    // ]
    this._scheduledConnectionsToProcessData = null;
    this._processScheduledConnectionsTimeout = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._settings = settings;
        me._renderer = renderer;
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

Gridifier.Renderer.Schedulator.PROCESS_SCHEDULED_CONNECTIONS_TIMEOUT = 20;
Gridifier.Renderer.Schedulator.SCHEDULED_CONNECTIONS_PROCESSING_TYPES = {
    SHOW: 0, RENDER: 1, RENDER_TRANSFORMED: 2, RENDER_DEPENDED: 3
};

Gridifier.Renderer.Schedulator.prototype.reinit = function() {
    if(this._scheduledConnectionsToProcessData == null) {
        this._scheduledConnectionsToProcessData = [];
    }
    else {
        clearTimeout(this._processScheduledConnectionsTimeout);
        this._processScheduledConnectionsTimeout = null;
    }
}

Gridifier.Renderer.Schedulator.prototype.scheduleShow = function(connection, left, top) {
    this._scheduledConnectionsToProcessData.push({
        connection: connection,
        processingType: Gridifier.Renderer.Schedulator.SCHEDULED_CONNECTIONS_PROCESSING_TYPES.SHOW,
        left: left,
        top: top
    });
    this._schedule();
}

Gridifier.Renderer.Schedulator.prototype.scheduleRender = function(connection, left, top) {
    this._scheduledConnectionsToProcessData.push({
        connection: connection,
        processingType: Gridifier.Renderer.Schedulator.SCHEDULED_CONNECTIONS_PROCESSING_TYPES.RENDER,
        left: left,
        top: top
    });
    this._schedule();
}

Gridifier.Renderer.Schedulator.prototype.scheduleRenderTransformed = function(connection, 
                                                                              left, 
                                                                              top,
                                                                              targetWidth,
                                                                              targetHeight) {
    this._scheduledConnectionsToProcessData.push({
        connection: connection,
        processingType: Gridifier.Renderer.Schedulator.SCHEDULED_CONNECTIONS_PROCESSING_TYPES.RENDER_TRANSFORMED,
        left: left,
        top: top,
        targetWidth: targetWidth,
        targetHeight: targetHeight
    });
    this._schedule();
}

Gridifier.Renderer.Schedulator.prototype.scheduleRenderDepended = function(connection, left, top) {
    this._scheduledConnectionsToProcessData.push({
        connection: connection,
        processingType: Gridifier.Renderer.Schedulator.SCHEDULED_CONNECTIONS_PROCESSING_TYPES.RENDER_DEPENDED,
        left: left,
        top: top
    });
    this._schedule();
}

Gridifier.Renderer.Schedulator.prototype._schedule = function() {
    var me = this;

    this._processScheduledConnectionsTimeout = setTimeout(function() {
        me._processScheduledConnections.call(me);
    }, Gridifier.Renderer.Schedulator.PROCESS_SCHEDULED_CONNECTIONS_TIMEOUT);
}

// @todo -> Solve problem with cache stop inside process scheduled connections
//setTimeout(function() { renderNextConnection(0); }, 0); // @notice -> Settimeouts here will slow down
// overall perfomance in legacy browsers(ie8, safari 5.1.7(Win)), because caching will stop before
// me._gridifier.getGridX2() will be called(because of setTimeout async), and Gridifier will recursively recalculate
// all DOM nodes up through DOM-Tree, until reaching root node.
Gridifier.Renderer.Schedulator.prototype._processScheduledConnections = function() {
    var schedulator = Gridifier.Renderer.Schedulator;

    for(var i = 0; i < this._scheduledConnectionsToProcessData.length; i++) {
        var connectionToProcess = this._scheduledConnectionsToProcessData[i].connection;
        var processingType = this._scheduledConnectionsToProcessData[i].processingType;
        var left = this._scheduledConnectionsToProcessData[i].left;
        var top = this._scheduledConnectionsToProcessData[i].top;

        if(processingType == schedulator.SCHEDULED_CONNECTIONS_PROCESSING_TYPES.SHOW) {
            // @todo -> maybe add here start/stop caching transaction??? Or it is useless?
            Dom.css.set(connectionToProcess.item, {
                position: "absolute",
                left: left,
                top: top
            });

            var toggleFunction = this._settings.getToggle();
            toggleFunction.show(
                connectionToProcess.item,
                this._gridifier.getGrid()
            );
        }
        else if(processingType == schedulator.SCHEDULED_CONNECTIONS_PROCESSING_TYPES.RENDER) {
            var rendererCoordsChangerFunction = this._settings.getCoordsChanger();
            rendererCoordsChangerFunction(connectionToProcess.item, left, top);
        }
        else if(processingType == schedulator.SCHEDULED_CONNECTIONS_PROCESSING_TYPES.RENDER_TRANSFORMED) {
            var targetWidth = this._scheduledConnectionsToProcessData[i].targetWidth;
            var targetHeight = this._scheduledConnectionsToProcessData[i].targetHeight;

            var rendererSizesChangerFunction = this._settings.getSizesChanger();
            rendererSizesChangerFunction(connectionToProcess.item, targetWidth, targetHeight);

            var rendererCoordsChangerFunction = this._settings.getCoordsChanger();
            rendererCoordsChangerFunction(connectionToProcess.item, left, top);
        }
        // @todo -> Merge with second cond?
        else if(processingType == schedulator.SCHEDULED_CONNECTIONS_PROCESSING_TYPES.RENDER_DEPENDED) {
            var rendererCoordsChangerFunction = this._settings.getCoordsChanger();
            rendererCoordsChangerFunction(connectionToProcess.item, left, top);
        }
    }

    this._gridifier.scheduleGridSizesUpdate();

    this._scheduledConnectionsToProcessData = null;
    this._processScheduledConnectionsTimeout = null;
}