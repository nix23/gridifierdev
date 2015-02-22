// @disablePercentageCSSRecalc -> HTML node can't have size with fractional value,
//                         so we should supress this calculation in IE8/Safari 5.1.7, etc...
SizesResolver.outerHeight = function(DOMElem, includeMargins, disablePercentageCSSRecalc, disableBordersCalc) {
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

        if(this.hasPercentageCSSValue("height", DOMElem))
            var recalculatePercentageCSSValues = true;
        else
            var recalculatePercentageCSSValues = false;
    }

    if(elementComputedCSS.display === "none")
        return 0;

    var computedProperties = this.getComputedProperties("forOuterHeight", elementComputedCSS, DOMElem);

    var paddingHeight = computedProperties.paddingTop + computedProperties.paddingBottom;
    var marginHeight = computedProperties.marginTop + computedProperties.marginBottom;
    var borderHeight = computedProperties.borderTopWidth + computedProperties.borderBottomWidth;

    //var outerHeight = DOMElem.offsetHeight;
    var outerHeight = 0;
    var normalizedComputedHeight = this.normalizeComputedCSSSizeValue(elementComputedCSS.height);

    if(normalizedComputedHeight !== false)
        outerHeight = normalizedComputedHeight;

    var recalculatedDOMElemComputedCSS = null;
    var parentDOMElemWidth = null;
    var parentDOMElemHeight = null;

    if(recalculatePercentageCSSValues) {
        recalculatedDOMElemComputedCSS = this._getComputedCSSWithMaybePercentageSizes(DOMElem);

        if(DOMElem.parentNode.nodeName == "HTML")
            var disablePercentageCSSRecalcPerHTMLNode = true;
        else
            var disablePercentageCSSRecalcPerHTMLNode = false;

        parentDOMElemWidth = this.recalculatePercentageWidthFunction.call(
            this, DOMElem.parentNode, false, disablePercentageCSSRecalcPerHTMLNode, true
        );

        if(this.hasLastRecalculatedDOMElBorderBoxBS) {
            parentDOMElemWidth -= this.lastRecalculatedDOMElBorderWidth;
        }

        parentDOMElemHeight = this.recalculatePercentageHeightFunction.call(
            this, DOMElem.parentNode, false, disablePercentageCSSRecalcPerHTMLNode, true
        );

        if(this.hasLastRecalculatedDOMElBorderBoxBS
            && this.hasPercentageCSSValue("height", DOMElem, recalculatedDOMElemComputedCSS)) {
            parentDOMElemHeight -= this.lastRecalculatedDOMElBorderHeight;
        }
    }

    if(recalculatePercentageCSSValues &&
        (this.hasPercentageCSSValue("paddingTop", DOMElem, recalculatedDOMElemComputedCSS) ||
         this.hasPercentageCSSValue("paddingBottom", DOMElem, recalculatedDOMElemComputedCSS))) {
        paddingHeight = this._recalculateTwoSidePropertyWithPercentageValues(
            DOMElem,
            parentDOMElemWidth,
            computedProperties,
            recalculatedDOMElemComputedCSS,
            "padding",
            "vertical"
        );
    }

    if(recalculatePercentageCSSValues && this.hasPercentageCSSValue("height", DOMElem, recalculatedDOMElemComputedCSS)) {
        outerHeight = this._recalculateHeightWithPercentageValue(
            DOMElem, parentDOMElemHeight, recalculatedDOMElemComputedCSS
        );
    }

    if(!this.isBoxSizingBorderBox(elementComputedCSS)
        || (this.isBoxSizingBorderBox(elementComputedCSS) && !this.isOuterBorderBoxSizing())) {
        this.lastRecalculatedDOMElRawHeight = outerHeight;
        outerHeight += paddingHeight;
        if(!disableBordersCalc) outerHeight += borderHeight;
        this.hasLastRecalculatedDOMElBorderBoxBS = false;
    }
    else {
        this.hasLastRecalculatedDOMElBorderBoxBS = true;
        this.lastRecalculatedDOMElRawHeight = outerHeight;
        // If parentEl has BorderBox BS, children percentage element height
        // should be calculated without borderHeight.
        this.lastRecalculatedDOMElBorderHeight = borderHeight;
    }

    if(includeMargins) {
        if(recalculatePercentageCSSValues &&
            (this.hasPercentageCSSValue("marginTop", DOMElem, recalculatedDOMElemComputedCSS) ||
             this.hasPercentageCSSValue("marginBottom", DOMElem, recalculatedDOMElemComputedCSS))) {
            marginHeight = this._recalculateTwoSidePropertyWithPercentageValues(
                DOMElem, parentDOMElemWidth, computedProperties, recalculatedDOMElemComputedCSS, "margin", "vertical"
            );
        }

        outerHeight += marginHeight;
    }

    return outerHeight;
};