var VgPrepender = function() {
    this._position = new Position(
        this,
        OPS.PREPEND,
        function(crs) {
            crs.create(CRS.PREPEND.DEF, CRS.RIGHT.BOTTOM, 0, 0);
        },
        function(itemCoords, itemGUID) {
            if((itemCoords.x2 + 1) <= grid.x2()) {
                connectors.create(
                    CRS.PREPEND.DEF,
                    CRS.RIGHT.BOTTOM,
                    parseFloat(itemCoords.x2 + 1),
                    parseFloat(itemCoords.y2),
                    Dom.int(itemGUID)
                );
            }

            connectors.create(
                CRS.PREPEND.DEF,
                CRS.TOP.LEFT,
                parseFloat(itemCoords.x1),
                parseFloat(itemCoords.y1 - 1),
                Dom.int(itemGUID)
            );
        },
        function(ic) { return ic.x2 > rounder.fixHighRounding(grid.x2()); }
    );
}

proto(VgPrepender, {
    position: function(item) {
        var position = this._position;
        position.initCrs("Top", "Bottom", "Top");

        var sortedCrs = position.filterCrs(
            "Appended", CRS.TOP.LEFT, "Top", "Left", "Prepend"
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