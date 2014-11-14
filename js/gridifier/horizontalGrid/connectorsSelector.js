Gridifier.HorizontalGrid.ConnectorsSelector = function(connectors) {
    var me = this;

    this._connectors = null;

    this._css = {
    };

    this._construct = function() {
        me._connectors = connectors;
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