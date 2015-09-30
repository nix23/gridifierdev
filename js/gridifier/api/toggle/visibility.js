VisibilityToggle = function() {
    return {
        show: function(item, left, top, time, timing, ev, sync, dom, api) {
            sync.flush(item);
            dom.show(item);
            ev.emit(api.EVENT.SHOW, item);
        },

        hide: function(item, left, top, time, timing, ev, sync, dom, api) {
            sync.flush(item);
            dom.hide(item);
            ev.emit(api.EVENT.HIDE, item);
        }
    }
}