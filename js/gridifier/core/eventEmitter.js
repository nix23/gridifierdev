Gridifier.EventEmitter = function(gridifier) {
    var me = this;

    me._gridifier = null;

    me._showCallbacks = [];
    me._hideCallbacks = [];
    me._gridSizesChangeCallbacks = [];
    me._transformCallbacks = [];
    me._connectionCreateCallbacks = [];

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._bindEmitterToGridifier();
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

Gridifier.EventEmitter.prototype._bindEmitterToGridifier = function() {
    var me = this;
    this._gridifier.onShow = function(callbackFn) { me.onShow.call(me, callbackFn); };
    this._gridifier.onHide = function(callbackFn) { me.onHide.call(me, callbackFn); };
    this._gridifier.onGridSizesChange = function(callbackFn) { me.onGridSizesChange.call(me, callbackFn); };
    this._gridifier.onTransform = function(callbackFn) { me.onTransform.call(me, callbackFn); };
    this._gridifier.onConnectionCreate = function(callbackFn) { me.onConnectionCreate.call(me, callbackFn); };
}

Gridifier.EventEmitter.prototype.onShow = function(callbackFn) {
    this._showCallbacks.push(callbackFn);
}

Gridifier.EventEmitter.prototype.onHide = function(callbackFn) {
    this._hideCallbacks.push(callbackFn);
}

Gridifier.EventEmitter.prototype.onTransform = function(callbackFn) {
    this._transformCallbacks.push(callbackFn);
}

Gridifier.EventEmitter.prototype.onGridSizesChange = function(callbackFn) {
    this._gridSizesChangeCallbacks.push(callbackFn);
}

Gridifier.EventEmitter.prototype.onConnectionCreate = function(callbackFn) {
    this._connectionCreateCallbacks.push(callbackFn);
}

Gridifier.EventEmitter.prototype.emitShowEvent = function(item) {
    for(var i = 0; i < this._showCallbacks.length; i++) {
        this._showCallbacks[i](item);
    }
}

Gridifier.EventEmitter.prototype.emitHideEvent = function(item) {
    for(var i = 0; i < this._hideCallbacks.length; i++) {
        this._hideCallbacks[i](item);
    }
}

Gridifier.EventEmitter.prototype.emitGridSizesChangeEvent = function() {
    for(var i = 0; i < this._gridSizesChangeCallbacks.length; i++) {
        this._gridSizesChangeCallbacks[i]();
    }
}

Gridifier.EventEmitter.prototype.emitTransformEvent = function(item, newWidth, newHeight, newLeft, newTop) {
    for(var i = 0; i < this._transformCallbacks.length; i++) {
        this._transformCallbacks[i](item, newWidth, newHeight, newLeft, newTop);
    }
}

Gridifier.EventEmitter.prototype.emitConnectionCreateEvent = function(connections) {
    for(var i = 0; i < this._connectionCreateCallbacks.length; i++) {
        this._connectionCreateCallbacks[i](connections);
    }
}