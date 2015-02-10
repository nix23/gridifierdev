Gridifier.Dragifier.Cells = function(discretizer) {
    var me = this;

    this._discretizer = null;

    this._css = {
    };

    this._construct = function() {
        me._discretizer = discretizer;

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

Gridifier.Dragifier.Cells.prototype.getIntersectedByDraggableItemCellCentersData = function(draggableItemConnection) {
    var intersectedByDraggableItemCellCentersData = this._discretizer.getAllCellsWithIntersectedCenterData(
        draggableItemConnection
    );

    // If we have started drag from not covered by discretizator corner,
    // we can get into situation, when dragged item isn't intersecting any discretizator cell center,
    // so we should fix it. (In this situation item should cover 1 cell center).
    if(intersectedByDraggableItemCellCentersData.intersectedColsCount == 0 &&
        intersectedByDraggableItemCellCentersData.intersectedRowsCount == 0) {
        intersectedByDraggableItemCellCentersData.intersectedRowsCount = 1;
        intersectedByDraggableItemCellCentersData.intersectedColsCount = 1;
    }

    return intersectedByDraggableItemCellCentersData;
}

Gridifier.Dragifier.Cells.prototype.isAtLeastOneOfIntersectedCellCentersEmpty = function(intersectedByDraggableItemCloneCellCentersData) {
    var intersectedByDraggableItemCloneCellCenters = intersectedByDraggableItemCloneCellCentersData.cellsWithIntersectedCenter;

    var isAtLeastOneOfIntersectedCellCentersEmpty = false;
    for(var row = 0; row < intersectedByDraggableItemCloneCellCenters.length; row++) {
        for(var col = 0; col < intersectedByDraggableItemCloneCellCenters[row].length; col++) {
            if(!intersectedByDraggableItemCloneCellCenters[row][col][Gridifier.Discretizer.IS_INTERSECTED_BY_ITEM]) 
                isAtLeastOneOfIntersectedCellCentersEmpty = true;
        }
    }

    return isAtLeastOneOfIntersectedCellCentersEmpty;
}

Gridifier.Dragifier.Cells.prototype.isIntersectingEnoughRowsAndCols = function(originalCellsCount,
                                                                                                           newCellsCount) {
    if(newCellsCount.intersectedRowsCount < originalCellsCount.intersectedRowsCount ||
        newCellsCount.intersectedColsCount < originalCellsCount.intersectedColsCount) {
        return false;
    }

    return true;
}

/*
    Sometimes on the start of the drag dragged item can cover fractional count of cells,
    for example 3 full cells and 1/4 of fourth cell.(Center is not intersected) After draggable item clone
    movement it can intersect 4 cell centers, but we should still cover only 3 full cells. Later we will align
    the item to the most left or most right(most bottom or top vertically) side of all cells and depending on
    insertion type(Reversed or Default append) and will ensure, that draggable item is not out of grid bounds.
*/
Gridifier.Dragifier.Cells.prototype.normalizeCellsWithMaybeIntersectionOverflows = function(intersectedByDraggableItemCloneCellCenters,
                                                                                                                        originalCellsCount,
                                                                                                                        newCellsCount) {
    if(newCellsCount.intersectedRowsCount > originalCellsCount.intersectedRowsCount) {
        var rowsDifference = newCellsCount.intersectedRowsCount - originalCellsCount.intersectedRowsCount;
        for(var i = 0; i < rowsDifference; i++) {
            intersectedByDraggableItemCloneCellCenters.pop();
        }
    }

    if(newCellsCount.intersectedColsCount > originalCellsCount.intersectedColsCount) {
        var colsDifference = newCellsCount.intersectedColsCount - originalCellsCount.intersectedColsCount;
        for(var row = 0; row < intersectedByDraggableItemCloneCellCenters.length; row++) {
            for(var i = 0; i < colsDifference; i++) {
                intersectedByDraggableItemCloneCellCenters[row].pop();
            }
        }
    }

    var mergedIntersectedByDraggableItemCloneCellCenters = [];
    for(var row = 0; row < intersectedByDraggableItemCloneCellCenters.length; row++) {
        for(var col = 0; col < intersectedByDraggableItemCloneCellCenters[row].length; col++) {
            mergedIntersectedByDraggableItemCloneCellCenters.push(
                intersectedByDraggableItemCloneCellCenters[row][col]
            );
        }
    }

    return mergedIntersectedByDraggableItemCloneCellCenters;
}