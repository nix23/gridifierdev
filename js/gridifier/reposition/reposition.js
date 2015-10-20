var Reposition = function() {}

proto(Reposition, {
    all: function() {
        /* @system-log-start */
        Logger.startLoggingOperation(
            Logger.OPERATION_TYPES.TRANSFORM_SIZES,
            "reposition.all"
        );
        /* @system-log-end */
        srManager.startCachingTransaction();
        this._all();
        srManager.stopCachingTransaction();
    },

    fromFirstSortedCn: function(items) {
        /* @system-log-start */
        Logger.startLoggingOperation(
            Logger.OPERATION_TYPES.TRANSFORM_SIZES,
            "reposition.fromFirstSortedCn"
        );
        /* @system-log-end */
        srManager.startCachingTransaction();
        this._fromFirstSortedCn(items);
        srManager.stopCachingTransaction();
    },

    from: function(firstCn) {
        this._from(firstCn);
    },

    sync: function() {
        var cns = connections.get();
        if(!repositionQueue.isEmpty()) {
            var currentState = repositionQueue.stop();

            var remainedCns = [];
            for(var i = 0; i < currentState.queueData.length; i++)
                remainedCns.push(currentState.queueData[i].cn);
            // Sync is required here, because item sorting in CSDAES mode depends on item positions.
            // And if we made resize, first batch was reappended, and than made second resize,
            // we should grab all items according to start positions to not keep item sorting in sync.
            // (That happens because here on second resize we are resizing ALL items again from scratch.
            //   In transform sizes this is redundant, because we are starting AFTER reppended items(if there
            //   are some items in queue), or from first transformed connection)
            cnsCore.syncParams(remainedCns);

            for(var i = 0; i < currentState.queue.length; i++)
                cns.push(currentState.queue[i].cn);
        }
    },

    _stop: function() {
        var remainedCns = [];
        if(!repositionQueue.isEmpty()) {
            var currentState = repositionQueue.stop();

            for(var i = 0; i < currentState.queue.length; i++) {
                if(currentState.queue[i].cn.restrictCollect)
                    continue;

                remainedCns.push(currentState.queue[i].cn);
            }
        }

        return remainedCns;
    },

    _all: function() {
        this.sync();

        var cns = connections.get();
        if(cns.length == 0) return;

        cns = cnsSorter.sortForReappend(cns);
        guid.unmarkFirstPrepended();

        this._start(repositionData.getForRepositionAll(cns));
    },

    // This method has no async actions before starting the queue.
    // (Used in insertBefore, insertAfter methods. In that methods we should launch reappend
    //  queue immediatly, because in CSD mode we can't insertBefore or after next item BEFORE
    //  current items positions are recalculated.(Order depends on position)
    _from: function(firstCn) {
        var cnsToRps = this._stop();
        guid.unmarkFirstPrepended();
        this._start(repositionData.get(cnsToRps, firstCn));
    },

    // SetTimeout is not required here, because this method is used in cssManager.
    // (Changes are made through media queries & CSS styles).
    // Usage of this method after grid DOM-modifications can cause serious performance
    // loses in Chrome in getComputedStyle calls on mobile devices.
    _fromFirstSortedCn: function(itemsToRps) {
        var cnsToRps = this._stop();
        var cns = connections.get();
        var itemsToRpsCns = [];

        for(var i = 0; i < itemsToRps.length; i++) {
            for(var j = 0; j < cns.length; j++) {
                if(guid.get(cns[j].item) == guid.get(itemsToRps[i])) {
                    itemsToRpsCns.push(cns[j]);
                    continue;
                }
            }

            for(var j = 0; j < cnsToRps.length; j++) {
                if(guid.get(cnsToRps[j].item) == guid.get(itemsToRps[i])) {
                    itemsToRpsCns.push(cnsToRps[j]);
                    continue;
                }
            }
        }

        var sortedCnsToRps = cnsSorter.sortForReappend(itemsToRpsCns);
        guid.unmarkFirstPrepended();
        this._start(repositionData.get(cnsToRps, sortedCnsToRps[0]));
    },

    _start: function(rpsData) {
        repositionCrs.recreateForFirst(rpsData.firstCn.item, rpsData.firstCn);
        repositionQueue.init(rpsData.items, rpsData.cns);
        repositionQueue.start();
    }
});