var Disconnector = function() {
    self(this, {
        disconnect: function(items) {
            var me = this;
            items = gridItem.filterConnected(gridItem.toNative(items));

            setTimeout(function() {
                reposition.sync();
                me.disconnect(items, C.DISC_TYPES.HARD);
                reposition.all();
            }, C.REFLOW_FIX_DELAY);

            return gridifier;
        },

        pop: function() {
            var item = gridifier.first();
            if(item != null)
                gridifier.disconnect(item);

            return item;
        },

        shift: function() {
            var item = gridifier.last();
            if(item != null)
                gridifier.disconnect(item);

            return item;
        }
    });
}

proto(Disconnector, {
    disconnect: function(items, discType) {
        var discType = discType || C.DISC_TYPES.SOFT;
        var items = gridItem.filterConnected(gridItem.toNative(items));

        if(discType == C.DISC_TYPES.HARD) {
            for(var i = 0; i < items.length; i++)
                collector.markAsNotCollectable(items[i]);
        }

        var cnsToDisc = this._findCnsToDisc(items);
        for(var i = 0; i < cnsToDisc.length; i++) {
            connections.rm(cnsToDisc[i]);
            guid.rm(cnsToDisc[i].item);
        }

        if(connections.count() == 0)
            this._recreateCrs();

        for(var i = 0; i < cnsToDisc.length; i++)
            gridItem.unmarkAsConnected(cnsToDisc[i].item);

        connections.reinitRanges();
        this._scheduleRender(cnsToDisc);
    },

    _findCnsToDisc: function(items) {
        var cns = [];
        for(var i = 0 ; i < items.length; i++)
            cns.push(cnsCore.find(items[i]));

        return cnsSorter.sortForReappend(cns);
    },

    // We should recreate crs on cns.length == 0,
    // because reposition.all() will exit before recreating positionCrs.
    _recreateCrs: function() {
        connectors.flush();

        if(settings.eq("append", "default"))
            appender.createInitialCr();
        else
            reversedAppender.createInitialCr();
    },

    _scheduleRender: function(discCns) {
        var cnBatches = insertQueue.itemsToBatches(discCns, C.DISC_BATCH, true);
        renderer.markAsSchToHide(discCns);

        for(var i = 0; i < cnBatches.length; i++) {
            (function(cnBatch, i) {
                setTimeout(function() { renderer.hide(cnBatch); }, C.DISC_DELAY * i);
            })(cnBatches[i], i);
        }
    }
});