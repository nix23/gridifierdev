var PrependOp = function() {}

proto(PrependOp, {
    exec: function(items) {
        var me = this;
        insertOp.exec(items, function(item) {
            me._prepend.call(me, item);
        });
    },

    _prepend: function(item) {
        guid.markForPrepend(item);
        if(settings.eq("prepend", "default")) {
            /* @system-log-start */
            Logger.startLoggingOperation(
                Logger.OPERATION_TYPES.PREPEND, "Item GUID: " + guid.get(item)
            );
            /* @system-log-end */
            prepender.position(item);
            /* @system-log-start */
            Logger.stopLoggingOperation();
            /* @system-log-end */
        }
        else {
            /* @system-log-start */
            Logger.startLoggingOperation(
                Logger.OPERATION_TYPES.REVERSED_PREPEND, "Item GUID: " + guid.get(item)
            );
            /* @system-log-end */
            reversedPrepender.position(item);
            /* @system-log-start */
            Logger.stopLoggingOperation();
            /* @system-log-end */
        }
    }
});