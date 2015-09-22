var HgCoordsFinder = function() {}

proto(HgCoordsFinder, {
    find: function(op, item, cr) {
        var is = srManager.itemSizes(item);
        var pf = parseFloat;

        if(op == OPS.APPEND)
            return {
                x1: pf(cr.x),
                x2: pf(cr.x + is.width - 1),
                y1: pf(cr.y),
                y2: pf(cr.y + is.height - 1)
            };

        if(op == OPS.REV_APPEND)
            return {
                x1: pf(cr.x),
                x2: pf(cr.x + is.width - 1),
                y1: pf(cr.y - is.height + 1),
                y2: pf(cr.y)
            };

        if(op == OPS.PREPEND)
            return {
                x1: pf(cr.x - is.width + 1),
                x2: pf(cr.x),
                y1: pf(cr.y - is.height + 1),
                y2: pf(cr.y)
            };

        if(op == OPS.REV_PREPEND)
            return {
                x1: pf(cr.x - is.width + 1),
                x2: pf(cr.x),
                y1: pf(cr.y),
                y2: pf(cr.y + is.height - 1)
            };
    }
});