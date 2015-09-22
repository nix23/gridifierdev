var HgPrepender = function() {
    this._position = new Position(
        this,
        OPS.PREPEND,
        function(crs, grid) {
            crs.create(CRS.PREPEND.DEF, CRS.TOP.RIGHT, 0, grid.y2());
        },
        function(itemCoords, itemGUID) {
            if((itemCoords.y1 - 1) >= 0) {
                connectors.create(
                    CRS.PREPEND.DEF,
                    CRS.TOP.RIGHT,
                    parseFloat(itemCoords.x2),
                    parseFloat(itemCoords.y1 - 1),
                    Dom.int(itemGUID)
                );
            }

            connectors.create(
                CRS.PREPEND.DEF,
                CRS.LEFT.BOTTOM,
                parseFloat(itemCoords.x1 - 1),
                parseFloat(itemCoords.y2),
                Dom.int(itemGUID)
            );
        },
        function(ic) { return ic.y1 < rounder.fixLowRounding(0); }
    );
}

proto(HgPrepender, {
    position: function(item) {
        var position = this._position;
        position.initCrs("Left", "Right", "Left");

        var sortedCrs = position.filterCrs(
            "Appended", CRS.LEFT.BOTTOM, "Left", "Bottom", "Prepend"
        );
        var cn = position.createCn(item, position.findCnCoords(
            item, sortedCrs, "HgPrepend", "BeforeX", "x1", "Bigger", "X"
        ), sortedCrs);
        guid.markIfFirstPrepended(item);
        var wereFixed = position.fixAllXYPosAfterPrepend(cn, connectors.get());

        connections.attachToRanges(cn);
        position.cleanCrs("Left", "Right", "Left");

        if(wereFixed) position.renderAfterPrependFix(cn);
        position.render(item, cn);
    }
});