var RendererCns = function() {}

proto(RendererCns, {
    isRendered: function(cn) {
        return Dom.has(cn.item, C.REND.CN_RENDERED_DATA);
    },

    markAsRendered: function(cn) {
        Dom.set(cn.item, C.REND.CN_RENDERED_DATA, "y");
    },

    unmarkAsRendered: function(cn) {
        Dom.rm(cn.item, C.REND.CN_RENDERED_DATA);
    },

    left: function(cn) {
        var eq = bind("eq", settings);
        if(eq("grid", "vertical"))
            var left = cn.x1;
        else 
            var left = eq("intersections", true) ? cn.x1 : (cn.x1 + cn.hOffset);
        
        return left + "px";
    },

    top: function(cn) {
        var eq = bind("eq", settings);
        if(eq("grid", "vertical"))
            var top = eq("intersections", true) ? cn.y1 : (cn.y1 + cn.vOffset);
        else
            var top = cn.y1;

        return top + "px";
    }
});