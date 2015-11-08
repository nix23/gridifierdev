Antialiaser = function() {
    this._shouldUpdateZ = false;
    this._disableZUpdates = false;
    this._updateZTimeout = null;

    var me = this;
    gridifier.onReposition(function() {
        if(!me._shouldUpdateZ || me._disableZUpdates) return;

        clearTimeout(me._updateZTimeout);
        me._updateZTimeout = setTimeout(function() {
            me._updateZ.call(me);
        }, C.UPDATE_Z_DELAY);
    });
    ev.onSetSettingForNzer(function(n) {
        var ns = ["widthPx", "heightPx", "widthPt", "heightPt"];
        var upd = false;

        for(var i = 0; i < ns.length; i++) {
            if(n == ns[i] + "As")
                upd = true;
        }

        if(upd) me.updateAs();
    });

    self(this, {
        disableZUpdates: function() {
            me._disableZUpdates = true;
            return gridifier;
        }
    });

    this.updateAs();
}

proto(Antialiaser, {
    updateAs: function() {
        var isWidthAsActive = this._updateAs("x", "width", "Width");
        var isHeightAsActive = this._updateAs("y", "height", "Height");
        this._shouldUpdateZ = (isWidthAsActive || isHeightAsActive);
    },

    _updateAs: function(c, prop, srmProp) {
        var pxAs = parseFloat(settings.get(prop + "PxAs"));
        var ptAs = parseFloat(settings.get(prop + "PtAs"));

        if(pxAs == 0 && ptAs == 0) {
            srManager["setOuter" + srmProp + "AntialiasValue"](0);
            return false;
        }

        if(ptAs != 0)
            var newPxAs = (grid[c + "2"]() + 1) * (ptAs / 100);
        else
            var newPxAs = pxAs;
        
        srManager["setOuter" + srmProp + "AntialiasValue"](newPxAs);
        return true;
    },

    _updateZ: function() {
        var calcAreas = function(cns) {
            for(var i = 0; i < cns.length; i++) {
                var w = Math.abs(cns[i].x2 - cns[i].x1) + 1;
                var h = Math.abs(cns[i].y2 - cns[i].y1) + 1;
                cns[i].normArea = Math.round(w * h);
            }
        }

        // Sort stability is not important here - each group will be resorted
        // with stable sort in consSorter.sortForReappend fn.
        var sortByAreas = function(fcn, scn) {
            if(fcn.normArea > scn.normArea)
                return 1;

            return (fcn.normArea < scn.normArea) ? -1 : 0;
        }

        var packByAreas = function(cns) {
            var packed = {};
            for(var i = 0; i < cns.length; i++) {
                if(typeof packed[cns[i].normArea] == "undefined")
                    packed[cns[i].normArea] = [];

                packed[cns[i].normArea].push(cns[i]);
            }

            return packed;
        }

        var cns = connections.get();
        calcAreas(cns);
        cns.sort(sortByAreas);

        var packedCns = packByAreas(cns);
        var areas = [];
        for(var area in packedCns) {
            packedCns[area] = cnsSorter.sortForReappend(packedCns[area]);
            areas.push(Dom.int(area));
        }

        // This sort will never return 0, because two arrays entries
        // with same area cannot be created.(So, this sort is stable too)
        areas.sort(function(fst, snd) {
            if(fst > snd)
                return 1;

            return (fst < snd) ? -1 : 0;
        });

        var nextZ = 1;
        for(var i = 0; i < areas.length; i++) {
            for(var j = 0; j < packedCns[areas[i]].length; j++) {
                packedCns[areas[i]][j].item.style.zIndex = nextZ;
                nextZ++;
            }
        }
    }
});