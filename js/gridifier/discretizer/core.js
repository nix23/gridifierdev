DiscretizerCore = function() {}

proto(DiscretizerCore, {
    _rev: function(cells) {
        var newCells = [];

        var rowsCount = 0;
        for(var i = 0; i < cells.length; i++) {
            if(cells[i].length > rowsCount)
                rowsCount = cells[i].length;
        }

        var currCol = 0;
        for(var swap = 0; swap < rowsCount; swap++) {
            var nextRow = [];

            for(var row = 0; row < cells.length; row++) {
                if(typeof cells[row][currCol] != "undefined")
                    nextRow.push(cells[row][currCol]);
            }

            newCells.push(nextRow);
            currCol++;
        }

        return newCells;
    },

    _coords: function(c) {
        c.isInt = false;
        c.centerX = c.x1 + ((c.x2 - c.x1 + 1) / 2);
        c.centerY = c.y1 + ((c.y2 - c.y1 + 1) / 2);

        return c;
    },

    _onDefAppend: function(c1Step, c2Step, gridC1, gridC2, createCoords) {
        var cells = [];
        var currC1 = -1;
        var createNextC1 = true;

        while(createNextC1) {
            var colsRows = [];
            var currC2 = -1;
            var createNextC2 = true;

            while(createNextC2) {
                currC2 += c2Step;
                if(currC2 > gridC2)
                    createNextC2 = false;
                else
                    colsRows.push(this._coords(createCoords(currC1, currC2, c1Step, c2Step)));
            }

            cells.push(colsRows);
            currC1 += c1Step;
            if(currC1 + c1Step > gridC1)
                createNextC1 = false;
        }

        return cells;
    },

    _onRevAppend: function(c1Step, c2Step, gridC1, gridC2, createCoords) {
        var cells = [];
        var currC1 = -1;
        var createNextC1 = true;

        while(createNextC1) {
            var rowsCols = [];
            var currC2 = gridC1 + 1;
            var createNextC2 = true;

            while(createNextC2) {
                currC2 -= c2Step;
                if(currC2 < 0)
                    createNextC2 = false;
                else
                    rowsCols.unshift(this._coords(createCoords(currC1, currC2, c1Step, c2Step)));
            }

            cells.push(rowsCols);
            currC1 += c1Step;
            if(currC1 + c1Step > gridC2)
                createNextC1 = false;
        }

        return cells;
    },

    discretizeOnDefAppend: function(xStep, yStep) {
        var cc = {
            vg: function(currY, currX, yStep, xStep) {
                return {
                    x1: currX - xStep + 1, x2: currX,
                    y1: currY + 1, y2: currY + yStep
                };
            },
            hg: function(currX, currY, xStep, yStep) {
                return {
                    x1: currX + 1, x2: currX + xStep,
                    y1: currY - yStep + 1, y2: currY
                };
            }
        };

        if(settings.eq("grid", "vertical"))
            return this._onDefAppend(yStep, xStep, grid.y2(), grid.x2(), cc.vg);
        else
            return this._rev(this._onDefAppend(xStep, yStep, grid.x2(), grid.y2(), cc.hg));
    },

    discretizeOnRevAppend: function(xStep, yStep) {
        var cc = {
            vg: function(currY, currX, yStep, xStep) {
                return {
                    x1: currX, x2: currX + xStep - 1,
                    y1: currY + 1, y2: currY + yStep
                };
            },
            hg: function(currX, currY, xStep, yStep) {
                return {
                    x1: currX + 1, x2: currX + xStep,
                    y1: currY, y2: currY + yStep - 1
                };
            }
        };

        if(settings.eq("grid", "vertical"))
            return this._onRevAppend(yStep, xStep, grid.x2(), grid.y2(), cc.vg);
        else
            return this._rev(this._onRevAppend(xStep, yStep, grid.y2(), grid.x2(), cc.hg));
    },

    _normalizeCnXYCoords: function(item, cn, size, c1, c2, gridC, fullCheck) {
        var cnSize = cn[c2] - cn[c1] + 1;
        var itemSize = srManager["outer" + size](item, true);

        if(cnSize < itemSize || itemSize < cnSize) {
            if(fullCheck) {
                if(settings.eq("append", "default"))
                    cn[c1] = cn[c2] - itemSize + 1;
                else
                    cn[c2] = cn[c1] + itemSize - 1;
            }
            else
                cn[c2] = cn[c1] + itemSize - 1;
        }

        if(cn[c1] < 0) {
            cn[c1] = 0;
            cn[c2] = itemSize - 1;
        }

        if(cn[c2] > gridC) {
            cn[c2] = gridC;
            cn[c1] = cn[c2] - itemSize + 1;
        }

        return cn;
    },

    normalizeCnXCoords: function(item, cn) {
        var params = [item, cn, "Width", "x1", "x2", grid.x2()];
        params.push(settings.eq("grid", "vertical"));

        return this._normalizeCnXYCoords.apply(this, params);
    },

    normalizeCnYCoords: function(item, cn) {
        var params = [item, cn, "Height", "y1", "y2", grid.y2()];
        params.push(!settings.eq("grid", "vertical"));

        return this._normalizeCnXYCoords.apply(this, params);
    }
});