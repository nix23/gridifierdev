var Position = function(inserter, op, crInitialCr, addItemCrs, cantFitCond) {
    this._op = op;
    this._crInitialCr = crInitialCr;
    this._addItemCrs = addItemCrs;
    this._cantFitCond = cantFitCond;

    inserter.recreateCrs = this._recreateCrs;
    inserter.createInitialCr = this._createInitialCr;
}

proto(Position, {
    initCrs: function(rmSide, rmAll1, rmAll2) {
        if(operation.isInitial(this._op)) {
            this._createInitialCr();
            return;
        }

        if(operation.isSameAsPrev(this._op))
            return;

        this._recreateCrs();
        /* @system-log-start */
        Logger.log(
            "initCrs",
            "isCurrOpSameAsPrev -> recreateCrs",
            connectors.get(),
            connections.get()
        );
        /* @system-log-end */
        crsCleaner["rmIntFrom" + rmSide]();
        /* @system-log-start */
        Logger.log(
            "initCrs",
            "isCurrOpSameAsPrev -> rmIntFrom" + rmSide,
            connectors.get(),
            connections.get()
        );
        /* @system-log-end */
        crsCleaner["rmAllToo" + rmAll1 + "FromMost" + rmAll2]();
        /* @system-log-start */
        Logger.log(
            "initCrs",
            "isCurrOpSameAsPrev -> rmAllToo" + rmAll1 + "FromMost" + rmAll2,
            connectors.get(),
            connections.get()
        );
        /* @system-log-end */
    },

    _createInitialCr: function() {
        this._crInitialCr(connectors, grid);
        /* @system-log-start */
        Logger.log(
            "initCrs",
            "isInitialOp -> createInitialCr",
            connectors.get(),
            connections.get()
        );
        /* @system-log-end */
    },

    _recreateCrs: function(disFlush) {
        var disFlush = disFlush || false;
        if(!disFlush) connectors.flush();

        var cns = connections.get();
        for(var i = 0; i < cns.length; i++)
            this._addItemCrs.call(this, cns[i], cns[i].itemGUID);

        if(connectors.count() == 0)
            this._createInitialCr();
    },

    cleanCrs: function(rmSide, rmAll1, rmAll2) {
        crsCleaner["rmAllToo" + rmAll1 + "FromMost" + rmAll2]();
        /* @system-log-start */
        Logger.log(
            "rmAllToo" + rmAll1 + "FromMost" + rmAll2,
            "---",
            connectors.get(),
            connections.get()
        );
        /* @system-log-end */
        crsCleaner["rmIntFrom" + rmSide]();
        /* @system-log-start */
        Logger.log(
            "rmIntFrom" + rmSide,
            "---",
            connectors.get(),
            connections.get()
        );
        /* @system-log-end */
    },

    filterCrs: function(selType, crSide, crSide1, crSide2, sortType) {
        var crs = connectors.getClone();

        crsSelector.attach(crs);
        crsSelector["selectOnlyFrom" + selType](crSide);
        crs = crsSelector.getSelected();
        /* @system-log-start */
        var logm = selType + "(" + crSide1 + "." + crSide2 + ")";
        Logger.log(
            "createCn",
            "filterCrs -> selectOnlyFrom" + logm,
            connectors,
            connections.get()
        );
        /* @system-log-end */

        if(settings.eq("intersections", true)) {
            crsShifter.attach(crs);
            crsShifter.shiftAll();
            crs = crsShifter.getNew();
            /* @system-log-start */
            Logger.log(
                "createCn",
                "filterCrs -> intersections(true) -> shiftAll crs",
                connectors,
                connections.get()
            );
            /* @system-log-end */
        }
        else {
            crsSelector.attach(crs);
            crsSelector["selectOnlyMost" + crSide1](crSide);
            crs = crsSelector.getSelected();
            /* @system-log-start */
            var logm = crSide1 + "(" + crSide1 + "." + crSide2 + ")";
            Logger.log(
                "createCn",
                "filterCrs -> intersections(false) -> selectOnlyMost" + logm,
                connectors,
                connections.get()
            );
            /* @system-log-end */

            crsShifter.attach(crs);
            crsShifter["shiftAllTo" + crSide2](crSide);
            crs = crsShifter.getNew();
            /* @system-log-start */
            var logm = crSide2 + "(" + crSide1 + "." + crSide2 + ")";
            Logger.log(
                "createCn",
                "filterCrs -> intersections(false) -> shiftAllTo" + logm,
                connectors,
                connections.get()
            );
            /* @system-log-end */
        }

        crsSorter.attach(crs);
        crsSorter["sortFor" + sortType]();

        return crsSorter.getSorted();
    },

    findCnCoords: function(item, sortedCrs, intType, guidSide, guidC, guidDir, intC) {
        var cnCoords = null;
        /* @system-log-start */
        Logger.startFindCnCoordsLog();
        /* @system-log-end */

        for(var i = 0; i < sortedCrs.length; i++) {
            /* @system-log-start */
            Logger.logInspectConnector(sortedCrs[i], connections.get());
            /* @system-log-end */
            var itemCoords = coordsFinder.find(this._op, item, sortedCrs[i]);

            if(this._cantFitCond.call(this, itemCoords)) {
                /* @system-log-start */
                Logger.logOutOfLayoutBounds(sortedCrs[i], itemCoords, connections.get());
                /* @system-log-end */
                continue;
            }

            var maybeIntCns = cnsIntersector["findAllMaybeIntOn" + intType](sortedCrs[i]);
            if(cnsIntersector.isIntersectingAny(maybeIntCns, itemCoords)) {
                /* @system-log-start */
                Logger.logIntFound(sortedCrs[i], itemCoords, maybeIntCns, connections.get());
                /* @system-log-end */
                continue;
            }

            cnCoords = itemCoords;
            var cnsOutsideCurr = connections["getAll" + guidSide](itemCoords[guidC]);
            if(cnsCore["isAnyGUID" + guidDir + "Than"](cnsOutsideCurr, item)) {
                /* @system-log-start */
                Logger.logWrongSorting(sortedCrs[i], itemCoords, cnsOutsideCurr, connections.get());
                /* @system-log-end */
                continue;
            }

            if(settings.eq("intersections", false) && connections["isIntMoreThanOneCn" + intC](cnCoords)) {
                /* @system-log-start */
                Logger.logIntersectionsError(sortedCrs[i], itemCoords, connections.get());
                /* @system-log-end */
                cnCoords = null;
            }

            if(cnCoords != null) {
                /* @system-log-start */
                Logger.logCnCoordsFound(sortedCrs[i], cnCoords, item, connections.get());
                Logger.stopFindCnCoordsLog();
                /* @system-log-end */
                break;
            }
        }

        if(cnCoords == null)
            err(E.TOO_BIG_ITEM);

        return cnCoords;
    },

    createCn: function(item, cnCoords, sortedCrs) {
        var cn = connections.add(item, cnCoords);

        if(settings.eq("intersections", false)) {
            if(settings.eq("grid", "vertical"))
                connections.expandYAllRowCnsToMostTall(cn);
            else
                connections.expandXAllColCnsToMostWide(cn);
            /* @system-log-start */
            Logger.log(
                "createCn",
                "intersections(false) -> expandXYCnsToMostBig",
                sortedCrs,
                connections.get()
            );
            /* @system-log-end */
        }

        this._addItemCrs.call(this, cn, guid.get(item));
        /* @system-log-start */
        Logger.log("cn created", "---", connectors.get(), connections.get());
        /* @system-log-end */

        return cn;
    },

    render: function(item, cn) {
        if(settings.eq("intersections", true))
            renderer.show(cn);
        else {
            if(settings.eq("grid", "vertical"))
                var rowColCns = connections.getLastRowYExpandedCns();
            else
                var rowColCns = connections.getLastColXExpandedCns();

            for(var i = 0; i < rowColCns.length; i++) {
                if(rowColCns[i].itemGUID == cn.itemGUID) {
                    rowColCns.splice(i, 1);
                    i--;
                }
            }

            renderer.renderAfterDelay(rowColCns);
            renderer.show(cn);
        }
    },

    fixAllXYPosAfterPrepend: function(cn, crs) {
        if(settings.eq("grid", "vertical"))
            var wf = connections.fixAllYPosAfterPrepend(cn, crs);
        else
            var wf = connections.fixAllXPosAfterPrepend(cn, crs);

        /* @system-log-start */
        Logger.log(
            "fixAllXYPosAfterPrepend",
            "---",
            connectors.get(),
            connections.get()
        );
        /* @system-log-end */
        return wf;
    },

    renderAfterPrependFix: function(cn) {
        renderer.render(connections.get(), [cn]);
        /* @system-log-start */
        Logger.log(
            "renderCnsAfterPrependFix",
            "---",
            connectors.get(),
            connections.get()
        );
        /* @system-log-end */
    }
});