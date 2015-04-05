Gridifier.ApiSettingsErrors = function(error, errorType) {
    var me = this;

    this._error = null;
    this._isApiSettingsError = false;
    this._errorMsg = "";

    this._css = {
    };

    this._construct = function() {
        me._error = error;
        me._isApiSettingsError = false;
        me._errorMsg = "";

        me._parseIfIsApiSettingsError(errorType);
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

Gridifier.ApiSettingsErrors.prototype.isApiSettingsError = function() {
    return this._isApiSettingsError;
}

Gridifier.ApiSettingsErrors.prototype.getErrorMessage = function() {
    return this._errorMsg;
}

Gridifier.ApiSettingsErrors.prototype._parseIfIsApiSettingsError = function(errorType) {
    var errors = Gridifier.Error.ERROR_TYPES.SETTINGS;

    if(errorType == errors.INVALID_ONE_OF_TOGGLE_PARAMS) {
        this._markAsApiSettingsError();
        this._invalidOneOfToggleParamsError();
    }
    else if(errorType == errors.INVALID_ONE_OF_SORT_FUNCTION_TYPES ||
            errorType == errors.INVALID_ONE_OF_RETRANSFORM_SORT_FUNCTION_TYPES ||
            errorType == errors.INVALID_ONE_OF_FILTER_FUNCTION_TYPES ||
            errorType == errors.INVALID_ONE_OF_COORDS_CHANGER_FUNCTION_TYPES ||
            errorType == errors.INVALID_ONE_OF_SIZES_CHANGER_FUNCTION_TYPES ||
            errorType == errors.INVALID_ONE_OF_DRAGGABLE_ITEM_DECORATOR_FUNCTION_TYPES) {
        this._markAsApiSettingsError();

        if(errorType == errors.INVALID_ONE_OF_SORT_FUNCTION_TYPES) {
            var paramName = "sort";
        }
        else if(errorType == errors.INVALID_ONE_OF_RETRANSFORM_SORT_FUNCTION_TYPES) {
            var paramName = "retransformSort";
        }
        else if(errorType == errors.INVALID_ONE_OF_FILTER_FUNCTION_TYPES) {
            var paramName = "filter";
        }
        else if(errorType == errors.INVALID_ONE_OF_COORDS_CHANGER_FUNCTION_TYPES) {
            var paramName = "coordsChanger";
        }
        else if(errorType == errors.INVALID_ONE_OF_SIZES_CHANGER_FUNCTION_TYPES) {
            var paramName = "sizesChanger";
        }
        else if(errorType == errors.INVALID_ONE_OF_DRAGGABLE_ITEM_DECORATOR_FUNCTION_TYPES) {
            var paramName = "draggableItemDecorator";
        }

        this._invalidOneOfFunctionTypesError(paramName);
    }
    else if(errorType == errors.INVALID_TOGGLE_PARAM_VALUE || 
            errorType == errors.INVALID_SORT_PARAM_VALUE ||
            errorType == errors.INVALID_RETRANSFORM_SORT_PARAM_VALUE ||
            errorType == errors.INVALID_FILTER_PARAM_VALUE ||
            errorType == errors.INVALID_COORDS_CHANGER_PARAM_VALUE ||
            errorType == errors.INVALID_SIZES_CHANGER_PARAM_VALUE ||
            errorType == errors.INVALID_DRAGGABLE_ITEM_DECORATOR_PARAM_VALUE) {
        this._markAsApiSettingsError();

        if(errorType == errors.INVALID_TOGGLE_PARAM_VALUE) {
            var paramName = "toggle";
        }
        else if(errorType == errors.INVALID_SORT_PARAM_VALUE) {
            var paramName = "sort";
        }
        else if(errorType == errors.INVALID_RETRANSFORM_SORT_PARAM_VALUE) {
            var paramName = "retransformSort";
        }
        else if(errorType == errors.INVALID_FILTER_PARAM_VALUE) {
            var paramName = "filter";
        }
        else if(errorType == errors.INVALID_COORDS_CHANGER_PARAM_VALUE) {
            var paramName = "coordsChanger";
        }
        else if(errorType == errors.INVALID_SIZES_CHANGER_PARAM_VALUE) {
            var paramName = "sizesChanger";
        }
        else if(errorType == errors.INVALID_DRAGGABLE_ITEM_DECORATOR_PARAM_VALUE) {
            var paramName = "draggableItemDecorator";
        }

        this._invalidParamValueError(paramName);
    }
    else if(errorType == errors.SET_TOGGLE_INVALID_PARAM || 
            errorType == errors.SET_FILTER_INVALID_PARAM ||
            errorType == errors.SET_SORT_INVALID_PARAM ||
            errorType == errors.SET_RETRANSFORM_SORT_INVALID_PARAM ||
            errorType == errors.SET_COORDS_CHANGER_INVALID_PARAM ||
            errorType == errors.SET_SIZES_CHANGER_INVALID_PARAM ||
            errorType == errors.SET_DRAGGABLE_ITEM_DECORATOR_INVALID_PARAM) {
        this._markAsApiSettingsError();

        if(errorType == errors.SET_TOGGLE_INVALID_PARAM) {
            var functionName = "toggle";
        }
        else if(errorType == errors.SET_FILTER_INVALID_PARAM) {
            var functionName = "filter";
        }
        else if(errorType == errors.SET_SORT_INVALID_PARAM) {
            var functionName = "sort";
        }
        else if(errorType == errors.SET_RETRANSFORM_SORT_INVALID_PARAM) {
            var functionName = "retransformSort";
        }
        else if(errorType == errors.SET_COORDS_CHANGER_INVALID_PARAM) {
            var functionName = "coordsChanger";
        }
        else if(errorType == errors.SET_SIZES_CHANGER_INVALID_PARAM) {
            var functionName = "sizesChanger";
        }
        else if(errorType == errors.SET_DRAGGABLE_ITEM_DECORATOR_INVALID_PARAM) {
            var functionName = "draggableItemDecorator";
        }

        this._invalidSetterParamError(functionName);
    }
}

Gridifier.ApiSettingsErrors.prototype._markAsApiSettingsError = function() {
    this._isApiSettingsError = true;
}

Gridifier.ApiSettingsErrors.prototype._invalidOneOfToggleParamsError = function() {
    var msg = this._error.getErrorMsgPrefix();

    msg += "Wrong one of the 'toggle' params. It must be an object with show and hide function definitions.";
    msg += " Got: '" + this._error.getErrorParam() + "'.";

    this._errorMsg = msg;
}

Gridifier.ApiSettingsErrors.prototype._invalidOneOfFunctionTypesError = function(paramName) {
    var msg = this._error.getErrorMsgPrefix();
    msg += "Wrong one of the '" + paramName + "' functions. It must be a function. Got: '" + this._error.getErrorParam() + "'.";
    
    this._errorMsg = msg;
}

Gridifier.ApiSettingsErrors.prototype._invalidParamValueError = function(paramName) {
    var msg = this._error.getErrorMsgPrefix();

    msg += "Wrong '" + paramName + "' param value. It must be a function(which will be used by default), ";
    msg += "or an object with key(function name)-value(function body) pairs. Got: '" + this._error.getErrorParam() + "'.";

    this._errorMsg = msg;
}

Gridifier.ApiSettingsErrors.prototype._invalidSetterParamError = function(functionName) {
    var msg = this._error.getErrorMsgPrefix();

    msg += "Can't set '" + functionName + "' with name '" + this._error.getErrorParam() + "'.";
    msg += " It is not registred in Gridifier.";

    this._errorMsg = msg;
}