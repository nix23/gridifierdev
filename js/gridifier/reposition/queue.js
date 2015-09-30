var RepositionQueue = function() {
    this._queue = null;
    this._nextBatchTimeout = null;
    this._queueData = null;
    this._repositionStart = {
        gridX2: 0,
        gridY2: 0,
        vpWidth: null,
        vpHeight: null
    };
}

proto(RepositionQueue, {
    isEmpty: function() {
        return (this._nextBatchTimeout == null);
    },

    init: function(items, cns) {
        this._queue = [];
        this._queueData = [];

        for(var i = 0; i < cns.length; i++)
            this._queue.push({item: items[i], cn: cns[i]});
    },

    stop: function() {
        clearTimeout(this._nextBatchTimeout);
        return {
            queue: this._queue,
            queueData: this._queueData
        };
    },

    start: function() {
        this._repositionStart = {
            gridX2: grid.x2(),
            gridY2: grid.y2(),
            vpWidth: srManager.viewportWidth(),
            vpHeight: srManager.viewportHeight()
        };
        this._repositionNextBatch();
    },

    getQueued: function() {
        return this._queue;
    },

    _isSameRepositionProcess: function() {
        var isSameProcess = true;
        if(settings.eq("grid", "vertical")) {
            if(this._repositionStart.gridX2 != grid.x2())
                isSameProcess = false;

            if(this._repositionStart.vpWidth != srManager.viewportWidth())
                isSameProcess = false;
        }
        else {
            if(this._repositionStart.gridY2 != grid.y2())
                isSameProcess = false;

            if(this._repositionStart.vpHeight != srManager.viewportHeight())
                isSameProcess = false;
        }

        return isSameProcess;
    },

    _repositionNextBatch: function(checkSameProcess) {
        var batchSize = settings.get("queueSize");
        if(batchSize > this._queue.length)
            batchSize = this._queue.length;

        srManager.startCachingTransaction();
        var csp = checkSameProcess || false;
        if(csp && !this._isSameRepositionProcess()) {
            srManager.stopCachingTransaction();
            return;
        }

        var repositionedGUIDS = [];
        for(var i = 0; i < batchSize; i++) {
            this._repositionItem(this._queue[i].item);
            crsCleaner["rmIntFrom" + (settings.eq("grid", "vertical") ? "Bottom" : "Right")]();
            repositionedGUIDS.push(guid.get(this._queue[i].item));
            /* @system-log-start */
            Logger.log("repositionItems", "rmIntFromBottomOrXXXCrs", connectors.get(), connections.get());
            /* @system-log-end */
        }

        srManager.stopCachingTransaction();
        var repositionedCns = cnsCore.getByGUIDS(repositionedGUIDS);
        cssManager.emitEvents(repositionedCns);
        renderer.renderRepositioned(repositionedCns);

        this._queueData = this._queueData.concat(this._queue.splice(0, batchSize));
        if(this._queue.length == 0) {
            ev.emitInternal(INT_EV.REPOSITION_END_FOR_DRAG);
            ev.emit(EV.REPOSITION_END);
            this._nextBatchTimeout = null;
            /* @system-log-start */
            Logger.stopLoggingOperation();
            /* @system-log-end */
            return;
        }

        var me = this;
        this._nextBatchTimeout = setTimeout(function() {
            me._repositionNextBatch.call(me, true);
        }, settings.get("queueDelay"));
    },

    _repositionItem: function(item) {
        if(settings.eq("append", "reversed")) {
            /* @system-log-start */
            Logger.startLoggingSubaction(
                "repositionItem.RevApp",
                "repositionItem with GUID: " + guid.get(item)
            );
            /* @system-log-end */
            reversedAppender.position(item);
        }
        else {
            /* @system-log-start */
            Logger.startLoggingSubaction(
                "repositionItem.DefApp",
                "repositionItem with GUID: " + guid.get(item)
            );
            /* @system-log-end */
            appender.position(item);
        }
        /* @system-log-start */
        Logger.stopLoggingSubaction();
        /* @system-log-end */
    }
});