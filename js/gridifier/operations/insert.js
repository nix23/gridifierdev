var InsertOp = function() {}

proto(InsertOp, {
    exec: function(items, insertFn) {
        var items = gridItem.filterNotConnected(gridItem.toNative(items));
        if(items.length == 0) return;

        srManager.startCachingTransaction();
        grid.ensureCanFit(items);

        items = collector.sort(collector.filter(items));
        for(var i = 0; i < items.length; i++) {
            collector.unmarkAsNotCollectable(items[i]);
            grid.add(items[i]);
            insertFn(items[i]);
        }

        srManager.stopCachingTransaction();
        grid.scheduleResize();
        event.emit(EV.INSERT, items);
    },

    execInsertBA: function(items, targetItem, insertFn, getIndex, spliceCns, rev, rpsFn) {
        var items = gridItem.filterNotConnected(gridItem.toNative(items));
        if(items.length == 0) return;

        var cns = connections.get();
        if(cns.length == 0) {
            insertFn(items);
            return;
        }

        cns = cnsSorter.sortForReappend(cns);
        var cnsToRps = [];

        if(typeof targetItem == "undefined" || targetItem == null)
            var targetItem = cns[getIndex(cns)].item;
        else {
            var targetItem = (gridItem.toNative(targetItem))[0];
            // This check is required, if afterItem is jQuery find result without DOMElem
            if(typeof targetItem == "undefined" || targetItem == null)
                targetItem = cns[getIndex(cns)].item;
        }

        var targetItemGUID = null;
        for(var i = 0; i < cns.length; i++) {
            if(guid.get(cns[i].item) == guid.get(targetItem)) {
                targetItemGUID = cns[i].itemGUID;
                cnsToRps = cnsToRps.concat(spliceCns(cns, i));
                break;
            }
        }

        if(targetItemGUID == null) {
            err(E.WRONG_IBA_ITEM);
            return;
        }

        connections.reinitRanges();
        guid.reinitMax(targetItemGUID + 1 * rev);

        var appender = (settings.eq("append", "default")) ? appender : reversedAppender;
        appender.recreateCrs();

        insertFn(items);

        if(settings.eq("sortDispersion", false)) {
            connections.restore(cnsToRps);
            cnsCore.remapAllGUIDSIn(cnsToRps);
        }
        else {
            connections.restoreOnSortDispersion(cnsToRps);
            connections.remapAllGUIDS();
        }

        rpsFn(cnsToRps);
    }
})