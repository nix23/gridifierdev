Gridifier.Renderer.Connections = function(settings) {
    var me = this;

    this._settings = null;

    this._css = {
    };

    this._construct = function() {
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

Gridifier.Renderer.Connections.CONNECTION_RENDERED_ITEM_DATA_CLASS = "gridifier-connection-rendered";

Gridifier.Renderer.Connections.prototype.isConnectionItemRendered = function(connection) {
    return Dom.css.hasClass(
        connection.item,
        Gridifier.Renderer.Connections.CONNECTION_RENDERED_ITEM_DATA_CLASS
    );
}

Gridifier.Renderer.Connections.prototype.markConnectionItemAsRendered = function(connection) {
    Dom.css.addClass(
        connection.item,
        Gridifier.Renderer.Connections.CONNECTION_RENDERED_ITEM_DATA_CLASS
    );
}

Gridifier.Renderer.Connections.prototype.getCssLeftPropertyValuePerConnection = function(connection) {
    if(this._settings.isVerticalGrid()) {
        // @old -> var left = connection.x1 / (this._gridifier.getGridX2() + 1) * 100;
        // @old -> left = this._normalizer.normalizeFractionalValueForRender(left) + "%";
        var left = connection.x1 + "px";
    }
    else if(this._settings.isHorizontalGrid()) {
        if(this._settings.isDefaultIntersectionStrategy()) {
            var left = connection.x1 + "px";
        }
        else if(this._settings.isNoIntersectionsStrategy()) {
            var left = (connection.x1 + connection.horizontalOffset) + "px";
        }
    }

    return left;
}

Gridifier.Renderer.Connections.prototype.getCssTopPropertyValuePerConnection = function(connection) {
    if(this._settings.isVerticalGrid()) {
        if(this._settings.isDefaultIntersectionStrategy()) {
            var top = connection.y1 + "px";
        }
        else if(this._settings.isNoIntersectionsStrategy()) {
            var top = (connection.y1 + connection.verticalOffset) + "px";
        }
    }
    else if(this._settings.isHorizontalGrid()) {
        var top = connection.y1 + "px";
    }

    return top;
}