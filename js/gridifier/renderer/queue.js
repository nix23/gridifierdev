var RendererQueue = function() {
    // Array[
    //     [0] => {cn: cn, op: op, left: left, top: top}, ..., n
    // ]
    this._queue = null;
    this._queueTimeout = null;
}

proto(RendererQueue, {
    reinit: function() {
        if(this._queue == null)
            this._queue = [];
        else
            clearTimeout(this._queueTimeout);
    },

    schedule: function(op, cn, left, top, delay) {
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

    _process: function() {
        var getS = bind("get", settings);
        var getApi = bind("getApi", settings);
        var api = {
            toggle: toggleApi,
            cc: getApi("coordsChanger"),
            grid: grid.get(),
            sr: SizesResolver,
            srManager: srManager,
            collect: collector,
            prefix: Prefixer,
            getS: getS,
            EVENT: EV,
            TOGGLE: TOGGLE,
            ROTATE: ROTATE
        };

        for(var i = 0; i < this._queue.length; i++) {
            var r = this._queue[i];
            if(silentRenderer.isScheduled(r.cn.item))
                continue;

            if(r.op == RENDER_OPS.SHOW) {
                // Render could be called after disconnect(Through timeouts)
                if(!gridItem.isConnected(r.cn.item))
                    continue;

                Dom.css.set(r.cn.item, {
                    position: "absolute", left: r.left, top: r.top
                });

                // Due to the bags, caused by setting multiple transform properties sequentially,
                // we should preinit item with all transform rules, which will be used in coords changers.
                // Scale always should be first(otherwise animation will break), translates should be also
                // setted up with SINGLE rule at start. Thus, they can be overriden later. Otherwise,
                // animation will break.
                getApi("coordsChanger")(
                    r.cn.item, r.left, r.top, getS("coordsChangeTime"),
                    getS("coordsChangeTiming"), Dom, Prefixer, getS, true
                );
                ev.emitInternal(INT_EV.BEFORE_SHOW_FOR_RSORT);

                getApi("toggle").show(
                    r.cn.item, r.left, r.top, getS("toggleTime"), getS("toggleTiming"),
                    ev, toggleSyncerApi, Dom, api, {x1: r.left, y1: r.top}
                );
            }
            else if(r.op == RENDER_OPS.HIDE) {
                renderer.unmarkAsSchToHide(r.cn.item);
                getApi("toggle").hide(
                    r.cn.item, r.left, r.top, getS("toggleTime"), getS("toggleTiming"),
                    ev, toggleSyncerApi, Dom, api, {x1: r.left, y1: r.top}
                );
            }
            else {
                var execRender = function(item, left, top) {
                    if(Dom.has(item, TOGGLE.IS_ACTIVE_WITH_CC)) {
                        var time = getS("toggleTime");
                        var timing = getS("toggleTiming");
                    }
                    else {
                        var time = getS("coordsChangeTime");
                        var timing = getS("coordsChangeTiming");
                    }

                    getApi("coordsChanger")(
                        item, left, top, time, timing, Dom, Prefixer, getS
                    );
                }

                if(r.op == RENDER_OPS.RENDER)
                    execRender(r.cn.item, r.left, r.top);
                else {
                    (function(r) {
                        setTimeout(function() {
                            // Because of using this delayed timeout we should find item connection again.
                            // There could be a bunch of resizes since this delayedRender schedule, so this
                            // item connection can point to the old version of the connection.
                            var newCn = cnsCore.find(r.cn.item, true);
                            if(newCn == null) return;

                            execRender(r.cn.item, r.left, r.top);
                        }, r.delay);
                    })(r);
                }
            }
        }

        grid.scheduleResize();
        this._queue = null;
    }
});