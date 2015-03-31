Gridifier.Renderer.Schedulator = function(gridifier, settings, connections, renderer, rendererConnections) {
    var me = this;

    this._gridifier = null;
    this._settings = null;
    this._connections = null;
    this._renderer = null;
    this._rendererConnections = null;
    this._silentRenderer = null;

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
    SHOW: 0, HIDE: 1, RENDER: 2, RENDER_TRANSFORMED: 3, RENDER_DEPENDED: 4, DELAYED_RENDER: 5
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
            Dom.css.set(connectionToProcess.item, {
                position: "absolute",
                left: left,
                top: top
            });

            if(this._gridifier.hasItemBindedClone(connectionToProcess.item)) {
               var itemClone = this._gridifier.getItemClone(connectionToProcess.item);

               Dom.css.set(itemClone, {
                  position: "absolute",
                  left: left,
                  top: top
               });
            }
            
            var toggleFunction = this._settings.getToggle();
            var toggleTimeouter = this._settings.getToggleTimeouter();
            var eventEmitter = this._settings.getEventEmitter();
            var animationMsDuration = this._settings.getToggleAnimationMsDuration();
            var sizesResolverManager = this._settings.getSizesResolverManager();
            var coordsChanger = this._settings.getCoordsChanger();
            var collector = this._settings.getCollector();
            var coordsChangerApi = this._settings.getCoordsChangerApi();
            var itemClonesManager = this._gridifier.getItemClonesManager();
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
                    itemClonesManager,
                    toggleTransitionTiming
                );
            };

            // Due to the bags, caused by setting multiple transform properties sequentially,
            // we should preinit item with all transform rules, which will be used in coords changers.
            // Scale always should be first(otherwise animation will break), translates should be also
            // setted up with SINGLE rule at start. Thus, they can be overriden later. Otherwise,
            // animation will break.
            if(this._gridifier.hasItemBindedClone(connectionToProcess.item)) {
                var itemClone = this._gridifier.getItemClone(connectionToProcess.item);
                coordsChanger(itemClone, left, top, animationMsDuration, eventEmitter, false, false, false, true);
            }
            else {
                coordsChanger(connectionToProcess.item, left, top, animationMsDuration, eventEmitter, false, false, false, true);
            }

            showItem(connectionToProcess.item);
        }
        else if(processingType == schedulator.SCHEDULED_CONNECTIONS_PROCESSING_TYPES.HIDE) {
            var toggleFunction = this._settings.getToggle();
            var toggleTimeouter = this._settings.getToggleTimeouter();
            var eventEmitter = this._settings.getEventEmitter();
            var animationMsDuration = this._settings.getToggleAnimationMsDuration();
            var sizesResolverManager = this._settings.getSizesResolverManager();
            var coordsChanger = this._settings.getCoordsChanger();
            var collector = this._settings.getCollector();
            var coordsChangerApi = this._settings.getCoordsChangerApi();
            var itemClonesManager = this._gridifier.getItemClonesManager();
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
                    itemClonesManager,
                    toggleTransitionTiming
                );
            };

            hideItem(connectionToProcess.item);
        }
        else if(processingType == schedulator.SCHEDULED_CONNECTIONS_PROCESSING_TYPES.DELAYED_RENDER) {
            var delay = this._scheduledConnectionsToProcessData[i].delay;
            var coordsChanger = this._settings.getCoordsChanger();
            var animationMsDuration = this._settings.getCoordsChangeAnimationMsDuration();
            var eventEmitter = this._settings.getEventEmitter();
            var coordsChangeTransitionTiming = this._settings.getCoordsChangeTransitionTiming();

            var me = this;
            (function(item, animationMsDuration, eventEmitter, transitionTiming, delay) {
                setTimeout(function() {
                    // Because of using this delayed timeout we should find item connection again.
                    // There could be a bunch of resizes since this delayedRender schedule, so this item connection can point to the
                    // old version of the connection.
                    var connectionToProcess = me._connections.findConnectionByItem(item);

                    coordsChanger(
                        item,
                        me._rendererConnections.getCssLeftPropertyValuePerConnection(connectionToProcess),
                        me._rendererConnections.getCssTopPropertyValuePerConnection(connectionToProcess),
                        animationMsDuration,
                        eventEmitter,
                        false,
                        false,
                        false,
                        false,
                        transitionTiming
                    );
                }, delay);
            })(connectionToProcess.item, animationMsDuration, eventEmitter, coordsChangeTransitionTiming, delay);
        }
        else if(processingType == schedulator.SCHEDULED_CONNECTIONS_PROCESSING_TYPES.RENDER ||
                processingType == schedulator.SCHEDULED_CONNECTIONS_PROCESSING_TYPES.RENDER_DEPENDED) {
            var coordsChanger = this._settings.getCoordsChanger();
            var animationMsDuration = this._settings.getCoordsChangeAnimationMsDuration();
            var eventEmitter = this._settings.getEventEmitter();
            var coordsChangeTransitionTiming = this._settings.getCoordsChangeTransitionTiming();

            coordsChanger(
                connectionToProcess.item,
                left,
                top,
                animationMsDuration,
                eventEmitter,
                false,
                false,
                false,
                false,
                coordsChangeTransitionTiming
            );
        }
        else if(processingType == schedulator.SCHEDULED_CONNECTIONS_PROCESSING_TYPES.RENDER_TRANSFORMED) {
            var targetWidth = this._scheduledConnectionsToProcessData[i].targetWidth;
            var targetHeight = this._scheduledConnectionsToProcessData[i].targetHeight;

            var sizesChanger = this._settings.getSizesChanger();

            sizesChanger(
                connectionToProcess.item, 
                targetWidth, 
                targetHeight
            );

            var coordsChanger = this._settings.getCoordsChanger();
            var animationMsDuration = this._settings.getCoordsChangeAnimationMsDuration();
            var eventEmitter = this._settings.getEventEmitter();
            var coordsChangeTransitionTiming = this._settings.getCoordsChangeTransitionTiming();

            coordsChanger(
                connectionToProcess.item, 
                left, 
                top,
                animationMsDuration,
                eventEmitter,
                true,
                targetWidth,
                targetHeight,
                false,
                coordsChangeTransitionTiming
            );
        }
    }

    this._gridifier.scheduleGridSizesUpdate();

    this._scheduledConnectionsToProcessData = null;
    this._processScheduledConnectionsTimeout = null;
}