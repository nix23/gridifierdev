Gridifier.HorizontalGrid.Connections = function() {
    var me = this;

    this._connections = [];

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

Gridifier.HorizontalGrid.Connections.prototype.get = function() {
    return this._connections;
}