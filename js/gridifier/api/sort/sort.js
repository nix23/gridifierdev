var SortApi = function() {
    this._sortHelpers = null;
    this._createHelpers();
}

proto(SortApi, {
    _createHelpers: function() {
        this._sortHelpers = new SortHelpers();
    },

    getHelpers: function() {
        return this._sortHelpers;
    }
});