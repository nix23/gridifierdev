var Core = function() {
    this._onResize = null;
    this._bindEvents();

    self(this, {
        destroy: function() {
            this._unbindEvents();
            return gridifier;
        },

        set: function(name, val) {
            settings.set(name, val);
            return gridifier;
        },

        setApi: function(name, val) {
            settings.setApi(name, val);
            return gridifier;
        },

        toggle: function(fn) { return gridifier.setApi("toggle", fn); },
        sort: function(fn) { return gridifier.setApi("sort", fn); },
        coordsChanger: function(fn) { return gridifier.setApi("coordsChanger", fn); },
        drag: function(fn) { return gridifier.setApi("drag", fn); },
        rsort: function(fn) {
            gridifier.setApi("rsort", fn);
            reposition.all();
            return gridifier;
        },
        resort: function(fn) {
            reposition.sync();
            resorter.resort();
            reposition.all();

            return gridifier;
        },
        filter: function(fn) {
            reposition.sync();
            gridifier.setApi("filter", fn);
            filtrator.filter();
            reposition.all();

            return gridifier;
        },

        reposition: function() {
            antialiaser.updateAs();
            reposition.all();
            return gridifier;
        },

        prepend: function(items, batchSize, batchDelay) {
            var eq = settings.eq;
            if(eq("loadImages", true)) {
                var op = (eq("prepend", "mirrored")) ? OPS.INS_BEFORE : OPS.PREPEND;
                imagesLoader.schedule(gridItem.toNative(items), op, {
                    batchSize: batchSize, batchDelay: batchDelay, beforeItem: null
                });
            }
            else {
                if(eq("prepend", "mirrored"))
                    gridifier.insertBefore(items, null, batchSize, batchDelay);
                else
                    this.exec(OPS.PREPEND, items, batchSize, batchDelay);
            }

            return gridifier;
        },

        append: function(items, batchSize, batchDelay) {
            if(settings.eq("loadImages", true)) {
                imagesLoader.schedule(gridItem.toNative(items), OPS.APPEND, {
                    batchSize: batchSize, batchDelay: batchDelay
                });
            }
            else
                this.exec(OPS.APPEND, items, batchSize, batchDelay);

            return gridifier;
        },

        silentAppend: function(items, batchSize, batchDelay) {
            if(settings.eq("loadImages", true)) {
                imagesLoader.schedule(gridItem.toNative(items), OPS.SIL_APPEND, {
                    batchSize: batchSize, batchDelay: batchDelay
                });
            }
            else
                this.execSilentAppend(items, batchSize, batchDelay);

            return gridifier;
        },

        silentRender: function(items, batchSize, batchDelay) {
            silentRenderer.exec(items, batchSize, batchDelay);
            return gridifier;
        },

        getForSilentRender: function(onlyInsideVp) {
            return silentRenderer.getScheduled(onlyInsideVp);
        },

        insertBefore: function(items, beforeItem, batchSize, batchDelay) {
            if(settings.eq("loadImages", true)) {
                imagesLoader.schedule(gridItem.toNative(items), OPS.INS_BEFORE, {
                    batchSize: batchSize, batchDelay: batchDelay, beforeItem: beforeItem
                });
            }
            else
                this.exec(OPS.INS_BEFORE, items, batchSize, batchDelay, beforeItem);

            return gridifier;
        },

        insertAfter: function(items, afterItem, batchSize, batchDelay) {
            if(settings.eq("loadImages", true)) {
                imagesLoader.schedule(gridItem.toNative(items), OPS.INS_AFTER, {
                    batchSize: batchSize, batchDelay: batchDelay, afterItem: afterItem
                });
            }
            else
                this.exec(OPS.INS_AFTER, items, batchSize, batchDelay, afterItem);

            return gridifier;
        },

        appendNew: function(bs, bd) {
            gridifier.append(gridifier.collectNew(), bs, bd);
            return gridifier;
        },

        prependNew: function(bs, bd) {
            gridifier.prepend(gridifier.collectNew(), bs, bd);
            return gridifier;
        },

        triggerRotate: function(items, rotateType, batchSize, batchDelay) {
            gridifier.toggle(rotateType);
            var items = gridItem.toNative(items);

            if(typeof batchSize == "undefined") {
                renderer.rotate(items);
                return gridifier;
            }

            insertQueue.scheduleFnExec(items, batchSize, batchDelay, function(batch) {
                renderer.rotate(batch);
            });

            return gridifier;
        }
    });
}

proto(Core, {
    _bindEvents: function() {
        var getS = bind("get", settings);
        var resizeTimeout = null;

        this._onResize = function() {
            if(getS("resizeDelay") == null) {
                reposition.all();
                return;
            }

            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                reposition.all();
            }, getS("resizeDelay"));
        }

        Event.add(window, "resize", this._onResize);
    },

    _unbindEvents: function() {
        Event.rm(window, "resize", this._onResize);
        if(gridifier.isDragifierOn())
            gridifier.dragifierOff();
    },

    exec: function(op, items, batchSize, batchDelay, targetItem) {
        setTimeout(function() {
            insertQueue.schedule(op, items, batchSize, batchDelay, targetItem);
        }, C.REFLOW_FIX_DELAY);
    },

    execSilentAppend: function(items, batchSize, batchDelay) {
        silentRenderer.schedule(gridItem.toNative(items));
        this.exec(OPS.APPEND, items, batchSize, batchDelay);
    }
});