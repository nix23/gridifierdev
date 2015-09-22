var CrsSorter = function() {
    this._crs = null;
}

proto(CrsSorter, {
    attach: function(crs) { this._crs = crs; },
    getSorted: function() { return this._crs; },

    _sortForVG: function(isPrep, isDef) {
        this._crs.sort(function(first, second) {
            if(Dom.areRoundedOrCeiledEq(first.y, second.y)) {
                if(isPrep) {
                    if(isDef) return ((first.x > second.x) ? 1 : -1);
                    else return ((first.x < second.x) ? 1 : -1);
                }
                else {
                    if(isDef) return ((first.x > second.x) ? -1 : 1);
                    else return ((first.x < second.x) ? -1 : 1);
                }
            }
            else {
                if(isPrep) return ((first.y < second.y) ? 1 : -1);
                else return ((first.y < second.y) ? -1 : 1);
            }
        });
    },

    _sortForHG: function(isPrep, isDef) {
        this._crs.sort(function(first, second) {
            if(Dom.areRoundedOrCeiledEq(first.x, second.x)) {
                if(isPrep) {
                    if(isDef) return ((first.y < second.y) ? 1 : -1);
                    else return ((first.y > second.y) ? 1 : -1);
                }
                else {
                    if(isDef) return ((first.y < second.y) ? -1 : 1);
                    else return ((first.y > second.y) ? -1 : 1);
                }
            }
            else {
                if(isPrep) return ((first.x < second.x) ? 1 : -1);
                else return ((first.x < second.x) ? -1 : 1);
            }
        });
    },

    sortForPrepend: function() {
        var isDef = (settings.get("prepend") == "default");
        if(settings.eq("grid", "vertical"))
            this._sortForVG(true, isDef);
        else
            this._sortForHG(true, isDef);
    },

    sortForAppend: function() {
        var isDef = (settings.get("append") == "default");
        if(settings.eq("grid", "vertical"))
            this._sortForVG(false, isDef);
        else
            this._sortForHG(false, isDef);
    }
});