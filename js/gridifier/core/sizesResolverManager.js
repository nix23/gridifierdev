Gridifier.SizesResolverManager = function() {
    var me = this;

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

    this._css = {
    };

    this._construct = function() {
    };

    this._bindEvents = function() {
    };

    this._unbindEvents = function() {
    };

    this.destruct = function() {
        me._unbindEvents();
    };

    this._construct();
    return this;
}

Gridifier.SizesResolverManager.CACHED_PER_OUTERWIDTH_ITEM_GUID_DATA_ATTR = "data-gridifier-cached-per-outerwidth-guid";
Gridifier.SizesResolverManager.CACHED_PER_OUTERHEIGHT_ITEM_GUID_DATA_ATTR = "data-gridifier-cached-per-outerheight-guid";
Gridifier.SizesResolverManager.CACHED_PER_OUTERWIDTH_DATA_ATTR = "data-gridifier-cached-per-outerwidth";
Gridifier.SizesResolverManager.CACHED_PER_OUTERHEIGHT_DATA_ATTR = "data-gridifier-cached-per-outerheight";
Gridifier.SizesResolverManager.EMPTY_DATA_ATTR_VALUE = "gridifier-empty-data";

Gridifier.SizesResolverManager.prototype.setOuterWidthAntialiasValue = function(newValue) {
    this._outerWidthAntialiasValue = newValue;
}

Gridifier.SizesResolverManager.prototype.setOuterHeightAntialiasValue = function(newValue) {
    this._outerHeightAntialiasValue = newValue;
}

Gridifier.SizesResolverManager.prototype._markAsCachedPerOuterWidth = function(DOMElem, cachedItemGUID) {
    DOMElem.setAttribute(
        Gridifier.SizesResolverManager.CACHED_PER_OUTERWIDTH_DATA_ATTR,
        Gridifier.SizesResolverManager.EMPTY_DATA_ATTR_VALUE
    );

    DOMElem.setAttribute(
        Gridifier.SizesResolverManager.CACHED_PER_OUTERWIDTH_ITEM_GUID_DATA_ATTR,
        cachedItemGUID
    );
}

Gridifier.SizesResolverManager.prototype._markAsCachedPerOuterHeight = function(DOMElem, cachedItemGUID) {
    DOMElem.setAttribute(
        Gridifier.SizesResolverManager.CACHED_PER_OUTERHEIGHT_DATA_ATTR,
        Gridifier.SizesResolverManager.EMPTY_DATA_ATTR_VALUE
    );

    DOMElem.setAttribute(
        Gridifier.SizesResolverManager.CACHED_PER_OUTERHEIGHT_ITEM_GUID_DATA_ATTR,
        cachedItemGUID
    );
}

Gridifier.SizesResolverManager.prototype.unmarkAsCached = function(DOMElem) {
    if(Dom.hasAttribute(DOMElem, Gridifier.SizesResolverManager.CACHED_PER_OUTERWIDTH_DATA_ATTR))
        DOMElem.removeAttribute(Gridifier.SizesResolverManager.CACHED_PER_OUTERWIDTH_DATA_ATTR);

    if(Dom.hasAttribute(DOMElem, Gridifier.SizesResolverManager.CACHED_PER_OUTERWIDTH_ITEM_GUID_DATA_ATTR))
        DOMElem.removeAttribute(Gridifier.SizesResolverManager.CACHED_PER_OUTERWIDTH_ITEM_GUID_DATA_ATTR);

    if(Dom.hasAttribute(DOMElem, Gridifier.SizesResolverManager.CACHED_PER_OUTERHEIGHT_DATA_ATTR))
        DOMElem.removeAttribute(Gridifier.SizesResolverManager.CACHED_PER_OUTERHEIGHT_DATA_ATTR);

    if(Dom.hasAttribute(DOMElem, Gridifier.SizesResolverManager.CACHED_PER_OUTERHEIGHT_ITEM_GUID_DATA_ATTR))
        DOMElem.removeAttribute(Gridifier.SizesResolverManager.CACHED_PER_OUTERHEIGHT_ITEM_GUID_DATA_ATTR);
}

