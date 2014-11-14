Gridifier.Collector = function(settings, grid) {
    var me = this;

    this._settings = null;
    this._grid = null;

    this._collectorFunction = null;
    this._markingFunction = null;

    this._css = {
    };

    this._construct = function() {
        me._settings = settings;
        me._grid = grid;

        me._createCollectorFunction();
        me._createMarkingFunction();
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

Gridifier.Collector.prototype._createCollectorFunction = function() {
    var gridItemMarkingValue = this._settings.getGridItemMarkingType();

    if(this._settings.isByClassGridItemMarkingStrategy()) {
        this._collectorFunction = function(grid) {
            return Dom.get.byQuery(grid, "." + gridItemMarkingValue);
        }
    }
    else if(this._settings.isByDataAttrGridItemMarkingStrategy()) {
        this._collectorFunction = function(grid) {
            return Dom.get.byQuery(grid, "[" + gridItemMarkingValue + "]");
        }
    }
}

Gridifier.Collector.prototype._createMarkingFunction = function() {
    var gridItemMarkingValue = this._settings.getGridItemMarkingType();

    if(this._settings.isByClassGridItemMarkingStrategy()) {
        this._markingFunction = function(item) {
            Dom.css.addClass(item, gridItemMarkingValue);
        }
    }
    else if(this._settings.isByDataAttrGridItemMarkingStrategy()) {
        this._markingFunction = function(item) {
            item.setAttribute(gridItemMarkingValue, "");
        }
    }
}

Gridifier.Collector.prototype.attachToGrid = function(items) {
    for(var i = 0; i < items.length; i++) {
        Dom.css.set(items[i], {
            visibility: "hidden",
            position: "absolute"
        });
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

Gridifier.Collector.prototype._isItemWiderThanGridWidth = function(item) {
    return SizesResolver.outerWidth(item, true) > SizesResolver.outerWidth(this._grid);
}

Gridifier.Collector.prototype._isItemTallerThatGridHeight = function(item) {
    return SizesResolver.outerHeight(item, true) > SizesResolver.outerHeight(this._grid);
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
            itemWidth: SizesResolver.outerWidth(item, true),
            gridWidth: SizesResolver.outerWidth(this._grid)
        };

        var errorType = Gridifier.Error.ERROR_TYPES.COLLECTOR.ITEM_WIDER_THAN_GRID_WIDTH;
    }
    else if(this._settings.isHorizontalGrid()) {
        var errorParam = {
            item: item,
            itemHeight: SizesResolver.outerHeight(item, true),
            gridHeight: SizesResolver.outerHeight(this._grid)
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
    var items = this._collectorFunction();
    // @todo -> Filter only not yet processed items, also check
    // at append and prepend??? (item.attr != grid.itemDataStates.LAYOUTED)
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
    items.sort(this._settings.getSort());
    return items;
    // @todo -> check if reverse of the itams is required
    // if(this.gridifier.isAppending())
    //      return items.reverse()
}