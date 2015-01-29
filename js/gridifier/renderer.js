Gridifier.Renderer = function(gridifier, connections, settings, normalizer) {
    var me = this;

    this._gridifier = null;
    this._connections = null;
    this._settings = null;
    this._normalizer = null;

    // Array[
    //     [0] => {connection: connection, processingType: processingType, left: left, top: top},
    //     [1] => {connection: connection, processingType: processingType, left: left, top: top},
    //     ...,
    //     n
    // ]
    this._scheduledConnectionsToProcessData = null;
    this._processScheduledConnectionsTimeout = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._connections = connections;
        me._settings = settings;
        me._normalizer = normalizer;
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

Gridifier.Renderer.CONNECTION_RENDERED_ITEM_DATA_CLASS = "gridifier-connection-rendered";
Gridifier.Renderer.PROCESS_SCHEDULED_CONNECTIONS_TIMEOUT = 20;
Gridifier.Renderer.SCHEDULED_CONNECTIONS_PROCESSING_TYPES = {
    SHOW: 0, RENDER: 1, RENDER_TRANSFORMED: 2
};

Gridifier.Renderer.prototype._isConnectionItemRendered = function(connection) {
    return Dom.css.hasClass(connection.item, Gridifier.Renderer.CONNECTION_RENDERED_ITEM_DATA_CLASS);
}

Gridifier.Renderer.prototype._markConnectionItemAsRendered = function(connection) {
    Dom.css.addClass(connection.item, Gridifier.Renderer.CONNECTION_RENDERED_ITEM_DATA_CLASS);
}

// @todo -> Check per horizontal grid -> Should left also be in %???
Gridifier.Renderer.prototype._getCssLeftPropertyValuePerConnection = function(connection) {
    if(this._settings.isVerticalGrid()) {
        var left = connection.x1 / (this._gridifier.getGridX2() + 1) * 100;
        left = this._normalizer.normalizeFractionalValueForRender(left) + "%";
    }
    else if(this._settings.isHorizontalGrid()) {
        var left = connection.x1 + "px";
    }

    return left;
}

Gridifier.Renderer.prototype._getCssTopPropertyValuePerConnection = function(connection) {
    if(this._settings.isVerticalGrid()) {
        if(this._settings.isDefaultIntersectionStrategy())
            var top = connection.y1 + "px";
        else if(this._settings.isNoIntersectionsStrategy())
            var top = (connection.y1 + connection.verticalOffset) + "px";
    }
    else if(this._settings.isHorizontalGrid()) {
        var top = connection.y1 / (this._gridifier.getGridY2() + 1) * 100;
        top = this._normalizer.normalizeFractionalValueForRender(top) + "%";
    }

    return top;
}

Gridifier.Renderer.prototype._saveLastCalculatedConnectionOffsets = function(connection, left, top) {
    connection.lastRenderedLeftOffset = left;
    connection.lastRenderedTopOffset = top;
}

Gridifier.Renderer.prototype._processScheduledConnections = function() {
    var st = Gridifier.SizesTransformer;

    SizesResolverManager.startCachingTransaction();

    for(var i = 0; i < this._scheduledConnectionsToProcessData.length; i++) {
        var connectionToProcess = this._scheduledConnectionsToProcessData[i].connection;
        var processingType = this._scheduledConnectionsToProcessData[i].processingType;
        var left = this._scheduledConnectionsToProcessData[i].left;
        var top = this._scheduledConnectionsToProcessData[i].top;

        if(processingType == Gridifier.Renderer.SCHEDULED_CONNECTIONS_PROCESSING_TYPES.SHOW) {
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
        else if(processingType == Gridifier.Renderer.SCHEDULED_CONNECTIONS_PROCESSING_TYPES.RENDER) {
            Dom.css.set(connectionToProcess.item, {
                left: left,
                top: top
            });
        }
        else if(processingType == Gridifier.Renderer.SCHEDULED_CONNECTIONS_PROCESSING_TYPES.RENDER_TRANSFORMED) {
            if(Dom.hasAttribute(connectionToProcess.item, st.TRANSFORMED_ITEM_DATA_ATTR)) {
                connectionToProcess.item.removeAttribute(st.TRANSFORMED_ITEM_DATA_ATTR);
                // @todo -> Move to separate function
                Dom.css3.transition(connectionToProcess.item, "All 600ms ease");

                var targetWidth = connectionToProcess.item.getAttribute(st.TARGET_WIDTH_DATA_ATTR);
                var targetHeight = connectionToProcess.item.getAttribute(st.TARGET_HEIGHT_DATA_ATTR);
                connectionToProcess.item.removeAttribute(st.TARGET_WIDTH_DATA_ATTR);
                connectionToProcess.item.removeAttribute(st.TARGET_HEIGHT_DATA_ATTR);

                Dom.css.set(connectionToProcess.item, {
                    width: targetWidth,
                    height: targetHeight,
                    left: left,
                    top: top
                });
            }
            else if(Dom.hasAttribute(connectionToProcess.item, st.DEPENDED_ITEM_DATA_ATTR)) {
                connectionToProcess.item.removeAttribute(st.DEPENDED_ITEM_DATA_ATTR);
                // @todo -> Move to separate function
                Dom.css3.transition(connectionToProcess.item, "All 600ms ease");
                Dom.css.set(connectionToProcess.item, {
                    left: left,
                    top: top
                });
            }
        }
    }

    // @todo -> This kills performance on drags. Plan all caching interactions inside SizesTransformer.
    //          (Sync with queue????)
    SizesResolverManager.stopCachingTransaction();
    this._gridifier.scheduleGridSizesUpdate();

    this._scheduledConnectionsToProcessData = null;
    this._processScheduledConnectionsTimeout = null;
}

Gridifier.Renderer.prototype.showConnections = function(connections) {
    if(!Dom.isArray(connections))
        var connections = [connections];

    for(var i = 0; i < connections.length; i++) {
        if(this._isConnectionItemRendered(connections[i]))
            continue;

        var left = this._getCssLeftPropertyValuePerConnection(connections[i]);
        var top = this._getCssTopPropertyValuePerConnection(connections[i]);
        this._saveLastCalculatedConnectionOffsets(connections[i], left, top);
        this._markConnectionItemAsRendered(connections[i]);

        if(this._scheduledConnectionsToProcessData == null) {
            this._scheduledConnectionsToProcessData = [];
        }
        else {
            clearTimeout(this._processScheduledConnectionsTimeout);
            this._processScheduledConnectionsTimeout = null;
        }

        var me = this;
        this._scheduledConnectionsToProcessData.push({
            connection: connections[i],
            processingType: Gridifier.Renderer.SCHEDULED_CONNECTIONS_PROCESSING_TYPES.SHOW,
            left: left,
            top: top
        });
        this._processScheduledConnectionsTimeout = setTimeout(function() {
            me._processScheduledConnections.call(me);
        }, Gridifier.Renderer.PROCESS_SCHEDULED_CONNECTIONS_TIMEOUT);
    }
}

// Gridifier.Renderer.prototype.showConnections = function(connections) {
//     if(!Dom.isArray(connections))
//         var connections = [connections];

//     for(var i = 0; i < connections.length; i++) {
//         if(this._isConnectionItemRendered(connections[i]))
//             continue;

//         var left = this._getCssLeftPropertyValuePerConnection(connections[i]);
//         var top = this._getCssTopPropertyValuePerConnection(connections[i]);
//         this._saveLastCalculatedConnectionOffsets(connections[i], left, top);

//         Dom.css.set(connections[i].item, {
//             position: "absolute",
//             left: left,
//             top: top
//         });

//         this._markConnectionItemAsRendered(connections[i]);
//         var toggleFunction = this._settings.getToggle();
//         toggleFunction.show(connections[i].item, this._gridifier.getGrid());
//     }
// }

Gridifier.Renderer.prototype.renderTransformedConnections = function() {
    var connections = this._connections.get();

    for(var i = 0; i < connections.length; i++) {
        var left = this._getCssLeftPropertyValuePerConnection(connections[i]);
        var top = this._getCssTopPropertyValuePerConnection(connections[i]);
        this._saveLastCalculatedConnectionOffsets(connections[i], left, top);

        if(this._scheduledConnectionsToProcessData == null) {
            this._scheduledConnectionsToProcessData = [];
        }
        else {
            clearTimeout(this._processScheduledConnectionsTimeout);
            this._processScheduledConnectionsTimeout = null;
        }

        var me = this;
        this._scheduledConnectionsToProcessData.push({
            connection: connections[i],
            processingType: Gridifier.Renderer.SCHEDULED_CONNECTIONS_PROCESSING_TYPES.RENDER_TRANSFORMED,
            left: left,
            top: top
        });
        this._processScheduledConnectionsTimeout = setTimeout(function() {
            me._processScheduledConnections.call(me);
        }, Gridifier.Renderer.PROCESS_SCHEDULED_CONNECTIONS_TIMEOUT);
    }
}

// Gridifier.Renderer.prototype.renderTransformedConnections = function() {
//     var me = this; 
//     var st = Gridifier.SizesTransformer;
//     var connections = this._connections.get();

//     var renderNextConnection = function(i) {
//         if(i == connections.length) {
//             //me._gridifier.updateGridSizes(); // @todo -> Bugs because of this method??? CHECK THIS
//             me._gridifier.scheduleGridSizesUpdate();
//             //$(me._gridifier).trigger("gridifier.gridSizesChange"); // @todo -> Replace with real event
//             return;
//         }

//         var left = me._getCssLeftPropertyValuePerConnection(connections[i]);
//         var top = me._getCssTopPropertyValuePerConnection(connections[i]);
//         me._saveLastCalculatedConnectionOffsets(connections[i], left, top);

//         if(Dom.hasAttribute(connections[i].item, st.TRANSFORMED_ITEM_DATA_ATTR)) { 
//             connections[i].item.removeAttribute(st.TRANSFORMED_ITEM_DATA_ATTR);
//             // @todo -> Move to separate function
//             Dom.css3.transition(connections[i].item, "All 600ms ease");

//             var targetWidth = connections[i].item.getAttribute(st.TARGET_WIDTH_DATA_ATTR);
//             var targetHeight = connections[i].item.getAttribute(st.TARGET_HEIGHT_DATA_ATTR);
//             connections[i].item.removeAttribute(st.TARGET_WIDTH_DATA_ATTR);
//             connections[i].item.removeAttribute(st.TARGET_HEIGHT_DATA_ATTR);

//            // setTimeout(function() { 
//                 connections[i].item.style.width = targetWidth;
//                 connections[i].item.style.height = targetHeight;
//                 //connections[i].item.style.left = connections[i].x1 + "px";
//                 connections[i].item.style.left = left;
//                 connections[i].item.style.top = top;
//             //}, 0);
//         }
//         else if(Dom.hasAttribute(connections[i].item, st.DEPENDED_ITEM_DATA_ATTR)) {
//             connections[i].item.removeAttribute(st.DEPENDED_ITEM_DATA_ATTR);
//             Dom.css3.transition(connections[i].item, "All 600ms ease");

//             //setTimeout(function() {
//                 //connections[i].item.style.left = connections[i].x1 + "px";
//                 connections[i].item.style.left = left;
//                 connections[i].item.style.top = top;
//             //}, 0);
//         }

//         renderNextConnection(i + 1);
//     }
//     renderNextConnection(0);
//     //setTimeout(function() { renderNextConnection(0); }, 0); // @notice -> Settimeouts here will slow down
//     // overall perfomance in legacy browsers(ie8, safari 5.1.7(Win)), because caching will stop before
//     // me._gridifier.getGridX2() will be called(because of setTimeout async), and Gridifier will recursively recalculate
//     // all DOM nodes up through DOM-Tree, until reaching root node.
// }

// Gridifier.Renderer.prototype._renderScheduledConnections = function() {
//     SizesResolverManager.startCachingTransaction();

//     for(var i = 0; i < this._scheduledConnectionsToRender.length; i++) {
//         var left = this._getCssLeftPropertyValuePerConnection(this._scheduledConnectionsToRender[i]);
//         var top = this._getCssTopPropertyValuePerConnection(this._scheduledConnectionsToRender[i]);
//         this._saveLastCalculatedConnectionOffsets(this._scheduledConnectionsToRender[i], left, top);

//         Dom.css.set(this._scheduledConnectionsToRender[i].item, {
//             left: left,
//             top: top
//         });
//     }

//     SizesResolverManager.stopCachingTransaction();

//     this._scheduledConnectionsToRender = null;
//     this._renderScheduledConnectionsTimeout = null;
// }

Gridifier.Renderer.prototype.renderConnections = function(connections, exceptConnections) {
    var exceptConnections = exceptConnections || false;

    for(var i = 0; i < connections.length; i++) {
        if(exceptConnections) {
            var skipConnection = false;

            for(var j = 0; j < exceptConnections.length; j++) {
                if(connections[i].itemGUID == exceptConnections[j].itemGUID) {
                    skipConnection = true;
                    break;
                }
            }

            if(skipConnection) continue;
        }

        var left = this._getCssLeftPropertyValuePerConnection(connections[i]);
        var top = this._getCssTopPropertyValuePerConnection(connections[i]);
        this._saveLastCalculatedConnectionOffsets(connections[i], left, top);

        if(this._scheduledConnectionsToProcessData == null) {
            this._scheduledConnectionsToProcessData = [];
        }
        else {
            clearTimeout(this._processScheduledConnectionsTimeout);
            this._processScheduledConnectionsTimeout = null;
        }

        var me = this;
        this._scheduledConnectionsToProcessData.push({
            connection: connections[i],
            processingType: Gridifier.Renderer.SCHEDULED_CONNECTIONS_PROCESSING_TYPES.RENDER,
            left: left,
            top: top
        });
        this._processScheduledConnectionsTimeout = setTimeout(function() {
            me._processScheduledConnections.call(me);
        }, Gridifier.Renderer.PROCESS_SCHEDULED_CONNECTIONS_TIMEOUT);
    }
}

// Gridifier.Renderer.prototype.renderConnectionsAfterPrependNormalization = function(prependedConnection, connections) {
//     var me = this;

//     var renderNextConnection = function(i) {
//         if(i == connections.length)
//             return;

//         if(connections[i].itemGUID != prependedConnection.itemGUID) {
//             var left = me._getCssLeftPropertyValuePerConnection(connections[i]);
//             var top = me._getCssTopPropertyValuePerConnection(connections[i]);
//             me._saveLastCalculatedConnectionOffsets(connections[i], left, top);

//             connections[i].item.style.left = left;
//             connections[i].item.style.top = top;
//         }

//         renderNextConnection(i + 1);
//     }

//     renderNextConnection(0);
//     //setTimeout(function() { renderNextConnection(0); }, 0); // @todo no Timeout?
// }