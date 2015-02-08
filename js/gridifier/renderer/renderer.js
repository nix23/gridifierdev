Gridifier.Renderer = function(gridifier, connections, settings, normalizer) {
    var me = this;

    this._gridifier = null;
    this._connections = null;
    this._settings = null;
    this._normalizer = null;

    this._transformedItemMarker = null;

    this._rendererSchedulator = null;
    this._rendererConnections = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._connections = connections;
        me._settings = settings;
        me._normalizer = normalizer;

        me._transformedItemMarker = new Gridifier.SizesTransformer.TransformedItemMarker();

        me._rendererSchedulator = new Gridifier.Renderer.Schedulator(
            me._gridifier, me._settings, me
        );
        me._rendererConnections = new Gridifier.Renderer.Connections(
            me._settings
        );
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

Gridifier.Renderer.prototype.showConnections = function(connections) {
    var me = this;

    if(!Dom.isArray(connections))
        var connections = [connections];

    for(var i = 0; i < connections.length; i++) {
        if(this._rendererConnections.isConnectionItemRendered(connections[i]))
            continue;

        var left = this._rendererConnections.getCssLeftPropertyValuePerConnection(connections[i]);
        var top = this._rendererConnections.getCssTopPropertyValuePerConnection(connections[i]);
        this._rendererConnections.saveLastCalculatedConnectionOffsets(connections[i], left, top);
        this._rendererConnections.markConnectionItemAsRendered(connections[i]);

        this._rendererSchedulator.reinit();
        this._rendererSchedulator.scheduleShow(connections[i], left, top);
    }
}

Gridifier.Renderer.prototype.renderTransformedConnections = function(connections) {
    for(var i = 0; i < connections.length; i++) {
        var left = this._rendererConnections.getCssLeftPropertyValuePerConnection(connections[i]);
        var top = this._rendererConnections.getCssTopPropertyValuePerConnection(connections[i]);
        this._rendererConnections.saveLastCalculatedConnectionOffsets(connections[i], left, top);

        this._rendererSchedulator.reinit();

        if(this._transformedItemMarker.isTransformedItem(connections[i].item)) {
            var targetRawSizes = this._transformedItemMarker.getTransformedItemTargetRawSizes(
                connections[i].item
            );

            this._rendererSchedulator.scheduleRenderTransformed(
                connections[i], left, top, targetRawSizes.targetRawWidth, targetRawSizes.targetRawHeight
            );
            this._transformedItemMarker.unmarkItemAsTransformed(connections[i].item);
        }
        else if(this._transformedItemMarker.isDependedItem(connections[i].item)) {
            this._rendererSchedulator.scheduleRenderDepended(connections[i], left, top);
            this._transformedItemMarker.unmarkItemAsDepended(connections[i].item);
        }
    }
}

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

        var left = this._rendererConnections.getCssLeftPropertyValuePerConnection(connections[i]);
        var top = this._rendererConnections.getCssTopPropertyValuePerConnection(connections[i]);
        this._rendererConnections.saveLastCalculatedConnectionOffsets(connections[i], left, top);

        this._rendererSchedulator.reinit();
        this._rendererSchedulator.scheduleRender(connections[i], left, top);
    }
}