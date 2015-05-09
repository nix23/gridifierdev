Gridifier.GridSizesUpdater = function(gridifier,
                                      grid,
                                      connections,
                                      settings,
                                      eventEmitter) {
    var me = this;

    me._gridifier = null;
    me._grid = null;
    me._connections = null;
    me._settings = null;
    me._eventEmitter = null;

    me._gridSizesUpdateTimeout = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._grid = grid;
        me._connections = connections;
        me._settings = settings;
        me._eventEmitter = eventEmitter;
    };

    this._bindEvents = function() {
    };

    this._unbindEvents = function() {
    };

    this.destruct = function() {
        me._unbindEvents();
    };

    this._construct();
    return this;
}

Gridifier.GridSizesUpdater.prototype.scheduleGridSizesUpdate = function() {
    var me = this;

    if(this._gridSizesUpdateTimeout != null) {
        clearTimeout(this._gridSizesUpdateTimeout);
        this._gridSizesUpdateTimeout = null;
    }

    var executeSizesUpdate = function() {
        if(me._settings.isVerticalGrid()) {
            me._updateVerticalGridSizes.call(me);
        }
        else if(me._settings.isHorizontalGrid()) {
            me._updateHorizontalGridSizes.call(me);
        }
    }

    this._gridSizesUpdateTimeout = setTimeout(function() {
        // This is required to correctly work with retransformQueue.
        // (Update shouldn't fire between batches reappend at least with 'fit' gridTransformType.)
        if(!me._gridifier._sizesTransformer._itemsReappender.isReappendQueueEmpty()) {
            me.scheduleGridSizesUpdate();
            return;
        }

        executeSizesUpdate.call(me);
    }, this._settings.getGridTransformTimeout());
}

Gridifier.GridSizesUpdater.prototype._updateVerticalGridSizes = function() {
    var connections = this._connections.get();
    if(connections.length == 0)
        return;

    var gridHeight = connections[0].y2;
    for(var i = 1; i < connections.length; i++) {
        if(connections[i].y2 > gridHeight)
            gridHeight = connections[i].y2;
    }

    if(this._settings.isExpandGridTransformType()) {
        if(this._grid.getGridY2() < gridHeight)
            Dom.css.set(this._grid.getGrid(), {"height": (gridHeight + 1) + "px"});
    }
    else if(this._settings.isFitGridTransformType()) {
        Dom.css.set(this._grid.getGrid(), {"height": (gridHeight + 1) + "px"});
    }
    
    this._eventEmitter.emitGridSizesChangeEvent(
        this._grid.getGrid(), this._grid.getGridX2() + 1, gridHeight + 1
    );
}

Gridifier.GridSizesUpdater.prototype._updateHorizontalGridSizes = function() {
    var connections = this._connections.get();
    if(connections.length == 0)
        return;

    var gridWidth = connections[0].x2;
    for(var i = 1; i < connections.length; i++) {
        if(connections[i].x2 > gridWidth)
            gridWidth = connections[i].x2;
    }

    if(this._settings.isExpandGridTransformType()) {
        if(this._grid.getGridX2() < gridWidth)
            Dom.css.set(this._grid.getGrid(), {"width": (gridWidth + 1) + "px"});
    }
    else if(this._settings.isFitGridTransformType()) {
        Dom.css.set(this._grid.getGrid(), {"width": (gridWidth + 1) + "px"});
    }
    
    this._eventEmitter.emitGridSizesChangeEvent(
        this._grid.getGrid(), gridWidth + 1, this._grid.getGridY2() + 1
    );
}