DragifierCells = function() {}

proto(DragifierCells, {
    getIntCellsData: function(cn) {
        var intCells = discretizer.getAllCellsWithIntCenter(cn);

        // If we have started drag from not covered by discretizator corner,
        // we can get into situation, when dragged item isn't intersecting any discretizator cell center,
        // so we should fix it. (In this situation item should cover 1 cell center).
        if(intCells.int.cols == 0 && intCells.int.rows == 0) {
            intCells.int.cols = 1;
            intCells.int.rows = 1;
        };

        return intCells;
    },

    isAnyIntCellEmpty: function(intCellsData) {
        var intCells = intCellsData.intCells;

        var isEmpty = false;
        for(var row = 0; row < intCells.length; row++) {
            for(var col = 0; col < intCells[row].length; col++) {
                if(!intCells[row][col].isInt)
                    isEmpty = true;
            }
        }

        return isEmpty;
    },

    isIntEnoughRowsAndCols: function(origCells, newCells) {
        if(newCells.int.rows < origCells.int.rows || newCells.int.cols < origCells.int.cols)
            return false;

        return true;
    },

    // Sometimes on the start of the drag dragged item can cover fractional count of cells,
    // for example 3 full cells and 1/4 of fourth cell.(Center is not intersected) After draggable item clone
    // movement it can intersect 4 cell centers, but we should still cover only 3 full cells. Later we will align
    // the item to the most left or most right(most bottom or top vertically) side of all cells and depending on
    // insertion type(Reversed or Default append) and will ensure, that draggable item is not out of grid bounds.
    normalizeOverflowedCells: function(intByCloneCells, origCells, newCells) {
        if(newCells.int.rows > origCells.int.rows) {
            var rowDiff = newCells.int.rows - origCells.int.rows;
            for(var i = 0; i < rowDiff; i++)
                intByCloneCells.pop();
        }

        if(newCells.int.cols > origCells.int.cols) {
            var colDiff = newCells.int.cols - origCells.int.cols;
            for(var row = 0; row < intByCloneCells.length; row++) {
                for(var i = 0; i < colDiff; i++)
                    intByCloneCells[row].pop();
            }
        }

        var merged = [];
        for(var row = 0; row < intByCloneCells.length; row++) {
            for(var col = 0; col < intByCloneCells[row].length; col++)
                merged.push(intByCloneCells[row][col]);
        }

        return merged;
    }
});