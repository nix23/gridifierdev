var CrsCleaner = function() {
    this._cleaner = null;
}

proto(CrsCleaner, {
    _updateCleaner: function() {
        var cr = CRS.CLEANERS;
        this._cleaner = (settings.eq("sortDispersion", false)) ? cr.INSIDE_OR_BEFORE : cr.INSIDE;
    },

    _isInsideCleaner: function() {
        this._updateCleaner();
        return (this._cleaner == CRS.CLEANERS.INSIDE);
    },

    //_isInsideOrBeforeCleaner: function() {
    //    this._updateCleaner();
    //    return (this._cleaner == CR.CLEANERS.INSIDE_OR_BEFORE);
    //},

    _isMappedCrIntAnySideCn: function(mappedCr, c, c1, c2, XYIntCond) {
        var cns = connections.get();

        for(var i = 0; i < mappedCr.cnIndexes.length; i++) {
            for(var j = 0; j < mappedCr.cnIndexes[i].length; j++) {
                var cn = cns[mappedCr.cnIndexes[i][j]];
                crsRounder.roundCnPerCr(cn, mappedCr);
                if(mappedCr[c] >= cn[c1] && mappedCr[c] <= cn[c2] && XYIntCond.call(this, mappedCr, cn)) {
                    crsRounder.unroundCnPerCr(cn, mappedCr);
                    return true;
                }
                crsRounder.unroundCnPerCr(cn, mappedCr);
            }
        }

        return false;
    },

    _isMappedCrIntAnyTopCn: function(mappedCr) {
        return this._isMappedCrIntAnySideCn(mappedCr, "x", "x1", "x2", function(cr, cn) {
            return (this._isInsideCleaner()) ? (cr.y >= cn.y1 && cr.y <= cn.y2) : (cr.y >= cn.y1);
        });
    },
    _isMappedCrIntAnyBottomCn: function(mappedCr) {
        return this._isMappedCrIntAnySideCn(mappedCr, "x", "x1", "x2", function(cr, cn) {
            return (this._isInsideCleaner()) ? (cr.y <= cn.y2 && cr.y >= cn.y1) : (cr.y <= cn.y2);
        });
    },
    _isMappedCrIntAnyLeftCn: function(mappedCr) {
        return this._isMappedCrIntAnySideCn(mappedCr, "y", "y1", "y2", function(cr, cn) {
            return (this._isInsideCleaner()) ? (cr.x >= cn.x1 && cr.x <= cn.x2) : (cr.x >= cn.x1);
        });
    },
    _isMappedCrIntAnyRightCn: function(mappedCr) {
        return this._isMappedCrIntAnySideCn(mappedCr, "y", "y1", "y2", function(cr, cn) {
            return (this._isInsideCleaner()) ? (cr.x <= cn.x2 && cr.x >= cn.x1) : (cr.x <= cn.x2);
        });
    },

    _rmIntFrom: function(side, c, sortCond) {
        var crs = connectors.get();
        var mappedCrs = connectors.getClone();

        mappedCrs.sort(function(fst, snd) {
            if(fst[c] == snd[c]) return 0;
            else if(sortCond(fst[c], snd[c])) return -1;
            else return 1;
        });
        mappedCrs = connections["mapAllIntAnd" + side + "Cns"](mappedCrs);

        for(var i = 0; i < mappedCrs.length; i++) {
            var fn = "_isMappedCrIntAny" + side + "Cn";
            crs[mappedCrs[i].crIndex].isInt = this[fn](mappedCrs[i]);
        }
        
        for(var i = 0; i < crs.length; i++) {
            if(crs[i].isInt) { 
                crs.splice(i, 1);
                i--;
            }
        }
    },

    rmIntFromTop: function() { this._rmIntFrom("Top", "y", function(f, s) { return f.y > s.y; }); },
    rmIntFromBottom: function() { this._rmIntFrom("Bottom", "y", function(f, s) { return f.y < s.y; }); },
    rmIntFromLeft: function() { this._rmIntFrom("Left", "x", function(f, s) { return f.x > s.x; }); },
    rmIntFromRight: function() { this._rmIntFrom("Right", "x", function(f, s) { return f.x < s.x; }); },

    _rmAllTooFar: function(cond, cond2) {
        var crs = connectors.get();
        if(crs.length == 0) return;

        var mostSideCr = crs[0];
        for(var i = 1; i < crs.length; i++) {
            if(cond(crs[i], mostSideCr))
                mostSideCr = crs[i];
        }

        for(var i = 0; i < crs.length; i++) {
            if(cond2(crs[i], mostSideCr, Dom.int(settings.get("insertRange")))) {
                crs.splice(i, 1);
                i--;
            }
        }
    },
    _crSmCr: function(c) { return function(cr, msCr) { return cr[c] < msCr[c]; }; },
    _crBgCr: function(c) { return function(cr, msCr) { return cr[c] > msCr[c]; }; },
    _crSmValidC: function(c, mul) { return function(cr, msCr, ir) { return cr[c] < msCr[c] + ir * mul; }; },
    _crBgValidC: function(c, mul) { return function(cr, msCr, ir) { return cr[c] > msCr[c] + ir * mul; }; },

    rmAllTooBottomFromMostTop: function() { this._rmAllTooFar(this._crSmCr("y"), this._crBgValidC("y", 1)); },
    rmAllTooTopFromMostBottom: function() { this._rmAllTooFar(this._crBgCr("y"), this._crSmValidC("y", -1)); },
    rmAllTooRightFromMostLeft: function() { this._rmAllTooFar(this._crSmCr("x"), this._crBgValidC("x", 1)); },
    rmAllTooLeftFromMostRight: function() { this._rmAllTooFar(this._crBgCr("x"), this._crSmValidC("x", -1)); }
});