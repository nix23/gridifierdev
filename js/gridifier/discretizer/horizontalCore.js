Gridifier.Discretizer.HorizontalCore = function(gridifier, settings) {
    var me = this;

    this._gridifier = null;
    this._settings = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._settings = settings;

        me._bindEvents();
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