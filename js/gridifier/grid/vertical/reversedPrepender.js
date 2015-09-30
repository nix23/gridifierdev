var VgReversedPrepender = function() {
    this._position = new Position(
        this,
        OPS.REV_PREPEND,
        function(crs, grid) {
            crs.create(CRS.PREPEND.REV, CRS.LEFT.BOTTOM, grid.x2(), 0);
        },
        function(itemCoords, itemGUID) {
            if((itemCoords.x1 - 1) >= 0) {
                connectors.create(
                    CRS.PREPEND.REV,
                    CRS.LEFT.BOTTOM,
                    parseFloat(itemCoords.x1 - 1),
                    parseFloat(itemCoords.y2),
                    Dom.int(itemGUID)
                );
            }

            connectors.create(
                CRS.PREPEND.REV,
                CRS.TOP.RIGHT,
                parseFloat(itemCoords.x2),
                parseFloat(itemCoords.y1 - 1),
                Dom.int(itemGUID)
            );
        },
        function(ic) { return ic.x1 < rounder.fixLowRounding(0); }
    );
}

proto(VgReversedPrepender, {
    position: function(item) {
        var position = this._position;
        position.initCrs("Top", "Bottom", "Top");

        var sortedCrs = position.filterCrs(
            "Appended", CRS.TOP.RIGHT, "Top", "Right", "Prepend"
        );
        var cn = position.createCn(item, position.findCnCoords(
            item, sortedCrs, "VgPrepend", "AboveY", "y1", "Bigger", "Y"
        ), sortedCrs);
        guid.markIfFirstPrepended(item);
        var wereFixed = position.fixAllXYPosAfterPrepend(cn, connectors.get());

        connections.attachToRanges(cn);
        position.cleanCrs("Top", "Bottom", "Top");

        if(wereFixed) position.renderAfterPrependFix(cn);
        position.render(item, cn);
    }
});