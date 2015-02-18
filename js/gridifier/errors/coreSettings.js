Gridifier.CoreSettingsErrors = function(error, errorType) {
    var me = this;

    this._error = null;
    this._isCoreSettingsError = false;
    this._errorMsg = "";

    this._css = {
    };

    this._construct = function() {
        me._error = error;
        me._isCoreSettingsError = false;
        me._errorMsg = "";

        me._parseIfIsCoreSettingsError(errorType);
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

Gridifier.CoreSettingsErrors.prototype.isCoreSettingsError = function() {
    return this._isCoreSettingsError;
}

Gridifier.CoreSettingsErrors.prototype.getErrorMessage = function() {
    return this._errorMsg;
}

Gridifier.CoreSettingsErrors.prototype._parseIfIsCoreSettingsError = function(errorType) {
    var errors = Gridifier.Error.ERROR_TYPES.SETTINGS;

    if(errorType == errors.INVALID_GRID_TYPE) {
        this._markAsCoreSettingsError();
        this._invalidGridTypeError();
    }
    else if(errorType == errors.INVALID_PREPEND_TYPE) {
        this._markAsCoreSettingsError();
        this._invalidPrependTypeError();
    }
    else if(errorType == errors.INVALID_APPEND_TYPE) {
        this._markAsCoreSettingsError();
        this._invalidAppendTypeError();
    }
    else if(errorType == errors.INVALID_INTERSECTION_STRATEGY) {
        this._markAsCoreSettingsError();
        this._invalidIntersectionStrategyError();
    }
    else if(errorType == errors.INVALID_ALIGNMENT_TYPE) {
        this._markAsCoreSettingsError();
        this._invalidAlignmentTypeError();
    }
    else if(errorType == errors.INVALID_SORT_DISPERSION_MODE) {
        this._markAsCoreSettingsError();
        this._invalidSortDispersionModeError();
    }
    else if(errorType == errors.MISSING_SORT_DISPERSION_VALUE) {
        this._markAsCoreSettingsError();
        this._missingSortDispersionValueError();
    }
    else if(errorType == errors.INVALID_SORT_DISPERSION_VALUE) {
        this._markAsCoreSettingsError();
        this._invalidSortDispersionValueError();
    }
}

Gridifier.CoreSettingsErrors.prototype._markAsCoreSettingsError = function() {
    this._isCoreSettingsError = true;
}

Gridifier.CoreSettingsErrors.prototype._invalidGridTypeError = function() {
    var msg = this._error.getErrorMsgPrefix();

    msg += "Wrong 'gridType' param value. Got: '" + this._error.getErrorParam() + "'. ";
    msg += "Available types: " + Gridifier.GRID_TYPES.VERTICAL_GRID;
    msg += ", " + Gridifier.GRID_TYPES.HORIZONTAL_GRID + ".";

    this._errorMsg = msg;
}

Gridifier.CoreSettingsErrors.prototype._invalidPrependTypeError = function() {
    var msg = this._error.getErrorMsgPrefix();

    msg += "Wrong 'prependType' param value. Got: '" + this._error.getErrorParam() + "'. ";
    msg += "Available types: " + Gridifier.PREPEND_TYPES.MIRRORED_PREPEND;
    msg += " , " + Gridifier.PREPEND_TYPES.DEFAULT_PREPEND;
    msg += " , " + Gridifier.PREPEND_TYPES.REVERSED_PREPEND + ".";

    this._errorMsg = msg;
}

Gridifier.CoreSettingsErrors.prototype._invalidAppendTypeError = function() {
    var msg = this._error.getErrorMsgPrefix();

    msg += "Wrong 'appendType' param value. Got: '" + this._error.getErrorParam() + "'. ";
    msg += "Available types: " + Gridifier.APPEND_TYPES.DEFAULT_APPEND;
    msg += " , " + Gridifier.APPEND_TYPES.REVERSED_APPEND + ".";

    this._errorMsg = msg;
}

Gridifier.CoreSettingsErrors.prototype._invalidIntersectionStrategyError = function() {
    var msg = this._error.getErrorMsgPrefix();

    msg += "Wrong 'intersectionStrategy' param value. Got: '" + this._error.getErrorParam() + "'. ";
    msg += "Available strategies: " + Gridifier.INTERSECTION_STRATEGIES.DEFAULT;
    msg += " , " + Gridifier.INTERSECTION_STRATEGIES.REVERSED;

    this._errorMsg = msg;
}

Gridifier.CoreSettingsErrors.prototype._invalidAlignmentTypeError = function() {
    var msg = this._error.getErrorMsgPrefix();

    var alignmentTypes = Gridifier.INTERSECTION_STRATEGY_ALIGNMENT_TYPES;
    var verticalAlignmentTypes = alignmentTypes.FOR_VERTICAL_GRID;
    var horizontalAlignmentTypes = alignmentTypes.FOR_HORIZONTAL_GRID;

    msg += "Wrong 'alignmentType' param value. Got: '" + this._error.getErrorParam() + "'. ";
    msg += "Available values: ";
    msg += verticalAlignmentTypes.TOP + ", ";
    msg += verticalAlignmentTypes.CENTER + ", ";
    msg += verticalAlignmentTypes.BOTTOM + "(For vertical grids), ";
    msg += horizontalAlignmentTypes.LEFT + ", ";
    msg += horizontalAlignmentTypes.CENTER + ", ";
    msg += horizontalAlignmentTypes.RIGHT + "(For horizontal grids). ";

    this._errorMsg = msg;
}

Gridifier.CoreSettingsErrors.prototype._invalidSortDispersionModeError = function() {
    var msg = this._error.getErrorMsgPrefix();

    msg += "Wrong 'sortDispersionMode' param value. Got: '" + this._error.getErrorParam() + "'. ";
    msg += "Available modes: " + Gridifier.SORT_DISPERSION_MODES.DISABLED;
    msg += " , " + Gridifier.SORT_DISPERSION_MODES.CUSTOM;
    msg += " , " + Gridifier.SORT_DISPERSION_MODES.CUSTOM_ALL_EMPTY_SPACE;

    this._errorMsg = msg;
}

Gridifier.CoreSettingsErrors.prototype._missingSortDispersionModeError = function() {
    var msg = this._error.getErrorMsgPrefix();
    msg += "You have chosen custom sort dispersion mode, but didn't provided required 'sortDispersionValue' param."
    
    this._errorMsg = msg;
}

Gridifier.CoreSettingsErrors.prototype._invalidSortDispersionValueError = function() {
    var msg = this._error.getErrorMsgPrefix();

    msg += "Wrong 'sortDispersionValue' param value. It must be a string with number as prefix, ";
    msg += "and px as postfix.(100px). Got: '" + this._error.getErrorParam() + "'.";

    this._errorMsg = msg;
}