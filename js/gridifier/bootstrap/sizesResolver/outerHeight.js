// @disablePercentageCSSRecalc -> HTML node can't have size with fractional value,
//                         so we should supress this calculation in IE8/Safari 5.1.7, etc...
SizesResolver.outerHeight = function(item, includeMargins, disablePtCSSRecalc, disableBordersCalc) {
    var includeMargins = includeMargins || false;
    var disablePtCSSRecalc = disablePtCSSRecalc || false;
    var disableBordersCalc = disableBordersCalc || false;
    var itemComputedCSS = this.getComputedCSS(item);

    if(disablePtCSSRecalc || this._areBrowserPtVals())
        var recalcPtCSSVals = false;
    else if(this._areRecalcPtVals()) {
        this._ensureHasParentNode(item);
        var recalcPtCSSVals = this._hasPtCSSVal("height", item);
    }

    if(itemComputedCSS.display === "none")
        return 0;

    var computedProps = this._getComputedProps("forOh", itemComputedCSS, item);

    var paddingHeight = computedProps.paddingTop + computedProps.paddingBottom;
    var marginHeight = computedProps.marginTop + computedProps.marginBottom;
    var borderHeight = computedProps.borderTopWidth + computedProps.borderBottomWidth;

    var outerHeight = 0;
    var normalizedComputedHeight = this._normalizeComputedCSS(itemComputedCSS.height);

    if(normalizedComputedHeight !== false)
        outerHeight = normalizedComputedHeight;

    var uncomputedItemCSS = null;
    var parentItemWidth = null;
    var parentItemHeight = null;

    if(recalcPtCSSVals) {
        uncomputedItemCSS = this.getUncomputedCSS(item);
        parentItemWidth = this.recalcPtWidthFn.call(
            this, item.parentNode, false, (item.parentNode.nodeName == "HTML"), true
        );

        if(this._hasLastBorderBox)
            parentItemWidth -= this._lastBorderWidth;

        parentItemHeight = this.recalcPtHeightFn.call(
            this, item.parentNode, false, (item.parentNode.nodeName == "HTML"), true
        );

        if(this._hasLastBorderBox && this._hasPtCSSVal("height", item, uncomputedItemCSS))
            parentItemHeight -= this._lastBorderHeight;
    }

    if(recalcPtCSSVals && this._hasPtCSSVal(["paddingTop", "paddingBottom"], item, uncomputedItemCSS)) {
        paddingHeight = this._recalcTwoSidePropPtVals(
            item, parentItemWidth, computedProps, uncomputedItemCSS, "padding", true
        );
    }

    if(recalcPtCSSVals && this._hasPtCSSVal("height", item, uncomputedItemCSS))
        outerHeight = this._recalcPtVal(item, parentItemHeight, uncomputedItemCSS, "height");

    if(!this._isDefBoxSizing(itemComputedCSS) || (this._isDefBoxSizing(itemComputedCSS) && !this._isOuterBoxSizing())) {
        this._lastRawHeight = outerHeight;
        outerHeight += paddingHeight;
        if(!disableBordersCalc) outerHeight += borderHeight;
        this._hasLastBorderBox = false;
    }
    else {
        this._hasLastBorderBox = true;
        this._lastRawHeight = outerHeight;
        // If parentEl has BorderBox BS, children percentage element height
        // should be calculated without borderHeight.
        this._lastBorderHeight = borderHeight;
    }

    if(includeMargins) {
        if(recalcPtCSSVals && this._hasPtCSSVal(["marginTop", "marginBottom"], item, uncomputedItemCSS)) {
            marginHeight = this._recalcTwoSidePropPtVals(
                item, parentItemWidth, computedProps, uncomputedItemCSS, "margin", true
            );
        }

        outerHeight += marginHeight;
    }

    return outerHeight;
};