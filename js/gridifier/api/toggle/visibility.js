VisibilityToggle = function() {
    return {
        show: function(item, left, top, time, timing, event, sync, dom, api) {
            sync.flush(item);
            dom.show(item);
            event.emit(api.EVENT.SHOW, item);
        },

        hide: function(item, left, top, time, timing, event, sync, dom, api) {
            sync.flush(item);
            dom.hide(item);
            event.emit(api.EVENT.HIDE, item);
        }
    }
}