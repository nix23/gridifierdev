var CnsIntersector = function() {}

proto(CnsIntersector, {
    isIntersectingAny: function(cns, coords) {
        for(var i = 0; i < cns.length; i++) {
            var cn = cns[i];

            var isAbove = (coords.y1 < cn.y1 && coords.y2 < cn.y1);
            var isBelow = (coords.y1 > cn.y2 && coords.y2 > cn.y2);
            var isBefore = (coords.x1 < cn.x1 && coords.x2 < cn.x1);
            var isBehind = (coords.x1 > cn.x2 && coords.x2 > cn.x2);

            if(!isAbove && !isBelow && !isBefore && !isBehind)
                return true;
        }

        return false;
    },

    getAllWithIntersectedCenter: function(coords) {
        var cns = connections.get();
        var icns = [];

        for(var i = 0; i < cns.length; i++) {
            var cnWidth = cns[i].x2 - cns[i].x1 + 1;
            var cnHeight = cns[i].y2 - cns[i].y1 + 1;

            var centerX = cns[i].x1 + cnWidth / 2;
            var centerY = cns[i].y1 + cnHeight / 2;
            var cnCenterCoords = {
                x1: centerX, x2: centerX, y1: centerY, y2: centerY
            }

            if(this.isIntersectingAny([cnCenterCoords], coords))
                icns.push(cns[i]);
        }

        return icns;
    },

    _findAllMaybeIntCns: function(cr, compFn) {
        var cns = connections.get();
        var micns = [];

        for(var i = 0; i < cns.length; i++) {
            if(compFn(cr, cns[i]))
                continue;

            micns.push(cns[i]);
        }

        return micns;
    },

    findAllMaybeIntOnVgAppend: function(cr) {
        return this._findAllMaybeIntCns(cr, function(cr, cn) { return cr.y > cn.y2; });
    },

    findAllMaybeIntOnVgPrepend: function(cr) {
        return this._findAllMaybeIntCns(cr, function(cr, cn) { return cr.y < cn.y1; })
    },

    findAllMaybeIntOnHgAppend: function(cr) {
        return this._findAllMaybeIntCns(cr, function(cr, cn) { return cr.x > cn.x2; });
    },

    findAllMaybeIntOnHgPrepend: function(cr) {
        return this._findAllMaybeIntCns(cr, function(cr, cn) { return cr.x < cn.x1; });
    }
});