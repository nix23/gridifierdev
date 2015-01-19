Gridifier.VerticalGrid.DragifierDiscretizator = function(gridifier, connections, guid, settings) {
    var me = this;

    this._gridifier = null;
    this._connections = null;
    this._guid = null;
    this._settings = null;

    this._cells = [];

    // @todo -> remove ???
    this._discretizationDemonstrator = null;

    this._css = {

    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._connections = connections;
        me._guid = guid;
        me._settings = settings;
    };

    this._bindEvents = function() {
        ;
    };

    this._unbindEvents = function() {
        ;
    };

    this.destruct = function() {
        me._unbindEvents();
    };

    this._construct();
    return this;
}

Gridifier.VerticalGrid.DragifierDiscretizator.prototype.discretizeGrid = function(draggableItem, draggableItemConnection) {
    var discretizationHorizontalStep = this._connections.getMinConnectionWidth() - 1;
    var discretizationVerticalStep = this._connections.getMinConnectionHeight() - 1;

    var cellWidth = SizesResolverManager.outerWidth(draggableItem, true);
    var cellHeight = SizesResolverManager.outerHeight(draggableItem, true);

    if(this._settings.isDefaultAppend()) {
        this._discretizeGridWithDefaultAppendMode(
            discretizationHorizontalStep,
            discretizationVerticalStep,
            cellWidth,
            cellHeight
        );
    }
    else if(this._settings.isReversedAppend()) {
        // @todo -> Create in other direction
    }
    this.markCellsIntersectedByDraggableItem(draggableItem, draggableItemConnection);
    this._demonstrateDiscretization();
}

Gridifier.VerticalGrid.DragifierDiscretizator.prototype.getIntersectedRowsAndColsCount = function(intersectionCoords, 
                                                                                                  compareOnlyCellCenter) {
    var compareOnlyCellCenter = compareOnlyCellCenter || false;
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

        for(var col = 0; col < this._cells[row].length; col++) {
            if(compareOnlyCellCenter) {
                var cellCoords = {
                    x1: this._cells[row][col].centerX,
                    x2: this._cells[row][col].centerX,
                    y1: this._cells[row][col].centerY,
                    y2: this._cells[row][col].centerY
                };
            }
            else {
                var cellCoords = this._cells[row][col];
            }

            if(this._isCellIntersectedBy(cellCoords, intersectionCoords)) {
                console.log("is intersected");
                console.log("cell coords = ", cellCoords);
                console.log("intersection coords = ", intersectionCoords);
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
    }

    return {
        intersectedRowsCount: intersectedRowsCount,
        intersectedColsCount: intersectedColsCount
    };
}

Gridifier.VerticalGrid.DragifierDiscretizator.prototype.markCellsIntersectedByDraggableItem = function(draggableItem,
                                                                                                       draggableItemConnection) {
    for(var row = 0; row < this._cells.length; row++) {
        for(var col = 0; col < this._cells[row].length; col++) {
            if(this._isCellIntersectedBy(this._cells[row][col], draggableItemConnection))
                this._cells[row][col].isIntersectedByDraggableItem = true;
            else
                this._cells[row][col].isIntersectedByDraggableItem = false;
        }
    }
}

Gridifier.VerticalGrid.DragifierDiscretizator.prototype._isCellIntersectedBy = function(cellData, maybeIntersectionCoords) {
    var isAbove = (maybeIntersectionCoords.y1 < cellData.y1 && maybeIntersectionCoords.y2 < cellData.y1);
    var isBelow = (maybeIntersectionCoords.y1 > cellData.y2 && maybeIntersectionCoords.y2 > cellData.y2);
    var isBefore = (maybeIntersectionCoords.x1 < cellData.x1 && maybeIntersectionCoords.x2 < cellData.x1);
    var isBehind = (maybeIntersectionCoords.x1 > cellData.x2 && maybeIntersectionCoords.x2 > cellData.x2);

    if(!isAbove && !isBelow && !isBefore && !isBehind)
        return true;
    else
        return false;
}

// Gridifier.VerticalGrid.DragifierDiscretizator.prototype.getAllIntersectedCells = function(itemCoords) {
//     var intersectedCells = [];
//     for(var row = 0; row < this._cells.length; row++) {
//         for(var col = 0; col < this._cells[row].length; col++) {
//             if(this._isCellIntersectedBy(this._cells[row][col], itemCoords))
//                 intersectedCells.push(this._cells[row][col]);
//         }
//     }

//     return intersectedCells;
// }

Gridifier.VerticalGrid.DragifierDiscretizator.prototype.getAllCellsWithIntersectedCenterData = function(intersectionCoords) {
    var cellsWithIntersectedCenter = [];
    var intersectedCellsCountData = this.getIntersectedRowsAndColsCount(intersectionCoords, true);

    for(var row = 0; row < this._cells.length; row++) {
        for(var col = 0; col < this._cells[row].length; col++) {
            var cellData = {
                x1: this._cells[row][col].centerX,
                x2: this._cells[row][col].centerX,
                y1: this._cells[row][col].centerY,
                y2: this._cells[row][col].centerY
            };

            if(this._isCellIntersectedBy(cellData, intersectionCoords)) {
                cellsWithIntersectedCenter.push(this._cells[row][col]);
            }
        }
    }

    return {
        cellsWithIntersectedCenter: cellsWithIntersectedCenter,
        intersectedRowsCount: intersectedCellsCountData.intersectedRowsCount,
        intersectedColsCount: intersectedCellsCountData.intersectedColsCount 
    };
}

Gridifier.VerticalGrid.DragifierDiscretizator.prototype._discretizeGridWithDefaultAppendMode = function(discretizationHorizontalStep,
                                                                                                        discretizationVerticalStep,
                                                                                                        cellWidth,
                                                                                                        cellHeight) {
    this._cells = [];
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
                    y2: currentY + 1 + discretizationVerticalStep,
                    isIntersectedByDraggableItem: false
                };
                var columnWidth = nextColumn.x2 - nextColumn.x1 + 1;
                var columnHeight = nextColumn.y2 - nextColumn.y1 + 1;

                nextColumn.centerX = nextColumn.x1 + (columnWidth / 2);
                nextColumn.centerY = nextColumn.y1 + (columnHeight / 2);

                rowColumns.unshift(nextColumn);
            }
        }

        this._cells.push(rowColumns);

        currentY += discretizationVerticalStep + 1;
        if(currentY + 1 + discretizationVerticalStep > gridY2)
            createNextRow = false;
    }
}

