var CnsCore = function() {}

proto(CnsCore, {
    find: function(item, disableCheck) {
        var disableCheck = disableCheck || false;
        var cns = connections.get();

        if(!disableCheck && cns.length == 0)
            err(E.NO_CNS);

        var itemGUID = guid.get(item);
        var cn = null;
        for(var i = 0; i < cns.length; i++) {
            if(itemGUID == cns[i].itemGUID) {
                cn = cns[i];
                break;
            }
        }

        if(cn == null) {
            if(!repositionQueue.isEmpty()) {
                var queued = repositionQueue.getQueued();
                for(var i = 0; i < queued.length; i++) {
                    if(itemGUID == queued[i].cn.itemGUID) {
                        cn = queued[i].cn;
                        break;
                    }
                }
            }
        }

        if(!disableCheck && cn == null)
            err(E.CANT_FIND_CN);

        return cn;
    },

    create: function(item, cn) {
        var props = ["x1", "x2", "y1", "y2"];
        for(var i = 0; i < props.length; i++) {
            var prop = props[i];
            var orig = cn[prop];
            cn[prop] = Dom.toFixed(cn[prop], 2);
            if(isNaN(cn[prop])) cn[prop] = orig;
        }
        
        cn.item = item;
        cn.itemGUID = guid.get(item);
        cn.hOffset = (Dom.hasOwnProp(cn, "hOffset")) ? cn.hOffset : 0;
        cn.vOffset = (Dom.hasOwnProp(cn, "vOffset")) ? cn.vOffset : 0;
        cn.restrictCollect = (Dom.hasOwnProp(cn, "restrictCollect")) ? cn.restrictCollect : false;

        if(!gridItem.isConnected(item))
            gridItem.markAsConnected(item);

        return cn;
    },

    rm: function(cns, cn) {
        for(var i = 0; i < cns.length; i++) {
            if(guid.get(cn.item) == guid.get(cns[i].item)) {
                cns.splice(i, 1);
                return;
            }
        }
    },

    _remapGUIDS: function(cns) {
        for(var i = 0; i < cns.length; i++)
            cns[i].itemGUID = guid.markForAppend(cns[i].item);
    },

    remapAllGUIDS: function() {
        guid.reinit();
        this._remapGUIDS(cnsSorter.sortForReappend(connections.get()));
    },

    remapGUIDSIn: function(cns) {
        this._remapGUIDS(cns);
    },

    getByGUIDS: function(guids) {
        var allCns = connections.get();
        var cns = [];

        for(var i = 0; i < allCns.length; i++) {
            for(var j = 0; j < guids.length; j++) {
                if(allCns[i].itemGUID == guids[j]) {
                    cns.push(allCns[i]);
                    break;
                }
            }
        }

        return cns;
    },

    syncParams: function(cnsData) {
        var cns = connections.get();
        var params = ["x1", "x2", "y1", "y2", "hOffset", "vOffset", "restrictCollect"];

        for(var i = 0; i < cnsData.length; i++) {
            for(var j = 0; j < cns.length; j++) {
                if(cnsData[i].itemGUID == cns[j].itemGUID) {
                    for(var k = 0; k < params.length; k++)
                        cns[j][params[k]] = cnsData[i][params[k]];

                    break;
                }
            }
        }
    },

    _getMinSize: function(c1, c2, gridSize, size) {
        var cns = connections.get();
        if(cns.length == 0)
            return 0;

        // Sometimes fast dragging breaks coordinates of some connections.(Fix)
        var getCnSize = function(i) {
            if(cns[i][c1] >= cns[i][c2] || cns[i][c1] < 0 || cns[i][c2] > gridSize)
                return srManager["outer" + size](cns[i].item, true);
            else
                return cns[i][c2] - cns[i][c1] + 1;
        }

        var minSize = getCnSize(0);
        for(var i = 1; i < cns.length; i++) {
            var cnSize = getCnSize(i);
            if(cnSize < minSize)
                minSize = cnSize;
        }

        return minSize;
    },

    getMinWidth: function() {
        return this._getMinSize("x1", "x2", grid.x2(), "Width");
    },

    getMinHeight: function() {
        return this._getMinSize("y1", "y2", grid.y2(), "Height");
    },

    _compareGUIDS: function(cnsToCompare, item, compFn) {
        var itemGUID = guid.get(item);
        for(var i = 0; i < cnsToCompare.length; i++) {
            if(compFn(guid.get(cnsToCompare[i].item), itemGUID))
                return true;
        }

        return false;
    },

    isAnyGUIDSmallerThan: function(cnsToCompare, item) {
        return this._compareGUIDS(cnsToCompare, item, function(a, b) { return a < b; });
    },

    isAnyGUIDBiggerThan: function(cnsToCompare, item) {
        return this._compareGUIDS(cnsToCompare, item, function(a, b) { return a > b; });
    },

    getMaxY: function() {
        var cns = connections.get();
        var maxY = 0;
        for(var i = 0; i < cns.length; i++) {
            if(cns[i].y2 > maxY)
                maxY = cns[i].y2;
        }

        return maxY;
    },

    restoreOnSortDispersion: function(cns, da, ra) {
        var currCns = cnsSorter.sortForReappend(connections.get());
        var lastCn = currCns[currCns.length - 1];
        var setCn = function(cn, xv, yv) {
            cn.x1 = xv;
            cn.x2 = xv;
            cn.y1 = yv;
            cn.y2 = yv;
        }

        if(settings.eq("append", "default"))
            da(cns, lastCn, setCn);
        else
            ra(cns, lastCn, setCn);
    },

    getAllBACoord: function(coord, cond) {
        var allCns = connections.get();
        var cns = [];

        for(var i = 0; i < allCns.length; i++) {
            if(settings.eq("sortDispersion", false) && cond(allCns[i], coord))
                cns.push(allCns[i]);
        }

        return cns;
    },

    fixAllXYPosAfterPrepend: function(newCn, crs, c, c1, c2) {
        if(newCn[c1] >= 0) return false;

        var incXYPosBy = Math.round(Math.abs(newCn[c1]));
        newCn[c2] = Math.abs(newCn[c1] - newCn[c2]);
        newCn[c1] = 0;

        var cns = connections.get();
        for(var i = 0; i < cns.length; i++) {
            if(newCn.itemGUID == cns[i].itemGUID)
                continue;

            cns[i][c1] += incXYPosBy;
            cns[i][c2] += incXYPosBy;
        }

        for(var i = 0; i < crs.length; i++)
            crs[i][c] += incXYPosBy;

        cnsRanges.incAllBy(incXYPosBy, c1, c2);
        cnsRanges.createPrepended(newCn[c1], newCn[c2], c1, c2);

        return true;
    }
});