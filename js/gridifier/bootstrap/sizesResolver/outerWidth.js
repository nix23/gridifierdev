// @disablePercentageCSSRecalc -> HTML node can't have size with fractional value,
//                                so we should supress this calculation in IE8/Safari 5.1.7,etc...
SizesResolver.outerWidth = function(DOMElem, includeMargins, disablePercentageCSSRecalc, disableBordersCalc) {
    // var deepness = deepness || 0;
    // var nodeName = DOMElem.getAttribute("class");
    // if(nodeName == null || nodeName.length == 0)
    //     var nodeName = DOMElem.getAttribute("id");
    // console.log(DOMElem.nodeName);
    //console.log("calculating per = " + nodeName);
    // msProfiler.start("(" + deepness + ") outerWidth per item "+ nodeName + " = ");
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
    //var outerWidth = DOMElem.offsetWidth; // @todo -> Check all cases, looks like outerWidth here s redundant
    var outerWidth = 0;
    //if(Dom.css.hasClass(DOMElem, "gridItem")) {
       // timer.start();
        //elementComputedCSS.getPropertyCSSValue("width");
        //elementComputedCSS.getPropertyValue("width");
        //var elementComputedCSS = elementComputedCSS.
        // var elementWidth = elementComputedCSS.width;
        // var time = timer.get();
        // var message = "time = " + time + " class = " + DOMElem.getAttribute("class") + "<br>";
        // if(time > 0.100) {
        //     console.log(message);
        // }
    //}

    var normalizedComputedWidth = this.normalizeComputedCSSSizeValue(elementComputedCSS.width);
    
    if(normalizedComputedWidth !== false)
        outerWidth = normalizedComputedWidth;

    var recalculatedDOMElemComputedCSS = null;
    var parentDOMElemWidth = null; 
    
    if(recalculatePercentageCSSValues) {
        recalculatedDOMElemComputedCSS = this._getComputedCSSWithMaybePercentageSizes(DOMElem);
         // msProfiler.stop();
         // console.log("Recursive call to calc width");
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
        // console.log("End of recursive call"); msProfiler.start("Ending after recursive call");
    }
    
    // console.log("outerWidth: ", outerWidth);
    // console.log("elementComputedCSS.width: ", elementComputedCSS.width);
    // console.log("parentDOMElemWidth: ", parentDOMElemWidth);

    if(recalculatePercentageCSSValues && 
            (this.hasPercentageCSSValue("paddingLeft", DOMElem, recalculatedDOMElemComputedCSS) || 
             this.hasPercentageCSSValue("paddingRight", DOMElem, recalculatedDOMElemComputedCSS))) {
        paddingWidth = this._recalculateTwoSidePropertyWithPercentageValues(
            DOMElem,
            parentDOMElemWidth,
            //this.lastRecalculatedDOMElRawWidth,
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
    //msProfiler.stop(); console.log("");
    
    return outerWidth;
};