var Grid = function() {
    this._grid = null;
    this._markingFn = null;
    this._resizeTimeout = null;

    this._createMarkingFn();
    this._toNative(sourceGrid);
    this._adjustCSS();

    self(this, {
        getGrid: this.get,
        getGridWidth: this.width,
        getGridHeight: this.height
    });
}

proto(Grid, {
    _createMarkingFn: function() {
        this._markingFn = function(item) {
            if(settings.notEq("class", false)) {
                if(!Dom.css.hasClass(item, settings.get("class")))
                    Dom.css.addClass(item, settings.get("class"));
            }
            else if(settings.notEq("data", false))
                Dom.set(item, settings.get("data"), "gi");
        }
    },

    _toNative: function(grid) {
        if(Dom.isJquery(grid))
            this._grid = grid.get(0);
        else if(Dom.isNative(grid))
            this._grid = grid;
        else if(Dom.isArray(grid) && Dom.isNative(grid))
            this._grid = grid[0];
        else
            err(E.GRID_NOT_NATIVE);
    },

    _adjustCSS: function() {
        var gridComputedCSS = SizesResolver.getComputedCSS(this._grid);
        if(gridComputedCSS.position != "relative" && gridComputedCSS.position != "absolute")
            Dom.css.set(this._grid, {"position": "relative"});
    },

    get: function() { return this._grid; },
    x2: function() { return srManager.outerWidth(this._grid, false, true) - 1; },
    y2: function() { return srManager.outerHeight(this._grid, false, true) - 1; },
    width: function() { return Math.round(this.x2() + 1); },
    height: function() { return Math.round(this.y2() + 1); },

    mark: function(items) {
        var items = gridItem.toNative(items);
        for(var i = 0; i < items.length; i++)
            this._markingFn(items[i]);

        return items;
    },

    add: function(items) {
        var items = this.mark(items);
        for(var i = 0; i < items.length; i++) {
            if(!Dom.isChildOf(items[i], this._grid))
                this._grid.appendChild(items[i]);
        }
    },

    ensureCanFit: function(items) {
        var me = this;
        var ensureNoOverflow = function(item, size) {
            var itemSize = Math.round(srManager["outer" + size](item, true));
            var gridSize = Math.round(srManager["outer" + size](me._grid, false, true));

            if(itemSize > gridSize)
                err("Item " + size + "(" + itemSize + "px) > Grid " + size + "(" + gridSize + "px).");
        }

        for(var i = 0; i < items.length; i++)
            ensureNoOverflow(items[i], (settings.eq("grid", "vertical")) ? "Width" : "Height");
    },

    scheduleResize: function() {
        var me = this;
        clearTimeout(this._resizeTimeout);

        this._resizeTimeout = setTimeout(function() {
            // This is required for correct work with retransformQueue.
            // (Update shouldn't fire between batches reappend at least with 'fit' gridTransformType.)
            if(!sizesTransformer._itemsReappender.isReappendQueueEmpty()) {
                me.scheduleResize();
                return;
            }

            if(settings.eq("grid", "vertical"))
                me._resize.call(me, "y2", "height", function() { return me.y2(); });
            else
                me._resize.call(me, "x2", "width", function() { return me.x2(); });
        }, settings.get("gridResizeDelay"));
    },

    _resize: function(coord, sizeType, currSizeFn) {
        var connections = connections.get();
        if(connections.length == 0)
            return;

        var newSize = connections[0][coord];
        for(var i = 1; i < connections.length; i++) {
            if(connections[i][coord] > newSize)
                newSize = connections[i][coord];
        }

        var cssSize = {};
        cssSize[sizeType] = (newSize + 1) + "px";

        if((settings.eq("gridResize", "fit")) ||
           (settings.eq("gridResize", "expand") && currSizeFn() < newSize))
            Dom.css.set(this._grid, cssSize);

        event.emit(EV.GRID_RESIZE, this._grid);
    }
});