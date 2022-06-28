var GUID = function() {
    this._max = 9999;
    this._min = 10000;
    this._firstPrepended = null;
}

proto(GUID, {
    reinit: function() {
        this._max = 9999;
        this._min = 10000;
    },

    reinitMax: function(newMax) {
        this._max = (typeof newMax == "undefined" || newMax == null) ? 9999 : newMax;
    },

    get: function(item) {
        return Dom.int(Dom.get(item, C.GUID_DATA));
    },

    set: function(item, guid) {
        Dom.set(item, C.GUID_DATA, guid);
    },

    rm: function(item) {
        Dom.rm(item, C.GUID_DATA);
    },

    markForAppend: function(item) {
        Dom.set(item, C.GUID_DATA, ++this._max);
        return this._max;
    },

    markForPrepend: function(item) {
        Dom.set(item, C.GUID_DATA, --this._min);
        return this._min;
    },

    markIfFirstPrepended: function(item) {
        if(this._firstPrepended != null)
            return;

        this._firstPrepended = Dom.int(Dom.get(item, C.GUID_DATA));
    },

    unmarkFirstPrepended: function() {
        this._firstPrepended = null;
    },

    wasPrepended: function(guid) {
        return (this._firstPrepended == null) ? false : (Dom.int(guid) <= this._firstPrepended);
    }
});