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

        me._rendererConnections = new Gridifier.Renderer.Connections(
            me._settings
        );
        me._rendererSchedulator = new Gridifier.Renderer.Schedulator(
            me._gridifier, me._settings, me._connections, me, me._rendererConnections
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

Gridifier.Renderer.SCHEDULED_ITEM_TO_HIDE_DATA_ATTR = "data-gridifier-scheduled-to-hide";
Gridifier.Renderer.SCHEDULED_ITEM_TO_HIDE_DATA_ATTR_VALUE = "yes";

Gridifier.Renderer.prototype.getRendererConnections = function() {
    return this._rendererConnections;
}

Gridifier.Renderer.prototype.setSilentRendererInstance = function(silentRenderer) {
    this._rendererSchedulator.setSilentRendererInstance(silentRenderer);
}

Gridifier.Renderer.prototype.showConnections = function(connections) {
    var me = this;

    if(!Dom.isArray(connections))
        var connections = [connections];

    for(var i = 0; i < connections.length; i++) {
        this.unmarkItemAsScheduledToHide(connections[i].item);
        if(this._rendererConnections.isConnectionItemRendered(connections[i]))
            continue;

        var left = this._rendererConnections.getCssLeftPropertyValuePerConnection(connections[i]);
        var top = this._rendererConnections.getCssTopPropertyValuePerConnection(connections[i]);
        this._rendererConnections.markConnectionItemAsRendered(connections[i]);

        this._rendererSchedulator.reinit();
        this._rendererSchedulator.scheduleShow(connections[i], left, top);
    }
}

Gridifier.Renderer.prototype.markItemsAsScheduledToHide = function(items) {
    for(var i = 0; i < items.length; i++) {
        items[i].setAttribute(
            Gridifier.Renderer.SCHEDULED_ITEM_TO_HIDE_DATA_ATTR,
            Gridifier.Renderer.SCHEDULED_ITEM_TO_HIDE_DATA_ATTR_VALUE
        );
    }
}

Gridifier.Renderer.prototype.unmarkItemAsScheduledToHide = function(item) {
    item.removeAttribute(Gridifier.Renderer.SCHEDULED_ITEM_TO_HIDE_DATA_ATTR);
}

Gridifier.Renderer.prototype.wasItemScheduledToHide = function(item) {
    return Dom.hasAttribute(item, Gridifier.Renderer.SCHEDULED_ITEM_TO_HIDE_DATA_ATTR);
}

Gridifier.Renderer.prototype.hideConnections = function(connections) {
    var me = this;

    if(!Dom.isArray(connections))
        var connections = [connections];

    for(var i = 0; i < connections.length; i++) {
        if(!this.wasItemScheduledToHide(connections[i].item)) {
            continue;
        }

        var left = this._rendererConnections.getCssLeftPropertyValuePerConnection(connections[i]);
        var top = this._rendererConnections.getCssTopPropertyValuePerConnection(connections[i]);
        this._rendererConnections.unmarkConnectionItemAsRendered(connections[i]);

        this._rendererSchedulator.reinit();
        this._rendererSchedulator.scheduleHide(connections[i], left, top);
    }
}

Gridifier.Renderer.prototype.renderTransformedConnections = function(connections) {
    for(var i = 0; i < connections.length; i++) {
        var left = this._rendererConnections.getCssLeftPropertyValuePerConnection(connections[i]);
        var top = this._rendererConnections.getCssTopPropertyValuePerConnection(connections[i]);

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

        this._rendererSchedulator.reinit();
        this._rendererSchedulator.scheduleRender(connections[i], left, top);
    }
}

// Delay in row/col updates in noIntersectionsMode is required, because without it refreshes
// will be called right after show method, and will be placed in the end of animation.
// (Example: slide show method -> calling 0ms offset translate at start, than this refresh
// will be called before slideOutTimeout without a delay.(Will move items instantly)
Gridifier.Renderer.prototype.renderConnectionsAfterDelay = function(connections, delay) {
    var me = this;
    var delay = delay || 40;

    for(var i = 0; i < connections.length; i++) {
        this._rendererSchedulator.reinit();
        this._rendererSchedulator.scheduleDelayedRender(connections[i], null, null, delay);
    }
}

Gridifier.Renderer.prototype.rotateItems = function(itemsToRotate) {
    var itemsToRotateConnections = [];

    for(var i = 0; i < itemsToRotate.length; i++) {
        if(this._gridifier.hasItemBindedClone(itemsToRotate[i])) {
            var itemClone = this._gridifier.getItemClone(itemsToRotate[i]);
            itemClone.style.visibility = "hidden";
        }

        var itemToRotateConnection = this._connections.findConnectionByItem(itemsToRotate[i]);
        this._rendererConnections.unmarkConnectionItemAsRendered(itemToRotateConnection);
        itemsToRotateConnections.push(itemToRotateConnection);
    }

    this.showConnections(itemsToRotateConnections);
}