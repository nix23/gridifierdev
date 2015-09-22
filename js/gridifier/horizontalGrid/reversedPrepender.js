var HgReversedPrepender = function() {
    this._position = new Position(
        this,
        OPS.REV_PREPEND,
        function(crs, grid) {
            crs.create(CRS.PREPEND.REV, CRS.LEFT.TOP, 0, 0);
        },
        function(itemCoords, itemGUID) {
            if((itemCoords.y2 + 1) <= grid.y2()) {
                connectors.create(
                    CRS.PREPEND.REV,
                    CRS.BOTTOM.RIGHT,
                    parseFloat(itemCoords.x2),
                    parseFloat(itemCoords.y2 + 1),
                    Dom.int(itemGUID)
                );
            }

            connectors.create(
                CRS.PREPEND.REV,
                CRS.LEFT.TOP,
                parseFloat(itemCoords.x1 - 1),
                parseFloat(itemCoords.y1),
                Dom.int(itemGUID)
            );
        },
        function(ic) { return ic.y2 > rounder.fixHighRounding(grid.y2()); }
    );
}

proto(HgReversedPrepender, {
    position: function(item) {
        var position = this._position;
        position.initCrs("Left", "Right", "Left");

        var sortedCrs = position.filterCrs(
            "Appended", CRS.LEFT.TOP, "Left", "Top", "Prepend"
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