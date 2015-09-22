DefaultCc = function() {
    return function(item, left, top, time, timing, dom, prefix, getS, syncToggle) {
        var syncToggle = syncToggle || false;
        if(syncToggle) {
            // Custom init logic per coordsChanger sync can be placed here
            // (We are no passing this flag from CSS3 coordsChanger fallback methods,
            //  because no special initialization is required here)
            return;
        }

        if(left != item.style.left)
            dom.css.set(item, {left: left});
        if(top != item.style.top)
            dom.css.set(item, {top: top});
    };
}