Gridifier.Grid = function(grid, sizesResolverManager) {
    var me = this;

    this._grid = null;
    this._collector = null;
    this._sizesResolverManager = null;

    this._css = {
    };

    this._construct = function() {
        me._grid = grid;
        me._sizesResolverManager = sizesResolverManager;

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
    var gridComputedCSS = SizesResolver.getComputedCSS(this._grid);
    
    if(gridComputedCSS.position != "relative" && gridComputedCSS.position != "absolute")
        Dom.css.set(this._grid, {"position": "relative"});
}

Gridifier.Grid.prototype.getGrid = function() {
    return this._grid;
}

Gridifier.Grid.prototype.getGridX2 = function() {
    return this._sizesResolverManager.outerWidth(this._grid, false, true) - 1;
}

Gridifier.Grid.prototype.getGridY2 = function() {
    return this._sizesResolverManager.outerHeight(this._grid, false, true) - 1;
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