var EventEmitter = function() {
    this._callbacks = {};
    this._insertEvTimeout = null;

    this._init();
}

proto(EventEmitter, {
    _init: function() {
        var me = this;

        var init = function(evObj, initNull, evTarget) {
            for(var prop in evObj) {
                var evName = evObj[prop];
                this._callbacks[evName] = (initNull) ? null : [];

                (function(evName) {
                    evTarget["on" + evName] = function(cb) {
                        if(!initNull)
                            me._callbacks[evName].push(cb);
                        else
                            me._callbacks[evName] = cb;
                    }
                })(evName);
            }
        }

        init.call(me, EV, false, gridifier);
        init.call(me, INT_EV, true, me);
    },

    _getArgs: function(evObj, evName, origArgs) {
        if(!Dom.hasVal(evObj, evName))
            err("no " + evName + " to emit");

        var args = [];
        Array.prototype.push.apply(args, origArgs);
        args.shift();

        return args;
    },

    emit: function(evName) {
        var args = this._getArgs(EV, evName, arguments);
        var me = this;

        if(evName == EV.INSERT) {
            this._emitInsertEvent(args[0]);
            return;
        }

        for(var i = 0; i < this._callbacks[evName].length; i++) {
            if(evName == EV.REPOSITION || evName == EV.REPOSITION_END) {
                (function(cb, args) {
                    // Delay for silentRender() call imm-ly after silentAppend()
                    setTimeout(function() { cb.apply(me, args); }, 0);
                })(this._callbacks[evName][i], args);
            }
            else
                this._callbacks[evName][i].apply(this, args);
        }

        if(evName == EV.HIDE && collector.isNotCollectable(args[0])) {
            for(var i = 0; i < this._callbacks[EV.DISCONNECT].length; i++)
                this._callbacks[EV.DISCONNECT][i](args[0]);
        }
    },

    _emitInsertEvent: function(items) {
        var emit = function(items) {
            for(var i = 0; i < this._callbacks[EV.INSERT].length; i++)
                this._callbacks[EV.INSERT][i](items);
        }

        if(this._insertEvTimeout != null) {
            clearTimeout(this._insertEvTimeout);
            this._insertEvTimeout = null;
            items = items.concat(this._insertEvItems);
        }

        var me = this;
        this._insertEvItems = items;
        this._insertEvTimeout = setTimeout(function() {
            me._insertEvTimeout = null;
            emit.call(me, items);
        }, 20);
    },

    emitInternal: function(evName) {
        var args = this._getArgs(INT_EV, evName, arguments);
        if(this._callbacks[evName] == null) return;

        this._callbacks[evName].apply(this, args);
        if(evName == INT_EV.REPOSITION_END_FOR_DRAG)
            this._callbacks[evName] = null;
    },

    rmInternal: function(evName) {
        this._getArgs(INT_EV, evName, arguments);
        this._callbacks[evName] = null;
    }
});