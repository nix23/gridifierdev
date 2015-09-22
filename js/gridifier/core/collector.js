var Collector = function() {
    this._collectFn = null;
    this._createCollectFn();

    self(this, {
        collect: this.collect,
        collectNew: this.collectDisconnected,
        collectConnected: this.collectConnected
    });
}

proto(Collector, {
    _createCollectFn: function() {
        var me = this;
        this._collectFn = function(grid) {
            if(settings.notEq("class", false))
                var query = "." + settings.get("class");
            else if(settings.notEq("data", false))
                var query = "[" + settings.get("data") + "]";
            else
                var query = settings.get("query");

            return me.filterCollectable(Dom.find.byQuery(grid.get(), query));
        }
    },

    filterCollectable: function(items) {
        return Dom.filter(items, function(item) {
            return !this.isNotCollectable(item);
        }, this);
    },

    markAsNotCollectable: function(item) {
        Dom.set(item, C.COLL.NOT_COLLECTABLE_DATA, "r");
    },

    unmarkAsNotCollectable: function(item) {
        Dom.rmIfHas(item, C.COLL.NOT_COLLECTABLE_DATA);
    },

    isNotCollectable: function(item) {
        return Dom.has(item, C.COLL.NOT_COLLECTABLE_DATA);
    },

    collect: function() {
        return this._collectFn(grid.get());
    },

    collectByQuery: function(query) {
        return this.filterCollectable(Dom.find.byQuery(grid.get(), query));
    },

    collectConnected: function() {
        return gridItem.filterConnected(this._collectFn(grid.get()));
    },

    collectDisconnected: function() {
        return gridItem.filterNotConnected(this._collectFn(grid.get()));
    },

    filter: function(filtered) {
        var filters = settings.getApi("filter");

        for(var i = 0; i < filters.length; i++) {
            var currentFiltered = [];

            for(var j = 0; j < filtered.length; j++) {
                if(filters[i](filtered[j]))
                    currentFiltered.push(filtered[j]);
            }

            filtered = currentFiltered;
        }

        return filtered;
    },

    sort: function(items) {
        var sortHelpers = sortApi.getHelpers();
        this.saveOriginalOrder(items);

        items.sort(
            function(first, second) {
                return settings.getApi("sort")(first, second, sortHelpers, Dom);
            }
        );

        this.flushOriginalOrder(items);

        return items;
    },

    saveOriginalOrder: function(items) {
        for(var i = 0; i < items.length; i++)
            Dom.set(items[i], C.COLL.SORT_INDEX_DATA, i + 1);
    },

    flushOriginalOrder: function(items) {
        for(var i = 0; i < items.length; i++)
            Dom.rm(items[i], C.COLL.SORT_INDEX_DATA);
    }
});