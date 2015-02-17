Gridifier.GridSizesUpdater = function(grid,
                                      connections,
                                      settings,
                                      eventEmitter) {
    var me = this;

    me._grid = null;
    me._connections = null;
    me._settings = null;
    me._eventEmitter = null;

    me._gridSizesUpdateTimeout = null;

    this._css = {
    };

    this._construct = function() {
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

Gridifier.GridSizesUpdater.GRID_SIZES_UPDATE_TIMEOUT = 100;

Gridifier.GridSizesUpdater.prototype.scheduleGridSizesUpdate = function() {
    if(this._gridSizesUpdateTimeout != null) {
        clearTimeout(this._gridSizesUpdateTimeout);
        this._gridSizesUpdateTimeout = null;
    }

    var me = this;
    this._gridSizesUpdateTimeout = setTimeout(function() {
        // @todo -> Refactor here to two methods -> updateVerticalGridWidth / updateHorizontalGridHeight(naoboroot)
        me._updateGridSizes.call(me);
    }, Gridifier.GridSizesUpdater.GRID_SIZES_UPDATE_TIMEOUT);
}

// @todo After SizesTransforms maybe should decrease grid height,
// Make custom updates(User decides update or no... Maybe will be used for fixed animations!!!)
// if elements become smaller?
Gridifier.GridSizesUpdater.prototype._updateGridSizes = function() {
    var connections = this._connections.get();
    if(connections.length == 0)
        return;

    if(this._settings.isVerticalGrid()) {
        var gridHeight = connections[0].y2;
        for(var i = 1; i < connections.length; i++) {
            if(connections[i].y2 > gridHeight)
                gridHeight = connections[i].y2;
        }

        if(this._grid.getGridY2() < gridHeight)
            Dom.css.set(this._grid.getGrid(), {"height": gridHeight + "px"});
        // @todo -> Fire event here
        // @todo -> Remove event from append/prepend methods
        // @todo after each operation update grid width/height(Also when width height is decreasing)
        // @todo also update demo layout builder heading height label
        this._eventEmitter.emitGridSizesChangeEvent();
    }
    else if(this._settings.isHorizontalGrid()) {
        var gridWidth = connections[0].x2;
        for(var i = 1; i < connections.length; i++) {
            if(connections[i].x2 > gridWidth)
                gridWidth = connections[i].x2;
        }

        if(this._grid.getGridX2() < gridWidth)
            Dom.css.set(this._grid.getGrid(), {"width": gridWidth + "px"});
        // @todo -> Fire event here
        // @todo after each operation update grid width/height(Also when width height is decreasing)
        // @todo also update demo layout builder heading height label
        this._eventEmitter.emitGridSizesChangeEvent();
    }
}