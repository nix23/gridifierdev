Gridifier.CollectorErrors = function(error, errorType) {
    var me = this;

    this._error = null;
    this._isCollectorError = false;
    this._errorMsg = "";

    this._css = {
    };

    this._construct = function() {
        me._error = error;
        me._isCollectorError = false;
        me._errorMsg = "";

        me._parseIfIsCollectorError(errorType);
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

Gridifier.CollectorErrors.prototype.isCollectorError = function() {
    return this._isCollectorError;
}

Gridifier.CollectorErrors.prototype.getErrorMessage = function() {
    return this._errorMsg;
}

Gridifier.CollectorErrors.prototype._parseIfIsCollectorError = function(errorType) {
    var errors = Gridifier.Error.ERROR_TYPES.COLLECTOR;

    if(errorType == errors.NOT_DOM_ELEMENT) {
        this._markAsCollectorError();
        this._notDomElementError();
    }
    else if(errorType == errors.ITEM_NOT_ATTACHED_TO_GRID) {
        this._markAsCollectorError();
        this._itemNotAttachedToGridError();
    }
    else if(errorType == errors.ITEM_NOT_CONNECTED_TO_GRID) {
        this._markAsCollectorError();
        this._itemNotConnectedToGridError();
    }
    else if(errorType == errors.ITEM_WIDER_THAN_GRID_WIDTH) {
        this._markAsCollectorError();
        this._itemWiderThanGridWidthError();
    }
    else if(errorType == errors.ITEM_TALLER_THAN_GRID_HEIGHT) {
        this._markAsCollectorError();
        this._itemTallerThanGridHeightError();
    }
}

Gridifier.CollectorErrors.prototype._markAsCollectorError = function() {
    this._isCollectorError = true;
}

Gridifier.CollectorErrors.prototype._notDomElementError = function() {
    var msg = this._error.getErrorMsgPrefix();

    msg += "One of the added elements to Gridifier is not DOM Element. Got: '";
    msg += this._error.getErrorParam() + "'.";

    this._errorMsg = msg;
}

Gridifier.CollectorErrors.prototype._itemNotAttachedToGridError = function() {
    var msg = this._error.getErrorMsgPrefix();

    msg += "One of the appended/prepended items is not attached to grid. Item: '";
    msg += this._error.getErrorParam() + "'.";

    this._errorMsg = msg;
}

Gridifier.CollectorErrors.prototype._itemNotConnectedToGridError = function() {
    var msg = this._error.getErrorMsgPrefix();

    msg += "One of items is not connected to grid. Item: '";
    msg += this._error.getErrorParam() + "'.";

    this._errorMsg = msg;
}

Gridifier.CollectorErrors.prototype._itemWiderThanGridWidthError = function() {
    var msg = this._error.getErrorMsgPrefix();
    var error = this._error.getErrorObjectParam();

    msg += "Item '" + error.item + "' is wider than grid. Grid type: 'Vertical Grid'. ";
    msg += "Grid width: '" + error.gridWidth + "px'. Item width: '" + error.itemWidth + "px'.";

    this._errorMsg = msg;
}

Gridifier.CollectorErrors.prototype._itemTallerThanGridHeightError = function() {
    var msg = this._error.getErrorMsgPrefix();
    var error = this._error.getErrorObjectParam();

    msg += "Item '" + error.item + "' is taller than grid. Grid type: 'Horizontal Grid'. ";
    msg += "Grid height: '" + error.gridHeight + "px'. Item height: '" + error.itemHeight + "px'.";

    this._errorMsg = msg;
}