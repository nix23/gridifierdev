var SizesResolverManager = {
    _outerWidthCache: [
        // { cachedItemGUID: Number, DOMElem: Object, cachedReturnedValues: {
        //      withIncludeMarginsParam: Number || null,
        //      withoutIncludeMarginsParam: Number || null
        // }},
        // ...
    ],
    _outerHeightCache: [
        // { cachedItemGUID: Number, DOMElem: Object, cachedReturnedValues: {
        //      withIncludeMarginsParam: Number || null,
        //      withoutIncludeMarginsParam: Number || null
        // }},
        // ...
    ],
    _nextCachedItemGUIDPerOuterWidth: 0,
    _nextCachedItemGUIDPerOuterHeight: 0,
    _isCachingTransactionActive: false,

    init: function() {
        SizesResolver.recalculatePercentageWidthFunction = function(DOMElem, 
                                                                    includeMargins, 
                                                                    disablePercentageCSSRecalc,
                                                                    disableBordersCalc) {
            return SizesResolverManager.outerWidth(
                DOMElem, includeMargins, disablePercentageCSSRecalc, disableBordersCalc
            );
        }

        SizesResolver.recalculatePercentageHeightFunction = function(DOMElem, 
                                                                     includeMargins, 
                                                                     disablePercentageCSSRecalc) {
            return SizesResolverManager.outerHeight(DOMElem, includeMargins, disablePercentageCSSRecalc);
        }
    },

    _markAsCachedPerOuterWidth: function(DOMElem, cachedItemGUID) {
        DOMElem.setAttribute(
            SizesResolverManager.CACHED_PER_OUTERWIDTH_DATA_ATTR,
            SizesResolverManager.EMPTY_DATA_ATTR_VALUE
        );

        DOMElem.setAttribute(
            SizesResolverManager.CACHED_PER_OUTERWIDTH_ITEM_GUID_DATA_ATTR,
            cachedItemGUID
        );
    },

    _markAsCachedPerOuterHeight: function(DOMElem, cachedItemGUID) {
        DOMElem.setAttribute(
            SizesResolverManager.CACHED_PER_OUTERHEIGHT_DATA_ATTR,
            SizesResolverManager.EMPTY_DATA_ATTR_VALUE
        );

        DOMElem.setAttribute(
            SizesResolverManager.CACHED_PER_OUTERHEIGHT_ITEM_GUID_DATA_ATTR,
            cachedItemGUID
        );
    },

    unmarkAsCached: function(DOMElem) {
        if(Dom.hasAttribute(DOMElem, SizesResolverManager.CACHED_PER_OUTERWIDTH_DATA_ATTR))
            DOMElem.removeAttribute(SizesResolverManager.CACHED_PER_OUTERWIDTH_DATA_ATTR);

        if(Dom.hasAttribute(DOMElem, SizesResolverManager.CACHED_PER_OUTERWIDTH_ITEM_GUID_DATA_ATTR))
            DOMElem.removeAttribute(SizesResolverManager.CACHED_PER_OUTERWIDTH_ITEM_GUID_DATA_ATTR);

        if(Dom.hasAttribute(DOMElem, SizesResolverManager.CACHED_PER_OUTERHEIGHT_DATA_ATTR))
            DOMElem.removeAttribute(SizesResolverManager.CACHED_PER_OUTERHEIGHT_DATA_ATTR);

        if(Dom.hasAttribute(DOMElem, SizesResolverManager.CACHED_PER_OUTERHEIGHT_ITEM_GUID_DATA_ATTR))
            DOMElem.removeAttribute(SizesResolverManager.CACHED_PER_OUTERWIDTH_ITEM_GUID_DATA_ATTR);
    },

    _getOuterWidthCachedItemEntry: function(DOMElem) {
        var cachedItemGUIDAttr = SizesResolverManager.CACHED_PER_OUTERWIDTH_ITEM_GUID_DATA_ATTR;
        var cachedItemGUID = DOMElem.getAttribute(cachedItemGUIDAttr);

        for(var i = 0; i < this._outerWidthCache.length; i++) {
            if(parseInt(this._outerWidthCache[i].cachedItemGUID) == parseInt(cachedItemGUID))
                return this._outerWidthCache[i];
        }
    },

    _getOuterHeightCachedItemEntry: function(DOMElem) {
        var cachedItemGUIDAttr = SizesResolverManager.CACHED_PER_OUTERHEIGHT_ITEM_GUID_DATA_ATTR;
        var cachedItemGUID = DOMElem.getAttribute(cachedItemGUIDAttr);

        for(var i = 0; i < this._outerHeightCache.length; i++) {
            if(parseInt(this._outerHeightCache[i].cachedItemGUID) == parseInt(cachedItemGUID))
                return this._outerHeightCache[i];
        }
    },

    _isOuterWidthCallWithSuchParamsCached: function(DOMElem, includeMarginsCallParam) {
        if(!Dom.hasAttribute(DOMElem, SizesResolverManager.CACHED_PER_OUTERWIDTH_DATA_ATTR))
            return false;

        var cachedItemEntry = this._getOuterWidthCachedItemEntry(DOMElem);

        if(includeMarginsCallParam) 
            return (cachedItemEntry.cachedReturnedValues.withIncludeMarginsParam != null) ? true : false;
        else 
            return (cachedItemEntry.cachedReturnedValues.withoutIncludeMarginsParam != null) ? true : false;
    },

    _isOuterHeightCallWithSuchParamsCached: function(DOMElem, includeMarginsCallParam) {
        if(!Dom.hasAttribute(DOMElem, SizesResolverManager.CACHED_PER_OUTERHEIGHT_DATA_ATTR))
            return false;

        var cachedItemEntry = this._getOuterHeightCachedItemEntry(DOMElem);

        if(includeMarginsCallParam)
            return (cachedItemEntry.cachedReturnedValues.withIncludeMarginsParam != null) ? true : false;
        else
            return (cachedItemEntry.cachedReturnedValues.withoutIncludeMarginsParam) ? true : false;
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

    outerWidth: function(DOMElem, includeMargins, disablePercentageCSSRecalc, disableBordersCalc) {
        if(!this._isCachingTransactionActive) {
            return SizesResolver.outerWidth(
                DOMElem, includeMargins, disablePercentageCSSRecalc, disableBordersCalc
            );
        }

        if(this._isOuterWidthCallWithSuchParamsCached(DOMElem, includeMargins)) {
            var cachedItemEntry = this._getOuterWidthCachedItemEntry(DOMElem);
            if(includeMargins)
                return cachedItemEntry.cachedReturnedValues.withIncludeMarginsParam;
            else
                return cachedItemEntry.cachedReturnedValues.withoutIncludeMarginsParam;
        }

        var returnedValue = SizesResolver.outerWidth(
            DOMElem, includeMargins, disablePercentageCSSRecalc, disableBordersCalc
        );

        if(Dom.hasAttribute(DOMElem, SizesResolverManager.CACHED_PER_OUTERWIDTH_DATA_ATTR)) {
            var cachedItemEntry = this._getOuterWidthCachedItemEntry(DOMElem);
            if(includeMargins)
                cachedItemEntry.cachedReturnedValues.withIncludeMarginsParam = returnedValue;
            else
                cachedItemEntry.cachedReturnedValues.withoutIncludeMarginsParam = returnedValue;
        }
        else {
            this._nextCachedItemGUIDPerOuterWidth++;
            this._markAsCachedPerOuterWidth(DOMElem, this._nextCachedItemGUIDPerOuterWidth);

            var cachedReturnedValues = {};
            cachedReturnedValues.withIncludeMarginsParam = (includeMargins) ? returnedValue : null;
            cachedReturnedValues.withoutIncludeMarginsParam = (!includeMargins) ? returnedValue : null;

            this._outerWidthCache.push({
                cachedItemGUID: this._nextCachedItemGUIDPerOuterWidth,
                DOMElem: DOMElem,
                cachedReturnedValues: cachedReturnedValues
            });
        }

        return returnedValue;
    },

    outerHeight: function(DOMElem, includeMargins) {
        if(!this._isCachingTransactionActive)
            return SizesResolver.outerHeight(DOMElem, includeMargins);

        if(this._isOuterHeightCallWithSuchParamsCached(DOMElem, includeMargins)) {
            var cachedItemEntry = this._getOuterHeightCachedItemEntry(DOMElem);
            if(includeMargins)
                return cachedItemEntry.cachedReturnedValues.withIncludeMarginsParam;
            else
                return cachedItemEntry.cachedReturnedValues.withoutIncludeMarginsParam;
        }

        var returnedValue = SizesResolver.outerHeight(DOMElem, includeMargins);

        if(Dom.hasAttribute(DOMElem, SizesResolverManager.CACHED_PER_OUTERHEIGHT_DATA_ATTR)) {
            var cachedItemEntry = this._getOuterHeightCachedItemEntry(DOMElem);
            if(includeMargins)
                cachedItemEntry.cachedReturnedValues.withIncludeMarginsParam = returnedValue;
            else
                cachedItemEntry.cachedReturnedValues.withoutIncludeMarginsParam = retunedValue;
        }
        else {
            this._nextCachedItemGUIDPerOuterHeight++;
            this._markAsCachedPerOuterHeight(DOMElem, this._nextCachedItemGUIDPerOuterHeight);

            var cachedReturnedValues = {};
            cachedReturnedValues.withIncludeMarginsParam = (includeMargins) ? returnedValue : null;
            cachedReturnedValues.withoutIncludeMarginsParam = (!includeMargins) ? returnedValue : null;

            this._outerHeightCache.push({
                cachedItemGUID: this._nextCachedItemGUIDPerOuterHeight,
                DOMElem: DOMElem,
                cachedReturnedValues: cachedReturnedValues
            });
        }

        return returnedValue;
    },

    positionTop: function(DOMElem) {
        return SizesResolver.positionTop(DOMElem);
    },

    positionLeft: function(item) {
        return SizesResolver.positionLeft(DOMElem);
    }
}
SizesResolverManager.init();

SizesResolverManager.CACHED_PER_OUTERWIDTH_ITEM_GUID_DATA_ATTR = "data-gridifier-cached-per-outerwidth-guid";
SizesResolverManager.CACHED_PER_OUTERHEIGHT_ITEM_GUID_DATA_ATTR = "data-gridifier-cached-per-outerheight-guid";
SizesResolverManager.CACHED_PER_OUTERWIDTH_DATA_ATTR = "data-gridifier-cached-per-outerwidth";
SizesResolverManager.CACHED_PER_OUTERHEIGHT_DATA_ATTR = "data-gridifier-cached-per-outerheight";
SizesResolverManager.EMPTY_DATA_ATTR_VALUE = "gridifier-empty-data";