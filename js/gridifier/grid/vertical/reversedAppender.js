var VgReversedAppender = function() {
    this._position = new Position(
        this,
        OPS.REV_APPEND,
        function(crs, grid) {
            crs.create(CRS.APPEND.REV, CRS.LEFT.TOP, parseFloat(grid.x2()), 0);
        },
        function(itemCoords, itemGUID) {
            if((itemCoords.x1 - 1) >= 0) {
                connectors.create(
                    CRS.APPEND.REV,
                    CRS.LEFT.TOP,
                    parseFloat(itemCoords.x1 - 1),
                    parseFloat(itemCoords.y1),
                    Dom.int(itemGUID)
                );
            }

            connectors.create(
                CRS.APPEND.REV,
                CRS.BOTTOM.RIGHT,
                parseFloat(itemCoords.x2),
                parseFloat(itemCoords.y2 + 1),
                Dom.int(itemGUID)
            );
        },
        function(ic) { return ic.x1 < rounder.fixLowRounding(0); }
    );
}

proto(VgReversedAppender, {
    position: function(item) {
        var position = this._position;
        position.initCrs("Bottom", "Top", "Bottom");

        var sortedCrs = position.filterCrs(
            "Prepended", CRS.BOTTOM.RIGHT, "Bottom", "Right", "Append"
        );
        var cn = position.createCn(item, position.findCnCoords(
            item, sortedCrs, "VgAppend", "BelowY", "y2", "Smaller", "Y"
        ), sortedCrs);

        connections.attachToRanges(cn);
        position.cleanCrs("Bottom", "Top", "Bottom");
        position.render(item, cn);
    }
});