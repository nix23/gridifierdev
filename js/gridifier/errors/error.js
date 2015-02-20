Gridifier.Error = function(errorType, errorParam) {
    var me = this;

    this._errorParam = null;

    this._coreErrors = null;
    this._collectorErrors = null;
    this._apiSettingsErrors = null;
    this._coreSettingsErrors = null;

    this._css = {
    };

    this._construct = function() {
        me._errorParam = errorParam || null;

        me._coreErrors = new Gridifier.CoreErrors(me, errorType);
        me._collectorErrors = new Gridifier.CollectorErrors(me, errorType);
        me._apiSettingsErrors = new Gridifier.ApiSettingsErrors(me, errorType);
        me._coreSettingsErrors = new Gridifier.CoreSettingsErrors(me, errorType);

        if(me._coreErrors.isCoreError()) {
            var errorMsg = me._coreErrors.getErrorMessage();
        }
        else if(me._collectorErrors.isCollectorError()) {
            var errorMsg = me._collectorErrors.getErrorMessage();
        }
        else if(me._apiSettingsErrors.isApiSettingsError()) {
            var errorMsg = me._apiSettingsErrors.getErrorMessage();
        }
        else if(me._coreSettingsErrors.isCoreSettingsError()) {
            var errorMsg = me._coreSettingsErrors.getErrorMessage();
        }
        else {
            throw new Error("Gridifier Error -> Wrong error type: " + errorType);
        }

        throw new Error(errorMsg);
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

// @todo -> Use api url postfixes as vals instead of numbers
// @todo -> Prefix error objects with JSON.stringify 
Gridifier.Error.ERROR_TYPES = {
    EXTRACT_GRID: 0,
    SETTINGS: {
        /* Core settings errors */
        INVALID_GRID_TYPE: 1,
        INVALID_PREPEND_TYPE: 2,
        INVALID_APPEND_TYPE: 3,
        INVALID_INTERSECTION_STRATEGY: 4,
        INVALID_ALIGNMENT_TYPE: 5,
        INVALID_SORT_DISPERSION_MODE: 6,
        MISSING_SORT_DISPERSION_VALUE: 7,
        INVALID_SORT_DISPERSION_VALUE: 8,
        
        /* Api settings errors */
        INVALID_SORT_PARAM_VALUE: 9,
        INVALID_ONE_OF_SORT_FUNCTION_TYPES: 10,

        INVALID_FILTER_PARAM_VALUE: 11,
        INVALID_ONE_OF_FILTER_FUNCTION_TYPES: 12,

        INVALID_TOGGLE_PARAM_VALUE: 13,
        INVALID_ONE_OF_TOGGLE_PARAMS: 14,

        INVALID_COORDS_CHANGER_PARAM_VALUE: 15,
        INVALID_ONE_OF_COORDS_CHANGER_FUNCTION_TYPES: 16,

        INVALID_SIZES_CHANGER_PARAM_VALUE: 17,
        INVALID_ONE_OF_SIZES_CHANGER_FUNCTION_TYPES: 18,

        SET_TOGGLE_INVALID_PARAM: 19,
        SET_FILTER_INVALID_PARAM: 20,
        SET_SORT_INVALID_PARAM: 21,
        SET_COORDS_CHANGER_INVALID_PARAM: 22,
        SET_SIZES_CHANGER_INVALID_PARAM: 23
    },
    COLLECTOR: {
        NOT_DOM_ELEMENT: 24,
        ITEM_NOT_ATTACHED_TO_GRID: 25,
        ITEM_NOT_CONNECTED_TO_GRID: 26,
        ITEM_WIDER_THAN_GRID_WIDTH: 27,
        ITEM_TALLER_THAN_GRID_HEIGHT: 28
    },
    CONNECTIONS: {
        NO_CONNECTIONS: 29,
        CONNECTION_BY_ITEM_NOT_FOUND: 30
    },
    SIZES_TRANSFORMER: {
        WRONG_TARGET_TRANSFORMATION_SIZES: 31
    },
    APPENDER: {
        WRONG_INSERT_BEFORE_TARGET_ITEM: 32,
        WRONG_INSERT_AFTER_TARGET_ITEM: 33
    }
}

Gridifier.Error.prototype.getErrorMsgPrefix = function() {
    return "Gridifier error: ";
}

Gridifier.Error.prototype.getErrorApiUrlPrefix = function() {
    return "http://gridifier.io/api/errors/";
}

Gridifier.Error.prototype.getErrorParam = function() {
    return this._errorParam + "(" + (typeof this._errorParam) + ")";
}

Gridifier.Error.prototype.getErrorObjectParam = function() {
    return this._errorParam;
}