Gridifier.SizesResolverManager.prototype._getOuterWidthCachedItemEntry = function(DOMElem) {
    var cachedItemGUIDAttr = Gridifier.SizesResolverManager.CACHED_PER_OUTERWIDTH_ITEM_GUID_DATA_ATTR;
    var cachedItemGUID = DOMElem.getAttribute(cachedItemGUIDAttr);

    for(var i = 0; i < this._outerWidthCache.length; i++) {
        if(parseInt(this._outerWidthCache[i].cachedItemGUID) == parseInt(cachedItemGUID))
            return this._outerWidthCache[i];
    }
}

Gridifier.SizesResolverManager.prototype._getOuterHeightCachedItemEntry = function(DOMElem) {
    var cachedItemGUIDAttr = Gridifier.SizesResolverManager.CACHED_PER_OUTERHEIGHT_ITEM_GUID_DATA_ATTR;
    var cachedItemGUID = DOMElem.getAttribute(cachedItemGUIDAttr);

    for(var i = 0; i < this._outerHeightCache.length; i++) {
        if(parseInt(this._outerHeightCache[i].cachedItemGUID) == parseInt(cachedItemGUID))
            return this._outerHeightCache[i];
    }
}

Gridifier.SizesResolverManager.prototype._isOuterWidthCallWithSuchParamsCached = function(DOMElem, includeMarginsCallParam) {
    if(!Dom.hasAttribute(DOMElem, Gridifier.SizesResolverManager.CACHED_PER_OUTERWIDTH_DATA_ATTR))
        return false;

    var cachedItemEntry = this._getOuterWidthCachedItemEntry(DOMElem);

    if(includeMarginsCallParam) 
        return (cachedItemEntry.cachedReturnedValues.withIncludeMarginsParam != null) ? true : false;
    else 
        return (cachedItemEntry.cachedReturnedValues.withoutIncludeMarginsParam != null) ? true : false;
}

Gridifier.SizesResolverManager.prototype._isOuterHeightCallWithSuchParamsCached = function(DOMElem, includeMarginsCallParam) {
    if(!Dom.hasAttribute(DOMElem, Gridifier.SizesResolverManager.CACHED_PER_OUTERHEIGHT_DATA_ATTR))
        return false;

    var cachedItemEntry = this._getOuterHeightCachedItemEntry(DOMElem);

    if(includeMarginsCallParam)
        return (cachedItemEntry.cachedReturnedValues.withIncludeMarginsParam != null) ? true : false;
    else
        return (cachedItemEntry.cachedReturnedValues.withoutIncludeMarginsParam) ? true : false;
}

Gridifier.SizesResolverManager.prototype.startCachingTransaction = function() {
    this._isCachingTransactionActive = true;
}

Gridifier.SizesResolverManager.prototype.stopCachingTransaction = function() {
    this._isCachingTransactionActive = false;

    for(var i = 0; i < this._outerWidthCache.length; i++)
        this.unmarkAsCached(this._outerWidthCache[i].DOMElem);

    for(var i = 0; i < this._outerHeightCache.length; i++)
        this.unmarkAsCached(this._outerHeightCache[i].DOMElem);

    this._outerWidthCache = [];
    this._outerHeightCache = [];

    this._nextCachedItemGUIDPerOuterWidth = 0;
    this._nextCachedItemGUIDPerOuterHeight = 0;
}

