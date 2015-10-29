var CnsXYIntersector = function() {
    this._lastXYExpandedCns = [];
}

proto(CnsXYIntersector, {
    _isBefore: function(cn1, cn2, c1, c2) { return (cn1[c1] < cn2[c1] && cn1[c2] < cn2[c1]); },
    _isAfter: function(cn1, cn2, c1, c2) { return (cn1[c1] > cn2[c2] && cn1[c2] > cn2[c2]); },

    getLastXYExpandedCns: function() {
        return this._lastXYExpandedCns;
    },

    isIntMoreThanOneCnXY: function(ic, c1, c2) {
        var i = this;
        var cns = connections.get();
        var intCnIndexes = [];

        var isIntXYAnyFromAlreadyInt = function(cn) {
            if(intCnIndexes.length == 0)
                return false;

            for(var j = 0; j < intCnIndexes.length; j++) {
                var intCn = cns[intCnIndexes[j]];

                // Additional rounding is required on cn to cn comparison
                var intCnOrigC1 = intCn[c1];
                var intCnOrigC2 = intCn[c2];
                intCn[c1] = Math.ceil(intCn[c1]);
                intCn[c2] = Math.floor(intCn[c2]);

                var isBefore = i._isBefore(cn, intCn, c1, c2);
                var isAfter = i._isAfter(cn, intCn, c1, c2);
                intCn[c1] = intCnOrigC1;
                intCn[c2] = intCnOrigC2;

                if(!isBefore && !isAfter)
                    return true;
            }

            return false;
        }

        var intCnsCount = 0;
        for(var j = 0; j < cns.length; j++) {
            if(!i._isBefore(ic, cns[j], c1, c2) && !i._isAfter(ic, cns[j], c1, c2) &&
               !isIntXYAnyFromAlreadyInt(cns[j])) {
                intCnIndexes.push(j);
                intCnsCount++;
            }
        }
        
        return intCnsCount > 1;
    },

    getMostBigFromAllXYIntCns: function(ic, c1, c2) {
        var cns = connections.get();
        var mostBigIntCn = null;

        for(var i = 0; i < cns.length; i++) {
            if(!this._isBefore(ic, cns[i], c1, c2) && !this._isAfter(ic, cns[i], c1, c2)) {
                if(mostBigIntCn == null)
                    mostBigIntCn = cns[i];
                else {
                    var cnSize = Math.abs(cns[i][c2] - cns[i][c1]);
                    var mostBigIntCnSize = Math.abs(mostBigIntCn[c2] - mostBigIntCn[c1]);

                    if(cnSize > mostBigIntCnSize)
                        mostBigIntCn = cns[i];
                }
            }
        }

        return mostBigIntCn;
    },

    getAllXYIntCns: function(ic, c1, c2) {
        var cns = connections.get();
        var intCns = [];

        for(var i = 0; i < cns.length; i++) {
            if(!this._isBefore(ic, cns[i], c1, c2) && !this._isAfter(ic, cns[i], c1, c2))
                intCns.push(cns[i]);
        }

        return intCns;
    },

    expandXYAllCnsToMostBig: function(cn, c1, c2, offset, outer) {
        var eq = bind("eq", settings);
        var mostBigCn = this.getMostBigFromAllXYIntCns(cn, c1, c2);
        if(mostBigCn == null) return;

        var cnsToE = this.getAllXYIntCns(cn, c1, c2);
        var expandedCns = [];

        for(var i = 0; i < cnsToE.length; i++) {
            cnsToE[i][c1] = mostBigCn[c1];
            cnsToE[i][c2] = mostBigCn[c2];

            if(eq("align", "left") || eq("align", "top")) {
                if(cnsToE[i][offset] != 0)
                    expandedCns.push(cnsToE[i]);

                cnsToE[i][offset] = 0;
            }
            else {
                var itemSize = srManager["outer" + outer](cnsToE[i].item, true);
                if(eq("align", "center"))
                    var newOffset = (Math.abs(cnsToE[i][c2] - cnsToE[i][c1] + 1) / 2) - (itemSize / 2);
                else
                    var newOffset = Math.abs(cnsToE[i][c2] - cnsToE[i][c1] + 1) - itemSize;

                if(cnsToE[i][offset] != newOffset) {
                    cnsToE[i][offset] = newOffset;
                    expandedCns.push(cnsToE[i]);
                }
            }
        }

        // We should rerender only cns with new v/h offsets.('Freezes' on rerender in some br-rs)
        this._lastXYExpandedCns = expandedCns;
    }
});