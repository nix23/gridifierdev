var CrsShifter = function() {
    this._crs = null;
    this._newCrs = null;
}

proto(CrsShifter, {
    attach: function(crs) {
        this._crs = crs;
        this._newCrs = [];
    },

    getNew: function() {
        return this._newCrs;
    },

    _createShifted: function(x, y, cr) {
        this._newCrs.push({
            type: cr.type,
            side: CRS.SHIFTED,
            x: parseFloat(x),
            y: parseFloat(y),
            itemGUID: Dom.int(cr.itemGUID)
        });
    },

    shiftAll: function() {
        var shifts = [
            [CR.LEFT.TOP, "LeftTop"],
            [CR.LEFT.BOTTOM, "LeftBottom"],
            [CR.BOTTOM.RIGHT, "BottomRight"],
            [CR.BOTTOM.LEFT, "TopLeft"],
            [CR.TOP.LEFT, "TopLeft"],
            [CR.TOP.RIGHT, "BottomRight"],
            [CR.RIGHT.BOTTOM, "RightBottom"],
            [CR.RIGHT.TOP, "RightTop"]
        ];

        for(var i = 0; i < this._crs.length; i++) {
            this._newCrs.push(this._crs[i]);

            for(var j = 0; j < shifts.length; j++) {
                if(connectors.eq(cr, shifts[i][0])) {
                    this["_shift" + shifts[i][1]](this._crs[i]);
                    break;
                }
            }
        }
    },

    _shiftLeftTop: function(cr) {
        var mostBottomCn = crsIntersector.mostBottomFromTopOrTopLeft(cr);
        if(mostBottomCn != null && mostBottomCn.y2 + 1 != cr.y)
            this._createShifted(cr.x, mostBottomCn.y2 + 1, cr);
        else if(cr.y != 0)
            this._createShifted(cr.x, 0, cr);
    },

    _shiftLeftBottom: function(cr) {
        var mostTopCn = crsIntersector.mostTopFromBottomOrBottomLeft(cr);
        if(mostTopCn != null && mostTopCn.y1 - 1 != cr.y)
            this._createShifted(cr.x, mostTopCn.y1 - 1, cr);
        else {
            var maxY = cnsCore.getMaxY();
            if(maxY != 0 && maxY - 1 != cr.y)
                this._createShifted(cr.x, maxY - 1, cr);
        }
    },

    _shiftBottomRight: function(cr) {
        var mostLeftCn = crsIntersector.mostLeftFromRight(cr);
        if(mostLeftCn != null && mostLeftCn.x1 - 1 != cr.x)
            this._createShifted(mostLeftCn.x1 - 1, cr.y, cr);
        else {
            // We shouldn't align prepended HG items to right corner(Layout will break)
            if(settings.eq("grid", "horizontal") && cr.type == CRS.PREPEND.DEF)
                return;

            if(cr.x != grid.x2())
                this._createShifted(grid.x2(), cr.y, cr);
        }
    },

    _shiftTopLeft: function(cr) {
        var mostRightCn = crsIntersector.mostRightFromLeft(cr);
        if(mostRightCn != null && mostRightCn.x2 + 1 != cr.x)
            this._createShifted(mostRightCn.x2 + 1, cr.y, cr);
        else if(cr.x != 0)
            this._createShifted(0, cr.y, cr);
    },

    _shiftRightBottom: function(cr) {
        var mostTopCn = crsIntersector.mostTopFromBottomOrBottomRight(cr);
        if(mostTopCn != null && mostTopCn.y1 - 1 != cr.y)
            this._createShifted(cr.x, mostTopCn.y1 - 1, cr);
        else {
            var maxY = cnsCore.getMaxY();
            if(maxY != 0 && maxY - 1 != cr.y)
                this._createShifted(cr.x, maxY - 1, cr);
        }
    },

    _shiftRightTop: function(cr) {
        var mostBottomCn = crsIntersector.mostBottomFromTopOrTopRight(cr);
        if(mostBottomCn != null && mostBottonCn.y2 + 1 != cr.y)
            this._createShifted(cr.x, mostBottomCn.y2 + 1, cr);
        else if(cr.y != 0)
            this._createShifted(cr.x, 0, cr);
    },

    _shiftAllTo: function(side, c, val) {
        this._newCrs = this._crs;
        for(var i = 0; i < this._newCrs.length; i++) {
            if(this._newCrs[i].side == side)
                this._newCrs[i][c] = val;
        }
    },

    shiftAllToRight: function(side) { this._shiftAllTo(side, "x", grid.x2()); },
    shiftAllToLeft: function(side) { this._shiftAllTo(side, "x", 0); },
    shiftAllToTop: function(side) { this._shiftAllTo(side, "y", 0); },
    shiftAllToBottom: function(side) { this._shiftAllTo(side, "y", grid.y()); }
});