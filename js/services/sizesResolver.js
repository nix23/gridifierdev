var SizesResolver = {
    getComputedCSS: null,
    propertiesToGet: {
        forOuterWidth: [
            "paddingLeft", "paddingRight", "marginLeft", "marginRight",
            "borderLeftWidth", "borderRightWidth"
        ],
        forOuterHeight: [
            "paddingTop", "paddingBottom", "marginTop", "marginBottom",
            "borderTopWidth", "borderBottomWidth"
        ],
        forPositionLeft: [
            "marginLeft"
        ],
        forPositionTop: [
            "marginTop"
        ]
    },
    maybePrefixedProperties: {
        "boxSizing": null
    },
    borderBoxSizingStrategy: null,
    borderBoxSizingStrategies: {OUTER: 0, INNER: 1},
    percentageCSSValuesCalcStrategy: null,
    percentageCSSValuesCalcStrategies: {BROWSER_NATIVE: 0, RECALCULATE: 1},
    recalculatePercentageWidthFunction: function(DOMElem, 
                                                 includeMargins, 
                                                 disablePercentageCSSRecalc, 
                                                 disableBordersCalc) {
        return this.outerWidth(DOMElem, includeMargins, disablePercentageCSSRecalc, disableBordersCalc);
    },
    recalculatePercentageHeightFunction: function(DOMElem,
                                                  includeMargins,
                                                  disablePercentageCSSRecalc,
                                                  disableBordersCalc) {
        return this.outerHeight(DOMElem, includeMargins, disablePercentageCSSRecalc, disableBordersCalc);
    },
    lastRecalculatedDOMElRawWidth: null,
    lastRecalculatedDOMElRawHeight: null,
    lastRecalculatedDOMElBorderWidth: null,
    lastRecalculatedDOMElBorderHeight: null,
    hasLastRecalculatedDOMElBorderBoxBS: false,

    init: function()
    {
        this.getComputedCSS = this.getComputedCSSFunction();
        this.determineMaybePrefixedProperties();
        this.determineBorderBoxComputedSizesCalculationStrategy();
        this.determinePercentageCSSValuesCalcStrategy();
    },

    getComputedCSSFunction: function()
    {
        if(window.getComputedStyle)
        {
            return function(DOMElem) {
                return window.getComputedStyle(DOMElem, null);
            }
        }
        else
        {
            return function(DOMElem) {
                return DOMElem.currentStyle;
            }
        }
    },

    determineMaybePrefixedProperties: function()
    {
        this.maybePrefixedProperties.boxSizing = Prefixer.get("boxSizing");
    },

    // based on http://connect.microsoft.com/IE/feedback/details/695683/dimensions-returned-by-getcomputedstyle-are-wrong-if-element-has-box-sizing-border-box.
    // At least IE10 and FF7 returns computed width and height without padding and borders, so we should determine sizes calculation type here.
    // Looks like 'workaround', but bootstrap inspired me.(They use similar aproach as in Dom.isBrowserSupportingTransitions
    // to detect if browser is supporting transitions, they are using so-called testerEl).
    determineBorderBoxComputedSizesCalculationStrategy: function()
    {
        var testerDiv = document.createElement("div");

        testerDiv.style.width = "100px";
        testerDiv.style.padding = "10px 20px";
        testerDiv.style.borderWidth = "10px 20px";
        testerDiv.style.borderStyle = "solid";

        var boxSizingProperty = this.maybePrefixedProperties.boxSizing;
        testerDiv.style[boxSizingProperty] = "border-box";

        var rootElement = document.body || document.documentElement;
        rootElement.appendChild(testerDiv);

        var testerDivComputedCSS = this.getComputedCSS(testerDiv);
        if(this.normalizeComputedCSSSizeValue(testerDivComputedCSS.width) === 100) 
            this.borderBoxSizingStrategy = this.borderBoxSizingStrategies.OUTER;
        else
            this.borderBoxSizingStrategy = this.borderBoxSizingStrategies.INNER;

        rootElement.removeChild(testerDiv);
    },

    determinePercentageCSSValuesCalcStrategy: function() {
        var testerDivWrapper = document.createElement("div");
        testerDivWrapper.style.width = "1178px";
        testerDivWrapper.style.height = "300px";
        testerDivWrapper.style.position = "absolute";
        testerDivWrapper.style.left = "-9000px";
        testerDivWrapper.style.top = "0px";
        testerDivWrapper.style.visibility = "hidden";

        var rootElement = document.body || document.documentElement;
        rootElement.appendChild(testerDivWrapper);

        var testerDiv = document.createElement("div");
        testerDiv.style.width = "10%";
        testerDiv.style.height = "200px";
        testerDivWrapper.appendChild(testerDiv);

        var expectedCorrectOuterWidth = 117.796875;
        var calculatedOuterWidth = parseFloat(this.outerWidth(testerDiv, true));
        if(expectedCorrectOuterWidth.toFixed(1) == calculatedOuterWidth.toFixed(1))
            this.percentageCSSValuesCalcStrategy = this.percentageCSSValuesCalcStrategies.BROWSER_NATIVE;
        else
            this.percentageCSSValuesCalcStrategy = this.percentageCSSValuesCalcStrategies.RECALCULATE;

        rootElement.removeChild(testerDivWrapper);
    },

    isBrowserNativePercentageCSSValuesCalcStrategy: function() {
        return this.percentageCSSValuesCalcStrategy == this.percentageCSSValuesCalcStrategies.BROWSER_NATIVE;
    },

    isRecalculatePercentageCSSValuesCalcStrategy: function() {
        return this.percentageCSSValuesCalcStrategy == this.percentageCSSValuesCalcStrategies.RECALCULATE;
    },

    _isPercentageCSSValue: function(cssValue) {
        var percentageCssValueRegex = new RegExp("(.*\\d)%$");
        if(percentageCssValueRegex.test(cssValue))
            return true;

        return false;
    },

    getComputedCSSWithMaybePercentageSizes: function(DOMElem) {
        return this._getComputedCSSWithMaybePercentageSizes(DOMElem);
    },

    _getComputedCSSWithMaybePercentageSizes: function(DOMElem) {
        var parentDOMElemClone = DOMElem.parentNode.cloneNode();
        var DOMElemClone = DOMElem.cloneNode();

        parentDOMElemClone.appendChild(DOMElemClone);
        parentDOMElemClone.style.display = "none";
        
        if(DOMElem.parentNode.nodeName == "HTML")
            var parentDOMElemParentNode = DOMElem.parentNode;
        else
            var parentDOMElemParentNode = DOMElem.parentNode.parentNode;

        parentDOMElemParentNode.appendChild(parentDOMElemClone);
        
        var unrenderedComputedCSSSource = this.getComputedCSS(DOMElemClone);

        // @todo -> Determine, if this is still required. Looks like percentage values
        //          are returned correctly now.(Probably bug was in Safari 5.1.7)
        // var additionalComputedCSS = {};

        // if(typeof unrenderedComputedCSSSource.getPropertyCSSValue != "undefined") {
        //     msProfiler.stop();
        //     msProfiler.start("rest2");
        //     additionalComputedCSS.paddingLeft = unrenderedComputedCSSSource.getPropertyCSSValue("padding-left").cssText;
        //     additionalComputedCSS.paddingRight = unrenderedComputedCSSSource.getPropertyCSSValue("padding-right").cssText;
        //     additionalComputedCSS.marginLeft = unrenderedComputedCSSSource.getPropertyCSSValue("margin-left").cssText;
        //     additionalComputedCSS.marginRight = unrenderedComputedCSSSource.getPropertyCSSValue("margin-right").cssText;
        //     additionalComputedCSS.paddingTop = unrenderedComputedCSSSource.getPropertyCSSValue("padding-top").cssText;
        //     additionalComputedCSS.paddingBottom = unrenderedComputedCSSSource.getPropertyCSSValue("padding-bottom").cssText;
        //     additionalComputedCSS.marginTop = unrenderedComputedCSSSource.getPropertyCSSValue("margin-top").cssText;
        //     additionalComputedCSS.marginBottom = unrenderedComputedCSSSource.getPropertyCSSValue("margin-bottom").cssText;
        //     additionalComputedCSS.width = unrenderedComputedCSSSource.getPropertyCSSValue("width").cssText;
        //     additionalComputedCSS.height = unrenderedComputedCSSSource.getPropertyCSSValue("height").cssText;
        // }

        var unrenderedComputedCSS = {};

        var props = ["paddingLeft", "paddingRight", "paddingTop", "paddingBottom",
                     "marginLeft", "marginRight", "marginTop", "marginBottom",
                     "width", "height"];
        for(var i = 0; i < props.length; i++) {
            unrenderedComputedCSS[props[i]] = unrenderedComputedCSSSource[props[i]];
        }

        // for(var key in additionalComputedCSS)
        //     unrenderedComputedCSS[key] = additionalComputedCSS[key];
        
        parentDOMElemParentNode.removeChild(parentDOMElemClone);
        
        return unrenderedComputedCSS;
    },

    _ensureHasParentNode: function(DOMElem) {
        if(DOMElem.parentNode == null
            || !Dom.hasDOMElemOwnProperty(DOMElem.parentNode, "innerHTML")) {
            var msg = "";

            msg += "SizesResolver error: ";
            msg += "Can't resolve element parentNode per element: ";
            msg += DOMElem;
            throw new Error(msg);
        }
    },

    _ensureComputedCSSHasProperty: function(elementComputedCSS, cssProperty) {
        //if(!Object.prototype.hasOwnProperty.call(elementComputedCSS, cssProperty)) {
        if(!(cssProperty in elementComputedCSS)) {
            var msg = "";

            msg += "SizesResolver error: ";
            msg += "Can't find property '" + cssProperty + "' in elementComputedCSS. ";
            msg += "Element computed CSS: ";
            msg += elementComputedCSS;
            throw new Error(msg);
        }
    },

    hasPercentageCSSValue: function(cssProperty, DOMElem, elementComputedCSS) {
        this._ensureHasParentNode(DOMElem);

        var elementComputedCSS = elementComputedCSS || this._getComputedCSSWithMaybePercentageSizes(DOMElem);
        this._ensureComputedCSSHasProperty(elementComputedCSS, cssProperty);

        return this._isPercentageCSSValue(elementComputedCSS[cssProperty]);
    },

    getPercentageCSSValue: function(cssProperty, DOMElem, elementComputedCSS) {
        this._ensureHasParentNode(DOMElem);

        var elementComputedCSS = elementComputedCSS || this._getComputedCSSWithMaybePercentageSizes(DOMElem);
        this._ensureComputedCSSHasProperty(elementComputedCSS, cssProperty);

        return elementComputedCSS[cssProperty];
    },

    _recalculateTwoSidePropertyWithPercentageValues: function(DOMElem,
                                                              parentDOMElemWidth,
                                                              computedProperties,
                                                              computedPropertiesWithMaybePercentageSizes,
                                                              cssPropertyPrefix,
                                                              direction) {
        if(direction == "horizontal") {
            var cssPropertyFirstSide = "Left";
            var cssPropertySecondSide = "Right";
        }
        else if(direction == "vertical") {
            var cssPropertyFirstSide = "Top";
            var cssPropertySecondSide = "Bottom";
        }
        else {
            throw new Error("SizesResolver error: wrong direction in twoSideProperty recalculation.");
        }

        if(cssPropertyPrefix != "margin" && cssPropertyPrefix != "padding") {
            throw new Error("SizesResolver error: unknown CSSProperty in twoSideProperty recalculation.");
        }

        var firstSideCSSProperty = cssPropertyPrefix + cssPropertyFirstSide;
        var secondSideCSSProperty = cssPropertyPrefix + cssPropertySecondSide;

        var firstSideCSSValue = computedProperties[firstSideCSSProperty];
        var secondSideCSSValue = computedProperties[secondSideCSSProperty];

        if(this.hasPercentageCSSValue(firstSideCSSProperty, DOMElem, computedPropertiesWithMaybePercentageSizes)) {
            var firstSidePercentageValue = parseFloat(this.getPercentageCSSValue(
                firstSideCSSProperty, DOMElem, computedPropertiesWithMaybePercentageSizes
            ));
            firstSideCSSValue = parentDOMElemWidth / 100 * firstSidePercentageValue;
        }

        if(this.hasPercentageCSSValue(secondSideCSSProperty, DOMElem, computedPropertiesWithMaybePercentageSizes)) {
            var secondSidePercentageValue = parseFloat(this.getPercentageCSSValue(
                secondSideCSSProperty, DOMElem, computedPropertiesWithMaybePercentageSizes
            ));
            secondSideCSSValue = parentDOMElemWidth / 100 * secondSidePercentageValue;
        }

        return firstSideCSSValue + secondSideCSSValue;
    },

    _recalculateWidthWithPercentageValue: function(DOMElem,
                                                   parentDOMElemWidth,
                                                   computedPropertiesWithMaybePercentageSizes) {
        var percentageWidth = parseFloat(this.getPercentageCSSValue(
            "width", DOMElem, computedPropertiesWithMaybePercentageSizes
        ));
        return parentDOMElemWidth / 100 * percentageWidth;
    },

    // @disablePercentageCSSRecalc -> HTML node can't have size with fractional value,
    //                                so we should supress this calculation in IE8/Safari 5.1.7,etc...
    outerWidth: function(DOMElem, includeMargins, disablePercentageCSSRecalc, disableBordersCalc)
    {
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
    },

    _recalculateHeightWithPercentageValue: function(DOMElem,
                                                    parentDOMElemHeight,
                                                    computedPropertiesWithMaybePercentageSizes) {
        var percentageHeight = parseFloat(this.getPercentageCSSValue(
            "height", DOMElem, computedPropertiesWithMaybePercentageSizes
        ));
        return parentDOMElemHeight / 100 * percentageHeight;
    },

    // @disablePercentageCSSRecalc -> HTML node can't have size with fractional value,
    //                         so we should supress this calculation in IE8/Safari 5.1.7, etc...
    outerHeight: function(DOMElem, includeMargins, disablePercentageCSSRecalc, disableBordersCalc)
    {
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
    },

    positionLeft: function(DOMElem)
    {
        var elementComputedCSS = this.getComputedCSS(DOMElem);

        if(elementComputedCSS.display == "none")
            return 0;

        var computedProperties = this.getComputedProperties("forPositionLeft", elementComputedCSS, DOMElem);
        // @todo -> delete Math.round ???(%)
        return DOMElem.offsetLeft - Math.round(computedProperties.marginLeft);
    },

    positionTop: function(DOMElem)
    {
        var elementComputedCSS = this.getComputedCSS(DOMElem);

        if(elementComputedCSS.display == "none")
            return 0;

        var computedProperties = this.getComputedProperties("forPositionTop", elementComputedCSS, DOMElem);
        // @todo -> delete Math.round ????(%)
        return DOMElem.offsetTop - Math.round(computedProperties.marginTop);
    },

    offsetLeft: function(DOMElem)
    {
        var clientRect = DOMElem.getBoundingClientRect();
        var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        return clientRect.left + scrollLeft;
    },

    offsetTop: function(DOMElem)
    {
        var clientRect = DOMElem.getBoundingClientRect();
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        return clientRect.top + scrollTop;
    },

    getComputedProperty: function(DOMElem, propertyName)
    {
        var elementComputedCSS = this.getComputedCSS(DOMElem);
        return elementComputedCSS[propertyName];
    },

    isBoxSizingBorderBox: function(elementComputedCSS)
    {
        var boxSizingProperty = this.maybePrefixedProperties.boxSizing;
        if(boxSizingProperty && elementComputedCSS[boxSizingProperty]
            && elementComputedCSS[boxSizingProperty] === "border-box")
            return true;

        return false;
    },

    isOuterBorderBoxSizing: function()
    {
        return (this.borderBoxSizingStrategy === this.borderBoxSizingStrategies.OUTER) ? true : false;
    },

    // Based on http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291
    // and http://javascript.info/tutorial/styles-and-classes-getcomputedstyle.
    // IE currentStyle returns cascaded style instead of computed style,
    // so if we have unit other than px, we should recalculate it in px.
    isCascadedCSSValue: function(CSSValue)
    {
        return (window.getComputedStyle || CSSValue.indexOf("px") !== -1) ? false : true;
    },

    transformFromCascadedToComputedStyle: function(DOMElem, CSSValue, elementComputedCSS)
    {
        // Check value auto, medium, etc...
        var atLeastOneDigitRegex = new RegExp("(?=.*\\d)");
        if(!atLeastOneDigitRegex.test(CSSValue))
            return CSSValue;

        var inlineStyle = DOMElem.style;
        var runtimeStyle = DOMElem.runtimeStyle;

        var inlineStyleLeft = inlineStyle.left;
        var runtimeStyleLeft = runtimeStyle && runtimeStyle.left;

        if(runtimeStyleLeft)
            runtimeStyle.left = elementComputedCSS.left;

        inlineStyle.left = CSSValue;
        CSSValue = inlineStyle.pixelLeft;

        inlineStyle.left = inlineStyleLeft;
        if(runtimeStyleLeft)
            runtimeStyle.left = runtimeStyleLeft;

        return CSSValue;
    },

    normalizeComputedCSSSizeValue: function(postfixedSizeValue)
    {
        var sizeValue = parseFloat(postfixedSizeValue);
        var canBeParsedAsNumber = postfixedSizeValue.indexOf("%") === -1 && !isNaN(sizeValue);
        
        return (canBeParsedAsNumber) ? sizeValue : false;
    },

    getComputedProperties: function(propertiesToGetType, elementComputedCSS, DOMElem)
    {
        var computedProperties = {};

        for(var i = 0; i < this.propertiesToGet[propertiesToGetType].length; i++)
        {
            var propertyName = this.propertiesToGet[propertiesToGetType][i];
            var propertyValue = elementComputedCSS[propertyName];

            if(this.isCascadedCSSValue(propertyValue))
                propertyValue = this.transformFromCascadedToComputedStyle(DOMElem, propertyValue, elementComputedCSS);
            propertyValue = parseFloat(propertyValue);
            propertyValue = isNaN(propertyValue) ? 0 : propertyValue;

            computedProperties[propertyName] = propertyValue;
        }

        return computedProperties;
    }
}
SizesResolver.init();