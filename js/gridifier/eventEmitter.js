Gridifier.EventEmitter = function(gridifier) {
    var me = this;

    me._gridifier = null;

    me._showCallbacks = [];

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
}

Gridifier.EventEmitter.prototype.onShow = function(callbackFn) {
    this._showCallbacks.push(callbackFn);
}

// @todo -> Add off events
// @todo -> Think about event types 
//          (Otsilatj eventi -> onDelete, onResize, onAdd, onReady. Event proxy? (backbone, window).)

Gridifier.EventEmitter.prototype.emitShowEvent = function(item) {
    for(var i = 0; i < this._showCallbacks.length; i++) {
        this._showCallbacks[i](item);
    }
}