Gridifier.Error = function(errorType, errorParam) {
    var me = this;

    this._errorParam = null;

    this._css = {
    };

    this._construct = function() {
        me._errorParam = errorParam || null;

        var errors = Gridifier.Error.ERROR_TYPES;
        if(errorType == errors.EXTRACT_GRID) {
            var errorMsg = me._getExtractGridErrorMsg();
        }
        else if(errorType == errors.SETTINGS.INVALID_GRID_TYPE) {
            var errorMsg = me._getSettingsInvalidGridTypeErrorMsg();
        }
        else if(errorType == errors.SETTINGS.INVALID_PREPEND_TYPE) {
            var errorMsg = me._getSettingsInvalidPrependTypeErrorMsg();
        }
        else if(errorType == errors.SETTINGS.INVALID_APPEND_TYPE) {
            var errorMsg = me._getSettingsInvalidAppendTypeErrorMsg();
        }
        else if(errorType == errors.SETTINGS.INVALID_INTERSECTION_STRATEGY) {
            var errorMsg = me._getSettingsInvalidIntersectionStrategyErrorMsg();
        }
        else if(errorType == errors.SETTINGS.INVALID_SORT_DISPERSION_MODE) {
            var errorMsg = me._getSettingsInvalidSortDispersionModeErrorMsg();
        }
        else if(errorType == errors.SETTINGS.MISSING_SORT_DISPERSION_VALUE) {
            var errorMsg = me._getSettingsMissingSortDispersionValueErrorMsg();
        }
        else if(errorType == errors.SETTINGS.INVALID_SORT_DISPERSION_VALUE) {
            var errorMsg = me._getSettingsInvalidSortDispersionValueErrorMsg();
        }
        else if(errorType == errors.SETTINGS.INVALID_PARAM_FUNCTION_TYPE) {
            var errorMsg = me._getSettingsInvalidParamFunctionTypeErrorMsg();
        }
        else if(errorType == errors.SETTINGS.INVALID_ONE_OF_TOGGLE_PARAMS) {
            var errorMsg = me._getSettingsInvalidOneOfToggleParamsErrorMsg();
        }
        else if(errorType == errors.SETTINGS.INVALID_ONE_OF_SORT_FUNCTION_TYPES
                    || errorType == errors.SETTINGS.INVALID_ONE_OF_FILTER_FUNCTION_TYPES) {
            if(errorType == errors.SETTINGS.INVALID_ONE_OF_SORT_FUNCTION_TYPES) {
                var paramName = "sort";
            }
            else if(errorType == errors.SETTINGS.INVALID_ONE_OF_FILTER_FUNCTION_TYPES) {
                var paramName = "filter";
            }

            var errorMsg = me._getSettingsInvalidOneOfFilterOrSortFunctionTypesErrorMsg(paramName);
        }
        else if(errorType == errors.SETTINGS.INVALID_TOGGLE_PARAM_VALUE
                    || errorType == errors.SETTINGS.INVALID_SORT_PARAM_VALUE
                    || errorType == errors.SETTINGS.INVALID_FILTER_PARAM_VALUE) {
            if(errorType == errors.SETTINGS.INVALID_TOGGLE_PARAM_VALUE) {
                var paramName = "toggle";
            }
            else if(errorType == errors.SETTINGS.INVALID_SORT_PARAM_VALUE) {
                var paramName = "sort";
            }
            else if(errorType == errors.SETTINGS.INVALID_FILTER_PARAM_VALUE) {
                var paramName = "filter";
            }

            var errorMsg = me._getSettingsInvalidToggleSortOrFilterParamErrorMsg(paramName);
        }
        else if(errorType == errors.SETTINGS.SET_TOGGLE_INVALID_PARAM 
                    || errorType == errors.SETTINGS.SET_FILTER_INVALID_PARAM 
                    || errorType == errors.SETTINGS.SET_SORT_INVALID_PARAM) {
            if(errorType == errors.SETTINGS.SET_TOGGLE_INVALID_PARAM) {
                var functionName = "toggle";
            }
            else if(errorType == errors.SETTINGS.SET_FILTER_INVALID_PARAM) {
                var functionName = "filter";
            }
            else if(errorType == errors.SETTINGS.SET_SORT_INVALID_PARAM) {
                var functionName = "sort";
            }

            var errorMsg = me._getSettingsInvalidSetterParamErrorMsg(functionName);
        }
        else if(errorType == errors.COLLECTOR.NOT_DOM_ELEMENT) {
            var errorMsg = me._getCollectorNotDomElementErrorMsg();
        }
        else if(errorType == errors.COLLECTOR.ITEM_NOT_ATTACHED_TO_GRID) {
            var errorMsg = me._getItemNotAttachedToGridErrorMsg();
        }
        else if(errorType == errors.COLLECTOR.ITEM_WIDER_THAN_GRID_WIDTH) {
            var errorMsg = me._getItemWiderThanGridWidthErrorMsg();
        }
        else if(errorType == errors.COLLECTOR.ITEM_TALLER_THAN_GRID_HEIGHT) {
            var errorMsg = me._getItemTallerThatGridHeightErrorMsg();
        }
        else if(errorType == errors.CONNECTIONS.NO_CONNECTIONS) {
            var errorMsg = me._getNoConnectionsErrorMsg();
        }
        else if(errorType == errors.CONNECTIONS.CONNECTION_BY_ITEM_NOT_FOUND) {
            var errorMsg = me._getConnectionByItemNotFoundErrorMsg();
        }
        else if(errorType == errors.SIZES_TRANSFORMER.WRONG_TARGET_TRANSFORMATION_SIZES) {
            var errorMsg = me._getWrongTargetTransformationSizesErrorMsg();
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
        INVALID_GRID_TYPE: 1,
        INVALID_PREPEND_TYPE: 2,
        INVALID_APPEND_TYPE: 3,
        INVALID_INTERSECTION_STRATEGY: 4,
        INVALID_SORT_DISPERSION_MODE: 5,
        MISSING_SORT_DISPERSION_VALUE: 6,
        INVALID_SORT_DISPERSION_VALUE: 7,
        INVALID_SORT_PARAM_VALUE: 8,
        INVALID_ONE_OF_SORT_FUNCTION_TYPES: 9,
        INVALID_FILTER_PARAM_VALUE: 10,
        INVALID_ONE_OF_FILTER_FUNCTION_TYPES: 11,
        INVALID_TOGGLE_PARAM_VALUE: 12,
        INVALID_ONE_OF_TOGGLE_PARAMS: 13,
        SET_TOGGLE_INVALID_PARAM: 14,
        SET_FILTER_INVALID_PARAM: 15,
        SET_SORT_INVALID_PARAM: 16
    },
    COLLECTOR: {
        NOT_DOM_ELEMENT: 17,
        ITEM_NOT_ATTACHED_TO_GRID: 18,
        ITEM_WIDER_THAN_GRID_WIDTH: 19,
        ITEM_TALLER_THAN_GRID_HEIGHT: 20
    },
    CONNECTIONS: {
        NO_CONNECTIONS: 21,
        CONNECTION_BY_ITEM_NOT_FOUND: 22
    },
    SIZES_TRANSFORMER: {
        WRONG_TARGET_TRANSFORMATION_SIZES: 23
    }
}

Gridifier.Error.prototype._getErrorMsgPrefix = function() {
    return "Gridifier error: ";
}

Gridifier.Error.prototype._getErrorApiUrlPrefix = function() {
    return "http://gridifier.io/api/errors/";
}

Gridifier.Error.prototype._getErrorParam = function() {
    return this._errorParam + "(" + (typeof this._errorParam) + ")";
}

Gridifier.Error.prototype._getErrorObjectParam = function() {
    return this._errorParam;
}

Gridifier.Error.prototype._getExtractGridErrorMsg = function() {
    var msg = this._getErrorMsgPrefix();
    
    msg += "Can't get layout object. Currently gridifier supports ";
    msg += "native DOM elements, as well as jQuery objects. ";

    return msg;
}

Gridifier.Error.prototype._getSettingsInvalidGridTypeErrorMsg = function() {
    var msg = this._getErrorMsgPrefix();

    msg += "Wrong 'gridType' param value. Got: '" + this._getErrorParam() + "'. ";
    msg += "Available types: " + Gridifier.GRID_TYPES.VERTICAL_GRID;
    msg += ", " + Gridifier.GRID_TYPES.HORIZONTAL_GRID + ".";

    return msg;
}

Gridifier.Error.prototype._getSettingsInvalidPrependTypeErrorMsg = function() {
    var msg = this._getErrorMsgPrefix();

    msg += "Wrong 'prependType' param value. Got: '" + this._getErrorParam() + "'.";
    msg += "Available types: " + Gridifier.PREPEND_TYPES.MIRRORED_PREPEND;
    msg += " , " + Gridifier.PREPEND_TYPES.DEFAULT_PREPEND;
    msg += " , " + Gridifier.PREPEND_TYPES.REVERSED_PREPEND + ".";

    return msg;
}

Gridifier.Error.prototype._getSettingsInvalidAppendTypeErrorMsg = function() {
    var msg = this._getErrorMsgPrefix();

    msg += "Wrong 'appendType' param value. Got: '" + this._getErrorParam() + "'.";
    msg += "Available types: " + Gridifier.APPEND_TYPES.DEFAULT_APPEND;
    msg += " , " + Gridifier.APPEND_TYPES.REVERSED_APPEND + ".";

    return msg;
}

Gridifier.Error.prototype._getSettingsInvalidIntersectionStrategyErrorMsg = function() {
    var msg = this._getErrorMsgPrefix();

    msg += "Wrong 'intersectionStrategy' param value. Got: '" + this._getErrorParam() + "'.";
    msg += "Available strategies: " + Gridifier.INTERSECTION_STRATEGIES.DEFAULT;
    msg += " , " + Gridifier.INTERSECTION_STRATEGIES.REVERSED;

    return msg;
}

Gridifier.Error.prototype._getSettingsInvalidSortDispersionModeErrorMsg = function() {
    var msg = this._getErrorMsgPrefix();

    msg += "Wrong 'sortDispersionMode' param value. Got: '" + this._getErrorParam() + "'.";
    msg += "Available modes: " + Gridifier.SORT_DISPERSION_MODES.DISABLED;
    msg += " , " + Gridifier.SORT_DISPERSION_MODES.CUSTOM;
    msg += " , " + Gridifier.SORT_DISPERSION_MODES.CUSTOM_ALL_EMPTY_SPACE;

    return msg;
}

Gridifier.Error.prototype._getSettingsMissingSortDispersionValueErrorMsg = function() {
    var msg = this._getErrorMsgPrefix();

    msg += "You have chosen custom sort dispersion mode, but didn't provided required 'sortDispersionValue' param."
    return msg;
}

Gridifier.Error.prototype._getSettingsInvalidSortDispersionValueErrorMsg = function() {
    var msg = this._getErrorMsgPrefix();

    msg += "Wrong 'sortDispersionValue' param value. It must be a string with number as prefix, ";
    msg += "and px as postfix.(100px). Got: '" + this._getErrorParam() + "'.";

    return msg;
}

Gridifier.Error.prototype._getSettingsInvalidToggleSortOrFilterParamErrorMsg = function(paramName) {
    var msg = this._getErrorMsgPrefix();

    msg += "Wrong '" + paramName + "' param value. It must be a function(which will be used by default), ";
    msg += "or an object with key(function name)-value(function body) pairs. Got: '" + this._getErrorParam() + "'.";

    return msg;
}

Gridifier.Error.prototype._getSettingsInvalidOneOfFilterOrSortFunctionTypesErrorMsg = function(paramName) {
    var msg = this._getErrorMsgPrefix();

    msg += "Wrong one of the '" + paramName + "' functions. It must be a function. Got: '" + this._getErrorParam() + "'.";
    return msg;
}

Gridifier.Error.prototype._getSettingsInvalidOneOfToggleParamsErrorMsg = function() {
    var msg = this._getErrorMsgPrefix();

    msg += "Wrong one of the 'toggle' params. It must be an object with show and hide function definitions.";
    msg += " Got: '" + this._getErrorParam() + "'.";

    return msg;
}

Gridifier.Error.prototype._getSettingsInvalidSetterParamErrorMsg = function(functionName) {
    var msg = this._getErrorMsgPrefix();

    msg += "Can't set '" + functionName + "' with name '" + this._getErrorParam() + "'.";
    msg += " It is not registred in Gridifier.";

    return msg;
}

Gridifier.Error.prototype._getCollectorNotDomElementErrorMsg = function() {
    var msg = this._getErrorMsgPrefix();

    msg += "One of the added elements to Gridifier is not DOM Element. Got: '";
    msg += this._getErrorParam() + "'.";

    return msg;
}

Gridifier.Error.prototype._getItemNotAttachedToGridErrorMsg = function() {
    var msg = this._getErrorMsgPrefix();

    msg += "One of the appended/prepended items is not attached to grid. Item: '";
    msg += this._getErrorParam() + "'.";

    return msg;
}

Gridifier.Error.prototype._getItemWiderThanGridWidthErrorMsg = function() {
    var msg = this._getErrorMsgPrefix();
    var error = this._getErrorObjectParam();

    msg += "Item '" + error.item + "' is wider than grid. Grid type: 'Vertical Grid'. ";
    msg += "Grid width: '" + error.gridWidth + "px'. Item width: '" + error.itemWidth + "px'.";

    return msg;
}

Gridifier.Error.prototype._getItemTallerThatGridHeightErrorMsg = function() {
    var msg = this._getErrorMsgPrefix();
    var error = this._getErrorObjectParam();

    msg += "Item '" + error.item + "' is taller than grid. Grid type: 'Horizontal Grid'. ";
    msg += "Grid height: '" + error.gridHeight + "px'. Item height: '" + error.itemHeight + "px'.";
}

Gridifier.Error.prototype._getNoConnectionsErrorMsg = function() {
    var msg = this._getErrorMsgPrefix();

    msg += "Can't find any item, that was processed by Gridifier."
    return msg;
}

Gridifier.Error.prototype._getConnectionByItemNotFoundErrorMsg = function() {
    var msg = this._getErrorMsgPrefix();
    var error = this._getErrorObjectParam();

    msg += "Item, sizes of which were requested to transform, is not connected to Gridifier.\n";
    msg += "Transformed item: \n" + error.item + "\n";
    msg += "Gridifier items:\n";
    for(var i = 0; i < error.connections.length; i++)
        msg += error.connections[i] + "\n";

    return msg;
}

Gridifier.Error.prototype._getWrongTargetTransformationSizesErrorMsg = function() {
    var msg = this._getErrorMsgPrefix();
    var error = this._getErrorParam();

    msg += "Wrong target transformation sizes. 'transformSizes' function accepts 3 types of values:\n";
    msg += "    gridifier.transformSizes(item, '100px', '60%'); // px or % values\n";
    msg += "    gridifier.transformSizes(item, 100, 200); // values without postfix will be parsed as px value.";

    return msg;
}