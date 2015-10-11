var CnsRanges = function() {
    this._ranges = null;
    if(settings.eq("grid", "vertical"))
        this.init("y1", "y2");
    else
        this.init("x1", "x2");
}

proto(CnsRanges, {
    init: function(c1, c2) {
        var range = {cnIndexes: []};
        range[c1] = -1;
        range[c2] = C.RANGE_SIZE - 1;

        this._ranges = [range];
        this._attachAllCns(c1, c2);
    },

    incAllBy: function(val, c1, c2) {
        for(var i = 0; i < this._ranges.length; i++) {
            this._ranges[i][c1] += val;
            this._ranges[i][c2] += val;
        }
    },

    createPrepended: function(newC1, newC2, c1, c2) {
        var range = {cnIndexes: []};
        range[c1] = -1;
        range[c2] = newC2;
        this._ranges.unshift(range);
    },

    _createNext: function(c1, c2) {
        var nextC1 = this._ranges[this._ranges.length - 1][c2] + 1;
        var range = {cnIndexes: []};
        range[c1] = nextC1;
        range[c2] = nextC1 + C.RANGE_SIZE - 1;
        this._ranges.push(range);
    },

    attachCn: function(cn, cnIndex, c1, c2) {
        while(cn[c2] + 1 > this._ranges[this._ranges.length - 1][c2])
            this._createNext(c1, c2);

        var attached = false;
        for(var i = 0; i < this._ranges.length; i++) {
            var isLessThanRange = cn[c2] < this._ranges[i][c1];
            var isMoreThanRange = cn[c1] > this._ranges[i][c2];

            if(!isLessThanRange && !isMoreThanRange) {
                this._ranges[i].cnIndexes.push(cnIndex);
                attached = true;
            }
        }

        if(!attached) err("Range for cn NF");
    },

    _attachAllCns: function(c1, c2) {
        var cns = connections.get();
        for(var i = 0; i < cns.length; i++)
            this.attachCn(cns[i], i, c1, c2);
    },

    mapAllIntAndSideCns: function(sortedCrs, c, c1, c2, getRangeIndex, getRangeIndex2, getCrCnIndexes, getNext) {
        var rgs = this._ranges;
        var crRangeIndex = getRangeIndex(rgs);
        var crCnIndexes = [];

        for(var crIndex = 0; crIndex < sortedCrs.length; crIndex++) {
            var crRangeIndexFound = false;
            var isCrRangeEqPrev = (crRangeIndex == getRangeIndex(rgs));

            while(!crRangeIndexFound) {
                // Sometimes cr may become 1px out of range.(Spot on w=%,h=0,pb=%) -> Ret all
                if(crRangeIndex > getRangeIndex2(rgs) || crRangeIndex < 0) {
                    crRangeIndex = getRangeIndex(rgs);
                    break;
                }

                if(sortedCrs[crIndex][c] >= rgs[crRangeIndex][c1] && sortedCrs[crIndex][c] <= rgs[crRangeIndex][c2])
                    crRangeIndexFound = true;
                else {
                    crRangeIndex = getNext(crRangeIndex);
                    isCrRangeEqPrev = false;
                }
            }

            if(!isCrRangeEqPrev)
                crCnIndexes = getCrCnIndexes(crRangeIndex, rgs);

            sortedCrs[crIndex].cnIndexes = crCnIndexes;
        }

        return sortedCrs;
    },

    firstRngIndexFn: function() {
        return function(rgs) { return 0; };
    },

    lastRngIndexFn: function() {
        return function(rgs) { return rgs.length - 1; };
    },

    lowerCrCnIndexesFn: function() {
        return function(crRangeIndex, rgs) {
            var crCnIndexes = [];
            for(var rangeIndex = crRangeIndex; rangeIndex >= 0; rangeIndex--)
                crCnIndexes.push(rgs[rangeIndex].cnIndexes);

            return crCnIndexes;
        }
    },

    upperCrCnIndexesFn: function() {
        return function(crRangeIndex, rgs) {
            var crCnIndexes = [];
            for(var rangeIndex = crRangeIndex; rangeIndex < rgs.length; rangeIndex++)
                crCnIndexes.push(rgs[rangeIndex].cnIndexes);

            return crCnIndexes;
        }
    },

    incFn: function() {
        return function(v) { return ++v; };
    },

    decFn: function() {
        return function(v) { return --v; };
    },

    getAllCnsFromIntRange: function(c, c1, c2) {
        var rgs = this._ranges;
        for(var i = 0; i < rgs.length; i++) {
            if(c >= rgs[i][c1] && c <= rgs[i][c2])
                return rgs[i].cnIndexes;
        }

        var isCnIndexAdded = function(cnIndexes, index) {
            for(var i = 0; i < cnIndexes.length; i++) {
                if(cnIndexes[i] == index)
                    return true;
            }

            return false;
        }

        var cnIndexes = [];
        for(var i = 0; i < rgs.length; i++) {
            for(var j = 0; j < rgs[i].cnIndexes.length; j++) {
                if(!isCnIndexAdded(cnIndexes, rgs[i].cnIndexes[j]))
                    cnIndexes.push(rgs[i].cnIndexes[j]);
            }
        }

        return cnIndexes;
    },

    getAllCnsFromIntAndTLSideRgs: function(c, c1, c2) {
        var rgs = this._ranges;
        var cnIndexes = [];
        var intRngIndex = null;

        for(var i = rgs.length - 1; i >= 0; i--) {
            if(c >= rgs[i][c1] && c <= rgs[i][c2]) {
                intRngIndex = i;
                break;
            }
        }

        if(intRngIndex == null)
            intRngIndex = rgs.length - 1;

        for(var i = intRngIndex; i >= 0; i--)
            cnIndexes.push(rgs[i].cnIndexes);

        return cnIndexes;
    },

    getAllCnsFromIntAndRBSideRgs: function(c, c1, c2) {
        var rgs = this._ranges;
        var cnIndexes = [];
        var intRngIndex = null;

        for(var i = 0; i < rgs.length; i++) {
            if(c >= rgs[i][c1] && c <= rgs[i][c2]) {
                intRngIndex = i;
                break;
            }
        }

        if(intRngIndex == null)
            intRngIndex = 0;

        for(var i = intRngIndex; i < rgs.length; i++)
            cnIndexes.push(rgs[i].cnIndexes);

        return cnIndexes;
    }
});