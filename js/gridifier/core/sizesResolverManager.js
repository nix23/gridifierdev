Gridifier.SizesResolverManager = function() {
    this.C = Gridifier.SizesResolverManager;

    this._outerWidthCache = [
        // { cachedItemGUID: Number, DOMElem: Object, cachedReturnedValues: {
        //      withIncludeMarginsParam: Number || null,
        //      withoutIncludeMarginsParam: Number || null
        // }},
        // ...
    ];
    this._outerHeightCache = [
        // { cachedItemGUID: Number, DOMElem: Object, cachedReturnedValues: {
        //      withIncludeMarginsParam: Number || null,
        //      withoutIncludeMarginsParam: Number || null
        // }},
        // ...
    ];

    this._nextCachedItemGUIDPerOuterWidth = 0;
    this._nextCachedItemGUIDPerOuterHeight = 0;
    this._isCachingTransactionActive = false;

    this._outerWidthAntialiasValue = 0;
    this._outerHeightAntialiasValue = 0;
}

Gridifier.SizesResolverManager.CACHED_PER_OW_ITEM_GUID_DATA_ATTR = "data-gridifier-cached-per-ow-guid";
Gridifier.SizesResolverManager.CACHED_PER_OH_ITEM_GUID_DATA_ATTR = "data-gridifier-cached-per-oh-guid";
Gridifier.SizesResolverManager.CACHED_PER_OW_DATA_ATTR = "data-gridifier-cached-per-ow";
Gridifier.SizesResolverManager.CACHED_PER_OH_DATA_ATTR = "data-gridifier-cached-per-oh";
Gridifier.SizesResolverManager.EMPTY_DATA_ATTR_VALUE = "e";

