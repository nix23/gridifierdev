// @disablePercentageCSSRecalc -> HTML node can't have size with fractional value,
//                                so we should supress this calculation in IE8/Safari 5.1.7,etc...
SizesResolver.outerWidth = function(item, includeMargins, disablePtCSSRecalc, disableBordersCalc) {
    var includeMargins = includeMargins || false;
    var disablePtCSSRecalc = disablePtCSSRecalc || false;
    var disableBordersCalc = disableBordersCalc || false;
    var itemComputedCSS = this.getComputedCSS(item);
    
    if(disablePtCSSRecalc || this._areBrowserPtVals())
        var recalcPtCSSVals = false;
    else if(this._areRecalcPtVals()) {
        this._ensureHasParentNode(item);
        var recalcPtCSSVals = this._hasPtCSSVal("width", item);
    }
    
    if(itemComputedCSS.display === "none")
        return 0;

    var computedProps = this._getComputedProps("forOw", itemComputedCSS, item);
    
    var paddingWidth = computedProps.paddingLeft + computedProps.paddingRight;
    var marginWidth = computedProps.marginLeft + computedProps.marginRight;
    var borderWidth = computedProps.borderLeftWidth + computedProps.borderRightWidth;
    
    // The HTMLElement.offsetWidth read-only property returns the layout width of an element. Typically, 
    // an element's offsetWidth is a measurement which includes the element borders, the element horizontal padding, 
    // the element vertical scrollbar (if present, if rendered) and the element CSS width.
    var outerWidth = 0;
    var normalizedComputedWidth = this._normalizeComputedCSS(itemComputedCSS.width);
    
    if(normalizedComputedWidth !== false)
        outerWidth = normalizedComputedWidth;

    var uncomputedItemCSS = null;
    var parentItemWidth = null;
    
    if(recalcPtCSSVals) {
        uncomputedItemCSS = this.getUncomputedCSS(item);
        parentItemWidth = this.recalcPtWidthFn.call(
            this, item.parentNode, false, (item.parentNode.nodeName == "HTML"), true
        );

        if(this._hasLastBorderBox && this._hasPtCSSVal("width", item, uncomputedItemCSS))
            parentItemWidth -= this._lastBorderWidth;
    }

    if(recalcPtCSSVals && this._hasPtCSSVal(["paddingLeft", "paddingRight"], item, uncomputedItemCSS)) {
        paddingWidth = this._recalcTwoSidePropPtVals(
            item, parentItemWidth, computedProps, uncomputedItemCSS, "padding"
        );
    }
    
    if(recalcPtCSSVals && this._hasPtCSSVal("width", item, uncomputedItemCSS))
        outerWidth = this._recalcPtVal(item, parentItemWidth, uncomputedItemCSS, "width");

    if(!this._isDefBoxSizing(itemComputedCSS) || (this._isDefBoxSizing(itemComputedCSS) && !this._isOuterBoxSizing())) {
        this._lastRawWidth = outerWidth;
        outerWidth += paddingWidth;
        if(!disableBordersCalc) outerWidth += borderWidth;
        this._hasLastBorderBox = false;
    }
    else {
        this._hasLastBorderBox = true;
        this._lastRawWidth = outerWidth;
        // If parent el has BorderBox BS, children percentage element width
        // should be calculated without borderWidth. 
        this._lastBorderWidth = borderWidth;
    }

    if(includeMargins) {
        if(recalcPtCSSVals && this._hasPtCSSVal(["marginLeft", "marginRight"], item, uncomputedItemCSS)) {
            marginWidth = this._recalcTwoSidePropPtVals(
                item, parentItemWidth, computedProps, uncomputedItemCSS, "margin"
            );
        }

        outerWidth += marginWidth;
    }
    
    return outerWidth;
};