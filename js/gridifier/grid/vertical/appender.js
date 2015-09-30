var VgAppender = function() {
    this._position = new Position(
        this,
        OPS.APPEND,
        function(crs) { crs.create(CRS.APPEND.DEF, CRS.RIGHT.TOP, 0, 0); },
        function(itemCoords, itemGUID) {
            if((itemCoords.x2 + 1) <= grid.x2()) {
                connectors.create(
                    CRS.APPEND.DEF,
                    CRS.RIGHT.TOP,
                    parseFloat(itemCoords.x2 + 1),
                    parseFloat(itemCoords.y1),
                    Dom.int(itemGUID)
                );
            }

            connectors.create(
                CRS.APPEND.DEF,
                CRS.BOTTOM.LEFT,
                parseFloat(itemCoords.x1),
                parseFloat(itemCoords.y2 + 1),
                Dom.int(itemGUID)
            );
        },
        function(ic) { return ic.x2 > rounder.fixHighRounding(grid.x2()); }
    );
}

proto(VgAppender, {
    position: function(item) {
        var position = this._position;
        position.initCrs("Bottom", "Top", "Bottom");

        var sortedCrs = position.filterCrs(
            "Prepended", CRS.BOTTOM.LEFT, "Bottom", "Left", "Append"
        );
        var cn = position.createCn(item, position.findCnCoords(
            item, sortedCrs, "VgAppend", "BelowY", "y2", "Smaller", "Y"
        ), sortedCrs);

        connections.attachToRanges(cn);
        position.cleanCrs("Bottom", "Top", "Bottom");
        position.render(item, cn);
    }
});