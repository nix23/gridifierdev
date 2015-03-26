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

    clearRecursiveSubcallsData: function() {
        this.lastRecalculatedDOMElRawWidth = null;
        this.lastRecalculatedDOMElRawHeight = null;
        this.lastRecalculatedDOMElBorderWidth = null;
        this.lastRecalculatedDOMElBorderHeight = null;
        this.hasLastRecalculatedDOMElBorderBoxBS = false;
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
        var unrenderedComputedCSS = {};

        var props = ["paddingLeft", "paddingRight", "paddingTop", "paddingBottom",
                     "marginLeft", "marginRight", "marginTop", "marginBottom",
                     "width", "height"];
        for(var i = 0; i < props.length; i++) {
            unrenderedComputedCSS[props[i]] = unrenderedComputedCSSSource[props[i]];
        }
        
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

    _recalculateHeightWithPercentageValue: function(DOMElem,
                                                    parentDOMElemHeight,
                                                    computedPropertiesWithMaybePercentageSizes) {
        var percentageHeight = parseFloat(this.getPercentageCSSValue(
            "height", DOMElem, computedPropertiesWithMaybePercentageSizes
        ));
        return parentDOMElemHeight / 100 * percentageHeight;
    },

    positionLeft: function(DOMElem)
    {
        var elementComputedCSS = this.getComputedCSS(DOMElem);

        if(elementComputedCSS.display == "none")
            return 0;

        var computedProperties = this.getComputedProperties("forPositionLeft", elementComputedCSS, DOMElem);
        return DOMElem.offsetLeft - computedProperties.marginLeft;
    },

    positionTop: function(DOMElem)
    {
        var elementComputedCSS = this.getComputedCSS(DOMElem);

        if(elementComputedCSS.display == "none")
            return 0;

        var computedProperties = this.getComputedProperties("forPositionTop", elementComputedCSS, DOMElem);
        return DOMElem.offsetTop - computedProperties.marginTop;
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
    },

    cloneComputedStyle: function(sourceItem, targetItem) {
        var camelize = function(text) {
            return text.replace(/-+(.)?/g, function (match, chr) {
                return chr ? chr.toUpperCase() : '';
            });
        };

        var sourceItemComputedStyle = this.getComputedCSS(sourceItem);

        for(var prop in sourceItemComputedStyle) {
            if(prop == "cssText")
                continue;

            var propName = camelize(prop);
            if(targetItem.style[propName] != sourceItemComputedStyle[propName])
                targetItem.style[propName] = sourceItemComputedStyle[propName];
        }

        // Some properties could be overwritten by further rules.
        // For example in FF/IE borders are overwritten by some from further rules.
        var propsToReclone = ["borderLeftWidth", "borderRightWidth", "borderTopWidth", "borderBottomWidth",
            "borderLeftColor", "borderRightColor", "borderTopColor", "borderBottomColor",
            "borderLeftStyle", "borderRightStyle", "borderTopStyle", "borderBottomStyle",
            "font", "fontSize", "fontWeight"];
        for(var i = 0; i < propsToReclone.length; i++) {
            var propName = propsToReclone[i];
            if(typeof sourceItemComputedStyle[propName] != "undefined" &&
                targetItem.style[propName] != sourceItemComputedStyle[propName])
                targetItem.style[propName] = sourceItemComputedStyle[propName];
        }
    }
}