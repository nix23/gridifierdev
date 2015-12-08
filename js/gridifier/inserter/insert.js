var InsertOp = function() {}

proto(InsertOp, {
    exec: function(items, insertFn) {
        srManager.startCachingTransaction();
        grid.ensureCanFit(items);

        items = collector.sort(collector.filter(items));
        for(var i = 0; i < items.length; i++) {
            collector.unmarkAsNotCollectable(items[i]);
            insertFn(items[i]);
        }

        srManager.stopCachingTransaction();
        grid.scheduleResize();
        ev.emit(EV.INSERT, items);
    },

    execInsertBA: function(items, targetItem, insertFn, getIndex, spliceCns, rev, rpsFn) {
        var cns = connections.get();
        if(cns.length == 0) {
            insertFn(items);
            return;
        }

        cns = cnsSorter.sortForReappend(cns);
        var cnsToRps = [];

        var targetItem = this._getTargetItem(targetItem, cns, getIndex);
        var targetItemGUID = this._getTargetItemGuid(targetItem, spliceCns, cns, cnsToRps);

        if(targetItemGUID == null)
            err(E.WRONG_IBA_ITEM);
        
        this._reposition(cnsToRps, items, targetItemGUID, insertFn, rev, rpsFn);
    },

    _getTargetItem: function(targetItem, cns, getIndex) {
        if(typeof targetItem == "undefined" || targetItem == null)
            var targetItem = cns[getIndex(cns)].item;
        else {
            var targetItem = (gridItem.toNative(targetItem))[0];
            // This check is required, if afterItem is jQuery find result without DOMElem
            if(typeof targetItem == "undefined" || targetItem == null)
                targetItem = cns[getIndex(cns)].item;
        }

        return targetItem;
    },

    _getTargetItemGuid: function(targetItem, spliceCns, cns, cnsToRps) {
        var targetItemGUID = null;
        for(var i = 0; i < cns.length; i++) {
            if(guid.get(cns[i].item) == guid.get(targetItem)) {
                targetItemGUID = cns[i].itemGUID;
                Array.prototype.push.apply(cnsToRps, spliceCns(cns, i));
                break;
            }
        }

        return targetItemGUID;
    },

    _reposition: function(cns, items, targetGuid, insertFn, rev, rpsFn) {
        connections.reinitRanges();
        guid.reinitMax(targetGuid + 1 * rev);

        var reappender = (settings.eq("append", "default")) ? appender : reversedAppender;
        reappender.recreateCrs();

        insertFn(items);

        if(settings.eq("sortDispersion", false)) {
            connections.restore(cns);
            cnsCore.remapGUIDSIn(cns);
        }
        else {
            connections.restoreOnSortDispersion(cns);
            cnsCore.remapAllGUIDS();
        }

        rpsFn(cns);
    }
});