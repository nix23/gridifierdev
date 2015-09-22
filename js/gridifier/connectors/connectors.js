var Connectors = function() {
    this._crs = [];
    this._nextFlushCb = null;
}

proto(Connectors, {
    eq: function(cr, side) {
        return cr.side == side;
    },

    isInitial: function(cr) {
        return cr.itemGUID == CRS.INITIAL_GUID;
    },

    create: function(type, side, x, y, itemGUID) {
        this._crs.push({
            type: type,
            side: side,
            x: Dom.toFixed(x, 2),
            y: Dom.toFixed(y, 2),
            itemGUID: (typeof itemGUID == "undefined") ? CRS.INITIAL_GUID : itemGUID
        });
    },

    count: function() {
        return this._crs.length;
    },

    get: function() {
        return this._crs;
    },

    set: function(crs) {
        this._crs = crs;
    },

    setNextFlushCb: function(cb) {
        this._nextFlushCb = cb;
    },

    flush: function() {
        this._crs = [];
        if(typeof this._nextFlushCb == "function") {
            this._nextFlushCb();
            this._nextFlushCb = null;
        }
    },

    getClone: function() {
        var crClones = [];
        var props = ["type", "side", "x", "y", "itemGUID"];

        for(var i = 0; i < this._crs.length; i++) {
            var crClone = {};
            for(var j = 0; j < props.length; j++)
                crClone[props[j]] = this._crs[i][props[j]];

            crClone.crIndex = i;
            crClones.push(crClone);
        }

        return crClones;
    }
});