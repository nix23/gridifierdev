SilentRenderer = function() {}

proto(SilentRenderer, {
    schedule: function(items) {
        for(var i = 0; i < items.length; i++)
            Dom.set(items[i], C.REND.SILENT_DATA, "y");
    },

    unschedule: function(items, cns) {
        for(var i = 0 ; i < items.length; i++) {
            Dom.rm(items[i], C.REND.SILENT_DATA);
            rendererCns.unmarkAsRendered(cns[i]);
        }
    },

    isScheduled: function(item) {
        return Dom.has(item, C.REND.SILENT_DATA);
    },

    // This is required to avoid duplicate triggering silent render
    // per same item. (Causes bags in rotates, etc...)
    _preUnschedule: function(items) {
        for(var i = 0; i < items.length; i++)
            Dom.rm(items[i], C.REND.SILENT_DATA);
    },

    getScheduled: function(onlyInsideVp) {
        var onlyInsideVp = onlyInsideVp || false;
        var items = collector.collectByQuery("[" + C.REND.SILENT_DATA + "]");
        if(items.length == 0) return [];
        if(!onlyInsideVp) return items;

        var gridOffset = {
            left: srManager.offsetLeft(grid.get()),
            top: srManager.offsetTop(grid.get())
        };
        var vpCoords = srManager.viewportDocumentCoords();

        var itemsInsideVp = [];
        for(var i = 0; i < items.length; i++) {
            var itemCn = cnsCore.find(items[i], true);
            if(itemCn == null) continue;

            var fakeCoords = {
                x1: gridOffset.left + itemCn.x1,
                x2: gridOffset.left + itemCn.x2,
                y1: gridOffset.top + itemCn.y1,
                y2: gridOffset.top + itemCn.y2
            };

            if(!cnsIntersector.isIntersectingAny([vpCoords], fakeCoords))
                itemsInsideVp.push(items[i]);
        }

        return itemsInsideVp;
    },

    exec: function(items, batchSize, batchTm) {
        if(typeof items != "undefined" && items != null && items) {
            items = gridItem.toNative(items);
            var scheduled = [];

            for(var i = 0; i < items.length; i++) {
                if(this.isScheduled(items[i]))
                    scheduled.push(items[i]);
            }

            this._preUnschedule(scheduled);
            items = scheduled;
        }

        var me = this;
        setTimeout(function() {
            me._exec.call(me, items, batchSize, batchTm);
        }, C.REFLOW_FIX_DELAY);
    },

    _exec: function(items, batchSize, batchTm) {
        if(typeof items != "undefined" && items != null && items)
            var scheduled = this.getScheduled();
        else
            var scheduled = items;

        if(scheduled.length == 0) return;
        this._preUnschedule(scheduled);

        var scheduledCns = [];
        var scheduledItems = [];

        for(var i = 0; i < scheduled.length; i++) {
            var scheduledCn = cnsCore.find(scheduled[i], true);
            if(scheduledCn != null)
                scheduledCns.push(scheduledCn);
        }

        scheduledCns = cnsSorter.sortForReappend(scheduledCns);
        for(var i = 0; i < scheduledCns.length; i++)
            scheduledItems.push(scheduledCns[i].item);

        if(typeof batchSize == "undefined") {
            this._render.call(this, scheduledItems, scheduledCns);
            return;
        }

        if(typeof batchTm == "undefined")
            var batchTm = C.INSERT_BATCH_DELAY;

        var me = this;
        var itemBatches = insertQueue.itemsToBatches(scheduledItems, batchSize);
        var cnBatches = insertQueue.itemsToBatches(scheduledCns, batchSize);
        for(var i = 0; i < itemBatches.length; i++) {
            (function(itemBatch, i, cnBatch) {
                setTimeout(function() {
                    me._render.call(me, itemBatch, cnBatch);
                }, batchTm * i);
            })(itemBatches[i], i, cnBatches[i]);
        }
    },

    _render: function(items, cns) {
        this.unschedule(items, cns);
        renderer.show(cns);
    }
});