var RepositionData = function() {}

proto(RepositionData, {
    get: function(cnsToRps, firstRpsCn) {
        var cns = connections.get();
        var eq = bind("eq", settings);

        for(var i = 0; i < cns.length; i++) {
            if(cns[i].restrictCollect)
                continue;

            // Default or no intersections check is required here, because we are
            // reappending items from random position. In such case we should
            // reappend all row items in NIS mode.
            if(eq("sortDispersion", false) && eq("intersections", true)) {
                if(cns[i].itemGUID >= firstRpsCn.itemGUID) {
                    cnsToRps.push(cns[i]);
                    cns.splice(i, 1);
                    i--;
                }
            }
            // When intersections eq false, we should reappend all row/col items.
            // (Height/Width of transformed item may become smaller).
            else if(eq("intersections", false)) {
                if(eq("grid", "vertical"))
                    var cond = cns[i].y2 >= firstRpsCn.y1;
                else
                    var cond = cns[i].x2 >= firstRpsCn.x1;

                if(cond) {
                    cnsToRps.push(cns[i]);
                    cns.splice(i, 1);
                    i--;
                }
            }
            else if(eq("sortDispersion", true)) {
                if(this._getSDCond(cns[i], firstRpsCn)) {
                    cnsToRps.push(cns[i]);
                    cns.splice(i, 1);
                    i--;
                }
            }
        }

        var sortedCnsToRps = cnsSorter.sortForReappend(cnsToRps);
        var itemsToRps = [];
        for(var i = 0; i < sortedCnsToRps.length; i++)
            itemsToRps.push(sortedCnsToRps[i].item);

        return {
            items: itemsToRps,
            cns: cnsToRps,
            firstCn: sortedCnsToRps[0]
        };
    },

    _getSDCond: function(cn, fcn) {
        var eq = bind("eq", settings);
        if(eq("grid", "vertical")) {
            if(eq("append", "default"))
                var cond = (cn.y1 > fcn.y1 || (cn.y1 == fcn.y1 && cn.x1 >= fcn.x1));
            else
                var cond = (cn.y1 > fcn.y1 || (cn.y1 == fcn.y1 && cn.x1 <= fcn.x2));
        }
        else {
            if(eq("append", "default"))
                var cond = (cn.x1 > fcn.x1 || (cn.x1 == fcn.x1 && cn.y1 >= fcn.y1));
            else
                var cond = (cn.x1 > fcn.x1 || (cn.x1 == fcn.x1 && cn.y1 <= fcn.y2));
        }

        return cond;
    },

    getForRepositionAll: function(cns) {
        var itemsToRps = [];
        var cnsToKeep = [];
        var cnsToRps = [];

        this._findCns(cns, itemsToRps, cnsToKeep, cnsToRps);
        var firstCnToRps = this._findFirstCnToRps(cns, cnsToKeep);

        return {items: itemsToRps, cns: cnsToRps, firstCn: firstCnToRps};
    },

    _findCns: function(cns, itemsToRps, cnsToKeep, cnsToRps) {
        for(var i = 0; i < cns.length; i++) {
            if(!cns[i].restrictCollect) {
                itemsToRps.push(cns[i].item);
                cnsToRps.push(cns[i]);
            }
            else
                cnsToKeep.push(cns[i]);
        }
    },

    _findFirstCnToRps: function(cns, cnsToKeep) {
        var first = null;
        if(cnsToKeep.length == 0) {
            first = cns[0];
            cns.splice(0, cns.length);
        }
        else {
            for(var i = 0; i < cns.length; i++) {
                var shouldRpsCn = true;
                for(var j = 0; j < cnsToKeep.length; j++) {
                    if(cnsToKeep[j].itemGUID == cns[i].itemGUID) {
                        shouldRpsCn = false;
                        break;
                    }
                }

                if(shouldRpsCn) {
                    first = cns[i];
                    break;
                }
            }

            cns.splice(0, cns.length);
            for(var i = 0; i < cnsToKeep.length; i++)
                cns.push(cnsToKeep[i]);
        }

        return first;
    }
});