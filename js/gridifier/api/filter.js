Gridifier.Api.Filter = function(settings, eventEmitter) {
    var me = this;

    this._settings = null;
    this._eventEmitter = null;

    this._filterFunction = null;
    this._filterFunctions = {};

    this._css = {
    };

    this._construct = function() {
        me._settings = settings;
        me._eventEmitter = eventEmitter;

        me._filterFunctions = {};

        me._addAllFilter();
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

Gridifier.Api.Filter.prototype.setFilterFunction = function(filterFunctionName) {
    if(!this._filterFunctions.hasOwnProperty(filterFunctionName)) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.SET_FILTER_INVALID_PARAM,
            filterFunctionName
        );
        return;
    }

    this._filterFunction = this._filterFunctions[filterFunctionName];
}

Gridifier.Api.Filter.prototype.addFilterFunction = function(filterFunctionName, filterFunction) {
    this._filterFunctions[filterFunctionName] = filterFunction;
}

Gridifier.Api.Filter.prototype.getFilterFunction = function() {
    return this._filterFunction;
}

Gridifier.Api.Filter.prototype._addAllFilter = function() {
    this._filterFunctions.all = function(item) {
        return true;
    };
}