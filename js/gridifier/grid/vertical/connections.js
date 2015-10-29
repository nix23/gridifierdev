var VgConnections = function() {
    this._cns = [];
}

proto(VgConnections, {
    reinitRanges: function() { cnsRanges.init("y1", "y2"); },
    attachToRanges: function(cn) { cnsRanges.attachCn(cn, connections.get().length - 1, "y1", "y2"); },

    mapAllIntAndTopCns: function(sortedCrs) {
        var cr = cnsRanges;
        return cnsRanges.mapAllIntAndSideCns(
            sortedCrs, "y", "y1", "y2", cr.lastRngIndexFn(), cr.lastRngIndexFn(), cr.lowerCrCnIndexesFn(), cr.decFn()
        );
    },

    mapAllIntAndBottomCns: function(sortedCrs) {
        var cr = cnsRanges;
        return cnsRanges.mapAllIntAndSideCns(
            sortedCrs, "y", "y1", "y2", cr.firstRngIndexFn(), cr.lastRngIndexFn(), cr.upperCrCnIndexesFn(), cr.incFn()
        );
    },

    getAllIntXCns: function(cr) { return cnsRanges.getAllCnsFromIntRange(cr.y, "y1", "y2"); },
    getAllIntXAndTopCns: function(cr) { return cnsRanges.getAllCnsFromIntAndTLSideRgs(cr.y, "y1", "y2"); },
    getAllIntXAndBottomCns: function(cr) { return cnsRanges.getAllCnsFromIntAndRBSideRgs(cr.y, "y1", "y2"); },

    getLastRowYExpandedCns: function() { return cnsXYIntersector.getLastXYExpandedCns(); },

    isIntMoreThanOneCnY: function(ic) { return cnsXYIntersector.isIntMoreThanOneCnXY(ic, "y1", "y2"); },
    getMostTallFromAllYIntCns: function(ic) { return cnsXYIntersector.getMostBigFromAllXYIntCns(ic, "y1", "y2"); },
    getAllYIntCns: function(ic) { return cnsXYIntersector.getAllXYIntCns(ic, "y1", "y2"); },
    expandYAllRowCnsToMostTall: function(ic) {
        return cnsXYIntersector.expandXYAllCnsToMostBig(ic, "y1", "y2", "vOffset", "Height");
    },

    get: function() { return this._cns; },
    count: function() { return this._cns.length; },
    restore: function(cns) { this._cns = this._cns.concat(cns); },
    add: function(item, itemCnCoords) {
        var cn = cnsCore.create(item, itemCnCoords);
        this._cns.push(cn);
        ev.emit(EV.REPOSITION, cn.item, cn, this);
        return cn;
    },
    rm: function(cn) { cnsCore.rm(this._cns, cn); },

    restoreOnSortDispersion: function(cns) {
        cnsCore.restoreOnSortDispersion(cns, function(cns, lastCn, setCn) {
            var nextFakeX = lastCn.x2 + 1;
            for(var i = 0; i < cns.length; i++) {
                setCn(cns[i], nextFakeX++, lastCn.y1);
            }
        }, function(cns, lastCn, setCn) {
            var nextFakeX = lastCn.x1 - 1;
            for(var i = 0; i < cns.length; i++) {
                setCn(cns[i], nextFakeX--, lastCn.y1);
            }
        });
        this.restore(cns);
    },
    getAllBelowY: function(y) {
        return cnsCore.getAllBACoord(y, function(cn, c) { return cn.y1 > c; });
    },
    getAllAboveY: function(y) {
        return cnsCore.getAllBACoord(y, function(cn, c) { return cn.y2 < c; });
    },
    fixAllYPosAfterPrepend: function(newCn, crs) {
        return cnsCore.fixAllXYPosAfterPrepend(newCn, crs, "y", "y1", "y2");
    }
});