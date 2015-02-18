Gridifier.Api.Sort = function(settings, eventEmitter) {
    var me = this;

    this._settings = null;
    this._eventEmitter = null;

    this._sortFunction = null;
    this._sortFunctions = {};

    this._css = {
    };

    this._construct = function() {
        me._settings = settings;
        me._eventEmitter = eventEmitter;

        me._sortFunctions = {};

        me._addDefaultSort();
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

Gridifier.Api.Sort.prototype.setSortFunction = function(sortFunctionName) {
    if(!this._sortFunctions.hasOwnProperty(sortFunctionName)) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.SET_SORT_INVALID_PARAM,
            sortFunctionName
        );
        return;
    }

    this._sortFunction = this._sortFunctions[sortFunctionName];
}

Gridifier.Api.Sort.prototype.addSortFunction = function(sortFunctionName, sortFunction) {
    this._sortFunctions[sortFunctionName] = sortFunction;
}

Gridifier.Api.Sort.prototype.getSortFunction = function() {
    return this._sortFunction;
}

Gridifier.Api.Sort.prototype._addDefaultSort = function() {
    this._sortFunctions.default = function(firstItem, secondItem) {
        return -1;
    }
}