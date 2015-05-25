Gridifier.EventEmitter = function(gridifier) {
    var me = this;

    me._gridifier = null;

    me._showCallbacks = [];
    me._hideCallbacks = [];
    me._gridSizesChangeCallbacks = [];
    me._transformCallbacks = [];
    me._gridRetransformCallbacks = [];
    me._connectionCreateCallbacks = [];
    me._disconnectCallbacks = [];
    me._insertCallbacks = [];
    me._insertEventTimeout = null;

    me._dragEndCallbacks = [];

    me._kernelCallbacks = {
        itemsReappendExecutionEndPerDragifier: null,
        beforeItemShowPerRetransformSorter: null
    };

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
    this._gridifier.onGridRetransform = function(callbackFn) { me.onGridRetransform.call(me, callbackFn); };
    this._gridifier.onConnectionCreate = function(callbackFn) { me.onConnectionCreate.call(me, callbackFn); };
    this._gridifier.onDisconnect = function(callbackFn) { me.onDisconnect.call(me, callbackFn); };
    this._gridifier.onInsert = function(callbackFn) { me.onInsert.call(me, callbackFn); };

    this._gridifier.onDragEnd = function(callbackFn) { me.onDragEnd.call(me, callbackFn); };
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

Gridifier.EventEmitter.prototype.onGridRetransform = function(callbackFn) {
    this._gridRetransformCallbacks.push(callbackFn);
}

Gridifier.EventEmitter.prototype.onGridSizesChange = function(callbackFn) {
    this._gridSizesChangeCallbacks.push(callbackFn);
}

Gridifier.EventEmitter.prototype.onConnectionCreate = function(callbackFn) {
    this._connectionCreateCallbacks.push(callbackFn);
}

Gridifier.EventEmitter.prototype.onDisconnect = function(callbackFn) {
    this._disconnectCallbacks.push(callbackFn);
}

Gridifier.EventEmitter.prototype.onInsert = function(callbackFn) {
    this._insertCallbacks.push(callbackFn);
}

Gridifier.EventEmitter.prototype.onDragEnd = function(callbackFn) {
    this._dragEndCallbacks.push(callbackFn);
}

Gridifier.EventEmitter.prototype.onItemsReappendExecutionEndPerDragifier = function(callbackFn) {
    this._kernelCallbacks.itemsReappendExecutionEndPerDragifier = callbackFn;
}

Gridifier.EventEmitter.prototype.onBeforeShowPerRetransformSorter = function(callbackFn) {
    this._kernelCallbacks.beforeItemShowPerRetransformSorter = callbackFn;
}

Gridifier.EventEmitter.prototype.emitShowEvent = function(item) {
    for(var i = 0; i < this._showCallbacks.length; i++) {
        this._showCallbacks[i](item);

        if(this._gridifier.hasItemBindedClone(item)) {
            var itemClone = this._gridifier.getItemClone(item);
            this._showCallbacks[i](item);
        }
    }
}

Gridifier.EventEmitter.prototype.emitHideEvent = function(item) {
    for(var i = 0; i < this._hideCallbacks.length; i++) {
        this._hideCallbacks[i](item);

        if(this._gridifier.hasItemBindedClone(item)) {
            var itemClone = this._gridifier.getItemClone(item);
            this._hideCallbacks[i](item);
        }
    }

    var collector = this._gridifier.getCollector();
    if(collector.isItemRestrictedToCollect(item)) {
        for(var j = 0; j < this._disconnectCallbacks.length; j++)
            this._disconnectCallbacks[j](item);
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

Gridifier.EventEmitter.prototype.emitGridRetransformEvent = function() {
    for(var i = 0; i < this._gridRetransformCallbacks.length; i++) {
        this._gridRetransformCallbacks[i]();
    }
}

Gridifier.EventEmitter.prototype.emitConnectionCreateEvent = function(connections) {
    for(var i = 0; i < this._connectionCreateCallbacks.length; i++) {
        // A little delay here is required per usage with silentRender
        // immediately after silentAppend.
        (function(callback, connections) {
            setTimeout(function() {
                callback(connections);
            }, 0);
        })(this._connectionCreateCallbacks[i], connections);
    }
}

Gridifier.EventEmitter.prototype.emitInsertEvent = function() {
    var emitEvent = function() {
        for(var i = 0; i < this._insertCallbacks.length; i++) {
            this._insertCallbacks[i]();
        }
    }

    if(this._insertEventTimeout != null) {
        clearTimeout(this._insertEventTimeout);
        this._insertEventTimeout = null;
    }

    var me = this;
    this._insertEventTimeout = setTimeout(function() {
        emitEvent.call(me);
    }, 20);
}

Gridifier.EventEmitter.prototype.emitDragEndEvent = function(sortedItems) {
    for(var i = 0; i < this._dragEndCallbacks.length; i++) {
        this._dragEndCallbacks[i](sortedItems);
    }
}

Gridifier.EventEmitter.prototype.emitItemsReappendExecutionEndPerDragifier = function() {
    if(this._kernelCallbacks.itemsReappendExecutionEndPerDragifier != null) {
        this._kernelCallbacks.itemsReappendExecutionEndPerDragifier();
        this._kernelCallbacks.itemsReappendExecutionEndPerDragifier = null;
    }
}

Gridifier.EventEmitter.prototype.emitBeforeShowPerRetransformSortEvent = function() {
    if(this._kernelCallbacks.beforeItemShowPerRetransformSorter != null)
        this._kernelCallbacks.beforeItemShowPerRetransformSorter();
}