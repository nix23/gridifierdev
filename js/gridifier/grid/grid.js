Gridifier.Grid = function(grid) {
    var me = this;

    me._grid = null;
    me._collector = null;

    this._css = {
    };

    this._construct = function() {
        me._grid = grid;

        me._extractGrid(grid);
        me._adjustGridCss();
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

Gridifier.Grid.prototype.setCollectorInstance = function(collector) {
    this._collector = collector;
}

Gridifier.Grid.prototype._extractGrid = function(grid) {
    if(Dom.isJqueryObject(grid))
        this._grid = grid.get(0);
    else if(Dom.isNativeDOMObject(grid))
        this._grid = grid;
    else
        new Gridifier.Error(Gridifier.Error.ERROR_TYPES.EXTRACT_GRID);
}

Gridifier.Grid.prototype._adjustGridCss = function() {
    Dom.css.set(this._grid, {"position": "relative"});
}

Gridifier.Grid.prototype.getGrid = function() {
    return this._grid;
}

Gridifier.Grid.prototype.getGridX2 = function() {
    return SizesResolverManager.outerWidth(this._grid) - 1;
}

Gridifier.Grid.prototype.getGridY2 = function() {
    return SizesResolverManager.outerHeight(this._grid) - 1;
}

Gridifier.Grid.prototype.addToGrid = function(items) {
    var items = this._collector.toDOMCollection(items);
    for(var i = 0; i < items.length; i++) {
        this._grid.appendChild(items[i]);
    }

    this._collector.attachToGrid(items);
}

Gridifier.Grid.prototype.markAsGridItem = function(items) {
    var items = this._collector.toDOMCollection(items);
    this._collector.attachToGrid(items);
}