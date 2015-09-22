var CrsSelector = function() {
    this._crs = null;
}

proto(CrsSelector, {
    attach: function(crs) { this._crs = crs; },
    getSelected: function() { return this._crs; },

    _selectOnlyMostSideCr: function(side, c, cond) {
        var mostSideCrItemGUID = null;
        var mostSideCrC = null;

        var i = this._crs.length;
        while(i--) {
            if(this._crs[i].side == side) {
                if(mostSideCrItemGUID == null || cond(this._crs[i][c], mostSideCrC)) {
                    mostSideCrItemGUID = this._crs[i].itemGUID;
                    mostSideCrC = this._crs[i][c];
                }
            }
        }

        if(mostSideCrItemGUID == null)
            return;

        var i = this._crs.length;
        while(i--) {
            if(this._crs[i].side == side && this._crs[i].itemGUID != mostSideCrItemGUID)
                this._crs.splice(i, 1);
        }
    },
    _bgCond: function(crC, mscrC) { return crC > mscrC; },
    _smCond: function(crC, mscrC) { return crC < mscrC; },

    selectOnlyMostBottom: function(side) {
        this._selectOnlyMostSideCr(side, "y", this._bgCond);
    },
    selectOnlyMostTop: function(side) {
        this._selectOnlyMostSideCr(side, "y", this._smCond);
    },
    selectOnlyMostRight: function(side) {
        this._selectOnlyMostSideCr(side, "x", this._bgCond);
    },
    selectOnlyMostLeft: function(side) {
        this._selectOnlyMostSideCr(side, "x", this._smCond);
    },

    _selectOnly: function(side, cond) {
        for(var i = 0; i < this._crs.length; i++) {
            if(!connectors.isInitial(this._crs[i]) &&
               cond(this._crs[i].itemGUID) &&
               side != this._crs[i].side) {
                this._crs.splice(i, 1);
                i--;
            }
        }
    },

    selectOnlyFromAppended: function(side) {
        this._selectOnly(side, function(itemGUID) { return !guid.wasPrepended(itemGUID); });
    },
    selectOnlyFromPrepended: function(side) {
        this._selectOnly(side, function(itemGUID) { return guid.wasPrepended(itemGUID); });
    }
});