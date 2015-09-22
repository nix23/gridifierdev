var Resorter = function() {}

proto(Resorter, {
    resort: function() {
        var connItems = collector.sort(collector.collectConnected());
        if(settings.eq("sortDispersion", true))
            this._resortOnSD(connItems);

        guid.reinit();
        for(var i = 0; i < connItems.length; i++)
            guid.markForAppend(connItems[i]);
    },

    _resortOnSD: function(items) {
        if(settings.eq("grid", "vertical"))
            var c = {c1: "y", c2: "x"};
        else
            var c = {c1: "x", c2: "y"};

        var nextFakeC = 0;
        for(var i = 0; i < items.length; i++) {
            var cn = cnsCore.find(items[i]);
            cn[c1 + "1"] = nextFakeC;
            cn[c1 + "2"] = nextFakeC;
            cn[c2 + "1"] = 0;
            cn[c2 + "2"] = 0;
            nextFakeC++;
        }
    }
});