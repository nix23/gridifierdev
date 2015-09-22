var ToggleApi = function() {
    settings.addApi("toggle", "scale", new ScaleToggleFactory());
    settings.addApi("toggle", "scaleWithFade", new ScaleToggleFactory(true));
    settings.addApi("toggle", "fade", new FadeToggle());
    settings.addApi("toggle", "visibility", new VisibilityToggle());

    var slideFactory = new SlideToggleFactory(settings);
    var rotateFactory = new RotateToggleFactory(settings);
}

proto(ToggleApi, {
    hasTranslateTransform: function(item) {
        var reg = /.*translate\((.*)\).*/;
        var reg3d = /.*translate3d\((.*)\).*/;

        if(reg.test(item.style[Prefixer.get("transform", item)]) ||
            reg3d.test(item.style[Prefixer.get("transform", item)]))
            return true;

        return false;
    },

    updateTransformOrigin: function(item, cnLeft, cnTop, iWidth, iHeight) {
        var newLeft = parseFloat(cnLeft);
        var newTop = parseFloat(cnTop);

        var currLeft = parseFloat(item.style.left);
        var currTop = parseFloat(item.style.top);

        if(newLeft > currLeft)
            var x = newLeft - currLeft;
        else if(newLeft < currLeft)
            var x = (currLeft - newLeft) * -1;
        else
            var x = 0;

        if(newTop > currTop)
            var y = newTop - currTop;
        else if(newTop < currTop)
            var y = (currTop - newTop) * -1;
        else
            var y = 0;

        Dom.css3.transformOrigin(item, (x + iWidth / 2) + "px " + (y + iHeight / 2) + "px");
    },

    resetTransformOrigin: function(item) {
        Dom.css3.transformOrigin(item, "50% 50%");
    }
});