Gridifier.VerticalGrid.DragifierDiscretizator.prototype._discretizeGridWithReversedAppendMode = function(discretizationHorizontalStep,
                                                                                                         discretizationVerticalStep,
                                                                                                         cellWidth,
                                                                                                         cellHeight) {
    // @todo -> Create in other direction
}

Gridifier.VerticalGrid.DragifierDiscretizator.prototype.updateDiscretizationDemonstrator = function() {
    if(this._discretizationDemonstrator != null) {
        this._discretizationDemonstrator.parentNode.removeChild(this._discretizationDemonstrator);
        this._discretizationDemonstrator = null;
    }

    this._demonstrateDiscretization();
}

// @todo -> Tmp method???
Gridifier.VerticalGrid.DragifierDiscretizator.prototype._demonstrateDiscretization = function() { //return;
    var demonstrator = document.createElement("div");
    this._gridifier.getGrid().appendChild(demonstrator);
    this._discretizationDemonstrator = demonstrator;

    Dom.css.set(demonstrator, {
        width: (this._gridifier.getGridX2() + 1) + "px",
        height: (this._gridifier.getGridY2() + 1) + "px",
        background: "rgb(235,235,235)",
        position: "absolute",
        left: "0px",
        top: "0px",
        zIndex: "100",
        opacity: "0.8"
    });

    // @todo -> Replace with real event
    var me = this;
    $(demonstrator).on("click", function() {
        $(this).get(0).parentNode.removeChild($(this).get(0));
        me._discretizationDemonstrator = null;
    });

    var borderColors = ["gridFirstBorderColor", "gridSecondBorderColor", "gridThirdBorderColor",
                        "gridFourthBorderColor", "gridFifthBorderColor"];
    var currentBorderColor = -1;

    for(var row = 0; row < this._cells.length; row++) {
        for(var col = 0; col < this._cells[row].length; col++) {
            var cellDemonstrator = document.createElement("div");
            var cellWidth = this._cells[row][col].x2 - this._cells[row][col].x1 + 1;
            var cellHeight = this._cells[row][col].y2 - this._cells[row][col].y1 + 1;

            currentBorderColor++;
            if(currentBorderColor == 5) {
                borderColors.reverse();
                currentBorderColor = 0;
            }
            cellDemonstrator.setAttribute("class", borderColors[currentBorderColor]);

            Dom.css.set(cellDemonstrator, {
                position: "absolute",
                boxSizing: "border-box",
                left: this._cells[row][col].x1 + "px",
                top: this._cells[row][col].y1 + "px",
                width: cellWidth + "px",
                height: cellHeight + "px",
                border: "5px dashed"
            });

            if(this._cells[row][col].isIntersectedByDraggableItem) {
                cellDemonstrator.style.background = "red";
                cellDemonstrator.style.opacity = "1";
            }

            demonstrator.appendChild(cellDemonstrator);

            var centerPointDemonstrator = document.createElement("div");
            Dom.css.set(centerPointDemonstrator, {
                position: "absolute",
                left: this._cells[row][col].centerX + "px",
                top: this._cells[row][col].centerY + "px",
                width: "5px",
                height: "5px",
                background: "black"
            });

            demonstrator.appendChild(centerPointDemonstrator);
        }
    }
}