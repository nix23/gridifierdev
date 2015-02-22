Gridifier.Discretizer.HorizontalCore = function(gridifier, settings, sizesResolverManager) {
    var me = this;

    this._gridifier = null;
    this._settings = null;
    this._sizesResolverManager = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._settings = settings;
        me._sizesResolverManager = sizesResolverManager;

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

Gridifier.Discretizer.HorizontalCore.prototype._transposeCells = function(cellsToTranspose) {
    var cells = [];

    var rowsCount = 0;
    for(var i = 0; i < cellsToTranspose.length; i++) {
        if(cellsToTranspose[i].length > rowsCount)
            rowsCount = cellsToTranspose[i].length;
    }

    var currentCol = 0;
    for(var swap = 0; swap < rowsCount; swap++) {
        var nextRow = [];

        for(var row = 0; row < cellsToTranspose.length; row++) { 
            if(typeof cellsToTranspose[row][currentCol] != "undefined")
                nextRow.push(cellsToTranspose[row][currentCol]);
        }

        cells.push(nextRow);
        currentCol++;
    }

    return cells;
}

Gridifier.Discretizer.HorizontalCore.prototype.discretizeGridWithDefaultAppend = function(discretizationHorizontalStep,
                                                                                          discretizationVerticalStep) {
    var cells = [];
    var gridX2 = this._gridifier.getGridX2();
    var gridY2 = this._gridifier.getGridY2();

    var currentX = -1;
    var createNextCol = true;

    while(createNextCol) {
        var colRows = [];
        var currentY2 = -1;
        var createNextRow = true;

        while(createNextRow) {
            currentY2 += discretizationVerticalStep;
            var currentY1 = currentY2 - discretizationVerticalStep + 1;
            if(currentY2 > gridY2) {
                createNextRow = false;
            }
            else {
                var nextRow = {
                    x1: currentX + 1,
                    x2: currentX + discretizationHorizontalStep,
                    y1: currentY1,
                    y2: currentY2
                };
                nextRow[Gridifier.Discretizer.IS_INTERSECTED_BY_ITEM] = false;
                var rowWidth = nextRow.x2 - nextRow.x1 + 1;
                var rowHeight = nextRow.y2 - nextRow.y1 + 1;

                nextRow[Gridifier.Discretizer.CELL_CENTER_X] = nextRow.x1 + (rowWidth / 2);
                nextRow[Gridifier.Discretizer.CELL_CENTER_Y] = nextRow.y1 + (rowHeight / 2);

                colRows.push(nextRow);
            }
        }

        cells.push(colRows);

        currentX += discretizationHorizontalStep;
        if(currentX + discretizationHorizontalStep > gridX2)
            createNextCol = false;
    }

    return this._transposeCells(cells);
}

Gridifier.Discretizer.HorizontalCore.prototype.discretizeGridWithReversedAppend = function(discretizationHorizontalStep,
                                                                                           discretizationVerticalStep) {
    var cells = [];
    var gridX2 = this._gridifier.getGridX2();
    var gridY2 = this._gridifier.getGridY2();

    var currentX = -1;
    var createNextCol = true;

    while(createNextCol) {
        var colRows = [];
        var currentY = gridY2 + 1;
        var createNextRow = true;

        while(createNextRow) {
            currentY -= discretizationVerticalStep;
            if(currentY < 0) {
                createNextRow = false;
            }
            else {
                var nextRow = {
                    x1: currentX + 1,
                    x2: currentX + discretizationHorizontalStep,
                    y1: currentY,
                    y2: currentY + discretizationVerticalStep - 1
                };
                nextRow[Gridifier.Discretizer.IS_INTERSECTED_BY_ITEM] = false;
                var rowWidth = nextRow.x2 - nextRow.x1 + 1;
                var rowHeight = nextRow.y2 - nextRow.y1 + 1;

                nextRow[Gridifier.Discretizer.CELL_CENTER_X] = nextRow.x1 + (rowWidth / 2);
                nextRow[Gridifier.Discretizer.CELL_CENTER_Y] = nextRow.y1 + (rowHeight / 2);

                colRows.unshift(nextRow);
            }
        }

        cells.push(colRows);

        currentX += discretizationHorizontalStep;
        if(currentX + discretizationHorizontalStep > gridX2)
            createNextCol = false;
    }
    
    return this._transposeCells(cells);
}

Gridifier.Discretizer.HorizontalCore.prototype.normalizeItemNewConnectionHorizontalCoords = function(item,
                                                                                                     newConnectionCoords) {
    var newConnectionWidth = newConnectionCoords.x2 - newConnectionCoords.x1 + 1;
    var itemWidth = this._sizesResolverManager.outerWidth(item, true);

    if(newConnectionWidth < itemWidth) {
        newConnectionCoords.x2 = newConnectionCoords.x1 + itemWidth - 1;
    }

    if(itemWidth < newConnectionWidth) {
        newConnectionCoords.x2 = newConnectionCoords.x1 + itemWidth - 1;
    }

    if(newConnectionCoords.x1 < 0) {
        newConnectionCoords.x1 = 0;
        newConnectionCoords.x2 = itemWidth - 1;
    }

    // @todo -> Check if expand is required(When item with big width is moved right)
    if(newConnectionCoords.x2 > this._gridifier.getGridX2()) {
        newConnectionCoords.x2 = this._gridifier.getGridX2();
        newConnectionCoords.x1 = newConnectionCoords.x2 - itemWidth + 1;
    }

    return newConnectionCoords;
}

Gridifier.Discretizer.HorizontalCore.prototype.normalizeItemNewConnectionVerticalCoords = function(item,
                                                                                                   newConnectionCoords) {
    var newConnectionHeight = newConnectionCoords.y2 - newConnectionCoords.y1 + 1;
    var itemHeight = this._sizesResolverManager.outerHeight(item, true);

    if(newConnectionHeight < itemHeight) {
        if(this._settings.isDefaultAppend()) {
            newConnectionCoords.y1 = newConnectionCoords.y2 - itemHeight + 1;
        }
        else if(this._settings.isReversedAppend()) {
            newConnectionCoords.y2 = newConnectionCoords.y1 + itemHeight - 1;
        }
    }

    if(itemHeight < newConnectionHeight) {
        if(this._settings.isDefaultAppend()) {
            newConnectionCoords.y1 = newConnectionCoords.y2 - itemHeight + 1;
        }
        else if(this._settings.isReversedAppend()) {
            newConnectionCoords.y2 = newConnectionCoords.y1 + itemHeight - 1;
        }
    }

    if(newConnectionCoords.y1 < 0) {
        newConnectionCoords.y1 = 0;
        newConnectionCoords.y2 = itemHeight - 1;
    }

    if(newConnectionCoords.y2 > this._gridifier.getGridY2()) {
        newConnectionCoords.y2 = this._gridifier.getGridY2();
        newConnectionCoords.y1 = newConnectionCoords.y2 - itemHeight + 1;
    }

    return newConnectionCoords;
}