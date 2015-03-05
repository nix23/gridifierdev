Gridifier.Collector = function(settings, grid, sizesResolverManager) {
    var me = this;

    this._settings = null;
    this._grid = null;
    this._sizesResolverManager = null;

    this._collectorFunction = null;
    this._markingFunction = null;

    this._connectedItemMarker = null;

    this._css = {
    };

    this._construct = function() {
        me._settings = settings;
        me._grid = grid;
        me._sizesResolverManager = sizesResolverManager;

        me._createCollectorFunction();
        me._createMarkingFunction();

        me._connectedItemMarker = new Gridifier.ConnectedItemMarker();
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

Gridifier.Collector.ITEM_SORTING_INDEX_DATA_ATTR = "data-gridifier-item-sorting-index";

Gridifier.Collector.prototype._createCollectorFunction = function() {
    var gridItemMarkingValue = this._settings.getGridItemMarkingType();

    if(this._settings.isByClassGridItemMarkingStrategy()) {
        this._collectorFunction = function(grid) {
            return Dom.get.byQuery(grid, "." + gridItemMarkingValue);
        }
    }
    else if(this._settings.isByDataAttrGridItemMarkingStrategy()) {
        this._collectorFunction = function(grid) {
            return Dom.get.byQuery(
                grid, 
                "[" + Gridifier.GRID_ITEM_MARKING_DEFAULTS.DATA_ATTR + "=" + gridItemMarkingValue + "]"
            );
        }
    }
    else if(this._settings.isByQueryGridItemMarkingStrategy()) {
        this._collectorFunction = function(grid) {
            return Dom.get.byQuery(grid, gridItemMarkingValue);
        }
    }
}

Gridifier.Collector.prototype._createMarkingFunction = function() {
    var gridItemMarkingValue = this._settings.getGridItemMarkingType();

    if(this._settings.isByClassGridItemMarkingStrategy()) {
        this._markingFunction = function(item) {
            if(!Dom.css.hasClass(item, gridItemMarkingValue))
                Dom.css.addClass(item, gridItemMarkingValue);
        }
    }
    else if(this._settings.isByDataAttrGridItemMarkingStrategy()) {
        this._markingFunction = function(item) {
            item.setAttribute(
                Gridifier.GRID_ITEM_MARKING_DEFAULTS.DATA_ATTR, 
                gridItemMarkingValue
            );
        }
    }
    else if(this._settings.isByQueryGridItemMarkingStrategy()) {
        this._markingFunction = function(item) {
            ;
        }
    }
}

Gridifier.Collector.prototype.attachToGrid = function(items) {
    if(!Dom.isArray(items))
        var items = [items];
    
    for(var i = 0; i < items.length; i++) {
        Dom.css.set(items[i], {
            position: "absolute"
        });

        if(!this._settings.shouldDisableItemHideOnGridAttach())
            Dom.css.set(items[i], {"visibility": "hidden"});
    }
    for(var i = 0; i < items.length; i++)
        this._markingFunction(items[i]);
}

Gridifier.Collector.prototype.ensureAllItemsAreAttachedToGrid = function(items) {
    for(var i = 0; i < items.length; i++) {
        if(!Dom.isChildOf(items[i], this._grid)) {
            new Gridifier.Error(
                Gridifier.Error.ERROR_TYPES.COLLECTOR.ITEM_NOT_ATTACHED_TO_GRID,
                items[i]
            );
        }
    }
}

Gridifier.Collector.prototype.ensureAllItemsAreConnectedToGrid = function(items) {
    for(var i = 0; i < items.length; i++) {
        if(!this._connectedItemMarker.isItemConnected(items[i])) {
            new Gridifier.Error(
                Gridifier.Error.ERROR_TYPES.COLLECTOR.ITEM_NOT_CONNECTED_TO_GRID,
                items[i]
            );
        }
    }
}

Gridifier.Collector.prototype._isItemWiderThanGridWidth = function(item) {
    return this._sizesResolverManager.outerWidth(item, true) > this._sizesResolverManager.outerWidth(this._grid, false, true);
}

Gridifier.Collector.prototype._isItemTallerThanGridHeight = function(item) {
    return this._sizesResolverManager.outerHeight(item, true) > this._sizesResolverManager.outerHeight(this._grid, false, true);
}

Gridifier.Collector.prototype.canItemBeAttachedToGrid = function(item) {
    if(this._settings.isVerticalGrid())
        return !this._isItemWiderThanGridWidth(item);
    else if(this._settings.isHorizontalGrid())
        return !this._isItemTallerThanGridHeight(item);
}

Gridifier.Collector.prototype.throwWrongItemSizesError = function(item) {
    if(this._settings.isVerticalGrid()) {
        var errorParam = {
            item: item, 
            itemWidth: this._sizesResolverManager.outerWidth(item, true),
            gridWidth: this._sizesResolverManager.outerWidth(this._grid, false, true)
        };

        var errorType = Gridifier.Error.ERROR_TYPES.COLLECTOR.ITEM_WIDER_THAN_GRID_WIDTH;
    }
    else if(this._settings.isHorizontalGrid()) {
        var errorParam = {
            item: item,
            itemHeight: this._sizesResolverManager.outerHeight(item, true),
            gridHeight: this._sizesResolverManager.outerHeight(this._grid, false, true)
        };

        var errorType = Gridifier.Error.ERROR_TYPES.COLLECTOR.ITEM_TALLER_THAN_GRID_HEIGHT;
    }

    new Gridifier.Error(errorType, errorParam);
}

Gridifier.Collector.prototype.ensureAllItemsCanBeAttachedToGrid = function(items) {
    for(var i = 0; i < items.length; i++) {
        if(!this.canItemBeAttachedToGrid(items[i])) {
            this.throwWrongItemSizesError(items[i]);
        }
    }
}

// @todo -> pass as parameter append or prepend to collect method
//               declare as constants

Gridifier.Collector.prototype.collect = function() {
    var items = this._collectorFunction(this._grid);
    return items;
}

Gridifier.Collector.prototype.collectAllConnectedItems = function() {
    var items = this._collectorFunction(this._grid);

    var connectedItems = [];
    for(var i = 0; i < items.length; i++) {
        if(this._connectedItemMarker.isItemConnected(items[i]))
            connectedItems.push(items[i]);
    }

    return connectedItems;
}

Gridifier.Collector.prototype.collectAllDisconnectedItems = function() {
    var items = this._collectorFunction(this._grid);

    var disconnectedItems = [];
    for(var i = 0; i < items.length; i++) {
        if(!this._connectedItemMarker.isItemConnected(items[i]))
            disconnectedItems.push(items[i]);
    }

    return disconnectedItems;
}

Gridifier.Collector.prototype.toDOMCollection = function(items) {
    var createNotDomElementError = function(errorParam) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.COLLECTOR.NOT_DOM_ELEMENT, errorParam
        );
    }

    if(Dom.isJqueryObject(items)) {
        var DOMItems = [];
        for(var i = 0; i < items.length; i++)
            DOMItems.push(items.get(i));

        return DOMItems;
    }

    if(Dom.isNativeDOMObject(items)) {
        var DOMItems = [];
        DOMItems.push(items);

        return DOMItems;
    }
    
    if(Dom.isArray(items)) {
        for(var i = 0; i < items.length; i++) {
            if(Dom.isJqueryObject(items[i]))
                items[i] = items[i].get(0);

            if(!Dom.isNativeDOMObject(items[i])) {
                createNotDomElementError(items[i]);
            }
        }

        return items;
    }
    else {
        createNotDomElementError(items);
    }
}

Gridifier.Collector.prototype.filterCollection = function(items) {
    var filter = this._settings.getFilter();
    var filteredItems = [];

    for(var i = 0; i < items.length; i++) {
        if(filter(items[i]))
            filteredItems.push(items[i]);
    }

    return filteredItems;
}

Gridifier.Collector.prototype.sortCollection = function(items) {
    for(var i = 0; i < items.length; i++) {
        items[i].setAttribute(Gridifier.Collector.ITEM_SORTING_INDEX_DATA_ATTR, i);
    }

    items.sort(this._settings.getSort());

    for(var i = 0; i < items.length; i++) {
        items[i].removeAttribute(Gridifier.Collector.ITEM_SORTING_INDEX_DATA_ATTR);
    }

    return items;
    // @todo -> check if reverse of the itams is required
    // if(this.gridifier.isAppending())
    //      return items.reverse()
}