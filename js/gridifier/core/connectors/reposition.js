var RepositionCrs = function() {}

proto(RepositionCrs, {
    recreateForFirst: function(item, cn) {
        if(settings.eq("append", "reversed")) {
            operation.setLast(OPS.REV_APPEND);
            this._recreate(item, cn, reversedAppender, "Rev");
        }
        else {
            operation.setLast(OPS.APPEND);
            this._recreate(item, cn, appender, "Def");
        }
    },

    _recreate: function(item, cn, reappender, at) {
        connections.reinitRanges();
        bind("recreateCrs", reappender)();
        /* @system-log-start */
        var fn = "recreateCrs";
        Logger.log(
            fn + "For" + at + "CnReappend", fn + "(" + at + ")",  connectors.get(), connections.get()
        );
        /* @system-log-end */

        if(settings.eq("grid", "vertical")) {
            crsCleaner.rmIntFromBottom();
            /* @system-log-start */
            var lf = "rmIntFromBottom(crs)";
            /* @system-log-end */
        }
        else {
            crsCleaner.rmIntFromRight();
            /* @system-log-start */
            var lf = "rmIntFromRight(crs)";
            /* @system-log-end */
        }

        /* @system-log-start */
        Logger.log(
            fn + "For" + at + "CnAppend", lf, connectors.get(), connections.get()
        );
        /* @system-log-end */
    }
});