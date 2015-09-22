var CrsRounder = {}

proto(CrsRounder, {
    roundCnPerCr: function(cn, cr) {
        cn.origX1 = cn.x1;
        cn.origX2 = cn.x2;
        cn.origY1 = cn.y1;
        cn.origY2 = cn.y2;

        var is = function(s) { return connectors.eq(cr, s); };
        if(is(CR.BOTTOM.LEFT) || is(CR.RIGHT.TOP)) {
            cn.x1 = Math.floor(cn.x1);
            cn.y1 = Math.floor(cn.y1);
        }
        else if(is(CR.LEFT.TOP) || is(CR.BOTTOM.RIGHT)) {
            cn.x2 = Math.ceil(cn.x2);
            cn.y1 = Math.floor(cn.y1);
        }
        else if(is(CR.LEFT.BOTTOM) || is(CR.TOP.RIGHT)) {
            cn.x2 = Math.ceil(cn.x2);
            cn.y2 = Math.ceil(cn.y2);
        }
        else if(is(CR.TOP.LEFT) || is(CR.RIGHT.BOTTOM)) {
            cn.x1 = Math.floor(cn.x1);
            cn.y2 = Math.ceil(cn.y2);
        }
    },

    unroundCnPerCr: function(cn, cr) {
        cn.x1 = cn.origX1;
        cn.y1 = cn.origY1;
        cn.x2 = cn.origX2;
        cn.y2 = cn.origY2;
    }
});