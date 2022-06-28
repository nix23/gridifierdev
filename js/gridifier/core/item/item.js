var Item = function() {};

proto(Item, {
    markAsConnected: function(item) {
        Dom.set(item, C.ITEM.IS_CONNECTED_DATA, "y");
    },

    unmarkAsConnected: function(item) {
        Dom.rm(item, C.ITEM.IS_CONNECTED_DATA);
    },

    isConnected: function(item) {
        return Dom.has(item, C.ITEM.IS_CONNECTED_DATA);
    },

    filterConnected: function(items) {
        return Dom.filter(items, function(item) {
            return this.isConnected(item);
        }, this);
    },

    filterNotConnected: function(items) {
        return Dom.filter(items, function(item) {
            return !this.isConnected(item);
        }, this);
    },

    toNative: function(items) {
        var native = [];
        if(Dom.isJquery(items)) {
            for(var i = 0; i < items.length; i++)
                native.push(items.get(i));
        }
        else if(Dom.isNative(items)) {
            native.push(items);
        }
        else if(Dom.isArray(items)) {
            for(var i = 0; i < items.length; i++) {
                native.push((Dom.isJquery(items[i])) ? items[i].get(0) : items[i]);

                if(!Dom.isNative(native[native.length - 1]))
                    err(E.NOT_NATIVE);
            }
        }
        else
            err(E.NOT_NATIVE);

        return native;
    },

    getNew: function(items) {
        var items = this.filterNotConnected(this.toNative(items));
        grid.add(items);

        return items;
    }
});