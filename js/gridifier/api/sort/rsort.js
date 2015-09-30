var RsortApi = function() {
    this._created = false;
    this._repositionTimeout = null;

    var me = this;
    ev.onRsortChange(function() {
        me._change.call(me);
    });

    this._change();
}

proto(RsortApi, {
    _change: function() {
        var me = this;
        var rsort = settings.get("rsort").selected;

        if(rsort != "default" && !this._created) {
            this._created = true;
            var rsortHelpers = new RsortHelpers(settings);
        }

        // Don't remove def rSorter. (Unnecessary rep-ions will be triggered.)
        if(rsort == "default")
            ev.onBeforeShowForRsort(null);
        else {
            ev.onBeforeShowForRsort(function() {
                clearTimeout(me._repositionTimeout);
                me._repositionTimeout = setTimeout(function() {
                    if(settings.get("repackSize") == null) {
                        reposition.all();
                        return;
                    }

                    var repackSize = settings.get("repackSize");
                    var items = gridifier.all();

                    if(items.length < repackSize) {
                        reposition.all();
                        return;
                    }

                    reposition.fromFirstSortedCn(items[items.length - repackSize]);
                }, C.RESORT_REPOS_DELAY);
            });
        }
    }
});