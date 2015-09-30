var HgConnections = function() {
    this._cns = [];
}

proto(HgConnections, {
    reinitRanges: function() { cnsRanges.init("x1", "x2"); },
    attachToRanges: function(cn) { cnsRanges.attachCn(cn, connections.get().length - 1, "x1", "x2"); },

    mapAllIntAndLeftCns: function(sortedCrs) {
        var cr = cnsRanges;
        return cnsRanges.mapAllIntAndSideCns(
            sortedCrs, "x", "x1", "x2", cr.lastRngIndexFn(), cr.lastRngIndexFn(), cr.lowerCrCnIndexesFn(), cr.decFn()
        );
    },

    mapAllIntAndRightCns: function(sortedCrs) {
        var cr = cnsRanges;
        return cnsRanges.mapAllIntAndSideCns(
            sortedCrs, "x", "x1", "x2", cr.firstRngIndexFn(), cr.lastRngIndexFn(), cr.upperCrCnIndexesFn(), cr.incFn()
        );
    },

    getAllIntYCns: function(cr) { return cnsRanges.getAllCnsFromIntRange(cr.x, "x1", "x2"); },
    getAllIntYAndLeftCns: function(cr) { return cnsRanges.getAllCnsFromIntAndTLSideRgs(cr.x, "x1", "x2"); },
    getAllIntYAndRightCns: function(cr) { return cnsRanges.getAllCnsFromIntAndRBSideRgs(cr.x, "x1", "x2"); },

    getLastColXExpandedCns: function() { return cnsXYIntersector.getLastXYExpandedCns(); },

    isIntMoreThanOneCnX: function(ic) { return cnsXYIntersector.isIntMoreThanOneCnXY(ic, "x1", "x2"); },
    getMostWideFromAllYIntCns: function(ic) { return cnsXYIntersector.getMostBigFromAllXYIntCns(ic, "x1", "x2"); },
    getAllXIntCns: function(ic) { return cnsXYIntersector.getAllXYIntCns(ic, "x1", "x2"); },
    expandXAllColCnsToMostWide: function(ic) {
        return cnsXYIntersector.expandXYAllCnsToMostBig(ic, "x1", "x2", "hOffset", "Width");
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
        cnsCore.restore(cns, function(cns, lastCn, setCn) {
            var nextFakeY = lastCn.y2 + 1;
            for(var i = 0; i < cns.length; i++) {
                setCn(cns[i], lastCn.x1, nextFakeY++);
            }
        }, function(cns, lastCn, setCn) {
            var nextFakeY = lastCn.y1 - 1;
            for(var i = 0; i < cns.length; i++) {
                setCn(cns[i], lastCn.x1, nextFakeY--);
            }
        });
        this.restore(cns);
    },
    getAllBehindX: function(x) {
        return cnsCore.getAllBACoord(x, function(cn, c) { return cn.x1 > c; });
    },
    getAllBeforeX: function(x) {
        return cnsCore.getAllBACoord(x, function(cn, c) { return cn.x2 < c; });
    },
    fixAllXPosAfterPrepend: function(newCn, crs) {
        return cnsCore.fixAllXYPosAfterPrepend(newCn, crs, "x", "x1", "x2");
    }
});