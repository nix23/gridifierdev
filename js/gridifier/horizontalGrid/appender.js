var HgAppender = function() {
    this._position = new Position(
        this,
        OPS.APPEND,
        function(crs) { crs.create(CRS.APPEND.DEF, CRS.RIGHT.TOP, 0, 0); },
        function(itemCoords, itemGUID) {
            if((itemCoords.y2 + 1) <= grid.y2()) {
                connectors.create(
                    CRS.APPEND.DEF,
                    CRS.BOTTOM.LEFT,
                    parseFloat(itemCoords.x1),
                    parseFloat(itemCoords.y2 + 1),
                    Dom.int(itemGUID)
                );
            }

            connectors.create(
                CRS.APPEND.DEF,
                CRS.RIGHT.TOP,
                parseFloat(itemCoords.x2 + 1),
                parseFloat(itemCoords.y1),
                Dom.int(itemGUID)
            );
        },
        function(ic) { return ic.y2 > rounder.fixHighRounding(grid.y2()); }
    );
}

proto(HgAppender, {
    position: function(item) {
        var position = this._position;
        position.initCrs("Right", "Left", "Right");

        var sortedCrs = position.filterCrs(
            "Prepended", CRS.RIGHT.TOP, "Right", "Top", "Append"
        );
        var cn = position.createCn(item, position.findCnCoords(
            item, sortedCrs, "HgAppend", "BehindX", "x2", "Smaller", "X"
        ), sortedCrs);

        connections.attachToRanges(cn);
        position.cleanCrs("Right", "Left", "Right");
        position.render(item, cn);
    }
});