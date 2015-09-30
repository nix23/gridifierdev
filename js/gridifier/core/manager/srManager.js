var SizesResolverManager = function() {
    this._owCache = [
        // { cachedItemGUID: Number, DOMElem: Object, cachedReturnedValues: {
        //      withIncludeMarginsParam: Number || null,
        //      withoutIncludeMarginsParam: Number || null
        // }},
        // ...
    ];
    this._ohCache = [
        // { cachedItemGUID: Number, DOMElem: Object, cachedReturnedValues: {
        //      withIncludeMarginsParam: Number || null,
        //      withoutIncludeMarginsParam: Number || null
        // }},
        // ...
    ];

    this._nextOwGUID = 0;
    this._nextOhGUID = 0;
    this._isActive = false;

    this._owAntialias = 0;
    this._ohAntialias = 0;
}

proto(SizesResolverManager, {
    setOuterWidthAntialiasValue: function(newValue) {
        this._owAntialias = newValue;
    },

    setOuterHeightAntialiasValue: function(newValue) {
        this._ohAntialias = newValue;
    },

    _markAsCachedPerOw: function(item, cachedItemGUID) {
        Dom.set(item, [
            [C.SRM.CACHED_PER_OW_DATA, C.SRM.EMPTY_DATA],
            [C.SRM.CACHED_PER_OW_ITEM_GUID_DATA, cachedItemGUID]
        ]);
    },

    _markAsCachedPerOh: function(item, cachedItemGUID) {
        Dom.set(item, [
            [C.SRM.CACHED_PER_OH_DATA, C.SRM.EMPTY_DATA],
            [C.SRM.CACHED_PER_OH_ITEM_GUID_DATA, cachedItemGUID]
        ]);
    },

    unmarkAsCached: function(item) {
        Dom.rmIfHas(item, [
            C.SRM.CACHED_PER_OW_DATA,
            C.SRM.CACHED_PER_OW_ITEM_GUID_DATA,
            C.SRM.CACHED_PER_OH_DATA,
            C.SRM.CACHED_PER_OH_ITEM_GUID_DATA
        ]);
    },

    _getCachedItemEntry: function(item, cache, GUID) {
        for(var i = 0; i < cache.length; i++) {
            if(parseInt(cache[i].GUID) == parseInt(GUID))
                return cache[i];
        }
    },

    _getOwCachedItemEntry: function(item) {
        return this._getCachedItemEntry(
            item, this._owCache, Dom.get(item, C.SRM.CACHED_PER_OW_ITEM_GUID_DATA)
        );
    },

    _getOhCachedItemEntry: function(item) {
        return this._getCachedItemEntry(
            item, this._ohCache, Dom.get(item, C.SRM.CACHED_PER_OH_ITEM_GUID_DATA));
    },

    _isCallCached: function(item, includeMargins, cacheAttr, cacheGetter) {
        if(!Dom.has(item, cacheAttr))
            return false;

        var cachedItemEntry = cacheGetter(item);

        if(includeMargins)
            return cachedItemEntry.cachedCalls.withMargins != null;
        else
            return cachedItemEntry.cachedCalls.withoutMargins != null;
    },

    _isOwCallCached: function(item, includeMargins) {
        var me = this;
        return this._isCallCached(
            item, includeMargins, C.SRM.CACHED_PER_OW_DATA, function(item) {
                return me._getOwCachedItemEntry(item);
            }
        );
    },

    _isOhCallCached: function(item, includeMargins) {
        var me = this;
        return this._isCallCached(
            item, includeMargins, C.SRM.CACHED_PER_OH_DATA, function(item) {
                return me._getOhCachedItemEntry(item);
            }
        );
    },

    startCachingTransaction: function() {
        this._isActive = true;
    },

    stopCachingTransaction: function() {
        this._isActive = false;

        for(var i = 0; i < this._owCache.length; i++)
            this.unmarkAsCached(this._owCache[i].item);

        for(var i = 0; i < this._ohCache.length; i++)
            this.unmarkAsCached(this._ohCache[i].item);

        this._owCache = [];
        this._ohCache = [];

        this._nextOwGUID = 0;
        this._nextOhGUID = 0;
    },

    _callRealOuter: function(item,
                             includeMargins,
                             disableAntialiasing,
                             disablePtCSSRecalc,
                             disableBordersCalc,
                             isRecursiveSubcall,
                             isOhCall) {
        var me = this;
        var isOhCall = isOhCall || false;
        var realRecalcPtWidthFn = SizesResolver.recalcPtWidthFn;
        var realRecalcPtHeightFn = SizesResolver.recalcPtHeightFn;

        var createRecalcFn = function(outerFnName) {
            return function(item, includeMargins, disablePtCSSRecalc, disableBordersCalc) {
                return me[outerFnName](item, includeMargins, true, disablePtCSSRecalc, disableBordersCalc, true);
            }
        }
        SizesResolver.recalcPtWidthFn = createRecalcFn("outerWidth");
        SizesResolver.recalcPtHeightFn = createRecalcFn("outerHeight");

        if(!isRecursiveSubcall)
            SizesResolver.clearRecursiveSubcallsData();

        var outerFnName = (!isOhCall) ? "outerWidth" : "outerHeight";
        var returnedValue = SizesResolver[outerFnName](item, includeMargins, disablePtCSSRecalc, disableBordersCalc);

        if(!disableAntialiasing)
            returnedValue -= (!isOhCall) ? this._owAntialias : this._ohAntialias;

        SizesResolver.recalcPtWidthFn = realRecalcPtWidthFn;
        SizesResolver.recalcPtHeightFn = realRecalcPtHeightFn;

        return returnedValue;
    },

    _callRealOw: function(a, b, c, d, e, f) {
        return this._callRealOuter(a, b, c, d, e, f);
    },

    _callRealOh: function(a, b, c, d, e, f) {
        return this._callRealOuter(a, b, c, d, e, f, true);
    },

    _outer: function(item,
                     includeMargins,
                     disableAntialiasing,
                     disablePtCSSRecalc,
                     disableBordersCalc,
                     isRecursiveSubcall,
                     isOhCall) {
        var args = arguments;

        var isOhCall = isOhCall || false;
        args[2] = args[2] || false;
        args[5] = args[5] || false;

        if(!this._isActive)
            return (!isOhCall) ? this._callRealOw.apply(this, args) : this._callRealOh.apply(this, args);

        var cachedItemEntry = null;
        if(!isOhCall && this._isOwCallCached(item, includeMargins))
            cachedItemEntry = this._getOwCachedItemEntry(item);
        else if(isOhCall && this._isOhCallCached(item, includeMargins))
            cachedItemEntry = this._getOhCachedItemEntry(item);

        if(cachedItemEntry != null) {
            var cachedVals = cachedItemEntry.cachedCalls;
            return (includeMargins) ? cachedVals.withMargins : cachedVals.withoutMargins;
        }

        var returnedValue = (!isOhCall) ? this._callRealOw.apply(this, args) : this._callRealOh.apply(this, args);

        if((!isOhCall && Dom.has(item, C.SRM.CACHED_PER_OW_DATA)) ||
            (isOhCall && Dom.has(item, C.SRM.CACHED_PER_OH_DATA))) {
            var cachedItemEntry = (!isOhCall) ? this._getOwCachedItemEntry(item) : this._getOhCachedItemEntry(item);
            if(includeMargins)
                cachedItemEntry.cachedCalls.withMargins = returnedValue;
            else
                cachedItemEntry.cachedCalls.withoutMargins = returnedValue;
        }
        else {
            if(!isOhCall)
                this._markAsCachedPerOw(item, ++this._nextOwGUID);
            else
                this._markAsCachedPerOh(item, ++this._nextOhGUID);

            var cachedCalls = {
                withMargins: (includeMargins) ? returnedValue : null,
                withoutMargins: (!includeMargins) ? returnedValue : null
            };
            var cache = (!isOhCall) ? this._owCache : this._ohCache;
            cache.push({
                GUID: (!isOhCall) ? this._nextOwGUID : this._nextOhGUID,
                item: item,
                cachedCalls: cachedCalls
            });
        }

        return returnedValue;
    },

    outerWidth: function(a, b, c, d, e, f) {
        return this._outer(a, b, c, d, e, f);
    },

    outerHeight: function(a, b, c, d, e, f) {
        return this._outer(a, b, c, d, e, f, true);
    },

    positionTop: function(item) {
        return SizesResolver.positionTop(item);
    },

    positionLeft: function(item) {
        return SizesResolver.positionLeft(item);
    },

    _offset: function(item, substractMargins, outerFnName, offsetFnName) {
        var substractMargins = substractMargins || false;

        if(substractMargins) {
            var elemSize = this[outerFnName](item);
            var elemSizeWithMargins = this[outerFnName](item, true);
            var marginSize = elemSizeWithMargins - elemSize;
            var halfOfMarginSize = marginSize / 2;
            var sideOffset = SizesResolver[offsetFnName](item) - halfOfMarginSize;
        }
        else {
            var sideOffset = SizesResolver[offsetFnName](item);
        }

        return sideOffset;
    },

    offsetLeft: function(a, b) {
        return this._offset(a, b, "outerWidth", "offsetLeft");
    },

    offsetTop: function(a, b) {
        return this._offset(a, b, "outerHeight", "offsetTop");
    },

    viewportWidth: function() {
        return document.documentElement.clientWidth;
    },

    viewportHeight: function() {
        return document.documentElement.clientHeight;
    },

    viewportScrollLeft: function() {
        return window.pageXOffset || document.documentElement.scrollLeft;
    },

    viewportScrollTop: function() {
        return window.pageYOffset || document.documentElement.scrollTop;
    },

    viewportDocumentCoords: function() {
        return {
            x1: this.viewportScrollLeft(),
            x2: this.viewportScrollLeft() + this.viewportWidth() - 1,
            y1: this.viewportScrollTop(),
            y2: this.viewportScrollTop() + this.viewportHeight() - 1
        };
    },

    itemSizes: function(item) {
        return {
            width: this.outerWidth(item, true),
            height: this.outerHeight(item, true)
        };
    },

    copyComputedStyle: function(sourceItem, targetItem) {
        var me = this;

        var copyRecursive = function(sourceItem, targetItem) {
            SizesResolver.cloneComputedStyle(sourceItem, targetItem);

            for(var i = 0; i < sourceItem.childNodes.length; i++) {
                if(sourceItem.childNodes[i].nodeType == 1) {
                    copyRecursive(sourceItem.childNodes[i], targetItem.childNodes[i]);

                    var childNodeComputedStyle = SizesResolver.getComputedCSS(sourceItem.childNodes[i]);

                    // Don't override 'auto' value
                    if(/.*px.*/.test(childNodeComputedStyle.left))
                        targetItem.childNodes[i].style.left = me.positionLeft(sourceItem.childNodes[i]) + "px";
                    if(/.*px.*/.test(childNodeComputedStyle.top))
                        targetItem.childNodes[i].style.top = me.positionTop(sourceItem.childNodes[i]) + "px";

                    var childNodeRawSizes = SizesResolver.getUncomputedCSS(sourceItem.childNodes[i]);

                    targetItem.childNodes[i].style.width = me.outerWidth(sourceItem.childNodes[i]) + "px";
                    if(Dom.int(childNodeRawSizes.height) != 0)
                        targetItem.childNodes[i].style.height = me.outerHeight(sourceItem.childNodes[i]) + "px";
                }
            }
        }

        copyRecursive(sourceItem, targetItem);
    }
});