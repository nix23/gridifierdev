var Filtrator = function() {}

proto(Filtrator, {
    filter: function() {
        var allItems = collector.collect();
        var connItems = collector.collectConnected();

        var allItemsToShow = collector.sort(collector.filter(allItems));
        var connItemsToHide = this._findConnItemsToHide(connItems);

        disconnector.disconnect(connItemsToHide);
        this._recreateGUIDS(allItemsToShow);
        this._recreateCns(allItemsToShow);
    },

    _findConnItemsToHide: function(connItems) {
        var items = [];
        for(var i = 0; i < connItems.length; i++) {
            if(collector.filter([connItems[i]]).length == 0)
                items.push(connItems[i]);
        }

        return items;
    },

    _recreateGUIDS: function(items) {
        guid.reinit();
        for(var i = 0; i < items.length; i++)
            guid.markForAppend(items[i]);
    },

    _recreateCns: function(items) {
        var cns = connections.get();
        cns.splice(0, cns.length);

        // Cns should be correctly parsed by repositionFinder
        if(settings.eq("grid", "vertical"))
            var c = {c1: "y", c2: "x"};
        else
            var c = {c1: "x", c2: "y"};

        var nextFakeC = 0;
        for(var i = 0; i < items.length; i++) {
            var fakeCoords = {};
            fakeCoords[c.c1 + "1"] = nextFakeC;
            fakeCoords[c.c1 + "2"] = nextFakeC;
            fakeCoords[c.c2 + "1"] = 0;
            fakeCoords[c.c2 + "2"] = 0;

            connections.add(items[i], fakeCoords);
            nextFakeC++;
        }
    }
});