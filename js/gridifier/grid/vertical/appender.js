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
        if(typeof window.isProfiling == "undefined") {
            window.isProfiling = true;
            window.profileInitCrs = 0;
            window.profileSort = 0;
            window.profileCreateCn = 0;
            window.profileAttach = 0;
            window.profileClean = 0;
            window.profileRender = 0;

            window.debugProfiler = function() {
                console.log("isProf: " + window.isProfiling);
                console.log("profileInitCrs: " + window.profileInitCrs);
                console.log("profileSort: " + window.profileSort);
                console.log("profileCreateCn: " + window.profileCreateCn);
                console.log("profileAttach: " + window.profileAttach);
                console.log("profileClean: " + window.profileClean);
                console.log("profileRender: " + window.profileRender);
            }
        }

        microProfiler.start("init");
        var position = this._position;
        position.initCrs("Bottom", "Top", "Bottom");
        window.profileInitCrs += parseFloat(microProfiler.get());

        microProfiler.start("sort");
        var sortedCrs = position.filterCrs(
            "Prepended", CRS.BOTTOM.LEFT, "Bottom", "Left", "Append"
        );
        window.profileSort += parseFloat(microProfiler.get());
        microProfiler.start("create cn");
        var cn = position.createCn(item, position.findCnCoords(
            item, sortedCrs, "VgAppend", "BelowY", "y2", "Smaller", "Y"
        ), sortedCrs);
        window.profileCreateCn = parseFloat(microProfiler.get());

        microProfiler.start("attachToRanges");
        connections.attachToRanges(cn);
        window.profileAttach += parseFloat(microProfiler.get());
        microProfiler.start("cleanCrs");
        position.cleanCrs("Bottom", "Top", "Bottom");
        window.profileClean += parseFloat(microProfiler.get());
        microProfiler.start("render");
        position.render(item, cn);
        window.profileRender += parseFloat(microProfiler.get());
    }
});