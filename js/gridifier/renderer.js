Gridifier.Renderer = function(gridifier, connections, settings) {
    var me = this;

    this._gridifier = null;
    this._connections = null;
    this._settings = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._connections = connections;
        me._settings = settings;
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

Gridifier.Renderer.prototype._isConnectionItemRendered = function(connection) {
    return Dom.css.hasClass(connection.item, Gridifier.Renderer.CONNECTION_RENDERED_ITEM_DATA_CLASS);
}

Gridifier.Renderer.prototype._markConnectionItemAsRendered = function(connection) {
    Dom.css.addClass(connection.item, Gridifier.Renderer.CONNECTION_RENDERED_ITEM_DATA_CLASS);
}

Gridifier.Renderer.prototype.showConnections = function(connections) {
    if(!Dom.isArray(connections))
        var connections = [connections];

    for(var i = 0; i < connections.length; i++) {
        if(this._isConnectionItemRendered(connections[i]))
            continue;

        Dom.css.set(connections[i].item, {
            position: "absolute",
            left: connections[i].x1 + "px",
            top: connections[i].y1 + "px"
        });

        this._markConnectionItemAsRendered(connections[i]);
        var toggleFunction = this._settings.getToggle();
        toggleFunction.show(connections[i].item, this._gridifier.getGrid());
    }
}

Gridifier.Renderer.prototype.renderTransformedGrid = function() {
    var me = this;
    var st = Gridifier.SizesTransformer;
    var connections = this._connections.get();

    var renderNextConnection = function(i) {
        if(i == connections.length) {
            me._gridifier.updateGridSizes();
            $(me._gridifier).trigger("gridifier.gridSizesChange"); // @todo -> Replace with real event
            return;
        }

        if(Dom.hasAttribute(connections[i].item, st.TRANSFORMED_ITEM_DATA_ATTR)) {
            connections[i].item.removeAttribute(st.TRANSFORMED_ITEM_DATA_ATTR);
            // @todo -> Move to separate function
            Dom.css3.transition(connections[i].item, "All 600ms ease");

            var targetWidth = connections[i].item.getAttribute(st.TARGET_WIDTH_DATA_ATTR);
            var targetHeight = connections[i].item.getAttribute(st.TARGET_HEIGHT_DATA_ATTR);
            connections[i].item.removeAttribute(st.TARGET_WIDTH_DATA_ATTR);
            connections[i].item.removeAttribute(st.TARGET_HEIGHT_DATA_ATTR);

            setTimeout(function() { 
                connections[i].item.style.width = targetWidth;
                connections[i].item.style.height = targetHeight;
                connections[i].item.style.left = connections[i].x1 + "px";
                connections[i].item.style.top = connections[i].y1 + "px";
            }, 0);
        }
        else if(Dom.hasAttribute(connections[i].item, st.DEPENDED_ITEM_DATA_ATTR)) {
            connections[i].item.removeAttribute(st.DEPENDED_ITEM_DATA_ATTR);
            Dom.css3.transition(connections[i].item, "All 600ms ease");

            setTimeout(function() {
                connections[i].item.style.left = connections[i].x1 + "px";
                connections[i].item.style.top = connections[i].y1 + "px";
            }, 0);
        }

        renderNextConnection(i + 1);
    }

    setTimeout(function() { renderNextConnection(0); }, 0);
}

Gridifier.Renderer.prototype.renderConnectionsAfterPrependNormalization = function(prependedConnection, connections) {
    var me = this;

    var renderNextConnection = function(i) {
        if(i == connections.length)
            return;

        if(connections[i].itemGUID != prependedConnection.itemGUID) {
            setTimeout(function() { 
                connections[i].item.style.left = connections[i].x1 + "px";
                connections[i].item.style.top = connections[i].y1 + "px";
            }, 0);
        }

        renderNextConnection(i + 1);
    }

    setTimeout(function() { renderNextConnection(0); }, 0);
}