var AppendOp = function() {}

proto(AppendOp, {
    exec: function(items) {
        var me = this;
        insertOp.exec(items, function(item) {
            me._append.call(me, item);
        });
    },

    _append: function(item) {
        guid.markForAppend(item);
        if(settings.eq("append", "default")) {
            /* @system-log-start */
            Logger.startLoggingOperation(
                Logger.OPERATION_TYPES.APPEND, "Item GUID: " + guid.get(item)
            );
            /* @system-log-end */
            appender.position(item);
            /* @system-log-start */
            Logger.stopLoggingOperation();
            /* @system-log-end */
        }
        else {
            /* @system-log-start */
            Logger.startLoggingOperation(
                Logger.OPERATION_TYPES.REVERSED_APPEND, "Item GUID: " + guid.get(item)
            );
            /* @system-log-end */
            reversedAppender.position(item);
            /* @system-log-start */
            Logger.stopLoggingOperation();
            /* @system-log-end */
        }
    },

    execInsBefore: function(items, beforeItem) {
        var me = this;
        insertOp.execInsertBA(
            items,
            beforeItem,
            function(items) { me._exec.call(me, items); },
            function() { return 0; },
            function(cns, i) { return cns.splice(i, cns.length - i); },
            -1,
            function(cns) { reposition.from(cns[0]); }
        );
    },

    execInsAfter: function(items, afterItem) {
        var me = this;
        insertOp.execInsertBA(
            items,
            afterItem,
            function(items) { me._exec.call(me, items); },
            function(cns) { return cns.length - 1; },
            function(cns, i) { return cns.splice(i + 1, cns.length - i - 1); },
            1,
            function(cns) { if(cns.length > 0) reposition.from(cns[0]); }
        );
    }
});