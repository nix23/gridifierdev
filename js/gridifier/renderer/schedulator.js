Gridifier.Renderer.Schedulator = function(gridifier, settings, connections, renderer, rendererConnections) {
    var me = this;

    this._gridifier = null;
    this._settings = null;
    this._connections = null;
    this._renderer = null;
    this._rendererConnections = null;
    this._silentRenderer = null;

    this._connectedItemMarker = null;

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
        me._connections = connections;
        me._renderer = renderer;
        me._rendererConnections = rendererConnections;

        me._connectedItemMarker = new Gridifier.ConnectedItemMarker();
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
    SHOW: 0, HIDE: 1, RENDER: 2, DELAYED_RENDER: 3
};

Gridifier.Renderer.Schedulator.prototype.setSilentRendererInstance = function(silentRenderer) {
    this._silentRenderer = silentRenderer;
}

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
    if(this._silentRenderer.isScheduledForSilentRender(connection.item))
        return;

    this._scheduledConnectionsToProcessData.push({
        connection: connection,
        processingType: Gridifier.Renderer.Schedulator.SCHEDULED_CONNECTIONS_PROCESSING_TYPES.SHOW,
        left: left,
        top: top
    });
    this._schedule();
}

Gridifier.Renderer.Schedulator.prototype.scheduleHide = function(connection, left, top) {
    this._scheduledConnectionsToProcessData.push({
        connection: connection,
        processingType: Gridifier.Renderer.Schedulator.SCHEDULED_CONNECTIONS_PROCESSING_TYPES.HIDE,
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

Gridifier.Renderer.Schedulator.prototype.scheduleDelayedRender = function(connection, left, top, delay) {
    this._scheduledConnectionsToProcessData.push({
        connection: connection,
        processingType: Gridifier.Renderer.Schedulator.SCHEDULED_CONNECTIONS_PROCESSING_TYPES.DELAYED_RENDER,
        left: left,
        top: top,
        delay: delay
    });
    this._schedule();
}

Gridifier.Renderer.Schedulator.prototype._schedule = function() {
    var me = this;

    this._processScheduledConnectionsTimeout = setTimeout(function() {
        me._processScheduledConnections.call(me);
    }, Gridifier.Renderer.Schedulator.PROCESS_SCHEDULED_CONNECTIONS_TIMEOUT);
}

Gridifier.Renderer.Schedulator.prototype._processScheduledConnections = function() {
    var me = this;
    var schedulator = Gridifier.Renderer.Schedulator;

    for(var i = 0; i < this._scheduledConnectionsToProcessData.length; i++) {
        var connectionToProcess = this._scheduledConnectionsToProcessData[i].connection;
        var processingType = this._scheduledConnectionsToProcessData[i].processingType;
        var left = this._scheduledConnectionsToProcessData[i].left;
        var top = this._scheduledConnectionsToProcessData[i].top;

        if(this._silentRenderer.isScheduledForSilentRender(connectionToProcess.item))
            continue;

        if(processingType == schedulator.SCHEDULED_CONNECTIONS_PROCESSING_TYPES.SHOW) {
            // Render could be called after disconnect(Through timeouts)
            if(!this._connectedItemMarker.isItemConnected(connectionToProcess.item))
                continue;

            Dom.css.set(connectionToProcess.item, {
                position: "absolute",
                left: left,
                top: top
            });
            
            var toggleFunction = this._settings.getToggle();
            var toggleTimeouter = this._settings.getToggleTimeouter();
            var eventEmitter = this._settings.getEventEmitter();
            var animationMsDuration = this._settings.getToggleAnimationMsDuration();
            var sizesResolverManager = this._settings.getSizesResolverManager();
            var coordsChanger = this._settings.getCoordsChanger();
            var collector = this._settings.getCollector();
            var coordsChangerApi = this._settings.getCoordsChangerApi();
            var toggleTransitionTiming = this._settings.getToggleTransitionTiming();

            var showItem = function(item) {
                toggleFunction.show(
                    connectionToProcess.item,
                    me._gridifier.getGrid(),
                    animationMsDuration,
                    toggleTimeouter,
                    eventEmitter,
                    sizesResolverManager,
                    coordsChanger,
                    collector,
                    left,
                    top,
                    coordsChangerApi,
                    null,
                    toggleTransitionTiming
                );
            };

            // Due to the bags, caused by setting multiple transform properties sequentially,
            // we should preinit item with all transform rules, which will be used in coords changers.
            // Scale always should be first(otherwise animation will break), translates should be also
            // setted up with SINGLE rule at start. Thus, they can be overriden later. Otherwise,
            // animation will break.
            coordsChanger(connectionToProcess.item, left, top, animationMsDuration, eventEmitter, true);

            eventEmitter.emitBeforeShowPerRetransformSortEvent();
            showItem(connectionToProcess.item);
        }
        else if(processingType == schedulator.SCHEDULED_CONNECTIONS_PROCESSING_TYPES.HIDE) {
            this._renderer.unmarkItemAsScheduledToHide(connectionToProcess.item);

            var toggleFunction = this._settings.getToggle();
            var toggleTimeouter = this._settings.getToggleTimeouter();
            var eventEmitter = this._settings.getEventEmitter();
            var animationMsDuration = this._settings.getToggleAnimationMsDuration();
            var sizesResolverManager = this._settings.getSizesResolverManager();
            var coordsChanger = this._settings.getCoordsChanger();
            var collector = this._settings.getCollector();
            var coordsChangerApi = this._settings.getCoordsChangerApi();
            var toggleTransitionTiming = this._settings.getToggleTransitionTiming();

            var hideItem = function(item) {
                toggleFunction.hide(
                    item,
                    me._gridifier.getGrid(),
                    animationMsDuration,
                    toggleTimeouter,
                    eventEmitter,
                    sizesResolverManager,
                    coordsChanger,
                    collector,
                    left,
                    top,
                    coordsChangerApi,
                    null,
                    toggleTransitionTiming
                );
            };

            hideItem(connectionToProcess.item);
        }
        else if(processingType == schedulator.SCHEDULED_CONNECTIONS_PROCESSING_TYPES.DELAYED_RENDER) {
            var delay = this._scheduledConnectionsToProcessData[i].delay;
            var coordsChanger = this._settings.getCoordsChanger();
            var eventEmitter = this._settings.getEventEmitter();

            if(Dom.hasAttribute(connectionToProcess.item, Gridifier.Api.Toggle.IS_TOGGLE_ANIMATION_WITH_COORDS_CHANGE_RUNNING)) {
                var animationMsDuration = this._settings.getToggleAnimationMsDuration();
                var coordsChangeTransitionTiming = this._settings.getToggleTransitionTiming();
            }
            else {
                var animationMsDuration = this._settings.getCoordsChangeAnimationMsDuration();
                var coordsChangeTransitionTiming = this._settings.getCoordsChangeTransitionTiming();
            }

            var me = this;
            (function(item, animationMsDuration, eventEmitter, transitionTiming, delay) {
                setTimeout(function() {
                    // Because of using this delayed timeout we should find item connection again.
                    // There could be a bunch of resizes since this delayedRender schedule, so this item connection can point to the
                    // old version of the connection.
                    var connectionToProcess = me._connections.findConnectionByItem(item, true);
                    if(connectionToProcess == null)
                        return;

                    coordsChanger(
                        item,
                        me._rendererConnections.getCssLeftPropertyValuePerConnection(connectionToProcess),
                        me._rendererConnections.getCssTopPropertyValuePerConnection(connectionToProcess),
                        animationMsDuration,
                        eventEmitter,
                        false,
                        transitionTiming
                    );
                }, delay);
            })(connectionToProcess.item, animationMsDuration, eventEmitter, coordsChangeTransitionTiming, delay);
        }
        else if(processingType == schedulator.SCHEDULED_CONNECTIONS_PROCESSING_TYPES.RENDER) {
            var coordsChanger = this._settings.getCoordsChanger();
            var eventEmitter = this._settings.getEventEmitter();

            if(Dom.hasAttribute(connectionToProcess.item, Gridifier.Api.Toggle.IS_TOGGLE_ANIMATION_WITH_COORDS_CHANGE_RUNNING)) {
                var animationMsDuration = this._settings.getToggleAnimationMsDuration();
                var coordsChangeTransitionTiming = this._settings.getToggleTransitionTiming();
            }
            else {
                var animationMsDuration = this._settings.getCoordsChangeAnimationMsDuration();
                var coordsChangeTransitionTiming = this._settings.getCoordsChangeTransitionTiming();
            }

            coordsChanger(
                connectionToProcess.item,
                left,
                top,
                animationMsDuration,
                eventEmitter,
                false,
                coordsChangeTransitionTiming
            );
        }
    }

    this._gridifier.scheduleGridSizesUpdate();

    this._scheduledConnectionsToProcessData = null;
    this._processScheduledConnectionsTimeout = null;
}