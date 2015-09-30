var HgReversedAppender = function() {
    this._position = new Position(
        this,
        OPS.REV_APPEND,
        function(crs, grid) {
            crs.create(CRS.APPEND.REV, CRS.TOP.LEFT, 0, parseFloat(grid.y2()));
        },
        function(itemCoords, itemGUID) {
            if((itemCoords.y1 - 1) >= 0) {
                connectors.create(
                    CRS.APPEND.REV,
                    CRS.TOP.LEFT,
                    parseFloat(itemCoords.x1),
                    parseFloat(itemCoords.y1 - 1),
                    Dom.int(itemGUID)
                );
            }

            connectors.create(
                CRS.APPEND.REV,
                CRS.RIGHT.BOTTOM,
                parseFloat(itemCoords.x2 + 1),
                parseFloat(itemCoords.y2),
                Dom.int(itemGUID)
            );
        },
        function(ic) { return ic.y1 < rounder.fixLowRounding(0); }
    );
}

proto(HgReversedAppender, {
    position: function(item) {
        var position = this._position;
        position.initCrs("Right", "Left", "Right");

        var sortedCrs = position.filterCrs(
            "Prepended", CRS.RIGHT.BOTTOM, "Right", "Bottom", "Append"
        );
        var cn = position.createCn(item, position.findCnCoords(
            item, sortedCrs, "HgAppend", "BehindX", "x2", "Smaller", "X"
        ), sortedCrs);

        connections.attachToRanges(cn);
        position.cleanCrs("Right", "Left", "Right");
        position.render(item, cn);
    }
});