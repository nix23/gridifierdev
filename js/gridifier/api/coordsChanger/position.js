PositionCc = function() {
    return function(item, left, top, time, timing, dom, prefix, getS, syncToggle) {
        if(!dom.hasTransitions()) {
            getS("coordsChanger").default.apply(this, arguments);
            return;
        }

        left = parseFloat(left) + "px";
        top = parseFloat(top) + "px";

        var syncToggle = syncToggle || false;
        if(syncToggle) {
            dom.css3.transform(item, "scale3d(1,1,1)");
            return;
        }

        if(left != item.style.left) {
            dom.css3.transitionProperty(item, "left " + time + "ms " + timing);
            dom.css.set(item, {left: left});
        }

        if(top != item.style.top) {
            dom.css3.transitionProperty(item, "top " + time + "ms " + timing);
            dom.css.set(item, {top: top});
        }
    }
}