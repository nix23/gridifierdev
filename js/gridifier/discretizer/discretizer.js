Discretizer = function() {
    this._cells = [];
}

proto(Discretizer, {
    cells: function() {
        return this._cells;
    },

    discretize: function() {
        var xStep = cnsCore.getMinWidth();
        var yStep = cnsCore.getMinHeight();

        var fn = (settings.eq("append", "default")) ? "Def" : "Rev";
        this._cells = discretizerCore["discretizeOn" + fn + "Append"](xStep, yStep);
    },

    intCellsToCoords: function(cells) {
        var coords = {
            x1: cells[0].x1, x2: cells[0].x2,
            y1: cells[0].y1, y2: cells[0].y2
        };

        for(var i = 1; i < cells.length; i++) {
            if(cells[i].x1 < coords.x1) coords.x1 = cells[i].x1;
            if(cells[i].x2 > coords.x2) coords.x2 = cells[i].x2;
            if(cells[i].y1 < coords.y1) coords.y1 = cells[i].y1;
            if(cells[i].y2 > coords.y2) coords.y2 = cells[i].y2;
        }

        return coords;
    },

    markIntCellsBy: function(cn) {
        for(var row = 0; row < this._cells.length; row++) {
            for(var col = 0; col < this._cells[row].length; col++) {
                var cell = this._cells[row][col];
                var coords = {
                    x1: cell.centerX, x2: cell.centerX,
                    y1: cell.centerY, y2: cell.centerY
                };

                this._cells[row][col].isInt = cnsIntersector.isIntersectingAny([coords], cn);
            }
        }
    },

    getAllCellsWithIntCenter: function(intCoords) {
        var intCells = [];
        var intCols = [];
        var int = {rows: 0, cols: 0};

        var isColInt = function(col) {
            for(var i = 0; i < intCols.length; i++) {
                if(intCols[i] == col)
                    return true;
            }

            return false;
        }

        for(var row = 0; row < this._cells.length; row++) {
            var isRowMarked = false;
            var rowColsWithIntCenter = [];

            for(var col = 0; col < this._cells[row].length; col++) {
                var cell = this._cells[row][col];
                var coords = {
                    x1: cell.centerX, x2: cell.centerX,
                    y1: cell.centerY, y2: cell.centerY
                };

                if(cnsIntersector.isIntersectingAny([coords], intCoords)) {
                    rowColsWithIntCenter.push(cell);
                    if(!isRowMarked) {
                        int.rows++;
                        isRowMarked = true;
                    }

                    if(!isColInt(col)) {
                        int.cols++;
                        intCols.push(col);
                    }
                }
            }

            if(rowColsWithIntCenter.length > 0)
                intCells.push(rowColsWithIntCenter);
        }

        return {intCells: intCells, int: int};
    }
});