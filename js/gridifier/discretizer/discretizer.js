Gridifier.Discretizer = function(gridifier,
                                 connections,
                                 settings,
                                 sizesResolverManager) {
    var me = this;

    this._gridifier = null;
    this._connections = null;
    this._settings = null;
    this._sizesResolverManager = null;

    this._discretizerCore = null;

    this._discretizationDemonstrator = null;
    this._showDemonstrator = false;

    this._cells = [];

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._connections = connections;
        me._settings = settings;
        me._sizesResolverManager = sizesResolverManager;

        if(me._settings.isVerticalGrid()) {
            me._discretizerCore = new Gridifier.Discretizer.VerticalCore(
                me._gridifier, me._settings, me._sizesResolverManager
            );
        }
        else if(me._settings.isHorizontalGrid()) {
            me._discretizerCore = new Gridifier.Discretizer.HorizontalCore(
                me._gridifier, me._settings, me._sizesResolverManager
            );
        }

        if(me._showDemonstrator) {
            me._discretizationDemonstrator = new Gridifier.Discretizer.Demonstrator(
                me._gridifier, me._settings
            );
        }
        else {
            me._discretizationDemonstrator = {
                "create": function() { return; },
                "update": function() { return; },
                "delete": function() { return; }
            };
        }

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

Gridifier.Discretizer.IS_INTERSECTED_BY_ITEM = "isIntersectedByItem";
Gridifier.Discretizer.CELL_CENTER_X = "centerX";
Gridifier.Discretizer.CELL_CENTER_Y = "centerY";

Gridifier.Discretizer.prototype.discretizeGrid = function() {
    var discretizationHorizontalStep = this._connections.getMinConnectionWidth();
    var discretizationVerticalStep = this._connections.getMinConnectionHeight();

    if(this._settings.isDefaultAppend()) {
        this._cells = this._discretizerCore.discretizeGridWithDefaultAppend(
            discretizationHorizontalStep, discretizationVerticalStep
        );
    }
    else if(this._settings.isReversedAppend()) {
        this._cells = this._discretizerCore.discretizeGridWithReversedAppend(
            discretizationHorizontalStep, discretizationVerticalStep
        );
    }
}

Gridifier.Discretizer.prototype.intersectedCellsToCoords = function(cells) {
    var coords = {
        x1: cells[0].x1,
        x2: cells[0].x2,
        y1: cells[0].y1,
        y2: cells[0].y2
    };

    for(var i = 1; i < cells.length; i++) {
        if(cells[i].x1 < coords.x1)
            coords.x1 = cells[i].x1;

        if(cells[i].x2 > coords.x2)
            coords.x2 = cells[i].x2;

        if(cells[i].y1 < coords.y1)
            coords.y1 = cells[i].y1;

        if(cells[i].y2 > coords.y2)
            coords.y2 = cells[i].y2;
    }

    return coords;
}

Gridifier.Discretizer.prototype.markCellsIntersectedByItem = function(item, itemConnection) {
    for(var row = 0; row < this._cells.length; row++) {
        for(var col = 0; col < this._cells[row].length; col++) {
            var cellCoords = {
                x1: this._cells[row][col][Gridifier.Discretizer.CELL_CENTER_X],
                x2: this._cells[row][col][Gridifier.Discretizer.CELL_CENTER_X],
                y1: this._cells[row][col][Gridifier.Discretizer.CELL_CENTER_Y],
                y2: this._cells[row][col][Gridifier.Discretizer.CELL_CENTER_Y]
            };

            if(this._isCellIntersectedBy(cellCoords, itemConnection))
                this._cells[row][col][Gridifier.Discretizer.IS_INTERSECTED_BY_ITEM] = true;
            else
                this._cells[row][col][Gridifier.Discretizer.IS_INTERSECTED_BY_ITEM] = false;
        }
    }
}

Gridifier.Discretizer.prototype.getAllCellsWithIntersectedCenterData = function(intersectionCoords) {
    var cellsWithIntersectedCenter = [];
    var intersectedRowsCount = 0;
    var intersectedColsCount = 0;
    var intersectedCols = [];

    var isColumnAlreadyIntersected = function(col) {
        for(var i = 0; i < intersectedCols.length; i++) {
            if(intersectedCols[i] == col)
                return true;
        }

        return false;
    }

    for(var row = 0; row < this._cells.length; row++) {
        var isRowMarkedAsIntersected = false;
        var rowColumnsWithIntersectedCenter = [];

        for(var col = 0; col < this._cells[row].length; col++) {
            var cellCoords = {
                x1: this._cells[row][col][Gridifier.Discretizer.CELL_CENTER_X],
                x2: this._cells[row][col][Gridifier.Discretizer.CELL_CENTER_X],
                y1: this._cells[row][col][Gridifier.Discretizer.CELL_CENTER_Y],
                y2: this._cells[row][col][Gridifier.Discretizer.CELL_CENTER_Y]
            };

            if(this._isCellIntersectedBy(cellCoords, intersectionCoords)) {
                rowColumnsWithIntersectedCenter.push(this._cells[row][col]);

                if(!isRowMarkedAsIntersected) {
                    intersectedRowsCount++;
                    isRowMarkedAsIntersected = true;
                }

                if(!isColumnAlreadyIntersected(col)) {
                    intersectedColsCount++;
                    intersectedCols.push(col);
                }
            }
        }

        if(rowColumnsWithIntersectedCenter.length > 0)
            cellsWithIntersectedCenter.push(rowColumnsWithIntersectedCenter);
    }

    return {
        cellsWithIntersectedCenter: cellsWithIntersectedCenter,
        intersectedRowsCount: intersectedRowsCount,
        intersectedColsCount: intersectedColsCount
    };
}

Gridifier.Discretizer.prototype._isCellIntersectedBy = function(cellData, maybeIntersectionCoords) {
    var isAbove = (maybeIntersectionCoords.y1 < cellData.y1 && maybeIntersectionCoords.y2 < cellData.y1);
    var isBelow = (maybeIntersectionCoords.y1 > cellData.y2 && maybeIntersectionCoords.y2 > cellData.y2);
    var isBefore = (maybeIntersectionCoords.x1 < cellData.x1 && maybeIntersectionCoords.x2 < cellData.x1);
    var isBehind = (maybeIntersectionCoords.x1 > cellData.x2 && maybeIntersectionCoords.x2 > cellData.x2);

    if(!isAbove && !isBelow && !isBefore && !isBehind)
        return true;
    else
        return false;
}

Gridifier.Discretizer.prototype.normalizeItemNewConnectionHorizontalCoords = function(item, 
                                                                                      newConnectionCoords) {
    return this._discretizerCore.normalizeItemNewConnectionHorizontalCoords(
        item, newConnectionCoords
    );
}

Gridifier.Discretizer.prototype.normalizeItemNewConnectionVerticalCoords = function(item,
                                                                                    newConnectionCoords) {
    return this._discretizerCore.normalizeItemNewConnectionVerticalCoords(
        item, newConnectionCoords
    );
}

Gridifier.Discretizer.prototype.createDemonstrator = function() {
    this._discretizationDemonstrator.create(this._cells);
}

Gridifier.Discretizer.prototype.updateDemonstrator = function() {
    this._discretizationDemonstrator.update(this._cells);
}

Gridifier.Discretizer.prototype.deleteDemonstrator = function() {
    this._discretizationDemonstrator["delete"].call(this);
}