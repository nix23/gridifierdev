// @disablePercentageCSSRecalc -> HTML node can't have size with fractional value,
//                                so we should supress this calculation in IE8/Safari 5.1.7,etc...
SizesResolver.outerWidth = function(DOMElem, includeMargins, disablePercentageCSSRecalc, disableBordersCalc) {
    var includeMargins = includeMargins || false;
    var disablePercentageCSSRecalc = disablePercentageCSSRecalc || false;
    var disableBordersCalc = disableBordersCalc || false;
    var elementComputedCSS = this.getComputedCSS(DOMElem);
    
    if(disablePercentageCSSRecalc)
        var recalculatePercentageCSSValues = false;
    else if(this.isBrowserNativePercentageCSSValuesCalcStrategy())
        var recalculatePercentageCSSValues = false;
    else if(this.isRecalculatePercentageCSSValuesCalcStrategy()) {
        this._ensureHasParentNode(DOMElem);

        if(this.hasPercentageCSSValue("width", DOMElem))
            var recalculatePercentageCSSValues = true;
        else
            var recalculatePercentageCSSValues = false;
    }
    
    if(elementComputedCSS.display === "none")
        return 0;

    var computedProperties = this.getComputedProperties("forOuterWidth", elementComputedCSS, DOMElem);
    
    var paddingWidth = computedProperties.paddingLeft + computedProperties.paddingRight;
    var marginWidth = computedProperties.marginLeft + computedProperties.marginRight;
    var borderWidth = computedProperties.borderLeftWidth + computedProperties.borderRightWidth;
    
    // The HTMLElement.offsetWidth read-only property returns the layout width of an element. Typically, 
    // an element's offsetWidth is a measurement which includes the element borders, the element horizontal padding, 
    // the element vertical scrollbar (if present, if rendered) and the element CSS width.
    var outerWidth = 0;
    var normalizedComputedWidth = this.normalizeComputedCSSSizeValue(elementComputedCSS.width);
    
    if(normalizedComputedWidth !== false)
        outerWidth = normalizedComputedWidth;

    var recalculatedDOMElemComputedCSS = null;
    var parentDOMElemWidth = null; 
    
    if(recalculatePercentageCSSValues) {
        recalculatedDOMElemComputedCSS = this._getComputedCSSWithMaybePercentageSizes(DOMElem);

        if(DOMElem.parentNode.nodeName == "HTML")
            var disablePercentageCSSRecalcPerHTMLNode = true;
        else
            var disablePercentageCSSRecalcPerHTMLNode = false;

        parentDOMElemWidth = this.recalculatePercentageWidthFunction.call(
            this, DOMElem.parentNode, false, disablePercentageCSSRecalcPerHTMLNode, true
        );

        if(this.hasLastRecalculatedDOMElBorderBoxBS
            && this.hasPercentageCSSValue("width", DOMElem, recalculatedDOMElemComputedCSS)) {
            parentDOMElemWidth -= this.lastRecalculatedDOMElBorderWidth;
        }
    }

    if(recalculatePercentageCSSValues && 
            (this.hasPercentageCSSValue("paddingLeft", DOMElem, recalculatedDOMElemComputedCSS) || 
             this.hasPercentageCSSValue("paddingRight", DOMElem, recalculatedDOMElemComputedCSS))) {
        paddingWidth = this._recalculateTwoSidePropertyWithPercentageValues(
            DOMElem,
            parentDOMElemWidth,
            computedProperties, 
            recalculatedDOMElemComputedCSS, 
            "padding", 
            "horizontal"
        );
    }
    
    if(recalculatePercentageCSSValues && this.hasPercentageCSSValue("width", DOMElem, recalculatedDOMElemComputedCSS)) {
        outerWidth = this._recalculateWidthWithPercentageValue(
            DOMElem, parentDOMElemWidth, recalculatedDOMElemComputedCSS
        );
    }

    if(!this.isBoxSizingBorderBox(elementComputedCSS) 
        || (this.isBoxSizingBorderBox(elementComputedCSS) && !this.isOuterBorderBoxSizing())) {
        this.lastRecalculatedDOMElRawWidth = outerWidth;
        outerWidth += paddingWidth;
        if(!disableBordersCalc) outerWidth += borderWidth;
        this.hasLastRecalculatedDOMElBorderBoxBS = false;
    }
    else {
        this.hasLastRecalculatedDOMElBorderBoxBS = true;
        this.lastRecalculatedDOMElRawWidth = outerWidth;
        // If parent el has BorderBox BS, children percentage element width
        // should be calculated without borderWidth. 
        this.lastRecalculatedDOMElBorderWidth = borderWidth;
    }

    if(includeMargins) {
        if(recalculatePercentageCSSValues && 
               (this.hasPercentageCSSValue("marginLeft", DOMElem, recalculatedDOMElemComputedCSS) ||
                this.hasPercentageCSSValue("marginRight", DOMElem, recalculatedDOMElemComputedCSS))) {
            marginWidth = this._recalculateTwoSidePropertyWithPercentageValues(
                DOMElem, parentDOMElemWidth, computedProperties, recalculatedDOMElemComputedCSS, "margin", "horizontal"
            );
        }

        outerWidth += marginWidth;
    }
    
    return outerWidth;
};