proto(Gridifier.SizesResolverManager, {
    setOuterWidthAntialiasValue: function(newValue) {
        this._outerWidthAntialiasValue = newValue;
    },

    setOuterHeightAntialiasValue: function(newValue) {
        this._outerHeightAntialiasValue = newValue;
    },

    _markAsCachedPerOuterWidth: function(item, cachedItemGUID) {
        Dom.set(item, [
            [this.C.CACHED_PER_OW_DATA_ATTR, this.C.EMPTY_DATA_ATTR_VALUE],
            [this.C.CACHED_PER_OW_ITEM_GUID_DATA_ATTR, cachedItemGUID]
        ]);
    },

    _markAsCachedPerOuterHeight: function(item, cachedItemGUID) {
        Dom.set(item, [
            [this.C.CACHED_PER_OH_DATA_ATTR, this.C.EMPTY_DATA_ATTR_VALUE],
            [this.C.CACHED_PER_OH_ITEM_GUID_DATA_ATTR, cachedItemGUID]
        ]);
    },

    unmarkAsCached: function(item) {
        Dom.rmIfHas(item, [
            this.C.CACHED_PER_OW_DATA_ATTR,
            this.C.CACHED_PER_OW_ITEM_GUID_DATA_ATTR,
            this.C.CACHED_PER_OH_DATA_ATTR,
            this.C.CACHED_PER_OH_ITEM_GUID_DATA_ATTR
        ]);
    },

    _getCachedItemEntry: function(item, cache, cachedItemGUID) {
        for(var i = 0; i < cache.length; i++) {
            if(parseInt(cache[i].cachedItemGUID) == parseInt(cachedItemGUID))
                return cache[i];
        }
    },

    _getOuterWidthCachedItemEntry: function(item) {
        return this._getCachedItemEntry(item, this._outerWidthCache, Dom.get(item, this.C.CACHED_PER_OW_ITEM_GUID_DATA_ATTR));
    },

    _getOuterHeightCachedItemEntry: function(DOMElem) {
        return this._getCachedItemEntry(item, this._outerHeightCache, Dom.get(item, this.C.CACHED_PER_OH_ITEM_GUID_DATA_ATTR))
    },

    _isCallWithSuchParamsCached: function(item, includeMargins, cacheAttr, cacheGetter) {
        if(!Dom.has(item, cacheAttr))
            return false;

        var cachedItemEntry = cacheGetter(item);

        if(includeMargins)
            return (cachedItemEntry.cachedReturnedValues.withIncludeMarginsParam != null) ? true : false;
        else
            return (cachedItemEntry.cachedReturnedValues.withoutIncludeMarginsParam != null) ? true : false
    },

    _isOuterWidthCallWithSuchParamsCached: function(item, includeMargins) {
        var me = this;
        return this._isCallWithSuchParamsCached(item, includeMargins, this.C.CACHED_PER_OW_DATA_ATTR, function(item) {
            return me._getOuterWidthCachedItemEntry(item);
        });
    },

    _isOuterHeightCallWithSuchParamsCached: function(item, includeMargins) {
        var me = this;
        return this._isCallWithSuchParamsCached(item, includeMargins, this.C.CACHED_PER_OH_DATA_ATTR, function(item) {
            return me._getOuterHeightCachedItemEntry(item);
        });
    },

    startCachingTransaction: function() {
        this._isCachingTransactionActive = true;
    },

    stopCachingTransaction: function() {
        this._isCachingTransactionActive = false;

        for(var i = 0; i < this._outerWidthCache.length; i++)
            this.unmarkAsCached(this._outerWidthCache[i].DOMElem);

        for(var i = 0; i < this._outerHeightCache.length; i++)
            this.unmarkAsCached(this._outerHeightCache[i].DOMElem);

        this._outerWidthCache = [];
        this._outerHeightCache = [];

        this._nextCachedItemGUIDPerOuterWidth = 0;
        this._nextCachedItemGUIDPerOuterHeight = 0;
    },

    _outer: function(item,
                     includeMargins,
                     disableAntialiasing,
                     disablePercentageCSSRecalc,
                     disableBordersCalc,
                     isRecursiveSubcall,
                     isOhCall) {
        var args = arguments;

        var isOhCall = isOhCall || false;
        args[2] = args[2] || false;
        args[5] = args[5] || false;

        if(!this._isCachingTransactionActive)
            return (!isOhCall) ? this._callRealOuterWidth.apply(this, args) : this._callRealOuterHeight.apply(this, args);

        var cachedItemEntry = null;
        if(!isOhCall && this._isOuterWidthCallWithSuchParamsCached(item, includeMargins))
            cachedItemEntry = this._getOuterWidthCachedItemEntry(item);
        else if(isOhCall && this._isOuterHeightCallWithSuchParamsCached(item, includeMargins))
            cachedItemEntry = this._getOuterHeightCachedItemEntry(item);

        if(cachedItemEntry != null) {
            var cachedVals = cachedItemEntry.cachedReturnedValues;
            return (includeMargins) ? cachedVals.withIncludeMarginsParam : cachedVals.withoutIncludeMarginsParam;
        }

        var returnedValue = (!isOhCall) ? this._callRealOuterWidth.apply(this, args) : this._callRealOuterHeight.apply(this, args);

        if((!isOhCall && Dom.has(item, this.C.CACHED_PER_OW_DATA_ATTR)) || (isOhCall && Dom.has(item, this.C.CACHED_PER_OH_DATA_ATTR))) {
            var cachedItemEntry = (!isOhCall) ? this._getOuterWidthCachedItemEntry(item) : this._getOuterHeightCachedItemEntry(item);
            if(includeMargins)
                cachedItemEntry.cachedReturnedValues.withIncludeMarginsParam = returnedValue;
            else
                cachedItemEntry.cachedReturnedValues.withoutIncludeMarginsParam = returnedValue;
        }
        else {
            if(!isOhCall)
                this._markAsCachedPerOuterWidth(item, ++this._nextCachedItemGUIDPerOuterWidth);
            else
                this._markAsCachedPerOuterHeight(item, ++this._nextCachedItemGUIDPerOuterHeight);

            var cachedReturnedValues = {
                withIncludeMarginsParam: (includeMargins) ? returnedValue : null,
                withoutIncludeMarginsParam: (!includeMargins) ? returnedValue : null
            };
            var cache = (!isOhCall) ? this._outerWidthCache : this._outerHeightCache;
            cache.push({
                cachedItemGUID: (!isOhCall) ? this._nextCachedItemGUIDPerOuterWidth : this._nextCachedItemGUIDPerOuterHeight,
                DOMElem: item,
                cachedReturnedValues: cachedReturnedValues
            });
        }

        return returnedValue;
    },

    outerWidth: function() {
        return this._outer(arguments);
    },

    outerHeight: function() {
        return this._outer(arguments.push(true));
    },

    _callRealOuterWidth: function(DOMElem,
                                  includeMargins,
                                  disableAntialiasing,
                                  disablePercentageCSSRecalc,
                                  disableBordersCalc,
                                  isRecursiveSubcall) {
        var me = this;
        var realRecalculatePercentageWidthFunction = SizesResolver.recalculatePercentageWidthFunction;

        SizesResolver.recalculatePercentageWidthFunction = function(DOMElem,
                                                                    includeMargins,
                                                                    disablePercentageCSSRecalc,
                                                                    disableBordersCalc) {
            return me.outerWidth(
                DOMElem, includeMargins, true, disablePercentageCSSRecalc, disableBordersCalc, true
            );
        }

        if(!isRecursiveSubcall)
            SizesResolver.clearRecursiveSubcallsData();

        var returnedValue = SizesResolver.outerWidth(
            DOMElem, includeMargins, disablePercentageCSSRecalc, disableBordersCalc
        );

        if(!disableAntialiasing)
            returnedValue -= this._outerWidthAntialiasValue;

        SizesResolver.recalculatePercentageWidthFunction = realRecalculatePercentageWidthFunction;

        return returnedValue;
    },

    _callRealOuterHeight: function(DOMElem,
                                   includeMargins,
                                   disableAntialiasing,
                                   disablePercentageCSSRecalc,
                                   disableBordersCalc,
                                   isRecursiveSubcall) {
        var me = this;
        var realRecalculatePercentageWidthFunction = SizesResolver.recalculatePercentageWidthFunction;
        var realRecalculatePercentageHeightFunction = SizesResolver.recalculatePercentageHeightFunction;

        SizesResolver.recalculatePercentageWidthFunction = function(DOMElem,
                                                                    includeMargins,
                                                                    disablePercentageCSSRecalc,
                                                                    disableBordersCalc) {
            return me.outerWidth(
                DOMElem, includeMargins, true, disablePercentageCSSRecalc, disableBordersCalc, true
            );
        }
        SizesResolver.recalculatePercentageHeightFunction = function(DOMElem,
                                                                     includeMargins,
                                                                     disablePercentageCSSRecalc,
                                                                     disableBordersCalc) {
            return me.outerHeight(
                DOMElem, includeMargins, true, disablePercentageCSSRecalc, disableBordersCalc, true
            );
        }

        if(!isRecursiveSubcall)
            SizesResolver.clearRecursiveSubcallsData();

        var returnedValue = SizesResolver.outerHeight(
            DOMElem, includeMargins, disablePercentageCSSRecalc, disableBordersCalc
        );

        if(!disableAntialiasing)
            returnedValue -= this._outerHeightAntialiasValue;

        SizesResolver.recalculatePercentageWidthFunction = realRecalculatePercentageWidthFunction;
        SizesResolver.recalculatePercentageHeightFunction = realRecalculatePercentageHeightFunction;

        return returnedValue;
    },

    positionTop: function(DOMElem) {
        return SizesResolver.positionTop(DOMElem);
    },

    positionLeft: function(DOMElem) {
        return SizesResolver.positionLeft(DOMElem);
    },

    offsetLeft: function(DOMElem, substractMargins) {
        var substractMargins = substractMargins || false;

        if(substractMargins) {
            var elemWidth = this.outerWidth(DOMElem);
            var elemWidthWithMargins = this.outerWidth(DOMElem, true);
            var marginWidth = elemWidthWithMargins - elemWidth;
            var halfOfMarginWidth = marginWidth / 2;
            var offsetLeft = SizesResolver.offsetLeft(DOMElem) - halfOfMarginWidth;
        }
        else {
            var offsetLeft = SizesResolver.offsetLeft(DOMElem);
        }

        return offsetLeft;
    },

    offsetTop: function(DOMElem, substractMargins) {
        var substractMargins = substractMargins || false;

        if(substractMargins) {
            var elemHeight = this.outerHeight(DOMElem);
            var elemHeightWithMargins = this.outerHeight(DOMElem, true);
            var marginHeight = elemHeightWithMargins - elemHeight;
            var halfOfMarginHeight = marginHeight / 2;
            var offsetTop = SizesResolver.offsetTop(DOMElem) - halfOfMarginHeight;
        }
        else {
            var offsetTop = SizesResolver.offsetTop(DOMElem);
        }

        return offsetTop;
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

                    var childNodeRawSizes = SizesResolver.getComputedCSSWithMaybePercentageSizes(sourceItem.childNodes[i]);

                    targetItem.childNodes[i].style.width = me.outerWidth(sourceItem.childNodes[i]) + "px";
                    if(Dom.toInt(childNodeRawSizes.height) != 0)
                        targetItem.childNodes[i].style.height = me.outerHeight(sourceItem.childNodes[i]) + "px";
                }
            }
        }

        copyRecursive(sourceItem, targetItem);
    }
});