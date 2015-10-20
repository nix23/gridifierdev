var RendererQueue = function() {
    // Array[
    //     [0] => {cn: cn, op: op, left: left, top: top}, ..., n
    // ]
    this._queue = null;
    this._queueTimeout = null;
}

proto(RendererQueue, {
    _reinit: function() {
        if(this._queue == null)
            this._queue = [];
        else
            clearTimeout(this._queueTimeout);
    },

    schedule: function(op, cn, left, top, delay) {
        this._reinit();
        if(op == RENDER_OPS.SHOW && silentRenderer.isScheduled(cn.item))
            return;

        var me = this;
        this._queue.push({
            op: op, cn: cn, left: left, top: top, delay: delay
        });
        this._queueTimeout = setTimeout(function() {
            me._process.call(me);
        }, C.RENDER_QUEUE_DELAY);
    },

    _getApi: function() {
        return {
            toggle: toggleApi,
            cc: settings.getApi("coordsChanger"),
            grid: grid.get(),
            sr: SizesResolver,
            srManager: srManager,
            collect: collector,
            prefix: Prefixer,
            dom: Dom,
            getS: bind("get", settings),
            EVENT: EV,
            TOGGLE: TOGGLE,
            ROTATE: ROTATE
        };
    },

    _process: function() {
        for(var i = 0; i < this._queue.length; i++) {
            var r = this._queue[i];
            if(silentRenderer.isScheduled(r.cn.item))
                continue;

            if(r.op == RENDER_OPS.SHOW) {
                // Render could be called after disconnect(Through timeouts)
                if(!gridItem.isConnected(r.cn.item)) continue;
                var fn = "show";
            }
            else
                var fn = (r.op == RENDER_OPS.HIDE) ? "hide" : "render";

            this["_" + fn](r.cn, r.left, r.top, this._getApi(), r.op, r.delay);
        }

        grid.scheduleResize();
        this._queue = null;
    },

    _show: function(cn, left, top, api) {
        var getS = bind("get", settings);

        api.dom.css.set(cn.item, {
            position: "absolute", left: left, top: top
        });

        // Due to the bags, caused by setting multiple transform properties sequentially,
        // we should preinit item with all transform rules, which will be used in coords changers.
        // Scale always should be first(otherwise animation will break), translates should be also
        // setted up with SINGLE rule at start. Thus, they can be overriden later. Otherwise,
        // animation will break.
        settings.getApi("coordsChanger")(
            cn.item, left, top, getS("coordsChangeTime"),
            getS("coordsChangeTiming"), api.dom, api.prefix, getS, true
        );
        ev.emitInternal(INT_EV.BEFORE_SHOW_FOR_RSORT);

        settings.getApi("toggle").show(
            cn.item, left, top, getS("toggleTime"), getS("toggleTiming"),
            ev, toggleSyncerApi, api.dom, api, {x1: left, y1: top}
        );
    },

    _hide: function(cn, left, top, api) {
        var getS = bind("get", settings);

        renderer.unmarkAsSchToHide(cn.item);
        settings.getApi("toggle").hide(
            cn.item, left, top, getS("toggleTime"), getS("toggleTiming"),
            ev, toggleSyncerApi, api.dom, api, {x1: left, y1: top}
        );
    },

    _render: function(cn, left, top, api, op, delay) {
        var me = this;

        if(op == RENDER_OPS.RENDER)
            this._execRender(cn.item, left, top, api);
        else {
            setTimeout(function() {
                // Because of using this delayed timeout we should find item connection again.
                // There could be a bunch of resizes since this delayedRender schedule, so this
                // item connection can point to the old version of the connection.
                var newCn = cnsCore.find(cn.item, true);
                if(newCn == null) return;

                me._execRender(newCn.item, rendererCns.left(newCn), rendererCns.top(newCn), api);
            }, delay);
        }
    },

    _execRender: function(item, left, top, api) {
        var getS = bind("get", settings);

        if(Dom.has(item, TOGGLE.IS_ACTIVE_WITH_CC)) {
            var time = getS("toggleTime");
            var timing = getS("toggleTiming");
        }
        else {
            var time = getS("coordsChangeTime");
            var timing = getS("coordsChangeTiming");
        }

        settings.getApi("coordsChanger")(
            item, left, top, time, timing, api.dom, api.prefix, getS
        );
    }
});