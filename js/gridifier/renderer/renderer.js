var Renderer = function() {}

proto(Renderer, {
    show: function(cns) {
        var rc = rendererCns;

        if(!Dom.isArray(cns))
            var cns = [cns];

        for(var i = 0; i < cns.length; i++) {
            var cn = cns[i];
            this.unmarkAsSchToHide(cn.item);
            if(rc.isRendered(cn))
                continue;

            rc.markAsRendered(cn);
            rendererQueue.schedule(RENDER_OPS.SHOW, cn, rc.left(cn), rc.top(cn));
        }
    },

    hide: function(cns) {
        var rc = rendererCns;

        if(!Dom.isArray(cns))
            var cns = [cns];

        for(var i = 0; i < cns.length; i++) {
            var cn = cns[i];
            if(!this.wasSchToHide(cn.item))
                continue;

            rc.unmarkAsRendered(cn);
            rendererQueue.schedule(RENDER_OPS.HIDE, cn, rc.left(cn), rc.top(cn));
        }
    },

    renderRepositioned: function(cns) {
        this.render(cns, false);
    },

    render: function(cns, exceptCns) {
        var rc = rendererCns;
        var exceptCns = exceptCns || false;

        for(var i = 0; i < cns.length; i++) {
            var cn = cns[i];
            if(exceptCns !== false) {
                var skipCn = false;

                for(var j = 0; j < exceptCns.length; j++) {
                    if(cns[i].itemGUID == exceptCns[j].itemGUID) {
                        skipCn = true;
                        break;
                    }
                }

                if(skipCn) continue;
            }

            rendererQueue.schedule(RENDER_OPS.RENDER, cn, rc.left(cn), rc.top(cn));
        }
    },

    // Delay in row/col updates in noIntersectionsMode is required, because without it refreshes
    // will be called right after show method, and will be placed in the end of animation.
    // (Example: slide show method -> calling 0ms offset translate at start, than this refresh
    // will be called before slideOutTimeout without a delay.(Will move items instantly)
    renderAfterDelay: function(cns, delay) {
        var delay = delay || C.RENDER_DEF_DELAY;

        for(var i = 0; i < cns.length; i++)
            rendererQueue.schedule(RENDER_OPS.DEL_RENDER, cns[i], null, null, delay);
    },

    rotate: function(items) {
        var cns = [];
        for(var i = 0; i < items.length; i++) {
            var cn = cnsCore.find(items[i]);
            rendererCns.unmarkAsRendered(cn);
            cns.push(cn);
        }

        this.show(cns);
    },

    markAsSchToHide: function(cns) {
        for(var i = 0; i < cns.length; i++)
            Dom.set(cns[i].item, C.REND.SCH_TO_HIDE_DATA, "y");
    },

    unmarkAsSchToHide: function(item) {
        Dom.rm(item, C.REND.SCH_TO_HIDE_DATA);
    },

    wasSchToHide: function(item) {
        return Dom.has(item, C.REND.SCH_TO_HIDE_DATA);
    }
});