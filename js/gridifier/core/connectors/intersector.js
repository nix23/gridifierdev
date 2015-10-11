var CrsIntersector = function() {}

proto(CrsIntersector, {
    _mostYClose: function(cr, cond1, cond2, cond3, getIntCnsVg, getIntCnsHg) {
        var cns = connections.get();
        var mostCloseCn = null;
        var intersectedCnIndexes = (settings.eq("grid", "vertical")) ? getIntCnsVg(cr) : getIntCnsHg(cr);

        for(var i = 0; i < intersectedCnIndexes.length; i++) {
            for(var j = 0; j < intersectedCnIndexes[i].length; j++) {
                var cn = cns[intersectedCnIndexes[i][j]];

                if(((cr.x >= cn.x1 && cr.x <= cn.x2) || cond1(cr, cn)) && cond2(cr, cn)) {
                    if(mostCloseCn == null)
                        mostCloseCn = cn;
                    else {
                        if(cond3(cn, mostCloseCn))
                            mostCloseCn = cn;
                    }
                }
            }
        }

        return mostCloseCn;
    },

    _crXBgCnX2: function(cr, cn) { return cr.x > cn.x2; },
    _crXSmCnX1: function(cr, cn) { return cr.x < cn.x1; },

    _crYBgCnY2: function(cr, cn) { return cr.y > cn.y2; },
    _crYSmCnY1: function(cr, cn) { return cr.y < cn.y1; },

    _cnX1BgCnX2: function(cn, mcn) { return cn.x1 > mcn.x2; },
    _cnX1SmCnX1: function(cn, mcn) { return cn.x1 < mcn.x1; },
    _cnY2BgCnY2: function(cn, mcn) { return cn.y2 > mcn.y2; },
    _cnY1SmCnY1: function(cn, mcn) { return cn.y1 < mcn.y1; },

    _intXCns: function(cr) { return connections.getAllIntXCns(cr); },
    _intXAndUpperCns: function(cr) { return connections.getAllIntXAndTopCns(cr); },
    _intXAndLowerCns: function(cr) { return connections.getAllIntXAndBottomCns(cr); },
    _intYAndLeftCns: function(cr) { return connections.getAllIntYAndLeftCns(cr); },
    _intYAndRightCns: function(cr) { return connections.getAllIntYAndRightCns(cr); },

    mostBottomFromTopOrTopLeft: function(cr) {
        var i = this;
        return this._mostYClose(
            cr, i._crXBgCnX2, i._crYBgCnY2, i._cnY2BgCnY2, i._intXAndUpperCns, i._intYAndLeftCns
        );
    },

    mostBottomFromTopOrTopRight: function(cr) {
        var i = this;
        return this._mostYClose(
            cr, i._crXSmCnX1, i._crYBgCnY2, i._cnY2BgCnY2, i._intXAndUpperCns, i._intYAndRightCns
        );
    },

    mostTopFromBottomOrBottomLeft: function(cr) {
        var i = this;
        return this._mostYClose(
            cr, i._crXBgCnX2, i._crYSmCnY1, i._cnY1SmCnY1, i._intXAndLowerCns, i._intYAndLeftCns
        );
    },

    mostTopFromBottomOrBottomRight: function(cr) {
        var i = this;
        return this._mostYClose(
            cr, i._crXSmCnX1, i._crYSmCnY1, i._cnY1SmCnY1, i._intXAndLowerCns, i._intYAndRightCns
        );
    },

    _mostXClose: function(cr, cond1, cond2, getIntCnsVg, getIntCnsHg) {
        var cns = connections.get();
        var mostCloseCn = null;

        var cnFinder = function(cn) {
            if(cr.y >= cn.y1 && cr.y <= cn.y2 && cond1(cr, cn)) {
                if(mostCloseCn == null)
                    mostCloseCn = cn;
                else {
                    if(cond2(cn, mostCloseCn))
                        mostCloseCn = cn;
                }
            }
        }

        if(settings.eq("grid", "vertical")) {
            var intCnIndexes = getIntCnsVg(cr);
            for(var i = 0; i < intCnIndexes.length; i++)
                cnFinder(cns[intCnIndexes[i]]);
        }
        else {
            var intCnIndexes = getIntCnsHg(cr);
            for(var i = 0; i < intCnIndexes.length; i++) {
                for(var j = 0; j < intCnIndexes[i].length; j++)
                    cnFinder(cns[intCnIndexes[i][j]]);
            }
        }

        return mostCloseCn;
    },

    mostLeftFromRight: function(cr) {
        var i = this;
        return this._mostXClose(cr, i._crXSmCnX1, i._cnX1SmCnX1, i._intXCns, i._intYAndRightCns);
    },

    mostRightFromLeft: function(cr) {
        var i = this;
        return this._mostXClose(cr, i._crXBgCnX2, i._cnX1BgCnX2, i._intXCns, i._intYAndLeftCns);
    }
});