Gridifier.SizesResolverManager.prototype.outerWidth = function(DOMElem,
                                                               includeMargins, 
                                                               disableAntialiasing,
                                                               disablePercentageCSSRecalc, 
                                                               disableBordersCalc,
                                                               isRecursiveSubcall) {
    var disableAntialiasing = disableAntialiasing || false;
    var isRecursiveSubcall = isRecursiveSubcall || false;
    
    if(!this._isCachingTransactionActive) {
        return this._callRealOuterWidth(
            DOMElem, includeMargins, disableAntialiasing, disablePercentageCSSRecalc, disableBordersCalc, isRecursiveSubcall
        );
    }

    if(this._isOuterWidthCallWithSuchParamsCached(DOMElem, includeMargins)) { 
        var cachedItemEntry = this._getOuterWidthCachedItemEntry(DOMElem);
        if(includeMargins)
            return cachedItemEntry.cachedReturnedValues.withIncludeMarginsParam;
        else
            return cachedItemEntry.cachedReturnedValues.withoutIncludeMarginsParam;
    }
    
    var returnedValue = this._callRealOuterWidth(
        DOMElem, includeMargins, disableAntialiasing, disablePercentageCSSRecalc, disableBordersCalc, isRecursiveSubcall
    );

    if(Dom.hasAttribute(DOMElem, Gridifier.SizesResolverManager.CACHED_PER_OUTERWIDTH_DATA_ATTR)) {
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
}

Gridifier.SizesResolverManager.prototype._callRealOuterWidth = function(DOMElem,
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
}

Gridifier.SizesResolverManager.prototype.outerHeight = function(DOMElem, 
                                                                includeMargins, 
                                                                disableAntialiasing,
                                                                disablePercentageCSSRecalc, 
                                                                disableBordersCalc,
                                                                isRecursiveSubcall) {
    var disableAntialiasing = disableAntialiasing || false;
    var isRecursiveSubcall = isRecursiveSubcall || false;

    if(!this._isCachingTransactionActive) {
        return this._callRealOuterHeight(
            DOMElem, includeMargins, disableAntialiasing, disablePercentageCSSRecalc, disableBordersCalc, isRecursiveSubcall
        );
    }

    if(this._isOuterHeightCallWithSuchParamsCached(DOMElem, includeMargins)) {
        var cachedItemEntry = this._getOuterHeightCachedItemEntry(DOMElem);
        if(includeMargins)
            return cachedItemEntry.cachedReturnedValues.withIncludeMarginsParam;
        else
            return cachedItemEntry.cachedReturnedValues.withoutIncludeMarginsParam;
    }

    var returnedValue = this._callRealOuterHeight(
        DOMElem, includeMargins, disableAntialiasing, disablePercentageCSSRecalc, disableBordersCalc, isRecursiveSubcall
    );

    if(Dom.hasAttribute(DOMElem, Gridifier.SizesResolverManager.CACHED_PER_OUTERHEIGHT_DATA_ATTR)) {
        var cachedItemEntry = this._getOuterHeightCachedItemEntry(DOMElem);
        if(includeMargins)
            cachedItemEntry.cachedReturnedValues.withIncludeMarginsParam = returnedValue;
        else
            cachedItemEntry.cachedReturnedValues.withoutIncludeMarginsParam = returnedValue;
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
}

Gridifier.SizesResolverManager.prototype._callRealOuterHeight = function(DOMElem,
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
}

Gridifier.SizesResolverManager.prototype.positionTop = function(DOMElem) {
    return SizesResolver.positionTop(DOMElem);
}

Gridifier.SizesResolverManager.prototype.positionLeft = function(DOMElem) {
    return SizesResolver.positionLeft(DOMElem);
}

Gridifier.SizesResolverManager.prototype.offsetLeft = function(DOMElem, substractMargins) {
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
}

Gridifier.SizesResolverManager.prototype.offsetTop = function(DOMElem, substractMargins) {
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
}

Gridifier.SizesResolverManager.prototype.viewportWidth = function() {
    return document.documentElement.clientWidth;
}

Gridifier.SizesResolverManager.prototype.viewportHeight = function() {
    return document.documentElement.clientHeight;
}

Gridifier.SizesResolverManager.prototype.viewportScrollLeft = function() {
    return window.pageXOffset || document.documentElement.scrollLeft;
}

Gridifier.SizesResolverManager.prototype.viewportScrollTop = function() {
    return window.pageYOffset || document.documentElement.scrollTop;
}

Gridifier.SizesResolverManager.prototype.viewportDocumentCoords = function() {
    return {
        x1: this.viewportScrollLeft(),
        x2: this.viewportScrollLeft() + this.viewportWidth() - 1,
        y1: this.viewportScrollTop(),
        y2: this.viewportScrollTop() + this.viewportHeight() - 1
    };
}

Gridifier.SizesResolverManager.prototype.copyComputedStyle = function(sourceItem, targetItem) {
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