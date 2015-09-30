var CnsSorter = function() {}

proto(CnsSorter, {
    _sortForReappend: function(cns, c1, c2, c3) {
        if(settings.eq("sortDispersion", false)) {
            cns.sort(function(first, second) {
                return (guid.get(first.item) > guid.get(second.item)) ? 1 : -1;
            });
        }
        else {
            if(settings.eq("append", "default")) {
                cns.sort(function(first, second) {
                    if(Dom.areRoundedOrFlooredEq(first[c1], second[c1]))
                        return (first[c2] < second[c2]) ? -1 : 1;
                    else
                        return (first[c1] < second[c1]) ? -1 : 1;
                });
            }
            else {
                cns.sort(function(first, second) {
                    if(Dom.areRoundedOrFlooredEq(first[c1], second[c1]))
                        return (first[c3] > second[c3]) ? -1 : 1;
                    else
                        return (first[c1] < second[c1]) ? -1 : 1;
                });
            }

            var rsort = settings.getApi("rsort");
            cns = rsort(cns);
        }

        return cns;
    },

    sortForReappend: function(cns) {
        if(settings.eq("grid", "vertical"))
            return this._sortForReappend(cns, "y1", "x1", "x2");
        else
            return this._.sortForReappend(cns, "x1", "y2", "y1");
    }
});