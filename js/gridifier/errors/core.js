Gridifier.CoreErrors = function(error, errorType) {
    var me = this;

    this._error = null;
    this._isCoreError = false;
    this._errorMsg = "";

    this._css = {
    };

    this._construct = function() {
        me._error = error;
        me._isCoreError = false;
        me._errorMsg = "";

        me._parseIfIsCoreError(errorType);
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

Gridifier.CoreErrors.prototype.isCoreError = function() {
    return this._isCoreError;
}

Gridifier.CoreErrors.prototype.getErrorMessage = function() {
    return this._errorMsg;
}

Gridifier.CoreErrors.prototype._parseIfIsCoreError = function(errorType) {
    var errors = Gridifier.Error.ERROR_TYPES;

    if(errorType == errors.EXTRACT_GRID) {
        this._markAsCoreError();
        this._notDomElementError();
    }
    else if(errorType == errors.CONNECTIONS.NO_CONNECTIONS) {
        this._markAsCoreError();
        this._noConnectionsError();
    }
    else if(errorType == errors.CONNECTIONS.CONNECTION_BY_ITEM_NOT_FOUND) {
        this._markAsCoreError();
        this._connectionByItemNotFoundError();
    }
    else if(errorType == errors.SIZES_TRANSFORMER.WRONG_TARGET_TRANSFORMATION_SIZES) {
        this._markAsCoreError();
        this._wrongTargetTransformationSizesError();
    }
    else if(errorType == errors.APPENDER.WRONG_INSERT_BEFORE_TARGET_ITEM) {
        this._markAsCoreError();
        this._wrongInsertBeforeTargetItem();
    }
    else if(errorType == errors.APPENDER.WRONG_INSERT_AFTER_TARGET_ITEM) {
        this._markAsCoreError();
        this._wrongInsertAfterTargetItem();
    }
}

Gridifier.CoreErrors.prototype._markAsCoreError = function() {
    this._isCoreError = true;
}

Gridifier.CoreErrors.prototype._notDomElementError = function() {
    var msg = this._error.getErrorMsgPrefix();
    
    msg += "Can't get grid layout DOM element. Currently gridifier supports ";
    msg += "native DOM elements, as well as jQuery objects. ";

    this._errorMsg = msg;
}

Gridifier.CoreErrors.prototype._noConnectionsError = function() {
    var msg = this._error.getErrorMsgPrefix();
    msg += "Can't find any item, that was processed by Gridifier.";

    this._errorMsg = msg;
}

Gridifier.CoreErrors.prototype._connectionByItemNotFoundError = function() {
    var msg = this._error.getErrorMsgPrefix();
    var error = this._error.getErrorObjectParam();

    msg += "Can't find connection by item.\n";
    msg += "Item: \n" + error.item + "\n";
    msg += "Connections:\n";
    for(var i = 0; i < error.connections.length; i++)
        msg += error.connections[i] + "\n";

    this._errorMsg = msg;
}

Gridifier.CoreErrors.prototype._wrongTargetTransformationSizesError = function() {
    var msg = this._error.getErrorMsgPrefix();
    var error = this._error.getErrorParam();

    msg += "Wrong target transformation sizes. 'transformSizes' and 'toggleSizes' functions accepts 4 types of values:\n";
    msg += "    gridifier.transformSizes(item, '100px', '60%'); // px or % values\n";
    msg += "    gridifier.transformSizes(item, 100, 200.5); // values without postfix will be parsed as px value.";
    msg += "    gridifier.transformSizes(item, '*2', '/0.5'); // values with multiplication or division expressions.";

    this._errorMsg = msg;
}

Gridifier.CoreErrors.prototype._wrongInsertBeforeTargetItem = function() {
    var msg = this._error.getErrorMsgPrefix();
    var error = this._error.getErrorParam();

    msg += "Wrong target item passed to the insertBefore function. It must be item, which was processed by gridifier. ";
    msg += "Got: " + error + ".";

    this._errorMsg = msg;
}

Gridifier.CoreErrors.prototype._wrongInsertAfterTargetItem = function() {
    var msg = this._error.getErrorMsgPrefix();
    var error = this._error.getErrorParam();

    msg += "Wrong target item passed to the insertAfter function. It must be item, which was processed by gridifier. ";
    msg += "Got: " + error + ".";

    this._errorMsg = msg;
}