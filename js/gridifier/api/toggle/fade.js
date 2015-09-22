FadeToggle = function() {
    return {
        show: function(item, left, top, time, timing, event, sync, dom, api) {
            sync.flush(item);
            if(!dom.hasTransitions()) {
                dom.show(item);
                event.emit(api.EVENT.SHOW, item);
                return;
            }

            if(!dom.has(item, api.TOGGLE.IS_ACTIVE)) {
                dom.css3.transition(item, "none");
                dom.css3.opacity(item, "0");
                dom.set(item, api.TOGGLE.IS_ACTIVE, "y");
            }

            sync.add(item, setTimeout(function() {
                var prefix = api.prefix.getForCss('opacity', item);

                dom.show(item);
                dom.css3.transition(item, prefix + " " + time + "ms " + timing);
                dom.css3.opacity(item, 1);
            }, 40));

            sync.add(item, setTimeout(function() {
                dom.rm(item, api.TOGGLE.IS_ACTIVE);
                event.emit(api.EVENT.SHOW, item);
            }, time + 60));
        },

        hide: function(item, left, top, time, timing, event, sync, dom, api) {
            sync.flush(item);
            if(!dom.hasTransitions()) {
                dom.hide(item);
                event.emit(api.EVENT.HIDE, item);
                return;
            }

            var prefix = api.prefix.getForCss('opacity', item);
            dom.css3.transition(item, prefix + " " + time + "ms " + timing);
            dom.set(api.TOGGLE.IS_ACTIVE, "y");
            dom.css3.opacity(item, "0");

            sync.add(item, setTimeout(function() {
                dom.rm(api.TOGGLE.IS_ACTIVE);
                dom.hide(item);

                dom.css3.transition(item, "none");
                dom.css3.opacity(item, "1");
                dom.css3.transition(item, "");

                event.emit(api.EVENT.HIDE, item);
            }, time + 20));
        }
    }
}