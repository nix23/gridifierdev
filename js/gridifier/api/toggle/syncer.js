var ToggleSyncerApi = function() {
    this._syncTimeouts = {};
    this._nextSyncId = 0;
}

proto(ToggleSyncerApi, {
    markAsSynced: function(item) {
        Dom.set(item, TOGGLE.SYNCER_DATA, ++this._nextSyncId);
    },

    isSynced: function(item) {
        return Dom.has(item, TOGGLE.SYNCER_DATA);
    },

    _getSyncId: function(item) {
        if(this.isSynced(item))
            return Dom.get(item, TOGGLE.SYNCER_DATA);

        this.markAsSynced(item);
        return Dom.get(item, TOGGLE.SYNCER_DATA);
    },

    add: function(item, syncTimeout) {
        var syncId = this._getSyncId(item);

        if(!Dom.hasOwnProp(this._syncTimeouts, syncId))
            this._syncTimeouts[syncId] = [];

        this._syncTimeouts[syncId].push(syncTimeout);
    },

    flush: function(item) {
        var syncId = this._getSyncId(item);

        if(Dom.hasOwnProp(this._syncTimeouts, syncId)) {
            for(var i = 0; i < this._syncTimeouts[syncId].length; i++)
                clearTimeout(this._syncTimeouts[syncId][i]);

            this._syncTimeouts[syncId] = [];
        }
    }
});