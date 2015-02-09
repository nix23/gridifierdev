Gridifier.Discretizer.VerticalCore = function(gridifier, settings) {
    var me = this;

    this._gridifier = null;
    this._settings = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._settings = settings;

        me._bindEvents();
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

Gridifier.Discretizer.VerticalCore.prototype.discretizeGridWithDefaultAppend = function(discretizationHorizontalStep,
                                                                                        discretizationVerticalStep) {
    var cells = [];
    var gridX2 = this._gridifier.getGridX2();
    var gridY2 = this._gridifier.getGridY2();

    var currentY = -1;
    var createNextRow = true;
    
    while(createNextRow) { 
        var rowColumns = [];
        var currentX = gridX2 + 1;
        var createNextColumn = true;

        while(createNextColumn) {
            currentX -= discretizationHorizontalStep + 1;
            if(currentX < 0) {
                createNextColumn = false;
            }
            else {
                var nextColumn = {
                    x1: currentX,
                    x2: currentX + discretizationHorizontalStep,
                    y1: currentY + 1,
                    y2: currentY + 1 + discretizationVerticalStep
                };
                nextColumn[Gridifier.Discretizer.IS_INTERSECTED_BY_ITEM] = false;
                var columnWidth = nextColumn.x2 - nextColumn.x1 + 1;
                var columnHeight = nextColumn.y2 - nextColumn.y1 + 1;

                nextColumn[Gridifier.Discretizer.CELL_CENTER_X] = nextColumn.x1 + (columnWidth / 2);
                nextColumn[Gridifier.Discretizer.CELL_CENTER_Y] = nextColumn.y1 + (columnHeight / 2);

                rowColumns.unshift(nextColumn);
            }
        }

        cells.push(rowColumns);

        currentY += discretizationVerticalStep + 1;
        if(currentY + 1 + discretizationVerticalStep > gridY2)
            createNextRow = false;
    }

    return cells;
}

Gridifier.Discretizer.VerticalCore.prototype.discretizeGridWithReversedAppend = function(discretizationHorizontalStep,
                                                                                         discretizationVerticalStep) {
    ;
}

Gridifier.Discretizer.VerticalCore.prototype.normalizeItemNewConnectionHorizontalCoords = function(item,
                                                                                                   newConnectionCoords) {
    var newConnectionWidth = newConnectionCoords.x2 - newConnectionCoords.x1 + 1;
    var itemWidth = SizesResolverManager.outerWidth(item, true);

    if(newConnectionWidth < itemWidth) {
        if(this._settings.isDefaultAppend()) {
            newConnectionCoords.x1 = newConnectionCoords.x2 - itemWidth + 1;
        }
        else if(this._settings.isReversedAppend()) {
            newConnectionCoords.x2 = newConnectionCoords.x1 + itemWidth - 1;
        }
    }

    if(itemWidth < newConnectionWidth) {
        if(this._settings.isDefaultAppend()) {
            newConnectionCoords.x1 = newConnectionCoords.x2 - itemWidth + 1;
        }
        else if(this._settings.isReversedAppend()) {
            newConnectionCoords.x2 = newConnectionCoords.x1 + itemWidth - 1;
        }
    }

    if(newConnectionCoords.x1 < 0) {
        newConnectionCoords.x1 = 0;
        newConnectionCoords.x2 = itemWidth - 1;
    }

    if(newConnectionCoords.x2 > this._gridifier.getGridX2()) {
        newConnectionCoords.x2 = this._gridifier.getGridX2();
        newConnectionCoords.x1 = newConnectionCoords.x2 - itemWidth + 1;
    }

    return newConnectionCoords;
}

Gridifier.Discretizer.VerticalCore.prototype.normalizeItemNewConnectionVerticalCoords = function(item,
                                                                                                 newConnectionCoords) {
    var newConnectionHeight = newConnectionCoords.y2 - newConnectionCoords.y1 + 1;
    var itemHeight = SizesResolverManager.outerHeight(item, true);

    if(newConnectionHeight < itemHeight) {
        newConnectionCoords.y2 = newConnectionCoords.y1 + itemHeight - 1;
    }

    if(itemHeight < newConnectionHeight) {
        newConnectionCoords.y2 = newConnectionCoords.y1 + itemHeight - 1;
    }

    if(newConnectionCoords.y1 < 0) {
        newConnectionCoords.y1 = 0;
        newConnectionCoords.y2 = itemHeight - 1;
    }

    // @todo -> Check if expand is required(When item with big height is moved down)
    if(newConnectionCoords.y2 > this._gridifier.getGridY2()) {
        newConnectionCoords.y2 = this._gridifier.getGridY2();
        newConnectionCoords.y1 = newConnectionCoords.y2 - itemHeight + 1;
    }

    return newConnectionCoords;
}