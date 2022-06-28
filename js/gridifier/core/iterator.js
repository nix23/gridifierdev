var Iterator = function() {
    var me = this;
    self(this, {
        first: function() { return me.get("first"); },
        last: function() { return me.get("last"); },
        next: function(i) { return me.get("next", i); },
        prev: function(i) { return me.get("prev", i); },
        all: function() { return me.get("all"); }
    });
}

proto(Iterator, {
    get: function(type, item) {
        var cns = connections.get();
        if(cns.length == 0)
            return (type == "all") ? [] : null;

        cns = cnsSorter.sortForReappend(cns);
        if(type == "first")
            return cns[0].item;
        else if(type == "last")
            return cns[cns.length - 1].item;

        var cond = function(i1, i2) {
            return guid.get(i1) == guid.get(gridItem.toNative(i2)[0]);
        };

        if(type == "next") {
            for(var i = 0; i < cns.length; i++) {
                if(cond(cns[i].item, item))
                    return (i + 1 > cns.length - 1) ? null : cns[i + 1].item;
            }
        }
        else if(type == "prev") {
            for(var i = cns.length - 1; i >= 0; i--) {
                if(cond(cns[i].item, item))
                    return (i - 1 < 0) ? null : cns[i - 1].item;
            }
        }
        else if(type == "all") {
            var items = [];
            for(var i = 0; i < cns.length; i++)
                items.push(cns[i].item);

            return items;
        }

        return null;
    }
});