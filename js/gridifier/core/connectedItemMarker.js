Gridifier.ConnectedItemMarker = function() {
    var me = this;

    this._css = {
    };

    this._construct = function() {
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

Gridifier.ConnectedItemMarker.CONNECTED_ITEM_DATA_CLASS = "gridifier-connected-item";

Gridifier.ConnectedItemMarker.prototype.markItemAsConnected = function(item) {
    Dom.css.addClass(
        item,
        Gridifier.ConnectedItemMarker.CONNECTED_ITEM_DATA_CLASS
    );
}

Gridifier.ConnectedItemMarker.prototype.isItemConnected = function(item) {
    return Dom.css.hasClass(
        item,
        Gridifier.ConnectedItemMarker.CONNECTED_ITEM_DATA_CLASS
    );
}

Gridifier.ConnectedItemMarker.prototype.unmarkItemAsConnected = function(item) {
    Dom.css.removeClass(item, Gridifier.ConnectedItemMarker.CONNECTED_ITEM_DATA_CLASS);
}