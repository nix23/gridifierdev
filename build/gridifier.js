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

SizesResolver.getComputedCSSFunction = function() {
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
};

SizesResolver.determineMaybePrefixedProperties = function() {
    this.maybePrefixedProperties.boxSizing = Prefixer.get("boxSizing");
};

// based on http://connect.microsoft.com/IE/feedback/details/695683/dimensions-returned-by-getcomputedstyle-are-wrong-if-element-has-box-sizing-border-box.
// At least IE10 and FF7 returns computed width and height without padding and borders, so we should determine sizes calculation type here.
// Looks like 'workaround', but bootstrap inspired me.(They use similar aproach as in Dom.isBrowserSupportingTransitions
// to detect if browser is supporting transitions, they are using so-called testerEl).
SizesResolver.determineBorderBoxComputedSizesCalculationStrategy = function() {
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
};

SizesResolver.determinePercentageCSSValuesCalcStrategy = function() {
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
};

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

var Event = (function() {
    var guid = 0;
    
    function fixEvent(event) {
        event = event || window.event;
        
        if(event.isFixed) {
            return event;
        }
        event.isFixed = true;
        
        event.preventDefault = event.preventDefault || function() { this.returnValue = false; }
        event.stopPropagation = event.stopPropagation || function() { this.cancelBubble = true; }
        
        if(!event.target) {
            event.target = event.srcElement;
        }
        
        if(!event.relatedTarget && event.fromElement) {
            event.relatedTarget = event.fromElement == event.target ? event.toElement : event.fromElement;
        }
        
        if(event.pageX == null && event.clientX != null) {
            var html = document.documentElement, body = document.body;
            event.pageX = event.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0);
            event.pageY = event.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0);
        }
        
        if(!event.which && event.button) {
            event.which = (event.button & 1 ? 1 : (event.button & 2 ? 3 : (event.button & 4 ? 2 : 0)));
        }
        
        return event;
    }
    
    function commonHandle(event) {
        event = fixEvent(event);
        var handlers = this.events[event.type];
        
        for(var g in handlers) {
            var ret = handlers[g].call(this, event);
            if(ret === false) {
                event.preventDefault();
                event.stopPropagation();
            }
            else if(ret !== undefined) {
                event.result = ret;
            }
            
            if(event.stopNow) break;
        }
    }
    
    return {
        add: function(elem, type, handler) {
            if(elem.setInterval && (elem != window && !elem.frameElement)) {
                elem = window;
            }
            
            if(!handler.guid) {
                handler.guid = ++guid;
            }
            
            if(!elem.events) {
                elem.events = {};
                
                elem.handle = function(event) {
                    if(typeof Event !== "undefined") {
                        return commonHandle.call(elem, event);
                    }
                }
            }
            
            if(!elem.events[type]) {
                elem.events[type] = {};
                
                if(elem.addEventListener)
                    elem.addEventListener(type, elem.handle, false);
                else if(elem.attachEvent)
                    elem.attachEvent("on" + type, elem.handle);
            }
            
            elem.events[type][handler.guid] = handler;
        },
        
        remove: function(elem, type, handler) {
            var handlers = elem.events && elem.events[type];
            if(!handlers) return;
            
            if(!handler) {
                for(var handle in handlers) {
                    delete elem.events[type][handle];
                }
                return;
            }
            else {
                delete handlers[handler.guid];
                for(var any in handlers) return;
            }
                
            if(elem.removeEventListener)
                elem.removeEventListener(type, elem.handle, false);
            else if(elem.detachEvent)
                elem.detachEvent("on" + type, elem.handle);
            
            delete elem.events[type];
            
            for(var any in elem.events) return;
            try {
                delete elem.handle;
                delete elem.events;
            } catch(e) {
                elem.removeAttribute("handle");
                elem.removeAttribute("events");
            }
        }
    }
}());

var Prefixer = {
    prefixes: ['Moz', 'Webkit', 'ms', 'Ms', 'Khtml', 'O'],

    init: function() {
        ;
    },

    get: function(propertyName, element) {
        element = element || document.documentElement;
        var style = element.style;

        if(typeof style[propertyName] === "string") {
            return propertyName;
        }

        var propertyName = propertyName.charAt(0).toUpperCase() + propertyName.slice(1);
        for(var i = 0; i < this.prefixes.length; i++) {
            var prefixedPropertyName = this.prefixes[i] + propertyName;
            if(typeof style[prefixedPropertyName] === "string")
                return prefixedPropertyName;
        }
    },

    getForCSS: function(propertyName, element) {
        element = element || document.documentElement;
        var style = element.style;

        if(typeof style[propertyName] === "string") {
            return propertyName;
        }
        
        var originalPropertyName = propertyName;
        var propertyName = propertyName.charAt(0).toUpperCase() + propertyName.slice(1);
        for(var i = 0; i < this.prefixes.length; i++) {
            var prefixedPropertyName = this.prefixes[i] + propertyName; 
            if(typeof style[prefixedPropertyName] === "string")
                return "-" + this.prefixes[i].toLowerCase() + "-" + originalPropertyName;
        }
    }
}

// DOM abstraction layer
var Dom = {
    hasDOMElemOwnPropertyFunction: null,
    _isBrowserSupportingTransitions: null,

    init: function() {
        this.createTrimFunction();
        this.createHasDOMElemOwnPropertyFunction();
        this._determineIfBrowserIsSupportingTransitions();
    },

    createTrimFunction: function() {
        if(typeof String.prototype.gridifierTrim !== 'function') {
            String.prototype.gridifierTrim = function() {
                return this.replace(/^\s+|\s+$/g, '');
            }
        }
    },

    // ie11, ff30(Probably some others too) doesn't support
    // Object.prototype.hasOwnProperty.call per DOM Objects
    createHasDOMElemOwnPropertyFunction: function() {
        var testerDiv = document.createElement("div");
        var rootElement = document.body || document.documentElement;
        rootElement.appendChild(testerDiv);

        if(Object.prototype.hasOwnProperty.call(testerDiv, "innerHTML")) {
            this.hasDOMElemOwnPropertyFunction = function(DOMElem, propertyToMatch) {
                return Object.prototype.hasOwnProperty.call(DOMElem, propertyToMatch);
            }
        }
        else {
            this.hasDOMElemOwnPropertyFunction = function(DOMElem, propertyToMatch) {
                for(var property in DOMElem) {
                    if(property == propertyToMatch)
                        return true;
                }
                
                return false;
            }
        }

        rootElement.removeChild(testerDiv);
    },

    _determineIfBrowserIsSupportingTransitions: function() {
        var testerEl = document.createElement("div");

        var transitionEndEventNames = {
            WebkitTransition : 'webkitTransitionEnd',
            MozTransition      : 'transitionend',
            OTransition         : 'oTransitionEnd otransitionend',
            transition            : 'transitionend'
        };

        this._isBrowserSupportingTransitions = false;
        for(var eventName in transitionEndEventNames) {
            if(testerEl.style[eventName] !== undefined)
                this._isBrowserSupportingTransitions = true;
        }
    },

    toInt: function(maybeNotInt) {
        return parseInt(maybeNotInt, 10);
    },

    isJqueryObject: function(maybeJqueryObject) {
        if(typeof jQuery == "undefined")
            return false;

        return maybeJqueryObject && maybeJqueryObject instanceof jQuery;
    },

    isNativeDOMObject: function(maybeDOMObject) {
        if(typeof maybeDOMObject != "undefined" 
            && typeof maybeDOMObject.tagName != "undefined"
            && typeof maybeDOMObject.nodeName != "undefined"
            && typeof maybeDOMObject.ownerDocument != "undefined"
            && typeof maybeDOMObject.removeAttribute != "undefined")
            return true;
        else
            return false;
    },

    isArray: function(maybeArray) {
        return Object.prototype.toString.call(maybeArray) == "[object Array]";
    },

    isChildOf: function(maybeChildElem, containerElem) {
        var currentParent = maybeChildElem.parentNode;
        while(currentParent != undefined) {
            if(currentParent == containerElem)
                return true;

            if(currentParent == document.body)
                break;

            currentParent = currentParent.parentNode;
        }

        return false;
    },

    hasAttribute: function(DOMElem, attr) {
        if((DOMElem.getAttribute(attr) === null) || (DOMElem.getAttribute(attr) === ''))
            return false;

        return true;
    },

    isBrowserSupportingTransitions: function() {
        return this._isBrowserSupportingTransitions;
    },

    hasDOMElemOwnProperty: function(DOMElem, propertyToMatch) {
        return this.hasDOMElemOwnPropertyFunction(DOMElem, propertyToMatch);
    },

    css: {
        set: function(DOMElem, params) {
            if(!Dom.isNativeDOMObject(DOMElem))
                throw new Error("Dom abstraction layer error: DOMElem must be a scalar value.");

            for(var propName in params)
                DOMElem.style[propName] = params[propName];
        },

        hasClass: function(DOMElem, classToFind) {
            var classesString = DOMElem.getAttribute("class");
            if(classesString == null || classesString.length == 0)
                return false;

            var classes = classesString.split(" ");

            for(var i = 0; i < classes.length; i++)
            {
                classes[i] = classes[i].gridifierTrim();
                if(classes[i] == classToFind)
                    return true;
            }

            return false;
        },

        addClass: function(DOMElem, classToAdd) {
            var currentClass = DOMElem.getAttribute("class");
            if(currentClass == null || currentClass.length == 0)
                var newClass = classToAdd;
            else
                var newClass = currentClass + " " + classToAdd;

            DOMElem.setAttribute("class", newClass);
        },

        removeClass: function(DOMElem, classToRemove) {
            var classes = DOMElem.getAttribute("class").split(" ");
            var cleanedClass = "";

            for(var i = 0; i < classes.length; i++) {
                if(classes[i].gridifierTrim() != classToRemove)
                    cleanedClass += classes[i] + " ";
            }
            cleanedClass = cleanedClass.substring(0, cleanedClass.length - 1);

            DOMElem.setAttribute("class", cleanedClass);
        }
    },

    css3: {
        prefixedTransitionProps: ["WebkitTransition", "MozTransition", "MsTransition",
                                                 "OTransition", "transition"],
        prefixedTransformProps: ["WebkitTransform", "MozTransform", "OTransform",
                                               "MsTransform", "transform"],
        prefixedPerspectiveProps: ["WebkitPerspective", "perspective", "MozPerspective"],
        prefixedTransformStyleProps: ["transformStyle", "WebkitTransformStyle", "MozTransformStyle"],
        prefixedBackfaceVisibilityProps: ["WebkitBackfaceVisibility", "MozBackfaceVisibility", "backfaceVisibility"],
        prefixedTransformOriginProps: ["webkitTransformOrigin", "mozTransformOrigin", "oTransformOrigin",
                                       "msTransformOrigin", "transformOrigin"],

        transition: function(DOMElem, propertyValue) {
            DOMElem.style[Prefixer.get("transition", DOMElem)] = propertyValue;
        },

        transitionProperty: function(DOMElem, property) {
            var currentTransition = DOMElem.style[Prefixer.get("transition", DOMElem)];
            if(currentTransition.length == 0) {
                DOMElem.style[Prefixer.get("transition", DOMElem)] = property;
                return;
            }

            var encodeCubicBezier = function(transition) {
                return transition.replace(
                    /cubic-bezier\([^\)]+/g,
                    function(match) { return match.replace(/,/g, ";"); }
                );
            };

            var decodeCubicBezier = function(transition) {
                return transition.replace(
                    /cubic-bezier\([^\)]+/g,
                    function(match) { return match.replace(/;/g, ","); }
                );
            }

            var newTransition = encodeCubicBezier(property);
            currentTransition = encodeCubicBezier(currentTransition);
            var currentTransitionProps = currentTransition.split(",");

            for(var i = 0; i < currentTransitionProps.length; i++) {
                var currentTransitionProp = currentTransitionProps[i].gridifierTrim();
                if(currentTransitionProp.length == 0)
                    continue;
                
                var currentTransitionPropParts = currentTransitionProp.split(" ");
                var currentTransitionPropName = currentTransitionPropParts[0];
                
                if(newTransition.search(currentTransitionPropName) === -1) {
                    newTransition += ", " + currentTransitionProp;
                }
            }

            DOMElem.style[Prefixer.get("transition", DOMElem)] = decodeCubicBezier(newTransition).gridifierTrim();
        },

        transform: function(DOMElem, propertyValue) {
            DOMElem.style[Prefixer.get("transform", DOMElem)] = propertyValue;
        },

        transformProperty: function(DOMElem, property, propertyValue) {
            var currentTransform = DOMElem.style[Prefixer.get('transform', DOMElem)];
            if(currentTransform.length == 0) {
                DOMElem.style[Prefixer.get('transform', DOMElem)] = property + "(" + propertyValue + ")";
                return;
            }

            var newTransform = "";
            var currentTransformProps = currentTransform.split(/\)/);
            var hasCurrentTransformProperty = false;
            for(var i = 0; i < currentTransformProps.length; i++) {
                var currentTransformProp = currentTransformProps[i].gridifierTrim();
                if(currentTransformProp.gridifierTrim().length == 0)
                    continue;
                
                if(currentTransformProp.search(property) !== -1) {
                    newTransform += " " + property + "(" + propertyValue + ")";
                    hasCurrentTransformProperty = true;
                }
                else {
                    newTransform += " " + currentTransformProp + ")";
                }
            }

            if(!hasCurrentTransformProperty)
                newTransform += " " + property + "(" + propertyValue + ")";

            DOMElem.style[Prefixer.get('transform', DOMElem)] = newTransform.gridifierTrim();
        },

        opacity: function(DOMElem, opacityValue) {
            var prefixedOpacityProps = ["-webkit-opacity", "-moz-opacity", "opacity"];
            for(var i = 0; i < prefixedOpacityProps.length; i++)
                DOMElem.style[prefixedOpacityProps[i]] = opacityValue;
        },

        perspective: function(DOMElem, propertyValue) {
            for(var i = 0; i < this.prefixedPerspectiveProps.length; i++)
                DOMElem.style[this.prefixedPerspectiveProps[i]] = propertyValue;
        },

        transformStyle: function(DOMElem, propertyValue) {
            for(var i = 0; i < this.prefixedTransformStyleProps.length; i++) 
                DOMElem.style[this.prefixedTransformStyleProps[i]] = propertyValue;
        },

        backfaceVisibility: function(DOMElem, propertyValue) {
            for(var i = 0; i < this.prefixedBackfaceVisibilityProps.length; i++)
                DOMElem.style[this.prefixedBackfaceVisibilityProps[i]] = propertyValue;
        },

        transformOrigin: function(DOMElem, propertyValue) {
            for(var i = 0; i < this.prefixedTransformOriginProps.length; i++) {
                if(typeof DOMElem.style[this.prefixedTransformOriginProps[i]] != "undefined")
                    DOMElem.style[this.prefixedTransformOriginProps[i]] = propertyValue;
            }
        }
    },

    get: {
        byId: function(id) {
            return document.getElementById(id);
        },

        byClass: function(rootEl, className) {
            return rootEl.querySelectorAll("." + className);
        },

        byQuery: function(rootEl, selector) {
            return rootEl.querySelectorAll(selector);
        }
    },

    remove: {
        byQuery: function(rootEl, selector) {
            var domElems = Dom.get.byQuery(rootEl, selector);
            for(var i = 0; i < domElems.length; i++)
            {
                var domElem = domElems[i];
                domElem.parentNode.removeChild(domElem);
            }
        }
    }
}

Dom.init();
SizesResolver.init();

Gridifier = function(grid, settings) {
    var me = this;

    this._grid = null;
    this._gridSizesUpdater = null;
    this._settings = null;
    this._collector = null;
    this._guid = null;
    this._eventEmitter = null;
    this._operation = null;
    this._resorter = null;
    this._filtrator = null;
    this._disconnector = null;
    this._sizesResolverManager = null;
    this._lifecycleCallbacks = null;
    this._itemClonesManager = null;
    this._responsiveClassesManager = null;

    this._connectors = null;
    this._connections = null;
    this._connectionsSorter = null;
    this._iterator = null;
    this._renderer = null;
    this._silentRenderer = null;
    this._sizesTransformer = null;
    this._normalizer = null;

    this._prepender = null;
    this._reversedPrepender = null;

    this._appender = null;
    this._reversedAppender = null;

    this._operationsQueue = null;
    this._toggleOperation = null;
    this._transformOperation = null;

    this._dragifier = null;

    this._resizeEventHandler = null;

    this._css = {};

    this._construct = function() {
        if(typeof settings == "undefined")
            settings = {};

        me._sizesResolverManager = new Gridifier.SizesResolverManager();
        me._grid = new Gridifier.Grid(grid, me._sizesResolverManager);
        me._eventEmitter = new Gridifier.EventEmitter(me);
        me._guid = new Gridifier.GUID();
        me._settings = new Gridifier.Settings(settings, me, me._guid, me._eventEmitter, me._sizesResolverManager);
        me._collector = new Gridifier.Collector(me._settings, me.getGrid(), me._sizesResolverManager);

        me._settings.setCollectorInstance(me._collector);

        me._normalizer = new Gridifier.Normalizer(me, me._sizesResolverManager);
        me._operation = new Gridifier.Operation();
        me._lifecycleCallbacks = new Gridifier.LifecycleCallbacks(me._collector);

        me._grid.setCollectorInstance(me._collector);

        if(me._settings.isVerticalGrid()) {
            me._connections = new Gridifier.VerticalGrid.Connections(
                me, me._guid, me._settings, me._sizesResolverManager, me._eventEmitter
            );
            me._connectionsSorter = new Gridifier.VerticalGrid.ConnectionsSorter(
                me._connections, me._settings, me._guid
            );
        }
        else if(me._settings.isHorizontalGrid()) {
            me._connections = new Gridifier.HorizontalGrid.Connections(
                me, me._guid, me._settings, me._sizesResolverManager, me._eventEmitter
            );
            me._connectionsSorter = new Gridifier.HorizontalGrid.ConnectionsSorter(
                me._connections, me._settings, me._guid
            );
        }

        me._itemClonesManager = new Gridifier.ItemClonesManager(me._grid, me._collector, me._connections, me._sizesResolverManager);
        me._responsiveClassesManager = new Gridifier.ResponsiveClassesManager(me, me._collector, me._itemClonesManager);

        me._iterator = new Gridifier.Iterator(
            me._settings, me._collector, me._connections, me._connectionsSorter, me._guid
        );

        me._gridSizesUpdater = new Gridifier.GridSizesUpdater(
            me._grid, me._connections, me._settings, me._eventEmitter
        );

        me._connectors = new Gridifier.Connectors(me._guid, me._connections);
        me._renderer = new Gridifier.Renderer(me, me._connections, me._settings, me._normalizer);

        if(me._settings.isVerticalGrid()) {
            me._prepender = new Gridifier.VerticalGrid.Prepender(
                me, me._settings, me._sizesResolverManager, me._connectors, me._connections, me._guid, me._renderer, me._normalizer, me._operation
            );
            me._reversedPrepender = new Gridifier.VerticalGrid.ReversedPrepender(
                me, me._settings, me._sizesResolverManager, me._connectors, me._connections, me._guid, me._renderer, me._normalizer, me._operation
            );
            me._appender = new Gridifier.VerticalGrid.Appender(
                me, me._settings, me._sizesResolverManager, me._connectors, me._connections, me._guid, me._renderer, me._normalizer, me._operation
            );
            me._reversedAppender = new Gridifier.VerticalGrid.ReversedAppender(
                me, me._settings, me._sizesResolverManager, me._connectors, me._connections, me._guid, me._renderer, me._normalizer, me._operation
            );
        }
        else if(me._settings.isHorizontalGrid()) {
            me._prepender = new Gridifier.HorizontalGrid.Prepender(
                me, me._settings, me._sizesResolverManager, me._connectors, me._connections, me._guid, me._renderer, me._normalizer, me._operation
            );
            me._reversedPrepender = new Gridifier.HorizontalGrid.ReversedPrepender(
                me, me._settings, me._sizesResolverManager, me._connectors, me._connections, me._guid, me._renderer, me._normalizer, me._operation
            );
            me._appender = new Gridifier.HorizontalGrid.Appender(
                me, me._settings, me._sizesResolverManager, me._connectors, me._connections, me._guid, me._renderer, me._normalizer, me._operation
            );
            me._reversedAppender = new Gridifier.HorizontalGrid.ReversedAppender(
                me, me._settings, me._sizesResolverManager, me._connectors, me._connections, me._guid, me._renderer, me._normalizer, me._operation
            );
        }

        me._resorter = new Gridifier.Resorter(
            me, me._collector, me._connections, me._settings, me._guid
        );
        me._disconnector = new Gridifier.Disconnector(
            me, me._collector, me._connections, me._connectors, me._settings, me._guid, me._appender, me._reversedAppender
        );
        me._filtrator = new Gridifier.Filtrator(
            me, me._collector, me._connections, me._settings, me._guid, me._disconnector
        );

        me._sizesTransformer = new Gridifier.SizesTransformer.Core(
            me,
            me._settings,
            me._collector,
            me._connectors,
            me._connections,
            me._connectionsSorter,
            me._guid,
            me._appender,
            me._reversedAppender,
            me._normalizer,
            me._operation,
            me._sizesResolverManager,
            me._eventEmitter
        );
        me._connections.setSizesTransformerInstance(me._sizesTransformer);

        me._toggleOperation = new Gridifier.TransformerOperations.Toggle(
            me, me._collector, me._connections, me._guid, me._sizesTransformer, me._sizesResolverManager
        );
        me._transformOperation = new Gridifier.TransformerOperations.Transform(
            me, me._collector, me._connections, me._guid, me._sizesTransformer, me._sizesResolverManager
        );

        me._operationsQueue = new Gridifier.Operations.Queue(
            me._gridSizesUpdater,
            me._collector,
            me._connections,
            me._connectionsSorter,
            me._guid,
            me._settings,
            me._prepender,
            me._reversedPrepender,
            me._appender,
            me._reversedAppender,
            me._sizesTransformer,
            me._sizesResolverManager
        );

        me._silentRenderer = new Gridifier.SilentRenderer(
            me,
            me._collector,
            me._connections,
            me._operationsQueue,
            me._renderer,
            me._renderer.getRendererConnections()
        );
        me._renderer.setSilentRendererInstance(me._silentRenderer);

        me._dragifier = new Gridifier.Dragifier(
            me,
            me._appender,
            me._reversedAppender,
            me._collector,
            me._connections,
            me._connectors,
            me._guid,
            me._settings,
            me._sizesResolverManager,
            me._eventEmitter
        );

        me._bindEvents();
    };

    this._bindEvents = function() {
        var processResizeEventAfterMsDelay = me._settings.getResizeTimeout();
        var processResizeEventTimeout = null;

        me._resizeEventHandler = function() {
            if(processResizeEventAfterMsDelay == null) {
                me.triggerResize();
                return;
            }

            if(processResizeEventTimeout != null) {
                clearTimeout(processResizeEventTimeout);
                processResizeEventTimeout = null;
            }

            processResizeEventTimeout = setTimeout(function() {
                me.triggerResize();
            }, processResizeEventAfterMsDelay);
        };

        Event.add(window, "resize", me._resizeEventHandler);
    };

    this._unbindEvents = function() {
        Event.remove(window, "resize");
    };

    this.destruct = function() {
        me._unbindEvents();
    };

    this._construct();
    return this;
}

Gridifier.prototype.addToGrid = function(items) {
    this._grid.addToGrid(items);
    return this;
}

Gridifier.prototype.getGridX2 = function() {
    return this._grid.getGridX2();
}

Gridifier.prototype.getGridY2 = function() {
    return this._grid.getGridY2();
}

Gridifier.prototype.getGrid = function() {
    return this._grid.getGrid();
}

Gridifier.prototype.getCalculatedGridWidth = function() {
    return this._connections.getMaxX2();
}

Gridifier.prototype.getCalculatedGridHeight = function() {
    return this._connections.getMaxY2();
}

Gridifier.prototype.getRenderer = function() {
    return this._renderer;
}

Gridifier.prototype.markAsGridItem = function(items) {
    this._grid.markAsGridItem(items);
    return this;
}

Gridifier.prototype.scheduleGridSizesUpdate = function() {
    this._gridSizesUpdater.scheduleGridSizesUpdate();
}

Gridifier.prototype.triggerResize = function() {
    this.retransformAllSizes();
}

Gridifier.prototype.toggleBy = function(toggleFunctionName) {
    this._settings.setToggle(toggleFunctionName);
    return this;
}

Gridifier.prototype.sortBy = function(sortFunctionName) {
    this._settings.setSort(sortFunctionName);
    return this;
}

Gridifier.prototype.filterBy = function(filterFunctionName) {
    this._sizesTransformer.stopRetransformAllConnectionsQueue();
    this._settings.setFilter(filterFunctionName);
    this._filtrator.filter();
    this.retransformAllSizes();

    return this;
}

Gridifier.prototype.resort = function() {
    this._sizesTransformer.stopRetransformAllConnectionsQueue();
    this._resorter.resort();
    this.retransformAllSizes();

    return this;
}

Gridifier.prototype.collect = function() {
    return this._collector.collect();
}

Gridifier.prototype.collectAllConnectedItems = function() {
    return this._collector.collectAllConnectedItems();
}

Gridifier.prototype.getFirst = function() {
    return this._iterator.getFirst();
}

Gridifier.prototype.getLast = function() {
    return this._iterator.getLast();
}

Gridifier.prototype.getNext = function(item) {
    return this._iterator.getNext(item);
}

Gridifier.prototype.getPrev = function(item) {
    return this._iterator.getPrev(item);
}

Gridifier.prototype.pop = function() {
    var itemToPop = this._iterator.getFirst();
    if(itemToPop != null)
        this.disconnect(itemToPop);

    return itemToPop;
}

Gridifier.prototype.shift = function() {
    var itemToShift = this._iterator.getLast();
    if(itemToShift != null)
        this.disconnect(itemToShift);

    return itemToShift;
}

Gridifier.prototype.disconnect = function(items) {
    var me = this;

    items = me._itemClonesManager.unfilterClones(items);
    items = me._collector.filterOnlyConnectedItems(items);
    me._lifecycleCallbacks.executePreDisconnectCallbacks(items);

    var execute = function() {
        this._sizesTransformer.stopRetransformAllConnectionsQueue();
        this._disconnector.disconnect(items, Gridifier.Disconnector.DISCONNECT_TYPES.HARD);
        this.retransformAllSizes();
    }

    setTimeout(function() {
        execute.call(me);
    }, Gridifier.REFLOW_OPTIMIZATION_TIMEOUT);
    return this;
}

Gridifier.prototype.setCoordsChanger = function(coordsChangerName) {
    this._settings.setCoordsChanger(coordsChangerName);
    return this;
}

Gridifier.prototype.setSizesChanger = function(sizesChangerName) {
    this._settings.setSizesChanger(sizesChangerName);
    return this;
}

Gridifier.prototype.setDraggableItemDecorator = function(draggableItemDecoratorName) {
    this._settings.setDraggableItemDecorator(draggableItemDecoratorName);
    return this;
}

Gridifier.prototype.setItemWidthPercentageAntialias = function(itemWidthPtAntialias) {
    this._normalizer.bindZIndexesUpdates();
    this._normalizer.setItemWidthAntialiasPercentageValue(itemWidthPtAntialias);

    return this;
}

Gridifier.prototype.setItemHeightPercentageAntialias = function(itemHeightPtAntialias) {
    this._normalizer.bindZIndexesUpdates();
    this._normalizer.setItemHeightAntialiasPercentageValue(itemHeightPtAntialias);

    return this;
}

Gridifier.prototype.setItemWidthPxAntialias = function(itemWidthPxAntialias) {
    this._normalizer.bindZIndexesUpdates();
    this._normalizer.setItemWidthAntialiasPxValue(itemWidthPxAntialias);

    return this;
}

Gridifier.prototype.setItemHeightPxAntialias = function(itemHeightPxAntialias) {
    this._normalizer.bindZIndexesUpdates();
    this._normalizer.setItemHeightAntialiasPxValue(itemHeightPxAntialias);

    return this;
}

Gridifier.prototype.disableZIndexesUpdates = function() {
    this._normalizer.disableZIndexesUpdates();
    return this;
}

Gridifier.prototype.setToggleAnimationMsDuration = function(animationMsDuration) {
    this._settings.setToggleAnimationMsDuration(animationMsDuration);
}

Gridifier.prototype.setCoordsChangeAnimationMsDuration = function(animationMsDuration) {
    this._settings.setCoordsChangeAnimationMsDuration(animationMsDuration);
}

Gridifier.prototype.setAlignmentType = function(alignmentType) {
    this._settings.setAlignmentType(alignmentType);
    this.retransformAllSizes();
}

Gridifier.prototype.prepend = function(items, batchSize, batchTimeout) {
    if(this._settings.isMirroredPrepend()) {
        this.insertBefore(items, null, batchSize, batchTimeout);
        return this;
    }

    this._lifecycleCallbacks.executePreInsertCallbacks(items);
    var execute = function() {
        this._operationsQueue.schedulePrependOperation(items, batchSize, batchTimeout);
    }

    var me = this;
    setTimeout(function() {
        execute.call(me);
    }, Gridifier.REFLOW_OPTIMIZATION_TIMEOUT);

    return this;
}

Gridifier.prototype.append = function(items, batchSize, batchTimeout) {
    this._lifecycleCallbacks.executePreInsertCallbacks(items);

    var execute = function() {
        this._operationsQueue.scheduleAppendOperation(items, batchSize, batchTimeout);
    }

    var me = this;
    setTimeout(function() {
        execute.call(me);
    }, Gridifier.REFLOW_OPTIMIZATION_TIMEOUT);

    return this;
}

Gridifier.prototype.silentAppend = function(items, batchSize, batchTimeout) {
    this._silentRenderer.scheduleForSilentRender(
        this._collector.toDOMCollection(items)
    );
    this.append(items, batchSize, batchTimeout);

    return this;
}

Gridifier.prototype.silentRender = function(batchSize, batchTimeout) {
    this._silentRenderer.execute(batchSize, batchTimeout);
    return this;
}

Gridifier.prototype.insertBefore = function(items, beforeItem, batchSize, batchTimeout) {
    this._lifecycleCallbacks.executePreInsertCallbacks(items);

    var execute = function() {
        this._operationsQueue.scheduleInsertBeforeOperation(
            items, beforeItem, batchSize, batchTimeout
        );
    }

    var me = this;
    setTimeout(function() {
        execute.call(me);
    }, Gridifier.REFLOW_OPTIMIZATION_TIMEOUT);

    return this;
}

Gridifier.prototype.insertAfter = function(items, afterItem, batchSize, batchTimeout) {
    this._lifecycleCallbacks.executePreInsertCallbacks(items);

    var execute = function() {
        this._operationsQueue.scheduleInsertAfterOperation(
            items, afterItem, batchSize, batchTimeout
        );
    }

    var me = this;
    setTimeout(function() {
        execute.call(me);
    }, Gridifier.REFLOW_OPTIMIZATION_TIMEOUT);

    return this;
}

Gridifier.prototype.retransformAllSizes = function() {
    this._normalizer.updateItemAntialiasValues();
    this._transformOperation.executeRetransformAllSizes();

    return this;
}

Gridifier.prototype.toggleSizes = function(maybeItem, newWidth, newHeight) {
    this._normalizer.updateItemAntialiasValues();
    this._toggleOperation.execute(maybeItem, newWidth, newHeight, false);

    return this;
}

Gridifier.prototype.transformSizes = function(maybeItem, newWidth, newHeight) {
    this._normalizer.updateItemAntialiasValues();
    this._transformOperation.execute(maybeItem, newWidth, newHeight, false);

    return this;
}

Gridifier.prototype.toggleSizesWithPaddingBottom = function(maybeItem, newWidth, newPaddingBottom) {
    this._normalizer.updateItemAntialiasValues();
    this._toggleOperation.execute(maybeItem, newWidth, newPaddingBottom, true);

    return this;
}

Gridifier.prototype.transformSizesWithPaddingBottom = function(maybeItem, newWidth, newPaddingBottom) {
    this._normalizer.updateItemAntialiasValues();
    this._transformOperation.execute(maybeItem, newWidth, newPaddingBottom, true);

    return this;
}

Gridifier.prototype.toggleResponsiveClasses = function(maybeItem, className) {
    var items = this._responsiveClassesManager.toggleResponsiveClasses(maybeItem, className);
    this._normalizer.updateItemAntialiasValues();
    this._transformOperation.executeRetransformFromFirstSortedConnection(items);

    return this;
}

Gridifier.prototype.addResponsiveClasses = function(maybeItem, className) {
    var items = this._responsiveClassesManager.addResponsiveClasses(maybeItem, className);
    this._normalizer.updateItemAntialiasValues();
    this._transformOperation.executeRetransformFromFirstSortedConnection(items);

    return this;
}

Gridifier.prototype.removeResponsiveClasses = function(maybeItem, className) {
    var items = this._responsiveClassesManager.removeResponsiveClasses(maybeItem, className);
    this._normalizer.updateItemAntialiasValues();
    this._transformOperation.executeRetransformFromFirstSortedConnection(items);

    return this;
}

Gridifier.prototype.bindDragifierEvents = function() {
    this._dragifier.bindDragifierEvents();
    return this;
}

Gridifier.prototype.unbindDragifierEvents = function() {
    this._dragifier.unbindDragifierEvents();
    return this;
}

Gridifier.prototype.addPreInsertLifecycleCallback = function(callback) {
    this._lifecycleCallbacks.addPreInsertCallback(callback);
    return this;
}

Gridifier.prototype.addPreDisconnectLifecycleCallback = function(callback) {
    this._lifecycleCallbacks.addPreDisconnectCallback(callback);
    return this;
}

Gridifier.prototype.setItemClonesManagerLifecycleCallbacks = function() {
    var me = this;
    this.addPreInsertLifecycleCallback(function(items) {
        for(var i = 0; i < items.length; i++) {
            me._itemClonesManager.createClone(items[i]);
        }
    });

    this.addPreDisconnectLifecycleCallback(function(items) {
        // Clone delete should happen after toggle finish.
        // (Otherwise it will hide instantly).
        setTimeout(function() {
            for(var i = 0; i < items.length; i++) {
                me._itemClonesManager.destroyClone(items[i]);
            }
        }, me._settings.getToggleAnimationMsDuration());
    });

    return this;
}

Gridifier.prototype.getItemClonesManager = function() {
    return this._itemClonesManager;
}

Gridifier.prototype.hasItemBindedClone = function(item) {
    var items = this._collector.toDOMCollection(item);
    var item = items[0];

    return this._itemClonesManager.hasBindedClone(item);
}

Gridifier.prototype.isItemClone = function(item) {
    var items = this._collector.toDOMCollection(item);
    var item = items[0];

    return this._itemClonesManager.isItemClone(item);
}

Gridifier.prototype.getItemClone = function(item) {
    var items = this._collector.toDOMCollection(item);
    var item = items[0];

    if(!this._itemClonesManager.hasBindedClone(item))
        new Error("Gridifier error: item has no binded clone.(Wrong item?). Item = ", item);

    return this._itemClonesManager.getBindedClone(item);
}

Gridifier.prototype.getOriginalItemFromClone = function(itemClone) {
    var items = this._collector.toDOMCollection(itemClone);
    var item = items[0];

    return this._itemClonesManager.getOriginalItemFromClone(item);
}

Gridifier.prototype.getConnectedItems = function() {
    var connections = this._connections.get();
    var items = [];

    for(var i = 0; i < connections.length; i++)
        items.push(connections[i].item);

    return items;
}

Gridifier.prototype.hasConnectedItemAtPoint = function(x, y) {
    var itemAtPoint = this._itemClonesManager.getConnectionItemAtPoint(x, y);
    if(itemAtPoint == null)
        return false;

    return true;
}

Gridifier.prototype.getConnectedItemAtPoint = function(x, y) {
    return this._itemClonesManager.getConnectionItemAtPoint(x, y);
}

Gridifier.Api = {};
Gridifier.HorizontalGrid = {};
Gridifier.VerticalGrid = {};
Gridifier.Operations = {};
Gridifier.TransformerOperations = {};
Gridifier.SizesTransformer = {};

Gridifier.REFLOW_OPTIMIZATION_TIMEOUT = 0;

Gridifier.GRID_TYPES = {VERTICAL_GRID: "verticalGrid", HORIZONTAL_GRID: "horizontalGrid"};

Gridifier.PREPEND_TYPES = {
    MIRRORED_PREPEND: "mirroredPrepend",
    DEFAULT_PREPEND: "defaultPrepend",
    REVERSED_PREPEND: "reversedPrepend"
};
Gridifier.APPEND_TYPES = {DEFAULT_APPEND: "defaultAppend", REVERSED_APPEND: "reversedAppend"};

Gridifier.INTERSECTION_STRATEGIES = {DEFAULT: "default", NO_INTERSECTIONS: "noIntersections"};
Gridifier.INTERSECTION_STRATEGY_ALIGNMENT_TYPES = {
    FOR_VERTICAL_GRID: {
        TOP: "top", CENTER: "center", BOTTOM: "bottom"
    },
    FOR_HORIZONTAL_GRID: {
        LEFT: "left", CENTER: "center", RIGHT: "right"
    }
};

Gridifier.SORT_DISPERSION_MODES = {
    DISABLED: "disabled",
    CUSTOM: "custom",
    CUSTOM_ALL_EMPTY_SPACE: "customAllEmptySpace"
};

Gridifier.GRID_ITEM_MARKING_STRATEGIES = {BY_CLASS: "class", BY_DATA_ATTR: "data", BY_QUERY: "query"};
Gridifier.GRID_ITEM_MARKING_DEFAULTS = {
    CLASS: "gridifier-item",
    DATA_ATTR: "data-gridifier-item",
    QUERY: "div > div"
};

Gridifier.DRAGIFIER_MODES = {INTERSECTION: "intersection", DISCRETIZATION: "discretization"};

Gridifier.OPERATIONS = {PREPEND: 0, REVERSED_PREPEND: 1, APPEND: 2, REVERSED_APPEND: 3, MIRRORED_PREPEND: 4};
Gridifier.DEFAULT_TOGGLE_ANIMATION_MS_DURATION = 500;
Gridifier.DEFAULT_COORDS_CHANGE_ANIMATION_MS_DURATION = 500;
Gridifier.DEFAULT_TOGGLE_TRANSITION_TIMING = "ease";
Gridifier.DEFAULT_COORDS_CHANGE_TRANSITION_TIMING = "ease";

Gridifier.DEFAULT_ROTATE_PERSPECTIVE = "200px";
Gridifier.DEFAULT_ROTATE_BACKFACE = true;

Gridifier.GRID_TRANSFORM_TYPES = {EXPAND: "expand", FIT: "fit"};
Gridifier.DEFAULT_GRID_TRANSFORM_TIMEOUT = 100;

Gridifier.RETRANSFORM_QUEUE_DEFAULT_BATCH_SIZE = 12;
Gridifier.RETRANSFORM_QUEUE_DEFAULT_BATCH_TIMEOUT = 25;

Gridifier.Api.CoordsChanger = function(settings, gridifier, eventEmitter) {
    var me = this;

    this._settings = null;
    this._gridifier = null;
    this._eventEmitter = null;

    this._coordsChangerFunction = null;
    this._coordsChangerFunctions = {};

    this._css = {
    };

    this._construct = function() { 
        me._settings = settings;
        me._gridifier = gridifier;
        me._eventEmitter = eventEmitter;

        me._coordsChangerFunctions = {};

        me._addDefaultCoordsChanger();
        me._addCSS3PositionCoordsChanger();
        me._addCSS3TranslateCoordsChanger();
        me._addCSS3Translate3DCoordsChanger();
        me._addCSS3Translate3DClonesCoordsChanger();
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

Gridifier.Api.CoordsChanger.prototype.setCoordsChangerFunction = function(coordsChangerFunctionName) {
    if(!this._coordsChangerFunctions.hasOwnProperty(coordsChangerFunctionName)) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.SET_COORDS_CHANGER_INVALID_PARAM,
            coordsChangerFunctionName
        );
        return;
    }

    this._coordsChangerFunction = this._coordsChangerFunctions[coordsChangerFunctionName];
}

Gridifier.Api.CoordsChanger.prototype.addCoordsChangerFunction = function(coordsChangerFunctionName, 
                                                                          coordsChangerFunction) {
    this._coordsChangerFunctions[coordsChangerFunctionName] = coordsChangerFunction;
}

Gridifier.Api.CoordsChanger.prototype.getCoordsChangerFunction = function() {
    return this._coordsChangerFunction;
}

Gridifier.Api.CoordsChanger.prototype._addDefaultCoordsChanger = function() {
    this._coordsChangerFunctions["default"] = function(item, 
                                                       newLeft, 
                                                       newTop,
                                                       animationMsDuration,
                                                       eventEmitter,
                                                       emitTransformEvent,
                                                       newWidth,
                                                       newHeight,
                                                       isItemInitializationCall,
                                                       transitionTiming) {
        var isItemInitializationCall = isItemInitializationCall || false;
        if(isItemInitializationCall) {
            // Custom init logic per coordsChanger sync can be placed here
            // (We are no passing this flag from CSS3 coordsChanger fallback methods,
            //  because no special initialization is required here)
            return;
        }

        if(newLeft != item.style.left)
            Dom.css.set(item, {left: newLeft});
        if(newTop != item.style.top)
            Dom.css.set(item, {top: newTop});

        if(emitTransformEvent) {
            eventEmitter.emitTransformEvent(item, newWidth, newHeight, newLeft, newTop);
        }
    };
}

Gridifier.Api.CoordsChanger.prototype._addCSS3PositionCoordsChanger = function() {
    var me = this;

    this._coordsChangerFunctions.CSS3Position = function(item,
                                                         newLeft,
                                                         newTop,
                                                         animationMsDuration,
                                                         eventEmitter,
                                                         emitTransformEvent,
                                                         newWidth,
                                                         newHeight,
                                                         isItemInitializationCall,
                                                         transitionTiming) {
        if(!Dom.isBrowserSupportingTransitions()) {
            me._coordsChangerFunctions["default"](
                item, newLeft, newTop, animationMsDuration, eventEmitter, emitTransformEvent, newWidth, newHeight
            );
            return;
        }

        newLeft = parseFloat(newLeft) + "px";
        newTop = parseFloat(newTop) + "px";

        var isItemInitializationCall = isItemInitializationCall || false;
        if(isItemInitializationCall) {
            Dom.css3.transform(item, "scale3d(1,1,1)");
            return;
        }

        if(newLeft != item.style.left) {
            Dom.css3.transitionProperty(item, "left " + animationMsDuration + "ms " + transitionTiming);
            Dom.css.set(item, {left: newLeft});
        }

        if(newTop != item.style.top) {
            Dom.css3.transitionProperty(item, "top " + animationMsDuration + "ms " + transitionTiming);
            Dom.css.set(item, {top: newTop});
        }

        if(emitTransformEvent) {
            setTimeout(function() {
                eventEmitter.emitTransformEvent(item, newWidth, newHeight, newLeft, newTop);
            }, animationMsDuration + 20);
        }
    }
}

Gridifier.Api.CoordsChanger.prototype._addCSS3TranslateCoordsChanger = function() {
    var me = this;

    var createCoordsChanger = function(translateXNormalizer, translateYNormalizer) {
        return function(item,
                        newLeft,
                        newTop,
                        animationMsDuration,
                        eventEmitter,
                        emitTransformEvent,
                        newWidth,
                        newHeight,
                        isItemInitializationCall,
                        transitionTiming) {
            if(!Dom.isBrowserSupportingTransitions()) {
                me._coordsChangerFunctions["default"](
                    item, newLeft, newTop, animationMsDuration, eventEmitter, emitTransformEvent, newWidth, newHeight
                );
                return;
            }

            var isItemInitializationCall = isItemInitializationCall || false;
            if(isItemInitializationCall) {
                Dom.css3.transform(item, "scale3d(1,1,1) translate(0px,0px)");
                return;
            }

            var newLeft = parseFloat(newLeft);
            var newTop = parseFloat(newTop);

            var currentLeft = parseFloat(item.style.left);
            var currentTop = parseFloat(item.style.top);

            if(newLeft > currentLeft)
                var translateX = newLeft - currentLeft;
            else if(newLeft < currentLeft)
                var translateX = (currentLeft - newLeft) * -1;
            else
                var translateX = 0;

            if(newTop > currentTop)
                var translateY = newTop - currentTop;
            else if(newTop < currentTop)
                var translateY = (currentTop - newTop) * -1;
            else
                var translateY = 0;

            var translateRegexp = /.*translate\((.*)\).*/;
            var matches = translateRegexp.exec(item.style[Prefixer.get("transform")]);
            if(matches == null || typeof matches[1] == "undefined" || matches[1] == null) {
                var setNewTranslate = true;
            }
            else {
                var translateParts = matches[1].split(",");
                var lastTranslateX = translateParts[0].gridifierTrim();
                var lastTranslateY = translateParts[1].gridifierTrim();

                if(lastTranslateX == (translateX + "px") && lastTranslateY == (translateY + "px"))
                    var setNewTranslate = false;
                else
                    var setNewTranslate = true;
            }

            if(setNewTranslate) {
                Dom.css3.transitionProperty(
                    item,
                    Prefixer.getForCSS('transform', item) + " " + animationMsDuration + "ms " + transitionTiming
                );

                translateX = translateXNormalizer(translateX);
                translateY = translateYNormalizer(translateY);

                Dom.css3.transformProperty(item, "translate", translateX + "px," + translateY + "px");
            }

            if(emitTransformEvent) {
                setTimeout(function () {
                    eventEmitter.emitTransformEvent(item, newWidth, newHeight, newLeft, newTop);
                }, animationMsDuration + 20);
            }
        }
    };

    var returnOriginalTranslate = function(translate) { return translate; };
    this._coordsChangerFunctions.CSS3Translate = createCoordsChanger(returnOriginalTranslate, returnOriginalTranslate);
    this._coordsChangerFunctions.CSS3TranslateWithRounding = createCoordsChanger(
        function(translateX) { return Math.round(translateX); },
        function(translateY) { return Math.round(translateY); }
    );
}

Gridifier.Api.CoordsChanger.prototype._addCSS3Translate3DCoordsChanger = function() {
    var me = this;

    var createCoordsChanger = function(translateXNormalizer, translateYNormalizer) {
        return function (item,
                         newLeft,
                         newTop,
                         animationMsDuration,
                         eventEmitter,
                         emitTransformEvent,
                         newWidth,
                         newHeight,
                         isItemInitializationCall,
                         transitionTiming) {
            if(!Dom.isBrowserSupportingTransitions()) {
                me._coordsChangerFunctions["default"](
                    item, newLeft, newTop, animationMsDuration, eventEmitter, emitTransformEvent, newWidth, newHeight
                );
                return;
            }

            var isItemInitializationCall = isItemInitializationCall || false;
            if(isItemInitializationCall) {
                Dom.css3.transform(item, "scale3d(1,1,1) translate3d(0px,0px,0px)");
                return;
            }

            var newLeft = parseFloat(newLeft);
            var newTop = parseFloat(newTop);

            var currentLeft = parseFloat(item.style.left);
            var currentTop = parseFloat(item.style.top);

            if(newLeft > currentLeft)
                var translateX = newLeft - currentLeft;
            else if(newLeft < currentLeft)
                var translateX = (currentLeft - newLeft) * -1;
            else
                var translateX = 0;

            if(newTop > currentTop)
                var translateY = newTop - currentTop;
            else if(newTop < currentTop)
                var translateY = (currentTop - newTop) * -1;
            else
                var translateY = 0;

            var translateRegexp = /.*translate3d\((.*)\).*/;
            var matches = translateRegexp.exec(item.style[Prefixer.get("transform")]);
            if(matches == null || typeof matches[1] == "undefined" || matches[1] == null) {
                var setNewTranslate = true;
            }
            else {
                var translateParts = matches[1].split(",");
                var lastTranslateX = translateParts[0].gridifierTrim();
                var lastTranslateY = translateParts[1].gridifierTrim();

                if(lastTranslateX == (translateX + "px") && lastTranslateY == (translateY + "px"))
                    var setNewTranslate = false;
                else
                    var setNewTranslate = true;
            }

            if(setNewTranslate) {
                Dom.css3.transitionProperty(
                    item,
                    Prefixer.getForCSS('transform', item) + " " + animationMsDuration + "ms " + transitionTiming
                );

                translateX = translateXNormalizer(translateX);
                translateY = translateYNormalizer(translateY);

                Dom.css3.perspective(item, "1000");
                Dom.css3.backfaceVisibility(item, "hidden");
                Dom.css3.transformProperty(item, "translate3d", translateX + "px," + translateY + "px,0px");
            }

            if(emitTransformEvent) {
                setTimeout(function () {
                    eventEmitter.emitTransformEvent(item, newWidth, newHeight, newLeft, newTop);
                }, animationMsDuration + 20);
            }
        };
    }

    var returnOriginalTranslate = function(translate) { return translate; };
    this._coordsChangerFunctions.CSS3Translate3D = createCoordsChanger(returnOriginalTranslate, returnOriginalTranslate);
    this._coordsChangerFunctions.CSS3Translate3DWithRounding = createCoordsChanger(
        function(translateX) { return Math.round(translateX); },
        function(translateY) { return Math.round(translateY); }
    );
}

Gridifier.Api.CoordsChanger.CSS3_TRANSLATE_3D_CLONES_RESTRICT_CLONE_SHOW_DATA_ATTR = "gridifier-clones-coords-changer-restrict-show";

Gridifier.Api.CoordsChanger.prototype._addCSS3Translate3DClonesCoordsChanger = function() {
    var me = this;
    var itemShownDataAttr = "data-gridifier-item-shown";

    this._gridifier.onShow(function(item) {
        var itemClonesManager = me._gridifier.getItemClonesManager();
        if(!itemClonesManager.hasBindedClone(item))
            return;

        item.setAttribute(itemShownDataAttr, "yes");
    });

    this._gridifier.onHide(function(item) {
        //var itemClonesManager = me._gridifier.getItemClonesManager();
        //if(!itemClonesManager.hasBindedClone(item))
        //    return;

        if(Dom.hasAttribute(item, itemShownDataAttr))
            item.removeAttribute(itemShownDataAttr);
    });

    var clonesHideTimeouts = [];

    this._coordsChangerFunctions.CSS3Translate3DClones = function(item,
                                                                  newLeft,
                                                                  newTop,
                                                                  animationMsDuration,
                                                                  eventEmitter,
                                                                  emitTransformEvent,
                                                                  newWidth,
                                                                  newHeight,
                                                                  isItemInitializationCall,
                                                                  transitionTiming) {
        if(!Dom.isBrowserSupportingTransitions()) {
            me._coordsChangerFunctions["default"](
                item, newLeft, newTop, animationMsDuration, eventEmitter, emitTransformEvent, newWidth, newHeight
            );
            return;
        }

        // We should preinit item transform property with scale3d(1,1,1) rule.
        // Otherwise animation will break on scale3d applying any later time.
        //      item.style.wT = "translate3d(0px,0px,0px)";
        //      item.style.wT = "translate3d(0px,0px,0px) scale3d(1,1,1) "; -> Won't work.
        //      item.style.wT = "scale3d(1,1,1)";
        //      item.style.wT = "scale3d(1,1,1) translate3d(0px,0px,0px)"; -> Will work, but will break without setting
        //                                                                    second rule without timeout. So we should
        //                                                                    set all required rules per coords changers
        //                                                                    before calling toggle function for first time.
        var isItemInitializationCall = isItemInitializationCall || false;
        if(isItemInitializationCall) {
            Dom.css3.transform(item, "scale3d(1,1,1) translate3d(0px,0px,0px)");
            return;
        }

        newLeft = parseFloat(newLeft) + "px";
        newTop = parseFloat(newTop) + "px";

        if(Dom.hasAttribute(item, Gridifier.Dragifier.IS_DRAGGABLE_ITEM_DATA_ATTR))
            var isDraggableItem = true;
        else
            var isDraggableItem = false;

        var itemClonesManager = me._gridifier.getItemClonesManager();
        var itemClone = itemClonesManager.getBindedClone(item);

        var guid = item.getAttribute(Gridifier.GUID.GUID_DATA_ATTR);

        if(typeof clonesHideTimeouts[guid] == "undefined") {
            clonesHideTimeouts[guid] = null;
        }

        var cc = Gridifier.Api.CoordsChanger;
        if(!isDraggableItem && !Dom.hasAttribute(itemClone, cc.CSS3_TRANSLATE_3D_CLONES_RESTRICT_CLONE_SHOW_DATA_ATTR)) {
            if(itemClone.style.visibility != "visible")
                itemClone.style.visibility = "visible";
        }

        if(Dom.hasAttribute(item, itemShownDataAttr)) {
            if(item.style.visibility != "hidden")
                item.style.visibility = "hidden";
        }

        if(emitTransformEvent) {
            var sizesChanger = me._settings.getSizesChanger();
            sizesChanger(itemClone, newWidth, newHeight);

            setTimeout(function () {
                eventEmitter.emitTransformEvent(itemClone, newWidth, newHeight, newLeft, newTop);
            }, animationMsDuration + 20);
        }

        if(newLeft != item.style.left)
            Dom.css.set(item, {left: newLeft});

        if(newTop != item.style.top)
            Dom.css.set(item, {top: newTop});

        var tt = transitionTiming;
        me._coordsChangerFunctions.CSS3Translate3D(
            itemClone, newLeft, newTop, animationMsDuration, eventEmitter, emitTransformEvent, newWidth, newHeight, false, tt
        );

        if(clonesHideTimeouts[guid] != null) {
            clearTimeout(clonesHideTimeouts[guid]);
            clonesHideTimeouts[guid] = null;
        }

        clonesHideTimeouts[guid] = setTimeout(function () {
            if(Dom.hasAttribute(item, itemShownDataAttr) && !isDraggableItem) {
                if(item.style.visibility != "visible")
                    item.style.visibility = "visible";

                if(itemClone.style.visibility != "hidden")
                    itemClone.style.visibility = "hidden";
            }
        }, animationMsDuration);
    };
}

Gridifier.Api.CoordsChanger.prototype.hasTranslateOrTranslate3DTransformSet = function(DOMElem) {
    var translateRegexp = /.*translate\((.*)\).*/;
    var translate3dRegexp = /.*translate3d\((.*)\).*/;

    if(translateRegexp.test(DOMElem.style[Prefixer.get("transform", DOMElem)]) ||
        translate3dRegexp.test(DOMElem.style[Prefixer.get("transform", DOMElem)]))
        return true;

    return false;
}

Gridifier.Api.CoordsChanger.prototype.setTransformOriginAccordingToCurrentTranslate = function(DOMElem,
                                                                                               connectionLeft,
                                                                                               connectionTop,
                                                                                               DOMElemWidth,
                                                                                               DOMElemHeight) {
    var newLeft = parseFloat(connectionLeft);
    var newTop = parseFloat(connectionTop);

    var currentLeft = parseFloat(DOMElem.style.left);
    var currentTop = parseFloat(DOMElem.style.top);

    if(newLeft > currentLeft)
        var translateX = newLeft - currentLeft;
    else if(newLeft < currentLeft)
        var translateX = (currentLeft - newLeft) * -1;
    else
        var translateX = 0;

    if(newTop > currentTop)
        var translateY = newTop - currentTop;
    else if(newTop < currentTop)
        var translateY = (currentTop - newTop) * -1;
    else
        var translateY = 0;

    Dom.css3.transformOrigin(DOMElem, (translateX + DOMElemWidth / 2) + "px " + (translateY + DOMElemHeight / 2) + "px");
}

Gridifier.Api.CoordsChanger.prototype.resetTransformOrigin = function(DOMElem) {
    Dom.css3.transformOrigin(DOMElem, "50% 50%");
}

Gridifier.Api.Dragifier = function() {
    var me = this;

    this._draggableItemDecoratorFunction = null;
    this._draggableItemDecoratorFunctions = {};

    this._dragifierUserSelectToggler = null;

    this._css = {
    };

    this._construct = function() {
        me._bindEvents();

        me._addCloneCSSDecoratorFunction();
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

Gridifier.Api.Dragifier.prototype.setDraggableItemDecoratorFunction = function(draggableItemDecoratorFunctionName) {
    if(!this._draggableItemDecoratorFunctions.hasOwnProperty(draggableItemDecoratorFunctionName)) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.SET_DRAGGABLE_ITEM_DECORATOR_INVALID_PARAM,
            draggableItemDecoratorFunctionName
        );
        return;
    }

    this._draggableItemDecoratorFunction = this._draggableItemDecoratorFunctions[draggableItemDecoratorFunctionName];
}

Gridifier.Api.Dragifier.prototype.addDraggableItemDecoratorFunction = function(draggableItemDecoratorFunctionName,
                                                                               draggableItemDecoratorFunction) {
    this._draggableItemDecoratorFunctions[draggableItemDecoratorFunctionName] = draggableItemDecoratorFunction;
}

Gridifier.Api.Dragifier.prototype.getDraggableItemDecoratorFunction = function() {
    return this._draggableItemDecoratorFunction;
}

Gridifier.Api.Dragifier.prototype.getDraggableItemCoordsChanger = function() {
    return function(item, newLeft, newTop) {
        if(!Dom.isBrowserSupportingTransitions()) {
            Dom.css.set(item, {
                left: newLeft,
                top: newTop
            });
            return;
        }

        var newLeft = parseFloat(newLeft);
        var newTop = parseFloat(newTop);

        var currentLeft = parseFloat(item.style.left);
        var currentTop = parseFloat(item.style.top);

        if(newLeft > currentLeft)
            var translateX = newLeft - currentLeft;
        else if(newLeft < currentLeft)
            var translateX = (currentLeft - newLeft) * -1;
        else
            var translateX = 0;

        if(newTop > currentTop)
            var translateY = newTop - currentTop;
        else if(newTop < currentTop)
            var translateY = (currentTop - newTop) * -1;
        else
            var translateY = 0;

        Dom.css3.transitionProperty(item, "none");
        Dom.css3.perspective(item, "1000");
        Dom.css3.backfaceVisibility(item, "hidden");
        Dom.css3.transformProperty(item, "translate3d", translateX + "px," + translateY + "px, 0px");
    };
}

Gridifier.Api.Dragifier.prototype.getDraggableItemPointerDecorator = function() {
    return function(draggableItemPointer) {
        Dom.css.addClass(draggableItemPointer, "gridifier-draggable-item-pointer");
        draggableItemPointer.style.backgroundColor = "red";
    };
}

Gridifier.Api.Dragifier.prototype.getDragifierUserSelectToggler = function() {
    if(this._dragifierUserSelectToggler != null)
        return this._dragifierUserSelectToggler;

    this._dragifierUserSelectToggler = {
        _setToNoneOriginalSelectProps: {},

        _hasSelectProp: function(propName) {
            return (typeof document.body.style[propName] != "undefined");
        },

        _selectProps: ["webkitTouchCallout", "webkitUserSelect", "khtmlUserSelect",
                       "mozUserSelect", "msUserSelect", "userSelect"],

        'disableSelect': function() {
            for(var i = 0; i < this._selectProps.length; i++) {
                if(this._hasSelectProp(this._selectProps[i])) {
                    this._setToNoneOriginalSelectProps[this._selectProps[i]] = document.body.style[this._selectProps[i]];
                    document.body.style[this._selectProps[i]] = "none";
                }
            }
        },

        'enableSelect': function() {
            for(var selectPropToRestore in this._setToNoneOriginalSelectProps) {
                document.body.style[selectPropToRestore] = this._setToNoneOriginalSelectProps[selectPropToRestore];
            }

            this._setToNoneOriginalSelectProps = {};
        }
    };

    return this._dragifierUserSelectToggler;
}

Gridifier.Api.Dragifier.prototype._addCloneCSSDecoratorFunction = function() {
    this._draggableItemDecoratorFunctions['cloneCSS'] = function(draggableItemClone, draggableItem, sizesResolverManager) {
        sizesResolverManager.copyComputedStyle(draggableItem, draggableItemClone);
    };
}

Gridifier.Api.Filter = function(settings, eventEmitter) {
    var me = this;

    this._settings = null;
    this._eventEmitter = null;

    this._filterFunction = null;
    this._filterFunctions = {};

    this._css = {
    };

    this._construct = function() {
        me._settings = settings;
        me._eventEmitter = eventEmitter;

        me._filterFunctions = {};

        me._addAllFilter();
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

Gridifier.Api.Filter.prototype.setFilterFunction = function(filterFunctionName) {
    if(!this._filterFunctions.hasOwnProperty(filterFunctionName)) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.SET_FILTER_INVALID_PARAM,
            filterFunctionName
        );
        return;
    }

    this._filterFunction = this._filterFunctions[filterFunctionName];
}

Gridifier.Api.Filter.prototype.addFilterFunction = function(filterFunctionName, filterFunction) {
    this._filterFunctions[filterFunctionName] = filterFunction;
}

Gridifier.Api.Filter.prototype.getFilterFunction = function() {
    return this._filterFunction;
}

Gridifier.Api.Filter.prototype._addAllFilter = function() {
    this._filterFunctions.all = function(item) {
        return true;
    };
}

Gridifier.Api.Rotate = function(settings, eventEmitter, sizesResolverManager) {
    var me = this;

    this._settings = null;
    this._eventEmitter = null;
    this._sizesResolverManager = null;
    this._collector = null;

    this._rotateFadeType = null;
    this._transitionTiming = null;

    this._css = {
    };

    this._construct = function() {
        me._settings = settings;
        me._eventEmitter = eventEmitter;
        me._sizesResolverManager = sizesResolverManager;
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

Gridifier.Api.Rotate.ROTATE_MATRIX_TYPES = {X: 0, Y: 1, Z: 2, XY: 3, XZ: 4, YZ: 5, XYZ: 6};
Gridifier.Api.Rotate.ROTATE_FUNCTION_TYPES = {X: 0, Y: 1, Z: 2};
Gridifier.Api.Rotate.ROTATE_FADE_TYPES = {NONE: 0, FULL: 1, ON_HIDE_MIDDLE: 2};

Gridifier.Api.Rotate.prototype.setCollectorInstance = function(collector) {
    this._collector = collector;
}

Gridifier.Api.Rotate.prototype._getRotateMatrix = function(rotateMatrixType) {
    if(rotateMatrixType == Gridifier.Api.Rotate.ROTATE_MATRIX_TYPES.X)
        return "1, 0, 0, ";
    else if(rotateMatrixType == Gridifier.Api.Rotate.ROTATE_MATRIX_TYPES.Y)
        return "0, 1, 0, ";
    else if(rotateMatrixType == Gridifier.Api.Rotate.ROTATE_MATRIX_TYPES.Z)
        return "0, 0, 1, ";
    else if(rotateMatrixType == Gridifier.Api.Rotate.ROTATE_MATRIX_TYPES.XY)
        return "1, 1, 0, ";
    else if(rotateMatrixType == Gridifier.Api.Rotate.ROTATE_MATRIX_TYPES.XZ)
        return "1, 0, 1, ";
    else if(rotateMatrixType == Gridifier.Api.Rotate.ROTATE_MATRIX_TYPES.YZ)
        return "0, 1, 1, ";
    else if(rotateMatrixType == Gridifier.Api.Rotate.ROTATE_MATRIX_TYPES.XYZ)
        return "1, 1, 1, ";

    throw new Error("Gridifier error: wrong rotate matrix type = " + rotateMatrixType);
}

Gridifier.Api.Rotate.prototype._getRotateFunction = function(rotateFunctionType) {
    if(rotateFunctionType == Gridifier.Api.Rotate.ROTATE_FUNCTION_TYPES.X)
        return "rotateX";
    else if(rotateFunctionType == Gridifier.Api.Rotate.ROTATE_FUNCTION_TYPES.Y)
        return "rotateY";
    else if(rotateFunctionType == Gridifier.Api.Rotate.ROTATE_FUNCTION_TYPES.Z)
        return "rotateZ";

    throw new Error("Gridifier error: wrong rotate function type = " + rotateFunctionType);
}

Gridifier.Api.Rotate.prototype.setRotateFadeType = function(fadeType) {
    this._rotateFadeType = fadeType;
}

Gridifier.Api.Rotate.prototype.setTransitionTiming = function(transitionTiming) {
    this._transitionTiming = transitionTiming;
}

Gridifier.Api.Rotate.prototype.show3d = function(item, grid, rotateMatrixType, timeouter, left, top, itemClonesManager) {
    var rotateProp = "rotate3d";
    this._rotate(item, grid, rotateProp, false, timeouter, this._getRotateMatrix(rotateMatrixType), left, top, itemClonesManager);
}

Gridifier.Api.Rotate.prototype.hide3d = function(item, grid, rotateMatrixType, timeouter, left, top, itemClonesManager) {
    var rotateProp = "rotate3d";
    this._rotate(item, grid, rotateProp, true, timeouter, this._getRotateMatrix(rotateMatrixType), left, top, itemClonesManager);
}

Gridifier.Api.Rotate.prototype.show = function(item, grid, rotateFunctionType, timeouter, left, top, itemClonesManager) {
    var rotateProp = this._getRotateFunction(rotateFunctionType);
    this._rotate(item, grid, rotateProp, false, timeouter, "", left, top, itemClonesManager);
}

Gridifier.Api.Rotate.prototype.hide = function(item, grid, rotateFunctionType, timeouter, left, top, itemClonesManager) {
    var rotateProp = this._getRotateFunction(rotateFunctionType);
    this._rotate(item, grid, rotateProp, true, timeouter, "", left, top, itemClonesManager);
}

Gridifier.Api.Rotate.prototype._rotate = function(item,
                                                  grid,
                                                  rotateProp,
                                                  inverseToggle,
                                                  timeouter,
                                                  rotateMatrix,
                                                  left,
                                                  top,
                                                  itemClonesManager) {
    if(!inverseToggle) {
        var isShowing = true;
        var isHiding = false;
    }
    else {
        var isShowing = false;
        var isHiding = true;
    }

    var scene = this._createScene(item, grid, left, top);
    var frames = this._createFrames(scene);
    var itemClone = this._createItemClone(item);

    item.setAttribute(Gridifier.Api.Toggle.IS_TOGGLE_ANIMATION_RUNNING, "yes");
    itemClonesManager.lockCloneOnToggle(item);
    var frontFrame = this._createFrontFrame(frames, rotateProp, rotateMatrix);
    var backFrame = this._createBackFrame(frames, rotateProp, rotateMatrix);

    if(isShowing) {
        backFrame.appendChild(itemClone);
        item.style.visibility = "hidden";
    }
    else if(isHiding) {
        frontFrame.appendChild(itemClone);
        item.style.visibility = "hidden";
    }

    var animationMsDuration = this._settings.getToggleAnimationMsDuration();
    Dom.css3.transitionProperty(
        frontFrame, 
        Prefixer.getForCSS('transform', frontFrame) + " " + animationMsDuration + "ms " + this._transitionTiming
    );
    Dom.css3.transitionProperty(
        backFrame, 
        Prefixer.getForCSS('transform', backFrame) + " " + animationMsDuration + "ms " + this._transitionTiming
    );

    var me = this;
    var initRotateTimeout = setTimeout(function() {
        Dom.css3.transformProperty(frontFrame, rotateProp, rotateMatrix + "180deg");
        Dom.css3.transformProperty(backFrame, rotateProp, rotateMatrix + "0deg");
    }, 20);
    // No sence to sync timeouts here -> Animations are performed on clones
    //timeouter.add(item, initRotateTimeout);

    this._initFadeEffect(scene, isShowing, isHiding, animationMsDuration);

    // A little helper to reduce blink effect after animation finish
    if(animationMsDuration > 400) {
       var prehideItemTimeout = setTimeout(function () {
          if (isShowing)
             item.style.visibility = "visible";
          else if (isHiding)
             item.style.visibility = "hidden";
       }, animationMsDuration - 50);
       //timeouter.add(item, prehideItemTimeout);
    }

    var completeRotateTimeout = setTimeout(function() {
        scene.parentNode.removeChild(scene);
        item.removeAttribute(Gridifier.Api.Toggle.IS_TOGGLE_ANIMATION_RUNNING);

        if(isShowing) {
            itemClonesManager.unlockCloneOnToggle(item);
            item.style.visibility = "visible";
            me._eventEmitter.emitShowEvent(item);
        }
        else if(isHiding) {
            itemClonesManager.unlockCloneOnToggle(item).hideCloneOnToggle(item);
            item.style.visibility = "hidden";
            me._eventEmitter.emitHideEvent(item);
        }
    }, animationMsDuration + 20);
    //timeouter.add(item, completeRotateTimeout);
}

Gridifier.Api.Rotate.prototype._createScene = function(item, grid, left, top) {
    var scene = document.createElement("div");
    Dom.css.set(scene, {
        width: this._sizesResolverManager.outerWidth(item) + "px",
        height: this._sizesResolverManager.outerHeight(item) + "px",
        position: "absolute",
        left: left,
        top: top
    });
    Dom.css3.perspective(scene, this._settings.getRotatePerspective()); 
    grid.appendChild(scene);

    return scene;
}

Gridifier.Api.Rotate.prototype._createFrames = function(scene) {
    var frames = document.createElement("div");
    Dom.css.set(frames, {
        width: "100%", height: "100%", position: "absolute"
    });
    Dom.css3.transformStyle(frames, "preserve-3d");
    Dom.css3.perspective(frames, this._settings.getRotatePerspective());

    scene.appendChild(frames);
    return frames;
}

Gridifier.Api.Rotate.prototype._createItemClone = function(item) {
    var itemClone = item.cloneNode(true);
    this._collector.markItemAsRestrictedToCollect(itemClone);
    Dom.css.set(itemClone, {
        left: "0px",
        top: "0px",
        visibility: "visible",
        width: this._sizesResolverManager.outerWidth(item) + "px",
        height: this._sizesResolverManager.outerHeight(item) + "px"
    });

    return itemClone;
}

Gridifier.Api.Rotate.prototype._addFrameCss = function(frame) {
    Dom.css.set(frame, {
        display: "block", 
        position: "absolute", 
        width: "100%", 
        height: "100%"
    });

    if(!this._settings.getRotateBackface())
        Dom.css3.backfaceVisibility(frame, "hidden");
}

Gridifier.Api.Rotate.prototype._createFrontFrame = function(frames, rotateProp, rotateMatrix) {
    var frontFrame = document.createElement("div");
    this._addFrameCss(frontFrame);
    frames.appendChild(frontFrame);

    Dom.css.set(frontFrame, {zIndex: 2});
    Dom.css3.transitionProperty(frontFrame, Prefixer.getForCSS('transform', frontFrame) + " 0ms " + this._transitionTiming);
    Dom.css3.transformProperty(frontFrame, rotateProp, rotateMatrix + "0deg");

    return frontFrame;
}

Gridifier.Api.Rotate.prototype._createBackFrame = function(frames, rotateProp, rotateMatrix) {
    var backFrame = document.createElement("div");
    this._addFrameCss(backFrame);
    frames.appendChild(backFrame);

    Dom.css3.transitionProperty(backFrame, Prefixer.getForCSS('transform', backFrame) + " 0ms " + this._transitionTiming);
    Dom.css3.transformProperty(backFrame, rotateProp, rotateMatrix + "-180deg");

    return backFrame;
}

Gridifier.Api.Rotate.prototype._initFadeEffect = function(scene, isShowing, isHiding, animationMsDuration) {
    var me = this;

    if(this._rotateFadeType == Gridifier.Api.Rotate.ROTATE_FADE_TYPES.NONE)
        return;
    else if(this._rotateFadeType == Gridifier.Api.Rotate.ROTATE_FADE_TYPES.FULL) {
        if(isShowing) {
            Dom.css3.transition(scene, "none");
            Dom.css3.opacity(scene, 0);
            var targetOpacity = 1;
        }
        else if(isHiding) {
            Dom.css3.transition(scene, "none");
            Dom.css3.opacity(scene, 1);
            var targetOpacity = 0;
        }

        setTimeout(function() {
            Dom.css3.transition(
                scene,
                Prefixer.getForCSS('opacity', scene) + " " + animationMsDuration + "ms " + me._transitionTiming
            );
            Dom.css3.opacity(scene, targetOpacity);
        }, 0);
    }
    else if(this._rotateFadeType == Gridifier.Api.Rotate.ROTATE_FADE_TYPES.ON_HIDE_MIDDLE) {
        if(!isHiding)
            return;

        setTimeout(function () {
            Dom.css3.transition(
                scene,
                Prefixer.getForCSS('opacity', scene) + " " + (animationMsDuration / 2) + "ms " + me._transitionTiming
            );
            Dom.css3.opacity(scene, 0);
        }, animationMsDuration / 2);
    }
}

Gridifier.Api.SizesChanger = function(settings, eventEmitter) {
    var me = this;

    this._settings = null;
    this._eventEmitter = null;

    this._sizesChangerFunction = null;
    this._sizesChangerFunctions = {};

    this._css = {
    };

    this._construct = function() {
        me._settings = settings;
        me._eventEmitter = eventEmitter;

        me._sizesChangerFunctions = {};

        me._addDefaultSizesChanger();
        me._addDefaultPaddingBottomSizesChanger();
        me._addSimultaneousCSS3TransitionSizesChanger();
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

Gridifier.Api.SizesChanger.prototype.setSizesChangerFunction = function(sizesChangerFunctionName) {
    if(!this._sizesChangerFunctions.hasOwnProperty(sizesChangerFunctionName)) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.SET_SIZES_CHANGER_INVALID_PARAM,
            sizesChangerFunctionName
        );
        return;
    }

    this._sizesChangerFunction = this._sizesChangerFunctions[sizesChangerFunctionName];
}

Gridifier.Api.SizesChanger.prototype.addSizesChangerFunction = function(sizesChangerFunctionName, 
                                                                        sizesChangerFunction) {
    this._sizesChangerFunctions[sizesChangerFunctionName] = sizesChangerFunction;
}

Gridifier.Api.SizesChanger.prototype.getSizesChangerFunction = function() {
    return this._sizesChangerFunction;
}

Gridifier.Api.SizesChanger.prototype._addDefaultSizesChanger = function() {
    this._sizesChangerFunctions["default"] = function(item, newWidth, newHeight) {
        if(Dom.isBrowserSupportingTransitions()) {
            Dom.css3.transitionProperty(item, "width 0ms ease");
            Dom.css3.transitionProperty(item, "height 0ms ease");
        }

        Dom.css.set(item, {
            width: newWidth,
            height: newHeight
        });
    };
}

Gridifier.Api.SizesChanger.prototype._addDefaultPaddingBottomSizesChanger = function() {
    this._sizesChangerFunctions["defaultPaddingBottom"] = function(item, newWidth, newPaddingBottom) {
        if(Dom.isBrowserSupportingTransitions()) {
            Dom.css3.transitionProperty(item, "width 0ms ease");
            Dom.css3.transitionProperty(item, "padding-bottom 0ms ease");
        }

        Dom.css.set(item, {
            width: newWidth,
            paddingBottom: newPaddingBottom
        });
    };
}

Gridifier.Api.SizesChanger.prototype._addSimultaneousCSS3TransitionSizesChanger = function() {
    this._sizesChangerFunctions.simultaneousCSS3Transition = function(item, newWidth, newHeight) {
        if(Dom.isBrowserSupportingTransitions()) {
            Dom.css3.transitionProperty(item, "width 500ms ease");
            Dom.css3.transitionProperty(item, "height 500ms ease");
        }

        Dom.css.set(item, {
            width: newWidth,
            height: newHeight
        });
    };
}

Gridifier.Api.Slide = function(settings, gridifier, eventEmitter, sizesResolverManager) {
    var me = this;

    this._settings = null;
    this._gridifier = null;
    this._eventEmitter = null;
    this._sizesResolverManager = null;

    this._css = {
    };

    this._construct = function() {
        me._settings = settings;
        me._gridifier = gridifier;
        me._eventEmitter = eventEmitter;
        me._sizesResolverManager = sizesResolverManager;
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

Gridifier.Api.Slide.prototype._executeSlideShow = function(item, 
                                                           grid, 
                                                           animationMsDuration,
                                                           timeouter,
                                                           eventEmitter,
                                                           coordsChanger,
                                                           collector,
                                                           startLeft,
                                                           startTop,
                                                           connectionLeft,
                                                           connectionTop,
                                                           transitionTiming) {
    var me = this;
    var targetLeft = connectionLeft;
    var targetTop = connectionTop;

    if (!item.hasAttribute(Gridifier.Api.Toggle.IS_TOGGLE_ANIMATION_RUNNING)) {
        coordsChanger(
            item, startLeft, startTop, 0, eventEmitter, false, false, false, false, transitionTiming
        );

        item.setAttribute(Gridifier.Api.Toggle.IS_TOGGLE_ANIMATION_RUNNING, "yes");
    }

    // Setting translated position after 0ms call requires a little delay
    // per browsers repaint(Also it should be enough to propogate NIS item align(20ms))
    var slideOutTimeout = setTimeout(function() {
        if(!me._gridifier.hasItemBindedClone(item))
            item.style.visibility = "visible";

        coordsChanger(
            item, targetLeft, targetTop, animationMsDuration, eventEmitter, false, false, false, false, transitionTiming
        );
    }, 20);
    timeouter.add(item, slideOutTimeout);

    var completeSlideOutTimeout = setTimeout(function() {
        item.removeAttribute(Gridifier.Api.Toggle.IS_TOGGLE_ANIMATION_RUNNING);
        eventEmitter.emitShowEvent(item);

        if(me._gridifier.hasItemBindedClone(item)) {
            coordsChanger(
                item, item.style.left, item.style.top, 0, eventEmitter, false, false, false, false, transitionTiming
            );
        }
    }, animationMsDuration + 40);
    timeouter.add(item, completeSlideOutTimeout);
}

Gridifier.Api.Slide.prototype._executeSlideHide = function(item,
                                                           grid,
                                                           animationMsDuration,
                                                           timeouter,
                                                           eventEmitter,
                                                           coordsChanger,
                                                           collector,
                                                           targetLeft,
                                                           targetTop,
                                                           connectionLeft,
                                                           connectionTop,
                                                           transitionTiming) {
    item.setAttribute(Gridifier.Api.Toggle.IS_TOGGLE_ANIMATION_RUNNING, "yes");
    coordsChanger(
        item, targetLeft, targetTop, animationMsDuration, eventEmitter, false, false, false, false, transitionTiming
    );

    // Hidding item and possibly clone a little before animation def finish(Blink fix)
    var me = this;
    var prehideTimeout = setTimeout(function() {
        item.style.visibility = "hidden";

        if(me._gridifier.hasItemBindedClone(item)) {
            var itemClone = me._gridifier.getItemClone(item);
            itemClone.style.visibility = "hidden";
        }
    }, animationMsDuration);
    timeouter.add(item, prehideTimeout);

    var slideInTimeout = setTimeout(function() {
        item.style.visibility = "hidden";
        item.removeAttribute(Gridifier.Api.Toggle.IS_TOGGLE_ANIMATION_RUNNING);
        eventEmitter.emitHideEvent(item);
    }, animationMsDuration + 20);
    timeouter.add(item, slideInTimeout);
}

Gridifier.Api.Slide.prototype.createHorizontalSlideToggler = function(alignTop, alignBottom, reverseDirection) {
    var me = this;

    var alignTop = alignTop || false;
    var alignBottom = alignBottom || false;

    var isLeftSideToggler = !reverseDirection;
    var isRightSideToggler = reverseDirection;

    var getLeftPos = function(item, grid) {
        if(isLeftSideToggler)
            return me._sizesResolverManager.outerWidth(item, true) * -1;
        else if(isRightSideToggler)
            return me._sizesResolverManager.outerWidth(grid) + me._sizesResolverManager.outerWidth(item, true);
    }

    return {
        "show": function(item, 
                         grid, 
                         animationMsDuration,
                         timeouter,
                         eventEmitter, 
                         sizesResolverManager,
                         coordsChanger,
                         collector,
                         connectionLeft,
                         connectionTop,
                         coordsChangerApi,
                         itemClonesManager,
                         transitionTiming) {
            timeouter.flush(item);
            if(!Dom.isBrowserSupportingTransitions()) {
                item.style.visibility = "visible";
                eventEmitter.emitShowEvent(item);
                return;
            }
            
            if(alignTop)
                var top = 0;
            else if(alignBottom)
                var top = sizesResolverManager.outerHeight(grid) + sizesResolverManager.outerHeight(item, true);
            else
                var top = item.style.top;

            me._executeSlideShow(
                item, 
                grid, 
                animationMsDuration,
                timeouter,
                eventEmitter,
                coordsChanger,
                collector,
                getLeftPos(item, grid) + "px",
                top + "px",
                connectionLeft,
                connectionTop,
                transitionTiming
            );
        },

        "hide": function(item,
                         grid, 
                         animationMsDuration,
                         timeouter,
                         eventEmitter, 
                         sizesResolverManager,
                         coordsChanger,
                         collector,
                         connectionLeft,
                         connectionTop,
                         coordsChangerApi,
                         itemClonesManager,
                         transitionTiming) {
            timeouter.flush(item);
            if(!Dom.isBrowserSupportingTransitions()) {
                item.style.visibility = "hidden";
                eventEmitter.emitHideEvent(item);
                return;
            }

            if(alignTop)
                var top = 0;
            else if(alignBottom)
                var top = sizesResolverManager.outerHeight(grid) + sizesResolverManager.outerHeight(item, true);
            else
                var top = item.style.top;

            me._executeSlideHide(
                item,
                grid,
                animationMsDuration,
                timeouter,
                eventEmitter,
                coordsChanger,
                collector,
                getLeftPos(item, grid) + "px",
                top + "px",
                connectionLeft,
                connectionTop,
                transitionTiming
            );
        }
    };
}

Gridifier.Api.Slide.prototype.createVerticalSlideToggler = function(alignLeft, alignRight, reverseDirection) {
    var me = this;

    var alignLeft = alignLeft || false;
    var alignRight = alignRight || false;

    var isTopSideToggler = !reverseDirection;
    var isBottomSideToggler = reverseDirection;

    var getTopPos = function(item, grid) {
        if(isTopSideToggler)
            return me._sizesResolverManager.outerHeight(item,true) * -1;
        else if(isBottomSideToggler)
            return me._sizesResolverManager.outerHeight(grid) + me._sizesResolverManager.outerHeight(item, true);
    }

    return {
        "show": function(item, 
                         grid, 
                         animationMsDuration,
                         timeouter,
                         eventEmitter, 
                         sizesResolverManager,
                         coordsChanger,
                         collector,
                         connectionLeft,
                         connectionTop,
                         coordsChangerApi,
                         itemClonesManager,
                         transitionTiming) {
            timeouter.flush(item);
            if(!Dom.isBrowserSupportingTransitions()) {
                item.style.visibility = "visible";
                eventEmitter.emitShowEvent(item);
                return;
            }

            if(alignLeft)
                var left = 0;
            else if(alignRight)
                var left = sizesResolverManager.outerWidth(grid) + sizesResolverManager.outerWidth(item, true);
            else
                var left = item.style.left;

            me._executeSlideShow(
                item, 
                grid, 
                animationMsDuration,
                timeouter,
                eventEmitter,
                coordsChanger,
                collector,
                left + "px",
                getTopPos(item, grid) + "px",
                connectionLeft,
                connectionTop,
                transitionTiming
            );
        },

        "hide": function(item,
                         grid, 
                         animationMsDuration,
                         timeouter,
                         eventEmitter, 
                         sizesResolverManager,
                         coordsChanger,
                         collector,
                         connectionLeft,
                         connectionTop,
                         coordsChangerApi,
                         itemClonesManager,
                         transitionTiming) {
            timeouter.flush(item);
            if(!Dom.isBrowserSupportingTransitions()) {
                item.style.visibility = "hidden";
                eventEmitter.emitHideEvent(item);
                return;
            }

            if(alignLeft)
                var left = 0;
            else if(alignRight)
                var left = sizesResolverManager.outerWidth(grid) + sizesResolverManager.outerWidth(item, true);
            else
                var left = item.style.left;

            me._executeSlideHide(
                item,
                grid,
                animationMsDuration,
                timeouter,
                eventEmitter,
                coordsChanger,
                collector,
                left + "px",
                getTopPos(item, grid) + "px",
                connectionLeft,
                connectionTop,
                transitionTiming
            );
        }
    };
}

Gridifier.Api.Sort = function(settings, eventEmitter) {
    var me = this;

    this._settings = null;
    this._eventEmitter = null;

    this._sortFunction = null;
    this._sortFunctions = {};

    this._css = {
    };

    this._construct = function() {
        me._settings = settings;
        me._eventEmitter = eventEmitter;

        me._sortFunctions = {};

        me._addDefaultSort();
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

Gridifier.Api.Sort.prototype.setSortFunction = function(sortFunctionName) {
    if(!this._sortFunctions.hasOwnProperty(sortFunctionName)) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.SET_SORT_INVALID_PARAM,
            sortFunctionName
        );
        return;
    }

    this._sortFunction = this._sortFunctions[sortFunctionName];
}

Gridifier.Api.Sort.prototype.addSortFunction = function(sortFunctionName, sortFunction) {
    this._sortFunctions[sortFunctionName] = sortFunction;
}

Gridifier.Api.Sort.prototype.getSortFunction = function() {
    return this._sortFunction;
}

Gridifier.Api.Sort.prototype._addDefaultSort = function() {
    this._sortFunctions["default"] = function(firstItem, secondItem) {
        var firstItemSortNumber = firstItem.getAttribute(Gridifier.Collector.ITEM_SORTING_INDEX_DATA_ATTR);
        var secondItemSortNumber = secondItem.getAttribute(Gridifier.Collector.ITEM_SORTING_INDEX_DATA_ATTR);

        return parseInt(firstItemSortNumber, 10) - parseInt(secondItemSortNumber, 10);
    };
}

Gridifier.Api.Toggle = function(settings, gridifier, eventEmitter, sizesResolverManager) {
    var me = this;

    this._settings = null;
    this._gridifier = null;
    this._eventEmitter = null;
    this._sizesResolverManager = null;

    this._slideApi = null;
    this._rotateApi = null;

    this._toggleFunction = null;
    this._toggleFunctions = {};

    this._css = {
    };

    this._construct = function() {
        me._settings = settings;
        me._gridifier = gridifier;
        me._eventEmitter = eventEmitter;
        me._sizesResolverManager = sizesResolverManager;

        me._slideApi = new Gridifier.Api.Slide(
            me._settings, me._gridifier, me._eventEmitter, me._sizesResolverManager
        );
        me._rotateApi = new Gridifier.Api.Rotate(
            me._settings, me._eventEmitter, me._sizesResolverManager
        );

        me._toggleFunctions = {};

        me._addSlides();
        me._addRotates();
        me._addScale();
        me._addFade();
        me._addVisibility();
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

Gridifier.Api.Toggle.IS_TOGGLE_ANIMATION_RUNNING = "data-gridifier-toggle-animation-is-running";

Gridifier.Api.Toggle.prototype.setCollectorInstance = function(collector) {
    this._rotateApi.setCollectorInstance(collector);
}

Gridifier.Api.Toggle.prototype.setToggleFunction = function(toggleFunctionName) {
    if(!this._toggleFunctions.hasOwnProperty(toggleFunctionName)) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.SET_TOGGLE_INVALID_PARAM,
            toggleFunctionName
        );
        return;
    }

    this._toggleFunction = this._toggleFunctions[toggleFunctionName];
}

Gridifier.Api.Toggle.prototype.addToggleFunction = function(toggleFunctionName, toggleFunctionData) {
    this._toggleFunctions[toggleFunctionName] = toggleFunctionData;
}

Gridifier.Api.Toggle.prototype.getToggleFunction = function() {
    return this._toggleFunction;
}

Gridifier.Api.Toggle.prototype._addSlides = function() {
    var me = this;

    this._toggleFunctions.slideLeft = this._slideApi.createHorizontalSlideToggler(false, false, false);
    this._toggleFunctions.slideLeftTop = this._slideApi.createHorizontalSlideToggler(true, false, false);
    this._toggleFunctions.slideLeftBottom = this._slideApi.createHorizontalSlideToggler(false, true, false);

    this._toggleFunctions.slideRight = this._slideApi.createHorizontalSlideToggler(false, false, true);
    this._toggleFunctions.slideRightTop = this._slideApi.createHorizontalSlideToggler(true, false, true);
    this._toggleFunctions.slideRightBottom = this._slideApi.createHorizontalSlideToggler(false, true, true);

    this._toggleFunctions.slideTop = this._slideApi.createVerticalSlideToggler(false, false, false);
    this._toggleFunctions.slideTopLeft = this._slideApi.createVerticalSlideToggler(true, false, false);
    this._toggleFunctions.slideTopRight = this._slideApi.createVerticalSlideToggler(false, true, false);

    this._toggleFunctions.slideBottom = this._slideApi.createVerticalSlideToggler(false, false, true);
    this._toggleFunctions.slideBottomLeft = this._slideApi.createVerticalSlideToggler(true, false, true);
    this._toggleFunctions.slideBottomRight = this._slideApi.createVerticalSlideToggler(false, true, true);
}

Gridifier.Api.Toggle.prototype._createRotator = function(rotatorName,
                                                         showRotateApiFunction,
                                                         hideRotateApiFunction,
                                                         rotateMatrixType,
                                                         rotateFadeType) {
    var me = this;

    this._toggleFunctions[rotatorName] = {
        "show": function(item,
                         grid,
                         animationMsDuration,
                         timeouter,
                         eventEmitter,
                         sizesResolverManager,
                         coordsChanger,
                         collector,
                         left,
                         top,
                         coordsChangerApi,
                         itemClonesManager,
                         transitionTiming) {
            timeouter.flush(item);
            if(!Dom.isBrowserSupportingTransitions()) {
                item.style.visibility = "visible";
                eventEmitter.emitShowEvent(item);
                return;
            }

            me._rotateApi.setRotateFadeType(rotateFadeType);
            me._rotateApi.setTransitionTiming(transitionTiming);
            me._rotateApi[showRotateApiFunction](item, grid, rotateMatrixType, timeouter, left, top, itemClonesManager);
        },

        "hide": function(item,
                         grid,
                         animationMsDuration,
                         timeouter,
                         eventEmitter,
                         sizesResolverManager,
                         coordsChanger,
                         collector,
                         left,
                         top,
                         coordsChangerApi,
                         itemClonesManager,
                         transitionTiming) {
            timeouter.flush(item);
            if(!Dom.isBrowserSupportingTransitions()) {
                item.style.visibility = "hidden";
                eventEmitter.emitHideEvent(item);
                return;
            }

            me._rotateApi.setRotateFadeType(rotateFadeType);
            me._rotateApi.setTransitionTiming(transitionTiming);
            me._rotateApi[hideRotateApiFunction](item, grid, rotateMatrixType, timeouter, left, top, itemClonesManager);
        }
    };
}

Gridifier.Api.Toggle.prototype._addRotates = function() {
    var rotatorPostfixes = ["", "WithFade", "WithFadeOut"];
    var rotatorFadeTypes = [
        Gridifier.Api.Rotate.ROTATE_FADE_TYPES.NONE,
        Gridifier.Api.Rotate.ROTATE_FADE_TYPES.FULL,
        Gridifier.Api.Rotate.ROTATE_FADE_TYPES.ON_HIDE_MIDDLE
    ];

    for(var i = 0; i < rotatorPostfixes.length; i++) {
        var postfix = rotatorPostfixes[i];
        var fadeType = rotatorFadeTypes[i];

        this._createRotator("rotate3dX" + postfix, "show3d", "hide3d", Gridifier.Api.Rotate.ROTATE_MATRIX_TYPES.X, fadeType);
        this._createRotator("rotate3dY" + postfix, "show3d", "hide3d", Gridifier.Api.Rotate.ROTATE_MATRIX_TYPES.Y, fadeType);
        this._createRotator("rotate3dZ" + postfix, "show3d", "hide3d", Gridifier.Api.Rotate.ROTATE_MATRIX_TYPES.Z, fadeType);
        this._createRotator("rotate3dXY" + postfix, "show3d", "hide3d", Gridifier.Api.Rotate.ROTATE_MATRIX_TYPES.XY, fadeType);
        this._createRotator("rotate3dXZ" + postfix, "show3d", "hide3d", Gridifier.Api.Rotate.ROTATE_MATRIX_TYPES.XZ, fadeType);
        this._createRotator("rotate3dYZ" + postfix, "show3d", "hide3d", Gridifier.Api.Rotate.ROTATE_MATRIX_TYPES.YZ, fadeType);
        this._createRotator("rotate3dXYZ" + postfix, "show3d", "hide3d", Gridifier.Api.Rotate.ROTATE_MATRIX_TYPES.XYZ, fadeType);

        this._createRotator("rotateX" + postfix, "show", "hide", Gridifier.Api.Rotate.ROTATE_FUNCTION_TYPES.X, fadeType);
        this._createRotator("rotateY" + postfix, "show", "hide", Gridifier.Api.Rotate.ROTATE_FUNCTION_TYPES.Y, fadeType);
        this._createRotator("rotateZ" + postfix, "show", "hide", Gridifier.Api.Rotate.ROTATE_FUNCTION_TYPES.Z, fadeType);
    }
}

Gridifier.Api.Toggle.prototype._addScale = function() {
    var me = this;

    var createScaler = function(beforeScaleShow,
                                onScaleShow,
                                beforeScaleHide,
                                afterScaleHide) {
        return {
            "show":  function(item,
                              grid,
                              animationMsDuration,
                              timeouter,
                              eventEmitter,
                              sizesResolverManager,
                              coordsChanger,
                              collector,
                              connectionLeft,
                              connectionTop,
                              coordsChangerApi,
                              itemClonesManager,
                              transitionTiming) {
                timeouter.flush(item);
                if(!Dom.isBrowserSupportingTransitions()) {
                    item.style.visibility = "visible";
                    eventEmitter.emitShowEvent(item);
                    return;
                }

                itemClonesManager.lockCloneOnToggle(item);

                if(coordsChangerApi.hasTranslateOrTranslate3DTransformSet(item)) {
                    coordsChangerApi.setTransformOriginAccordingToCurrentTranslate(
                        item,
                        connectionLeft,
                        connectionTop,
                        sizesResolverManager.outerWidth(item, true),
                        sizesResolverManager.outerHeight(item, true)
                    );
                }

                if(!item.hasAttribute(Gridifier.Api.Toggle.IS_TOGGLE_ANIMATION_RUNNING)) {
                    Dom.css3.transition(item, "none");
                    beforeScaleShow(item, animationMsDuration, transitionTiming);
                    Dom.css3.transformProperty(item, "scale3d", "0,0,0");
                    item.setAttribute(Gridifier.Api.Toggle.IS_TOGGLE_ANIMATION_RUNNING, "yes");
                }

                var initScaleTimeout = setTimeout(function () {
                    item.style.visibility = "visible";
                    Dom.css3.transition(
                        item,
                        Prefixer.getForCSS('transform', item) + " " + animationMsDuration + "ms " + transitionTiming
                    );
                    Dom.css3.transformProperty(item, "scale3d", "1,1,1");
                    onScaleShow(item, animationMsDuration, transitionTiming);
                }, 40);
                timeouter.add(item, initScaleTimeout);

                var completeScaleTimeout = setTimeout(function () {
                    itemClonesManager.unlockCloneOnToggle(item);
                    coordsChangerApi.resetTransformOrigin(item);

                    item.removeAttribute(Gridifier.Api.Toggle.IS_TOGGLE_ANIMATION_RUNNING);
                    eventEmitter.emitShowEvent(item);
                }, animationMsDuration + 60);
                timeouter.add(item, completeScaleTimeout);
            },

            "hide": function (item,
                              grid,
                              animationMsDuration,
                              timeouter,
                              eventEmitter,
                              sizesResolverManager,
                              coordsChanger,
                              collector,
                              connectionLeft,
                              connectionTop,
                              coordsChangerApi,
                              itemClonesManager,
                              transitionTiming) {
                timeouter.flush(item);
                if(!Dom.isBrowserSupportingTransitions()) {
                    item.style.visibility = "hidden";
                    eventEmitter.emitHideEvent(item);
                    return;
                }

                itemClonesManager.lockCloneOnToggle(item);

                if(coordsChangerApi.hasTranslateOrTranslate3DTransformSet(item)) {
                    coordsChangerApi.setTransformOriginAccordingToCurrentTranslate(
                        item,
                        connectionLeft,
                        connectionTop,
                        sizesResolverManager.outerWidth(item, true),
                        sizesResolverManager.outerHeight(item, true)
                    );
                }

                Dom.css3.transition(
                    item,
                    Prefixer.getForCSS('transform', item) + " " + animationMsDuration + "ms " + transitionTiming
                );

                item.setAttribute(Gridifier.Api.Toggle.IS_TOGGLE_ANIMATION_RUNNING, "yes");
                Dom.css3.transformProperty(item, "scale3d", "0,0,0");
                beforeScaleHide(item, animationMsDuration, transitionTiming);

                if(animationMsDuration > 200)
                    var hideItemTimeout = animationMsDuration - 100;
                else
                    var hideItemTimeout = animationMsDuration - 50;

                if(hideItemTimeout < 0)
                    hideItemTimeout = 0;

                var prehideItemTimeout = setTimeout(function () {
                    item.style.visibility = "hidden";
                    // setTimeout should be smaller than animation duration(Flickering bug in Webkit)
                }, hideItemTimeout);
                timeouter.add(item, prehideItemTimeout);

                var completeScaleTimeout = setTimeout(function () {
                    itemClonesManager.unlockCloneOnToggle(item).hideCloneOnToggle(item);

                    item.style.visibility = "hidden";
                    Dom.css3.transition(item, "none");
                    Dom.css3.transformProperty(item, "scale3d", "1,1,1");
                    afterScaleHide(item, animationMsDuration, transitionTiming);
                    Dom.css3.transition(item, "");

                    coordsChangerApi.resetTransformOrigin(item);

                    item.removeAttribute(Gridifier.Api.Toggle.IS_TOGGLE_ANIMATION_RUNNING);
                    eventEmitter.emitHideEvent(item);
                }, animationMsDuration + 20);
                timeouter.add(item, completeScaleTimeout);
            }
        };
    }

    var voidFunction = function(item, animationMsDuration) { ; };
    this._toggleFunctions.scale = createScaler(voidFunction, voidFunction, voidFunction, voidFunction);
    this._toggleFunctions.scaleWithFade = createScaler(
        function(item, animationMsDuration, transitionTiming) {
            Dom.css3.opacity(item, "0");
        },
        function(item, animationMsDuration, transitionTiming) {
            Dom.css3.transitionProperty(
                item,
                Prefixer.getForCSS('opacity', item) + " " + animationMsDuration + "ms " + transitionTiming
            );
            Dom.css3.opacity(item, 1);
        },
        function(item, animationMsDuration, transitionTiming) {
            Dom.css3.transitionProperty(
                item,
                Prefixer.getForCSS('opacity', item) + " " + animationMsDuration + "ms " + transitionTiming
            );
            Dom.css3.opacity(item, "0");
        },
        function(item, animationMsDuration, transitionTiming) {
            Dom.css3.opacity(item, "1");
        }
    );
}

Gridifier.Api.Toggle.prototype._addFade = function() {
    var me = this;

    this._toggleFunctions.fade = {
        "show": function(item,
                         grid,
                         animationMsDuration,
                         timeouter,
                         eventEmitter,
                         sizesResolverManager,
                         coordsChanger,
                         collector,
                         connectionLeft,
                         connectionTop,
                         coordsChangerApi,
                         itemClonesManager,
                         transitionTiming) {
            timeouter.flush(item);
            if(!Dom.isBrowserSupportingTransitions()) {
                item.style.visibility = "visible";
                eventEmitter.emitShowEvent(item);
                return;
            }

            itemClonesManager.lockCloneOnToggle(item);

            if (!item.hasAttribute(Gridifier.Api.Toggle.IS_TOGGLE_ANIMATION_RUNNING)) {
                Dom.css3.transition(item, "none");
                Dom.css3.opacity(item, "0");
                item.setAttribute(Gridifier.Api.Toggle.IS_TOGGLE_ANIMATION_RUNNING, "yes");
            }

            var initFadeTimeout = setTimeout(function() {
                item.style.visibility = "visible";
                Dom.css3.transition(
                    item,
                    Prefixer.getForCSS('opacity', item) + " " + animationMsDuration + "ms " + transitionTiming
                );
                Dom.css3.opacity(item, 1);
            }, 20);
            timeouter.add(item, initFadeTimeout);

            var completeFadeTimeout = setTimeout(function() {
                itemClonesManager.unlockCloneOnToggle(item);
                item.removeAttribute(Gridifier.Api.Toggle.IS_TOGGLE_ANIMATION_RUNNING);
                eventEmitter.emitShowEvent(item);
            }, animationMsDuration + 40);
            timeouter.add(item, completeFadeTimeout);
        },

        "hide": function(item,
                         grid,
                         animationMsDuration,
                         timeouter,
                         eventEmitter,
                         sizesResolverManager,
                         coordsChanger,
                         collector,
                         connectionLeft,
                         connectionTop,
                         coordsChangerApi,
                         itemClonesManager,
                         transitionTiming) {
            timeouter.flush(item);
            if(!Dom.isBrowserSupportingTransitions()) {
                item.style.visibility = "hidden";
                eventEmitter.emitHideEvent(item);
                return;
            }

            itemClonesManager.lockCloneOnToggle(item);
            Dom.css3.transition(
                item,
                Prefixer.getForCSS('opacity', item) + " " + animationMsDuration + "ms " + transitionTiming
            );

            item.setAttribute(Gridifier.Api.Toggle.IS_TOGGLE_ANIMATION_RUNNING, "yes");
            Dom.css3.opacity(item, "0");

            var executeFadeOutTimeout = setTimeout(function () {
                itemClonesManager.unlockCloneOnToggle(item).hideCloneOnToggle(item);
                item.removeAttribute(Gridifier.Api.Toggle.IS_TOGGLE_ANIMATION_RUNNING);
                item.style.visibility = "hidden";

                Dom.css3.transition(item, "none");
                Dom.css3.opacity(item, "1");
                Dom.css3.transition(item, "");

                eventEmitter.emitHideEvent(item);
            }, animationMsDuration + 20);
            timeouter.add(item, executeFadeOutTimeout);
        }
    };
}

Gridifier.Api.Toggle.prototype._addVisibility = function() {
    var me = this;

    this._toggleFunctions.visibility = {
        "show": function(item, grid, animationMsDuration, timeouter, eventEmitter, sizesResolverManager) {
            timeouter.flush(item);
            item.style.visibility = "visible";
            eventEmitter.emitShowEvent(item);
        },

        "hide": function(item, grid, animationMsDuration, timeouter, eventEmitter, sizesResolverManager) {
            timeouter.flush(item);
            item.style.visibility = "hidden";
            eventEmitter.emitHideEvent(item);
        }
    };
}

Gridifier.Api.ToggleTimeouter = function() {
    var me = this;

    this._css = {
    };

    this._toggleTimeouts = {};
    this._nextToggleTimeouterItemId = 0;

    this._construct = function() {
        me._toggleTimeouts = {};
        me._nextToggleTimeouterItemId = 0;
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

Gridifier.Api.ToggleTimeouter.TOGGLE_TIMEOUTER_ITEM_ID_DATA_ATTR = "data-gridifier-toggle-timeouter-id";

Gridifier.Api.ToggleTimeouter.prototype._markItemWithToggleTimeouterId = function(item) {
    this._nextToggleTimeouterItemId++;
    item.setAttribute(
        Gridifier.Api.ToggleTimeouter.TOGGLE_TIMEOUTER_ITEM_ID_DATA_ATTR,
        this._nextToggleTimeouterItemId
    );
}

Gridifier.Api.ToggleTimeouter.prototype._isItemMarkedWithToggleTimeouterId = function(item) {
    return Dom.hasAttribute(
        item,
        Gridifier.Api.ToggleTimeouter.TOGGLE_TIMEOUTER_ITEM_ID_DATA_ATTR
    );
}

Gridifier.Api.ToggleTimeouter.prototype._getToggleTimeouterItemId = function(item) {
    if(this._isItemMarkedWithToggleTimeouterId(item))
        return item.getAttribute(Gridifier.Api.ToggleTimeouter.TOGGLE_TIMEOUTER_ITEM_ID_DATA_ATTR);

    this._markItemWithToggleTimeouterId(item);
    return item.getAttribute(Gridifier.Api.ToggleTimeouter.TOGGLE_TIMEOUTER_ITEM_ID_DATA_ATTR);
}

Gridifier.Api.ToggleTimeouter.prototype.add = function(item, timeoutHandle) {
    var itemGUID = this._getToggleTimeouterItemId(item);

    if(!this._toggleTimeouts.hasOwnProperty(itemGUID))
        this._toggleTimeouts[itemGUID] = [];

    this._toggleTimeouts[itemGUID].push(timeoutHandle);
}

Gridifier.Api.ToggleTimeouter.prototype.flush = function(item) {
    var itemGUID = this._getToggleTimeouterItemId(item);

    if(typeof window.killNumber == "undefined")
        window.killNumber = 0;
    window.killNumber++;

    if(this._toggleTimeouts.hasOwnProperty(itemGUID)) {
        for(var i = 0; i < this._toggleTimeouts[itemGUID].length; i++) {
            clearTimeout(this._toggleTimeouts[itemGUID][i]);
        }

        this._toggleTimeouts[itemGUID] = [];
    }
}

Gridifier.Connections = function(gridifier,
                                 connections,
                                 guid,
                                 connectionsSorter,
                                 sizesResolverManager) {
    var me = this;

    this._gridifier = null;
    this._connections = null;
    this._guid = null;
    this._sizesTransformer = null;
    this._connectionsSorter = null;
    this._sizesResolverManager = null;
    this._connectedItemMarker = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._connections = connections;
        me._guid = guid;
        me._connectionsSorter = connectionsSorter;
        me._sizesResolverManager = sizesResolverManager;
        me._connectedItemMarker = new Gridifier.ConnectedItemMarker();
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

Gridifier.Connections.prototype.getMaxX2 = function() {
    var connections = this._connections.get();

    if(connections.length == 0)
        return 0;
    
    var maxX2 = 0;
    for(var i = 0; i < connections.length; i++) {
        if(connections[i].x2 > maxX2)
            maxX2 = connections[i].x2;
    }

    return maxX2;
}

Gridifier.Connections.prototype.getMaxY2 = function() {
    var connections = this._connections.get();

    if(connections.length == 0)
        return 0;

    var maxY2 = 0;
    for(var i = 0; i < connections.length; i++) {
        if(connections[i].y2 > maxY2)
            maxY2 = connections[i].y2;
    }

    return maxY2;
}

Gridifier.Connections.prototype.setSizesTransformerInstance = function(sizesTransformer) {
    this._sizesTransformer = sizesTransformer;
}

Gridifier.Connections.prototype.findConnectionByItem = function(item, disableWasItemFoundValidation) {
    var connections = this._connections.get();

    if(!disableWasItemFoundValidation) {
        if(connections.length == 0)
            new Gridifier.Error(Gridifier.Error.ERROR_TYPES.CONNECTIONS.NO_CONNECTIONS);
    }

    var itemGUID = this._guid.getItemGUID(item);
    var connectionItem = null;
    for(var i = 0; i < connections.length; i++) {
        if(itemGUID == this._guid.getItemGUID(connections[i].item))
            connectionItem = connections[i];
    }

    if(connectionItem == null) {
        if(!this._sizesTransformer.isTransformerQueueEmpty()) {
            var queuedConnections = this._sizesTransformer.getQueuedConnectionsPerTransform();
            for(var i = 0; i < queuedConnections.length; i++) {
                if(itemGUID == queuedConnections[i].itemGUID)
                    connectionItem = queuedConnections[i];
            }
        }
    }

    if(!disableWasItemFoundValidation) {
        if(connectionItem == null) {
            new Gridifier.Error(
                Gridifier.Error.ERROR_TYPES.CONNECTIONS.CONNECTION_BY_ITEM_NOT_FOUND,
                {item: item, connections: connections}
            );
        }
    }

    return connectionItem;
}

Gridifier.Connections.prototype.remapAllItemGUIDS = function() {
    this._guid.reinit();

    var connections = this._connectionsSorter.sortConnectionsPerReappend(this._connections.get());
    for(var i = 0; i < connections.length; i++) {
        var newConnectionItemGUID = this._guid.markNextAppendedItem(connections[i].item);
        connections[i].itemGUID = newConnectionItemGUID;
    }
}

Gridifier.Connections.prototype.remapAllItemGUIDSInSortedConnections = function(connections) {
    for(var i = 0; i < connections.length; i++) {
        var newConnectionItemGUID = this._guid.markNextAppendedItem(connections[i].item);
        connections[i].itemGUID = newConnectionItemGUID;
    }
}

Gridifier.Connections.prototype.getConnectionsByItemGUIDS = function(itemGUIDS) {
    var connections = this._connections.get();
    var foundConnections = [];

    for(var i = 0; i < connections.length; i++) {
        for(var j = 0; j < itemGUIDS.length; j++) {
            if(connections[i].itemGUID == itemGUIDS[j]) {
                foundConnections.push(connections[i]);
                break;
            }
        }
    }

    return foundConnections;
}

Gridifier.Connections.prototype.createItemConnection = function(item, itemConnectionCoords) {
    var connection = itemConnectionCoords;
    connection.item = item;
    connection.itemGUID = Dom.toInt(this._guid.getItemGUID(item));

    if(!connection.hasOwnProperty("horizontalOffset"))
        connection.horizontalOffset = 0;
    if(!connection.hasOwnProperty("verticalOffset"))
        connection.verticalOffset = 0;
    if(!connection.hasOwnProperty(Gridifier.SizesTransformer.RESTRICT_CONNECTION_COLLECT))
        connection[Gridifier.SizesTransformer.RESTRICT_CONNECTION_COLLECT] = false;

    if(!this._connectedItemMarker.isItemConnected(item))
        this._connectedItemMarker.markItemAsConnected(item);

    return connection;
}

Gridifier.Connections.prototype.syncConnectionParams = function(connectionsData) {
    var connections = this._connections.get();

    for(var i = 0; i < connectionsData.length; i++) {
        for(var j = 0; j < connections.length; j++) {
            if(connections[j].itemGUID == connectionsData[i].itemGUID) {
                var restrictCollect = Gridifier.SizesTransformer.RESTRICT_CONNECTION_COLLECT;

                connections[j][restrictCollect] = connectionsData[i][restrictCollect];
                connections[j].verticalOffset = connectionsData[i].verticalOffset;
                connections[j].horizontalOffset = connectionsData[i].horizontalOffset;
                connections[j].x1 = connectionsData[i].x1;
                connections[j].x2 = connectionsData[i].x2;
                connections[j].y1 = connectionsData[i].y1;
                connections[j].y2 = connectionsData[i].y2;

                break;
            }
        }
    }
}

Gridifier.Connections.prototype.getMinConnectionWidth = function() {
    var connections = this._connections.get();

    if(connections.length == 0)
        return 0;

    var me = this;
    var gridX2 = this._gridifier.getGridX2();

    // Sometimes fast dragging breaks coordinates of some connections.
    // In such cases we should recalculate connection item width.
    var getConnectionWidth = function(i) {
        if(connections[i].x1 >= connections[i].x2 || connections[i].x1 < 0
            || connections[i].x2 > gridX2) {
            var connectionWidth = me._sizesResolverManager.outerWidth(connections[i].item, true);
        }
        else {
            var connectionWidth = connections[i].x2 - connections[i].x1 + 1;
        }

        return connectionWidth;
    };

    var minConnectionWidth = getConnectionWidth(0);
    for(var i = 1; i < connections.length; i++) {
        var connectionWidth = getConnectionWidth(i);
        if(connectionWidth < minConnectionWidth)
            minConnectionWidth = connectionWidth;
    }

    return minConnectionWidth;
}

Gridifier.Connections.prototype.getMinConnectionHeight = function() {
    var connections = this._connections.get();

    if(connections.length == 0)
        return 0;

    var me = this;
    var gridY2 = this._gridifier.getGridY2();

    // Sometimes fast dragging breaks coordinates of some connections.
    // In such cases we should recalculate connection item height.
    var getConnectionHeight = function(i) {
        if(connections[i].y1 >= connections[i].y2 || connections[i].y1 < 0
            || connections[i].y2 > gridY2) {
            var connectionHeight = me._sizesResolverManager.outerHeight(connections[i].item, true);
        }
        else {
            var connectionHeight = connections[i].y2 - connections[i].y1 + 1;
        }

        return connectionHeight;
    };

    var minConnectionHeight = getConnectionHeight(0);
    for(var i = 1; i < connections.length; i++) {
        var connectionHeight = getConnectionHeight(i);
        if(connectionHeight < minConnectionHeight)
            minConnectionHeight = connectionHeight;
    }

    return minConnectionHeight;
}


Gridifier.Connections.prototype.isAnyConnectionItemGUIDSmallerThan = function(comparableConnections, 
                                                                              item) {
    var connectionItemGUID = this._guid.getItemGUID(item);

    for(var i = 0; i < comparableConnections.length; i++) {
        var comparableConnectionItemGUID = this._guid.getItemGUID(comparableConnections[i].item);
        if(comparableConnectionItemGUID < connectionItemGUID)
            return true;
    }

    return false;
}

Gridifier.Connections.prototype.isAnyConnectionItemGUIDBiggerThan = function(comparableConnections,
                                                                             item) {
    var connectionItemGUID = this._guid.getItemGUID(item);

    for(var i = 0; i < comparableConnections.length; i++) {
        var comparableConnectionItemGUID = this._guid.getItemGUID(comparableConnections[i].item);
        if(comparableConnectionItemGUID > connectionItemGUID)
            return true;
    }

    return false;
}

Gridifier.ConnectionsIntersector = function(connections) {
    var me = this;

    this._connections = null;

    this._css = {
    };

    this._construct = function() {
        me._connections = connections;
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

Gridifier.ConnectionsIntersector.prototype.isIntersectingAnyConnection = function(maybeIntersectableConnections, itemCoords) {
    for(var i = 0; i < maybeIntersectableConnections.length; i++) {
        var maybeIntersectableConnection = maybeIntersectableConnections[i];

        var isAbove = (itemCoords.y1 < maybeIntersectableConnection.y1 && itemCoords.y2 < maybeIntersectableConnection.y1);
        var isBelow = (itemCoords.y1 > maybeIntersectableConnection.y2 && itemCoords.y2 > maybeIntersectableConnection.y2);
        var isBefore = (itemCoords.x1 < maybeIntersectableConnection.x1 && itemCoords.x2 < maybeIntersectableConnection.x1);
        var isBehind = (itemCoords.x1 > maybeIntersectableConnection.x2 && itemCoords.x2 > maybeIntersectableConnection.x2);

        if(!isAbove && !isBelow && !isBefore && !isBehind)
            return true;
    }

    return false;
}

Gridifier.ConnectionsIntersector.prototype.getAllConnectionsWithIntersectedCenter = function(maybeIntersectionCoords) {
    var connections = this._connections.get();
    var connectionsWithIntersectedCenter = [];

    for(var i = 0; i < connections.length; i++) {
        var connectionWidth = connections[i].x2 - connections[i].x1 + 1;
        var connectionHeight = connections[i].y2 - connections[i].y1 + 1;

        var connectionCenterCoords = {
            x1: connections[i].x1 + connectionWidth / 2,
            x2: connections[i].x1 + connectionWidth / 2,
            y1: connections[i].y1 + connectionHeight / 2,
            y2: connections[i].y1 + connectionHeight / 2
        };
        
        if(this.isIntersectingAnyConnection([connectionCenterCoords], maybeIntersectionCoords)) {
            connectionsWithIntersectedCenter.push(connections[i]);
        }
    }

    return connectionsWithIntersectedCenter;
}

Gridifier.Connectors = function(guid, connections) {
    var me = this;

    this._guid = null;
    this._connections = null;

    this._connectors = [];

    this._nextFlushCallback = null;

    this._css = {
    };

    this._construct = function() {
        me._guid = guid;
        me._connections = connections;
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

Gridifier.Connectors.INITIAL_CONNECTOR_ITEM_GUID = -1;

Gridifier.Connectors.TYPES = {
    APPEND: {
        DEFAULT: "appendDefault", REVERSED: "appendReversed"
    }, 
    PREPEND: {
        DEFAULT: "prependDefault", REVERSED: "prependReversed"
    }
};

Gridifier.Connectors.SIDES = {
    LEFT: {TOP: "leftTop", BOTTOM: "leftBottom"},
    BOTTOM: {RIGHT: "bottomRight", LEFT: "bottomLeft"},
    RIGHT: {TOP: "rightTop", BOTTOM: "rightBottom"},
    TOP: {LEFT: "topLeft", RIGHT: "topRight"}
};

Gridifier.Connectors.isLeftTopSideConnector = function(connector) {
    return connector.side == Gridifier.Connectors.SIDES.LEFT.TOP;
}

Gridifier.Connectors.isLeftBottomSideConnector = function(connector) {
    return connector.side == Gridifier.Connectors.SIDES.LEFT.BOTTOM;
}

Gridifier.Connectors.isBottomRightSideConnector = function(connector) {
    return connector.side == Gridifier.Connectors.SIDES.BOTTOM.RIGHT;
}

Gridifier.Connectors.isBottomLeftSideConnector = function(connector) {
    return connector.side == Gridifier.Connectors.SIDES.BOTTOM.LEFT;
}

Gridifier.Connectors.isRightTopSideConnector = function(connector) {
    return connector.side == Gridifier.Connectors.SIDES.RIGHT.TOP;
}

Gridifier.Connectors.isRightBottomSideConnector = function(connector) {
    return connector.side == Gridifier.Connectors.SIDES.RIGHT.BOTTOM;
}

Gridifier.Connectors.isTopLeftSideConnector = function(connector) {
    return connector.side == Gridifier.Connectors.SIDES.TOP.LEFT;
}

Gridifier.Connectors.isTopRightSideConnector = function(connector) {
    return connector.side == Gridifier.Connectors.SIDES.TOP.RIGHT;
}

Gridifier.Connectors.isInitialConnector = function(connector) {
    return connector.itemGUID == Gridifier.Connectors.INITIAL_CONNECTOR_ITEM_GUID;
}

Gridifier.Connectors.prototype._addConnector = function(type, side, x, y, itemGUID) {
    if(typeof itemGUID == "undefined")
        var itemGUID = Gridifier.Connectors.INITIAL_CONNECTOR_ITEM_GUID;

    this._connectors.push({
        type: type,
        side: side,
        x: x,
        y: y,
        itemGUID: itemGUID
    });
}

Gridifier.Connectors.prototype.addAppendConnector = function(side, x, y, itemGUID) {
    this._addConnector(Gridifier.Connectors.TYPES.APPEND.DEFAULT, side, x, y, itemGUID);
}

Gridifier.Connectors.prototype.addReversedAppendConnector = function(side, x, y, itemGUID) {
    this._addConnector(Gridifier.Connectors.TYPES.APPEND.REVERSED, side, x, y, itemGUID);
}

Gridifier.Connectors.prototype.addPrependConnector = function(side, x, y, itemGUID) {
    this._addConnector(Gridifier.Connectors.TYPES.PREPEND.DEFAULT, side, x, y, itemGUID);
}

Gridifier.Connectors.prototype.addReversedPrependConnector = function(side, x, y, itemGUID) {
    this._addConnector(Gridifier.Connectors.TYPES.PREPEND.REVERSED, side, x, y, itemGUID);
}

Gridifier.Connectors.prototype.count = function() {
    return this._connectors.length;
}

Gridifier.Connectors.prototype.setNextFlushCallback = function(callbackFn) {
    this._nextFlushCallback = callbackFn;
}

Gridifier.Connectors.prototype.flush = function() {
    this._connectors = [];

    if(typeof this._nextFlushCallback == "function") {
        this._nextFlushCallback();
        this._nextFlushCallback = null;
    }
}

Gridifier.Connectors.prototype.get = function() {
    return this._connectors;
}

Gridifier.Connectors.prototype.set = function(connectors) {
    this._connectors = connectors;
}

Gridifier.Connectors.prototype.getClone = function() {
    var connectorsClone = [];
    for(var i = 0; i < this._connectors.length; i++) {
        connectorsClone.push({
            type: this._connectors[i].type,
            side: this._connectors[i].side,
            x: this._connectors[i].x,
            y: this._connectors[i].y,
            itemGUID: this._connectors[i].itemGUID,
            connectorIndex: i
        });
    }

    return connectorsClone;
}

Gridifier.ConnectorsIntersector = function(connections, settings) {
    var me = this;

    this._connections = null;
    this._settings = null;

    this._css = {
    };

    this._construct = function() {
        me._connections = connections;
        me._settings = settings;
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

Gridifier.ConnectorsIntersector.prototype.getMostLeftFromIntersectedRightItems = function(connector) {
    var connections = this._connections.get();
    var mostLeftConnection = null;

    var connectionFinder = function(connection) {
        if(connector.y >= connection.y1 && connector.y <= connection.y2 
            && connector.x < connection.x1) {
            if(mostLeftConnection == null)
                mostLeftConnection = connection;
            else {
                if(connection.x1 < mostLeftConnection.x1)
                    mostLeftConnection = connection;
            }
        }
    }

    if(this._settings.isVerticalGrid()) {
        var intersectedConnectionIndexes = this._connections.getAllHorizontallyIntersectedConnections(connector);
        for(var i = 0; i < intersectedConnectionIndexes.length; i++) {
            connectionFinder(connections[intersectedConnectionIndexes[i]]);
        }
    }
    else if(this._settings.isHorizontalGrid()) {
        var intersectedConnectionIndexes = this._connections.getAllVerticallyIntersectedAndRightConnections(connector);
        for(var i = 0; i < intersectedConnectionIndexes.length; i++) {
            for(var j = 0; j < intersectedConnectionIndexes[i].length; j++) {
                connectionFinder(connections[intersectedConnectionIndexes[i][j]]);
            }
        }
    }

    return mostLeftConnection;
}

Gridifier.ConnectorsIntersector.prototype.getMostBottomFromIntersectedTopOrTopLeftItems = function(connector) {
    var connections = this._connections.get();
    var mostBottomConnection = null;

    if(this._settings.isVerticalGrid())
        var intersectedConnectionIndexes = this._connections.getAllHorizontallyIntersectedAndUpperConnections(connector);
    else if(this._settings.isHorizontalGrid())
        var intersectedConnectionIndexes = this._connections.getAllVerticallyIntersectedAndLeftConnections(connector);

    for(var i = 0; i < intersectedConnectionIndexes.length; i++) {
        for(var j = 0; j < intersectedConnectionIndexes[i].length; j++) {
            var connection = connections[intersectedConnectionIndexes[i][j]];

            if(((connector.x >= connection.x1 && connector.x <= connection.x2) || (connector.x > connection.x2))
                && connector.y > connection.y2) {
                if(mostBottomConnection == null)
                    mostBottomConnection = connection;
                else {
                    if(connection.y2 > mostBottomConnection.y2)
                        mostBottomConnection = connection;
                }
            }
        }
    }

    return mostBottomConnection;
}

Gridifier.ConnectorsIntersector.prototype.getMostBottomFromIntersectedTopOrTopRightItems = function(connector) {
    var connections = this._connections.get();
    var mostBottomConnection = null;

    if(this._settings.isVerticalGrid())
        var intersectedConnectionIndexes = this._connections.getAllHorizontallyIntersectedAndUpperConnections(connector);
    else if(this._settings.isHorizontalGrid())
        var intersectedConnectionIndexes = this._connections.getAllVerticallyIntersectedAndRightConnections(connector);

    for(var i = 0; i < intersectedConnectionIndexes.length; i++) {
        for(var j = 0; j < intersectedConnectionIndexes[i].length; j++) {
            var connection = connections[intersectedConnectionIndexes[i][j]];

            if(((connector.x >= connection.x1 && connector.x <= connection.x2) || (connector.x < connection.x1))
                && connector.y > connection.y2) {
                if(mostBottomConnection == null)
                    mostBottomConnection = connection;
                else {
                    if(connection.y2 > mostBottomConnection.y2)
                        mostBottomConnection = connection;
                }
            }
        }
    }
}

Gridifier.ConnectorsIntersector.prototype.getMostRightFromIntersectedLeftItems = function(connector) {
    var connections = this._connections.get();
    var mostRightConnection = null;

    var connectionFinder = function(connection) {
        if(connector.y >= connection.y1 && connector.y <= connection.y2
            && connector.x > connection.x2) {
            if(mostRightConnection == null)
                mostRightConnection = connection;
            else {
                if(connection.x > mostRightConnection.x2)
                    mostRightConnection = connection;
            }
        }
    }

    if(this._settings.isVerticalGrid()) {
        var intersectedConnectionIndexes = this._connections.getAllHorizontallyIntersectedConnections(connector);
        for(var i = 0; i < intersectedConnectionIndexes.length; i++) {
            connectionFinder(connections[intersectedConnectionIndexes[i]]);
        }
    }
    else if(this._settings.isHorizontalGrid()) {
        var intersectedConnectionIndexes = this._connections.getAllVerticallyIntersectedAndLeftConnections(connector);
        for(var i = 0; i < intersectedConnectionIndexes.length; i++) {
            for(var j = 0; j < intersectedConnectionIndexes[i].length; j++) {
                connectionFinder(connections[intersectedConnectionIndexes[i][j]]);
            }
        }
    }

    return mostRightConnection;
}

Gridifier.ConnectorsIntersector.prototype.getMostTopFromIntersectedBottomOrBottomRightItems = function(connector) {
    var connections = this._connections.get();
    var mostTopConnection = null;

    if(this._settings.isVerticalGrid())
        var intersectedConnectionIndexes = this._connections.getAllHorizontallyIntersectedAndLowerConnections(connector);
    else if(this._settings.isHorizontalGrid())
        var intersectedConnectionIndexes = this._connections.getAllVerticallyIntersectedAndRightConnections(connector);

    for(var i = 0; i < intersectedConnectionIndexes.length; i++) {
        for(var j = 0; j < intersectedConnectionIndexes[i].length; j++) {
            var connection = connections[intersectedConnectionIndexes[i][j]];

            if(((connector.x >= connection.x1 && connector.x <= connection.x2) || (connector.x < connection.x1))
                && connector.y < connection.y1) {
                if(mostTopConnection == null)
                    mostTopConnection = connection;
                else {
                    if(connection.y1 < mostTopConnection.y1)
                        mostTopConnection = connection;
                }
            }
        }
    }

    return mostTopConnection;
}

Gridifier.ConnectorsIntersector.prototype.getMostTopFromIntersectedBottomOrBottomLeftItems = function(connector) {
    var connections = this._connections.get();
    var mostTopConnection = null;

    if(this._settings.isVerticalGrid())
        var intersectedConnectionIndexes = this._connections.getAllHorizontallyIntersectedAndLowerConnections(connector);
    else if(this._settings.isHorizontalGrid())
        var intersectedConnectionIndexes = this._connections.getAllVerticallyIntersectedAndLeftConnections(connector);

    for(var i = 0; i < intersectedConnectionIndexes.length; i++) {
        for(var j = 0; j < intersectedConnectionIndexes[i].length; j++) {
            var connection = connections[intersectedConnectionIndexes[i][j]];

            if(((connector.x >= connection.x1 && connector.x <= connection.x2) || (connector.x > connection.x2))
                && connector.y < connection.y1) {
                if(mostTopConnection == null)
                    mostTopConnection = connection;
                else {
                    if(connection.y1 < mostTopConnection.y1)
                        mostTopConnection = connection;
                }
            }
        }
    }

    return mostTopConnection;
}

Gridifier.ConnectorsShifter = function(gridifier, connections, settings) {
    var me = this;

    this._gridifier = null;
    this._connections = null;
    this._settings = null;

    this._connectorsIntersector = null;
    this._ci = null;

    this._connectors = null;
    this._shiftedConnectors = [];
    this._allConnectors = [];

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._connections = connections;
        me._settings = settings;

        me._connectorsIntersector = new Gridifier.ConnectorsIntersector(
            me._connections, me._settings
        );
        me._ci = me._connectorsIntersector;
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

Gridifier.ConnectorsShifter.SIDE = "shifted";

Gridifier.ConnectorsShifter.prototype.attachConnectors = function(connectors) {
    this._connectors = connectors;
    this._shifterConnectors = [];
    this._allConnectors = [];
}

Gridifier.ConnectorsShifter.prototype.getAllConnectors = function() {
    return this._allConnectors;
}

Gridifier.ConnectorsShifter.prototype._createShiftedConnector = function(x, y, connector) {
    var shiftedConnector = {
        type: connector.type,
        side: Gridifier.ConnectorsShifter.SIDE,
        x: parseFloat(x),
        y: parseFloat(y),
        itemGUID: Dom.toInt(connector.itemGUID)
    };
    
    this._shiftedConnectors.push(shiftedConnector);
    this._allConnectors.push(shiftedConnector);
}

Gridifier.ConnectorsShifter.prototype.shiftAllConnectors = function() {
    for(var i = 0; i < this._connectors.length; i++) {
        this._allConnectors.push(this._connectors[i]);

        if(Gridifier.Connectors.isLeftTopSideConnector(this._connectors[i])) {
            this._shiftLeftTopConnector(this._connectors[i]);
        }
        else if(Gridifier.Connectors.isLeftBottomSideConnector(this._connectors[i])) {
            this._shiftLeftBottomConnector(this._connectors[i]);
        }
        else if(Gridifier.Connectors.isBottomRightSideConnector(this._connectors[i])) {
            this._shiftBottomRightConnector(this._connectors[i]);
        }
        else if(Gridifier.Connectors.isBottomLeftSideConnector(this._connectors[i])) {
            // Same logic as in shift top left
            this._shiftTopLeftConnector(this._connectors[i]);
        }
        else if(Gridifier.Connectors.isTopLeftSideConnector(this._connectors[i])) {
            this._shiftTopLeftConnector(this._connectors[i]);
        }
        else if(Gridifier.Connectors.isTopRightSideConnector(this._connectors[i])) {
            // Same logic as in shift bottom right
            this._shiftBottomRightConnector(this._connectors[i]);
        }
        else if(Gridifier.Connectors.isRightBottomSideConnector(this._connectors[i])) {
            this._shiftRightBottomConnector(this._connectors[i]);
        }
        else if(Gridifier.Connectors.isRightTopSideConnector(this._connectors[i])) {
            this._shiftRightTopConnector(this._connectors[i]);
        }
    }
}

Gridifier.ConnectorsShifter.prototype._shiftLeftTopConnector = function(connector) {
    var mostBottomConnection = this._ci.getMostBottomFromIntersectedTopOrTopLeftItems(connector);

    if(mostBottomConnection != null) {
        if(mostBottomConnection.y2 + 1 != connector.y) 
            this._createShiftedConnector(connector.x, mostBottomConnection.y2 + 1, connector);
    }
    else {
        if(connector.y != 0) 
            this._createShiftedConnector(connector.x, 0, connector);
    }
}

Gridifier.ConnectorsShifter.prototype._shiftLeftBottomConnector = function(connector) {
    var mostTopConnection = this._ci.getMostTopFromIntersectedBottomOrBottomLeftItems(connector);

    if(mostTopConnection != null) {
        if(mostTopConnection.y1 - 1 != connector.y)
            this._createShiftedConnector(connector.x, mostTopConnection.y1 - 1, connector);
    }
    else {
        var maxYFromAllConnections = this._connections.getMaxYFromAllConnections();
        if(maxYFromAllConnections != 0) {
            if(maxYFromAllConnections - 1 != connector.y) 
                this._createShiftedConnector(connector.x, maxYFromAllConnections - 1, connector);
        }
    }
}

Gridifier.ConnectorsShifter.prototype._shiftBottomRightConnector = function(connector) {
    var mostLeftConnection = this._ci.getMostLeftFromIntersectedRightItems(connector);

    if(mostLeftConnection != null) {
        if(mostLeftConnection.x1 - 1 != connector.x)
            this._createShiftedConnector(mostLeftConnection.x1 - 1, connector.y, connector);
    }
    else {
        if(connector.x != this._gridifier.getGridX2())
            this._createShiftedConnector(this._gridifier.getGridX2(), connector.y, connector);
    }
}

Gridifier.ConnectorsShifter.prototype._shiftTopLeftConnector = function(connector) {
    var mostRightConnection = this._ci.getMostRightFromIntersectedLeftItems(connector);

    if(mostRightConnection != null) {
        if((mostRightConnection.x2 + 1) != connector.x)
            this._createShiftedConnector(mostRightConnection.x2 + 1, connector.y, connector);
    }
    else {
        if(connector.x != 0) 
            this._createShiftedConnector(0, connector.y, connector);
    }
}

Gridifier.ConnectorsShifter.prototype._shiftRightBottomConnector = function(connector) {
    var mostTopConnection = this._ci.getMostTopFromIntersectedBottomOrBottomRightItems(connector);

    if(mostTopConnection != null) {
        if((mostTopConnection.y1 - 1) != connector.y)
            this._createShiftedConnector(connector.x, mostTopConnection.y1 - 1, connector);
    }
    else {
        var maxYFromAllConnections = this._connections.getMaxYFromAllConnections();
        if(maxYFromAllConnections != 0) {
            if(maxYFromAllConnections - 1 != connector.y) 
                this._createShiftedConnector(connector.x, maxYFromAllConnections - 1, connector);
        }
    }
}

Gridifier.ConnectorsShifter.prototype._shiftRightTopConnector = function(connector) {
    var mostBottomConnection = this._ci.getMostBottomFromIntersectedTopOrTopRightItems(connector);

    if(mostBottomConnection != null) {
        if((mostBottomConnection.y2 + 1) != connector.y)
            this._createShiftedConnector(connector.x, mostBottomConnection.y2 + 1, connector);
    }
    else {
        if(connector.y != 0) {
            this._createShiftedConnector(connector.x, 0, connector);
        }
    }
}

Gridifier.ConnectorsShifter.prototype.shiftAllWithSpecifiedSideToRightGridCorner = function(side) {
    this._allConnectors = this._connectors;
    for(var i = 0; i < this._allConnectors.length; i++) {
        if(this._allConnectors[i].side == side)
            this._allConnectors[i].x = this._gridifier.getGridX2();
    }
}

Gridifier.ConnectorsShifter.prototype.shiftAllWithSpecifiedSideToLeftGridCorner = function(side) {
    this._allConnectors = this._connectors;
    for(var i = 0; i < this._allConnectors.length; i++) {
        if(this._allConnectors[i].side == side)
            this._allConnectors[i].x = 0;
    }
}

Gridifier.ConnectorsShifter.prototype.shiftAllWithSpecifiedSideToTopGridCorner = function(side) {
    this._allConnectors = this._connectors;
    for(var i = 0; i < this._allConnectors.length; i++) {
        if(this._allConnectors[i].side == side)
            this._allConnectors[i].y = 0;
    }
}

Gridifier.ConnectorsShifter.prototype.shiftAllWithSpecifiedSideToBottomGridCorner = function(side) {
    this._allConnectors = this._connectors;
    for(var i = 0; i < this._allConnectors.length; i++) {
        if(this._allConnectors[i].side == side)
            this._allConnectors[i].y = this._gridifier.getGridY2();
    }
}

Gridifier.TransformerConnectors = function(gridifier,
                                           settings,
                                           connectors,
                                           connections,
                                           guid,
                                           appender,
                                           reversedAppender,
                                           normalizer,
                                           sizesTransformer,
                                           connectorsCleaner,
                                           transformedItemMarker,
                                           operation) {
    var me = this;

    this._gridifier = null;
    this._settings = null;
    this._connectors = null;
    this._connections = null;
    this._guid = null;
    this._appender = null;
    this._reversedAppender = null;
    this._normalizer = null;
    this._sizesTransformer = null;

    this._connectorsCleaner = null;
    this._transformedItemMarker = null;
    this._itemsReappender = null;
    this._operation = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._settings = settings;
        me._connectors = connectors;
        me._connections = connections;
        me._guid = guid;
        me._appender = appender;
        me._reversedAppender = reversedAppender;
        me._normalizer = normalizer;
        me._sizesTransformer = sizesTransformer;
        me._connectorsCleaner = connectorsCleaner;
        me._transformedItemMarker = transformedItemMarker;
        me._operation = operation;
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

Gridifier.TransformerConnectors.prototype.setItemsReappenderInstance = function(itemsReappender) {
    this._itemsReappender = itemsReappender;
}

Gridifier.TransformerConnectors.prototype.recreateConnectorsPerFirstItemReappendOnTransform = function(firstItemToReappend,
                                                                                                       firstConnectionToReappend) {
    if(this._itemsReappender.isReversedAppendShouldBeUsedPerItemInsert(firstItemToReappend)) {
        this._operation.setLastOperation(Gridifier.OPERATIONS.REVERSED_APPEND);
        this._recreateConnectorsPerReversedItemReappend(firstItemToReappend, firstConnectionToReappend);
    }
    else {
        this._operation.setLastOperation(Gridifier.OPERATIONS.APPEND);
        this._recreateConnectorsPerDefaultItemReappend(firstItemToReappend, firstConnectionToReappend);
    }
}

Gridifier.TransformerConnectors.prototype._recreateConnectorsPerReversedItemReappend = function(firstItemToReappend,
                                                                                                firstConnectionToReappend) {
    this._connections.reinitRanges();
    this._reversedAppender.recreateConnectorsPerAllConnectedItems();

    if(this._settings.isVerticalGrid()) {
        this._connectorsCleaner.deleteAllIntersectedFromBottomConnectors();
    }
    else if(this._settings.isHorizontalGrid()) {
        this._connectorsCleaner.deleteAllIntersectedFromRightConnectors();
    }

}

Gridifier.TransformerConnectors.prototype._recreateConnectorsPerDefaultItemReappend = function(firstItemToReappend,
                                                                                               firstConnectionToReappend) {
    this._connections.reinitRanges();
    this._appender.recreateConnectorsPerAllConnectedItems();
    
    if(this._settings.isVerticalGrid()) {
        this._connectorsCleaner.deleteAllIntersectedFromBottomConnectors();
    }
    else if(this._settings.isHorizontalGrid()) {
        this._connectorsCleaner.deleteAllIntersectedFromRightConnectors();
    }

}

Gridifier.Collector = function(settings, grid, sizesResolverManager) {
    var me = this;

    this._settings = null;
    this._grid = null;
    this._sizesResolverManager = null;

    this._collectorFunction = null;
    this._markingFunction = null;

    this._connectedItemMarker = null;

    this._css = {
    };

    this._construct = function() {
        me._settings = settings;
        me._grid = grid;
        me._sizesResolverManager = sizesResolverManager;

        me._createCollectorFunction();
        me._createMarkingFunction();

        me._connectedItemMarker = new Gridifier.ConnectedItemMarker();
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

Gridifier.Collector.ITEM_SORTING_INDEX_DATA_ATTR = "data-gridifier-item-sorting-index";
Gridifier.Collector.RESTRICT_ITEM_COLLECT_DATA_ATTR = "data-gridifier-item-restrict-collect";

Gridifier.Collector.prototype._createCollectorFunction = function() {
    var gridItemMarkingValue = this._settings.getGridItemMarkingType();

    var me = this;
    if(this._settings.isByClassGridItemMarkingStrategy()) {
        this._collectorFunction = function(grid) {
            var items = Dom.get.byQuery(grid, "." + gridItemMarkingValue);
            return me.filterNotRestrictedToCollectItems(items);
        }
    }
    else if(this._settings.isByDataAttrGridItemMarkingStrategy()) {
        this._collectorFunction = function(grid) {
            var items = Dom.get.byQuery(
                grid, 
                "[" + Gridifier.GRID_ITEM_MARKING_DEFAULTS.DATA_ATTR + "=" + gridItemMarkingValue + "]"
            );
            return me.filterNotRestrictedToCollectItems(items);
        }
    }
    else if(this._settings.isByQueryGridItemMarkingStrategy()) {
        this._collectorFunction = function(grid) {
            var items = Dom.get.byQuery(grid, gridItemMarkingValue);
            return me.filterNotRestrictedToCollectItems(items);
        }
    }
}

Gridifier.Collector.prototype._createMarkingFunction = function() {
    var gridItemMarkingValue = this._settings.getGridItemMarkingType();

    if(this._settings.isByClassGridItemMarkingStrategy()) {
        this._markingFunction = function(item) {
            if(!Dom.css.hasClass(item, gridItemMarkingValue))
                Dom.css.addClass(item, gridItemMarkingValue);
        }
    }
    else if(this._settings.isByDataAttrGridItemMarkingStrategy()) {
        this._markingFunction = function(item) {
            item.setAttribute(
                Gridifier.GRID_ITEM_MARKING_DEFAULTS.DATA_ATTR, 
                gridItemMarkingValue
            );
        }
    }
    else if(this._settings.isByQueryGridItemMarkingStrategy()) {
        this._markingFunction = function(item) {
            ;
        }
    }
}

Gridifier.Collector.prototype.attachToGrid = function(items) {
    if(!Dom.isArray(items))
        var items = [items];
    
    for(var i = 0; i < items.length; i++) {
        Dom.css.set(items[i], {
            position: "absolute"
        });

        if(!this._settings.shouldDisableItemHideOnGridAttach())
            Dom.css.set(items[i], {"visibility": "hidden"});
    }
    for(var i = 0; i < items.length; i++)
        this._markingFunction(items[i]);
}

Gridifier.Collector.prototype.ensureAllItemsAreAttachedToGrid = function(items) {
    for(var i = 0; i < items.length; i++) {
        if(!Dom.isChildOf(items[i], this._grid)) {
            new Gridifier.Error(
                Gridifier.Error.ERROR_TYPES.COLLECTOR.ITEM_NOT_ATTACHED_TO_GRID,
                items[i]
            );
        }
    }
}

Gridifier.Collector.prototype.ensureAllItemsAreConnectedToGrid = function(items) {
    for(var i = 0; i < items.length; i++) {
        if(!this._connectedItemMarker.isItemConnected(items[i])) {
            new Gridifier.Error(
                Gridifier.Error.ERROR_TYPES.COLLECTOR.ITEM_NOT_CONNECTED_TO_GRID,
                items[i]
            );
        }
    }
}

Gridifier.Collector.prototype._isItemWiderThanGridWidth = function(item) {
    return Math.floor(this._sizesResolverManager.outerWidth(item, true)) > this._sizesResolverManager.outerWidth(this._grid, false, true);
}

Gridifier.Collector.prototype._isItemTallerThanGridHeight = function(item) {
    return Math.floor(this._sizesResolverManager.outerHeight(item, true)) > this._sizesResolverManager.outerHeight(this._grid, false, true);
}

Gridifier.Collector.prototype.canItemBeAttachedToGrid = function(item) {
    if(this._settings.isVerticalGrid())
        return !this._isItemWiderThanGridWidth(item);
    else if(this._settings.isHorizontalGrid())
        return !this._isItemTallerThanGridHeight(item);
}

Gridifier.Collector.prototype.throwWrongItemSizesError = function(item) {
    if(this._settings.isVerticalGrid()) {
        var errorParam = {
            item: item, 
            itemWidth: this._sizesResolverManager.outerWidth(item, true),
            gridWidth: this._sizesResolverManager.outerWidth(this._grid, false, true)
        };

        var errorType = Gridifier.Error.ERROR_TYPES.COLLECTOR.ITEM_WIDER_THAN_GRID_WIDTH;
    }
    else if(this._settings.isHorizontalGrid()) {
        var errorParam = {
            item: item,
            itemHeight: this._sizesResolverManager.outerHeight(item, true),
            gridHeight: this._sizesResolverManager.outerHeight(this._grid, false, true)
        };

        var errorType = Gridifier.Error.ERROR_TYPES.COLLECTOR.ITEM_TALLER_THAN_GRID_HEIGHT;
    }

    new Gridifier.Error(errorType, errorParam);
}

Gridifier.Collector.prototype.ensureAllItemsCanBeAttachedToGrid = function(items) {
    for(var i = 0; i < items.length; i++) {
        if(!this.canItemBeAttachedToGrid(items[i])) {
            this.throwWrongItemSizesError(items[i]);
        }
    }
}

Gridifier.Collector.prototype.collect = function() {
    var items = this._collectorFunction(this._grid);
    return items;
}

Gridifier.Collector.prototype.collectByQuery = function(query) {
   var items = Dom.get.byQuery(this._grid, query);
   return this.filterNotRestrictedToCollectItems(items);
}

Gridifier.Collector.prototype.collectAllConnectedItems = function() {
    var items = this._collectorFunction(this._grid);

    var connectedItems = [];
    for(var i = 0; i < items.length; i++) {
        if(this._connectedItemMarker.isItemConnected(items[i]))
            connectedItems.push(items[i]);
    }

    return connectedItems;
}

Gridifier.Collector.prototype.collectAllDisconnectedItems = function() {
    var items = this._collectorFunction(this._grid);

    var disconnectedItems = [];
    for(var i = 0; i < items.length; i++) {
        if(!this._connectedItemMarker.isItemConnected(items[i]))
            disconnectedItems.push(items[i]);
    }

    return disconnectedItems;
}

Gridifier.Collector.prototype.toDOMCollection = function(items) {
    var createNotDomElementError = function(errorParam) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.COLLECTOR.NOT_DOM_ELEMENT, errorParam
        );
    }

    if(Dom.isJqueryObject(items)) {
        var DOMItems = [];
        for(var i = 0; i < items.length; i++)
            DOMItems.push(items.get(i));

        return DOMItems;
    }

    if(Dom.isNativeDOMObject(items)) {
        var DOMItems = [];
        DOMItems.push(items);

        return DOMItems;
    }
    
    if(Dom.isArray(items)) {
        for(var i = 0; i < items.length; i++) {
            if(Dom.isJqueryObject(items[i]))
                items[i] = items[i].get(0);

            if(!Dom.isNativeDOMObject(items[i])) {
                createNotDomElementError(items[i]);
            }
        }

        return items;
    }
    else {
        createNotDomElementError(items);
    }
}

Gridifier.Collector.prototype.filterCollection = function(items) {
    var filter = this._settings.getFilter();
    var filteredItems = [];

    for(var i = 0; i < items.length; i++) {
        if(filter(items[i]))
            filteredItems.push(items[i]);
    }

    return filteredItems;
}

Gridifier.Collector.prototype.sortCollection = function(items) {
    for(var i = 0; i < items.length; i++) {
        items[i].setAttribute(Gridifier.Collector.ITEM_SORTING_INDEX_DATA_ATTR, i);
    }

    items.sort(this._settings.getSort());

    for(var i = 0; i < items.length; i++) {
        items[i].removeAttribute(Gridifier.Collector.ITEM_SORTING_INDEX_DATA_ATTR);
    }

    return items;
}

Gridifier.Collector.prototype.filterNotRestrictedToCollectItems = function(items) {
    var filteredItems = [];
    for(var i = 0; i < items.length; i++) {
        if(Dom.hasAttribute(items[i], Gridifier.Collector.RESTRICT_ITEM_COLLECT_DATA_ATTR))
            continue;

        filteredItems.push(items[i]);
    }

    return filteredItems;
}

Gridifier.Collector.prototype.markItemAsRestrictedToCollect = function(item) {
    item.setAttribute(Gridifier.Collector.RESTRICT_ITEM_COLLECT_DATA_ATTR, "restricted");
}

Gridifier.Collector.prototype.unmarkItemAsRestrictedToCollect = function(item) {
    if(Dom.hasAttribute(item, Gridifier.Collector.RESTRICT_ITEM_COLLECT_DATA_ATTR))
        item.removeAttribute(Gridifier.Collector.RESTRICT_ITEM_COLLECT_DATA_ATTR);
}

Gridifier.Collector.prototype.filterOnlyConnectedItems = function(maybeConnectedItems) {
    var connectedItems = [];
    for(var i = 0; i < maybeConnectedItems.length; i++) {
        if(this._connectedItemMarker.isItemConnected(maybeConnectedItems[i]))
            connectedItems.push(maybeConnectedItems[i]);
    }

    return connectedItems;
}

Gridifier.ConnectedItemMarker = function() {
    var me = this;

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

Gridifier.ConnectedItemMarker.CONNECTED_ITEM_DATA_CLASS = "gridifier-connected-item";

Gridifier.ConnectedItemMarker.prototype.markItemAsConnected = function(item) {
    Dom.css.addClass(
        item,
        Gridifier.ConnectedItemMarker.CONNECTED_ITEM_DATA_CLASS
    );
}

Gridifier.ConnectedItemMarker.prototype.isItemConnected = function(item) {
    return Dom.css.hasClass(
        item,
        Gridifier.ConnectedItemMarker.CONNECTED_ITEM_DATA_CLASS
    );
}

Gridifier.ConnectedItemMarker.prototype.unmarkItemAsConnected = function(item) {
    Dom.css.removeClass(item, Gridifier.ConnectedItemMarker.CONNECTED_ITEM_DATA_CLASS);
}

Gridifier.Disconnector = function(gridifier,
                                  collector,
                                  connections,
                                  connectors,
                                  settings,
                                  guid,
                                  appender,
                                  reversedAppender) {
    var me = this;

    this._gridifier = null;
    this._collector = null;
    this._connections = null;
    this._connectors = null;
    this._settings = null;
    this._guid = null;
    this._connectedItemMarker = null;
    this._appender = null;
    this._reversedAppender = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._collector = collector;
        me._connections = connections;
        me._connectors = connectors;
        me._settings = settings;
        me._guid = guid;
        me._connectedItemMarker = new Gridifier.ConnectedItemMarker();
        me._appender = appender;
        me._reversedAppender = reversedAppender;
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

// Soft disconnect is used in filters.(After hard disconnect items
//  shouldn't show on filter show)
Gridifier.Disconnector.DISCONNECT_TYPES = {SOFT: 0, HARD: 1};

Gridifier.Disconnector.prototype.disconnect = function(items, disconnectType) {
    var items = this._collector.toDOMCollection(items);
    this._collector.ensureAllItemsAreConnectedToGrid(items);

    var disconnectType = disconnectType || Gridifier.Disconnector.DISCONNECT_TYPES.SOFT;
    if(disconnectType == Gridifier.Disconnector.DISCONNECT_TYPES.HARD) {
        for(var i = 0; i < items.length; i++)
            this._collector.markItemAsRestrictedToCollect(items[i]);
    }

    var connectionsToDisconnect = this._findConnectionsToDisconnect(items);
    for(var i = 0; i < connectionsToDisconnect.length; i++) {
        this._connections.removeConnection(connectionsToDisconnect[i]);
        this._guid.removeItemGUID(connectionsToDisconnect[i].item);
    }
    if(this._connections.get().length == 0)
        this._recreateConnectors();
    
    for(var i = 0; i < connectionsToDisconnect.length; i++)
        this._connectedItemMarker.unmarkItemAsConnected(connectionsToDisconnect[i].item);

    this._connections.reinitRanges();
    
    var renderer = this._gridifier.getRenderer();
    renderer.hideConnections(connectionsToDisconnect);
}

Gridifier.Disconnector.prototype._findConnectionsToDisconnect = function(items) {
    var connectionsToDisconnect = [];

    for(var i = 0; i < items.length; i++) {
        var itemConnection = this._connections.findConnectionByItem(items[i]);
        connectionsToDisconnect.push(itemConnection);
    }

    return connectionsToDisconnect;
}

// We should recreate connectors on connections.length == 0,
// because retransformAllSizes will exit before recreating transformerConnectors.
Gridifier.Disconnector.prototype._recreateConnectors = function() {
    this._connectors.flush();

    if(this._settings.isDefaultAppend()) {
        this._appender.createInitialConnector();
    }
    else if(this._settings.isReversedAppend()) {
        this._reversedAppender.createInitialConnector();
    }
}

Gridifier.EventEmitter = function(gridifier) {
    var me = this;

    me._gridifier = null;

    me._showCallbacks = [];
    me._hideCallbacks = [];
    me._gridSizesChangeCallbacks = [];
    me._transformCallbacks = [];
    me._gridRetransformCallbacks = [];
    me._connectionCreateCallbacks = [];

    me._dragEndCallbacks = [];

    me._kernelCallbacks = {
        itemsReappendExecutionEndPerDragifier: null
    };

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._bindEmitterToGridifier();
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

Gridifier.EventEmitter.prototype._bindEmitterToGridifier = function() {
    var me = this;
    this._gridifier.onShow = function(callbackFn) { me.onShow.call(me, callbackFn); };
    this._gridifier.onHide = function(callbackFn) { me.onHide.call(me, callbackFn); };
    this._gridifier.onGridSizesChange = function(callbackFn) { me.onGridSizesChange.call(me, callbackFn); };
    this._gridifier.onTransform = function(callbackFn) { me.onTransform.call(me, callbackFn); };
    this._gridifier.onGridRetransform = function(callbackFn) { me.onGridRetransform.call(me, callbackFn); };
    this._gridifier.onConnectionCreate = function(callbackFn) { me.onConnectionCreate.call(me, callbackFn); };

    this._gridifier.onDragEnd = function(callbackFn) { me.onDragEnd.call(me, callbackFn); };
}

Gridifier.EventEmitter.prototype.onShow = function(callbackFn) {
    this._showCallbacks.push(callbackFn);
}

Gridifier.EventEmitter.prototype.onHide = function(callbackFn) {
    this._hideCallbacks.push(callbackFn);
}

Gridifier.EventEmitter.prototype.onTransform = function(callbackFn) {
    this._transformCallbacks.push(callbackFn);
}

Gridifier.EventEmitter.prototype.onGridRetransform = function(callbackFn) {
    this._gridRetransformCallbacks.push(callbackFn);
}

Gridifier.EventEmitter.prototype.onGridSizesChange = function(callbackFn) {
    this._gridSizesChangeCallbacks.push(callbackFn);
}

Gridifier.EventEmitter.prototype.onConnectionCreate = function(callbackFn) {
    this._connectionCreateCallbacks.push(callbackFn);
}

Gridifier.EventEmitter.prototype.onDragEnd = function(callbackFn) {
    this._dragEndCallbacks.push(callbackFn);
}

Gridifier.EventEmitter.prototype.onItemsReappendExecutionEndPerDragifier = function(callbackFn) {
    this._kernelCallbacks.itemsReappendExecutionEndPerDragifier = callbackFn;
}

Gridifier.EventEmitter.prototype.emitShowEvent = function(item) {
    for(var i = 0; i < this._showCallbacks.length; i++) {
        this._showCallbacks[i](item);

        if(this._gridifier.hasItemBindedClone(item)) {
            var itemClone = this._gridifier.getItemClone(item);
            this._showCallbacks[i](item);
        }
    }
}

Gridifier.EventEmitter.prototype.emitHideEvent = function(item) {
    for(var i = 0; i < this._hideCallbacks.length; i++) {
        this._hideCallbacks[i](item);

        if(this._gridifier.hasItemBindedClone(item)) {
            var itemClone = this._gridifier.getItemClone(item);
            this._hideCallbacks[i](item);
        }
    }
}

Gridifier.EventEmitter.prototype.emitGridSizesChangeEvent = function() {
    for(var i = 0; i < this._gridSizesChangeCallbacks.length; i++) {
        this._gridSizesChangeCallbacks[i]();
    }
}

Gridifier.EventEmitter.prototype.emitTransformEvent = function(item, newWidth, newHeight, newLeft, newTop) {
    for(var i = 0; i < this._transformCallbacks.length; i++) {
        this._transformCallbacks[i](item, newWidth, newHeight, newLeft, newTop);
    }
}

Gridifier.EventEmitter.prototype.emitGridRetransformEvent = function() {
    for(var i = 0; i < this._gridRetransformCallbacks.length; i++) {
        this._gridRetransformCallbacks[i]();
    }
}

Gridifier.EventEmitter.prototype.emitConnectionCreateEvent = function(connections) {
    for(var i = 0; i < this._connectionCreateCallbacks.length; i++) {
        this._connectionCreateCallbacks[i](connections);
    }
}

Gridifier.EventEmitter.prototype.emitDragEndEvent = function(sortedItems) {
    for(var i = 0; i < this._dragEndCallbacks.length; i++) {
        this._dragEndCallbacks[i](sortedItems);
    }
}

Gridifier.EventEmitter.prototype.emitItemsReappendExecutionEndPerDragifier = function() {
    if(this._kernelCallbacks.itemsReappendExecutionEndPerDragifier != null) {
        this._kernelCallbacks.itemsReappendExecutionEndPerDragifier();
        this._kernelCallbacks.itemsReappendExecutionEndPerDragifier = null;
    }
}

Gridifier.Filtrator = function(gridifier,
                               collector,
                               connections,
                               settings,
                               guid,
                               disconnector) {
    var me = this;

    this._gridifier = null;
    this._collector = null;
    this._connections = null;
    this._settings = null;
    this._guid = null;
    this._connectedItemMarker = null;
    this._disconnector = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._collector = collector;
        me._connections = connections;
        me._settings = settings;
        me._guid = guid;
        me._connectedItemMarker = new Gridifier.ConnectedItemMarker();
        me._disconnector = disconnector;
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

Gridifier.Filtrator.prototype.filter = function() {
    var allItems = this._collector.collect();
    var connectedItems = this._collector.collectAllConnectedItems();
    var disconnectedItems = this._collector.collectAllDisconnectedItems();

    var allItemsToShow = this._collector.sortCollection(this._collector.filterCollection(allItems));
    var connectedItemsToShow = this._collector.filterCollection(connectedItems);
    var disconnectedItemsToShow = this._collector.filterCollection(disconnectedItems);
    var connectedItemsToHide = this._findConnectedItemsToHide(connectedItems);

    this._disconnector.disconnect(connectedItemsToHide);
    this._recreateGUIDS(allItemsToShow);
    this._recreateConnections(allItemsToShow);
}

Gridifier.Filtrator.prototype._findConnectedItemsToHide = function(connectedItems) {
    var connectedItemsToHide = [];

    for(var i = 0; i < connectedItems.length; i++) {
        var filteredItems = this._collector.filterCollection([connectedItems[i]]);
        if(filteredItems.length == 0)
            connectedItemsToHide.push(connectedItems[i]);
    }

    return connectedItemsToHide;
}

Gridifier.Filtrator.prototype._recreateGUIDS = function(orderedPerAppendItems) {
    this._guid.reinit();
    for(var i = 0; i < orderedPerAppendItems.length; i++) {
        this._guid.markNextAppendedItem(orderedPerAppendItems[i]);
    }
}

Gridifier.Filtrator.prototype._recreateConnections = function(allItemsToShow) {
    var connections = this._connections.get();
    connections.splice(0, connections.length);

    // Created connections should be correctly parsed by SizesTransformer sorter.
    if(this._settings.isHorizontalGrid()) {
        this._recreateAllHorizontalGridConnectionsPerReappend(allItemsToShow);
    }
    else if(this._settings.isVerticalGrid()) {
        this._recreateAllVerticalGridConnectionsPerReappend(allItemsToShow);
    }
}

Gridifier.Filtrator.prototype._recreateAllHorizontalGridConnectionsPerReappend = function(allItemsToShow) {
    var nextFakeX = 0;

    for(var i = 0; i < allItemsToShow.length; i++) {
        var itemToShowFakeCoords = {};
        itemToShowFakeCoords.x1 = nextFakeX;
        itemToShowFakeCoords.x2 = nextFakeX;
        itemToShowFakeCoords.y1 = 0;
        itemToShowFakeCoords.y2 = 0;

        this._connections.add(allItemsToShow[i], itemToShowFakeCoords);
        nextFakeX++;
    }
}

Gridifier.Filtrator.prototype._recreateAllVerticalGridConnectionsPerReappend = function(allItemsToShow) {
    var nextFakeY = 0;

    for(var i = 0; i < allItemsToShow.length; i++) {
        var itemToShowFakeCoords = {};
        itemToShowFakeCoords.x1 = 0;
        itemToShowFakeCoords.x2 = 0;
        itemToShowFakeCoords.y1 = nextFakeY;
        itemToShowFakeCoords.y2 = nextFakeY;
        
        this._connections.add(allItemsToShow[i], itemToShowFakeCoords);
        nextFakeY++;
    }
}

Gridifier.GUID = function() {
    var me = this;

    this._maxItemGUID = 9999;
    this._minItemGUID = 10000;
    this._firstPrependedItemGUID = null;

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

Gridifier.GUID.GUID_DATA_ATTR = "data-gridifier-item-id";

Gridifier.GUID.prototype.reinit = function() {
    this._maxItemGUID = 9999;
    this._minItemGUID = 10000;
}

Gridifier.GUID.prototype.reinitMaxGUID = function(newMaxGUID) {
    if(typeof newMaxGUID == "undefined" || newMaxGUID == null)
        this._maxItemGUID = 9999;
    else
        this._maxItemGUID = newMaxGUID;
}

Gridifier.GUID.prototype.getItemGUID = function(item) { 
    return Dom.toInt(item.getAttribute(Gridifier.GUID.GUID_DATA_ATTR));
}

Gridifier.GUID.prototype.setItemGUID = function(item, itemGUID) {
    return item.setAttribute(
        Gridifier.GUID.GUID_DATA_ATTR, itemGUID
    );
}

Gridifier.GUID.prototype.removeItemGUID = function(item) {
    item.removeAttribute(Gridifier.GUID.GUID_DATA_ATTR);
}

Gridifier.GUID.prototype.markNextAppendedItem = function(item) {
    this._maxItemGUID++;
    item.setAttribute(Gridifier.GUID.GUID_DATA_ATTR, this._maxItemGUID);

    return this._maxItemGUID;
}

Gridifier.GUID.prototype.markNextPrependedItem = function(item) {
    this._minItemGUID--;
    item.setAttribute(Gridifier.GUID.GUID_DATA_ATTR, this._minItemGUID);

    return this._minItemGUID;
}

Gridifier.GUID.prototype.markAsPrependedItem = function(item) {
    if(this._firstPrependedItemGUID != null)
        return;

    this._firstPrependedItemGUID = item.getAttribute(Gridifier.GUID.GUID_DATA_ATTR);
}

Gridifier.GUID.prototype.unmarkAllPrependedItems = function() {
    this._firstPrependedItemGUID = null;
}

Gridifier.GUID.prototype.wasItemPrepended = function(itemGUID) {
    if(this._firstPrependedItemGUID == null)
        return false;

    return Dom.toInt(itemGUID) <= this._firstPrependedItemGUID;
}

Gridifier.ItemClonesManager = function(grid, collector, connections, sizesResolverManager) {
   var me = this;

   this._grid = null;
   this._collector = null;
   this._connections = null;
   this._sizesResolverManager = null;

   this._itemClones = [];
   this._nextBindingId = 0;

   this._css = {
   };

   this._construct = function() {
      me._grid = grid;
      me._collector = collector;
      me._connections = connections;
      me._sizesResolverManager = sizesResolverManager;

      me._itemClones = [];

      me._bindEvents();
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

Gridifier.ItemClonesManager.ITEM_CLONE_MARKING_DATA_ATTR = "data-gridifier-clones-manager-item-clone";
Gridifier.ItemClonesManager.CLONES_MANAGER_BINDING_DATA_ATTR = "data-gridifier-clones-manager-binding";

Gridifier.ItemClonesManager.prototype.createClone = function(item) {
   var itemClone = item.cloneNode(true);
   itemClone.setAttribute(Gridifier.ItemClonesManager.ITEM_CLONE_MARKING_DATA_ATTR, "item-clone");
   itemClone.style.visibility = "hidden";
   
   this._collector.markItemAsRestrictedToCollect(itemClone);
   this._grid.getGrid().appendChild(itemClone);

   if(item.style.zIndex.length == 0) {
      itemClone.style.zIndex = 0;
      item.style.zIndex = 1;
   }
   else {
      var currentItemZIndex = item.style.zIndex;

      if(currentItemZIndex == 0) {
          itemClone.style.zIndex = 0;
          item.style.zIndex = 1;
      }
      else {
          itemClone.style.zIndex = 0;
      }
   }

   this._nextBindingId++;
   item.setAttribute(Gridifier.ItemClonesManager.CLONES_MANAGER_BINDING_DATA_ATTR, this._nextBindingId);
   itemClone.setAttribute(Gridifier.ItemClonesManager.CLONES_MANAGER_BINDING_DATA_ATTR, this._nextBindingId);

   this._itemClones.push(itemClone);
}

Gridifier.ItemClonesManager.prototype.unfilterClones = function(maybeItems) {
    maybeItems = this._collector.toDOMCollection(maybeItems);
    var items = [];

    for(var i = 0; i < maybeItems.length; i++) {
        if(this.isItemClone(maybeItems[i]))
            continue;

        items.push(maybeItems[i]);
    }

    return items;
}

Gridifier.ItemClonesManager.prototype.isItemClone = function(maybeItemClone) {
   return Dom.hasAttribute(maybeItemClone, Gridifier.ItemClonesManager.ITEM_CLONE_MARKING_DATA_ATTR);
}

Gridifier.ItemClonesManager.prototype.hasBindedClone = function(item) {
   return Dom.hasAttribute(item, Gridifier.ItemClonesManager.CLONES_MANAGER_BINDING_DATA_ATTR);
}

Gridifier.ItemClonesManager.prototype.getBindedClone = function(item) {
   var bindedClone = null;

   for(var i = 0; i < this._itemClones.length; i++) {
      if(this._itemClones[i].getAttribute(Gridifier.ItemClonesManager.CLONES_MANAGER_BINDING_DATA_ATTR)
         == item.getAttribute(Gridifier.ItemClonesManager.CLONES_MANAGER_BINDING_DATA_ATTR)) {
          bindedClone = this._itemClones[i];
          break;
      }
   }

   if(bindedClone == null)
      throw new Error("Gridifier error: binded clone not found(on bind). (Did you forgot to call setItemClonesManagerLifecycleCallbacks()?", item);

   return bindedClone;
}

Gridifier.ItemClonesManager.prototype.getOriginalItemFromClone = function(itemClone) {
    var connections = this._connections.get();
    for(var i = 0; i < connections.length; i++) {
        if(connections[i].item.getAttribute(Gridifier.ItemClonesManager.CLONES_MANAGER_BINDING_DATA_ATTR) ==
            itemClone.getAttribute(Gridifier.ItemClonesManager.CLONES_MANAGER_BINDING_DATA_ATTR))
            return connections[i].item;
    }

    return null;
}

Gridifier.ItemClonesManager.prototype.destroyClone = function(item) {
   var bindedClone = null;

   for(var i = 0; i < this._itemClones.length; i++) {
      if(this._itemClones[i].getAttribute(Gridifier.ItemClonesManager.CLONES_MANAGER_BINDING_DATA_ATTR)
         == item.getAttribute(Gridifier.ItemClonesManager.CLONES_MANAGER_BINDING_DATA_ATTR)) {
         bindedClone = this._itemClones[i];
         this._itemClones.splice(i, 1);
         break;
      }
   }

   if(bindedClone == null) 
      throw new Error("Gridifier error: binded clone not found(on destroy). ", item);
   
   this._grid.getGrid().removeChild(bindedClone);
   item.removeAttribute(Gridifier.ItemClonesManager.CLONES_MANAGER_BINDING_DATA_ATTR);
}

Gridifier.ItemClonesManager.prototype.lockCloneOnToggle = function(item) {
    if(!this.hasBindedClone(item))
        return this;

    var itemClone = this.getBindedClone(item);
    itemClone.setAttribute(
        Gridifier.Api.CoordsChanger.CSS3_TRANSLATE_3D_CLONES_RESTRICT_CLONE_SHOW_DATA_ATTR,
        "yes"
    );

    return this;
}

Gridifier.ItemClonesManager.prototype.unlockCloneOnToggle = function(item) {
    if(!this.hasBindedClone(item))
        return this;

    var itemClone = this.getBindedClone(item);
    itemClone.removeAttribute(
        Gridifier.Api.CoordsChanger.CSS3_TRANSLATE_3D_CLONES_RESTRICT_CLONE_SHOW_DATA_ATTR
    );

    return this;
}

Gridifier.ItemClonesManager.prototype.hideCloneOnToggle = function(item) {
    if(!this.hasBindedClone(item))
        return;

    var itemClone = this.getBindedClone(item);
    if(itemClone.style.visibility == "visible")
        itemClone.style.visibility = "hidden";

    return this;
}

Gridifier.ItemClonesManager.prototype.getConnectionItemAtPoint = function(x, y) {
    x = parseFloat(x) - this._sizesResolverManager.offsetLeft(this._grid.getGrid());
    y = parseFloat(y) - this._sizesResolverManager.offsetTop(this._grid.getGrid());

    var connections = this._connections.get();
    for(var i = 0; i < connections.length; i++) {
        if(x >= connections[i].x1 && x <= connections[i].x2 &&
            y >= connections[i].y1 && y <= connections[i].y2)
            return connections[i].item;
    }

    return null;
}

Gridifier.Iterator = function(settings, collector, connections, connectionsSorter, guid) {
    var me = this;

    this._settings = null;
    this._collector = null;
    this._connections = null;
    this._connectionsSorter = null;
    this._guid = null;

    this._css = {
    };

    this._construct = function() {
        me._settings = settings;
        me._collector = collector;
        me._connections = connections;
        me._connectionsSorter = connectionsSorter;
        me._guid = guid;
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

Gridifier.Iterator.prototype.getFirst = function() {
    var connections = this._connections.get();
    if(connections.length == 0)
        return null;

    connections = this._connectionsSorter.sortConnectionsPerReappend(connections);
    return connections[0].item;
}

Gridifier.Iterator.prototype.getLast = function() {
    var connections = this._connections.get();
    if(connections.length == 0)
        return null;

    connections = this._connectionsSorter.sortConnectionsPerReappend(connections);
    return connections[connections.length - 1].item;
}

Gridifier.Iterator.prototype.getNext = function(item) {
    var items = this._collector.toDOMCollection(item);
    item = items[0];

    var connections = this._connections.get();
    if(connections.length == 0)
        return null;

    connections = this._connectionsSorter.sortConnectionsPerReappend(connections);
    for(var i = 0; i < connections.length; i++) {
        if(this._guid.getItemGUID(connections[i].item) == this._guid.getItemGUID(item)) {
            if(i + 1 > connections.length - 1)
                return null;

            return connections[i + 1].item;
        }
    }

    return null;
}

Gridifier.Iterator.prototype.getPrev = function(item) {
    var items = this._collector.toDOMCollection(item);
    item = items[0];

    var connections = this._connections.get();
    if(connections.length == 0)
        return null;

    connections = this._connectionsSorter.sortConnectionsPerReappend(connections);
    for(var i = connections.length - 1; i >= 0; i--) {
        if(this._guid.getItemGUID(connections[i].item) == this._guid.getItemGUID(item)) {
            if(i - 1 < 0)
                return null;

            return connections[i - 1].item;
        }
    }

    return null;
}

Gridifier.LifecycleCallbacks = function(collector) {
   var me = this;

   this._collector = null;

   this._preInsertCallbacks = [];
   this._preDisconnectCallbacks = [];

   this._css = {
   };

   this._construct = function() {
      me._collector = collector;

      me._insertCallbacks = [];
      me._disconnectCallbacks = [];

      this._bindEvents();
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

Gridifier.LifecycleCallbacks.prototype.addPreInsertCallback = function(callback) {
   this._preInsertCallbacks.push(callback);
}

Gridifier.LifecycleCallbacks.prototype.addPreDisconnectCallback = function(callback) {
   this._preDisconnectCallbacks.push(callback);
}

Gridifier.LifecycleCallbacks.prototype.executePreInsertCallbacks = function(items) {
   var items = this._collector.toDOMCollection(items);
   
   for(var i = 0; i < this._preInsertCallbacks.length; i++) {
      this._preInsertCallbacks[i](items);
   }
}

Gridifier.LifecycleCallbacks.prototype.executePreDisconnectCallbacks = function(items) {
   var items = this._collector.toDOMCollection(items);
   
   for(var i = 0; i < this._preDisconnectCallbacks.length; i++) {
      this._preDisconnectCallbacks[i](items);
   }
}

Gridifier.Normalizer = function(gridifier, sizesResolverManager) {
    var me = this;

    this._gridifier = null;
    this._sizesResolverManager = null;

    // This is required per % w/h support in IE8 and... FF!!!! (omg)
    this._roundingNormalizationValue = 1;

    this._itemWidthAntialiasPercentageValue = 0;
    this._itemWidthAntialiasPxValue = 0;
    this._itemHeightAntialiasPercentageValue = 0;
    this._itemHeightAntialiasPxValue = 0;

    this._areZIndexesUpdatesEnabled = true;
    this._areZIndexesUpdatesBinded = false;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._sizesResolverManager = sizesResolverManager;

        me.setItemWidthAntialiasPercentageValue(me._itemWidthAntialiasPercentageValue);
        me.setItemHeightAntialiasPercentageValue(me._itemHeightAntialiasPercentageValue);
        me.setItemWidthAntialiasPxValue(me._itemWidthAntialiasPxValue);
        me.setItemHeightAntialiasPxValue(me._itemHeightAntialiasPxValue);

        me._bindEvents();
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

Gridifier.Normalizer.prototype.normalizeLowRounding = function(valueToNormalize) {
    return valueToNormalize - this._roundingNormalizationValue;
}

Gridifier.Normalizer.prototype.normalizeHighRounding = function(valueToNormalize) {
    return valueToNormalize + this._roundingNormalizationValue;
}

Gridifier.Normalizer.prototype.setItemWidthAntialiasPercentageValue = function(newItemWidthPtValue) {
    this._itemWidthAntialiasPercentageValue = newItemWidthPtValue;
    this.updateItemWidthAntialiasPxValue();
}

Gridifier.Normalizer.prototype.setItemWidthAntialiasPxValue = function(newItemWidthPxValue) {
    this._itemWidthAntialiasPxValue = newItemWidthPxValue;
    this.updateItemWidthAntialiasPxValue();
}

Gridifier.Normalizer.prototype.setItemHeightAntialiasPercentageValue = function(newItemHeightPtValue) {
    this._itemHeightAntialiasPercentageValue = newItemHeightPtValue;
    this.updateItemHeightAntialiasPxValue();
}

Gridifier.Normalizer.prototype.setItemHeightAntialiasPxValue = function(newItemHeightPxValue) {
    this._itemHeightAntialiasPxValue = newItemHeightPxValue;
    this.updateItemHeightAntialiasPxValue();
}

Gridifier.Normalizer.prototype.updateItemWidthAntialiasPxValue = function() {
    if(this._itemWidthAntialiasPercentageValue == 0 && this._itemWidthAntialiasPxValue == 0) {
        this._sizesResolverManager.setOuterWidthAntialiasValue(0);
        return;
    }

    if(this._itemWidthAntialiasPercentageValue != 0)
        var newItemWidthAntialiasPxValue = (this._gridifier.getGridX2() + 1) * (this._itemWidthAntialiasPercentageValue / 100);
    else
        var newItemWidthAntialiasPxValue = this._itemWidthAntialiasPxValue;

    this._sizesResolverManager.setOuterWidthAntialiasValue(newItemWidthAntialiasPxValue);
}

Gridifier.Normalizer.prototype.updateItemHeightAntialiasPxValue = function() {
    if(this._itemHeightAntialiasPercentageValue == 0 && this._itemHeightAntialiasPxValue == 0) {
        this._sizesResolverManager.setOuterHeightAntialiasValue(0);
        return;
    }

    if(this._itemHeightAntialiasPercentageValue != 0)
        var newItemHeightAntialiasPxValue = (this._gridifier.getGridY2() + 1) * (this._itemHeightAntialiasPercentageValue / 100);
    else
        var newItemHeightAntialiasPxValue = this._itemHeightAntialiasPxValue;

    this._sizesResolverManager.setOuterHeightAntialiasValue(newItemHeightAntialiasPxValue);
}

Gridifier.Normalizer.prototype.updateItemAntialiasValues = function() {
    this.updateItemWidthAntialiasPxValue();
    this.updateItemHeightAntialiasPxValue();
}

Gridifier.Normalizer.prototype.disableZIndexesUpdates = function() {
    this._areZIndexesUpdatesEnabled = false;
}

Gridifier.Normalizer.prototype.bindZIndexesUpdates = function() {
    if(!this._areZIndexesUpdatesEnabled || this._areZIndexesUpdatesBinded)
        return;

    var me = this;
    var executeUpdatesTimeout = null;

    this._gridifier.onConnectionCreate(function(connectionsObj) {
        var executeUpdates = function() {
            var calculateSizes = function (connections) {
                for(var i = 0; i < connections.length; i++) {
                    connections[i].tmpWidth = Math.abs(connections[i].x2 - connections[i].x1) + 1;
                    connections[i].tmpHeight = Math.abs(connections[i].y2 - connections[i].y1) + 1;

                    connections[i].tmpWidth += parseFloat(connections[i].horizontalOffset);
                    connections[i].tmpHeight += parseFloat(connections[i].verticalOffset);

                    connections[i].tmpArea = Math.round(connections[i].tmpWidth * connections[i].tmpHeight);
                }
            }

            var sortByAreasAsc = function (firstConnection, secondConnection) {
                if(firstConnection.tmpArea > secondConnection.tmpArea)
                    return -1;
                else if(firstConnection.tmpArea < secondConnection.tmpArea)
                    return 1;
                else if(firstConnection.tmpArea == secondConnection.tmpArea)
                    return 0;
            }

            var packConnectionsByAreas = function (connections) {
                var packedConnections = {};
                for(var i = 0; i < connections.length; i++) {
                    if(typeof packedConnections[connections[i].tmpArea] == "undefined") {
                        packedConnections[connections[i].tmpArea] = [];
                    }

                    packedConnections[connections[i].tmpArea].push(connections[i]);
                }

                return packedConnections;
            }

            var connections = connectionsObj.get();
            calculateSizes(connections);
            connections.sort(sortByAreasAsc);
            var packedByAreasConnections = packConnectionsByAreas(connections);

            var connectionsSorter = connectionsObj.getConnectionsSorter();
            var areaProps = [];
            for(var areaProp in packedByAreasConnections) {
                packedByAreasConnections[areaProp] = connectionsSorter.sortConnectionsPerReappend(
                    packedByAreasConnections[areaProp]
                );
                areaProps.push(areaProp);
            }

            areaProps.sort(function (firstArea, secondArea) {
                if(Dom.toInt(firstArea) > Dom.toInt(secondArea))
                    return -1;
                else if(Dom.toInt(firstArea) < Dom.toInt(secondArea))
                    return 1;
                else if(Dom.toInt(firstArea) == Dom.toInt(secondArea))
                    return 0;
            });


            var nextItemZIndex = 1;

            for(var i = 0; i < areaProps.length; i++) {
                for(var j = 0; j < packedByAreasConnections[areaProps[i]].length; j++) {
                    var connection = packedByAreasConnections[areaProps[i]][j];
                    connection.item.style.zIndex = nextItemZIndex;

                    if(me._gridifier.hasItemBindedClone(connection.item)) {
                        var itemClone = me._gridifier.getItemClone(connection.item);
                        itemClone.style.zIndex = nextItemZIndex - 1;
                    }

                    nextItemZIndex++;
                }
            }
        }

        if(executeUpdatesTimeout != null) {
            clearTimeout(executeUpdatesTimeout);
            executeUpdatesTimeout = null;
        }

        executeUpdatesTimeout = setTimeout(function() {
            executeUpdates();
        }, 100);
    });

    this._areZIndexesUpdatesBinded = true;
}

Gridifier.Operation = function() {
    var me = this;

    this._lastOperation = null;

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

Gridifier.Operation.prototype.isInitialOperation = function(currentOperation) {
    if(this._lastOperation == null) {
        this._lastOperation = currentOperation;
        return true;
    }

    return false;
}

Gridifier.Operation.prototype.isCurrentOperationSameAsPrevious = function(currentOperation) {
    if(this._lastOperation != currentOperation) {
        this._lastOperation = currentOperation;
        return false;
    }

    return true;
}

Gridifier.Operation.prototype.setLastOperation = function(lastOperation) {
    this._lastOperation = lastOperation;
}

Gridifier.Resorter = function(gridifier,
                              collector,
                              connections,
                              settings,
                              guid) {
    var me = this;

    this._gridifier = null;
    this._collector = null;
    this._connections = null;
    this._settings = null;
    this._guid = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._collector = collector;
        me._connections = connections;
        me._settings = settings;
        me._guid = guid;
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

Gridifier.Resorter.prototype.resort = function() {
    var connectedItems = this._collector.sortCollection(
        this._collector.collectAllConnectedItems()
    );

    if(this._settings.isCustomAllEmptySpaceSortDispersion()) {
        if(this._settings.isHorizontalGrid()) {
            this._resortAllHorizontalGridConnectionsPerReappend(connectedItems);
        }
        else if(this._settings.isVerticalGrid()) {
            this._resortAllVerticalGridConnectionsPerReappend(connectedItems);
        }
    }

    this._guid.reinit();
    for(var i = 0; i < connectedItems.length; i++) {
        this._guid.markNextAppendedItem(connectedItems[i]);
    }
}

Gridifier.Resorter.prototype._resortAllHorizontalGridConnectionsPerReappend = function(connectedItems) {
    var nextFakeX = 0;

    for(var i = 0; i < connectedItems.length; i++) {
        var connectedItemConnection = this._connections.findConnectionByItem(connectedItems[i]);
        connectedItemConnection.x1 = nextFakeX;
        connectedItemConnection.x2 = nextFakeX;
        connectedItemConnection.y1 = 0;
        connectedItemConnection.y2 = 0;
        nextFakeX++;
    }
}

Gridifier.Resorter.prototype._resortAllVerticalGridConnectionsPerReappend = function(connectedItems) {
    var nextFakeY = 0;

    for(var i = 0; i < connectedItems.length; i++) {
        var connectedItemConnection = this._connections.findConnectionByItem(connectedItems[i]);
        connectedItemConnection.x1 = 0;
        connectedItemConnection.x2 = 0;
        connectedItemConnection.y1 = nextFakeY;
        connectedItemConnection.y2 = nextFakeY;
        nextFakeY++;
    }
}

Gridifier.ResponsiveClassesManager = function(gridifier, collector, itemClonesManager) {
    var me = this;

    this._gridifier = null;
    this._collector = null;
    this._itemClonesManager = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._collector = collector;
        me._itemClonesManager = itemClonesManager;
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

Gridifier.ResponsiveClassesManager.prototype.toggleResponsiveClasses = function(maybeItem, className) {
    var items = this._itemClonesManager.unfilterClones(maybeItem);
    this._collector.ensureAllItemsAreConnectedToGrid(items);

    if(!Dom.isArray(className))
        var classNames = [className];
    else
        var classNames = className;

    for(var i = 0; i < items.length; i++) {
        if(this._gridifier.hasItemBindedClone(items[i]))
            var itemClone = this._gridifier.getItemClone(items[i]);
        else
            var itemClone = null;

        for(var j = 0; j < classNames.length; j++) {
            if(Dom.css.hasClass(items[i], classNames[j])) {
                Dom.css.removeClass(items[i], classNames[j]);
                if(itemClone != null)
                    Dom.css.removeClass(itemClone, classNames[j]);
            }
            else {
                Dom.css.addClass(items[i], classNames[j]);
                if(itemClone != null)
                    Dom.css.addClass(itemClone, classNames[j]);
            }
        }
    }

    return items;
}

Gridifier.ResponsiveClassesManager.prototype.addResponsiveClasses = function(maybeItem, className) {
    var items = this._itemClonesManager.unfilterClones(maybeItem);
    this._collector.ensureAllItemsAreConnectedToGrid(items);

    if(!Dom.isArray(className))
        var classNames = [className];
    else
        var classNames = className;

    for(var i = 0; i < items.length; i++) {
        if(this._gridifier.hasItemBindedClone(items[i]))
            var itemClone = this._gridifier.getItemClone(items[i]);
        else
            var itemClone = null;

        for(var j = 0; j < classNames.length; j++) {
            if(!Dom.css.hasClass(items[i], classNames[j])) {
                Dom.css.addClass(items[i], classNames[j]);
                if(itemClone != null)
                    Dom.css.addClass(itemClone, className[j]);
            }
        }
    }

    return items;
}

Gridifier.ResponsiveClassesManager.prototype.removeResponsiveClasses = function(maybeItem, className) {
    var items = this._itemClonesManager.unfilterClones(maybeItem);
    this._collector.ensureAllItemsAreConnectedToGrid(items);

    if(!Dom.isArray(className))
        var classNames = [className];
    else
        var classNames = className;

    for(var i = 0; i < items.length; i++) {
        if(this._gridifier.hasItemBindedClone(items[i]))
            var itemClone = this._gridifier.getItemClone(items[i]);
        else
            var itemClone = null;

        for(var j = 0; j < classNames.length; j++) {
            if(Dom.css.hasClass(items[i], classNames[j])) {
                Dom.css.removeClass(items[i], classNames[j]);
                if(itemClone != null)
                    Dom.css.removeClass(itemClone, classNames[j]);
            }
        }
    }

    return items;
}

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

                targetItem.childNodes[i].style.width = me.outerWidth(sourceItem.childNodes[i]) + "px";
                targetItem.childNodes[i].style.height = me.outerHeight(sourceItem.childNodes[i]) + "px";
            }
        }
    }

    copyRecursive(sourceItem, targetItem);
}

Gridifier.Discretizer = function(gridifier,
                                 connections,
                                 settings,
                                 sizesResolverManager) {
    var me = this;

    this._gridifier = null;
    this._connections = null;
    this._settings = null;
    this._sizesResolverManager = null;

    this._discretizerCore = null;

    this._discretizationDemonstrator = null;
    this._showDemonstrator = false;

    this._cells = [];

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._connections = connections;
        me._settings = settings;
        me._sizesResolverManager = sizesResolverManager;

        if(me._settings.isVerticalGrid()) {
            me._discretizerCore = new Gridifier.Discretizer.VerticalCore(
                me._gridifier, me._settings, me._sizesResolverManager
            );
        }
        else if(me._settings.isHorizontalGrid()) {
            me._discretizerCore = new Gridifier.Discretizer.HorizontalCore(
                me._gridifier, me._settings, me._sizesResolverManager
            );
        }

        if(me._showDemonstrator) {
            me._discretizationDemonstrator = new Gridifier.Discretizer.Demonstrator(
                me._gridifier, me._settings
            );
        }
        else {
            me._discretizationDemonstrator = {
                "create": function() { return; },
                "update": function() { return; },
                "delete": function() { return; }
            };
        }

        me._bindEvents();
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

Gridifier.Discretizer.IS_INTERSECTED_BY_ITEM = "isIntersectedByItem";
Gridifier.Discretizer.CELL_CENTER_X = "centerX";
Gridifier.Discretizer.CELL_CENTER_Y = "centerY";

Gridifier.Discretizer.prototype.discretizeGrid = function() {
    var discretizationHorizontalStep = this._connections.getMinConnectionWidth();
    var discretizationVerticalStep = this._connections.getMinConnectionHeight();

    if(this._settings.isDefaultAppend()) {
        this._cells = this._discretizerCore.discretizeGridWithDefaultAppend(
            discretizationHorizontalStep, discretizationVerticalStep
        );
    }
    else if(this._settings.isReversedAppend()) {
        this._cells = this._discretizerCore.discretizeGridWithReversedAppend(
            discretizationHorizontalStep, discretizationVerticalStep
        );
    }
}

Gridifier.Discretizer.prototype.intersectedCellsToCoords = function(cells) {
    var coords = {
        x1: cells[0].x1,
        x2: cells[0].x2,
        y1: cells[0].y1,
        y2: cells[0].y2
    };

    for(var i = 1; i < cells.length; i++) {
        if(cells[i].x1 < coords.x1)
            coords.x1 = cells[i].x1;

        if(cells[i].x2 > coords.x2)
            coords.x2 = cells[i].x2;

        if(cells[i].y1 < coords.y1)
            coords.y1 = cells[i].y1;

        if(cells[i].y2 > coords.y2)
            coords.y2 = cells[i].y2;
    }

    return coords;
}

Gridifier.Discretizer.prototype.markCellsIntersectedByItem = function(item, itemConnection) {
    for(var row = 0; row < this._cells.length; row++) {
        for(var col = 0; col < this._cells[row].length; col++) {
            var cellCoords = {
                x1: this._cells[row][col][Gridifier.Discretizer.CELL_CENTER_X],
                x2: this._cells[row][col][Gridifier.Discretizer.CELL_CENTER_X],
                y1: this._cells[row][col][Gridifier.Discretizer.CELL_CENTER_Y],
                y2: this._cells[row][col][Gridifier.Discretizer.CELL_CENTER_Y]
            };

            if(this._isCellIntersectedBy(cellCoords, itemConnection))
                this._cells[row][col][Gridifier.Discretizer.IS_INTERSECTED_BY_ITEM] = true;
            else
                this._cells[row][col][Gridifier.Discretizer.IS_INTERSECTED_BY_ITEM] = false;
        }
    }
}

Gridifier.Discretizer.prototype.getAllCellsWithIntersectedCenterData = function(intersectionCoords) {
    var cellsWithIntersectedCenter = [];
    var intersectedRowsCount = 0;
    var intersectedColsCount = 0;
    var intersectedCols = [];

    var isColumnAlreadyIntersected = function(col) {
        for(var i = 0; i < intersectedCols.length; i++) {
            if(intersectedCols[i] == col)
                return true;
        }

        return false;
    }

    for(var row = 0; row < this._cells.length; row++) {
        var isRowMarkedAsIntersected = false;
        var rowColumnsWithIntersectedCenter = [];

        for(var col = 0; col < this._cells[row].length; col++) {
            var cellCoords = {
                x1: this._cells[row][col][Gridifier.Discretizer.CELL_CENTER_X],
                x2: this._cells[row][col][Gridifier.Discretizer.CELL_CENTER_X],
                y1: this._cells[row][col][Gridifier.Discretizer.CELL_CENTER_Y],
                y2: this._cells[row][col][Gridifier.Discretizer.CELL_CENTER_Y]
            };

            if(this._isCellIntersectedBy(cellCoords, intersectionCoords)) {
                rowColumnsWithIntersectedCenter.push(this._cells[row][col]);

                if(!isRowMarkedAsIntersected) {
                    intersectedRowsCount++;
                    isRowMarkedAsIntersected = true;
                }

                if(!isColumnAlreadyIntersected(col)) {
                    intersectedColsCount++;
                    intersectedCols.push(col);
                }
            }
        }

        if(rowColumnsWithIntersectedCenter.length > 0)
            cellsWithIntersectedCenter.push(rowColumnsWithIntersectedCenter);
    }

    return {
        cellsWithIntersectedCenter: cellsWithIntersectedCenter,
        intersectedRowsCount: intersectedRowsCount,
        intersectedColsCount: intersectedColsCount
    };
}

Gridifier.Discretizer.prototype._isCellIntersectedBy = function(cellData, maybeIntersectionCoords) {
    var isAbove = (maybeIntersectionCoords.y1 < cellData.y1 && maybeIntersectionCoords.y2 < cellData.y1);
    var isBelow = (maybeIntersectionCoords.y1 > cellData.y2 && maybeIntersectionCoords.y2 > cellData.y2);
    var isBefore = (maybeIntersectionCoords.x1 < cellData.x1 && maybeIntersectionCoords.x2 < cellData.x1);
    var isBehind = (maybeIntersectionCoords.x1 > cellData.x2 && maybeIntersectionCoords.x2 > cellData.x2);

    if(!isAbove && !isBelow && !isBefore && !isBehind)
        return true;
    else
        return false;
}

Gridifier.Discretizer.prototype.normalizeItemNewConnectionHorizontalCoords = function(item, 
                                                                                      newConnectionCoords) {
    return this._discretizerCore.normalizeItemNewConnectionHorizontalCoords(
        item, newConnectionCoords
    );
}

Gridifier.Discretizer.prototype.normalizeItemNewConnectionVerticalCoords = function(item,
                                                                                    newConnectionCoords) {
    return this._discretizerCore.normalizeItemNewConnectionVerticalCoords(
        item, newConnectionCoords
    );
}

Gridifier.Discretizer.prototype.createDemonstrator = function() {
    this._discretizationDemonstrator.create(this._cells);
}

Gridifier.Discretizer.prototype.updateDemonstrator = function() {
    this._discretizationDemonstrator.update(this._cells);
}

Gridifier.Discretizer.prototype.deleteDemonstrator = function() {
    this._discretizationDemonstrator["delete"].call(this);
}

Gridifier.Discretizer.Demonstrator = function(gridifier, settings) {
    var me = this;

    this._gridifier = null;
    this._settings = null;

    this._demonstrator = null;
    this._demonstratorClickHandler = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._settings = settings;

        me._bindEvents();
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

Gridifier.Discretizer.Demonstrator.prototype.create = function(cells) {
    this._createDemonstrator();
    this._decorateDemonstrator();
    this._bindDemonstratorDeleteOnClick();
    this._createCells(cells);
}

Gridifier.Discretizer.Demonstrator.prototype._createDemonstrator = function() {
    this._demonstrator = document.createElement("div");
    this._gridifier.getGrid().appendChild(this._demonstrator);

    Dom.css.set(this._demonstrator, {
        width: (this._gridifier.getGridX2() + 1) + "px",
        height: (this._gridifier.getGridY2() + 1) + "px",
        position: "absolute",
        left: "0px",
        top: "0px"
    });
}

Gridifier.Discretizer.Demonstrator.prototype._decorateDemonstrator = function() {
    Dom.css.set(this._demonstrator, {
        background: "rgb(235,235,235)",
        zIndex: "100",
        opacity: "0.8"
    });
}

Gridifier.Discretizer.Demonstrator.prototype._bindDemonstratorDeleteOnClick = function() {
    var me = this;
    this._demonstratorClickHandler = function() {
        Event.remove(me._demonstrator, "click", me._demonstratorClickHandler);
        me["delete"].call(me);
    };

    Event.add(this._demonstrator, "click", this._demonstratorClickHandler);
}

Gridifier.Discretizer.Demonstrator.prototype.update = function(cells) {
    if(this._demonstrator != null)
        this["delete"].call(this);

    this.create(cells);
}

Gridifier.Discretizer.Demonstrator.prototype["delete"] = function() {
    if(this._demonstrator == null)
        return;
    
    this._demonstrator.parentNode.removeChild(this._demonstrator);
    this._demonstrator = null;
}

Gridifier.Discretizer.Demonstrator.prototype._createCells = function(cells) {
    var borderColors = ["gridFirstBorderColor", "gridSecondBorderColor", "gridThirdBorderColor",
                        "gridFourthBorderColor", "gridFifthBorderColor"];
    var currentBorderColor = -1;

    for(var row = 0; row < cells.length; row++) {
        for(var col = 0; col < cells[row].length; col++) {
            var cellDemonstrator = document.createElement("div");
            var cellWidth = cells[row][col].x2 - cells[row][col].x1 + 1;
            var cellHeight = cells[row][col].y2 - cells[row][col].y1 + 1;

            currentBorderColor++;
            if(currentBorderColor == 5) {
                borderColors.reverse();
                currentBorderColor = 0;
            }
            cellDemonstrator.setAttribute("class", borderColors[currentBorderColor]);

            Dom.css.set(cellDemonstrator, {
                position: "absolute",
                boxSizing: "border-box",
                left: cells[row][col].x1 + "px",
                top: cells[row][col].y1 + "px",
                width: cellWidth + "px",
                height: cellHeight + "px",
                border: "5px dashed"
            });

            if(cells[row][col][Gridifier.Discretizer.IS_INTERSECTED_BY_ITEM]) {
                cellDemonstrator.style.background = "red";
                cellDemonstrator.style.opacity = "1";
            }

            this._demonstrator.appendChild(cellDemonstrator);

            var centerPointDemonstrator = document.createElement("div");
            Dom.css.set(centerPointDemonstrator, {
                position: "absolute",
                left: cells[row][col][Gridifier.Discretizer.CELL_CENTER_X] + "px",
                top: cells[row][col][Gridifier.Discretizer.CELL_CENTER_Y] + "px",
                width: "5px",
                height: "5px",
                background: "black"
            });

            this._demonstrator.appendChild(centerPointDemonstrator);
        }
    }
}

Gridifier.Dragifier = function(gridifier,
                               appender,
                               reversedAppender,
                               collector,
                               connections,
                               connectors,
                               guid,
                               settings,
                               sizesResolverManager,
                               eventEmitter) {
    var me = this;

    this._gridifier = null;
    this._appender = null;
    this._reversedAppender = null;
    this._collector = null;
    this._connections = null;
    this._connectors = null;
    this._guid = null;
    this._settings = null;
    this._sizesResolverManager = null;
    this._eventEmitter = null;

    this._connectedItemMarker = null;

    this._touchStartHandler = null;
    this._touchMoveHandler = null;
    this._touchEndHandler = null;
    this._mouseDownHandler = null;
    this._mouseMoveHandler = null;
    this._mouseUpHandler = null;

    this._draggableItems = [];
    this._isDragging = false;

    this._areDragifierEventsBinded = false;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._appender = appender;
        me._reversedAppender = reversedAppender;
        me._collector = collector;
        me._connections = connections;
        me._connectors = connectors;
        me._guid = guid;
        me._settings = settings;
        me._sizesResolverManager = sizesResolverManager;
        me._eventEmitter = eventEmitter;

        me._connectedItemMarker = new Gridifier.ConnectedItemMarker();
        me._dragifierApi = new Gridifier.Api.Dragifier();

        me._bindEvents();
        if(me._settings.shouldEnableDragifierOnInit()) {
            me.bindDragifierEvents();
        }
    };

    this._bindEvents = function() {
        me._touchStartHandler = function(event) {
            var connectedItem = me._findClosestConnectedItem(event.target);
            if(connectedItem == null) return;

            event.preventDefault();
            me._disableUserSelect();
            me._sizesResolverManager.startCachingTransaction();
            me._isDragging = true;

            if(me._isAlreadyDraggable(connectedItem)) {
                var newTouch = event.changedTouches[0];
                var alreadyDraggableItem = me._findAlreadyDraggableItem(connectedItem);
                alreadyDraggableItem.addDragIdentifier(newTouch.identifier);
                return;
            }

            var draggableItem = me._createDraggableItem();
            var initialTouch = event.changedTouches[0];

            draggableItem.bindDraggableItem(connectedItem, initialTouch.pageX, initialTouch.pageY);
            draggableItem.addDragIdentifier(initialTouch.identifier);

            me._draggableItems.push(draggableItem);
        };

        me._touchEndHandler = function(event) {
            if(!me._isDragging) return;
            event.preventDefault();

            setTimeout(function() {
                if(!me._isDragging) return;

                var touches = event.changedTouches;
                for(var i = 0; i < touches.length; i++) {
                    var draggableItemData = me._findDraggableItemByIdentifier(touches[i].identifier, true);
                    if(draggableItemData.item == null)
                        continue;
                    draggableItemData.item.removeDragIdentifier(touches[i].identifier);

                    if(draggableItemData.item.getDragIdentifiersCount() == 0) {
                        draggableItemData.item.unbindDraggableItem();
                        me._draggableItems.splice(draggableItemData.itemIndex, 1);
                    }
                }

                if(me._draggableItems.length == 0) {
                    me._enableUserSelect();
                    me._isDragging = false;
                    me._sizesResolverManager.stopCachingTransaction();
                }
            }, 0);
        };

        me._touchMoveHandler = function(event) {
            if(!me._isDragging) return;
            event.preventDefault();

            setTimeout(function() {
                if(!me._isDragging) return;

                var touches = event.changedTouches;
                for(var i = 0; i < touches.length; i++) {
                    var draggableItem = me._findDraggableItemByIdentifier(touches[i].identifier);
                    if(draggableItem == null)
                        continue;
                    draggableItem.processDragMove(touches[i].pageX, touches[i].pageY);
                }
           }, 0);
        };

        me._mouseDownHandler = function(event) {
            var connectedItem = me._findClosestConnectedItem(event.target);
            if(connectedItem == null) return;

            event.preventDefault();
            me._disableUserSelect();
            me._sizesResolverManager.startCachingTransaction();
            me._isDragging = true;

            var draggableItem = me._createDraggableItem();

            draggableItem.bindDraggableItem(connectedItem, event.pageX, event.pageY);
            me._draggableItems.push(draggableItem);
        };

        me._mouseUpHandler = function() {
            setTimeout(function() {
                if(!me._isDragging) return;

                me._enableUserSelect();
                me._draggableItems[0].unbindDraggableItem();
                me._draggableItems.splice(0, 1);
                me._isDragging = false;
                me._sizesResolverManager.stopCachingTransaction();
            }, 0);
        };

        me._mouseMoveHandler = function(event) {
            setTimeout(function() {
                if(!me._isDragging) return;
                me._draggableItems[0].processDragMove(event.pageX, event.pageY);
           }, 0);
        };
    };

    this._unbindEvents = function() {
    };

    this.destruct = function() {
       me._unbindEvents();
    };

    this._construct();
    return this;
}

Gridifier.Dragifier.IS_DRAGGABLE_ITEM_DATA_ATTR = "data-gridifier-is-draggable-item";

Gridifier.Dragifier.prototype.bindDragifierEvents = function() {
    if(this._areDragifierEventsBinded)
        return;

    this._areDragifierEventsBinded = true;

    Event.add(this._gridifier.getGrid(), "mousedown", this._mouseDownHandler);
    Event.add(document.body, "mouseup", this._mouseUpHandler);
    Event.add(document.body, "mousemove", this._mouseMoveHandler);

    Event.add(this._gridifier.getGrid(), "touchstart", this._touchStartHandler);
    Event.add(document.body, "touchend", this._touchEndHandler);
    Event.add(document.body, "touchmove", this._touchMoveHandler);
}

Gridifier.Dragifier.prototype.unbindDragifierEvents = function() {
    if(!this._areDragifierEventsBinded)
        return;

    this._areDragifierEventsBinded = false;

    Event.remove(this._gridifier.getGrid(), "mousedown", this._mouseDownHandler);
    Event.remove(document.body, "mouseup", this._mouseUpHandler);
    Event.remove(document.body, "mousemove", this._mouseMoveHandler);

    Event.remove(this._gridifier.getGrid(), "touchstart", this._touchStartHandler);
    Event.remove(document.body, "touchend", this._touchEndHandler);
    Event.remove(document.body, "touchmove", this._touchMoveHandler);
}

Gridifier.Dragifier.prototype._disableUserSelect = function() {
    var dragifierUserSelectToggler = this._settings.getDragifierUserSelectToggler();
    dragifierUserSelectToggler.disableSelect();
}

Gridifier.Dragifier.prototype._enableUserSelect = function() {
    var dragifierUserSelectToggler = this._settings.getDragifierUserSelectToggler();
    dragifierUserSelectToggler.enableSelect();
}

Gridifier.Dragifier.prototype._findClosestConnectedItem = function(maybeConnectedItemChild) {
    var grid = this._gridifier.getGrid();
    var draggableItemSelector = this._settings.getDragifierItemSelector();

    if(maybeConnectedItemChild == grid)
        return null;

    if(typeof draggableItemSelector == "boolean" && !draggableItemSelector)
        var checkThatAnyBubblePhaseElemHasClass = false;
    else
        var checkThatAnyBubblePhaseElemHasClass = true;

    var connectedItem = null;
    var parentNode = null;
    var hasAnyBubblePhaseElemClass = false;

    while(connectedItem == null && parentNode != grid) {
        if(parentNode == null)
            parentNode = maybeConnectedItemChild;
        else
            parentNode = parentNode.parentNode;

        if(checkThatAnyBubblePhaseElemHasClass) {
            if(Dom.css.hasClass(parentNode, draggableItemSelector))
                hasAnyBubblePhaseElemClass = true;
        }

        if(this._connectedItemMarker.isItemConnected(parentNode))
            connectedItem = parentNode;
    }

    if(connectedItem == null || (checkThatAnyBubblePhaseElemHasClass && !hasAnyBubblePhaseElemClass)) {
        return null;
    }

    return connectedItem;
}

Gridifier.Dragifier.prototype._createDraggableItem = function() {
    if(this._settings.isIntersectionDragifierMode()) {
        var draggableItem = new Gridifier.Dragifier.ConnectionIntersectionDraggableItem(
            this._gridifier, 
            this._appender,
            this._reversedAppender,
            this._collector,
            this._connections, 
            this._connectors, 
            this._guid, 
            this._settings,
            this._sizesResolverManager,
            this._eventEmitter
        );
    }
    else if(this._settings.isDiscretizationDragifierMode()) {
        var draggableItem = new Gridifier.Dragifier.GridDiscretizationDraggableItem(
            this._gridifier, 
            this._appender,
            this._reversedAppender,
            this._collector,
            this._connections, 
            this._connectors, 
            this._guid, 
            this._settings,
            this._sizesResolverManager,
            this._eventEmitter
        );
    }

    return draggableItem;
}

Gridifier.Dragifier.prototype._isAlreadyDraggable = function(item) {
    for(var i = 0; i < this._draggableItems.length; i++) {
        var draggableItem = this._draggableItems[i].getDraggableItem();
        if(this._guid.getItemGUID(draggableItem) == this._guid.getItemGUID(item))
            return true;
    }

    return false;
}

Gridifier.Dragifier.prototype._findAlreadyDraggableItem = function(item) {
    for(var i = 0; i < this._draggableItems.length; i++) {
        var draggableItem = this._draggableItems[i].getDraggableItem();

        if(this._guid.getItemGUID(draggableItem) == this._guid.getItemGUID(item))
            return this._draggableItems[i];
    }

    throw new Error("Draggable item not found");
}

Gridifier.Dragifier.prototype._findDraggableItemByIdentifier = function(identifier,
                                                                        fetchIndex) {
    var fetchIndex = fetchIndex || false;
    var draggableItem = null;
    var draggableItemIndex = null;

    for(var i = 0; i < this._draggableItems.length; i++) {
        if(this._draggableItems[i].hasDragIdentifier(identifier)) {
            draggableItem = this._draggableItems[i];
            draggableItemIndex = i;
            break;
        }
    }

    if(fetchIndex) {
        return {
            item: draggableItem,
            itemIndex: draggableItemIndex
        };
    }
    else {
        return draggableItem;
    }
}

Gridifier.Dragifier.Core = function(gridifier,
                                    appender,
                                    reversedAppender,
                                    collector,
                                    connectors,
                                    connections,
                                    settings,
                                    guid,
                                    dragifierRenderer,
                                    sizesResolverManager,
                                    eventEmitter) {
    var me = this;

    this._gridifier = null;
    this._appender = null;
    this._reversedAppender = null;
    this._collector = null;
    this._connectors = null;
    this._connections = null;
    this._settings = null;
    this._guid = null;
    this._dragifierRenderer = null;
    this._sizesResolverManager = null;
    this._eventEmitter = null;
    this._connectionsSorter = null;

    this._cursorOffsetXFromDraggableItemCenter = null;
    this._cursorOffsetYFromDraggableItemCenter = null;

    this._gridOffsetLeft = null;
    this._gridOffsetTop = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._appender = appender;
        me._reversedAppender = reversedAppender;
        me._collector = collector;
        me._connectors = connectors;
        me._connections = connections;
        me._settings = settings;
        me._guid = guid;
        me._dragifierRenderer = dragifierRenderer;
        me._sizesResolverManager = sizesResolverManager;
        me._eventEmitter = eventEmitter;

        if(me._settings.isVerticalGrid()) {
            me._connectionsSorter = new Gridifier.VerticalGrid.ConnectionsSorter(
                me._connections, me._settings, me._guid
            );
        }
        else if(me._settings.isHorizontalGrid()) {
            me._connectionsSorter = new Gridifier.HorizontalGrid.ConnectionsSorter(
                me._connections, me._settings, me._guid
            );
        }

        me._bindEvents();
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

Gridifier.Dragifier.Core.prototype.determineGridOffsets = function() {
    this._gridOffsetLeft = this._sizesResolverManager.offsetLeft(this._gridifier.getGrid());
    this._gridOffsetTop = this._sizesResolverManager.offsetTop(this._gridifier.getGrid());
}

Gridifier.Dragifier.Core.prototype._getDraggableItemOffsetLeft = function(draggableItem, substractMargins) {
    var substractMargins = substractMargins || false;
    var draggableItemConnection = this._connections.findConnectionByItem(draggableItem);

    if(this._settings.isNoIntersectionsStrategy() && this._settings.isHorizontalGrid())
        var horizontalOffset = draggableItemConnection.horizontalOffset;
    else
        var horizontalOffset = 0;

    if(substractMargins) {
        var elemWidth = this._sizesResolverManager.outerWidth(draggableItem);
        var elemWidthWithMargins = this._sizesResolverManager.outerWidth(draggableItem, true);
        var marginWidth = elemWidthWithMargins - elemWidth;
        var halfOfMarginWidth = marginWidth / 2;
        
        return this._gridOffsetLeft + draggableItemConnection.x1 - halfOfMarginWidth + horizontalOffset;
    }
    else {
        return this._gridOffsetLeft + draggableItemConnection.x1 + horizontalOffset;
    }
}

Gridifier.Dragifier.Core.prototype._getDraggableItemOffsetTop = function(draggableItem, substractMargins) {
    var substractMargins = substractMargins || false;
    var draggableItemConnection = this._connections.findConnectionByItem(draggableItem);

    if(this._settings.isNoIntersectionsStrategy() && this._settings.isVerticalGrid())
        var verticalOffset = draggableItemConnection.verticalOffset;
    else
        var verticalOffset = 0;

    if(substractMargins) {
        var elemHeight = this._sizesResolverManager.outerHeight(draggableItem);
        var elemHeightWithMargins = this._sizesResolverManager.outerHeight(draggableItem, true);
        var marginHeight = elemHeightWithMargins - elemHeight;
        var halfOfMarginHeight = marginHeight / 2;

        return this._gridOffsetTop + draggableItemConnection.y1 - halfOfMarginHeight + verticalOffset;
    }
    else {
        return this._gridOffsetTop + draggableItemConnection.y1 + verticalOffset;
    }
}

Gridifier.Dragifier.Core.prototype.determineInitialCursorOffsetsFromDraggableItemCenter = function(draggableItem,
                                                                                                   cursorX, 
                                                                                                   cursorY) {
    var draggableItemOffsetLeft = this._getDraggableItemOffsetLeft(draggableItem);
    var draggableItemOffsetTop = this._getDraggableItemOffsetTop(draggableItem);

    var draggableItemWidth = this._sizesResolverManager.outerWidth(draggableItem, true);
    var draggableItemHeight = this._sizesResolverManager.outerHeight(draggableItem, true);

    var draggableItemCenterX = draggableItemOffsetLeft + (draggableItemWidth / 2);
    var draggableItemCenterY = draggableItemOffsetTop + (draggableItemHeight / 2);

    this._cursorOffsetXFromDraggableItemCenter = draggableItemCenterX - cursorX;
    this._cursorOffsetYFromDraggableItemCenter = draggableItemCenterY - cursorY;
}

Gridifier.Dragifier.Core.prototype._getMaxConnectionItemZIndex = function() {
    var maxZIndex = null;
    var connections = this._connections.get();

    for(var i = 0; i < connections.length; i++) {
        if(maxZIndex == null) {
            maxZIndex = Dom.toInt(connections[i].item.style.zIndex);
        }
        else {
            if(Dom.toInt(connections[i].item.style.zIndex) > maxZIndex)
                maxZIndex = Dom.toInt(connections[i].item.style.zIndex);
        }
    }

    return Dom.toInt(maxZIndex);
}

Gridifier.Dragifier.Core.prototype.createDraggableItemClone = function(draggableItem) {
    var draggableItemClone = draggableItem.cloneNode(true);
    this._collector.markItemAsRestrictedToCollect(draggableItemClone);

    var draggableItemDecorator = this._settings.getDraggableItemDecorator();
    draggableItemDecorator(draggableItemClone, draggableItem, this._sizesResolverManager);

    if(Dom.isBrowserSupportingTransitions()) {
        Dom.css3.transform(draggableItemClone, "");
        Dom.css3.transition(draggableItemClone, "none");
    }
    draggableItemClone.style.zIndex = this._getMaxConnectionItemZIndex() + 1;

    var cloneWidth = this._sizesResolverManager.outerWidth(draggableItem);
    var cloneHeight = this._sizesResolverManager.outerHeight(draggableItem);
    draggableItemClone.style.width = cloneWidth + "px";
    draggableItemClone.style.height = cloneHeight + "px";
    draggableItemClone.style.margin = "0px";

    document.body.appendChild(draggableItemClone);

    var draggableItemOffsetLeft = this._getDraggableItemOffsetLeft(draggableItem);
    var draggableItemOffsetTop = this._getDraggableItemOffsetTop(draggableItem);

    draggableItemClone.style.left = draggableItemOffsetLeft +"px";
    draggableItemClone.style.top = draggableItemOffsetTop + "px";

    this._dragifierRenderer.render(
        draggableItemClone,
        draggableItemOffsetLeft,
        draggableItemOffsetTop
    );

    return draggableItemClone;
}

Gridifier.Dragifier.Core.prototype.createDraggableItemPointer = function(draggableItem) {
    var draggableItemOffsetLeft = this._getDraggableItemOffsetLeft(draggableItem, true);
    var draggableItemOffsetTop = this._getDraggableItemOffsetTop(draggableItem, true);

    var draggableItemPointer = document.createElement("div");
    Dom.css.set(draggableItemPointer, {
        width: this._sizesResolverManager.outerWidth(draggableItem, true) + "px",
        height: this._sizesResolverManager.outerHeight(draggableItem, true) + "px",
        position: "absolute",
        left: (draggableItemOffsetLeft - this._gridOffsetLeft) + "px",
        top: (draggableItemOffsetTop - this._gridOffsetTop) + "px"
    });

    this._gridifier.getGrid().appendChild(draggableItemPointer);

    var draggableItemPointerDecorator = this._settings.getDraggableItemPointerDecorator();
    draggableItemPointerDecorator(draggableItemPointer);

    this._dragifierRenderer.render(
        draggableItemPointer,
        (draggableItemOffsetLeft - this._gridOffsetLeft),
        (draggableItemOffsetTop - this._gridOffsetTop)
    );

    return draggableItemPointer;
}

Gridifier.Dragifier.Core.prototype.calculateDraggableItemCloneNewDocumentPosition = function(draggableItem,
                                                                                             cursorX,
                                                                                             cursorY) {
    var itemSideWidth = this._sizesResolverManager.outerWidth(draggableItem, true) / 2;
    var itemSideHeight = this._sizesResolverManager.outerHeight(draggableItem, true) / 2;

    return {
        x: cursorX - itemSideWidth - (this._cursorOffsetXFromDraggableItemCenter * -1),
        y: cursorY - itemSideHeight - (this._cursorOffsetYFromDraggableItemCenter * -1)
    };
}

Gridifier.Dragifier.Core.prototype.calculateDraggableItemCloneNewGridPosition = function(draggableItem,
                                                                                         newDocumentPosition) {
    var draggableItemCloneNewGridPosition = {
        x1: newDocumentPosition.x,
        x2: newDocumentPosition.x + this._sizesResolverManager.outerWidth(draggableItem, true) - 1,
        y1: newDocumentPosition.y,
        y2: newDocumentPosition.y + this._sizesResolverManager.outerHeight(draggableItem, true) - 1
    };

    draggableItemCloneNewGridPosition.x1 -= this._gridOffsetLeft;
    draggableItemCloneNewGridPosition.x2 -= this._gridOffsetLeft;
    draggableItemCloneNewGridPosition.y1 -= this._gridOffsetTop;
    draggableItemCloneNewGridPosition.y2 -= this._gridOffsetTop;

    return draggableItemCloneNewGridPosition;
}

Gridifier.Dragifier.Core.prototype.reappendGridItems = function() {
    var me = this;
    
    if(this._settings.isDefaultAppend()) {
        this._connectors.setNextFlushCallback(function() { 
            me._appender.createInitialConnector(); 
        });
    }
    else if(this._settings.isReversedAppend()) {
        this._connectors.setNextFlushCallback(function() { 
            me._reversedAppender.createInitialConnector(); 
        });
    }

    this._eventEmitter.onItemsReappendExecutionEndPerDragifier(function() {
        var sortedConnections = me._connectionsSorter.sortConnectionsPerReappend(me._connections.get());
        var sortedItems = [];

        for(var i = 0; i < sortedConnections.length; i++) {
            sortedItems.push(sortedConnections[i].item);
        }

        me._eventEmitter.emitDragEndEvent(sortedItems);
    });
    this._gridifier.retransformAllSizes();
}

Gridifier.Dragifier.Renderer = function(settings, dragifierApi) {
    var me = this;

    this._settings = null;
    this._coordsChanger = null;

    this._css = {
    };

    this._construct = function() {
        me._settings = settings;

        me._setRenderFunction();
        me._bindEvents();
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

Gridifier.Dragifier.Renderer.prototype._setRenderFunction = function() {
    this._coordsChanger = this._settings.getDraggableItemCoordsChanger();
}

Gridifier.Dragifier.Renderer.prototype.render = function(item, newLeft, newTop) {
    this._coordsChanger(item, newLeft, newTop);
}

Gridifier.Dragifier.ConnectionIntersectionDraggableItem = function(gridifier,
                                                                   appender,
                                                                   reversedAppender,
                                                                   collector,
                                                                   connections,
                                                                   connectors,
                                                                   guid,
                                                                   settings,
                                                                   sizesResolverManager,
                                                                   eventEmitter) {
    var me = this;

    this._gridifier = null;
    this._appender = null;
    this._reversedAppender = null;
    this._collector = null;
    this._connections = null;
    this._connectors = null;
    this._connectionsIntersector = null;
    this._guid = null;
    this._settings = null;
    this._sizesResolverManager = null;
    this._eventEmitter = null;

    this._dragifierCore = null;
    this._dragifierRenderer = null;

    this._dragIdentifiers = [];
    this._draggableItem = null;
    this._draggableItemClone = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._appender = appender;
        me._reversedAppender = reversedAppender;
        me._collector = collector;
        me._connections = connections;
        me._connectors = connectors;
        me._guid = guid;
        me._settings = settings;
        me._sizesResolverManager = sizesResolverManager;
        me._eventEmitter = eventEmitter;

        me._dragIdentifiers = [];

        me._connectionsIntersector = new Gridifier.ConnectionsIntersector(
            me._connections
        );

        me._dragifierRenderer = new Gridifier.Dragifier.Renderer(
            me._settings
        );
        me._dragifierCore = new Gridifier.Dragifier.Core(
            me._gridifier, 
            me._appender, 
            me._reversedAppender, 
            me._collector,
            me._connectors, 
            me._connections,
            me._settings,
            me._guid,
            me._dragifierRenderer, 
            me._sizesResolverManager,
            me._eventEmitter
        );

        me._bindEvents();
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

Gridifier.Dragifier.ConnectionIntersectionDraggableItem.prototype.bindDraggableItem = function(item,
                                                                                               cursorX,
                                                                                               cursorY) {
    this._initDraggableItem(item);

    this._dragifierCore.determineGridOffsets();
    this._dragifierCore.determineInitialCursorOffsetsFromDraggableItemCenter(
        this._draggableItem, cursorX, cursorY
    );

    this._draggableItemClone = this._dragifierCore.createDraggableItemClone(this._draggableItem);
    this._hideDraggableItem();
}

Gridifier.Dragifier.ConnectionIntersectionDraggableItem.prototype.getDraggableItem = function() {
    return this._draggableItem;
}

Gridifier.Dragifier.ConnectionIntersectionDraggableItem.prototype.addDragIdentifier = function(identifier) {
    this._dragIdentifiers.push(identifier);
}

Gridifier.Dragifier.ConnectionIntersectionDraggableItem.prototype.hasDragIdentifier = function(identifier) {
    for(var i = 0; i < this._dragIdentifiers.length; i++) {
        if(this._dragIdentifiers[i] == identifier)
            return true;
    }

    return false;
}

Gridifier.Dragifier.ConnectionIntersectionDraggableItem.prototype.removeDragIdentifier = function(identifier) {
    for(var i = 0; i < this._dragIdentifiers.length; i++) {
        if(this._dragIdentifiers[i] == identifier) {
            this._dragIdentifiers.splice(i, 1);
            break;
        }
    }
}

Gridifier.Dragifier.ConnectionIntersectionDraggableItem.prototype.getDragIdentifiersCount = function() {
    return this._dragIdentifiers.length;
}

Gridifier.Dragifier.ConnectionIntersectionDraggableItem.prototype._initDraggableItem = function(item) {
    this._draggableItem = item;
    if(Dom.isBrowserSupportingTransitions())
        Dom.css3.transitionProperty(this._draggableItem, "Visibility 0ms ease");
}

Gridifier.Dragifier.ConnectionIntersectionDraggableItem.prototype._hideDraggableItem = function() {
    this._draggableItem.style.visibility = "hidden";
    this._draggableItem.setAttribute(Gridifier.Dragifier.IS_DRAGGABLE_ITEM_DATA_ATTR, "yes");

    var itemClonesManager = this._gridifier.getItemClonesManager();
    if(itemClonesManager.hasBindedClone(this._draggableItem)) {
        var draggableItemRendererClone = itemClonesManager.getBindedClone(this._draggableItem);
        draggableItemRendererClone.style.visibility = "hidden";
    }
}

Gridifier.Dragifier.ConnectionIntersectionDraggableItem.prototype.processDragMove = function(cursorX, cursorY) {
    var draggableItemCloneNewDocumentPosition = this._dragifierCore.calculateDraggableItemCloneNewDocumentPosition(
        this._draggableItem, cursorX, cursorY
    )

    this._dragifierRenderer.render(
        this._draggableItemClone,
        draggableItemCloneNewDocumentPosition.x,
        draggableItemCloneNewDocumentPosition.y
    );

    var draggableItemCloneNewGridPosition = this._dragifierCore.calculateDraggableItemCloneNewGridPosition(
        this._draggableItem, draggableItemCloneNewDocumentPosition
    );

    var newIntersectedConnections = this._getNewIntersectedConnections(draggableItemCloneNewGridPosition);
    if(newIntersectedConnections.length == 0)
        return;

    if(this._settings.isDisabledSortDispersion() || this._settings.isCustomSortDispersion()) {
        this._swapItemGUIDS(newIntersectedConnections);
        this._dragifierCore.reappendGridItems();
    }
    else if(this._settings.isCustomAllEmptySpaceSortDispersion()) {
        if(this._swapItemPositions(newIntersectedConnections))
            this._dragifierCore.reappendGridItems();
    }
}

Gridifier.Dragifier.ConnectionIntersectionDraggableItem.prototype._getNewIntersectedConnections = function(draggableItemCloneNewGridPosition) {
    var draggableItemGUID = this._guid.getItemGUID(this._draggableItem);
    var allConnectionsWithIntersectedCenter = this._connectionsIntersector.getAllConnectionsWithIntersectedCenter(
        draggableItemCloneNewGridPosition
    );

    var newIntersectedConnections = [];
    for(var i = 0; i < allConnectionsWithIntersectedCenter.length; i++) {
        if(allConnectionsWithIntersectedCenter[i].itemGUID != draggableItemGUID) {
            newIntersectedConnections.push(allConnectionsWithIntersectedCenter[i]);
        }
    }

    return newIntersectedConnections;
}

Gridifier.Dragifier.ConnectionIntersectionDraggableItem.prototype._swapItemGUIDS = function(newIntersectedConnections) {
    var draggableItemGUID = this._guid.getItemGUID(this._draggableItem);

    var intersectedConnectionWithSmallestGUID = newIntersectedConnections[0];
    for(var i = 0; i < newIntersectedConnections.length; i++) {
        if(newIntersectedConnections[i].itemGUID < intersectedConnectionWithSmallestGUID)
            intersectedConnectionWithSmallestGUID = newIntersectedConnections[i];
    }

    this._guid.setItemGUID(this._draggableItem, intersectedConnectionWithSmallestGUID.itemGUID);
    this._guid.setItemGUID(this._draggableItemClone, intersectedConnectionWithSmallestGUID.itemGUID);
    this._guid.setItemGUID(intersectedConnectionWithSmallestGUID.item, draggableItemGUID);
}

/*
    Connection could be still deleted on fast dragging, so we should perform drag in this mode
    only if the connection was reappended through reappend queue. On Grid Discretization algorithm
    connection is marked as RESTRICTED_TO_COLLECT, so no such check is required.
 */
Gridifier.Dragifier.ConnectionIntersectionDraggableItem.prototype._swapItemPositions = function(newIntersectedConnections) {
    var draggableItemConnection = this._connections.findConnectionByItem(this._draggableItem, true);
    if(draggableItemConnection == null)
        return false;

    if(this._settings.isVerticalGrid()) {
        var connectionsSorter = new Gridifier.VerticalGrid.ConnectionsSorter(
            this._connections, this._settings, this._guid
        );
        newIntersectedConnections = connectionsSorter.sortConnectionsPerReappend(newIntersectedConnections);
    }
    else if(this._settings.isHorizontalGrid()) {
        var connectionsSorter = new Gridifier.HorizontalGrid.ConnectionsSorter(
           this._connections, this._settings, this._guid
        );
        newIntersectedConnections = connectionsSorter.sortConnectionsPerReappend(newIntersectedConnections);
    }

    var intersectedConnectionWithSmallestPosition = newIntersectedConnections[0];

    var draggableItemGUID = this._guid.getItemGUID(this._draggableItem);
    var intersectedConnectionWithSmallestPositionGUID = this._guid.getItemGUID(intersectedConnectionWithSmallestPosition.item);

    this._guid.setItemGUID(this._draggableItem, intersectedConnectionWithSmallestPositionGUID);
    this._guid.setItemGUID(intersectedConnectionWithSmallestPosition.item, draggableItemGUID);

    var tempItem = draggableItemConnection.item;
    draggableItemConnection.item = intersectedConnectionWithSmallestPosition.item;
    intersectedConnectionWithSmallestPosition.item = tempItem;

    var tempGUID = draggableItemConnection.itemGUID;
    draggableItemConnection.itemGUID = intersectedConnectionWithSmallestPositionGUID;
    intersectedConnectionWithSmallestPosition.itemGUID = tempGUID;

    return true;
}

Gridifier.Dragifier.ConnectionIntersectionDraggableItem.prototype.unbindDraggableItem = function() {
    document.body.removeChild(this._draggableItemClone);

    this._showDraggableItem();
    this._draggableItem = null;
    this._draggableItem = null;
}

Gridifier.Dragifier.ConnectionIntersectionDraggableItem.prototype._showDraggableItem = function() {
    this._draggableItem.removeAttribute(Gridifier.Dragifier.IS_DRAGGABLE_ITEM_DATA_ATTR);
    this._draggableItem.style.visibility = "visible";
}

Gridifier.Dragifier.Cells = function(discretizer) {
    var me = this;

    this._discretizer = null;

    this._css = {
    };

    this._construct = function() {
        me._discretizer = discretizer;

        me._bindEvents();
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

Gridifier.Dragifier.Cells.prototype.getIntersectedByDraggableItemCellCentersData = function(draggableItemConnection) {
    var intersectedByDraggableItemCellCentersData = this._discretizer.getAllCellsWithIntersectedCenterData(
        draggableItemConnection
    );

    // If we have started drag from not covered by discretizator corner,
    // we can get into situation, when dragged item isn't intersecting any discretizator cell center,
    // so we should fix it. (In this situation item should cover 1 cell center).
    if(intersectedByDraggableItemCellCentersData.intersectedColsCount == 0 &&
        intersectedByDraggableItemCellCentersData.intersectedRowsCount == 0) {
        intersectedByDraggableItemCellCentersData.intersectedRowsCount = 1;
        intersectedByDraggableItemCellCentersData.intersectedColsCount = 1;
    }

    return intersectedByDraggableItemCellCentersData;
}

Gridifier.Dragifier.Cells.prototype.isAtLeastOneOfIntersectedCellCentersEmpty = function(intersectedByDraggableItemCloneCellCentersData) {
    var intersectedByDraggableItemCloneCellCenters = intersectedByDraggableItemCloneCellCentersData.cellsWithIntersectedCenter;

    var isAtLeastOneOfIntersectedCellCentersEmpty = false;
    for(var row = 0; row < intersectedByDraggableItemCloneCellCenters.length; row++) {
        for(var col = 0; col < intersectedByDraggableItemCloneCellCenters[row].length; col++) {
            if(!intersectedByDraggableItemCloneCellCenters[row][col][Gridifier.Discretizer.IS_INTERSECTED_BY_ITEM]) 
                isAtLeastOneOfIntersectedCellCentersEmpty = true;
        }
    }

    return isAtLeastOneOfIntersectedCellCentersEmpty;
}

Gridifier.Dragifier.Cells.prototype.isIntersectingEnoughRowsAndCols = function(originalCellsCount,
                                                                                                           newCellsCount) {
    if(newCellsCount.intersectedRowsCount < originalCellsCount.intersectedRowsCount ||
        newCellsCount.intersectedColsCount < originalCellsCount.intersectedColsCount) {
        return false;
    }

    return true;
}

/*
    Sometimes on the start of the drag dragged item can cover fractional count of cells,
    for example 3 full cells and 1/4 of fourth cell.(Center is not intersected) After draggable item clone
    movement it can intersect 4 cell centers, but we should still cover only 3 full cells. Later we will align
    the item to the most left or most right(most bottom or top vertically) side of all cells and depending on
    insertion type(Reversed or Default append) and will ensure, that draggable item is not out of grid bounds.
*/
Gridifier.Dragifier.Cells.prototype.normalizeCellsWithMaybeIntersectionOverflows = function(intersectedByDraggableItemCloneCellCenters,
                                                                                                                        originalCellsCount,
                                                                                                                        newCellsCount) {
    if(newCellsCount.intersectedRowsCount > originalCellsCount.intersectedRowsCount) {
        var rowsDifference = newCellsCount.intersectedRowsCount - originalCellsCount.intersectedRowsCount;
        for(var i = 0; i < rowsDifference; i++) {
            intersectedByDraggableItemCloneCellCenters.pop();
        }
    }

    if(newCellsCount.intersectedColsCount > originalCellsCount.intersectedColsCount) {
        var colsDifference = newCellsCount.intersectedColsCount - originalCellsCount.intersectedColsCount;
        for(var row = 0; row < intersectedByDraggableItemCloneCellCenters.length; row++) {
            for(var i = 0; i < colsDifference; i++) {
                intersectedByDraggableItemCloneCellCenters[row].pop();
            }
        }
    }

    var mergedIntersectedByDraggableItemCloneCellCenters = [];
    for(var row = 0; row < intersectedByDraggableItemCloneCellCenters.length; row++) {
        for(var col = 0; col < intersectedByDraggableItemCloneCellCenters[row].length; col++) {
            mergedIntersectedByDraggableItemCloneCellCenters.push(
                intersectedByDraggableItemCloneCellCenters[row][col]
            );
        }
    }

    return mergedIntersectedByDraggableItemCloneCellCenters;
}

Gridifier.Dragifier.GridDiscretizationDraggableItem = function(gridifier,
                                                               appender,
                                                               reversedAppender,
                                                               collector,
                                                               connections,
                                                               connectors,
                                                               guid,
                                                               settings,
                                                               sizesResolverManager,
                                                               eventEmitter) {
    var me = this;

    this._gridifier = null;
    this._appender = null;
    this._reversedAppender = null;
    this._collector = null;
    this._connections = null;
    this._connectors = null;
    this._guid = null;
    this._settings = null;
    this._sizesResolverManager = null;
    this._eventEmitter = null;

    this._dragifierCore = null;
    this._discretizer = null;
    this._dragifierCells = null;
    this._dragifierRenderer = null;

    this._dragIdentifiers = [];
    this._draggableItem = null;
    this._draggableItemConnection = null;
    this._draggableItemClone = null;
    this._draggableItemPointer = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._appender = appender;
        me._reversedAppender = reversedAppender;
        me._collector = collector;
        me._connections = connections;
        me._connectors = connectors;
        me._guid = guid;
        me._settings = settings;
        me._sizesResolverManager = sizesResolverManager;
        me._eventEmitter = eventEmitter;

        me._dragIdentifiers = [];

        me._dragifierRenderer = new Gridifier.Dragifier.Renderer(
            me._settings
        );
        me._dragifierCore = new Gridifier.Dragifier.Core(
            me._gridifier, 
            me._appender, 
            me._reversedAppender,
            me._collector,
            me._connectors, 
            me._connections,
            me._settings,
            me._guid,
            me._dragifierRenderer, 
            me._sizesResolverManager,
            me._eventEmitter
        );
        me._discretizer = new Gridifier.Discretizer(
            me._gridifier, me._connections, me._settings, me._sizesResolverManager
        );
        me._dragifierCells = new Gridifier.Dragifier.Cells(
            me._discretizer
        );

        me._bindEvents();
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

Gridifier.Dragifier.GridDiscretizationDraggableItem.REAPPEND_GRID_ITEMS_DELAY = 100;

Gridifier.Dragifier.GridDiscretizationDraggableItem.prototype.bindDraggableItem = function(item,
                                                                                           cursorX,
                                                                                           cursorY) {
    this._initDraggableItem(item);
    this._initDraggableItemConnection();

    this._dragifierCore.determineGridOffsets();
    this._dragifierCore.determineInitialCursorOffsetsFromDraggableItemCenter(
        this._draggableItem, cursorX, cursorY
    );

    this._draggableItemClone = this._dragifierCore.createDraggableItemClone(this._draggableItem);
    this._draggableItemPointer = this._dragifierCore.createDraggableItemPointer(this._draggableItem);

    this._discretizer.discretizeGrid();
    this._discretizer.markCellsIntersectedByItem(
        this._draggableItem, this._draggableItemConnection
    );
    this._discretizer.createDemonstrator();

    this._hideDraggableItem();
}

Gridifier.Dragifier.GridDiscretizationDraggableItem.prototype.getDraggableItem = function() {
    return this._draggableItem;
}

Gridifier.Dragifier.GridDiscretizationDraggableItem.prototype.addDragIdentifier = function(identifier) {
    this._dragIdentifiers.push(identifier);
}

Gridifier.Dragifier.GridDiscretizationDraggableItem.prototype.hasDragIdentifier = function(identifier) {
    for(var i = 0; i < this._dragIdentifiers.length; i++) {
        if(this._dragIdentifiers[i] == identifier)
            return true;
    }

    return false;
}

Gridifier.Dragifier.GridDiscretizationDraggableItem.prototype.removeDragIdentifier = function(identifier) {
    for(var i = 0; i < this._dragIdentifiers.length; i++) {
        if(this._dragIdentifiers[i] == identifier) {
            this._dragIdentifiers.splice(i, 1);
            break;
        }
    }
}

Gridifier.Dragifier.GridDiscretizationDraggableItem.prototype.getDragIdentifiersCount = function() {
    return this._dragIdentifiers.length;
}

Gridifier.Dragifier.GridDiscretizationDraggableItem.prototype._initDraggableItem = function(item) {
    this._draggableItem = item;
    if(Dom.isBrowserSupportingTransitions())
        Dom.css3.transitionProperty(this._draggableItem, "Visibility 0ms ease");
}

Gridifier.Dragifier.GridDiscretizationDraggableItem.prototype._initDraggableItemConnection = function() {
    this._draggableItemConnection = this._connections.findConnectionByItem(this._draggableItem);
    this._draggableItemConnection[Gridifier.SizesTransformer.RESTRICT_CONNECTION_COLLECT] = true;
}

Gridifier.Dragifier.GridDiscretizationDraggableItem.prototype._hideDraggableItem = function() {
    this._draggableItem.style.visibility = "hidden";
    this._draggableItem.setAttribute(Gridifier.Dragifier.IS_DRAGGABLE_ITEM_DATA_ATTR, "yes");

    var itemClonesManager = this._gridifier.getItemClonesManager();
    if(itemClonesManager.hasBindedClone(this._draggableItem)) {
        var draggableItemRendererClone = itemClonesManager.getBindedClone(this._draggableItem);
        draggableItemRendererClone.style.visibility = "hidden";
    }
}

Gridifier.Dragifier.GridDiscretizationDraggableItem.prototype.processDragMove = function(cursorX, cursorY) {
    var draggableItemCloneNewDocumentPosition = this._dragifierCore.calculateDraggableItemCloneNewDocumentPosition(
        this._draggableItem, cursorX, cursorY
    )

    this._dragifierRenderer.render(
        this._draggableItemClone,
        draggableItemCloneNewDocumentPosition.x,
        draggableItemCloneNewDocumentPosition.y
    );

    var draggableItemCloneNewGridPosition = this._dragifierCore.calculateDraggableItemCloneNewGridPosition(
        this._draggableItem, draggableItemCloneNewDocumentPosition
    );
    var intersectedByDraggableItemCellCentersData = this._dragifierCells.getIntersectedByDraggableItemCellCentersData(
        this._draggableItemConnection
    );
    var intersectedByDraggableItemCloneCellCentersData = this._discretizer.getAllCellsWithIntersectedCenterData(
        draggableItemCloneNewGridPosition
    );

    if(!this._dragifierCells.isAtLeastOneOfIntersectedCellCentersEmpty(
            intersectedByDraggableItemCloneCellCentersData))
        return;

    if(!this._dragifierCells.isIntersectingEnoughRowsAndCols(
            intersectedByDraggableItemCellCentersData, intersectedByDraggableItemCloneCellCentersData)) 
        return;

    this._transformGrid(this._dragifierCells.normalizeCellsWithMaybeIntersectionOverflows(
        intersectedByDraggableItemCloneCellCentersData.cellsWithIntersectedCenter,
        intersectedByDraggableItemCellCentersData,
        intersectedByDraggableItemCloneCellCentersData
    ));

    this._discretizer.updateDemonstrator();
}

Gridifier.Dragifier.GridDiscretizationDraggableItem.prototype._transformGrid = function(newIntersectedCells) {
    var draggableItemNewConnectionCoords = this._discretizer.intersectedCellsToCoords(newIntersectedCells);
    draggableItemNewConnectionCoords = this._discretizer.normalizeItemNewConnectionHorizontalCoords(
        this._draggableItem, draggableItemNewConnectionCoords
    );
    draggableItemNewConnectionCoords = this._discretizer.normalizeItemNewConnectionVerticalCoords(
        this._draggableItem, draggableItemNewConnectionCoords
    );

    this._adjustDraggableItemPositions(draggableItemNewConnectionCoords);
    this._discretizer.markCellsIntersectedByItem(
        this._draggableItem, draggableItemNewConnectionCoords
    );

    var me = this;
    setTimeout(function() {
        me._dragifierCore.reappendGridItems();
    }, Gridifier.Dragifier.GridDiscretizationDraggableItem.REAPPEND_GRID_ITEMS_DELAY);
}

Gridifier.Dragifier.GridDiscretizationDraggableItem.prototype._adjustDraggableItemPositions = function(draggableItemNewCoords) {
    this._draggableItemConnection.x1 = draggableItemNewCoords.x1;
    this._draggableItemConnection.x2 = draggableItemNewCoords.x2;
    this._draggableItemConnection.y1 = draggableItemNewCoords.y1;
    this._draggableItemConnection.y2 = draggableItemNewCoords.y2;

    var rendererCoordsChanger = this._settings.getCoordsChanger();
    var animationMsDuration = this._settings.getCoordsChangeAnimationMsDuration();
    var eventEmitter = this._settings.getEventEmitter();

    rendererCoordsChanger(
        this._draggableItem, 
        draggableItemNewCoords.x1 + "px", 
        draggableItemNewCoords.y1 + "px",
        animationMsDuration,
        eventEmitter,
        false
    );

    this._dragifierRenderer.render(
        this._draggableItemPointer,
        draggableItemNewCoords.x1,
        draggableItemNewCoords.y1
    );
}

Gridifier.Dragifier.GridDiscretizationDraggableItem.prototype.unbindDraggableItem = function() {
    document.body.removeChild(this._draggableItemClone);
    this._gridifier.getGrid().removeChild(this._draggableItemPointer);
    this._draggableItemConnection[Gridifier.SizesTransformer.RESTRICT_CONNECTION_COLLECT] = false;

    this._showDraggableItem();
    this._draggableItem = null;
    this._discretizer.deleteDemonstrator();
}

Gridifier.Dragifier.GridDiscretizationDraggableItem.prototype._showDraggableItem = function() {
    this._draggableItem.style.visibility = "visible";
    this._draggableItem.removeAttribute(Gridifier.Dragifier.IS_DRAGGABLE_ITEM_DATA_ATTR);
}

Gridifier.ApiSettingsErrors = function(error, errorType) {
    var me = this;

    this._error = null;
    this._isApiSettingsError = false;
    this._errorMsg = "";

    this._css = {
    };

    this._construct = function() {
        me._error = error;
        me._isApiSettingsError = false;
        me._errorMsg = "";

        me._parseIfIsApiSettingsError(errorType);
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

Gridifier.ApiSettingsErrors.prototype.isApiSettingsError = function() {
    return this._isApiSettingsError;
}

Gridifier.ApiSettingsErrors.prototype.getErrorMessage = function() {
    return this._errorMsg;
}

Gridifier.ApiSettingsErrors.prototype._parseIfIsApiSettingsError = function(errorType) {
    var errors = Gridifier.Error.ERROR_TYPES.SETTINGS;

    if(errorType == errors.INVALID_ONE_OF_TOGGLE_PARAMS) {
        this._markAsApiSettingsError();
        this._invalidOneOfToggleParamsError();
    }
    else if(errorType == errors.INVALID_ONE_OF_SORT_FUNCTION_TYPES || 
            errorType == errors.INVALID_ONE_OF_FILTER_FUNCTION_TYPES ||
            errorType == errors.INVALID_ONE_OF_COORDS_CHANGER_FUNCTION_TYPES ||
            errorType == errors.INVALID_ONE_OF_SIZES_CHANGER_FUNCTION_TYPES ||
            errorType == errors.INVALID_ONE_OF_DRAGGABLE_ITEM_DECORATOR_FUNCTION_TYPES) {
        this._markAsApiSettingsError();

        if(errorType == errors.INVALID_ONE_OF_SORT_FUNCTION_TYPES) {
            var paramName = "sort";
        }
        else if(errorType == errors.INVALID_ONE_OF_FILTER_FUNCTION_TYPES) {
            var paramName = "filter";
        }
        else if(errorType == errors.INVALID_ONE_OF_COORDS_CHANGER_FUNCTION_TYPES) {
            var paramName = "coordsChanger";
        }
        else if(errorType == errors.INVALID_ONE_OF_SIZES_CHANGER_FUNCTION_TYPES) {
            var paramName = "sizesChanger";
        }
        else if(errorType == errors.INVALID_ONE_OF_DRAGGABLE_ITEM_DECORATOR_FUNCTION_TYPES) {
            var paramName = "draggableItemDecorator";
        }

        this._invalidOneOfFunctionTypesError(paramName);
    }
    else if(errorType == errors.INVALID_TOGGLE_PARAM_VALUE || 
            errorType == errors.INVALID_SORT_PARAM_VALUE || 
            errorType == errors.INVALID_FILTER_PARAM_VALUE ||
            errorType == errors.INVALID_COORDS_CHANGER_PARAM_VALUE ||
            errorType == errors.INVALID_SIZES_CHANGER_PARAM_VALUE ||
            errorType == errors.INVALID_DRAGGABLE_ITEM_DECORATOR_PARAM_VALUE) {
        this._markAsApiSettingsError();

        if(errorType == errors.INVALID_TOGGLE_PARAM_VALUE) {
            var paramName = "toggle";
        }
        else if(errorType == errors.INVALID_SORT_PARAM_VALUE) {
            var paramName = "sort";
        }
        else if(errorType == errors.INVALID_FILTER_PARAM_VALUE) {
            var paramName = "filter";
        }
        else if(errorType == errors.INVALID_COORDS_CHANGER_PARAM_VALUE) {
            var paramName = "coordsChanger";
        }
        else if(errorType == errors.INVALID_SIZES_CHANGER_PARAM_VALUE) {
            var paramName = "sizesChanger";
        }
        else if(errorType == errors.INVALID_DRAGGABLE_ITEM_DECORATOR_PARAM_VALUE) {
            var paramName = "draggableItemDecorator";
        }

        this._invalidParamValueError(paramName);
    }
    else if(errorType == errors.SET_TOGGLE_INVALID_PARAM || 
            errorType == errors.SET_FILTER_INVALID_PARAM ||
            errorType == errors.SET_SORT_INVALID_PARAM ||
            errorType == errors.SET_COORDS_CHANGER_INVALID_PARAM ||
            errorType == errors.SET_SIZES_CHANGER_INVALID_PARAM ||
            errorType == errors.SET_DRAGGABLE_ITEM_DECORATOR_INVALID_PARAM) {
        this._markAsApiSettingsError();

        if(errorType == errors.SET_TOGGLE_INVALID_PARAM) {
            var functionName = "toggle";
        }
        else if(errorType == errors.SET_FILTER_INVALID_PARAM) {
            var functionName = "filter";
        }
        else if(errorType == errors.SET_SORT_INVALID_PARAM) {
            var functionName = "sort";
        }
        else if(errorType == errors.SET_COORDS_CHANGER_INVALID_PARAM) {
            var functionName = "coordsChanger";
        }
        else if(errorType == errors.SET_SIZES_CHANGER_INVALID_PARAM) {
            var functionName = "sizesChanger";
        }
        else if(errorType == errors.SET_DRAGGABLE_ITEM_DECORATOR_INVALID_PARAM) {
            var functionName = "draggableItemDecorator";
        }

        this._invalidSetterParamError(functionName);
    }
}

Gridifier.ApiSettingsErrors.prototype._markAsApiSettingsError = function() {
    this._isApiSettingsError = true;
}

Gridifier.ApiSettingsErrors.prototype._invalidOneOfToggleParamsError = function() {
    var msg = this._error.getErrorMsgPrefix();

    msg += "Wrong one of the 'toggle' params. It must be an object with show and hide function definitions.";
    msg += " Got: '" + this._error.getErrorParam() + "'.";

    this._errorMsg = msg;
}

Gridifier.ApiSettingsErrors.prototype._invalidOneOfFunctionTypesError = function(paramName) {
    var msg = this._error.getErrorMsgPrefix();
    msg += "Wrong one of the '" + paramName + "' functions. It must be a function. Got: '" + this._error.getErrorParam() + "'.";
    
    this._errorMsg = msg;
}

Gridifier.ApiSettingsErrors.prototype._invalidParamValueError = function(paramName) {
    var msg = this._error.getErrorMsgPrefix();

    msg += "Wrong '" + paramName + "' param value. It must be a function(which will be used by default), ";
    msg += "or an object with key(function name)-value(function body) pairs. Got: '" + this._error.getErrorParam() + "'.";

    this._errorMsg = msg;
}

Gridifier.ApiSettingsErrors.prototype._invalidSetterParamError = function(functionName) {
    var msg = this._error.getErrorMsgPrefix();

    msg += "Can't set '" + functionName + "' with name '" + this._error.getErrorParam() + "'.";
    msg += " It is not registred in Gridifier.";

    this._errorMsg = msg;
}

Gridifier.CollectorErrors = function(error, errorType) {
    var me = this;

    this._error = null;
    this._isCollectorError = false;
    this._errorMsg = "";

    this._css = {
    };

    this._construct = function() {
        me._error = error;
        me._isCollectorError = false;
        me._errorMsg = "";

        me._parseIfIsCollectorError(errorType);
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

Gridifier.CollectorErrors.prototype.isCollectorError = function() {
    return this._isCollectorError;
}

Gridifier.CollectorErrors.prototype.getErrorMessage = function() {
    return this._errorMsg;
}

Gridifier.CollectorErrors.prototype._parseIfIsCollectorError = function(errorType) {
    var errors = Gridifier.Error.ERROR_TYPES.COLLECTOR;

    if(errorType == errors.NOT_DOM_ELEMENT) {
        this._markAsCollectorError();
        this._notDomElementError();
    }
    else if(errorType == errors.ITEM_NOT_ATTACHED_TO_GRID) {
        this._markAsCollectorError();
        this._itemNotAttachedToGridError();
    }
    else if(errorType == errors.ITEM_NOT_CONNECTED_TO_GRID) {
        this._markAsCollectorError();
        this._itemNotConnectedToGridError();
    }
    else if(errorType == errors.ITEM_WIDER_THAN_GRID_WIDTH) {
        this._markAsCollectorError();
        this._itemWiderThanGridWidthError();
    }
    else if(errorType == errors.ITEM_TALLER_THAN_GRID_HEIGHT) {
        this._markAsCollectorError();
        this._itemTallerThanGridHeightError();
    }
}

Gridifier.CollectorErrors.prototype._markAsCollectorError = function() {
    this._isCollectorError = true;
}

Gridifier.CollectorErrors.prototype._notDomElementError = function() {
    var msg = this._error.getErrorMsgPrefix();

    msg += "One of the added elements to Gridifier is not DOM Element. Got: '";
    msg += this._error.getErrorParam() + "'.";

    this._errorMsg = msg;
}

Gridifier.CollectorErrors.prototype._itemNotAttachedToGridError = function() {
    var msg = this._error.getErrorMsgPrefix();

    msg += "One of the appended/prepended items is not attached to grid. Item: '";
    msg += this._error.getErrorParam() + "'.";

    this._errorMsg = msg;
}

Gridifier.CollectorErrors.prototype._itemNotConnectedToGridError = function() {
    var msg = this._error.getErrorMsgPrefix();

    msg += "One of items is not connected to grid. Item: '";
    msg += this._error.getErrorParam() + "'.";

    this._errorMsg = msg;
}

Gridifier.CollectorErrors.prototype._itemWiderThanGridWidthError = function() {
    var msg = this._error.getErrorMsgPrefix();
    var error = this._error.getErrorObjectParam();

    msg += "Item '" + error.item + "' is wider than grid. Grid type: 'Vertical Grid'. ";
    msg += "Grid width: '" + error.gridWidth + "px'. Item width: '" + error.itemWidth + "px'.";

    this._errorMsg = msg;
}

Gridifier.CollectorErrors.prototype._itemTallerThanGridHeightError = function() {
    var msg = this._error.getErrorMsgPrefix();
    var error = this._error.getErrorObjectParam();

    msg += "Item '" + error.item + "' is taller than grid. Grid type: 'Horizontal Grid'. ";
    msg += "Grid height: '" + error.gridHeight + "px'. Item height: '" + error.itemHeight + "px'.";

    this._errorMsg = msg;
}

Gridifier.CoreErrors = function(error, errorType) {
    var me = this;

    this._error = null;
    this._isCoreError = false;
    this._errorMsg = "";

    this._css = {
    };

    this._construct = function() {
        me._error = error;
        me._isCoreError = false;
        me._errorMsg = "";

        me._parseIfIsCoreError(errorType);
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

Gridifier.CoreErrors.prototype.isCoreError = function() {
    return this._isCoreError;
}

Gridifier.CoreErrors.prototype.getErrorMessage = function() {
    return this._errorMsg;
}

Gridifier.CoreErrors.prototype._parseIfIsCoreError = function(errorType) {
    var errors = Gridifier.Error.ERROR_TYPES;

    if(errorType == errors.EXTRACT_GRID) {
        this._markAsCoreError();
        this._notDomElementError();
    }
    else if(errorType == errors.CONNECTIONS.NO_CONNECTIONS) {
        this._markAsCoreError();
        this._noConnectionsError();
    }
    else if(errorType == errors.CONNECTIONS.CONNECTION_BY_ITEM_NOT_FOUND) {
        this._markAsCoreError();
        this._connectionByItemNotFoundError();
    }
    else if(errorType == errors.SIZES_TRANSFORMER.WRONG_TARGET_TRANSFORMATION_SIZES) {
        this._markAsCoreError();
        this._wrongTargetTransformationSizesError();
    }
    else if(errorType == errors.APPENDER.WRONG_INSERT_BEFORE_TARGET_ITEM) {
        this._markAsCoreError();
        this._wrongInsertBeforeTargetItem();
    }
    else if(errorType == errors.APPENDER.WRONG_INSERT_AFTER_TARGET_ITEM) {
        this._markAsCoreError();
        this._wrongInsertAfterTargetItem();
    }
    else if(errorType == errors.INSERTER.TOO_WIDE_ITEM_ON_VERTICAL_GRID_INSERT) {
        this._markAsCoreError();
        this._tooWideItemOnVerticalGridInsert();
    }
    else if(errorType == errors.INSERTER.TOO_TALL_ITEM_ON_HORIZONTAL_GRID_INSERT) {
        this._markAsCoreError();
        this._tooTallItemOnHorizontalGridInsert();
    }
}

Gridifier.CoreErrors.prototype._markAsCoreError = function() {
    this._isCoreError = true;
}

Gridifier.CoreErrors.prototype._notDomElementError = function() {
    var msg = this._error.getErrorMsgPrefix();
    
    msg += "Can't get grid layout DOM element. Currently gridifier supports ";
    msg += "native DOM elements, as well as jQuery objects. ";

    this._errorMsg = msg;
}

Gridifier.CoreErrors.prototype._noConnectionsError = function() {
    var msg = this._error.getErrorMsgPrefix();
    msg += "Can't find any item, that was processed by Gridifier.";

    this._errorMsg = msg;
}

Gridifier.CoreErrors.prototype._connectionByItemNotFoundError = function() {
    var msg = this._error.getErrorMsgPrefix();
    var error = this._error.getErrorObjectParam();

    msg += "Can't find connection by item.\n";
    msg += "Item: \n" + error.item + "\n";
    msg += "Connections:\n";
    for(var i = 0; i < error.connections.length; i++)
        msg += error.connections[i] + "\n";

    this._errorMsg = msg;
}

Gridifier.CoreErrors.prototype._wrongTargetTransformationSizesError = function() {
    var msg = this._error.getErrorMsgPrefix();
    var error = this._error.getErrorParam();

    msg += "Wrong target transformation sizes. 'transformSizes' and 'toggleSizes' functions accepts 4 types of values:\n";
    msg += "    gridifier.transformSizes(item, '100px', '60%'); // px or % values\n";
    msg += "    gridifier.transformSizes(item, 100, 200.5); // values without postfix will be parsed as px value.";
    msg += "    gridifier.transformSizes(item, '*2', '/0.5'); // values with multiplication or division expressions.";

    this._errorMsg = msg;
}

Gridifier.CoreErrors.prototype._wrongInsertBeforeTargetItem = function() {
    var msg = this._error.getErrorMsgPrefix();
    var error = this._error.getErrorParam();

    msg += "Wrong target item passed to the insertBefore function. It must be item, which was processed by gridifier. ";
    msg += "Got: " + error + ".";

    this._errorMsg = msg;
}

Gridifier.CoreErrors.prototype._wrongInsertAfterTargetItem = function() {
    var msg = this._error.getErrorMsgPrefix();
    var error = this._error.getErrorParam();

    msg += "Wrong target item passed to the insertAfter function. It must be item, which was processed by gridifier. ";
    msg += "Got: " + error + ".";

    this._errorMsg = msg;
}

Gridifier.CoreErrors.prototype._tooWideItemOnVerticalGridInsert = function() {
    var msg = this._error.getErrorMsgPrefix();
    var error = this._error.getErrorParam();

    msg += "Can't insert item '" + error + "'. Probably it has px based width and it's width is wider than grid width. ";
    msg += "This can happen in such cases:\n";
    msg += "    1. Px-width item is wider than grid from start.(Before attaching to gridifier)\n";
    msg += "    2. Px-width item became wider than grid after grid resize.\n";
    msg += "    3. Px-width item became wider after applying transform/toggle operation.\n";

    this._errorMsg = msg;
}

Gridifier.CoreErrors.prototype._tooTallItemOnHorizontalGridInsert = function() {
    var msg = this._error.getErrorMsgPrefix();
    var error = this._error.getErrorParam();

    msg += "Can't insert item '" + error + "'. Probably it has px based height and it's height is taller than grid height. ";
    msg += "This can happend in such cases:\n";
    msg += "    1. Px-height item is taller than grid from start.(Before attaching to gridifier)\n";
    msg += "    2. Px-height item became taller than grid after grid resize.\n";
    msg += "    3. Px-height item became taller after applying transform/toggle operation.\n";

    this._errorMsg = msg;
}

Gridifier.CoreSettingsErrors = function(error, errorType) {
    var me = this;

    this._error = null;
    this._isCoreSettingsError = false;
    this._errorMsg = "";

    this._css = {
    };

    this._construct = function() {
        me._error = error;
        me._isCoreSettingsError = false;
        me._errorMsg = "";

        me._parseIfIsCoreSettingsError(errorType);
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

Gridifier.CoreSettingsErrors.prototype.isCoreSettingsError = function() {
    return this._isCoreSettingsError;
}

Gridifier.CoreSettingsErrors.prototype.getErrorMessage = function() {
    return this._errorMsg;
}

Gridifier.CoreSettingsErrors.prototype._parseIfIsCoreSettingsError = function(errorType) {
    var errors = Gridifier.Error.ERROR_TYPES.SETTINGS;

    if(errorType == errors.INVALID_GRID_TYPE) {
        this._markAsCoreSettingsError();
        this._invalidGridTypeError();
    }
    else if(errorType == errors.INVALID_PREPEND_TYPE) {
        this._markAsCoreSettingsError();
        this._invalidPrependTypeError();
    }
    else if(errorType == errors.INVALID_APPEND_TYPE) {
        this._markAsCoreSettingsError();
        this._invalidAppendTypeError();
    }
    else if(errorType == errors.INVALID_INTERSECTION_STRATEGY) {
        this._markAsCoreSettingsError();
        this._invalidIntersectionStrategyError();
    }
    else if(errorType == errors.INVALID_ALIGNMENT_TYPE) {
        this._markAsCoreSettingsError();
        this._invalidAlignmentTypeError();
    }
    else if(errorType == errors.INVALID_SORT_DISPERSION_MODE) {
        this._markAsCoreSettingsError();
        this._invalidSortDispersionModeError();
    }
    else if(errorType == errors.MISSING_SORT_DISPERSION_VALUE) {
        this._markAsCoreSettingsError();
        this._missingSortDispersionValueError();
    }
    else if(errorType == errors.INVALID_SORT_DISPERSION_VALUE) {
        this._markAsCoreSettingsError();
        this._invalidSortDispersionValueError();
    }
    else if(errorType == errors.INVALID_DRAGIFIER_DISCRETIZATION_MODE) {
        this._markAsCoreSettingsError();
        this._invalidDragifierDiscretizationModeError();
    }
}

Gridifier.CoreSettingsErrors.prototype._markAsCoreSettingsError = function() {
    this._isCoreSettingsError = true;
}

Gridifier.CoreSettingsErrors.prototype._invalidGridTypeError = function() {
    var msg = this._error.getErrorMsgPrefix();

    msg += "Wrong 'gridType' param value. Got: '" + this._error.getErrorParam() + "'. ";
    msg += "Available types: " + Gridifier.GRID_TYPES.VERTICAL_GRID;
    msg += ", " + Gridifier.GRID_TYPES.HORIZONTAL_GRID + ".";

    this._errorMsg = msg;
}

Gridifier.CoreSettingsErrors.prototype._invalidPrependTypeError = function() {
    var msg = this._error.getErrorMsgPrefix();

    msg += "Wrong 'prependType' param value. Got: '" + this._error.getErrorParam() + "'. ";
    msg += "Available types: " + Gridifier.PREPEND_TYPES.MIRRORED_PREPEND;
    msg += " , " + Gridifier.PREPEND_TYPES.DEFAULT_PREPEND;
    msg += " , " + Gridifier.PREPEND_TYPES.REVERSED_PREPEND + ".";

    this._errorMsg = msg;
}

Gridifier.CoreSettingsErrors.prototype._invalidAppendTypeError = function() {
    var msg = this._error.getErrorMsgPrefix();

    msg += "Wrong 'appendType' param value. Got: '" + this._error.getErrorParam() + "'. ";
    msg += "Available types: " + Gridifier.APPEND_TYPES.DEFAULT_APPEND;
    msg += " , " + Gridifier.APPEND_TYPES.REVERSED_APPEND + ".";

    this._errorMsg = msg;
}

Gridifier.CoreSettingsErrors.prototype._invalidIntersectionStrategyError = function() {
    var msg = this._error.getErrorMsgPrefix();

    msg += "Wrong 'intersectionStrategy' param value. Got: '" + this._error.getErrorParam() + "'. ";
    msg += "Available strategies: " + Gridifier.INTERSECTION_STRATEGIES.DEFAULT;
    msg += " , " + Gridifier.INTERSECTION_STRATEGIES.REVERSED;

    this._errorMsg = msg;
}

Gridifier.CoreSettingsErrors.prototype._invalidAlignmentTypeError = function() {
    var msg = this._error.getErrorMsgPrefix();

    var alignmentTypes = Gridifier.INTERSECTION_STRATEGY_ALIGNMENT_TYPES;
    var verticalAlignmentTypes = alignmentTypes.FOR_VERTICAL_GRID;
    var horizontalAlignmentTypes = alignmentTypes.FOR_HORIZONTAL_GRID;

    msg += "Wrong 'alignmentType' param value. Got: '" + this._error.getErrorParam() + "'. ";
    msg += "Available values: ";
    msg += verticalAlignmentTypes.TOP + ", ";
    msg += verticalAlignmentTypes.CENTER + ", ";
    msg += verticalAlignmentTypes.BOTTOM + "(For vertical grids), ";
    msg += horizontalAlignmentTypes.LEFT + ", ";
    msg += horizontalAlignmentTypes.CENTER + ", ";
    msg += horizontalAlignmentTypes.RIGHT + "(For horizontal grids). ";

    this._errorMsg = msg;
}

Gridifier.CoreSettingsErrors.prototype._invalidSortDispersionModeError = function() {
    var msg = this._error.getErrorMsgPrefix();

    msg += "Wrong 'sortDispersionMode' param value. Got: '" + this._error.getErrorParam() + "'. ";
    msg += "Available modes: " + Gridifier.SORT_DISPERSION_MODES.DISABLED;
    msg += " , " + Gridifier.SORT_DISPERSION_MODES.CUSTOM;
    msg += " , " + Gridifier.SORT_DISPERSION_MODES.CUSTOM_ALL_EMPTY_SPACE;

    this._errorMsg = msg;
}

Gridifier.CoreSettingsErrors.prototype._missingSortDispersionModeError = function() {
    var msg = this._error.getErrorMsgPrefix();
    msg += "You have chosen custom sort dispersion mode, but didn't provided required 'sortDispersionValue' param."
    
    this._errorMsg = msg;
}

Gridifier.CoreSettingsErrors.prototype._invalidSortDispersionValueError = function() {
    var msg = this._error.getErrorMsgPrefix();

    msg += "Wrong 'sortDispersionValue' param value. It must be a string with number as prefix, ";
    msg += "and px as postfix.(100px). Got: '" + this._error.getErrorParam() + "'.";

    this._errorMsg = msg;
}

Gridifier.CoreSettingsErrors.prototype._invalidDragifierDiscretizationModeError = function() {
    var msg = this._error.getErrorMsgPrefix();

    msg += "Can't combine 'gridDiscretization' dragifier algorithm param with following settings: \n";
    msg += "    1. 'discretization' dragifier mode doesn't support noIntersections strategy.\n";
    msg += "    2. 'discretization' dragifier mode requires 'sortDispersion' parameter to be equal to the 'customAllEmptySpace' value.";
    msg += " (This mode must have all grid space available per drags.)";

    this._errorMsg = msg;
}

Gridifier.Error = function(errorType, errorParam) {
    var me = this;

    this._errorParam = null;

    this._coreErrors = null;
    this._collectorErrors = null;
    this._apiSettingsErrors = null;
    this._coreSettingsErrors = null;

    this._css = {
    };

    this._construct = function() {
        me._errorParam = errorParam || null;

        me._coreErrors = new Gridifier.CoreErrors(me, errorType);
        me._collectorErrors = new Gridifier.CollectorErrors(me, errorType);
        me._apiSettingsErrors = new Gridifier.ApiSettingsErrors(me, errorType);
        me._coreSettingsErrors = new Gridifier.CoreSettingsErrors(me, errorType);

        if(me._coreErrors.isCoreError()) {
            var errorMsg = me._coreErrors.getErrorMessage();
        }
        else if(me._collectorErrors.isCollectorError()) {
            var errorMsg = me._collectorErrors.getErrorMessage();
        }
        else if(me._apiSettingsErrors.isApiSettingsError()) {
            var errorMsg = me._apiSettingsErrors.getErrorMessage();
        }
        else if(me._coreSettingsErrors.isCoreSettingsError()) {
            var errorMsg = me._coreSettingsErrors.getErrorMessage();
        }
        else {
            throw new Error("Gridifier Error -> Wrong error type: " + errorType);
        }

        throw new Error(errorMsg);
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

Gridifier.Error.ERROR_TYPES = {
    EXTRACT_GRID: 0,
    SETTINGS: {
        /* Core settings errors */
        INVALID_GRID_TYPE: 1,
        INVALID_PREPEND_TYPE: 2,
        INVALID_APPEND_TYPE: 3,
        INVALID_INTERSECTION_STRATEGY: 4,
        INVALID_ALIGNMENT_TYPE: 5,
        INVALID_SORT_DISPERSION_MODE: 6,
        MISSING_SORT_DISPERSION_VALUE: 7,
        INVALID_SORT_DISPERSION_VALUE: 8,
        
        /* Api settings errors */
        INVALID_SORT_PARAM_VALUE: 9,
        INVALID_ONE_OF_SORT_FUNCTION_TYPES: 10,

        INVALID_FILTER_PARAM_VALUE: 11,
        INVALID_ONE_OF_FILTER_FUNCTION_TYPES: 12,

        INVALID_TOGGLE_PARAM_VALUE: 13,
        INVALID_ONE_OF_TOGGLE_PARAMS: 14,

        INVALID_COORDS_CHANGER_PARAM_VALUE: 15,
        INVALID_ONE_OF_COORDS_CHANGER_FUNCTION_TYPES: 16,

        INVALID_SIZES_CHANGER_PARAM_VALUE: 17,
        INVALID_ONE_OF_SIZES_CHANGER_FUNCTION_TYPES: 18,

        INVALID_DRAGGABLE_ITEM_DECORATOR_PARAM_VALUE: 37,
        INVALID_ONE_OF_DRAGGABLE_ITEM_DECORATOR_FUNCTION_TYPES: 38,

        SET_TOGGLE_INVALID_PARAM: 19,
        SET_FILTER_INVALID_PARAM: 20,
        SET_SORT_INVALID_PARAM: 21,
        SET_COORDS_CHANGER_INVALID_PARAM: 22,
        SET_SIZES_CHANGER_INVALID_PARAM: 23,
        SET_DRAGGABLE_ITEM_DECORATOR_INVALID_PARAM: 36,

        INVALID_DRAGIFIER_DISCRETIZATION_MODE: 40
    },
    COLLECTOR: {
        NOT_DOM_ELEMENT: 24,
        ITEM_NOT_ATTACHED_TO_GRID: 25,
        ITEM_NOT_CONNECTED_TO_GRID: 26,
        ITEM_WIDER_THAN_GRID_WIDTH: 27,
        ITEM_TALLER_THAN_GRID_HEIGHT: 28
    },
    CONNECTIONS: {
        NO_CONNECTIONS: 29,
        CONNECTION_BY_ITEM_NOT_FOUND: 30
    },
    SIZES_TRANSFORMER: {
        WRONG_TARGET_TRANSFORMATION_SIZES: 31
    },
    APPENDER: {
        WRONG_INSERT_BEFORE_TARGET_ITEM: 32,
        WRONG_INSERT_AFTER_TARGET_ITEM: 33
    },
    INSERTER: {
        TOO_WIDE_ITEM_ON_VERTICAL_GRID_INSERT: 34,
        TOO_TALL_ITEM_ON_HORIZONTAL_GRID_INSERT: 35
    }
}

Gridifier.Error.prototype.getErrorMsgPrefix = function() {
    return "Gridifier error: ";
}

Gridifier.Error.prototype.getErrorApiUrlPrefix = function() {
    return "http://gridifier.io/api/errors/";
}

Gridifier.Error.prototype.getErrorParam = function() {
    return this._errorParam + "(" + (typeof this._errorParam) + ")";
}

Gridifier.Error.prototype.getErrorObjectParam = function() {
    return this._errorParam;
}

Gridifier.Grid = function(grid, sizesResolverManager) {
    var me = this;

    this._grid = null;
    this._collector = null;
    this._sizesResolverManager = null;

    this._css = {
    };

    this._construct = function() {
        me._grid = grid;
        me._sizesResolverManager = sizesResolverManager;

        me._extractGrid(grid);
        me._adjustGridCss();
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

Gridifier.Grid.prototype.setCollectorInstance = function(collector) {
    this._collector = collector;
}

Gridifier.Grid.prototype._extractGrid = function(grid) {
    if(Dom.isJqueryObject(grid))
        this._grid = grid.get(0);
    else if(Dom.isNativeDOMObject(grid))
        this._grid = grid;
    else
        new Gridifier.Error(Gridifier.Error.ERROR_TYPES.EXTRACT_GRID);
}

Gridifier.Grid.prototype._adjustGridCss = function() {
    var gridComputedCSS = SizesResolver.getComputedCSS(this._grid);
    if(gridComputedCSS.position != "relative" && gridComputedCSS.position != "absolute")
        Dom.css.set(this._grid, {"position": "relative"});
}

Gridifier.Grid.prototype.getGrid = function() {
    return this._grid;
}

Gridifier.Grid.prototype.getGridX2 = function() {
    return this._sizesResolverManager.outerWidth(this._grid, false, true) - 1;
}

Gridifier.Grid.prototype.getGridY2 = function() {
    return this._sizesResolverManager.outerHeight(this._grid, false, true) - 1;
}

Gridifier.Grid.prototype.addToGrid = function(items) {
    var items = this._collector.toDOMCollection(items);
    for(var i = 0; i < items.length; i++) {
        this._grid.appendChild(items[i]);
    }

    this._collector.attachToGrid(items);
}

Gridifier.Grid.prototype.markAsGridItem = function(items) {
    var items = this._collector.toDOMCollection(items);
    this._collector.attachToGrid(items);
}

Gridifier.GridSizesUpdater = function(grid,
                                      connections,
                                      settings,
                                      eventEmitter) {
    var me = this;

    me._grid = null;
    me._connections = null;
    me._settings = null;
    me._eventEmitter = null;

    me._gridSizesUpdateTimeout = null;

    this._css = {
    };

    this._construct = function() {
        me._grid = grid;
        me._connections = connections;
        me._settings = settings;
        me._eventEmitter = eventEmitter;
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

Gridifier.GridSizesUpdater.prototype.scheduleGridSizesUpdate = function() {
    if(this._gridSizesUpdateTimeout != null) {
        clearTimeout(this._gridSizesUpdateTimeout);
        this._gridSizesUpdateTimeout = null;
    }
    
    var me = this;
    this._gridSizesUpdateTimeout = setTimeout(function() {
        if(me._settings.isVerticalGrid()) {
            me._updateVerticalGridSizes.call(me);
        }
        else if(me._settings.isHorizontalGrid()) {
            me._updateHorizontalGridSizes.call(me);
        }
    }, this._settings.getGridTransformTimeout());
}

Gridifier.GridSizesUpdater.prototype._updateVerticalGridSizes = function() {
    var connections = this._connections.get();
    if(connections.length == 0)
        return;

    var gridHeight = connections[0].y2;
    for(var i = 1; i < connections.length; i++) {
        if(connections[i].y2 > gridHeight)
            gridHeight = connections[i].y2;
    }

    if(this._settings.isExpandGridTransformType()) {
        if(this._grid.getGridY2() < gridHeight)
            Dom.css.set(this._grid.getGrid(), {"height": (gridHeight + 1) + "px"});
    }
    else if(this._settings.isFitGridTransformType()) {
        Dom.css.set(this._grid.getGrid(), {"height": (gridHeight + 1) + "px"});
    }
    
    this._eventEmitter.emitGridSizesChangeEvent(
        this._grid.getGrid(), this._grid.getGridX2() + 1, gridHeight + 1
    );
}

Gridifier.GridSizesUpdater.prototype._updateHorizontalGridSizes = function() {
    var connections = this._connections.get();
    if(connections.length == 0)
        return;

    var gridWidth = connections[0].x2;
    for(var i = 1; i < connections.length; i++) {
        if(connections[i].x2 > gridWidth)
            gridWidth = connections[i].x2;
    }

    if(this._settings.isExpandGridTransformType()) {
        if(this._grid.getGridX2() < gridWidth)
            Dom.css.set(this._grid.getGrid(), {"width": (gridWidth + 1) + "px"});
    }
    else if(this._settings.isFitGridTransformType()) {
        Dom.css.set(this._grid.getGrid(), {"width": (gridWidth + 1) + "px"});
    }
    
    this._eventEmitter.emitGridSizesChangeEvent(
        this._grid.getGrid(), gridWidth + 1, this._grid.getGridY2() + 1
    );
}

Gridifier.HorizontalGrid.Appender = function(gridifier, 
                                             settings, 
                                             sizesResolverManager,
                                             connectors, 
                                             connections, 
                                             guid, 
                                             renderer, 
                                             normalizer,
                                             operation) {
    var me = this;

    this._gridifier = null;
    this._settings = null;
    this._sizesResolverManager = null;
    this._guid = null;
    this._renderer = null;
    this._normalizer = null;
    this._operation = null;
    this._connectors = null;
    this._connections = null;

    this._connectorsCleaner = null;
    this._connectorsShifter = null;
    this._connectorsSelector = null;
    this._connectorsSorter = null;
    this._itemCoordsExtractor = null;
    this._connectionsIntersector = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._settings = settings;
        me._sizesResolverManager = sizesResolverManager;
        me._guid = guid;
        me._renderer = renderer;
        me._normalizer = normalizer;
        me._operation = operation;
        me._connectors = connectors;
        me._connections = connections;

        me._connectorsCleaner = new Gridifier.HorizontalGrid.ConnectorsCleaner(
            me._connectors, me._connections, me._settings
        );
        me._connectorsShifter = new Gridifier.ConnectorsShifter(
            me._gridifier, me._connections, me._settings
        );
        me._connectorsSelector = new Gridifier.HorizontalGrid.ConnectorsSelector(me._guid);
        me._connectorsSorter = new Gridifier.HorizontalGrid.ConnectorsSorter();
        me._itemCoordsExtractor = new Gridifier.HorizontalGrid.ItemCoordsExtractor(me._gridifier, me._sizesResolverManager);
        me._connectionsIntersector = new Gridifier.HorizontalGrid.ConnectionsIntersector(me._connections);
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

Gridifier.HorizontalGrid.Appender.prototype.append = function(item) {
    this._initConnectors();
    
    var connection = this._createConnectionPerItem(item);
    this._connections.attachConnectionToRanges(connection);
    this._connectorsCleaner.deleteAllTooLeftConnectorsFromMostRightConnector();
    this._connectorsCleaner.deleteAllIntersectedFromRightConnectors();
    
    if(this._settings.isDefaultIntersectionStrategy())
        this._renderer.showConnections(connection);
    else if(this._settings.isNoIntersectionsStrategy()) {
        var colConnections = this._connections.getLastColHorizontallyExpandedConnections();

        for(var i = 0; i < colConnections.length; i++) {
            if(colConnections[i].itemGUID == connection.itemGUID) {
                colConnections.splice(i, 1);
                i--;
            }
        }

        this._renderer.renderConnectionsAfterDelay(colConnections);
        this._renderer.showConnections(connection);
    }
}

Gridifier.HorizontalGrid.Appender.prototype._initConnectors = function() {
    if(this._operation.isInitialOperation(Gridifier.OPERATIONS.APPEND)) {
        this.createInitialConnector();
        return;
    }

    if(!this._operation.isCurrentOperationSameAsPrevious(Gridifier.OPERATIONS.APPEND)) {
        this.recreateConnectorsPerAllConnectedItems();
        this._connectorsCleaner.deleteAllIntersectedFromRightConnectors();
        this._connectorsCleaner.deleteAllTooLeftConnectorsFromMostRightConnector();
    }
}

Gridifier.HorizontalGrid.Appender.prototype.createInitialConnector = function() {
    this._connectors.addAppendConnector(
        Gridifier.Connectors.SIDES.RIGHT.TOP,
        0,
        0
    );
}

Gridifier.HorizontalGrid.Appender.prototype.recreateConnectorsPerAllConnectedItems = function(disableFlush) {
    var disableFlush = disableFlush || false;
    if(!disableFlush)
        this._connectors.flush();

    var connections = this._connections.get();
    for(var i = 0; i < connections.length; i++) {
        this._addItemConnectors(connections[i], connections[i].itemGUID);
    }

    if(this._connectors.count() == 0) 
        this.createInitialConnector();
}

Gridifier.HorizontalGrid.Appender.prototype._addItemConnectors = function(itemCoords, itemGUID) {
    if((itemCoords.y2 + 1) <= this._gridifier.getGridY2()) {
        this._connectors.addAppendConnector(
            Gridifier.Connectors.SIDES.BOTTOM.LEFT,
            parseFloat(itemCoords.x1),
            parseFloat(itemCoords.y2 + 1),
            Dom.toInt(itemGUID)
        );
    }

    this._connectors.addAppendConnector(
        Gridifier.Connectors.SIDES.RIGHT.TOP,
        parseFloat(itemCoords.x2 + 1),
        parseFloat(itemCoords.y1),
        Dom.toInt(itemGUID)
    );
}

Gridifier.HorizontalGrid.Appender.prototype._createConnectionPerItem = function(item) {
    var sortedConnectors = this._filterConnectorsPerNextConnection();
    var itemConnectionCoords = this._findItemConnectionCoords(item, sortedConnectors);
    var connection = this._connections.add(item, itemConnectionCoords);
    
    if(this._settings.isNoIntersectionsStrategy()) {
        this._connections.expandHorizontallyAllColConnectionsToMostWide(connection);
    }
    this._addItemConnectors(itemConnectionCoords, this._guid.getItemGUID(item));
    
    return connection;
}

Gridifier.HorizontalGrid.Appender.prototype._filterConnectorsPerNextConnection = function() {
    var connectors = this._connectors.getClone();

    this._connectorsSelector.attachConnectors(connectors);
    this._connectorsSelector.selectOnlySpecifiedSideConnectorsOnPrependedItems(Gridifier.Connectors.SIDES.RIGHT.TOP);
    connectors = this._connectorsSelector.getSelectedConnectors();

    if(this._settings.isDefaultIntersectionStrategy()) {
        this._connectorsShifter.attachConnectors(connectors);
        this._connectorsShifter.shiftAllConnectors();
        connectors = this._connectorsShifter.getAllConnectors();
    }
    else if(this._settings.isNoIntersectionsStrategy()) {
        var connectorsSide = Gridifier.Connectors.SIDES.RIGHT.TOP;

        this._connectorsSelector.attachConnectors(connectors);
        this._connectorsSelector.selectOnlyMostRightConnectorFromSide(connectorsSide);
        connectors = this._connectorsSelector.getSelectedConnectors();
        
        this._connectorsShifter.attachConnectors(connectors);
        this._connectorsShifter.shiftAllWithSpecifiedSideToTopGridCorner(connectorsSide);
        connectors = this._connectorsShifter.getAllConnectors();
    }
    
    this._connectorsSorter.attachConnectors(connectors); 
    this._connectorsSorter.sortConnectorsForAppend(Gridifier.APPEND_TYPES.DEFAULT_APPEND);
    
    return this._connectorsSorter.getConnectors();
}

Gridifier.HorizontalGrid.Appender.prototype._findItemConnectionCoords = function(item, sortedConnectors) {
    var itemConnectionCoords = null;
    
    for(var i = 0; i < sortedConnectors.length; i++) {
        var itemCoords = this._itemCoordsExtractor.connectorToAppendedItemCoords(item, sortedConnectors[i]);

        if(itemCoords.y2 > this._normalizer.normalizeHighRounding(this._gridifier.getGridY2())) {
            continue;
        }
        
        var maybeIntersectableConnections = this._connectionsIntersector.findAllMaybeIntersectableConnectionsOnAppend(
            sortedConnectors[i]
        );
        if(this._connectionsIntersector.isIntersectingAnyConnection(maybeIntersectableConnections, itemCoords)) {
            continue;
        }
        
        itemConnectionCoords = itemCoords;
        
        var connectionsBehindCurrent = this._connections.getAllConnectionsBehindX(itemCoords.x2);
        if(this._connections.isAnyConnectionItemGUIDSmallerThan(connectionsBehindCurrent, item)) {
            continue;
        }

        if(this._settings.isNoIntersectionsStrategy()) {
            if(this._connections.isIntersectingMoreThanOneConnectionItemHorizontally(itemConnectionCoords)) {
                itemConnectionCoords = null;
            }
        }
        
        if(itemConnectionCoords != null) {
            break;
        }
    }

    if(itemConnectionCoords == null) {
        var errorType = Gridifier.Error.ERROR_TYPES.INSERTER.TOO_TALL_ITEM_ON_HORIZONTAL_GRID_INSERT;
        new Gridifier.Error(errorType, item);
    }

    return itemConnectionCoords;
}

Gridifier.HorizontalGrid.Connections = function(gridifier, guid, settings, sizesResolverManager, eventEmitter) {
    var me = this;

    this._gridifier = null;
    this._guid = null;
    this._settings = null;
    this._sizesResolverManager = null;
    this._eventEmitter = null;

    this._itemCoordsExtractor = null;
    this._sizesTransformer = null;
    this._connectionsCore = null;
    this._connectionsHorizontalIntersector = null;

    this._connections = [];
    this._ranges = null;
    this._sorter = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._guid = guid;
        me._settings = settings;
        me._sizesResolverManager = sizesResolverManager;
        me._eventEmitter = eventEmitter;

        me._ranges = new Gridifier.HorizontalGrid.ConnectionsRanges(me);
        me._ranges.init();

        me._sorter = new Gridifier.HorizontalGrid.ConnectionsSorter(
            me, me._settings, me._guid
        );
        me._itemCoordsExtractor = new Gridifier.HorizontalGrid.ItemCoordsExtractor(
            me._gridifier, me._sizesResolverManager
        );

        me._connectionsCore = new Gridifier.Connections(
            me._gridifier, me, me._guid, me._sorter, me._sizesResolverManager
        );
        me._connectionsHorizontalIntersector = new Gridifier.HorizontalGrid.ConnectionsHorizontalIntersector(
            me, me._settings, me._itemCoordsExtractor
        );
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

Gridifier.HorizontalGrid.Connections.prototype.getConnectionsSorter = function() {
    return this._sorter;
}

Gridifier.HorizontalGrid.Connections.prototype.setSizesTransformerInstance = function(sizesTransformer) {
    this._sizesTransformer = sizesTransformer;
    this._connectionsCore.setSizesTransformerInstance(sizesTransformer);
}

Gridifier.HorizontalGrid.Connections.prototype.attachConnectionToRanges = function(connection) {
    this._ranges.attachConnection(connection, this._connections.length - 1);
}

Gridifier.HorizontalGrid.Connections.prototype.reinitRanges = function() {
    this._ranges.init();
}

Gridifier.HorizontalGrid.Connections.prototype.getAllVerticallyIntersectedAndLeftConnections = function(connector) {
    //return this._ranges.getAllConnectionsFromIntersectedAndUpperRanges(connector.y);
    return this._ranges.getAllConnectionsFromIntersectedAndLeftRanges(connector.x);
}

Gridifier.HorizontalGrid.Connections.prototype.getAllVerticallyIntersectedConnections = function(connector) {
    return this._ranges.getAllConnectionsFromIntersectedRange(connector.x);
}

Gridifier.HorizontalGrid.Connections.prototype.getAllVerticallyIntersectedAndRightConnections = function(connector) {
    return this._ranges.getAllConnectionsFromIntersectedAndRightRanges(connector.x);
}

Gridifier.HorizontalGrid.Connections.prototype.mapAllIntersectedAndRightConnectionsPerEachConnector = function(sortedConnectors) {
    return this._ranges.mapAllIntersectedAndRightConnectionsPerEachConnector(sortedConnectors);
}

Gridifier.HorizontalGrid.Connections.prototype.mapAllIntersectedAndLeftConnectionsPerEachConnector = function(sortedConnectors) {
    return this._ranges.mapAllIntersectedAndLeftConnectionsPerEachConnector(sortedConnectors);
}

Gridifier.HorizontalGrid.Connections.prototype.getLastColHorizontallyExpandedConnections = function() {
    return this._connectionsHorizontalIntersector.getLastColHorizontallyExpandedConnections();
}

Gridifier.HorizontalGrid.Connections.prototype.get = function() {
    return this._connections;
}

Gridifier.HorizontalGrid.Connections.prototype.count = function() {
    return this._connections.length;
}

Gridifier.HorizontalGrid.Connections.prototype.restore = function(connections) {
    this._connections = this._connections.concat(connections);
}

Gridifier.HorizontalGrid.Connections.prototype.restoreOnCustomSortDispersionMode = function(connections) {
    var currentConnections = this._sorter.sortConnectionsPerReappend(this._connections);
    var lastConnection = currentConnections[currentConnections.length - 1];

    if(this._settings.isDefaultAppend()) {
        var maxY = lastConnection.y2;
        var maxX = lastConnection.x1;

        var nextFakeY = maxY + 1;
        for(var i = 0; i < connections.length; i++) {
            connections[i].x1 = maxX;
            connections[i].x2 = maxX;
            connections[i].y1 = nextFakeY;
            connections[i].y2 = nextFakeY;
            nextFakeY++;
        }
    }
    else if(this._settings.isReversedAppend()) {
        var minY = lastConnection.y1;
        var maxX = lastConnection.x1;

        var nextFakeY = minY - 1;
        for(var i = 0; i < connections.length; i++) {
            connections[i].x1 = maxX;
            connections[i].x2 = maxX;
            connections[i].y1 = nextFakeY;
            connections[i].y2 = nextFakeY;
            nextFakeY--;
        }
    }

    this.restore(connections);
}

Gridifier.HorizontalGrid.Connections.prototype.getMaxX2 = function() {
    return this._connectionsCore.getMaxX2();
}

Gridifier.HorizontalGrid.Connections.prototype.getMaxY2 = function() {
    return this._connectionsCore.getMaxY2();
}

Gridifier.HorizontalGrid.Connections.prototype.findConnectionByItem = function(item, disableWasItemFoundValidation) {
    var disableWasItemFoundValidation = disableWasItemFoundValidation || false;
    return this._connectionsCore.findConnectionByItem(item, disableWasItemFoundValidation);
}

Gridifier.HorizontalGrid.Connections.prototype.remapAllItemGUIDS = function() {
    this._connectionsCore.remapAllItemGUIDS();
}

Gridifier.HorizontalGrid.Connections.prototype.remapAllItemGUIDSInSortedConnections = function(connections) {
    this._connectionsCore.remapAllItemGUIDSInSortedConnections(connections);
}

Gridifier.HorizontalGrid.Connections.prototype.add = function(item, itemConnectionCoords) {
    var connection = this._connectionsCore.createItemConnection(item, itemConnectionCoords);
    this._connections.push(connection);
    this._eventEmitter.emitConnectionCreateEvent(this);

    return connection;
}

Gridifier.HorizontalGrid.Connections.prototype.removeConnection = function(connection) {
    for(var i = 0; i < this._connections.length; i++) {
        if(this._guid.getItemGUID(connection.item) == this._guid.getItemGUID(this._connections[i].item)) {
            this._connections.splice(i, 1);
            return;
        }
    }
}

Gridifier.HorizontalGrid.Connections.prototype.getConnectionsByItemGUIDS = function(itemGUIDS) {
    return this._connectionsCore.getConnectionsByItemGUIDS(itemGUIDS);
}

Gridifier.HorizontalGrid.Connections.prototype.syncConnectionParams = function(connectionsData) {
    this._connectionsCore.syncConnectionParams(connectionsData);
}

Gridifier.HorizontalGrid.Connections.prototype.getMinConnectionWidth = function() {
    return this._connectionsCore.getMinConnectionWidth();
}

Gridifier.HorizontalGrid.Connections.prototype.getMinConnectionHeight = function() {
    return this._connectionsCore.getMinConnectionHeight();
}

Gridifier.HorizontalGrid.Connections.prototype.isAnyConnectionItemGUIDSmallerThan = function(comparableConnections, 
                                                                                             item) {
    return this._connectionsCore.isAnyConnectionItemGUIDSmallerThan(comparableConnections, item);
}

Gridifier.HorizontalGrid.Connections.prototype.isAnyConnectionItemGUIDBiggerThan = function(comparableConnections,
                                                                                            item) {
    return this._connectionsCore.isAnyConnectionItemGUIDBiggerThan(comparableConnections, item);
}

Gridifier.HorizontalGrid.Connections.prototype.getAllConnectionsBehindX = function(x) {
    var connections = [];
    for(var i = 0; i < this._connections.length; i++) {
        if(this._settings.isDisabledSortDispersion()) {
            if(this._connections[i].x1 > x)
                connections.push(this._connections[i]);
        }
        else if(this._settings.isCustomSortDispersion()) {
            var sortDispersionValue = this._settings.getSortDispersionValue();
            if(this._connections[i].x1 - sortDispersionValue > x)
                connections.push(this._connections[i]);
        }
        else if(this._settings.isCustomAllEmptySpaceSortDispersion()) {
            ; // No connections
        }
    }

    return connections;
}


Gridifier.HorizontalGrid.Connections.prototype.getAllConnectionsBeforeX = function(x) {
    var connections = [];
    for(var i = 0; i < this._connections.length; i++) {
        if(this._settings.isDisabledSortDispersion()) {
            if(this._connections[i].x2 < x)
                connections.push(this._connections[i]);
        }
        else if(this._settings.isCustomSortDispersion()) {
            var sortDispersionValue = this._settings.getSortDispersionValue();
            if(this._connections[i].x2 + sortDispersionValue < x)
                connections.push(this._connections[i]);
        }
        else if(this._settings.isCustomAllEmptySpaceSortDispersion()) {
            ; // No connections
        }
    }

    return connections;
}

Gridifier.HorizontalGrid.Connections.prototype.getMaxYFromAllConnections = function() {
    var maxY = 0;
    for(var i = 0; i < this._connections.length; i++) {
        if(this._connections[i].y2 > maxY)
            maxY = this._connections[i].y2;
    }

    return maxY;
}

Gridifier.HorizontalGrid.Connections.prototype.isIntersectingMoreThanOneConnectionItemHorizontally = function(itemCoords) {
    return this._connectionsHorizontalIntersector.isIntersectingMoreThanOneConnectionItemHorizontally(itemCoords);
}

Gridifier.HorizontalGrid.Connections.prototype.getMostWideFromAllHorizontallyIntersectedConnections = function(itemCoords) {
    return this._connectionsHorizontalIntersector.getMostWideFromAllHorizontallyIntersectedConnections(itemCoords);
}

Gridifier.HorizontalGrid.Connections.prototype.getAllHorizontallyIntersectedConnections = function(itemCoords) {
    return this._connectionsHorizontalIntersector.getAllHorizontallyIntersectedConnections(itemCoords);
}

Gridifier.HorizontalGrid.Connections.prototype.expandHorizontallyAllColConnectionsToMostWide = function(newConnection) {
    this._connectionsHorizontalIntersector.expandHorizontallyAllColConnectionsToMostWide(newConnection);
}

Gridifier.HorizontalGrid.Connections.prototype.normalizeHorizontalPositionsOfAllConnectionsAfterPrepend = function(newConnection,
                                                                                                                   connectors) {
    if(newConnection.x1 >= 0)
        return false;

    // @todo -> should round???
    var increaseHorizontalPositionBy = Math.round(Math.abs(newConnection.x1));
    newConnection.x2 = Math.abs(newConnection.x1 - newConnection.x2);
    newConnection.x1 = 0;

    for(var i = 0; i < this._connections.length; i++) {
        if(newConnection.itemGUID == this._connections[i].itemGUID)
            continue;

        this._connections[i].x1 += increaseHorizontalPositionBy;
        this._connections[i].x2 += increaseHorizontalPositionBy;
    }

    for(var i = 0; i < connectors.length; i++)
        connectors[i].x += increaseHorizontalPositionBy;

    this._ranges.shiftAllRangesBy(increaseHorizontalPositionBy);
    this._ranges.createPrependedRange(newConnection.x1, newConnection.x2);

    return true;
}

Gridifier.HorizontalGrid.ConnectionsHorizontalIntersector = function(connections,
                                                                     settings,
                                                                     itemCoordsExtractor) {
    var me = this;

    this._connections = null;
    this._settings = null;
    this._itemCoordsExtractor = null;

    this._lastColHorizontallyExpandedConnections = [];

    this._css = {
    };

    this._construct = function() {
        me._connections = connections;
        me._settings = settings;
        me._itemCoordsExtractor = itemCoordsExtractor;
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

Gridifier.HorizontalGrid.ConnectionsHorizontalIntersector.prototype.getLastColHorizontallyExpandedConnections = function() {
    return this._lastColHorizontallyExpandedConnections;
}

Gridifier.HorizontalGrid.ConnectionsHorizontalIntersector.prototype.isIntersectingMoreThanOneConnectionItemHorizontally = function(itemCoords) {
    var me = this;

    var connections = this._connections.get();
    var intersectedConnectionItemIndexes = [];
    
    var isIntersectingHorizontallyAnyFromAlreadyIntersectedItems = function(connection) {
        if(intersectedConnectionItemIndexes.length == 0)
            return false;

        for(var i = 0; i < intersectedConnectionItemIndexes.length; i++) {
            var maybeIntersectableConnection = connections[intersectedConnectionItemIndexes[i]];
            var isBefore = (connection.x1 < maybeIntersectableConnection.x1 && connection.x2 < maybeIntersectableConnection.x1);
            var isBehind = (connection.x1 > maybeIntersectableConnection.x2 && connection.x2 > maybeIntersectableConnection.x2);

            if(!isBefore && !isBehind)
                return true;
        }

        return false;
    };

    var intersectedConnectionItemsCount = 0;
    for(var i = 0; i < connections.length; i++) {
        var maybeIntersectableConnection = connections[i];
        var isBefore = (itemCoords.x1 < maybeIntersectableConnection.x1 && itemCoords.x2 < maybeIntersectableConnection.x1);
        var isBehind = (itemCoords.x1 > maybeIntersectableConnection.x2 && itemCoords.x2 > maybeIntersectableConnection.x2);

        if(!isBefore && !isBehind && !isIntersectingHorizontallyAnyFromAlreadyIntersectedItems(maybeIntersectableConnection)) {
            intersectedConnectionItemIndexes.push(i);
            intersectedConnectionItemsCount++;
        }
    }

    return intersectedConnectionItemsCount > 1;
}

Gridifier.HorizontalGrid.ConnectionsHorizontalIntersector.prototype.getMostWideFromAllHorizontallyIntersectedConnections = function(itemCoords) {
    var me = this;

    var connections = this._connections.get();
    var mostWideHorizontallyIntersectedConnection = null;

    for(var i = 0; i < connections.length; i++) {
        var maybeIntersectableConnection = connections[i];
        var isBefore = (itemCoords.x1 < maybeIntersectableConnection.x1 && itemCoords.x2 < maybeIntersectableConnection.x1);
        var isBehind = (itemCoords.x1 > maybeIntersectableConnection.x2 && itemCoords.x2 > maybeIntersectableConnection.x2);

        if(!isBefore && !isBehind) {
            if(mostWideHorizontallyIntersectedConnection == null)
                mostWideHorizontallyIntersectedConnection = maybeIntersectableConnection;
            else {
                var maybeIntersectableConnectionWidth = Math.abs(
                    maybeIntersectableConnection.x2 - maybeIntersectableConnection.x1
                );
                var mostWideHorizontallyIntersectedConnectionWidth = Math.abs(
                    mostWideHorizontallyIntersectedConnection.x2 - mostWideHorizontallyIntersectedConnection.x1
                );

                if(maybeIntersectableConnectionWidth > mostWideHorizontallyIntersectedConnectionWidth)
                    mostWideHorizontallyIntersectedConnection = maybeIntersectableConnection;
            }
        }
    }

    return mostWideHorizontallyIntersectedConnection;
}

Gridifier.HorizontalGrid.ConnectionsHorizontalIntersector.prototype.getAllHorizontallyIntersectedConnections = function(itemCoords) {
    var me = this;

    var connections = this._connections.get();
    var horizontallyIntersectedConnections = [];

    for(var i = 0; i < connections.length; i++) {
        var maybeIntersectableConnection = connections[i];
        var isBefore = (itemCoords.x1 < maybeIntersectableConnection.x1 && itemCoords.x2 < maybeIntersectableConnection.x1);
        var isBehind = (itemCoords.x1 > maybeIntersectableConnection.x2 && itemCoords.x2 > maybeIntersectableConnection.x2);

        if(!isBefore && !isBehind) 
            horizontallyIntersectedConnections.push(maybeIntersectableConnection);
    }

    return horizontallyIntersectedConnections;
}

Gridifier.HorizontalGrid.ConnectionsHorizontalIntersector.prototype.expandHorizontallyAllColConnectionsToMostWide = function(newConnection) {
    var mostWideConnection = this.getMostWideFromAllHorizontallyIntersectedConnections(newConnection);
    if(mostWideConnection == null)
        return;
    
    var colConnectionsToExpand = this.getAllHorizontallyIntersectedConnections(newConnection);
    var expandedConnectionsWithNewOffsets = [];

    for(var i = 0; i < colConnectionsToExpand.length; i++) {
        colConnectionsToExpand[i].x1 = mostWideConnection.x1;
        colConnectionsToExpand[i].x2 = mostWideConnection.x2;

        if(this._settings.isHorizontalGridLeftAlignmentType()) {
            if(colConnectionsToExpand[i].horizontalOffset != 0)
                expandedConnectionsWithNewOffsets.push(colConnectionsToExpand[i]);

            colConnectionsToExpand[i].horizontalOffset = 0;
        }
        else if(this._settings.isHorizontalGridCenterAlignmentType()) {
            var x1 = colConnectionsToExpand[i].x1;
            var x2 = colConnectionsToExpand[i].x2;

            var targetSizes = this._itemCoordsExtractor.getItemTargetSizes(colConnectionsToExpand[i].item);
            var itemWidth = targetSizes.targetWidth;

            var newHorizontalOffset = (Math.abs(x2 - x1 + 1) / 2) - (itemWidth / 2);

            if(colConnectionsToExpand[i].horizontalOffset != newHorizontalOffset) {
                colConnectionsToExpand[i].horizontalOffset = newHorizontalOffset;
                expandedConnectionsWithNewOffsets.push(colConnectionsToExpand[i]);
            }
        }
        else if(this._settings.isHorizontalGridRightAlignmentType()) {
            var x1 = colConnectionsToExpand[i].x1;
            var x2 = colConnectionsToExpand[i].x2;

            var targetSizes = this._itemCoordsExtractor.getItemTargetSizes(colConnectionsToExpand[i].item);
            var itemWidth = targetSizes.targetWidth;

            var newHorizontalOffset = Math.abs(x2 - x1 + 1) - itemWidth;

            if(colConnectionsToExpand[i].horizontalOffset != newHorizontalOffset) {
                colConnectionsToExpand[i].horizontalOffset = newHorizontalOffset;
                expandedConnectionsWithNewOffsets.push(colConnectionsToExpand[i]);
            }
        }
    }

    // We should rerender only connections with new horizontal offsets(Otherwise some browsers
    // will produce noticeable 'freezes' on rerender cycle)
    this._lastColHorizontallyExpandedConnections = expandedConnectionsWithNewOffsets;
}

Gridifier.HorizontalGrid.ConnectionsIntersector = function(connections) {
    var me = this;

    this._connections = null;

    this._intersectorCore = null;

    this._css = {
    };

    this._construct = function() {
        me._connections = connections;
        me._intersectorCore = new Gridifier.ConnectionsIntersector(
            me._connections
        );
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

Gridifier.HorizontalGrid.ConnectionsIntersector.prototype.isIntersectingAnyConnection = function(maybeIntersectableConnections, itemCoords) {
    return this._intersectorCore.isIntersectingAnyConnection(maybeIntersectableConnections, itemCoords);
}

Gridifier.HorizontalGrid.ConnectionsIntersector.prototype.getAllConnectionsWithIntersectedCenter = function(maybeIntersectionCoords) {
    return this._intersectorCore.getAllConnectionsWithIntersectedCenter(maybeIntersectionCoords);
}

Gridifier.HorizontalGrid.ConnectionsIntersector.prototype.findAllMaybeIntersectableConnectionsOnAppend = function(connector) {
    var connections = this._connections.get();
    var maybeIntersectableConnections = [];

    for(var i = 0; i < connections.length; i++) {
        if(connector.x > connections[i].x2)
            continue;

        maybeIntersectableConnections.push(connections[i]);
    }

    return maybeIntersectableConnections;
}

Gridifier.HorizontalGrid.ConnectionsIntersector.prototype.findAllMaybeIntersectableConnectionsOnPrepend = function(connector) {
    var connections = this._connections.get();
    var maybeIntersectableConnections = [];

    for(var i = 0; i < connections.length; i++) {
        if(connector.x < connections[i].x1)
            continue;

        maybeIntersectableConnections.push(connections[i]);
    }

    return maybeIntersectableConnections;
}

Gridifier.HorizontalGrid.ConnectionsRanges = function(connections) {
    var me = this;

    this._connections = null;

    this._ranges = null;

    this._css = {

    }

    this._construct = function() {
        me._connections = connections;
    };

    this._bindEvents = function() {

    };

    this._unbindEvents = function() {

    };

    this.destruct = function() {
        me._unbindEvents();
    }

    this._construct();
    return this;
}

Gridifier.HorizontalGrid.ConnectionsRanges.RANGE_PX_WIDTH = 500;

Gridifier.HorizontalGrid.ConnectionsRanges.prototype.init = function() {
    this._ranges = [];
    this._ranges.push({
        x1: -1,
        x2: Gridifier.HorizontalGrid.ConnectionsRanges.RANGE_PX_WIDTH,
        connectionIndexes: []
    });
    this._attachAllConnections();
}

Gridifier.HorizontalGrid.ConnectionsRanges.prototype.shiftAllRangesBy = function(horizontalIncrease) {
    for(var i = 0; i < this._ranges.length; i++) {
        this._ranges[i].x1 += horizontalIncrease;
        this._ranges[i].x2 += horizontalIncrease;
    }
}

Gridifier.HorizontalGrid.ConnectionsRanges.prototype.createPrependedRange = function(newRangeX1, newRangeX2) {
    this._ranges.unshift({
        x1: -1,
        x2: newRangeX2,
        connectionIndexes: []
    });
}

Gridifier.HorizontalGrid.ConnectionsRanges.prototype._createNextRange = function() {
    var nextRangeX1 = this._ranges[this._ranges.length - 1].x2 + 1;

    this._ranges.push({
        x1: nextRangeX1,
        x2: nextRangeX1 + Gridifier.HorizontalGrid.ConnectionsRanges.RANGE_PX_WIDTH,
        connectionIndexes: []
    });
}

Gridifier.HorizontalGrid.ConnectionsRanges.prototype.attachConnection = function(connection, connectionIndex) {
    while(connection.x2 + 1 > this._ranges[this._ranges.length - 1].x2) {
        this._createNextRange();
    }

    var wasConnectionAttachedAtLeastInOneRange = false;
    for(var i = 0; i < this._ranges.length; i++) {
        var isBeforeRange = connection.x2 < this._ranges[i].x1;
        var isBehindRange = connection.x1 > this._ranges[i].x2;

        if(!isBeforeRange && !isBehindRange) {
            this._ranges[i].connectionIndexes.push(connectionIndex);
            wasConnectionAttachedAtLeastInOneRange = true;
        }
    }

    if(!wasConnectionAttachedAtLeastInOneRange)
        throw new Error("Gridifier core error: connection was not connected to any range: " + connection.itemGUID);
}

Gridifier.HorizontalGrid.ConnectionsRanges.prototype._attachAllConnections = function() {
    var connections = this._connections.get();
    for(var i = 0; i < connections.length; i++) 
        this.attachConnection(connections[i], i);
}

Gridifier.HorizontalGrid.ConnectionsRanges.prototype.mapAllIntersectedAndLeftConnectionsPerEachConnector = function(sortedConnectors) {
    var currentConnectorRangeIndex = this._ranges.length - 1;
    var currentConnectorConnectionIndexes = [];

    for(var connectorIndex = 0; connectorIndex < sortedConnectors.length; connectorIndex++) {
        var currentConnectorRangeIndexFound = false;

        if(currentConnectorRangeIndex == this._ranges.length - 1)
            var isCurrentConnectorRangeSameAsPrevious = false;
        else
            var isCurrentConnectorRangeSameAsPrevious = true;

        while(!currentConnectorRangeIndexFound) { 
            // Sometimes connector y may become 1px to the left than range.
            // (Spot on (width=10%, height=0px, padding-bottom: 25%)).
            // In this such cases we should return connections of all ranges.
            if(currentConnectorRangeIndex > this._ranges.length - 1
                || currentConnectorRangeIndex < 0) {
                currentConnectorRangeIndex = this._ranges.length - 1;
                break;
            }

            if(sortedConnectors[connectorIndex].x >= this._ranges[currentConnectorRangeIndex].x1 &&
                sortedConnectors[connectorIndex].x <= this._ranges[currentConnectorRangeIndex].x2) {
                currentConnectorRangeIndexFound = true;
            }
            else {
                currentConnectorRangeIndex--;
                isCurrentConnectorRangeSameAsPrevious = false;
            }
        }

        if(!isCurrentConnectorRangeSameAsPrevious) {
            currentConnectorConnectionIndexes = [];
            for(var rangeIndex = currentConnectorRangeIndex; rangeIndex >= 0; rangeIndex--)
                currentConnectorConnectionIndexes.push(this._ranges[rangeIndex].connectionIndexes);
        }

        sortedConnectors[connectorIndex].connectionIndexes = currentConnectorConnectionIndexes;
    }

    return sortedConnectors;
}

Gridifier.HorizontalGrid.ConnectionsRanges.prototype.getAllConnectionsFromIntersectedAndRightRanges = function(x) {
    var connectionIndexes = [];
    var intersectedRangeIndex = null;

    for(var i = 0; i < this._ranges.length; i++) {
        if(x >= this._ranges[i].x1 && x <= this._ranges[i].x2) {
            intersectedRangeIndex = i;
            break;
        }
    }

    if(intersectedRangeIndex == null)
        intersectedRangeIndex = 0;

    for(var i = intersectedRangeIndex; i < this._ranges.length; i++) {
        connectionIndexes.push(this._ranges[i].connectionIndexes);
    }

    return connectionIndexes;
}

Gridifier.HorizontalGrid.ConnectionsRanges.prototype.mapAllIntersectedAndRightConnectionsPerEachConnector = function(sortedConnectors) {
    var currentConnectorRangeIndex = 0;
    var currentConnectorConnectionIndexes = [];

    for(var connectorIndex = 0; connectorIndex < sortedConnectors.length; connectorIndex++) {
        var currentConnectorRangeIndexFound = false;

        if(currentConnectorRangeIndex == 0)
            var isCurrentConnectorRangeSameAsPrevious = false;
        else
            var isCurrentConnectorRangeSameAsPrevious = true;

        while(!currentConnectorRangeIndexFound) {
            // Sometimes connector x may become 1px larger than range.
            // (Spot on (width=10%, height=0px, padding-bottom: 25%)).
            // In this such cases we should return connections of all ranges.
            if(currentConnectorRangeIndex > this._ranges.length - 1
                || currentConnectorRangeIndex < 0) {
                currentConnectorRangeIndex = 0;
                break;
            }

            if(sortedConnectors[connectorIndex].x >= this._ranges[currentConnectorRangeIndex].x1 &&
               sortedConnectors[connectorIndex].x <= this._ranges[currentConnectorRangeIndex].x2) {
                currentConnectorRangeIndexFound = true;
            }
            else {
                currentConnectorRangeIndex++;
                isCurrentConnectorRangeSameAsPrevious = false;
            }
        }

        if(!isCurrentConnectorRangeSameAsPrevious) {
            currentConnectorConnectionIndexes = [];
            for(var rangeIndex = currentConnectorRangeIndex; rangeIndex < this._ranges.length; rangeIndex++)
                currentConnectorConnectionIndexes.push(this._ranges[rangeIndex].connectionIndexes);
        }

        sortedConnectors[connectorIndex].connectionIndexes = currentConnectorConnectionIndexes;
    }

    return sortedConnectors;
}

Gridifier.HorizontalGrid.ConnectionsRanges.prototype.getAllConnectionsFromIntersectedRange = function(x) {
    for(var i = 0; i < this._ranges.length; i++) {
        if(x >= this._ranges[i].x1 && x <= this._ranges[i].x2)
            return this._ranges[i].connectionIndexes;
    }

    var isConnectionIndexAdded = function(connectionIndexes, index) {
        for(var i = 0; i < connectionIndexes.length; i++) {
            if(connectionIndexes[i] == index)
                return true;
        }

        return false;
    }

    var connectionIndexes = [];
    for(var i = 0; i < this._ranges.length; i++) {
        for(var j = 0; j < this._ranges[i].connectionIndexes.length; j++) {
            if(!isConnectionIndexAdded(connectionIndexes, this._ranges[i].connectionIndexes[j]))
                connectionIndexes.push(this._ranges[i].connectionIndexes[j]);
        }
    }

    return connectionIndexes;
}

Gridifier.HorizontalGrid.ConnectionsRanges.prototype.getAllConnectionsFromIntersectedAndLeftRanges = function(x) {
    var connectionIndexes = [];
    var intersectedRangeIndex = null;

    for(var i = this._ranges.length - 1; i >= 0; i--) {
        if(x >= this._ranges[i].x1 && x <= this._ranges[i].x2) {
            intersectedRangeIndex = i;
            break;
        }
    }

    if(intersectedRangeIndex == null)
        intersectedRangeIndex = this._ranges.length - 1;

    for(var i = intersectedRangeIndex; i >= 0; i--) {
        connectionIndexes.push(this._ranges[i].connectionIndexes);
    }

    return connectionIndexes;
}


Gridifier.HorizontalGrid.ConnectionsSorter = function(connections, settings, guid) {
    var me = this;

    this._connections = null;
    this._settings = null;
    this._guid = null;

    this._css = {
    };

    this._construct = function() {
        me._connections = connections;
        me._settings = settings;
        me._guid = guid;
    };

    this._bindEvents = function() {
        ;
    };

    this._unbindEvents = function() {
        ;
    };

    this.destruct = function() {
        me._unbindEvents();
    };

    this._construct();
    return this;
}

Gridifier.HorizontalGrid.ConnectionsSorter.prototype.sortConnectionsPerReappend = function(connections) {
    var me = this;

    if(this._settings.isDisabledSortDispersion()) {
        connections.sort(function(firstConnection, secondConnection) {
            if(me._guid.getItemGUID(firstConnection.item) > me._guid.getItemGUID(secondConnection.item))
                return 1;

            return -1;
        });
    }
    else if(this._settings.isCustomSortDispersion() || 
            this._settings.isCustomAllEmptySpaceSortDispersion()) {
        if(this._settings.isDefaultAppend()) {
            connections.sort(function(firstConnection, secondConnection) {
                if(firstConnection.x1 == secondConnection.x1) {
                    if(firstConnection.y2 < secondConnection.y2)
                        return -1;
                    else 
                        return 1;
                }
                else {
                    if(firstConnection.x1 < secondConnection.x1)
                        return -1;
                    else
                        return 1;
                }
            });
        }
        else if(this._settings.isReversedAppend()) {
            connections.sort(function(firstConnection, secondConnection) {
                if(firstConnection.x1 == secondConnection.x1) {
                    if(firstConnection.y1 > secondConnection.y1)
                        return -1;
                    else
                        return 1;
                }
                else {
                    if(firstConnection.x1 < secondConnection.x1)
                        return -1;
                    else
                        return 1;
                }
            });
        }
    }

    return connections;
}

Gridifier.HorizontalGrid.ConnectorsCleaner = function(connectors, connections, settings) {
    var me = this;

    this._connectors = null;
    this._connections = null;
    this._settings = null;

    this._connectionItemIntersectionStrategy = null;

    this._css = {
    };

    this._construct = function() {
        me._connectors = connectors;
        me._connections = connections;
        me._settings = settings;

        if(me._settings.isDisabledSortDispersion()) {
            me.setConnectorInsideOrBeforeItemIntersectionStrategy();
        }
        else if(me._settings.isCustomSortDispersion() ||
                me._settings.isCustomAllEmptySpaceSortDispersion()) {
            me.setConnectorInsideItemIntersectionStrategy();
        }
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

Gridifier.HorizontalGrid.ConnectorsCleaner.CONNECTION_ITEM_INTERSECTION_STRATEGIES = {
    CONNECTOR_INSIDE_CONNECTION_ITEM: 0,
    CONNECTOR_INSIDE_OR_BEFORE_CONNECTION_ITEM: 1
};

Gridifier.HorizontalGrid.ConnectorsCleaner.MAX_VALID_HORIZONTAL_DISTANCE = {
    FROM_MOST_RIGHT_CONNECTOR: 3000,
    FROM_MOST_LEFT_CONNECTOR: 3000
};

Gridifier.HorizontalGrid.ConnectorsCleaner.prototype.setConnectorInsideItemIntersectionStrategy = function() {
    var intersectionStrategies = Gridifier.HorizontalGrid.ConnectorsCleaner.CONNECTION_ITEM_INTERSECTION_STRATEGIES;
    this._connectionItemIntersectionStrategy = intersectionStrategies.CONNECTOR_INSIDE_CONNECTION_ITEM;
}

Gridifier.HorizontalGrid.ConnectorsCleaner.prototype.setConnectorInsideOrBeforeItemIntersectionStrategy = function() {
    var intersectionStrategies = Gridifier.HorizontalGrid.ConnectorsCleaner.CONNECTION_ITEM_INTERSECTION_STRATEGIES;
    this._connectionItemIntersectionStrategy = intersectionStrategies.CONNECTOR_INSIDE_OR_BEFORE_CONNECTION_ITEM;
}

Gridifier.HorizontalGrid.ConnectorsCleaner.prototype.isConnectorInsideItemIntersectionStrategy = function() {
    var intersectionStrategies = Gridifier.HorizontalGrid.ConnectorsCleaner.CONNECTION_ITEM_INTERSECTION_STRATEGIES;
    return (this._connectionItemIntersectionStrategy == intersectionStrategies.CONNECTOR_INSIDE_CONNECTION_ITEM);
}

Gridifier.HorizontalGrid.ConnectorsCleaner.prototype.isConnectorInsideOrBeforeItemIntersectionStrategy = function() {
    var intersectionStrategies = Gridifier.HorizontalGrid.ConnectorsCleaner.CONNECTION_ITEM_INTERSECTION_STRATEGIES;
    return (this._connectionItemIntersectionStrategy == intersectionStrategies.CONNECTOR_INSIDE_OR_BEFORE_CONNECTION_ITEM);
}

Gridifier.HorizontalGrid.ConnectorsCleaner.prototype._isMappedConnectorIntersectingAnyLeftConnectionItem = function(mappedConnector) {
    var connections = this._connections.get();

    for(var i = 0; i < mappedConnector.connectionIndexes.length; i++) {
        for(var j = 0; j < mappedConnector.connectionIndexes[i].length; j++) {
            var connection = connections[mappedConnector.connectionIndexes[i][j]];

            if(this.isConnectorInsideOrBeforeItemIntersectionStrategy())
                var horizontalIntersectionCond = (mappedConnector.x >= connection.x1);
            else if(this.isConnectorInsideItemIntersectionStrategy())
                var horizontalIntersectionCond = (mappedConnector.x >= connection.x1 
                                                  && mappedConnector.x <= connection.x2);

            if(mappedConnector.y >= connection.y1 && mappedConnector.y <= connection.y2
                && horizontalIntersectionCond)
                return true;
        }
    }

    return false;
}

Gridifier.HorizontalGrid.ConnectorsCleaner.prototype.deleteAllIntersectedFromLeftConnectors = function() {
    var connectors = this._connectors.get();
    var mappedConnectors = this._connectors.getClone();

    mappedConnectors.sort(function(firstConnector, secondConnector) {
        if(firstConnector.x == secondConnector.x)
            return 0;
        else if(firstConnector.x > secondConnector.x)
            return -1;
        else
            return 1;
    });
    mappedConnectors = this._connections.mapAllIntersectedAndLeftConnectionsPerEachConnector(
        mappedConnectors
    );

    for(var i = 0; i < mappedConnectors.length; i++) {
        if(this._isMappedConnectorIntersectingAnyLeftConnectionItem(mappedConnectors[i]))
            connectors[mappedConnectors[i].connectorIndex].isIntersected = true;
        else
            connectors[mappedConnectors[i].connectorIndex].isIntersected = false;
    }

    for(var i = 0; i < connectors.length; i++) {
        if(connectors[i].isIntersected) {
            connectors.splice(i, 1);
            i--;
        }
    }
}

Gridifier.HorizontalGrid.ConnectorsCleaner.prototype.deleteAllTooRightConnectorsFromMostLeftConnector = function() {
    var connectors = this._connectors.get();
    if(connectors.length == 0) return;

    var mostLeftConnector = connectors[0];
    for(var i = 1; i < connectors.length; i++) {
        if(connectors[i].x < mostLeftConnector.x)
            mostLeftConnector = connectors[i];
    }

    var cc = Gridifier.HorizontalGrid.ConnectorsCleaner;
    var maxValidX = mostLeftConnector.x + cc.MAX_VALID_HORIZONTAL_DISTANCE.FROM_MOST_LEFT_CONNECTOR;
    for(var i = 0; i < connectors.length; i++) {
        if(connectors[i].x > maxValidX) {
            connectors.splice(i, 1);
            i--;
        }
    }
}

Gridifier.HorizontalGrid.ConnectorsCleaner.prototype._isMappedConnectorIntersectingAnyRightConnectionItem = function(mappedConnector) {
    var connections = this._connections.get();

    for(var i = 0; i < mappedConnector.connectionIndexes.length; i++) {
        for(var j = 0; j < mappedConnector.connectionIndexes[i].length; j++) {
            var connection = connections[mappedConnector.connectionIndexes[i][j]];

            if(this.isConnectorInsideOrBeforeItemIntersectionStrategy())
                var horizontalIntersectionCond = (mappedConnector.x <= connection.x2);
            else if(this.isConnectorInsideItemIntersectionStrategy())
                var horizontalIntersectionCond = (mappedConnector.x <= connection.x2
                                                  && mappedConnector.x >= connection.x1);

            if(mappedConnector.y >= connection.y1 && mappedConnector.y <= connection.y2
                && horizontalIntersectionCond)
                return true;
        }
    }
    
    return false;
}

Gridifier.HorizontalGrid.ConnectorsCleaner.prototype.deleteAllIntersectedFromRightConnectors = function() {
    var connectors = this._connectors.get();
    var mappedConnectors = this._connectors.getClone();

    mappedConnectors.sort(function(firstConnector, secondConnector) {
        if(firstConnector.x == secondConnector.x)
            return 0;
        else if(firstConnector.x < secondConnector.x)
            return -1;
        else 
            return 1;
    });

    mappedConnectors = this._connections.mapAllIntersectedAndRightConnectionsPerEachConnector(
        mappedConnectors
    );

    for(var i = 0; i < mappedConnectors.length; i++) {
        if(this._isMappedConnectorIntersectingAnyRightConnectionItem(mappedConnectors[i])) 
            connectors[mappedConnectors[i].connectorIndex].isIntersected = true;
        else
            connectors[mappedConnectors[i].connectorIndex].isIntersected = false;
    }

    for(var i = 0; i < connectors.length; i++) {
        if(connectors[i].isIntersected) {
            connectors.splice(i, 1);
            i--;
        }
    }
}

Gridifier.HorizontalGrid.ConnectorsCleaner.prototype.deleteAllTooLeftConnectorsFromMostRightConnector = function() {
    var connectors = this._connectors.get();
    if(connectors.length == 0) return;

    var mostRightConnector = connectors[0];
    for(var i = 1; i < connectors.length; i++) {
        if(connectors[i].x > mostRightConnector.x)
            mostRightConnector = connectors[i];
    }

    var cc = Gridifier.HorizontalGrid.ConnectorsCleaner;
    var minValidX = mostRightConnector.x - cc.MAX_VALID_HORIZONTAL_DISTANCE.FROM_MOST_RIGHT_CONNECTOR;
    for(var i = 0; i < connectors.length; i++) {
        if(connectors[i].x < minValidX) {
            connectors.splice(i, 1);
            i--;
        }
    }
}

Gridifier.HorizontalGrid.ConnectorsSelector = function(guid) {
    var me = this;

    this._connectors = null;

    this._guid = null;

    this._css = {
    };

    this._construct = function() {
        me._guid = guid;
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

Gridifier.HorizontalGrid.ConnectorsSelector.prototype.attachConnectors = function(connectors) {
    this._connectors = connectors;
}

Gridifier.HorizontalGrid.ConnectorsSelector.prototype.getSelectedConnectors = function() {
    return this._connectors;
}

Gridifier.HorizontalGrid.ConnectorsSelector.prototype.selectOnlyMostRightConnectorFromSide = function(side) {
    var mostRightConnectorItemGUID = null;
    var mostRightConnectorX = null;

    var i = this._connectors.length;
    while(i--) {
        if(this._connectors[i].side == side) {
            if(mostRightConnectorItemGUID == null || this._connectors[i].x > mostRightConnectorX) {
                mostRightConnectorItemGUID = this._connectors[i].itemGUID;
                mostRightConnectorX = this._connectors[i].x;
            }
        }
    }

    if(mostRightConnectorItemGUID == null)
        return;

    var i = this._connectors.length;
    while(i--) {
        if(this._connectors[i].side == side && this._connectors[i].itemGUID != mostRightConnectorItemGUID)
            this._connectors.splice(i, 1);
    }
}

Gridifier.HorizontalGrid.ConnectorsSelector.prototype.selectOnlyMostLeftConnectorFromSide = function(side) {
    var mostLeftConnectorItemGUID = null;
    var mostLeftConnectorX = null;

    var i = this._connectors.length;
    while(i--) {
        if(this._connectors[i].side == side) {
            if(mostLeftConnectorItemGUID == null || this._connectors[i].x < mostLeftConnectorX) {
                mostLeftConnectorItemGUID = this._connectors[i].itemGUID;
                mostLeftConnectorX = this._connectors[i].x;
            }
        }
    }

    if(mostLeftConnectorItemGUID == null)
        return;

    var i = this._connectors.length;
    while(i--) {
        if(this._connectors[i].side == side && this._connectors[i].itemGUID != mostLeftConnectorItemGUID) 
            this._connectors.splice(i, 1);
    }
}

Gridifier.HorizontalGrid.ConnectorsSelector.prototype._isInitialConnector = function(connector) {
    return connector.itemGUID == Gridifier.Connectors.INITIAL_CONNECTOR_ITEM_GUID;
}

Gridifier.HorizontalGrid.ConnectorsSelector.prototype.selectOnlySpecifiedSideConnectorsOnAppendedItems = function(side) {
    for(var i = 0; i < this._connectors.length; i++) {
        if(!this._isInitialConnector(this._connectors[i]) &&
            !this._guid.wasItemPrepended(this._connectors[i].itemGUID) && side != this._connectors[i].side) {
            this._connectors.splice(i, 1);
            i--;
        }
    }
}

Gridifier.HorizontalGrid.ConnectorsSelector.prototype.selectOnlySpecifiedSideConnectorsOnPrependedItems = function(side) {
    for(var i = 0; i < this._connectors.length; i++) {
        if(!this._isInitialConnector(this._connectors[i]) &&
            this._guid.wasItemPrepended(this._connectors[i].itemGUID) && side != this._connectors[i].side) {
            this._connectors.splice(i, 1);
            i--;
        }
    }
}

Gridifier.HorizontalGrid.ConnectorsSorter = function() {
    var me = this;

    this._connectors = null;

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

Gridifier.HorizontalGrid.ConnectorsSorter.prototype.attachConnectors = function(connectors) {
    this._connectors = connectors;
}

Gridifier.HorizontalGrid.ConnectorsSorter.prototype.getConnectors = function() {
    return this._connectors;
}

Gridifier.HorizontalGrid.ConnectorsSorter.prototype.sortConnectorsForPrepend = function(prependType) {
    var me = this;
    this._connectors.sort(function(firstConnector, secondConnector) {
        if(firstConnector.x == secondConnector.x) {
            if(prependType == Gridifier.PREPEND_TYPES.DEFAULT_PREPEND) {
                if(firstConnector.y < secondConnector.y)
                    return 1;
                else
                    return -1;
            }
            else if(prependType == Gridifier.PREPEND_TYPES.REVERSED_PREPEND) {
                if(firstConnector.y > secondConnector.y)
                    return 1;
                else
                    return -1;
            }
        }
        else {
            if(firstConnector.x < secondConnector.x)
                return 1;
            else
                return -1;
        }
    });
}

Gridifier.HorizontalGrid.ConnectorsSorter.prototype.sortConnectorsForAppend = function(appendType) {
    var me = this;
    this._connectors.sort(function(firstConnector, secondConnector) {
        if(firstConnector.x == secondConnector.x) {
            if(appendType == Gridifier.APPEND_TYPES.DEFAULT_APPEND) {
                if(firstConnector.y < secondConnector.y)
                    return -1;
                else
                    return 1;
            }
            else if(appendType == Gridifier.APPEND_TYPES.REVERSED_APPEND) {
                if(firstConnector.y > secondConnector.y)
                    return -1;
                else
                    return 1;
            }
        }
        else {
            if(firstConnector.x < secondConnector.x)
                return -1;
            else
                return 1;
        }
    });
}

Gridifier.HorizontalGrid.ItemCoordsExtractor = function(gridifier, sizesResolverManager) {
    var me = this;

    this._gridifier = null;
    this._sizesResolverManager = null;
    this._transformedItemMarker = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._sizesResolverManager = sizesResolverManager;
        me._transformedItemMarker = new Gridifier.SizesTransformer.TransformedItemMarker();
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

Gridifier.HorizontalGrid.ItemCoordsExtractor.prototype._getItemSizesPerAppend = function(item) {
    if(this._transformedItemMarker.isTransformedItem(item)) {
        var itemTargetPxSizes = this._transformedItemMarker.getTransformedItemTargetPxSizes(item);

        return {
            targetWidth: parseFloat(itemTargetPxSizes.targetPxWidth),
            targetHeight: parseFloat(itemTargetPxSizes.targetPxHeight)
        };
    }
    else {
        return {
            targetWidth: this._sizesResolverManager.outerWidth(item, true),
            targetHeight: this._sizesResolverManager.outerHeight(item, true)
        };
    }
}

Gridifier.HorizontalGrid.ItemCoordsExtractor.prototype.getItemTargetSizes = function(item) {
    return this._getItemSizesPerAppend(item);
}

Gridifier.HorizontalGrid.ItemCoordsExtractor.prototype.connectorToAppendedItemCoords = function(item, connector) {
    var targetSizes = this._getItemSizesPerAppend(item);

    return {
        x1: parseFloat(connector.x),
        x2: parseFloat(connector.x + targetSizes.targetWidth - 1),
        y1: parseFloat(connector.y),
        y2: parseFloat(connector.y + targetSizes.targetHeight - 1)
    };
}

Gridifier.HorizontalGrid.ItemCoordsExtractor.prototype.connectorToReversedAppendedItemCoords = function(item, connector) {
    var targetSizes = this._getItemSizesPerAppend(item);

    return {
        x1: parseFloat(connector.x),
        x2: parseFloat(connector.x + targetSizes.targetWidth - 1),
        y1: parseFloat(connector.y - targetSizes.targetHeight + 1),
        y2: parseFloat(connector.y)
    };
}

Gridifier.HorizontalGrid.ItemCoordsExtractor.prototype.connectorToPrependedItemCoords = function(item, connector) {
    var targetSizes = this._getItemSizesPerAppend(item);

    return {
        x1: parseFloat(connector.x - targetSizes.targetWidth + 1),
        x2: parseFloat(connector.x),
        y1: parseFloat(connector.y - targetSizes.targetHeight + 1),
        y2: parseFloat(connector.y)
    };
}

Gridifier.HorizontalGrid.ItemCoordsExtractor.prototype.connectorToReversedPrependedItemCoords = function(item, connector) {
    var targetSizes = this._getItemSizesPerAppend(item);

    return {
        x1: parseFloat(connector.x - targetSizes.targetWidth + 1),
        x2: parseFloat(connector.x),
        y1: parseFloat(connector.y),
        y2: parseFloat(connector.y + targetSizes.targetHeight - 1)
    };
}

Gridifier.HorizontalGrid.Prepender = function(gridifier, 
                                              settings, 
                                              sizesResolverManager,
                                              connectors, 
                                              connections, 
                                              guid, 
                                              renderer, 
                                              normalizer,
                                              operation) {
    var me = this;

    this._gridifier = null;
    this._settings = null;
    this._sizesResolverManager = null;
    this._guid = null;
    this._renderer = null;
    this._normalizer = null;
    this._operation = null;
    this._connectors = null;
    this._connections = null;

    this._connectorsCleaner = null;
    this._connectorsShifter = null;
    this._connectorsSelector = null;
    this._connectorsSorter = null;
    this._itemCoordsExtractor = null;
    this._connectionsIntersector = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._settings = settings;
        me._sizesResolverManager = sizesResolverManager;
        me._guid = guid;
        me._renderer = renderer;
        me._normalizer = normalizer;
        me._operation = operation;
        me._connectors = connectors;
        me._connections = connections;

        me._connectorsCleaner = new Gridifier.HorizontalGrid.ConnectorsCleaner(
            me._connectors, me._connections, me._settings
        );
        me._connectorsShifter = new Gridifier.ConnectorsShifter(
            me._gridifier, me._connections, me._settings
        );
        me._connectorsSelector = new Gridifier.HorizontalGrid.ConnectorsSelector(me._guid);
        me._connectorsSorter = new Gridifier.HorizontalGrid.ConnectorsSorter();
        me._itemCoordsExtractor = new Gridifier.HorizontalGrid.ItemCoordsExtractor(me._gridifier, me._sizesResolverManager);
        me._connectionsIntersector = new Gridifier.HorizontalGrid.ConnectionsIntersector(me._connections);
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

Gridifier.HorizontalGrid.Prepender.prototype.prepend = function(item) {
    this._initConnectors();

    var connection = this._createConnectionPerItem(item);
    var wereItemsNormalized = this._connections.normalizeHorizontalPositionsOfAllConnectionsAfterPrepend(
        connection, this._connectors.get()
    );
    this._connections.attachConnectionToRanges(connection);

    this._connectorsCleaner.deleteAllTooRightConnectorsFromMostLeftConnector();
    this._connectorsCleaner.deleteAllIntersectedFromLeftConnectors();

    if(wereItemsNormalized) {
        this._renderer.renderConnections(this._connections.get(), [connection]);
    }

    if(this._settings.isDefaultIntersectionStrategy())
        this._renderer.showConnections(connection);
    else if(this._settings.isNoIntersectionsStrategy()) {
        var colConnections = this._connections.getLastColHorizontallyExpandedConnections();

        for(var i = 0; i < colConnections.length; i++) {
            if(colConnections[i].itemGUID == connection.itemGUID) {
                colConnections.splice(i, 1);
                i--;
            }
        }

        this._renderer.renderConnectionsAfterDelay(colConnections);
        this._renderer.showConnections(connection);
    }
}

Gridifier.HorizontalGrid.Prepender.prototype._initConnectors = function() {
    if(this._operation.isInitialOperation(Gridifier.OPERATIONS.PREPEND)) {
        this.createInitialConnector();
        return;
    }

    if(!this._operation.isCurrentOperationSameAsPrevious(Gridifier.OPERATIONS.PREPEND)) {
        this.recreateConnectorsPerAllConnectedItems();
        this._connectorsCleaner.deleteAllIntersectedFromLeftConnectors();
        this._connectorsCleaner.deleteAllTooRightConnectorsFromMostLeftConnector();
    }
}

Gridifier.HorizontalGrid.Prepender.prototype.createInitialConnector = function() {
    this._connectors.addPrependConnector(
        Gridifier.Connectors.SIDES.TOP.RIGHT,
        0,
        this._gridifier.getGridY2()
    );
}

Gridifier.HorizontalGrid.Prepender.prototype.recreateConnectorsPerAllConnectedItems = function(disableFlush) {
    var disableFlush = disableFlush || false;
    if(!disableFlush)
        this._connectors.flush();

    var connections = this._connections.get();
    for(var i = 0; i < connections.length; i++) {
        this._addItemConnectors(connections[i], connections[i].itemGUID);
    }

    if(this._connectors.count() == 0)
        this.createInitialConnector();
}

Gridifier.HorizontalGrid.Prepender.prototype._addItemConnectors = function(itemCoords, itemGUID) {
    if((itemCoords.y1 - 1) >= 0) {
        this._connectors.addPrependConnector(
            Gridifier.Connectors.SIDES.TOP.RIGHT,
            parseFloat(itemCoords.x2),
            parseFloat(itemCoords.y1 - 1),
            Dom.toInt(itemGUID)
        );
    }

    this._connectors.addPrependConnector(
        Gridifier.Connectors.SIDES.LEFT.BOTTOM,
        parseFloat(itemCoords.x1 - 1),
        parseFloat(itemCoords.y2),
        Dom.toInt(itemGUID)
    );
}

Gridifier.HorizontalGrid.Prepender.prototype._createConnectionPerItem = function(item) {
    var sortedConnectors = this._filterConnectorsPerNextConnection();
    var itemConnectionCoords = this._findItemConnectionCoords(item, sortedConnectors);

    var connection = this._connections.add(item, itemConnectionCoords);
    if(this._settings.isNoIntersectionsStrategy()) {
        this._connections.expandHorizontallyAllColConnectionsToMostWide(connection);
    }
    this._addItemConnectors(itemConnectionCoords, this._guid.getItemGUID(item));
    this._guid.markAsPrependedItem(item);

    return connection;
}

Gridifier.HorizontalGrid.Prepender.prototype._filterConnectorsPerNextConnection = function() {
    var connectors = this._connectors.getClone();

    this._connectorsSelector.attachConnectors(connectors);
    this._connectorsSelector.selectOnlySpecifiedSideConnectorsOnAppendedItems(Gridifier.Connectors.SIDES.LEFT.BOTTOM);
    connectors = this._connectorsSelector.getSelectedConnectors();
   
    if(this._settings.isDefaultIntersectionStrategy()) {
        this._connectorsShifter.attachConnectors(connectors); 
        this._connectorsShifter.shiftAllConnectors();
        connectors = this._connectorsShifter.getAllConnectors();
    }
    else if(this._settings.isNoIntersectionsStrategy()) {
        var connectorsSide = Gridifier.Connectors.SIDES.LEFT.BOTTOM;

        this._connectorsSelector.attachConnectors(connectors);
        this._connectorsSelector.selectOnlyMostLeftConnectorFromSide(connectorsSide);
        connectors = this._connectorsSelector.getSelectedConnectors();
        
        this._connectorsShifter.attachConnectors(connectors);
        this._connectorsShifter.shiftAllWithSpecifiedSideToBottomGridCorner(connectorsSide);
        connectors = this._connectorsShifter.getAllConnectors();
    }

    this._connectorsSorter.attachConnectors(connectors);
    this._connectorsSorter.sortConnectorsForPrepend(Gridifier.PREPEND_TYPES.DEFAULT_PREPEND);

    return this._connectorsSorter.getConnectors();
}

Gridifier.HorizontalGrid.Prepender.prototype._findItemConnectionCoords = function(item, sortedConnectors) {
    var itemConnectionCoords = null;

    for(var i = 0; i < sortedConnectors.length; i++) {
        var itemCoords = this._itemCoordsExtractor.connectorToPrependedItemCoords(item, sortedConnectors[i]);
        if(itemCoords.y1 < this._normalizer.normalizeLowRounding(0)) {
            continue;
        }

        var maybeIntersectableConnections = this._connectionsIntersector.findAllMaybeIntersectableConnectionsOnPrepend(sortedConnectors[i]);
        if(this._connectionsIntersector.isIntersectingAnyConnection(maybeIntersectableConnections, itemCoords)) {
            continue;
        }

        itemConnectionCoords = itemCoords;

        var connectionsBeforeCurrent = this._connections.getAllConnectionsBeforeX(itemCoords.x1);
        if(this._connections.isAnyConnectionItemGUIDBiggerThan(connectionsBeforeCurrent, item)) {
            continue;
        }

        if(this._settings.isNoIntersectionsStrategy()) {
            if(this._connections.isIntersectingMoreThanOneConnectionItemHorizontally(itemConnectionCoords)) {
                itemConnectionCoords = null;
            }
        }

        if(itemConnectionCoords != null) {
            break;
        }
    }

    if(itemConnectionCoords == null) {
        var errorType = Gridifier.Error.ERROR_TYPES.INSERTER.TOO_TALL_ITEM_ON_HORIZONTAL_GRID_INSERT;
        new Gridifier.Error(errorType, item);
    }

    return itemConnectionCoords;
}

Gridifier.HorizontalGrid.ReversedAppender = function(gridifier,
                                                     settings,
                                                     sizesResolverManager,
                                                     connectors,
                                                     connections,
                                                     guid,
                                                     renderer,
                                                     normalizer,
                                                     operation) {
    var me = this;

    this._gridifier = null;
    this._settings = null;
    this._sizesResolverManager = null;
    this._guid = null;
    this._renderer = null;
    this._normalizer = null;
    this._operation = null;
    this._connectors = null;
    this._connections = null;

    this._connectorsCleaner = null;
    this._connectorsShifter = null;
    this._connectorsSelector = null;
    this._connectorsSorter = null;
    this._itemCoordsExtractor = null;
    this._connectionsIntersector = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._settings = settings;
        me._sizesResolverManager = sizesResolverManager;
        me._guid = guid;
        me._renderer = renderer;
        me._normalizer = normalizer;
        me._operation = operation;
        me._connectors = connectors;
        me._connections = connections;

        me._connectorsCleaner = new Gridifier.HorizontalGrid.ConnectorsCleaner(
            me._connectors, me._connections, me._settings
        );
        me._connectorsShifter = new Gridifier.ConnectorsShifter(
            me._gridifier, me._connections, me._settings
        );
        me._connectorsSelector = new Gridifier.HorizontalGrid.ConnectorsSelector(me._guid);
        me._connectorsSorter = new Gridifier.HorizontalGrid.ConnectorsSorter();
        me._itemCoordsExtractor = new Gridifier.HorizontalGrid.ItemCoordsExtractor(me._gridifier, me._sizesResolverManager);
        me._connectionsIntersector = new Gridifier.HorizontalGrid.ConnectionsIntersector(me._connections);
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

Gridifier.HorizontalGrid.ReversedAppender.prototype.reversedAppend = function(item) {
    this._initConnectors();

    var connection = this._createConnectionPerItem(item);
    this._connections.attachConnectionToRanges(connection);

    this._connectorsCleaner.deleteAllTooLeftConnectorsFromMostRightConnector();
    this._connectorsCleaner.deleteAllIntersectedFromRightConnectors();

    if(this._settings.isDefaultIntersectionStrategy())
        this._renderer.showConnections(connection);
    else if(this._settings.isNoIntersectionsStrategy()) {
        var colConnections = this._connections.getLastColHorizontallyExpandedConnections();

        for(var i = 0; i < colConnections.length; i++) {
            if(colConnections[i].itemGUID == connection.itemGUID) {
                colConnections.splice(i, 1);
                i--;
            }
        }

        this._renderer.renderConnectionsAfterDelay(colConnections);
        this._renderer.showConnections(connection);
    }
}

Gridifier.HorizontalGrid.ReversedAppender.prototype._initConnectors = function() {
    if(this._operation.isInitialOperation(Gridifier.OPERATIONS.REVERSED_APPEND)) {
        this.createInitialConnector();
        return;
    }

    if(!this._operation.isCurrentOperationSameAsPrevious(Gridifier.OPERATIONS.REVERSED_APPEND)) {
        this.recreateConnectorsPerAllConnectedItems();
        this._connectorsCleaner.deleteAllIntersectedFromRightConnectors();
        this._connectorsCleaner.deleteAllTooLeftConnectorsFromMostRightConnector();
    }
}

Gridifier.HorizontalGrid.ReversedAppender.prototype.createInitialConnector = function() {
    this._connectors.addAppendConnector(
        Gridifier.Connectors.SIDES.TOP.LEFT,
        0,
        parseFloat(this._gridifier.getGridY2())
    );
}

Gridifier.HorizontalGrid.ReversedAppender.prototype.recreateConnectorsPerAllConnectedItems = function(disableFlush) {
    var disableFlush = disableFlush || false;
    if(!disableFlush)
        this._connectors.flush();

    var connections = this._connections.get(); 
    for(var i = 0; i < connections.length; i++) {
        this._addItemConnectors(connections[i], connections[i].itemGUID);
    }

    if(this._connectors.count() == 0)
        this.createInitialConnector();
}

Gridifier.HorizontalGrid.ReversedAppender.prototype._addItemConnectors = function(itemCoords, itemGUID) {
    if((itemCoords.y1 - 1) >= 0) {
        this._connectors.addAppendConnector(
            Gridifier.Connectors.SIDES.TOP.LEFT,
            parseFloat(itemCoords.x1),
            parseFloat(itemCoords.y1 - 1),
            Dom.toInt(itemGUID)
        );
    }

    this._connectors.addAppendConnector(
        Gridifier.Connectors.SIDES.RIGHT.BOTTOM,
        parseFloat(itemCoords.x2 + 1),
        parseFloat(itemCoords.y2),
        Dom.toInt(itemGUID)
    );
}

Gridifier.HorizontalGrid.ReversedAppender.prototype._createConnectionPerItem = function(item) {
    var sortedConnectors = this._filterConnectorsPerNextConnection();
    var itemConnectionCoords = this._findItemConnectionCoords(item, sortedConnectors);
    var connection = this._connections.add(item, itemConnectionCoords);

    if(this._settings.isNoIntersectionsStrategy()) {
        this._connections.expandHorizontallyAllColConnectionsToMostWide(connection);
    }
    this._addItemConnectors(itemConnectionCoords, this._guid.getItemGUID(item));

    return connection;
}

Gridifier.HorizontalGrid.ReversedAppender.prototype._filterConnectorsPerNextConnection = function() {
    var connectors = this._connectors.getClone();

    this._connectorsSelector.attachConnectors(connectors);
    this._connectorsSelector.selectOnlySpecifiedSideConnectorsOnPrependedItems(Gridifier.Connectors.SIDES.RIGHT.BOTTOM);
    connectors = this._connectorsSelector.getSelectedConnectors();

    if(this._settings.isDefaultIntersectionStrategy()) {
        this._connectorsShifter.attachConnectors(connectors);
        this._connectorsShifter.shiftAllConnectors();
        connectors = this._connectorsShifter.getAllConnectors();
    }
    else if(this._settings.isNoIntersectionsStrategy()) {
        var connectorsSide = Gridifier.Connectors.SIDES.RIGHT.BOTTOM;

        this._connectorsSelector.attachConnectors(connectors);
        this._connectorsSelector.selectOnlyMostRightConnectorFromSide(connectorsSide);
        connectors = this._connectorsSelector.getSelectedConnectors();

        this._connectorsShifter.attachConnectors(connectors);
        this._connectorsShifter.shiftAllWithSpecifiedSideToBottomGridCorner(connectorsSide);
        connectors = this._connectorsShifter.getAllConnectors();
    }

    this._connectorsSorter.attachConnectors(connectors);
    this._connectorsSorter.sortConnectorsForAppend(Gridifier.APPEND_TYPES.REVERSED_APPEND);

    return this._connectorsSorter.getConnectors();
}

Gridifier.HorizontalGrid.ReversedAppender.prototype._findItemConnectionCoords = function(item, sortedConnectors) {
    var itemConnectionCoords = null;
    
    for(var i = 0; i < sortedConnectors.length; i++) {
        var itemCoords = this._itemCoordsExtractor.connectorToReversedAppendedItemCoords(item, sortedConnectors[i]);

        if(itemCoords.y1 < this._normalizer.normalizeLowRounding(0)) {
            continue;
        }
        
        var maybeIntersectableConnections = this._connectionsIntersector.findAllMaybeIntersectableConnectionsOnAppend(
            sortedConnectors[i]
        );
        if(this._connectionsIntersector.isIntersectingAnyConnection(maybeIntersectableConnections, itemCoords)) {
            continue;
        }
        
        itemConnectionCoords = itemCoords;
        
        var connectionsBehindCurrent = this._connections.getAllConnectionsBehindX(itemCoords.x2);
        if(this._connections.isAnyConnectionItemGUIDSmallerThan(connectionsBehindCurrent, item)) {
            continue;
        }

        if(this._settings.isNoIntersectionsStrategy()) {
            if(this._connections.isIntersectingMoreThanOneConnectionItemHorizontally(itemConnectionCoords)) {
                itemConnectionCoords = null;
            }
        }
        
        if(itemConnectionCoords != null) {
            break;
        }
    }

    if(itemConnectionCoords == null) {
        var errorType = Gridifier.Error.ERROR_TYPES.INSERTER.TOO_TALL_ITEM_ON_HORIZONTAL_GRID_INSERT;
        new Gridifier.Error(errorType, item);
    }
    
    return itemConnectionCoords;
}

Gridifier.HorizontalGrid.ReversedPrepender = function(gridifier, 
                                                      settings, 
                                                      sizesResolverManager,
                                                      connectors, 
                                                      connections, 
                                                      guid, 
                                                      renderer, 
                                                      normalizer,
                                                      operation) {
    var me = this;

    this._gridifier = null;
    this._settings = null;
    this._sizesResolverManager = null;
    this._guid = null;
    this._renderer = null;
    this._normalizer = null;
    this._operation = null;
    this._connectors = null;
    this._connections = null;

    this._connectorsCleaner = null;
    this._connectorsShifter = null;
    this._connectorsSelector = null;
    this._connectorsSorter = null;
    this._itemCoordsExtractor = null;
    this._connectionsIntersector = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._settings = settings;
        me._sizesResolverManager = sizesResolverManager;
        me._guid = guid;
        me._renderer = renderer;
        me._normalizer = normalizer;
        me._operation = operation;
        me._connectors = connectors;
        me._connections = connections;

        me._connectorsCleaner = new Gridifier.HorizontalGrid.ConnectorsCleaner(
            me._connectors, me._connections, me._settings
        );
        me._connectorsShifter = new Gridifier.ConnectorsShifter(
            me._gridifier, me._connections, me._settings
        );
        me._connectorsSelector = new Gridifier.HorizontalGrid.ConnectorsSelector(me._guid);
        me._connectorsSorter = new Gridifier.HorizontalGrid.ConnectorsSorter();
        me._itemCoordsExtractor = new Gridifier.HorizontalGrid.ItemCoordsExtractor(me._gridifier, me._sizesResolverManager);
        me._connectionsIntersector = new Gridifier.HorizontalGrid.ConnectionsIntersector(me._connections);
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

Gridifier.HorizontalGrid.ReversedPrepender.prototype.reversedPrepend = function(item) {
    this._initConnectors();

    var connection = this._createConnectionPerItem(item);
    var wereItemsNormalized = this._connections.normalizeHorizontalPositionsOfAllConnectionsAfterPrepend(
        connection, this._connectors.get()
    );
    this._connections.attachConnectionToRanges(connection);

    this._connectorsCleaner.deleteAllTooRightConnectorsFromMostLeftConnector();
    this._connectorsCleaner.deleteAllIntersectedFromLeftConnectors();

    if(wereItemsNormalized) {
        this._renderer.renderConnections(this._connections.get(), [connection]);
    }

    if(this._settings.isDefaultIntersectionStrategy())
        this._renderer.showConnections(connection);
    else if(this._settings.isNoIntersectionsStrategy()) {
        var colConnections = this._connections.getLastColHorizontallyExpandedConnections();

        for(var i = 0; i < colConnections.length; i++) {
            if(colConnections[i].itemGUID == connection.itemGUID) {
                colConnections.splice(i, 1);
                i--;
            }
        }

        this._renderer.renderConnectionsAfterDelay(colConnections);
        this._renderer.showConnections(connection);
    }
}

Gridifier.HorizontalGrid.ReversedPrepender.prototype._initConnectors = function() {
    if(this._operation.isInitialOperation(Gridifier.OPERATIONS.REVERSED_PREPEND)) {
        this.createInitialConnector();
        return;
    }

    if(!this._operation.isCurrentOperationSameAsPrevious(Gridifier.OPERATIONS.REVERSED_PREPEND)) {
        this.recreateConnectorsPerAllConnectedItems();
        this._connectorsCleaner.deleteAllIntersectedFromLeftConnectors();
        this._connectorsCleaner.deleteAllTooRightConnectorsFromMostLeftConnector();
    }
}

Gridifier.HorizontalGrid.ReversedPrepender.prototype.createInitialConnector = function() {
    this._connectors.addPrependConnector(
        Gridifier.Connectors.SIDES.BOTTOM.RIGHT,
        0,
        0
    );
}

Gridifier.HorizontalGrid.ReversedPrepender.prototype.recreateConnectorsPerAllConnectedItems = function(disableFlush) {
    var disableFlush = disableFlush || false;
    if(!disableFlush)
        this._connectors.flush();

    var connections = this._connections.get();
    for(var i = 0; i < connections.length; i++) {
        this._addItemConnectors(connections[i], connections[i].itemGUID);
    }

    if(this._connectors.count() == 0)
        this.createInitialConnector();
}

Gridifier.HorizontalGrid.ReversedPrepender.prototype._addItemConnectors = function(itemCoords, itemGUID) {
    if((itemCoords.y2 + 1) <= this._gridifier.getGridY2()) {
        this._connectors.addPrependConnector(
            Gridifier.Connectors.SIDES.BOTTOM.RIGHT,
            parseFloat(itemCoords.x2),
            parseFloat(itemCoords.y2 + 1),
            Dom.toInt(itemGUID)
        );
    }

    this._connectors.addPrependConnector(
        Gridifier.Connectors.SIDES.LEFT.TOP,
        parseFloat(itemCoords.x1 - 1),
        parseFloat(itemCoords.y1),
        Dom.toInt(itemGUID)
    );
}

Gridifier.HorizontalGrid.ReversedPrepender.prototype._createConnectionPerItem = function(item) {
    var sortedConnectors = this._filterConnectorsPerNextConnection();
    var itemConnectionCoords = this._findItemConnectionCoords(item, sortedConnectors);

    var connection = this._connections.add(item, itemConnectionCoords);
    if(this._settings.isNoIntersectionsStrategy()) {
        this._connections.expandHorizontallyAllColConnectionsToMostWide(connection);
    }
    this._addItemConnectors(itemConnectionCoords, this._guid.getItemGUID(item));
    this._guid.markAsPrependedItem(item);

    return connection;
}

Gridifier.HorizontalGrid.ReversedPrepender.prototype._filterConnectorsPerNextConnection = function() {
    var connectors = this._connectors.getClone();

    this._connectorsSelector.attachConnectors(connectors);
    this._connectorsSelector.selectOnlySpecifiedSideConnectorsOnAppendedItems(Gridifier.Connectors.SIDES.LEFT.TOP);
    connectors = this._connectorsSelector.getSelectedConnectors();

    if(this._settings.isDefaultIntersectionStrategy()) {
        this._connectorsShifter.attachConnectors(connectors);
        this._connectorsShifter.shiftAllConnectors();
        connectors = this._connectorsShifter.getAllConnectors();
    }
    else if(this._settings.isNoIntersectionsStrategy()) {
        var connectorsSide = Gridifier.Connectors.SIDES.LEFT.TOP;

        this._connectorsSelector.attachConnectors(connectors);
        this._connectorsSelector.selectOnlyMostLeftConnectorFromSide(connectorsSide);
        connectors = this._connectorsSelector.getSelectedConnectors();
        
        this._connectorsShifter.attachConnectors(connectors);
        this._connectorsShifter.shiftAllWithSpecifiedSideToTopGridCorner(connectorsSide);
        connectors = this._connectorsShifter.getAllConnectors();
    }

    this._connectorsSorter.attachConnectors(connectors);
    this._connectorsSorter.sortConnectorsForPrepend(Gridifier.PREPEND_TYPES.REVERSED_PREPEND);

    return this._connectorsSorter.getConnectors();
}

Gridifier.HorizontalGrid.ReversedPrepender.prototype._findItemConnectionCoords = function(item, sortedConnectors) {
    var itemConnectionCoords = null;
    
    for(var i = 0; i < sortedConnectors.length; i++) {
        var itemCoords = this._itemCoordsExtractor.connectorToReversedPrependedItemCoords(item, sortedConnectors[i]);
        if(itemCoords.y2 > this._normalizer.normalizeHighRounding(this._gridifier.getGridY2())) {
            continue;
        }

        var maybeIntersectableConnections = this._connectionsIntersector.findAllMaybeIntersectableConnectionsOnPrepend(sortedConnectors[i]);
        if(this._connectionsIntersector.isIntersectingAnyConnection(maybeIntersectableConnections, itemCoords)) {
            continue;
        }

        itemConnectionCoords = itemCoords;

        var connectionsBeforeCurrent = this._connections.getAllConnectionsBeforeX(itemCoords.x1);
        if(this._connections.isAnyConnectionItemGUIDBiggerThan(connectionsBeforeCurrent, item)) {
            continue;
        }

        if(this._settings.isNoIntersectionsStrategy()) {
            if(this._connections.isIntersectingMoreThanOneConnectionItemHorizontally(itemConnectionCoords)) {
                itemConnectionCoords = null;
            }
        }

        if(itemConnectionCoords != null) {
            break;
        }
    }

    if(itemConnectionCoords == null) {
        var errorType = Gridifier.Error.ERROR_TYPES.INSERTER.TOO_TALL_ITEM_ON_HORIZONTAL_GRID_INSERT;
        new Gridifier.Error(errorType, item);
    }
    
    return itemConnectionCoords;
}

Gridifier.Operations.Append = function(gridSizesUpdater,
                                       collector, 
                                       connections,
                                       connectionsSorter,
                                       guid, 
                                       settings,
                                       appender,
                                       reversedAppender,
                                       sizesTransformer,
                                       sizesResolverManager) {
    var me = this;

    this._gridSizesUpdater = null;
    this._collector = null;
    this._connections = null;
    this._connectionsSorter = null;
    this._guid = null;
    this._settings = null;
    this._appender = null;
    this._reversedAppender = null;
    this._sizesTransformer = null;
    this._sizesResolverManager = null;

    this._css = {
    };

    this._construct = function() {
        me._gridSizesUpdater = gridSizesUpdater;
        me._collector = collector;
        me._connections = connections;
        me._connectionsSorter = connectionsSorter;
        me._guid = guid;
        me._settings = settings;
        me._appender = appender;
        me._reversedAppender = reversedAppender;
        me._sizesTransformer = sizesTransformer;
        me._sizesResolverManager = sizesResolverManager;
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

Gridifier.Operations.Append.prototype.execute = function(items) {
    var items = this._collector.toDOMCollection(items);
    this._sizesResolverManager.startCachingTransaction();

    this._collector.ensureAllItemsAreAttachedToGrid(items);
    this._collector.ensureAllItemsCanBeAttachedToGrid(items);

    items = this._collector.filterCollection(items);
    items = this._collector.sortCollection(items);
    
    for(var i = 0; i < items.length; i++) {
        this._collector.unmarkItemAsRestrictedToCollect(items[i]);
        this._collector.attachToGrid(items[i]);
        this._guid.markNextAppendedItem(items[i]);
        this._append(items[i]);
    }

    this._sizesResolverManager.stopCachingTransaction();
    this._gridSizesUpdater.scheduleGridSizesUpdate();
}

Gridifier.Operations.Append.prototype._append = function(item) {
    if(this._settings.isDefaultAppend()) {
        this._appender.append(item);
    }
    else if(this._settings.isReversedAppend()) {
        this._reversedAppender.reversedAppend(item);
    }
}

Gridifier.Operations.Append.prototype.executeInsertBefore = function(items, beforeItem) {
    var connections = this._connections.get();
    if(connections.length == 0) {
        this.execute(items);
        return;
    }

    var connectionsToRetransform = [];
    connections = this._connectionsSorter.sortConnectionsPerReappend(connections);

    if(typeof beforeItem == "undefined" || beforeItem == null) {
        var beforeItem = connections[0].item;
    }
    else {
        var beforeItem = (this._collector.toDOMCollection(beforeItem))[0];
        // This check is required, if beforeItem is jQuery find result without DOMElem
        if(typeof beforeItem == "undefined" || beforeItem == null)
            var beforeItem = connections[0].item;
    }

    var beforeItemGUID = null;
    var targetItemFound = false;
    for(var i = 0; i < connections.length; i++) {
        if(this._guid.getItemGUID(connections[i].item) == this._guid.getItemGUID(beforeItem)) {
            targetItemFound = true;
            beforeItemGUID = connections[i].itemGUID;
            connectionsToRetransform = connectionsToRetransform.concat(
                connections.splice(i, connections.length - i)
            );
            break;
        }
    }
    
    if(!targetItemFound) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.APPENDER.WRONG_INSERT_BEFORE_TARGET_ITEM,
            beforeItem
        );
        return;
    }
    
    this._connections.reinitRanges();
    this._guid.reinitMaxGUID(beforeItemGUID - 1);

    if(this._settings.isDefaultAppend())
        this._appender.recreateConnectorsPerAllConnectedItems();
    else if(this._settings.isReversedAppend())
        this._reversedAppender.recreateConnectorsPerAllConnectedItems();

    this.execute(items);

    if(this._settings.isDisabledSortDispersion()) {
        this._connections.restore(connectionsToRetransform);
        this._connections.remapAllItemGUIDSInSortedConnections(connectionsToRetransform);
    }
    else if(this._settings.isCustomSortDispersion() || this._settings.isCustomAllEmptySpaceSortDispersion()) {
        this._connections.restoreOnCustomSortDispersionMode(connectionsToRetransform);
        this._connections.remapAllItemGUIDS();
    }

    this._sizesTransformer.retransformFrom(connectionsToRetransform[0]);
}

Gridifier.Operations.Append.prototype.executeInsertAfter = function(items, afterItem) {
    var connections = this._connections.get();
    if(connections.length == 0) {
        this.execute(items);
        return;
    }

    var connectionsToRetransform = [];
    connections = this._connectionsSorter.sortConnectionsPerReappend(connections);

    if(typeof afterItem == "undefined" || afterItem == null) {
        var afterItem = connections[connections.length - 1].item;
    }
    else {
        var afterItem = (this._collector.toDOMCollection(afterItem))[0];
        // This check is required, if afterItem is jQuery find result without DOMElem
        if(typeof afterItem == "undefined" || afterItem == null)
            var afterItem = connections[connections.length - 1].item;
    }

    var afterItemGUID = null;
    var targetItemFound = false;
    for(var i = 0; i < connections.length; i++) {
        if(this._guid.getItemGUID(connections[i].item) == this._guid.getItemGUID(afterItem)) {
            targetItemFound = true;
            afterItemGUID = connections[i].itemGUID;
            connectionsToRetransform = connectionsToRetransform.concat(
                connections.splice(i + 1, connections.length - i - 1)
            );
            break;
        }
    }

    if(!targetItemFound) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.APPENDER.WRONG_INSERT_AFTER_TARGET_ITEM,
            afterItem
        );
        return;
    }

    this._connections.reinitRanges();
    this._guid.reinitMaxGUID(afterItemGUID + 1);

    if(this._settings.isDefaultAppend())
        this._appender.recreateConnectorsPerAllConnectedItems();
    else if(this._settings.isReversedAppend())
        this._reversedAppender.recreateConnectorsPerAllConnectedItems();

    this.execute(items);

    if(this._settings.isDisabledSortDispersion()) {
        this._connections.restore(connectionsToRetransform);
        this._connections.remapAllItemGUIDSInSortedConnections(connectionsToRetransform);
    }
    else if(this._settings.isCustomSortDispersion() || this._settings.isCustomAllEmptySpaceSortDispersion()) {
        this._connections.restoreOnCustomSortDispersionMode(connectionsToRetransform);
        this._connections.remapAllItemGUIDS();
    }

    if(connectionsToRetransform.length > 0)
        this._sizesTransformer.retransformFrom(connectionsToRetransform[0]);
}

Gridifier.Operations.Prepend = function(gridSizesUpdater,
                                        collector, 
                                        guid, 
                                        settings,
                                        prepender,
                                        reversedPrepender,
                                        sizesResolverManager) {
    var me = this;

    this._gridSizesUpdater = null;
    this._collector = null;
    this._guid = null;
    this._settings = null;
    this._prepender = null;
    this._reversedPrepender = null;
    this._sizesResolverManager = null;

    this._css = {
    };

    this._construct = function() {
        me._gridSizesUpdater = gridSizesUpdater;
        me._collector = collector;
        me._guid = guid;
        me._settings = settings;
        me._prepender = prepender;
        me._reversedPrepender = reversedPrepender;
        me._sizesResolverManager = sizesResolverManager;
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

Gridifier.Operations.Prepend.prototype.execute = function(items) {
    var items = this._collector.toDOMCollection(items);
    this._sizesResolverManager.startCachingTransaction();

    this._collector.ensureAllItemsAreAttachedToGrid(items);
    this._collector.ensureAllItemsCanBeAttachedToGrid(items);

    items = this._collector.filterCollection(items);
    items = this._collector.sortCollection(items);

    for(var i = 0; i < items.length; i++) {
        this._collector.unmarkItemAsRestrictedToCollect(items[i]);
        this._collector.attachToGrid(items[i]);
        this._guid.markNextPrependedItem(items[i]);
        this._prepend(items[i]);
    }

    this._sizesResolverManager.stopCachingTransaction();
    this._gridSizesUpdater.scheduleGridSizesUpdate();
}

Gridifier.Operations.Prepend.prototype._prepend = function(item) {
    if(this._settings.isDefaultPrepend()) {
        this._prepender.prepend(item);
    }
    else if(this._settings.isReversedPrepend()) {
        this._reversedPrepender.reversedPrepend(item);
    }
}

Gridifier.Operations.Queue = function(gridSizesUpdater,
                                      collector,
                                      connections,
                                      connectionsSorter,
                                      guid,
                                      settings,
                                      prepender,
                                      reversedPrepender,
                                      appender,
                                      reversedAppender,
                                      sizesTransformer,
                                      sizesResolverManager) {
    var me = this;

    this._gridSizesUpdater = null;
    this._collector = null;
    this._connections = null;
    this._connectionsSorter = null;
    this._guid = null;
    this._settings = null;
    this._prepender = null;
    this._reversedPrepender = null;
    this._appender = null;
    this._reversedAppender = null;
    this._sizesTransformer = null;
    this._sizesResolverManager = null;

    this._operationsQueue = null;

    /*
        Array(
            {'queuedOperationType' => 'qot', 'items/item' => 'i', 'opSpecificParam1' => 'osp1', ...},
            ....,
            n
        )
    */
    this._queuedOperations = [];
    this._isWaitingForTransformerQueueRelease = false;

    this._prependOperation = null;
    this._appendOperation = null;

    this._css = {
    };

    this._construct = function() {
        me._gridSizesUpdater = gridSizesUpdater;
        me._collector = collector;
        me._connections = connections;
        me._connectionsSorter = connectionsSorter;
        me._guid = guid;
        me._settings = settings;
        me._prepender = prepender;
        me._reversedPrepender = reversedPrepender;
        me._appender = appender;
        me._reversedAppender = reversedAppender;
        me._sizesTransformer = sizesTransformer;
        me._sizesResolverManager = sizesResolverManager;

        me._prependOperation = new Gridifier.Operations.Prepend(
            me._gridSizesUpdater, 
            me._collector, 
            me._guid, 
            me._settings, 
            me._prepender, 
            me._reversedPrepender,
            me._sizesResolverManager
        );
        me._appendOperation = new Gridifier.Operations.Append(
            me._gridSizesUpdater, 
            me._collector, 
            me._connections,
            me._connectionsSorter,
            me._guid, 
            me._settings, 
            me._appender, 
            me._reversedAppender,
            me._sizesTransformer,
            me._sizesResolverManager
        );
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

Gridifier.Operations.Queue.QUEUED_OPERATION_TYPES = {PREPEND: 0, APPEND: 1, INSERT_BEFORE: 2, INSERT_AFTER: 3};
Gridifier.Operations.Queue.PROCESS_QUEUED_OPERATIONS_TIMEOUT = 100;
Gridifier.Operations.Queue.DEFAULT_BATCH_TIMEOUT = 100;

Gridifier.Operations.Queue.prototype.schedulePrependOperation = function(items, batchSize, batchTimeout) {
    var me = this;
    var schedulePrepend = function(items) {
        setTimeout(function() {
            if(me._sizesTransformer.isTransformerQueueEmpty()) {
                me._executePrependOperation.call(me, items);
            }
            else {
                me._queuedOperations.push({
                    queuedOperationType: Gridifier.Operations.Queue.QUEUED_OPERATION_TYPES.PREPEND,
                    items: items
                });

                if(me._isWaitingForTransformerQueueRelease)
                    return;

                setTimeout(function() {
                    me._isWaitingForTransformerQueueRelease = true;
                    me._processQueuedOperations.call(me);
                }, Gridifier.Operations.Queue.PROCESS_QUEUED_OPERATIONS_TIMEOUT);
            }
        }, 0);
    }

    if(typeof batchSize == "undefined") {
        schedulePrepend.call(me, items);
        return;
    }

    var batchTimeout = batchTimeout || Gridifier.Operations.Queue.DEFAULT_BATCH_TIMEOUT;
    var itemBatches = this._packItemsToBatches(items, batchSize);
    for(var i = 0; i < itemBatches.length; i++) {
        (function(itemBatch, i) {
            setTimeout(function() { schedulePrepend.call(me, itemBatch); }, batchTimeout * i);
        })(itemBatches[i], i);
    }
}

Gridifier.Operations.Queue.prototype.scheduleAppendOperation = function(items, batchSize, batchTimeout) {
    var me = this;
    var scheduleAppend = function(items) {
        setTimeout(function() { 
            if(me._sizesTransformer.isTransformerQueueEmpty()) {
                me._executeAppendOperation.call(me, items);
            }
            else {
                me._queuedOperations.push({
                    queuedOperationType: Gridifier.Operations.Queue.QUEUED_OPERATION_TYPES.APPEND,
                    items: items
                });

                if(me._isWaitingForTransformerQueueRelease)
                    return;

                setTimeout(function() {
                    me._isWaitingForTransformerQueueRelease = true;
                    me._processQueuedOperations.call(me);
                }, Gridifier.Operations.Queue.PROCESS_QUEUED_OPERATIONS_TIMEOUT);
            }
        }, 0);
    }

    if(typeof batchSize == "undefined") {
        scheduleAppend.call(me, items);
        return;
    }

    var batchTimeout = batchTimeout || Gridifier.Operations.Queue.DEFAULT_BATCH_TIMEOUT;
    var itemBatches = this._packItemsToBatches(items, batchSize);
    for(var i = 0; i < itemBatches.length; i++) {
        (function(itemBatch, i) {
            setTimeout(function() { scheduleAppend.call(me, itemBatch); }, batchTimeout * i);
        })(itemBatches[i], i);
    }
}

Gridifier.Operations.Queue.prototype.scheduleInsertBeforeOperation = function(items, 
                                                                              beforeItem, 
                                                                              batchSize, 
                                                                              batchTimeout) {
    var me = this;
    var scheduleInsertBefore = function(items, beforeItem) {
        setTimeout(function() { 
            if(me._sizesTransformer.isTransformerQueueEmpty()) {
                me._executeInsertBeforeOperation.call(me, items, beforeItem);
            }
            else {
                me._queuedOperations.push({
                    queuedOperationType: Gridifier.Operations.Queue.QUEUED_OPERATION_TYPES.INSERT_BEFORE,
                    items: items,
                    beforeItem: beforeItem
                });

                if(me._isWaitingForTransformerQueueRelease)
                    return;

                setTimeout(function() {
                    me._isWaitingForTransformerQueueRelease = true;
                    me._processQueuedOperations.call(me);
                }, Gridifier.Operations.Queue.PROCESS_QUEUED_OPERATIONS_TIMEOUT);
            }
        }, 0);
    }

    if(typeof batchSize == "undefined") {
        scheduleInsertBefore.call(me, items, beforeItem);
        return;
    }

    var batchTimeout = batchTimeout || Gridifier.Operations.Queue.DEFAULT_BATCH_TIMEOUT;
    var itemBatches = this._packItemsToBatches(items, batchSize);
    for(var i = 0; i < itemBatches.length; i++) {
        (function(itemBatch, i) {
            setTimeout(function() { scheduleInsertBefore.call(me, itemBatch, beforeItem); }, batchTimeout * i);
        })(itemBatches[i], i);
    }
}

Gridifier.Operations.Queue.prototype.scheduleInsertAfterOperation = function(items,
                                                                             afterItem,
                                                                             batchSize,
                                                                             batchTimeout) {
    var me = this;
    var scheduleInsertAfter = function(items, afterItem) {
        setTimeout(function() {
            if(me._sizesTransformer.isTransformerQueueEmpty()) {
                me._executeInsertAfterOperation.call(me, items, afterItem);
            }
            else {
                me._queuedOperations.push({
                    queuedOperationType: Gridifier.Operations.Queue.QUEUED_OPERATION_TYPES.INSERT_AFTER,
                    items: items,
                    afterItem: afterItem
                });

                if(me._isWaitingForTransformerQueueRelease)
                    return;

                setTimeout(function() {
                    me._isWaitingForTransformerQueueRelease = true;
                    me._processQueuedOperations.call(me);
                }, Gridifier.Operations.Queue.PROCESS_QUEUED_OPERATIONS_TIMEOUT);
            }
        }, 0);
    }

    if(typeof batchSize == "undefined") {
        scheduleInsertAfter.call(me, items, afterItem);
        return;
    }

    var batchTimeout = batchTimeout || Gridifier.Operations.Queue.DEFAULT_BATCH_TIMEOUT;
    var itemBatches = this._packItemsToBatches(items, batchSize);
    for(var i = 0; i < itemBatches.length; i++) {
        (function(itemBatch, i) {
            setTimeout(function() { scheduleInsertAfter.call(me, itemBatch, afterItem); }, batchTimeout * i);
        })(itemBatches[i], i);
    }
}

Gridifier.Operations.Queue.prototype._packItemsToBatches = function(items, batchSize) {
    var items = this._collector.toDOMCollection(items);
    return this.splitItemsToBatches(items, batchSize);
}

Gridifier.Operations.Queue.prototype.splitItemsToBatches = function(items, batchSize) {
    var itemBatches = [];
    var itemsCountInCurrentBatch = 0;
    var itemsBatch = [];
    var wasLastBatchPushed = false;

    for(var i = 0; i < items.length; i++) {
        itemsBatch.push(items[i]);
        wasLastBatchPushed = false;

        itemsCountInCurrentBatch++;
        if(itemsCountInCurrentBatch == batchSize) {
            itemBatches.push(itemsBatch);
            itemsBatch = [];
            wasLastBatchPushed = true;
            itemsCountInCurrentBatch = 0;
        }
    }

    if(!wasLastBatchPushed)
        itemBatches.push(itemsBatch);

    return itemBatches;
}

Gridifier.Operations.Queue.prototype._processQueuedOperations = function() {
    var me = this;

    var wereAllQueueOperationsExecuted = true;
    for(var i = 0; i < this._queuedOperations.length; i++) {
        if(!this._sizesTransformer.isTransformerQueueEmpty()) {
            setTimeout(function() {
                me._processQueuedOperations.call(me);
            }, Gridifier.Operations.Queue.PROCESS_QUEUED_OPERATIONS_TIMEOUT);
            wereAllQueueOperationsExecuted = false;
            break;
        }

        var queuedOperationTypes = Gridifier.Operations.Queue.QUEUED_OPERATION_TYPES;
        if(this._queuedOperations[i].queuedOperationType == queuedOperationTypes.APPEND) {
            this._executeAppendOperation(this._queuedOperations[i].items);
        }
        else if(this._queuedOperations[i].queuedOperationType == queuedOperationTypes.PREPEND) {
            this._executePrependOperation(this._queuedOperations[i].items);
        }
        else if(this._queuedOperations[i].queuedOperationType == queuedOperationTypes.INSERT_BEFORE) {
            this._executeInsertBeforeOperation(
                this._queuedOperations[i].items,
                this._queuedOperations[i].beforeItem
            );
        }
        else if(this._queuedOperations[i].queuedOperationType == queuedOperationTypes.INSERT_AFTER) {
            this._executeInsertAfterOperation(
                this._queuedOperations[i].items,
                this._queuedOperations[i].afterItem
            );
        }
        else {
            var operationType = this._queuedOperations[i].queuedOperationType;
            throw new Error("Unknown queued operation type = '" + operationType + "'");
        }

        this._queuedOperations.shift();
        i--;
    }

    if(wereAllQueueOperationsExecuted)
        this._isWaitingForTransformerQueueRelease = false;
}

Gridifier.Operations.Queue.prototype._executePrependOperation = function(items) {
    this._prependOperation.execute(items);
}

Gridifier.Operations.Queue.prototype._executeAppendOperation = function(items) {
    this._appendOperation.execute(items);
}

Gridifier.Operations.Queue.prototype._executeInsertBeforeOperation = function(items, beforeItem) {
    this._appendOperation.executeInsertBefore(items, beforeItem);
}

Gridifier.Operations.Queue.prototype._executeInsertAfterOperation = function(items, afterItem) { 
    this._appendOperation.executeInsertAfter(items, afterItem);
}

Gridifier.Renderer = function(gridifier, connections, settings, normalizer) {
    var me = this;

    this._gridifier = null;
    this._connections = null;
    this._settings = null;
    this._normalizer = null;

    this._transformedItemMarker = null;

    this._rendererSchedulator = null;
    this._rendererConnections = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._connections = connections;
        me._settings = settings;
        me._normalizer = normalizer;

        me._transformedItemMarker = new Gridifier.SizesTransformer.TransformedItemMarker();

        me._rendererConnections = new Gridifier.Renderer.Connections(
            me._settings
        );
        me._rendererSchedulator = new Gridifier.Renderer.Schedulator(
            me._gridifier, me._settings, me._connections, me, me._rendererConnections
        );
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

Gridifier.Renderer.prototype.getRendererConnections = function() {
    return this._rendererConnections;
}

Gridifier.Renderer.prototype.setSilentRendererInstance = function(silentRenderer) {
    this._rendererSchedulator.setSilentRendererInstance(silentRenderer);
}

Gridifier.Renderer.prototype.showConnections = function(connections) {
    var me = this;

    if(!Dom.isArray(connections))
        var connections = [connections];

    for(var i = 0; i < connections.length; i++) {
        if(this._rendererConnections.isConnectionItemRendered(connections[i]))
            continue;

        var left = this._rendererConnections.getCssLeftPropertyValuePerConnection(connections[i]);
        var top = this._rendererConnections.getCssTopPropertyValuePerConnection(connections[i]);
        this._rendererConnections.markConnectionItemAsRendered(connections[i]);

        this._rendererSchedulator.reinit();
        this._rendererSchedulator.scheduleShow(connections[i], left, top);
    }
}

Gridifier.Renderer.prototype.hideConnections = function(connections) {
    var me = this;

    if(!Dom.isArray(connections))
        var connections = [connections];

    for(var i = 0; i < connections.length; i++) {
        var left = this._rendererConnections.getCssLeftPropertyValuePerConnection(connections[i]);
        var top = this._rendererConnections.getCssTopPropertyValuePerConnection(connections[i]);
        this._rendererConnections.unmarkConnectionItemAsRendered(connections[i]);

        this._rendererSchedulator.reinit();
        this._rendererSchedulator.scheduleHide(connections[i], left, top);
    }
}

Gridifier.Renderer.prototype.renderTransformedConnections = function(connections) {
    for(var i = 0; i < connections.length; i++) {
        var left = this._rendererConnections.getCssLeftPropertyValuePerConnection(connections[i]);
        var top = this._rendererConnections.getCssTopPropertyValuePerConnection(connections[i]);

        this._rendererSchedulator.reinit();

        if(this._transformedItemMarker.isTransformedItem(connections[i].item)) {
            var targetRawSizes = this._transformedItemMarker.getTransformedItemTargetRawSizes(
                connections[i].item
            );

            this._rendererSchedulator.scheduleRenderTransformed(
                connections[i], left, top, targetRawSizes.targetRawWidth, targetRawSizes.targetRawHeight
            );
            this._transformedItemMarker.unmarkItemAsTransformed(connections[i].item);
        }
        else if(this._transformedItemMarker.isDependedItem(connections[i].item)) {
            this._rendererSchedulator.scheduleRenderDepended(connections[i], left, top);
            this._transformedItemMarker.unmarkItemAsDepended(connections[i].item);
        }
    }
}

Gridifier.Renderer.prototype.renderConnections = function(connections, exceptConnections) {
    var exceptConnections = exceptConnections || false;

    for(var i = 0; i < connections.length; i++) {
        if(exceptConnections) {
            var skipConnection = false;

            for(var j = 0; j < exceptConnections.length; j++) {
                if(connections[i].itemGUID == exceptConnections[j].itemGUID) {
                    skipConnection = true;
                    break;
                }
            }

            if(skipConnection) continue;
        }

        var left = this._rendererConnections.getCssLeftPropertyValuePerConnection(connections[i]);
        var top = this._rendererConnections.getCssTopPropertyValuePerConnection(connections[i]);

        this._rendererSchedulator.reinit();
        this._rendererSchedulator.scheduleRender(connections[i], left, top);
    }
}

// Delay in row/col updates in noIntersectionsMode is required, because without it refreshes
// will be called right after show method, and will be placed in the end of animation.
// (Example: slide show method -> calling 0ms offset translate at start, than this refresh
// will be called before slideOutTimeout without a delay.(Will move items instantly)
Gridifier.Renderer.prototype.renderConnectionsAfterDelay = function(connections, delay) {
    var me = this;
    var delay = delay || 20;

    for(var i = 0; i < connections.length; i++) {
        this._rendererSchedulator.reinit();
        this._rendererSchedulator.scheduleDelayedRender(connections[i], null, null, delay);
    }
}

Gridifier.Renderer.Connections = function(settings) {
    var me = this;

    this._settings = null;

    this._css = {
    };

    this._construct = function() {
        me._settings = settings;
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

Gridifier.Renderer.Connections.CONNECTION_RENDERED_ITEM_DATA_CLASS = "gridifier-connection-rendered";

Gridifier.Renderer.Connections.prototype.isConnectionItemRendered = function(connection) {
    return Dom.css.hasClass(
        connection.item,
        Gridifier.Renderer.Connections.CONNECTION_RENDERED_ITEM_DATA_CLASS
    );
}

Gridifier.Renderer.Connections.prototype.markConnectionItemAsRendered = function(connection) {
    Dom.css.addClass(
        connection.item,
        Gridifier.Renderer.Connections.CONNECTION_RENDERED_ITEM_DATA_CLASS
    );
}

Gridifier.Renderer.Connections.prototype.unmarkConnectionItemAsRendered = function(connection) {
    Dom.css.removeClass(
        connection.item,
        Gridifier.Renderer.Connections.CONNECTION_RENDERED_ITEM_DATA_CLASS
    );
}

Gridifier.Renderer.Connections.prototype.getCssLeftPropertyValuePerConnection = function(connection) {
    if(this._settings.isVerticalGrid()) {
        var left = connection.x1 + "px";
    }
    else if(this._settings.isHorizontalGrid()) {
        if(this._settings.isDefaultIntersectionStrategy()) {
            var left = connection.x1 + "px";
        }
        else if(this._settings.isNoIntersectionsStrategy()) {
            var left = (connection.x1 + connection.horizontalOffset) + "px";
        }
    }

    return left;
}

Gridifier.Renderer.Connections.prototype.getCssTopPropertyValuePerConnection = function(connection) {
    if(this._settings.isVerticalGrid()) {
        if(this._settings.isDefaultIntersectionStrategy()) {
            var top = connection.y1 + "px";
        }
        else if(this._settings.isNoIntersectionsStrategy()) {
            var top = (connection.y1 + connection.verticalOffset) + "px";
        }
    }
    else if(this._settings.isHorizontalGrid()) {
        var top = connection.y1 + "px";
    }

    return top;
}

Gridifier.Renderer.Schedulator = function(gridifier, settings, connections, renderer, rendererConnections) {
    var me = this;

    this._gridifier = null;
    this._settings = null;
    this._connections = null;
    this._renderer = null;
    this._rendererConnections = null;
    this._silentRenderer = null;

    // Array[
    //     [0] => {connection: connection, processingType: processingType, left: left, top: top, 
    //             (targetWidth: tw, targetHeight: th)},
    //     [1] => {connection: connection, processingType: processingType, left: left, top: top
    //             (targetWidth: tw, targetHeight: th)},
    //     ...,
    //     n
    // ]
    this._scheduledConnectionsToProcessData = null;
    this._processScheduledConnectionsTimeout = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._settings = settings;
        me._connections = connections;
        me._renderer = renderer;
        me._rendererConnections = rendererConnections;
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

Gridifier.Renderer.Schedulator.PROCESS_SCHEDULED_CONNECTIONS_TIMEOUT = 20;
Gridifier.Renderer.Schedulator.SCHEDULED_CONNECTIONS_PROCESSING_TYPES = {
    SHOW: 0, HIDE: 1, RENDER: 2, RENDER_TRANSFORMED: 3, RENDER_DEPENDED: 4, DELAYED_RENDER: 5
};

Gridifier.Renderer.Schedulator.prototype.setSilentRendererInstance = function(silentRenderer) {
    this._silentRenderer = silentRenderer;
}

Gridifier.Renderer.Schedulator.prototype.reinit = function() {
    if(this._scheduledConnectionsToProcessData == null) {
        this._scheduledConnectionsToProcessData = [];
    }
    else {
        clearTimeout(this._processScheduledConnectionsTimeout);
        this._processScheduledConnectionsTimeout = null;
    }
}

Gridifier.Renderer.Schedulator.prototype.scheduleShow = function(connection, left, top) {
    if(this._silentRenderer.isScheduledForSilentRender(connection.item))
        return;

    this._scheduledConnectionsToProcessData.push({
        connection: connection,
        processingType: Gridifier.Renderer.Schedulator.SCHEDULED_CONNECTIONS_PROCESSING_TYPES.SHOW,
        left: left,
        top: top
    });
    this._schedule();
}

Gridifier.Renderer.Schedulator.prototype.scheduleHide = function(connection, left, top) {
    this._scheduledConnectionsToProcessData.push({
        connection: connection,
        processingType: Gridifier.Renderer.Schedulator.SCHEDULED_CONNECTIONS_PROCESSING_TYPES.HIDE,
        left: left,
        top: top
    });
    this._schedule();
}

Gridifier.Renderer.Schedulator.prototype.scheduleRender = function(connection, left, top) {
    this._scheduledConnectionsToProcessData.push({
        connection: connection,
        processingType: Gridifier.Renderer.Schedulator.SCHEDULED_CONNECTIONS_PROCESSING_TYPES.RENDER,
        left: left,
        top: top
    });
    this._schedule();
}

Gridifier.Renderer.Schedulator.prototype.scheduleDelayedRender = function(connection, left, top, delay) {
    this._scheduledConnectionsToProcessData.push({
        connection: connection,
        processingType: Gridifier.Renderer.Schedulator.SCHEDULED_CONNECTIONS_PROCESSING_TYPES.DELAYED_RENDER,
        left: left,
        top: top,
        delay: delay
    });
    this._schedule();
}

Gridifier.Renderer.Schedulator.prototype.scheduleRenderTransformed = function(connection, 
                                                                              left, 
                                                                              top,
                                                                              targetWidth,
                                                                              targetHeight) {
    this._scheduledConnectionsToProcessData.push({
        connection: connection,
        processingType: Gridifier.Renderer.Schedulator.SCHEDULED_CONNECTIONS_PROCESSING_TYPES.RENDER_TRANSFORMED,
        left: left,
        top: top,
        targetWidth: targetWidth,
        targetHeight: targetHeight
    });
    this._schedule();
}

Gridifier.Renderer.Schedulator.prototype.scheduleRenderDepended = function(connection, left, top) {
    this._scheduledConnectionsToProcessData.push({
        connection: connection,
        processingType: Gridifier.Renderer.Schedulator.SCHEDULED_CONNECTIONS_PROCESSING_TYPES.RENDER_DEPENDED,
        left: left,
        top: top
    });
    this._schedule();
}

Gridifier.Renderer.Schedulator.prototype._schedule = function() {
    var me = this;

    this._processScheduledConnectionsTimeout = setTimeout(function() {
        me._processScheduledConnections.call(me);
    }, Gridifier.Renderer.Schedulator.PROCESS_SCHEDULED_CONNECTIONS_TIMEOUT);
}

Gridifier.Renderer.Schedulator.prototype._processScheduledConnections = function() {
    var me = this;
    var schedulator = Gridifier.Renderer.Schedulator;

    for(var i = 0; i < this._scheduledConnectionsToProcessData.length; i++) {
        var connectionToProcess = this._scheduledConnectionsToProcessData[i].connection;
        var processingType = this._scheduledConnectionsToProcessData[i].processingType;
        var left = this._scheduledConnectionsToProcessData[i].left;
        var top = this._scheduledConnectionsToProcessData[i].top;

        if(this._silentRenderer.isScheduledForSilentRender(connectionToProcess.item))
            continue;

        if(processingType == schedulator.SCHEDULED_CONNECTIONS_PROCESSING_TYPES.SHOW) {
            Dom.css.set(connectionToProcess.item, {
                position: "absolute",
                left: left,
                top: top
            });

            if(this._gridifier.hasItemBindedClone(connectionToProcess.item)) {
               var itemClone = this._gridifier.getItemClone(connectionToProcess.item);

               Dom.css.set(itemClone, {
                  position: "absolute",
                  left: left,
                  top: top
               });
            }
            
            var toggleFunction = this._settings.getToggle();
            var toggleTimeouter = this._settings.getToggleTimeouter();
            var eventEmitter = this._settings.getEventEmitter();
            var animationMsDuration = this._settings.getToggleAnimationMsDuration();
            var sizesResolverManager = this._settings.getSizesResolverManager();
            var coordsChanger = this._settings.getCoordsChanger();
            var collector = this._settings.getCollector();
            var coordsChangerApi = this._settings.getCoordsChangerApi();
            var itemClonesManager = this._gridifier.getItemClonesManager();
            var toggleTransitionTiming = this._settings.getToggleTransitionTiming();

            var showItem = function(item) {
                toggleFunction.show(
                    connectionToProcess.item,
                    me._gridifier.getGrid(),
                    animationMsDuration,
                    toggleTimeouter,
                    eventEmitter,
                    sizesResolverManager,
                    coordsChanger,
                    collector,
                    left,
                    top,
                    coordsChangerApi,
                    itemClonesManager,
                    toggleTransitionTiming
                );
            };

            // Due to the bags, caused by setting multiple transform properties sequentially,
            // we should preinit item with all transform rules, which will be used in coords changers.
            // Scale always should be first(otherwise animation will break), translates should be also
            // setted up with SINGLE rule at start. Thus, they can be overriden later. Otherwise,
            // animation will break.
            if(this._gridifier.hasItemBindedClone(connectionToProcess.item)) {
                var itemClone = this._gridifier.getItemClone(connectionToProcess.item);
                coordsChanger(itemClone, left, top, animationMsDuration, eventEmitter, false, false, false, true);
            }
            else {
                coordsChanger(connectionToProcess.item, left, top, animationMsDuration, eventEmitter, false, false, false, true);
            }

            showItem(connectionToProcess.item);
        }
        else if(processingType == schedulator.SCHEDULED_CONNECTIONS_PROCESSING_TYPES.HIDE) {
            var toggleFunction = this._settings.getToggle();
            var toggleTimeouter = this._settings.getToggleTimeouter();
            var eventEmitter = this._settings.getEventEmitter();
            var animationMsDuration = this._settings.getToggleAnimationMsDuration();
            var sizesResolverManager = this._settings.getSizesResolverManager();
            var coordsChanger = this._settings.getCoordsChanger();
            var collector = this._settings.getCollector();
            var coordsChangerApi = this._settings.getCoordsChangerApi();
            var itemClonesManager = this._gridifier.getItemClonesManager();
            var toggleTransitionTiming = this._settings.getToggleTransitionTiming();

            var hideItem = function(item) {
                toggleFunction.hide(
                    item,
                    me._gridifier.getGrid(),
                    animationMsDuration,
                    toggleTimeouter,
                    eventEmitter,
                    sizesResolverManager,
                    coordsChanger,
                    collector,
                    left,
                    top,
                    coordsChangerApi,
                    itemClonesManager,
                    toggleTransitionTiming
                );
            };

            hideItem(connectionToProcess.item);
        }
        else if(processingType == schedulator.SCHEDULED_CONNECTIONS_PROCESSING_TYPES.DELAYED_RENDER) {
            var delay = this._scheduledConnectionsToProcessData[i].delay;
            var coordsChanger = this._settings.getCoordsChanger();
            var animationMsDuration = this._settings.getCoordsChangeAnimationMsDuration();
            var eventEmitter = this._settings.getEventEmitter();
            var coordsChangeTransitionTiming = this._settings.getCoordsChangeTransitionTiming();

            var me = this;
            (function(item, animationMsDuration, eventEmitter, transitionTiming, delay) {
                setTimeout(function() {
                    // Because of using this delayed timeout we should find item connection again.
                    // There could be a bunch of resizes since this delayedRender schedule, so this item connection can point to the
                    // old version of the connection.
                    var connectionToProcess = me._connections.findConnectionByItem(item);

                    coordsChanger(
                        item,
                        me._rendererConnections.getCssLeftPropertyValuePerConnection(connectionToProcess),
                        me._rendererConnections.getCssTopPropertyValuePerConnection(connectionToProcess),
                        animationMsDuration,
                        eventEmitter,
                        false,
                        false,
                        false,
                        false,
                        transitionTiming
                    );
                }, delay);
            })(connectionToProcess.item, animationMsDuration, eventEmitter, coordsChangeTransitionTiming, delay);
        }
        else if(processingType == schedulator.SCHEDULED_CONNECTIONS_PROCESSING_TYPES.RENDER ||
                processingType == schedulator.SCHEDULED_CONNECTIONS_PROCESSING_TYPES.RENDER_DEPENDED) {
            var coordsChanger = this._settings.getCoordsChanger();
            var animationMsDuration = this._settings.getCoordsChangeAnimationMsDuration();
            var eventEmitter = this._settings.getEventEmitter();
            var coordsChangeTransitionTiming = this._settings.getCoordsChangeTransitionTiming();

            coordsChanger(
                connectionToProcess.item,
                left,
                top,
                animationMsDuration,
                eventEmitter,
                false,
                false,
                false,
                false,
                coordsChangeTransitionTiming
            );
        }
        else if(processingType == schedulator.SCHEDULED_CONNECTIONS_PROCESSING_TYPES.RENDER_TRANSFORMED) {
            var targetWidth = this._scheduledConnectionsToProcessData[i].targetWidth;
            var targetHeight = this._scheduledConnectionsToProcessData[i].targetHeight;

            var sizesChanger = this._settings.getSizesChanger();

            sizesChanger(
                connectionToProcess.item, 
                targetWidth, 
                targetHeight
            );

            var coordsChanger = this._settings.getCoordsChanger();
            var animationMsDuration = this._settings.getCoordsChangeAnimationMsDuration();
            var eventEmitter = this._settings.getEventEmitter();
            var coordsChangeTransitionTiming = this._settings.getCoordsChangeTransitionTiming();

            coordsChanger(
                connectionToProcess.item, 
                left, 
                top,
                animationMsDuration,
                eventEmitter,
                true,
                targetWidth,
                targetHeight,
                false,
                coordsChangeTransitionTiming
            );
        }
    }

    this._gridifier.scheduleGridSizesUpdate();

    this._scheduledConnectionsToProcessData = null;
    this._processScheduledConnectionsTimeout = null;
}

Gridifier.SilentRenderer = function(gridifier,
                                    collector,
                                    connections,
                                    operationsQueue,
                                    renderer,
                                    rendererConnections) {
    var me = this;

    this._gridifier = null;
    this._collector = null;
    this._connections = null;
    this._operationsQueue = null;
    this._renderer = null;
    this._rendererConnections = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._collector = collector;
        me._connections = connections;
        me._operationsQueue = operationsQueue;
        me._renderer = renderer;
        me._rendererConnections = rendererConnections;
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

Gridifier.SilentRenderer.SILENT_RENDER_DATA_ATTR = "data-gridifier-scheduled-for-silent-render";
Gridifier.SilentRenderer.SILENT_RENDER_DATA_ATTR_VALUE = "silentRender";

Gridifier.SilentRenderer.prototype.scheduleForSilentRender = function(items) {
    for(var i = 0; i < items.length; i++) {
        items[i].setAttribute(
            Gridifier.SilentRenderer.SILENT_RENDER_DATA_ATTR,
            Gridifier.SilentRenderer.SILENT_RENDER_DATA_ATTR_VALUE
        );
    }
}

Gridifier.SilentRenderer.prototype.unscheduleForSilentRender = function(items, connections) {
    for(var i = 0; i < items.length; i++) {
        items[i].removeAttribute(Gridifier.SilentRenderer.SILENT_RENDER_DATA_ATTR);
        this._rendererConnections.unmarkConnectionItemAsRendered(connections[i]);
    }
}

Gridifier.SilentRenderer.prototype.isScheduledForSilentRender = function(item) {
    return Dom.hasAttribute(item, Gridifier.SilentRenderer.SILENT_RENDER_DATA_ATTR);
}

Gridifier.SilentRenderer.prototype.execute = function(batchSize, batchTimeout) {
    var executeSilentRender = function(scheduledItems, scheduledConnections) {
        this.unscheduleForSilentRender(scheduledItems, scheduledConnections);
        this._renderer.showConnections(scheduledConnections);
    }

    var me = this;

    var scheduleSilentRendererExecution = function() {
        var scheduledItems = this._collector.collectByQuery(
            "[" + Gridifier.SilentRenderer.SILENT_RENDER_DATA_ATTR + "=" + Gridifier.SilentRenderer.SILENT_RENDER_DATA_ATTR_VALUE + "]"
        );
        var scheduledConnections = [];
        for (var i = 0; i < scheduledItems.length; i++) {
            var scheduledItemConnection = this._connections.findConnectionByItem(scheduledItems[i], true);
            if(scheduledItemConnection != null)
                scheduledConnections.push(scheduledItemConnection);
        }

        var connectionsSorter = this._connections.getConnectionsSorter();
        scheduledConnections = connectionsSorter.sortConnectionsPerReappend(scheduledConnections);
        scheduledItems = [];
        for (var i = 0; i < scheduledConnections.length; i++)
            scheduledItems.push(scheduledConnections[i].item);

        if (typeof batchSize == "undefined") {
            executeSilentRender.call(me, scheduledItems, scheduledConnections);
            return;
        }

        if (typeof batchTimeout == "undefined")
            var batchTimeout = 100;

        var itemBatches = this._operationsQueue.splitItemsToBatches(scheduledItems, batchSize);
        var connectionBatches = this._operationsQueue.splitItemsToBatches(scheduledConnections, batchSize);
        for (var i = 0; i < itemBatches.length; i++) {
            (function (itemBatch, i, connectionBatch) {
                setTimeout(function () {
                    executeSilentRender.call(me, itemBatch, connectionBatch);
                }, batchTimeout * i);
            })(itemBatches[i], i, connectionBatches[i]);
        }
    }

    // If 100ms is not enough to silently append all required items, user should call silentRender one more time.
    setTimeout(function() { scheduleSilentRendererExecution.call(me); }, Gridifier.REFLOW_OPTIMIZATION_TIMEOUT + 100);
}

Gridifier.ApiSettingsParser = function(settingsCore, settings) {
    var me = this;

    this._settingsCore = null;
    this._settings = null;

    this._css = {
    };

    this._construct = function() {
        me._settingsCore = settingsCore;
        me._settings = settings;
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

Gridifier.ApiSettingsParser.prototype.parseToggleOptions = function(toggleApi) {
    if(!this._settings.hasOwnProperty("toggle")) {
        toggleApi.setToggleFunction("scale");
        return;
    }

    if(typeof this._settings.toggle != "object") {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_TOGGLE_PARAM_VALUE,
            this._settings.toggle
        );
    }

    for(var toggleFunctionName in this._settings.toggle) {
        var toggleFunctionsData = this._settings.toggle[toggleFunctionName];

        if(typeof toggleFunctionsData != "object"
            || typeof toggleFunctionsData.show == "undefined"
            || typeof toggleFunctionsData.hide == "undefined") {
            new Gridifier.Error(
                Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_ONE_OF_TOGGLE_PARAMS,
                toggleFunctionsData
            );
        }

        toggleApi.addToggleFunction(toggleFunctionName, toggleFunctionData);
    }
    
    toggleApi.setToggleFunction("scale");
}

Gridifier.ApiSettingsParser.prototype.parseSortOptions = function(sortApi) {
    if(!this._settings.hasOwnProperty("sort")) {
        sortApi.setSortFunction("default");
        return;
    }

    if(typeof this._settings.sort == "function") {
        sortApi.addSortFunction("clientDefault", this._settings.sort);
        sortApi.setSortFunction("clientDefault");
        return;
    }
    else if(typeof this._settings.sort == "object") {
        for(var sortFunctionName in this._settings.sort) {
            var sortFunction = this._settings.sort[sortFunctionName];

            if(typeof sortFunction != "function") {
                new Gridifier.Error(
                    Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_ONE_OF_SORT_FUNCTION_TYPES,
                    sortFunction
                );
            }
            
            sortApi.addSortFunction(sortFunctionName, sortFunction);
        }
        
        sortApi.setSortFunction("default");
        return;
    }
    else {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_SORT_PARAM_VALUE,
            this._settings.sort
        );
    }
}

Gridifier.ApiSettingsParser.prototype.parseFilterOptions = function(filterApi) {
    if(!this._settings.hasOwnProperty("filter")) {
        filterApi.setFilterFunction("all");
        return;
    }

    if(typeof this._settings.filter == "function") {
        filterApi.addFilterFunction("clientDefault", this._settings.filter);
        filterApi.setFilterFunction("clientDefault");
        return;
    }
    else if(typeof this._settings.filter == "object") {
        for(var filterFunctionName in this._settings.filter) {
            var filterFunction = this._settings.filter[filterFunctionName];

            if(typeof filterFunction != "function") {
                new Gridifier.Error(
                    Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_ONE_OF_FILTER_FUNCTION_TYPES,
                    filterFunction
                );
            }

            filterApi.addFilterFunction(filterFunctionName, filterFunction);
        }

        filterApi.setFilterFunction("all");
        return;
    }
    else {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_FILTER_PARAM_VALUE,
            this._settings.filter
        );
    }
}

Gridifier.ApiSettingsParser.prototype.parseCoordsChangerOptions = function(coordsChangerApi) {
    if(!this._settings.hasOwnProperty("coordsChanger")) {
        coordsChangerApi.setCoordsChangerFunction("CSS3Translate3D");
        return;
    }

    if(typeof this._settings.coordsChanger == "function") {
        coordsChangerApi.addCoordsChangerFunction("clientDefault", this._settings.coordsChanger);
        coordsChangerApi.setCoordsChangerFunction("clientDefault");
    }
    else if(typeof this._settings.coordsChanger == "object") {
        for(var coordsChangerFunctionName in this._settings.coordsChanger) {
            var coordsChangerFunction = this._settings.coordsChanger[coordsChangerFunctionName];

            if(typeof coordsChangerFunction != "function") {
                new Gridifier.Error(
                    Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_ONE_OF_COORDS_CHANGER_FUNCTION_TYPES,
                    coordsChangerFunction
                );
            }

            coordsChangerApi.addCoordsChangerFunction(coordsChangerFunctionName, coordsChangerFunction);
        }
        
        coordsChangerApi.setCoordsChangerFunction("CSS3Translate3D");
    }
    else {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_COORDS_CHANGER_PARAM_VALUE,
            this._settings.coordsChanger
        );
    }
}

Gridifier.ApiSettingsParser.prototype.parseSizesChangerOptions = function(sizesChangerApi) {
    if(!this._settings.hasOwnProperty("sizesChanger")) {
        sizesChangerApi.setSizesChangerFunction("default");
        return;
    }

    if(typeof this._settings.sizesChanger == "function") {
        sizesChangerApi.addSizesChangerFunction("clientDefault", this._settings.sizesChanger);
        sizesChangerApi.setSizesChangerFunction("clientDefault");
        return;
    }
    else if(typeof this._settings.sizesChanger == "object") {
        for(var sizesChangerFunctionName in this._settings.sizesChanger) {
            var sizesChangerFunction = this._settings.sizesChanger[sizesChangerFunctionName];

            if(typeof sizesChangerFunction != "function") {
                new Gridifier.Error(
                    Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_ONE_OF_SIZES_CHANGER_FUNCTION_TYPES,
                    sizesChangerFunction
                );
            }

            sizesChangerApi.addSizesChangerFunction(sizesChangerFunctionName, sizesChangerFunction);
        }
        
        sizesChangerApi.setSizesChangerFunction("default");
        return;
    }
    else {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_SIZES_CHANGER_PARAM_VALUE,
            this._settings.sizesChanger
        );
    }
}

Gridifier.ApiSettingsParser.prototype.parseDraggableItemDecoratorOptions = function(dragifierApi) {
    if(!this._settings.hasOwnProperty("draggableItemDecorator")) {
        dragifierApi.setDraggableItemDecoratorFunction("cloneCSS");
        return;
    }

    if(typeof this._settings.draggableItemDecorator == "function") {
        dragifierApi.addDraggableItemDecoratorFunction("clientDefault", this._settings.draggableItemDecorator);
        dragifierApi.setDraggableItemDecoratorFunction("clientDefault");
        return;
    }
    else if(typeof this._settings.draggableItemDecorator == "object") {
        for(var draggableItemDecoratorFunctionName in this._settings.draggableItemDecorator) {
            var draggableItemDecoratorFunction = this._settings.draggableItemDecorator[draggableItemDecoratorFunctionName];

            if(typeof draggableItemDecoratorFunction != "function") {
                new Gridifier.Error(
                    Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_ONE_OF_DRAGGABLE_ITEM_DECORATOR_FUNCTION_TYPES,
                    draggableItemDecoratorFunction
                );
            }

            dragifierApi.addDraggableItemDecoratorFunction(draggableItemDecoratorFunctionName, draggableItemDecoratorFunction);
        }

        dragifierApi.setDraggableItemDecoratorFunction("cloneCSS");
        return;
    }
    else {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_DRAGGABLE_ITEM_DECORATOR_PARAM_VALUE,
            this._settings.draggableItemDecorator
        );
    }
}

Gridifier.CoreSettingsParser = function(settingsCore, settings) {
    var me = this;

    this._settingsCore = null;
    this._settings = null;

    this._css = {
    };

    this._construct = function() {
        me._settingsCore = settingsCore;
        me._settings = settings;
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

Gridifier.CoreSettingsParser.prototype.parseGridType = function() {
    if(!this._settings.hasOwnProperty("gridType")) {
        var gridType = Gridifier.GRID_TYPES.VERTICAL_GRID;
        return gridType;
    }

    if(this._settings.gridType != Gridifier.GRID_TYPES.VERTICAL_GRID
        && this._settings.gridType != Gridifier.GRID_TYPES.HORIZONTAL_GRID) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_GRID_TYPE,
            this._settings.gridType
        );
    }
    
    var gridType = this._settings.gridType;
    return gridType;
}

Gridifier.CoreSettingsParser.prototype.parsePrependType = function() {
    if(!this._settings.hasOwnProperty("prependType")) {
        var prependType = Gridifier.PREPEND_TYPES.DEFAULT_PREPEND;
        return prependType;
    }

    if(this._settings.prependType != Gridifier.PREPEND_TYPES.DEFAULT_PREPEND 
        && this._settings.prependType != Gridifier.PREPEND_TYPES.REVERSED_PREPEND 
        && this._settings.prependType != Gridifier.PREPEND_TYPES.MIRRORED_PREPEND) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_PREPEND_TYPE,
            this._settings.prependType
        );
    }
    
    var prependType = this._settings.prependType;
    return prependType;
}

Gridifier.CoreSettingsParser.prototype.parseAppendType = function() {
    if(!this._settings.hasOwnProperty("appendType")) {
        var appendType = Gridifier.APPEND_TYPES.DEFAULT_APPEND;
        return appendType;
    }

    if(this._settings.appendType != Gridifier.APPEND_TYPES.DEFAULT_APPEND
        && this._settings.appendType != Gridifier.APPEND_TYPES.REVERSED_APPEND) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_APPEND_TYPE,
            this._settings.appendType
        );
    }

    var appendType = this._settings.appendType;
    return appendType;
}

Gridifier.CoreSettingsParser.prototype.parseIntersectionStrategy = function() {
    if(!this._settings.hasOwnProperty("intersectionStrategy")) {
        var intersectionStrategy = Gridifier.INTERSECTION_STRATEGIES.DEFAULT;
        return intersectionStrategy;
    }

    if(this._settings.intersectionStrategy != Gridifier.INTERSECTION_STRATEGIES.DEFAULT 
        && this._settings.intersectionStrategy != Gridifier.INTERSECTION_STRATEGIES.NO_INTERSECTIONS) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_INTERSECTION_STRATEGY,
            this._settings.intersectionStrategy
        );
    }

    var intersectionStrategy = this._settings.intersectionStrategy;
    return intersectionStrategy;
}

Gridifier.CoreSettingsParser.prototype.parseIntersectionStrategyAlignmentType = function() {
    var alignmentTypes = Gridifier.INTERSECTION_STRATEGY_ALIGNMENT_TYPES;

    if(!this._settings.hasOwnProperty("alignmentType")) {
        if(this._settingsCore.isVerticalGrid())
            var alignmentType = alignmentTypes.FOR_VERTICAL_GRID.TOP;
        else if(this._settingsCore.isHorizontalGrid()) 
            var alignmentType = alignmentTypes.FOR_HORIZONTAL_GRID.LEFT;
        
        return alignmentType;
    }

    this.ensureIsValidAlignmentType(this._settings.alignmentType);
    return this._settings.alignmentType;
}

Gridifier.CoreSettingsParser.prototype.ensureIsValidAlignmentType = function(alignmentType) {
    var alignmentTypes = Gridifier.INTERSECTION_STRATEGY_ALIGNMENT_TYPES;

    if(this._settingsCore.isVerticalGrid()) {
        var validAlignmentTypes = [
            alignmentTypes.FOR_VERTICAL_GRID.TOP,
            alignmentTypes.FOR_VERTICAL_GRID.CENTER,
            alignmentTypes.FOR_VERTICAL_GRID.BOTTOM
        ];
    }
    else if(this._settingsCore.isHorizontalGrid()) {
        var validAlignmentTypes = [
            alignmentTypes.FOR_HORIZONTAL_GRID.LEFT,
            alignmentTypes.FOR_HORIZONTAL_GRID.CENTER,
            alignmentTypes.FOR_HORIZONTAL_GRID.RIGHT
        ];
    }

    var isValidAlignmentType = false;
    for(var i = 0; i < validAlignmentTypes.length; i++) {
        if(validAlignmentTypes[i] == alignmentType)
            return;
    }

    new Gridifier.Error(
        Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_ALIGNMENT_TYPE,
        alignmentType
    );
}

Gridifier.CoreSettingsParser.prototype.parseSortDispersionMode = function() {
    if(!this._settings.hasOwnProperty("sortDispersionMode")) {
        var sortDispersionMode = Gridifier.SORT_DISPERSION_MODES.DISABLED;
        return sortDispersionMode;
    }

    if(this._settings.sortDispersionMode != Gridifier.SORT_DISPERSION_MODES.DISABLED 
        && this._settings.sortDispersionMode != Gridifier.SORT_DISPERSION_MODES.CUSTOM 
        && this._settings.sortDispersionMode != Gridifier.SORT_DISPERSION_MODES.CUSTOM_ALL_EMPTY_SPACE) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_SORT_DISPERSION_MODE,
            this._settings.sortDispersionMode
        );
    }

    var sortDispersionMode = this._settings.sortDispersionMode;
    return sortDispersionMode;
}

Gridifier.CoreSettingsParser.prototype.parseSortDispersionValue = function() {
    if(!this._settingsCore.isCustomSortDispersion())
        return "";

    if(!this._settings.hasOwnProperty("sortDispersionValue")) {
        new Gridifier.Error(Gridifier.Error.ERROR_TYPES.SETTINGS.MISSING_SORT_DISPERSION_VALUE);
    }

    var sortDispersionValueRegexp = new RegExp(/[\d]+(px)/);
    if(!sortDispersionValueRegexp.test(this._settings.sortDispersionValue)) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_SORT_DISPERSION_VALUE,
            this._settings.sortDispersionValue
        );
    }

    var sortDispersionValue = this._settings.sortDispersionValue;
    return sortDispersionValue;
}

Gridifier.CoreSettingsParser.prototype.parseResizeTimeoutValue = function() {
    if(!this._settings.hasOwnProperty("resizeTimeout"))
        return null;

    return Dom.toInt(this._settings.resizeTimeout);
}

Gridifier.CoreSettingsParser.prototype.parseDisableItemHideOnGridAttachValue = function() {
    if(!this._settings.hasOwnProperty("disableItemHideOnGridAttach"))
        return false;

    return true;
}

Gridifier.CoreSettingsParser.prototype.parseToggleAnimationMsDuration = function() {
    if(!this._settings.hasOwnProperty("toggleAnimationMsDuration"))
        return Gridifier.DEFAULT_TOGGLE_ANIMATION_MS_DURATION;

    return this._settings.toggleAnimationMsDuration;
}

Gridifier.CoreSettingsParser.prototype.parseCoordsChangeAnimationMsDuration = function() {
    if(!this._settings.hasOwnProperty("coordsChangeAnimationMsDuration"))
        return Gridifier.DEFAULT_COORDS_CHANGE_ANIMATION_MS_DURATION;

    return this._settings.coordsChangeAnimationMsDuration;
}

Gridifier.CoreSettingsParser.prototype.parseToggleTransitionTiming = function() {
    if(!this._settings.hasOwnProperty("toggleTransitionTiming"))
        return Gridifier.DEFAULT_TOGGLE_TRANSITION_TIMING;

    return this._settings.toggleTransitionTiming;
}

Gridifier.CoreSettingsParser.prototype.parseCoordsChangeTransitionTiming = function() {
    if(!this._settings.hasOwnProperty("coordsChangeTransitionTiming"))
        return Gridifier.DEFAULT_COORDS_CHANGE_TRANSITION_TIMING;

    return this._settings.coordsChangeTransitionTiming;
}

Gridifier.CoreSettingsParser.prototype.parseRotatePerspective = function() {
    if(!this._settings.hasOwnProperty("rotatePerspective"))
        return Gridifier.DEFAULT_ROTATE_PERSPECTIVE;

    return this._settings.rotatePerspective;
}

Gridifier.CoreSettingsParser.prototype.parseRotateBackface = function() {
    if(!this._settings.hasOwnProperty("rotateBackface"))
        return Gridifier.DEFAULT_ROTATE_BACKFACE;

    return this._settings.rotateBackface;
}

Gridifier.CoreSettingsParser.prototype.parseGridTransformType = function() {
    if(!this._settings.hasOwnProperty("gridTransformType"))
        return Gridifier.GRID_TRANSFORM_TYPES.FIT;

    if(this._settings.gridTransformType == Gridifier.GRID_TRANSFORM_TYPES.EXPAND)
        return Gridifier.GRID_TRANSFORM_TYPES.EXPAND;
    else
        return Gridifier.GRID_TRANSFORM_TYPES.FIT;
}

Gridifier.CoreSettingsParser.prototype.parseGridTransformTimeout = function() {
    if(!this._settings.hasOwnProperty("gridTransformTimeout"))
        return Gridifier.DEFAULT_GRID_TRANSFORM_TIMEOUT;

    return this._settings.gridTransformTimeout;
}

Gridifier.CoreSettingsParser.prototype.parseRetransformQueueBatchSize = function() {
    if(!this._settings.hasOwnProperty("retransformQueueBatchSize"))
        return Gridifier.RETRANSFORM_QUEUE_DEFAULT_BATCH_SIZE;

    return this._settings.retransformQueueBatchSize;
}

Gridifier.CoreSettingsParser.prototype.parseRetransformQueueBatchTimeout = function() {
    if(!this._settings.hasOwnProperty("retransformQueueBatchTimeout"))
        return Gridifier.RETRANSFORM_QUEUE_DEFAULT_BATCH_TIMEOUT;

    return this._settings.retransformQueueBatchTimeout;
}

Gridifier.CoreSettingsParser.prototype.parseGridItemMarkingStrategy = function() {
    if(!this._settings.hasOwnProperty(Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_CLASS) 
        && !this._settings.hasOwnProperty(Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_DATA_ATTR)
        && !this._settings.hasOwnProperty(Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_QUERY)) {
        return {
            gridItemMarkingStrategyType: Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_DATA_ATTR,
            gridItemMarkingValue: Gridifier.GRID_ITEM_MARKING_DEFAULTS.DATA_ATTR
        };
    }

    if(this._settings.hasOwnProperty(Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_CLASS)) {
        return {
            gridItemMarkingStrategyType: Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_CLASS,
            gridItemMarkingValue: this._settings[Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_CLASS]
        };
    }
    else if(this._settings.hasOwnProperty(Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_DATA_ATTR)) {
        return {
            gridItemMarkingStrategyType: Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_DATA_ATTR,
            gridItemMarkingValue: this._settings[Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_DATA_ATTR]
        };
    }
    else if(this._settings.hasOwnProperty(Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_QUERY)) {
        return {
            gridItemMarkingStrategyType: Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_QUERY,
            gridItemMarkingValue: this._settings[Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_QUERY]
        };
    }
}

Gridifier.CoreSettingsParser.prototype.parseDragifierMode = function() {
    if(this._settings.hasOwnProperty("dragifierMode") &&
        (this._settings.dragifierMode == Gridifier.DRAGIFIER_MODES.INTERSECTION ||
         this._settings.dragifierMode == Gridifier.DRAGIFIER_MODES.DISCRETIZATION)) {
        if(this._settings.dragifierMode == Gridifier.DRAGIFIER_MODES.DISCRETIZATION) {
            if(this._settingsCore.isNoIntersectionsStrategy() || !this._settingsCore.isCustomAllEmptySpaceSortDispersion()) {
                new Gridifier.Error(
                    Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_DRAGIFIER_DISCRETIZATION_MODE
                );
            }
        }

        return this._settings.dragifierMode;
    }

    return Gridifier.DRAGIFIER_MODES.INTERSECTION;
}

Gridifier.CoreSettingsParser.prototype.parseDragifierSettings = function() {
    if(this._settings.hasOwnProperty("dragifier") && this._settings.dragifier) {
        var shouldEnableDragifierOnInit = true;

        if(typeof this._settings.dragifier == "boolean") {
            var dragifierItemSelector = false;
        }
        else {
            var dragifierItemSelector = this._settings.dragifier;
        }
        
        return {
            shouldEnableDragifierOnInit: shouldEnableDragifierOnInit,
            dragifierItemSelector: dragifierItemSelector
        };
    }

    var shouldEnableDragifierOnInit = false;
    var dragifierItemSelector = false;

    return {
        shouldEnableDragifierOnInit: shouldEnableDragifierOnInit,
        dragifierItemSelector: dragifierItemSelector
    };
}

Gridifier.Settings = function(settings, gridifier, guid, eventEmitter, sizesResolverManager) {
    var me = this;

    this._settings = null;
    this._gridifier = null;
    this._guid = null;
    this._collector = null;
    this._eventEmitter = null;
    this._sizesResolverManager = null;

    this._coreSettingsParser = null;
    this._apiSettingsParser = null;

    this._gridType = null;

    this._prependType = null;
    this._appendType = null;

    this._intersectionStrategy = null;
    this._alignmentType = null;
    
    this._sortDispersionMode = null;
    this._sortDispersionValue = null;

    this._toggleApi = null;
    this._toggleTimeouterApi = null;
    this._sortApi = null;
    this._filterApi = null;
    this._coordsChangerApi = null;
    this._sizesChangerApi = null;
    this._dragifierApi = null;

    this._resizeTimeout = null;

    this._gridItemMarkingStrategyType = null;
    this._gridItemMarkingValue = null;

    this._dragifierMode = null;
    this._shouldEnableDragifierOnInit = false;
    this._dragifierItemSelector = null;

    this._shouldDisableItemHideOnGridAttach = false;
    this._toggleAnimationMsDuration = null;
    this._coordsChangeAnimationMsDuration = null;

    this._toggleTransitionTiming = null;
    this._coordsChangeTransitionTiming = null;

    this._rotatePerspective = null;
    this._rotateBackface = null;

    this._gridTransformType = null;
    this._gridTransformTimeout = null;

    this._retransformQueueBatchSize = null;
    this._retransformQueueBatchTimeout = null;

    this._css = {
    };

    this._construct = function() {
        me._settings = settings;
        me._gridifier = gridifier;
        me._guid = guid;
        me._eventEmitter = eventEmitter;
        me._sizesResolverManager = sizesResolverManager;

        me._coreSettingsParser = new Gridifier.CoreSettingsParser(me, me._settings);
        me._apiSettingsParser = new Gridifier.ApiSettingsParser(me, me._settings);

        me._toggleApi = new Gridifier.Api.Toggle(me, me._gridifier,  me._eventEmitter, me._sizesResolverManager);
        me._toggleTimeouterApi = new Gridifier.Api.ToggleTimeouter();
        me._sortApi = new Gridifier.Api.Sort(me, me._eventEmitter);
        me._filterApi = new Gridifier.Api.Filter(me, me._eventEmitter);
        me._coordsChangerApi = new Gridifier.Api.CoordsChanger(me, me._gridifier, me._eventEmitter);
        me._sizesChangerApi = new Gridifier.Api.SizesChanger(me, me._eventEmitter);
        me._dragifierApi = new Gridifier.Api.Dragifier();

        me._parse();
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

Gridifier.Settings.prototype.setCollectorInstance = function(collector) {
    this._toggleApi.setCollectorInstance(collector);
    this._collector = collector;
}

Gridifier.Settings.prototype._parse = function() {
    this._gridType = this._coreSettingsParser.parseGridType();
    this._prependType = this._coreSettingsParser.parsePrependType();
    this._appendType = this._coreSettingsParser.parseAppendType();
    this._intersectionStrategy = this._coreSettingsParser.parseIntersectionStrategy();
    this._alignmentType = this._coreSettingsParser.parseIntersectionStrategyAlignmentType();
    this._sortDispersionMode = this._coreSettingsParser.parseSortDispersionMode();
    this._sortDispersionValue = this._coreSettingsParser.parseSortDispersionValue();

    this._resizeTimeout = this._coreSettingsParser.parseResizeTimeoutValue();
    this._shouldDisableItemHideOnGridAttach = this._coreSettingsParser.parseDisableItemHideOnGridAttachValue();
    this._toggleAnimationMsDuration = this._coreSettingsParser.parseToggleAnimationMsDuration();
    this._coordsChangeAnimationMsDuration = this._coreSettingsParser.parseCoordsChangeAnimationMsDuration();
    this._toggleTransitionTiming = this._coreSettingsParser.parseToggleTransitionTiming();
    this._coordsChangeTransitionTiming = this._coreSettingsParser.parseCoordsChangeTransitionTiming();
    this._rotatePerspective = this._coreSettingsParser.parseRotatePerspective();
    this._rotateBackface = this._coreSettingsParser.parseRotateBackface();
    this._gridTransformType = this._coreSettingsParser.parseGridTransformType();
    this._gridTransformTimeout = this._coreSettingsParser.parseGridTransformTimeout();
    this._retransformQueueBatchSize = this._coreSettingsParser.parseRetransformQueueBatchSize();
    this._retransformQueueBatchTimeout = this._coreSettingsParser.parseRetransformQueueBatchTimeout();

    this._apiSettingsParser.parseToggleOptions(this._toggleApi);
    this._apiSettingsParser.parseSortOptions(this._sortApi);
    this._apiSettingsParser.parseFilterOptions(this._filterApi);
    this._apiSettingsParser.parseCoordsChangerOptions(this._coordsChangerApi);
    this._apiSettingsParser.parseSizesChangerOptions(this._sizesChangerApi);
    this._apiSettingsParser.parseDraggableItemDecoratorOptions(this._dragifierApi);

    var gridItemMarkingStrategyData = this._coreSettingsParser.parseGridItemMarkingStrategy();
    this._gridItemMarkingStrategyType = gridItemMarkingStrategyData.gridItemMarkingStrategyType;
    this._gridItemMarkingValue = gridItemMarkingStrategyData.gridItemMarkingValue;

    this._dragifierMode = this._coreSettingsParser.parseDragifierMode();
    var dragifierData = this._coreSettingsParser.parseDragifierSettings();
    this._shouldEnableDragifierOnInit = dragifierData.shouldEnableDragifierOnInit;
    this._dragifierItemSelector = dragifierData.dragifierItemSelector;
}

Gridifier.Settings.prototype.getCollector = function() {
    return this._collector;
}

Gridifier.Settings.prototype.getEventEmitter = function() {
    return this._eventEmitter;
}

Gridifier.Settings.prototype.getSizesResolverManager = function() {
    return this._sizesResolverManager;
}

Gridifier.Settings.prototype.getCoordsChangerApi = function() {
    return this._coordsChangerApi;
}

Gridifier.Settings.prototype.getResizeTimeout = function() {
    return this._resizeTimeout;
}

Gridifier.Settings.prototype.getToggleAnimationMsDuration = function() {
    return this._toggleAnimationMsDuration;
}

Gridifier.Settings.prototype.getCoordsChangeAnimationMsDuration = function() {
    return this._coordsChangeAnimationMsDuration;
}

Gridifier.Settings.prototype.getToggleTransitionTiming = function() {
    return this._toggleTransitionTiming;
}

Gridifier.Settings.prototype.getCoordsChangeTransitionTiming = function() {
    return this._coordsChangeTransitionTiming;
}

Gridifier.Settings.prototype.setToggleAnimationMsDuration = function(animationMsDuration) {
    this._toggleAnimationMsDuration = animationMsDuration;
}

Gridifier.Settings.prototype.setCoordsChangeAnimationMsDuration = function(animationMsDuration) {
    this._coordsChangeAnimationMsDuration = animationMsDuration;
}

Gridifier.Settings.prototype.getRotatePerspective = function() {
    return this._rotatePerspective;
}

Gridifier.Settings.prototype.getRotateBackface = function() {
    return this._rotateBackface;
}

Gridifier.Settings.prototype.isExpandGridTransformType = function() {
    return this._gridTransformType == Gridifier.GRID_TRANSFORM_TYPES.EXPAND;
}

Gridifier.Settings.prototype.isFitGridTransformType = function() {
    return this._gridTransformType == Gridifier.GRID_TRANSFORM_TYPES.FIT;
}

Gridifier.Settings.prototype.getGridTransformTimeout = function() {
    return this._gridTransformTimeout;
}

Gridifier.Settings.prototype.getRetransformQueueBatchSize = function() {
    return this._retransformQueueBatchSize;
}

Gridifier.Settings.prototype.getRetransformQueueBatchTimeout = function() {
    return this._retransformQueueBatchTimeout;
}

Gridifier.Settings.prototype.getToggleTimeouter = function() {
    return this._toggleTimeouterApi;
}

Gridifier.Settings.prototype.getDraggableItemCoordsChanger = function() {
    return this._dragifierApi.getDraggableItemCoordsChanger();
}

Gridifier.Settings.prototype.getDraggableItemPointerDecorator = function() {
    return this._dragifierApi.getDraggableItemPointerDecorator();
}

Gridifier.Settings.prototype.getDragifierUserSelectToggler = function() {
    return this._dragifierApi.getDragifierUserSelectToggler();
}

Gridifier.Settings.prototype.isVerticalGrid = function() {
    return this._gridType == Gridifier.GRID_TYPES.VERTICAL_GRID;
}

Gridifier.Settings.prototype.isHorizontalGrid = function() {
    return this._gridType == Gridifier.GRID_TYPES.HORIZONTAL_GRID;
}

Gridifier.Settings.prototype.isDefaultPrepend = function() {
    return this._prependType == Gridifier.PREPEND_TYPES.DEFAULT_PREPEND;
}

Gridifier.Settings.prototype.isReversedPrepend = function() {
    return this._prependType == Gridifier.PREPEND_TYPES.REVERSED_PREPEND;
}

Gridifier.Settings.prototype.isMirroredPrepend = function() {
    return this._prependType == Gridifier.PREPEND_TYPES.MIRRORED_PREPEND;
}

Gridifier.Settings.prototype.isDefaultAppend = function() {
    return this._appendType == Gridifier.APPEND_TYPES.DEFAULT_APPEND;
}

Gridifier.Settings.prototype.isReversedAppend = function() {
    return this._appendType == Gridifier.APPEND_TYPES.REVERSED_APPEND;
}

Gridifier.Settings.prototype.isDefaultIntersectionStrategy = function() {
    return this._intersectionStrategy == Gridifier.INTERSECTION_STRATEGIES.DEFAULT;
}

Gridifier.Settings.prototype.isNoIntersectionsStrategy = function() {
    return this._intersectionStrategy == Gridifier.INTERSECTION_STRATEGIES.NO_INTERSECTIONS;
}

Gridifier.Settings.prototype.isVerticalGridTopAlignmentType = function() {
    return this._alignmentType == Gridifier.INTERSECTION_STRATEGY_ALIGNMENT_TYPES.FOR_VERTICAL_GRID.TOP;
}

Gridifier.Settings.prototype.isVerticalGridCenterAlignmentType = function() {
    return this._alignmentType == Gridifier.INTERSECTION_STRATEGY_ALIGNMENT_TYPES.FOR_VERTICAL_GRID.CENTER;
}

Gridifier.Settings.prototype.isVerticalGridBottomAlignmentType = function() {
    return this._alignmentType == Gridifier.INTERSECTION_STRATEGY_ALIGNMENT_TYPES.FOR_VERTICAL_GRID.BOTTOM;
}

Gridifier.Settings.prototype.isHorizontalGridLeftAlignmentType = function() {
    return this._alignmentType == Gridifier.INTERSECTION_STRATEGY_ALIGNMENT_TYPES.FOR_HORIZONTAL_GRID.LEFT;
}

Gridifier.Settings.prototype.isHorizontalGridCenterAlignmentType = function() {
    return this._alignmentType == Gridifier.INTERSECTION_STRATEGY_ALIGNMENT_TYPES.FOR_HORIZONTAL_GRID.CENTER;
}

Gridifier.Settings.prototype.isHorizontalGridRightAlignmentType = function() {
    return this._alignmentType == Gridifier.INTERSECTION_STRATEGY_ALIGNMENT_TYPES.FOR_HORIZONTAL_GRID.RIGHT;
}

Gridifier.Settings.prototype.isDisabledSortDispersion = function() {
    return this._sortDispersionMode == Gridifier.SORT_DISPERSION_MODES.DISABLED;
}

Gridifier.Settings.prototype.isCustomSortDispersion = function() {
    return this._sortDispersionMode == Gridifier.SORT_DISPERSION_MODES.CUSTOM;
}

Gridifier.Settings.prototype.isCustomAllEmptySpaceSortDispersion = function() {
    return this._sortDispersionMode == Gridifier.SORT_DISPERSION_MODES.CUSTOM_ALL_EMPTY_SPACE;
}

Gridifier.Settings.prototype.getSortDispersionValue = function() {
    return this._sortDispersionValue;
}

Gridifier.Settings.prototype.shouldDisableItemHideOnGridAttach = function() {
    return this._shouldDisableItemHideOnGridAttach;
}

Gridifier.Settings.prototype.setToggle = function(toggleFunctionName) {
    this._toggleApi.setToggleFunction(toggleFunctionName);
}

Gridifier.Settings.prototype.setFilter = function(filterFunctionName) {
    this._filterApi.setFilterFunction(filterFunctionName);
}

Gridifier.Settings.prototype.setSort = function(sortFunctionName) {
    this._sortApi.setSortFunction(sortFunctionName);
}

Gridifier.Settings.prototype.getToggle = function() {
    return this._toggleApi.getToggleFunction();
}

Gridifier.Settings.prototype.getSort = function() {
    return this._sortApi.getSortFunction();
}

Gridifier.Settings.prototype.getFilter = function() {
    return this._filterApi.getFilterFunction();
}

Gridifier.Settings.prototype.setCoordsChanger = function(coordsChangerFunctionName) {
    this._coordsChangerApi.setCoordsChangerFunction(coordsChangerFunctionName);
}

Gridifier.Settings.prototype.setSizesChanger = function(sizesChangerFunctionName) {
    this._sizesChangerApi.setSizesChangerFunction(sizesChangerFunctionName);
}

Gridifier.Settings.prototype.setDraggableItemDecorator = function(draggableItemDecoratorFunctionName) {
    this._dragifierApi.setDraggableItemDecoratorFunction(draggableItemDecoratorFunctionName);
}

Gridifier.Settings.prototype.getCoordsChanger = function() {
    return this._coordsChangerApi.getCoordsChangerFunction();
}

Gridifier.Settings.prototype.getSizesChanger = function() {
    return this._sizesChangerApi.getSizesChangerFunction();
}

Gridifier.Settings.prototype.getDraggableItemDecorator = function() {
    return this._dragifierApi.getDraggableItemDecoratorFunction();
}

Gridifier.Settings.prototype.isByClassGridItemMarkingStrategy = function() {
    return this._gridItemMarkingStrategyType == Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_CLASS;
}

Gridifier.Settings.prototype.isByDataAttrGridItemMarkingStrategy = function() {
    return this._gridItemMarkingStrategyType == Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_DATA_ATTR;
}

Gridifier.Settings.prototype.isByQueryGridItemMarkingStrategy = function() {
    return this._gridItemMarkingStrategyType == Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_QUERY;
}

Gridifier.Settings.prototype.getGridItemMarkingType = function() {
    return this._gridItemMarkingValue;
}

Gridifier.Settings.prototype.getGridItemMarkingValue = function() {
    return this._gridItemMarkingValue;
}

Gridifier.Settings.prototype.isIntersectionDragifierMode = function() {
    return this._dragifierMode == Gridifier.DRAGIFIER_MODES.INTERSECTION;
}

Gridifier.Settings.prototype.isDiscretizationDragifierMode = function() {
    return this._dragifierMode == Gridifier.DRAGIFIER_MODES.DISCRETIZATION;
}

Gridifier.Settings.prototype.shouldEnableDragifierOnInit = function() {
    return this._shouldEnableDragifierOnInit;
}

Gridifier.Settings.prototype.getDragifierItemSelector = function() {
    return this._dragifierItemSelector;
}

Gridifier.Settings.prototype.setAlignmentType = function(newAlignmentType) {
    this._coreSettingsParser.ensureIsValidAlignmentType(newAlignmentType);
    this._alignmentType = newAlignmentType;
}

Gridifier.SizesTransformer.EmptySpaceNormalizer = function(connections, connectors, settings) {
    var me = this;

    this._connections = null;
    this._connectors = null;
    this._settings = null;

    this._css = {
    };

    this._construct = function() {
        me._connections = connections;
        me._connectors = connectors;
        me._settings = settings;
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

// Maybe this class will be required to normalize free space after prepended item transforms
// in the end of the transormation queue.
Gridifier.SizesTransformer.EmptySpaceNormalizer.prototype.normalizeFreeSpace = function() {
    if(this._settings.isVerticalGrid())
        this._applyNoIntersectionsStrategyTopFreeSpaceFixOnPrependedItemTransform();
    else if(this._settings.isHorizontalGrid())
        this._applyNoIntersectionsStrategyLeftFreeSpaceFixOnPrependedItemTransform();
}

Gridifier.SizesTransformer.EmptySpaceNormalizer.prototype._applyNoIntersectionsStrategyTopFreeSpaceFixOnPrependedItemTransform = function() {
    var connections = this._connections.get();

    for(var i = 0; i < connections.length; i++) {
        if(connections[i].y1 == 0)
            return;
    }

    var minY1 = null;
    for(var i = 0; i < connections.length; i++) {
        if(minY1 == null)
            minY1 = connections[i].y1;
        else {
            if(connections[i].y1 < minY1)
                minY1 = connections[i].y1;
        }
    }

    var verticalDecrease = minY1;
    for(var i = 0; i < connections.length; i++) {
        connections[i].y1 -= verticalDecrease;
        connections[i].y2 -= verticalDecrease;
    }
}

Gridifier.SizesTransformer.EmptySpaceNormalizer.prototype._applyNoIntersectionsStrategyLeftFreeSpaceFixOnPrependedItemTransform = function() {
    ;
}

Gridifier.SizesTransformer.ItemNewPxSizesFinder = function(gridifier,
                                                           collector,
                                                           connections,
                                                           sizesResolverManager) {
    var me = this;

    me._gridifier = null;
    me._collector = null;
    me._connections = null;
    me._sizesResolverManager = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._collector = collector;
        me._connections = connections;
        me._sizesResolverManager = sizesResolverManager;
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

Gridifier.SizesTransformer.ItemNewPxSizesFinder.prototype.calculateNewPxSizesPerAllTransformedItems = function(transformationData) {
    for(var i = 0; i < transformationData.length; i++) {
        var pxSizes = this._calculateNewPxSizesPerConnectionItem(
            transformationData[i].connectionToTransform.item,
            transformationData[i].widthToTransform,
            transformationData[i].heightToTransform,
            transformationData[i].usePaddingBottomInsteadHeight
        );
        transformationData[i].pxWidthToTransform = pxSizes.width;
        transformationData[i].pxHeightToTransform = pxSizes.height;
    }

    return transformationData;
}

Gridifier.SizesTransformer.ItemNewPxSizesFinder.prototype._calculateNewPxSizesPerConnectionItem = function(transformedItem,
                                                                                                           widthToTransform,
                                                                                                           heightToTransform,
                                                                                                           usePaddingBottomInsteadHeight) {
    var transformedItemClone = transformedItem.cloneNode();
    this._collector.markItemAsRestrictedToCollect(transformedItemClone);
    this._sizesResolverManager.unmarkAsCached(transformedItemClone);

    Dom.css.set(transformedItemClone, {
        position: "absolute",
        top: "0px",
        left: "-90000px",
        visibility: "hidden",
        width: widthToTransform,
        height: (usePaddingBottomInsteadHeight) ? 0 : heightToTransform
    });

    if(usePaddingBottomInsteadHeight)
        transformedItemClone.style.paddingBottom = heightToTransform;

    this._gridifier.getGrid().appendChild(transformedItemClone);
    var pxSizes = {
        width: this._sizesResolverManager.outerWidth(transformedItemClone, true),
        height: this._sizesResolverManager.outerHeight(transformedItemClone, true)
    };
    this._gridifier.getGrid().removeChild(transformedItemClone);

    return pxSizes;
}

Gridifier.SizesTransformer.ItemNewRawSizesFinder = function(sizesResolverManager) {
    var me = this;

    this._sizesResolverManager = null;

    this._css = {
    };

    this._construct = function() {
        me._sizesResolverManager = sizesResolverManager;
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

Gridifier.SizesTransformer.ItemNewRawSizesFinder.TOGGLE_SIZES_TOGGLED_ITEM_SIZES_DATA_ATTR = "data-toggle-sizes-item-sizes-are-toggled";
Gridifier.SizesTransformer.ItemNewRawSizesFinder.TOGGLE_SIZES_ORIGINAL_WIDTH_DATA_ATTR = "data-toggle-sizes-original-width";
Gridifier.SizesTransformer.ItemNewRawSizesFinder.TOGGLE_SIZES_ORIGINAL_HEIGHT_DATA_ATTR = "data-toggle-sizes-original-height";
Gridifier.SizesTransformer.ItemNewRawSizesFinder.EMPTY_DATA_ATTR_VALUE = "gridifier-data";

Gridifier.SizesTransformer.ItemNewRawSizesFinder.prototype.initConnectionTransform = function(connection, 
                                                                                              newWidth, 
                                                                                              newHeight,
                                                                                              usePaddingBottomInsteadHeight) {
    var targetSizes = {};

    var targetSizeTypes = {width: 0, height: 1, paddingBottom: 2};
    var me = this;

    var getTargetSize = function(newSize, targetSizeType) {
        var targetValueWithMultiplicationExpressionRegexp = new RegExp(/^\*(\d*\.?\d*)$/);
        var targetValueWithDivisionExpressionRegexp = new RegExp(/^\/(\d*\.?\d*)$/);
        var targetValueWithPostfixRegexp = new RegExp(/(^\d*\.?\d*)(px|%)$/);
        var targetValueRegexp = new RegExp(/^\d*\.?\d*$/);
        
        if(typeof newSize != "undefined" && typeof newSize != "boolean" && typeof newSize != null) {
            if(targetValueWithMultiplicationExpressionRegexp.test(newSize)) {
                var itemRawSize = me._getItemRawSize(connection.item, targetSizeType, targetSizeTypes);
                var itemSizeParts = targetValueWithPostfixRegexp.exec(itemRawSize);
                var multipleBy = targetValueWithMultiplicationExpressionRegexp.exec(newSize)[1];

                return (itemSizeParts[1] * multipleBy) + itemSizeParts[2];
            }

            if(targetValueWithDivisionExpressionRegexp.test(newSize)) {
                var itemRawSize = me._getItemRawSize(connection.item, targetSizeType, targetSizeTypes);
                var itemSizeParts = targetValueWithPostfixRegexp.exec(itemRawSize);
                var divideBy = targetValueWithDivisionExpressionRegexp.exec(newSize)[1];

                return (itemSizeParts[1] / divideBy) + itemSizeParts[2];
            }

            if(targetValueWithPostfixRegexp.test(newSize))
                return newSize;

            if(targetValueRegexp.test(newSize))
                return newSize + "px";

            new Gridifier.Error(
                Gridifier.Error.ERROR_TYPES.SIZES_TRANSFORMER.WRONG_TARGET_TRANSFORMATION_SIZES,
                newSize
            );
        }
        
        return me._getItemRawSize(connection.item, targetSizeType, targetSizeTypes);
    }

    targetSizes.targetWidth = getTargetSize(newWidth, targetSizeTypes.width);
    if(!usePaddingBottomInsteadHeight)
        targetSizes.targetHeight = getTargetSize(newHeight, targetSizeTypes.height);
    else
        targetSizes.targetHeight = getTargetSize(newHeight, targetSizeTypes.paddingBottom);

    return targetSizes;
}

Gridifier.SizesTransformer.ItemNewRawSizesFinder.prototype._getItemRawSize = function(item, sizeType, sizeTypes) {
    var itemComputedCSS = SizesResolver.getComputedCSSWithMaybePercentageSizes(item);

    if(sizeType == sizeTypes.width) {
        if(SizesResolver.hasPercentageCSSValue("width", item, itemComputedCSS))
            return SizesResolver.getPercentageCSSValue("width", item, itemComputedCSS);
        else 
            return this._sizesResolverManager.outerWidth(item) + "px";
    }
    else if(sizeType == sizeTypes.height) {
        if(SizesResolver.hasPercentageCSSValue("height", item, itemComputedCSS))
            return SizesResolver.getPercentageCSSValue("height", item, itemComputedCSS);
        else
            return this._sizesResolverManager.outerHeight(item) + "px";
    }
    else if(sizeType == sizeTypes.paddingBottom) {
        if(SizesResolver.hasPercentageCSSValue("paddingBottom", item, itemComputedCSS))
            return SizesResolver.getPercentageCSSValue("paddingBottom", item, itemComputedCSS);
        else 
            return itemComputedCSS.paddingBottom;
    }
}

Gridifier.SizesTransformer.ItemNewRawSizesFinder.prototype.areConnectionSizesToggled = function(connection) {
    var itemNewRawSizesFinder = Gridifier.SizesTransformer.ItemNewRawSizesFinder;

    if(Dom.hasAttribute(connection.item, itemNewRawSizesFinder.TOGGLE_SIZES_TOGGLED_ITEM_SIZES_DATA_ATTR))
        return true;

    return false;
}

Gridifier.SizesTransformer.ItemNewRawSizesFinder.prototype.getConnectionSizesPerUntoggle = function(connection) {
    var itemNewRawSizesFinder = Gridifier.SizesTransformer.ItemNewRawSizesFinder;
    var originalSizes = {};

    originalSizes.targetWidth = connection.item.getAttribute(itemNewRawSizesFinder.TOGGLE_SIZES_ORIGINAL_WIDTH_DATA_ATTR);
    originalSizes.targetHeight = connection.item.getAttribute(itemNewRawSizesFinder.TOGGLE_SIZES_ORIGINAL_HEIGHT_DATA_ATTR);

    return originalSizes;
}

Gridifier.SizesTransformer.ItemNewRawSizesFinder.prototype.markConnectionPerToggle = function(connection,
                                                                                              usePaddingBottomInsteadHeight) {
    var itemNewRawSizesFinder = Gridifier.SizesTransformer.ItemNewRawSizesFinder;
    connection.item.setAttribute(
        itemNewRawSizesFinder.TOGGLE_SIZES_TOGGLED_ITEM_SIZES_DATA_ATTR,
        itemNewRawSizesFinder.EMPTY_DATA_ATTR_VALUE
    );

    var targetSizeTypes = {width: 0, height: 1, paddingBottom: 2};
    var originalItemWidth = this._getItemRawSize(connection.item, targetSizeTypes.width, targetSizeTypes);
    if(!usePaddingBottomInsteadHeight)
        var originalItemHeight = this._getItemRawSize(connection.item, targetSizeTypes.height, targetSizeTypes);
    else
        var originalItemHeight = this._getItemRawSize(connection.item, targetSizeTypes.paddingBottom, targetSizeTypes);

    connection.item.setAttribute(
        itemNewRawSizesFinder.TOGGLE_SIZES_ORIGINAL_WIDTH_DATA_ATTR,
        originalItemWidth
    );
    connection.item.setAttribute(
        itemNewRawSizesFinder.TOGGLE_SIZES_ORIGINAL_HEIGHT_DATA_ATTR,
        originalItemHeight
    );
}

Gridifier.SizesTransformer.ItemNewRawSizesFinder.prototype.unmarkConnectionPerToggle = function(connection) {
    var itemNewSizesFinder = Gridifier.SizesTransformer.ItemNewRawSizesFinder;
    connection.item.removeAttribute(itemNewSizesFinder.TOGGLE_SIZES_TOGGLED_ITEM_SIZES_DATA_ATTR);
    connection.item.removeAttribute(itemNewSizesFinder.TOGGLE_SIZES_ORIGINAL_WIDTH_DATA_ATTR);
    connection.item.removeAttribute(itemNewSizesFinder.TOGGLE_SIZES_ORIGINAL_HEIGHT_DATA_ATTR);
}

Gridifier.SizesTransformer.ItemsReappender = function(gridifier,
                                                      appender,
                                                      reversedAppender,
                                                      connections,
                                                      connectors,
                                                      connectorsCleaner,
                                                      connectorsSelector,
                                                      transformerConnectors,
                                                      settings, 
                                                      guid,
                                                      transformedItemMarker,
                                                      emptySpaceNormalizer,
                                                      sizesResolverManager,
                                                      eventEmitter) {
    var me = this;

    this._gridifier = null;
    this._appender = null;
    this._reversedAppender = null;
    this._connections = null;
    this._connectors = null;
    this._connectorsCleaner = null;
    this._connectorsSelector = null;
    this._transformerConnectors = null;
    this._settings = null;
    this._guid = null;
    this._transformedItemMarker = null;
    this._emptySpaceNormalizer = null;
    this._sizesResolverManager = null;
    this._eventEmitter = null;

    this._reappendQueue = null;
    this._reappendNextQueuedItemsBatchTimeout = null;
    this._reappendedQueueData = null;
    this._reappendStartViewportWidth = null;
    this._reappendStartViewportHeight = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._appender = appender;
        me._reversedAppender = reversedAppender;
        me._connections = connections;
        me._connectors = connectors;
        me._connectorsCleaner = connectorsCleaner;
        me._connectorsSelector = connectorsSelector;
        me._transformerConnectors = transformerConnectors;
        me._settings = settings;
        me._guid = guid;
        me._transformedItemMarker = transformedItemMarker;
        me._emptySpaceNormalizer = emptySpaceNormalizer;
        me._sizesResolverManager = sizesResolverManager;
        me._eventEmitter = eventEmitter;
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

Gridifier.SizesTransformer.ItemsReappender.prototype.isReversedAppendShouldBeUsedPerItemInsert = function(item) {
    if(this._settings.isDefaultAppend())
        return false;
    else if(this._settings.isReversedAppend())
        return true;
}

Gridifier.SizesTransformer.ItemsReappender.prototype.createReappendQueue = function(itemsToReappend,
                                                                                    connectionsToReappend) {
    this._reappendQueue = [];
    this._reappendedQueueData = [];

    for(var i = 0; i < connectionsToReappend.length; i++) {
        this._reappendQueue.push({
            'itemToReappend': itemsToReappend[i],
            'connectionToReappend': connectionsToReappend[i]
        });
    }
}

Gridifier.SizesTransformer.ItemsReappender.prototype.isReappendQueueEmpty = function() {
    return (this._reappendNextQueuedItemsBatchTimeout == null) ? true : false;
} 

Gridifier.SizesTransformer.ItemsReappender.prototype.stopReappendingQueuedItems = function() {
    clearTimeout(this._reappendNextQueuedItemsBatchTimeout);
    this._reappendNextQueuedItemsBatchTimeout = null;

    return {
        reappendQueue: this._reappendQueue,
        reappendedQueueData: this._reappendedQueueData
    };
}

Gridifier.SizesTransformer.ItemsReappender.prototype.getQueuedConnectionsPerTransform = function() {
    var queuedConnections = [];
    for(var i = 0; i < this._reappendQueue.length; i++) {
        queuedConnections.push(this._reappendQueue[i].connectionToReappend);
    }

    return queuedConnections;
}

Gridifier.SizesTransformer.ItemsReappender.prototype.startReappendingQueuedItems = function() {
    this._reappendStartViewportWidth = this._sizesResolverManager.viewportWidth();
    this._reappendStartViewportHeight = this._sizesResolverManager.viewportHeight();

    this._reappendNextQueuedItemsBatch();
}

Gridifier.SizesTransformer.ItemsReappender.prototype._reappendNextQueuedItemsBatch = function() {
    var batchSize = this._settings.getRetransformQueueBatchSize();
    if(batchSize > this._reappendQueue.length)
        batchSize = this._reappendQueue.length;

    if(this._settings.isVerticalGrid()) {
        if(this._sizesResolverManager.viewportWidth() != this._reappendStartViewportWidth)
            return;
    }
    else if(this._settings.isHorizontalGrid()) {
        if(this._sizesResolverManager.viewportHeight() != this._reappendStartViewportHeight)
            return;
    }

    this._sizesResolverManager.startCachingTransaction();
    var reappendedItemGUIDS = [];

    for(var i = 0; i < batchSize; i++) {
        var nextItemToReappend = this._reappendQueue[i].itemToReappend;

        if(this.isReversedAppendShouldBeUsedPerItemInsert(nextItemToReappend))
            var reappendType = Gridifier.APPEND_TYPES.REVERSED_APPEND;
        else
            var reappendType = Gridifier.APPEND_TYPES.DEFAULT_APPEND;

        this._reappendItem(reappendType, nextItemToReappend);

        if(this._settings.isVerticalGrid())
            this._connectorsCleaner.deleteAllIntersectedFromBottomConnectors();
        else if(this._settings.isHorizontalGrid())
            this._connectorsCleaner.deleteAllIntersectedFromRightConnectors();

        reappendedItemGUIDS.push(this._guid.getItemGUID(nextItemToReappend));
    }

    this._sizesResolverManager.stopCachingTransaction();
    var reappendedConnections = this._connections.getConnectionsByItemGUIDS(reappendedItemGUIDS);
    this._gridifier.getRenderer().renderTransformedConnections(reappendedConnections);

    this._reappendedQueueData = this._reappendedQueueData.concat(this._reappendQueue.splice(0, batchSize));
    if(this._reappendQueue.length == 0) {
        //if(this._settings.isNoIntersectionsStrategy()) {
        //    this._emptySpaceNormalizer.normalizeFreeSpace();
        //}
        this._eventEmitter.emitItemsReappendExecutionEndPerDragifier();
        this._eventEmitter.emitGridRetransformEvent();
        this._reappendNextQueuedItemsBatchTimeout = null;
        return;
    }

    var me = this;
    var batchTimeout = this._settings.getRetransformQueueBatchTimeout();

    this._reappendNextQueuedItemsBatchTimeout = setTimeout(function() {
        me._reappendNextQueuedItemsBatch.call(me);
    }, batchTimeout);
}

Gridifier.SizesTransformer.ItemsReappender.prototype._reappendItem = function(reappendType,
                                                                              itemToReappend) {
    if(reappendType == Gridifier.APPEND_TYPES.REVERSED_APPEND) {
        this._reversedAppender.reversedAppend(itemToReappend);
    }
    else if(reappendType == Gridifier.APPEND_TYPES.DEFAULT_APPEND) {
        this._appender.append(itemToReappend);
    }
}

Gridifier.SizesTransformer.ItemsToReappendFinder = function(connections,
                                                            connectionsSorter,
                                                            settings) {
    var me = this;

    me._connections = null;
    me._connectionsSorter = null;
    me._settings = null;

    this._css = {
    };

    this._construct = function() {
        me._connections = connections;
        me._connectionsSorter = connectionsSorter;
        me._settings = settings;
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

Gridifier.SizesTransformer.ItemsToReappendFinder.prototype.findAllOnSizesTransform = function(connectionsToReappend,
                                                                                              firstTransformedConnection) {
    var connections = this._connections.get();

    for(var i = 0; i < connections.length; i++) {
        if(connections[i][Gridifier.SizesTransformer.RESTRICT_CONNECTION_COLLECT])
            continue;

        // Default or no intersections strategy check is required here, because we are
        // reappending items from random position. In such case we should reappend all
        // row items in NIS mode.
        if(this._settings.isDisabledSortDispersion() && this._settings.isDefaultIntersectionStrategy()) {
            if(connections[i].itemGUID >= firstTransformedConnection.itemGUID) {
                connectionsToReappend.push(connections[i]);
                connections.splice(i, 1);
                i--;
            }
        }
        // When noIntersection strategy is use, we should reappend all row items.(Height of 
        // transformed item may become smaller).
        // When customSortDispersion is used, element with bigger guid can be above.(Depending 
        // on the dispersion param).
        else if(this._settings.isCustomSortDispersion() || this._settings.isCustomAllEmptySpaceSortDispersion() ||
                this._settings.isNoIntersectionsStrategy()) {
            if(this._settings.isVerticalGrid()) {
                var condition = connections[i].y2 >= firstTransformedConnection.y1;
            }
            else if(this._settings.isHorizontalGrid()) {
                var condition = connections[i].x2 >= firstTransformedConnection.x1;
            }

            if(condition) {
                connectionsToReappend.push(connections[i]);
                connections.splice(i, 1);
                i--;
            }
        }
    }

    if(this._settings.isCustomSortDispersion() || this._settings.isCustomAllEmptySpaceSortDispersion() ||
        this._settings.isNoIntersectionsStrategy()) {
        this._addAllIntersectedConnectionsBy(connectionsToReappend);
    }

    var sortedConnectionsToReappend = this._connectionsSorter.sortConnectionsPerReappend(
        connectionsToReappend
    );

    var itemsToReappend = [];
    for(var i = 0; i < sortedConnectionsToReappend.length; i++) {
        itemsToReappend.push(sortedConnectionsToReappend[i].item);
    }

    return {
        itemsToReappend: itemsToReappend,
        connectionsToReappend: connectionsToReappend,
        firstConnectionToReappend: sortedConnectionsToReappend[0]
    };
}

/*
  Any of connectionsToReappend can be recollected in such way, that after recollection it will produce a gap in
  such way, that selected reappend algorithm will not create connector in that item position. So, we should
  reappend also all connections, that are intersected by connectionsToReappend.
  (In all next level on collisions every connection will have some connection around, at which required connector
   will be created and shifted. If somehow this 'gap' will appear on some layout, user can call 'triggerResize'
   to ensure, that all transformed items will be correctly reappended).
 */
Gridifier.SizesTransformer.ItemsToReappendFinder.prototype._addAllIntersectedConnectionsBy = function(connectionsToReappend) {
    var connections = this._connections.get();

    for(var i = 0; i < connections.length; i++) {
        var isIntersectingCurrentConnection = false;

        for(var j = 0; j < connectionsToReappend.length; j++) {
            if(this._settings.isVerticalGrid())
                var intersectionCond = connectionsToReappend[j].y1 <= connections[i].y2;
            else if(this._settings.isHorizontalGrid())
                var intersectionCond = connectionsToReappend[j].x1 <= connections[i].x2;

            if(intersectionCond) {
                connectionsToReappend.push(connections[i]);
                isIntersectingCurrentConnection = true;
                break;
            }
        }

        if(isIntersectingCurrentConnection) {
            connections.splice(i, 1);
            i--;
        }
    }
}

Gridifier.SizesTransformer.Core = function(gridifier,
                                           settings,
                                           collector,
                                           connectors,
                                           connections,
                                           connectionsSorter,
                                           guid,
                                           appender,
                                           reversedAppender,
                                           normalizer,
                                           operation,
                                           sizesResolverManager,
                                           eventEmitter) {
    var me = this;

    this._gridifier = null;
    this._settings = null;
    this._collector = null;
    this._connectors = null;
    this._connections = null;
    this._connectionsSorter = null;
    this._guid = null;
    this._appender = null;
    this._reversedAppender = null;
    this._normalizer = null;
    this._operation = null;
    this._sizesResolverManager = null;
    this._eventEmitter = null;

    this._connectorsCleaner = null;
    this._connectorsSelector = null;
    this._transformerConnectors = null;

    this._transformedConnectionsSorter = null;
    this._itemNewPxSizesFinder = null;
    this._transformedItemMarker = null;
    this._itemsToReappendFinder = null;
    this._itemsReappender = null;
    this._emptySpaceNormalizer = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._settings = settings;
        me._collector = collector;
        me._connectors = connectors;
        me._connections = connections;
        me._connectionsSorter = connectionsSorter;
        me._guid = guid;
        me._appender = appender;
        me._reversedAppender = reversedAppender;
        me._normalizer = normalizer;
        me._operation = operation;
        me._sizesResolverManager = sizesResolverManager;
        me._eventEmitter = eventEmitter;

        if(me._settings.isVerticalGrid()) {
            me._connectorsCleaner = new Gridifier.VerticalGrid.ConnectorsCleaner(
                me._connectors, me._connections, me._settings
            );
        }
        else if(me._settings.isHorizontalGrid()) {
            me._connectorsCleaner = new Gridifier.HorizontalGrid.ConnectorsCleaner(
                me._connectors, me._connections, me._settings
            );
        }

        me._connectorsSelector = new Gridifier.VerticalGrid.ConnectorsSelector(me._guid);

        me._transformedConnectionsSorter = new Gridifier.SizesTransformer.TransformedConnectionsSorter(
            me._connectionsSorter
        );
        me._itemNewPxSizesFinder = new Gridifier.SizesTransformer.ItemNewPxSizesFinder(
            me._gridifier, me._collector, me._connections, me._sizesResolverManager
        );
        me._transformedItemMarker = new Gridifier.SizesTransformer.TransformedItemMarker();
        me._itemsToReappendFinder = new Gridifier.SizesTransformer.ItemsToReappendFinder(
            me._connections, me._connectionsSorter, me._settings
        );

        me._transformerConnectors = new Gridifier.TransformerConnectors(
            me._gridifier,
            me._settings,
            me._connectors,
            me._connections,
            me._guid,
            me._appender,
            me._reversedAppender,
            me._normalizer,
            me,
            me._connectorsCleaner,
            me._transformedItemMarker,
            me._operation
        );

        me._emptySpaceNormalizer = new Gridifier.SizesTransformer.EmptySpaceNormalizer(
            me._connections, me._connectors, me._settings
        );

        me._itemsReappender = new Gridifier.SizesTransformer.ItemsReappender(
            me._gridifier,
            me._appender,
            me._reversedAppender,
            me._connections, 
            me._connectors, 
            me._connectorsCleaner, 
            me._connectorsSelector,
            me._transformerConnectors,
            me._settings, 
            me._guid,
            me._transformedItemMarker,
            me._emptySpaceNormalizer,
            me._sizesResolverManager,
            me._eventEmitter
        );
        me._transformerConnectors.setItemsReappenderInstance(me._itemsReappender);
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

Gridifier.SizesTransformer.RESTRICT_CONNECTION_COLLECT = "restrictConnectionCollect";

Gridifier.SizesTransformer.Core.prototype.isTransformerQueueEmpty = function() {
    return this._itemsReappender.isReappendQueueEmpty();
}

Gridifier.SizesTransformer.Core.prototype.getQueuedConnectionsPerTransform = function() {
    return this._itemsReappender.getQueuedConnectionsPerTransform();
}

Gridifier.SizesTransformer.Core.prototype.transformConnectionSizes = function(transformationData) {
    transformationData = this._transformedConnectionsSorter.sortTransformedConnections(
        transformationData
    );
    transformationData = this._itemNewPxSizesFinder.calculateNewPxSizesPerAllTransformedItems(
        transformationData
    );

    // Timeout is required here because of DOM-tree changes inside transformed item clones creation.
    // (Optimizing getComputedStyle after reflow performance)
    var applyTransform = function() {
        this._guid.unmarkAllPrependedItems();
        this._transformedItemMarker.markEachConnectionItemWithTransformData(transformationData);

        var connectionsToReappend = [];
        if(!this._itemsReappender.isReappendQueueEmpty()) {
            var currentQueueState = this._itemsReappender.stopReappendingQueuedItems();

            for(var i = 0; i < currentQueueState.reappendQueue.length; i++) {
                var queuedConnection = currentQueueState.reappendQueue[i].connectionToReappend;
                if(queuedConnection[Gridifier.SizesTransformer.RESTRICT_CONNECTION_COLLECT])
                    continue;

                connectionsToReappend.push(queuedConnection);
            }
        }

        var itemsToReappendData = this._itemsToReappendFinder.findAllOnSizesTransform(
            connectionsToReappend, transformationData[0].connectionToTransform
        );

        var itemsToReappend = itemsToReappendData.itemsToReappend;
        var connectionsToReappend = itemsToReappendData.connectionsToReappend;
        var firstConnectionToReappend = itemsToReappendData.firstConnectionToReappend;
        
        this._transformedItemMarker.markAllTransformDependedItems(itemsToReappend);
        this._transformerConnectors.recreateConnectorsPerFirstItemReappendOnTransform(
            itemsToReappend[0], firstConnectionToReappend
        );

        this._itemsReappender.createReappendQueue(itemsToReappend, connectionsToReappend);
        this._itemsReappender.startReappendingQueuedItems();
    }

    var me = this;
    setTimeout(function() { applyTransform.call(me); }, 0);
}

Gridifier.SizesTransformer.Core.prototype.stopRetransformAllConnectionsQueue = function() {
    var connections = this._connections.get();

    if(!this._itemsReappender.isReappendQueueEmpty()) {
        var currentQueueState = this._itemsReappender.stopReappendingQueuedItems();

        var reappendedConnections = [];
        for(var i = 0; i < currentQueueState.reappendedQueueData.length; i++)
            reappendedConnections.push(currentQueueState.reappendedQueueData[i].connectionToReappend);
        // Sync is required here, because item sorting in CSDAES mode depends on item positions.
        // And if we made resize, first batch was reappended, and than made second resize,
        // we should grab all items according to start positions to not keep item sorting in sync.
        // (That happens because here on second resize we are resizing ALL items again from scratch.
        //   In transform sizes this is redundant, because we are starting AFTER reppended items(if there
        //   are some items in queue), or from first transformed connection)
        this._connections.syncConnectionParams(reappendedConnections);

        for(var i = 0; i < currentQueueState.reappendQueue.length; i++)
            connections.push(currentQueueState.reappendQueue[i].connectionToReappend);
    }
}

Gridifier.SizesTransformer.Core.prototype.retransformAllConnections = function() {
    this.stopRetransformAllConnectionsQueue();

    var me = this;
    var connections = this._connections.get();
    
    if(connections.length == 0)
        return;

    var applyRetransform = function() {
        connections = this._connectionsSorter.sortConnectionsPerReappend(connections);
        this._guid.unmarkAllPrependedItems();

        var itemsToReappend = [];
        var connectionsToKeep = [];
        var connectionsToReappend = [];
        for(var i = 0; i < connections.length; i++) {
            if(!connections[i][Gridifier.SizesTransformer.RESTRICT_CONNECTION_COLLECT]) {
                itemsToReappend.push(connections[i].item);
                connectionsToReappend.push(connections[i]);
            }
            else {
                connectionsToKeep.push(connections[i]);
            }
        }

        var firstConnectionToReappend = null;
        if(connectionsToKeep.length == 0) {
            firstConnectionToReappend = connections[0];
            connections.splice(0, connections.length);
        }
        else {
            for(var i = 0; i < connections.length; i++) {
                var shouldRetransformConnection = true;

                for(var j = 0; j < connectionsToKeep.length; j++) {
                    if(connectionsToKeep[j].itemGUID == connections[i].itemGUID) {
                        shouldRetransformConnection = false;
                        break;
                    }
                }

                if(shouldRetransformConnection) {
                    firstConnectionToReappend = connections[i];
                    break;
                }
            }

            connections.splice(0, connections.length);
            for(var i = 0; i < connectionsToKeep.length; i++)
                connections.push(connectionsToKeep[i]);
        }

        this._transformedItemMarker.markAllTransformDependedItems(itemsToReappend);
        this._transformerConnectors.recreateConnectorsPerFirstItemReappendOnTransform(
            firstConnectionToReappend.item, firstConnectionToReappend
        );

        this._itemsReappender.createReappendQueue(itemsToReappend, connectionsToReappend);
        this._itemsReappender.startReappendingQueuedItems();
    }

    var wereItemSizesSyncs = this._syncAllScheduledToTransformItemSizes(connections);
    if(!wereItemSizesSyncs) {
        applyRetransform.call(this);
    }
    // Timeout is required here because of DOM-tree changes inside transformed item clones creation.
    // (Optimizing getComputedStyle after reflow performance)
    else {
        var me = this;
        setTimeout(function() { applyRetransform.call(me); }, 0);
    }
}

// Sync is required, because scheduled connection to transform may has changed % sizes after resizes.
Gridifier.SizesTransformer.Core.prototype._syncAllScheduledToTransformItemSizes = function(connections) {
    var transformationData = [];
    for(var i = 0; i < connections.length; i++) {
        if(this._transformedItemMarker.isTransformedItem(connections[i].item)) {
            var rawSizes = this._transformedItemMarker.getTransformedItemTargetRawSizes(
                connections[i].item
            );
            transformationData.push({
                connectionToTransform: connections[i],
                widthToTransform: rawSizes.targetRawWidth,
                heightToTransform: rawSizes.targetRawHeight
            });
        }
    }

    if(transformationData.length == 0)
        return false;

    transformationData = this._itemNewPxSizesFinder.calculateNewPxSizesPerAllTransformedItems(
        transformationData
    );
    this._transformedItemMarker.markEachConnectionItemWithTransformData(transformationData);

    return true;
}

// This method has no async actions before starting the queue.
// (Used in insertBefore, insertAfter methods. In that methods we should launch reappend
//  queue immediatly, because in CSD mode we can't insertBefore or after next item BEFORE
//  current items positions are recalculated.(Order depends on position)
Gridifier.SizesTransformer.Core.prototype.retransformFrom = function(firstConnectionToRetransform) {
    var connectionsToReappend = [];
    if(!this._itemsReappender.isReappendQueueEmpty()) {
        var currentQueueState = this._itemsReappender.stopReappendingQueuedItems();

        for(var i = 0; i < currentQueueState.reappendQueue.length; i++) {
            var queuedConnection = currentQueueState.reappendQueue[i].connectionToReappend;
            if(queuedConnection[Gridifier.SizesTransformer.RESTRICT_CONNECTION_COLLECT])
                continue;

            connectionsToReappend.push(queuedConnection);
        }
    }

    this._guid.unmarkAllPrependedItems();
    var itemsToReappendData = this._itemsToReappendFinder.findAllOnSizesTransform(
        connectionsToReappend, firstConnectionToRetransform
    );

    var itemsToReappend = itemsToReappendData.itemsToReappend;
    var connectionsToReappend = itemsToReappendData.connectionsToReappend;
    var firstConnectionToReappend = itemsToReappendData.firstConnectionToReappend;
    
    this._transformedItemMarker.markAllTransformDependedItems(itemsToReappend);
    this._transformerConnectors.recreateConnectorsPerFirstItemReappendOnTransform(
        itemsToReappend[0], firstConnectionToReappend
    );

    this._itemsReappender.createReappendQueue(itemsToReappend, connectionsToReappend);
    this._itemsReappender.startReappendingQueuedItems();
}

// SetTimeout is not required here, because this method is used in responsiveClassesChangers.
// (Changes are made through media queries & CSS styles).
// Usage of this method after grid DOM-modifications can cause serious performance loses in Chrome
// on getComputedStyle calls in mobile devices.
Gridifier.SizesTransformer.Core.prototype.retransformFromFirstSortedConnection = function(itemsToRetransform) {
    var connectionsToReappend = [];
    if(!this._itemsReappender.isReappendQueueEmpty()) {
        var currentQueueState = this._itemsReappender.stopReappendingQueuedItems();

        for(var i = 0; i < currentQueueState.reappendQueue.length; i++) {
            var queuedConnection = currentQueueState.reappendQueue[i].connectionToReappend;
            if(queuedConnection[Gridifier.SizesTransformer.RESTRICT_CONNECTION_COLLECT])
                continue;

            connectionsToReappend.push(queuedConnection);
        }
    }

    var connections = this._connections.get();
    var itemsToRetransformConnections = [];

    for(var i = 0; i < itemsToRetransform.length; i++) {
        for(var j = 0; j < connections.length; j++) {
            if(this._guid.getItemGUID(connections[j].item) == this._guid.getItemGUID(itemsToRetransform[i])) {
                itemsToRetransformConnections.push(connections[j]);
                continue;
            }
        }

        for(var j = 0; j < connectionsToReappend.length; j++) {
            if(this._guid.getItemGUID(connectionsToReappend[j].item) == this._guid.getItemGUID(itemsToRetransform[i])) {
                itemsToRetransformConnections.push(connectionsToReappend[j]);
                continue;
            }
        }
    }

    var sortedItemsToRetransformConnections = this._connectionsSorter.sortConnectionsPerReappend(
        itemsToRetransformConnections
    );
    var firstConnectionToRetransform = sortedItemsToRetransformConnections[0];

    this._guid.unmarkAllPrependedItems();
    var itemsToReappendData = this._itemsToReappendFinder.findAllOnSizesTransform(
        connectionsToReappend, firstConnectionToRetransform
    );

    var itemsToReappend = itemsToReappendData.itemsToReappend;
    var connectionsToReappend = itemsToReappendData.connectionsToReappend;
    var firstConnectionToReappend = itemsToReappendData.firstConnectionToReappend;

    this._transformedItemMarker.markAllTransformDependedItems(itemsToReappend);
    this._transformerConnectors.recreateConnectorsPerFirstItemReappendOnTransform(
        itemsToReappend[0], firstConnectionToReappend
    );

    this._itemsReappender.createReappendQueue(itemsToReappend, connectionsToReappend);
    this._itemsReappender.startReappendingQueuedItems();
}

Gridifier.SizesTransformer.TransformedConnectionsSorter = function(connectionsSorter) {
    var me = this;

    me._connectionsSorter = null;

    this._css = {
    };

    this._construct = function() {
        me._connectionsSorter = connectionsSorter;
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

Gridifier.SizesTransformer.TransformedConnectionsSorter.prototype.sortTransformedConnections = function(transformationData) {
    var me = this;

    var connectionsToSort = [];
    for(var i = 0; i < transformationData.length; i++)
        connectionsToSort.push(transformationData[i].connectionToTransform);
    
    var transformedConnectionSortNumber = 1;
    var sortedConnectionsToTransform = this._connectionsSorter.sortConnectionsPerReappend(
        connectionsToSort
    );
    for(var i = 0; i < sortedConnectionsToTransform.length; i++) {
        for(var j = 0; j < transformationData.length; j++) {
            if(sortedConnectionsToTransform[i].itemGUID == 
               transformationData[j].connectionToTransform.itemGUID) {
               transformationData[j].sortNumber = transformedConnectionSortNumber;
               transformedConnectionSortNumber++;
               break;
            }
        }
    }

    transformationData.sort(function(firstTransformationData, secondTransformationData) {
        if(firstTransformationData.sortNumber > secondTransformationData.sortNumber)
            return 1;

        return -1;
    });

    return transformationData;
}

Gridifier.SizesTransformer.TransformedItemMarker = function() {
    var me = this;

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

Gridifier.SizesTransformer.TransformedItemMarker.TRANSFORMED_ITEM_DATA_ATTR = "data-transformed-item";
Gridifier.SizesTransformer.TransformedItemMarker.DEPENDED_ITEM_DATA_ATTR = "data-depended-item";
Gridifier.SizesTransformer.TransformedItemMarker.TRANSFORMER_EMPTY_DATA_ATTR_VALUE = "gridifier-data";
Gridifier.SizesTransformer.TransformedItemMarker.TRANSFORMED_ITEM_RAW_TARGET_WIDTH_DATA_ATTR = "data-transformed-item-raw-target-width";
Gridifier.SizesTransformer.TransformedItemMarker.TRANSFORMED_ITEM_RAW_TARGET_HEIGHT_DATA_ATTR = "data-transformed-item-raw-target-height";
Gridifier.SizesTransformer.TransformedItemMarker.TRANSFORMED_ITEM_PX_TARGET_WIDTH_DATA_ATTR = "data-transformed-item-px-target-width";
Gridifier.SizesTransformer.TransformedItemMarker.TRANSFORMED_ITEM_PX_TARGET_HEIGHT_DATA_ATTR = "data-transformed-item-px-target-height";

Gridifier.SizesTransformer.TransformedItemMarker.prototype.markEachConnectionItemWithTransformData = function(transformationData) {
    var transformedItemMarker = Gridifier.SizesTransformer.TransformedItemMarker;

    for(var i = 0; i < transformationData.length; i++) {
        var transformedItem = transformationData[i].connectionToTransform.item;
        transformedItem.setAttribute(
            transformedItemMarker.TRANSFORMED_ITEM_DATA_ATTR,
            transformedItemMarker.TRANSFORMER_EMPTY_DATA_ATTR_VALUE
        );
        transformedItem.setAttribute(
            transformedItemMarker.TRANSFORMED_ITEM_RAW_TARGET_WIDTH_DATA_ATTR,
            transformationData[i].widthToTransform
        );
        transformedItem.setAttribute(
            transformedItemMarker.TRANSFORMED_ITEM_RAW_TARGET_HEIGHT_DATA_ATTR,
            transformationData[i].heightToTransform
        );
        transformedItem.setAttribute(
            transformedItemMarker.TRANSFORMED_ITEM_PX_TARGET_WIDTH_DATA_ATTR,
            transformationData[i].pxWidthToTransform
        );
        transformedItem.setAttribute(
            transformedItemMarker.TRANSFORMED_ITEM_PX_TARGET_HEIGHT_DATA_ATTR,
            transformationData[i].pxHeightToTransform
        );
    }
}

Gridifier.SizesTransformer.TransformedItemMarker.prototype.isTransformedItem = function(maybeTransformedItem) {
    return Dom.hasAttribute(maybeTransformedItem, Gridifier.SizesTransformer.TransformedItemMarker.TRANSFORMED_ITEM_DATA_ATTR);
}

Gridifier.SizesTransformer.TransformedItemMarker.prototype.unmarkItemAsTransformed = function(transformedItem) {
    transformedItem.removeAttribute(Gridifier.SizesTransformer.TransformedItemMarker.TRANSFORMED_ITEM_DATA_ATTR);
    transformedItem.removeAttribute(Gridifier.SizesTransformer.TransformedItemMarker.TRANSFORMED_ITEM_RAW_TARGET_WIDTH_DATA_ATTR);
    transformedItem.removeAttribute(Gridifier.SizesTransformer.TransformedItemMarker.TRANSFORMED_ITEM_RAW_TARGET_HEIGHT_DATA_ATTR);
    transformedItem.removeAttribute(Gridifier.SizesTransformer.TransformedItemMarker.TRANSFORMED_ITEM_PX_TARGET_WIDTH_DATA_ATTR);
    transformedItem.removeAttribute(Gridifier.SizesTransformer.TransformedItemMarker.TRANSFORMED_ITEM_PX_TARGET_HEIGHT_DATA_ATTR);
}

Gridifier.SizesTransformer.TransformedItemMarker.prototype.getTransformedItemTargetRawSizes = function(transformedItem) {
    var transformedItemMarker = Gridifier.SizesTransformer.TransformedItemMarker;

    return {
        targetRawWidth: transformedItem.getAttribute(transformedItemMarker.TRANSFORMED_ITEM_RAW_TARGET_WIDTH_DATA_ATTR),
        targetRawHeight: transformedItem.getAttribute(transformedItemMarker.TRANSFORMED_ITEM_RAW_TARGET_HEIGHT_DATA_ATTR)
    };
}

Gridifier.SizesTransformer.TransformedItemMarker.prototype.getTransformedItemTargetPxSizes = function(transformedItem) {
    var transformedItemMarker = Gridifier.SizesTransformer.TransformedItemMarker;

    return {
        targetPxWidth: parseFloat(transformedItem.getAttribute(transformedItemMarker.TRANSFORMED_ITEM_PX_TARGET_WIDTH_DATA_ATTR)),
        targetPxHeight: parseFloat(transformedItem.getAttribute(transformedItemMarker.TRANSFORMED_ITEM_PX_TARGET_HEIGHT_DATA_ATTR))
    };
}

Gridifier.SizesTransformer.TransformedItemMarker.prototype.markAllTransformDependedItems = function(itemsToReappend) {
    for(var i = 0; i < itemsToReappend.length; i++) {
        if(this.isTransformedItem(itemsToReappend[i]))
            continue;

        itemsToReappend[i].setAttribute(
            Gridifier.SizesTransformer.TransformedItemMarker.DEPENDED_ITEM_DATA_ATTR,
            Gridifier.SizesTransformer.TransformedItemMarker.TRANSFORMER_EMPTY_DATA_ATTR_VALUE
        );
    }
}

Gridifier.SizesTransformer.TransformedItemMarker.prototype.isDependedItem = function(maybeDependedItem) {
    return Dom.hasAttribute(maybeDependedItem, Gridifier.SizesTransformer.TransformedItemMarker.DEPENDED_ITEM_DATA_ATTR);
}

Gridifier.SizesTransformer.TransformedItemMarker.prototype.unmarkItemAsDepended = function(dependedItem) {
    dependedItem.removeAttribute(Gridifier.SizesTransformer.TransformedItemMarker.DEPENDED_ITEM_DATA_ATTR);
}

Gridifier.TransformerOperations.OptionsParser = function(collector, sizesResolverManager) {
    var me = this;

    this._collector = null;
    this._sizesResolverManager = null;

    this._css = {
    };

    this._construct = function() {
        me._collector = collector;
        me._sizesResolverManager = sizesResolverManager;
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

Gridifier.TransformerOperations.OptionsParser.prototype.parseItemsToTransform = function(maybeItem) {
    var itemsToTransform = [];

    if(Dom.isArray(maybeItem)) {
        for(var i = 0; i < maybeItem.length; i++) {
            itemsToTransform.push(maybeItem[i][0]);
        }
    }
    else {
        itemsToTransform.push(maybeItem);
    }

    itemsToTransform = this._collector.toDOMCollection(itemsToTransform);
    this._sizesResolverManager.startCachingTransaction();

    this._collector.ensureAllItemsAreAttachedToGrid(itemsToTransform);
    this._collector.ensureAllItemsCanBeAttachedToGrid(itemsToTransform);

    return itemsToTransform;
}

Gridifier.TransformerOperations.OptionsParser.prototype.parseSizesToTransform = function(maybeItem,
                                                                                         newWidth,
                                                                                         newHeight) {
    var sizesToTransform = [];

    if(Dom.isArray(maybeItem)) {
        for(var i = 0; i < maybeItem.length; i++) {
            sizesToTransform.push([maybeItem[i][1], maybeItem[i][2]]);
        }
    }
    else {
        sizesToTransform.push([newWidth, newHeight]);
    }

    return sizesToTransform;
}

Gridifier.TransformerOperations.Toggle = function(gridifier,
                                                  collector,
                                                  connections,
                                                  guid,
                                                  sizesTransformer,
                                                  sizesResolverManager) {
    var me = this;

    this._gridifier = null;
    this._collector = null;
    this._connections = null;
    this._guid = null;
    this._sizesTransformer = null;
    this._sizesResolverManager = null;

    this._optionsParser = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._collector = collector;
        me._connections = connections;
        me._guid = guid;
        me._sizesTransformer = sizesTransformer;
        me._sizesResolverManager = sizesResolverManager;

        me._optionsParser = new Gridifier.TransformerOperations.OptionsParser(
            me._collector, me._sizesResolverManager
        );
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

Gridifier.TransformerOperations.Toggle.prototype.execute = function(maybeItem, 
                                                                    newWidth, 
                                                                    newHeight,
                                                                    usePaddingBottomInsteadHeight) {
    var itemsToTransform = this._optionsParser.parseItemsToTransform(maybeItem);
    var sizesToTransform = this._optionsParser.parseSizesToTransform(maybeItem, newWidth, newHeight);
    var transformationData = this._parseTransformationData(
        itemsToTransform, sizesToTransform, usePaddingBottomInsteadHeight
    );
    if(transformationData.length == 0)
        return;

    this._sizesResolverManager.startCachingTransaction();
    this._sizesTransformer.transformConnectionSizes(transformationData);
    this._sizesResolverManager.stopCachingTransaction();
}

Gridifier.TransformerOperations.Toggle.prototype._parseTransformationData = function(itemsToTransform,
                                                                                     sizesToTransform,
                                                                                     usePaddingBottomInsteadHeight) {
    var itemNewRawSizesFinder = new Gridifier.SizesTransformer.ItemNewRawSizesFinder(this._sizesResolverManager);
    var transformationData = [];

    for(var i = 0; i < itemsToTransform.length; i++) {
        if(this._gridifier.isItemClone(itemsToTransform[i]))
            continue;

        var connectionToTransform = this._connections.findConnectionByItem(itemsToTransform[i]);
        var targetSizesToTransform = null;

        if(itemNewRawSizesFinder.areConnectionSizesToggled(connectionToTransform)) {
            targetSizesToTransform = itemNewRawSizesFinder.getConnectionSizesPerUntoggle(
                connectionToTransform
            );
            itemNewRawSizesFinder.unmarkConnectionPerToggle(connectionToTransform);
        }
        else {
            itemNewRawSizesFinder.markConnectionPerToggle(connectionToTransform, usePaddingBottomInsteadHeight);
            targetSizesToTransform = itemNewRawSizesFinder.initConnectionTransform(
                connectionToTransform, sizesToTransform[i][0], sizesToTransform[i][1], usePaddingBottomInsteadHeight
            );
        }

        transformationData.push({
            connectionToTransform: connectionToTransform,
            widthToTransform: targetSizesToTransform.targetWidth,
            heightToTransform: targetSizesToTransform.targetHeight,
            usePaddingBottomInsteadHeight: usePaddingBottomInsteadHeight
        });
    }

    return transformationData;
}

Gridifier.TransformerOperations.Transform = function(gridifier,
                                                     collector,
                                                     connections,
                                                     guid,
                                                     sizesTransformer,
                                                     sizesResolverManager) {
    var me = this;

    this._gridifier = null;
    this._collector = null;
    this._connections = null;
    this._guid = null;
    this._sizesTransformer = null;
    this._sizesResolverManager = null;

    this._optionsParser = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._collector = collector;
        me._connections = connections;
        me._guid = guid;
        me._sizesTransformer = sizesTransformer;
        me._sizesResolverManager = sizesResolverManager;

        me._optionsParser = new Gridifier.TransformerOperations.OptionsParser(
            me._collector, me._sizesResolverManager
        );
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

Gridifier.TransformerOperations.Transform.prototype.execute = function(maybeItem, 
                                                                       newWidth, 
                                                                       newHeight, 
                                                                       usePaddingBottomInsteadHeight) {
    var itemsToTransform = this._optionsParser.parseItemsToTransform(maybeItem);
    var sizesToTransform = this._optionsParser.parseSizesToTransform(maybeItem, newWidth, newHeight);
    var transformationData = this._parseTransformationData(
        itemsToTransform, sizesToTransform, usePaddingBottomInsteadHeight
    );
    if(transformationData.length == 0)
        return;

    this._sizesResolverManager.startCachingTransaction();
    this._sizesTransformer.transformConnectionSizes(transformationData);
    this._sizesResolverManager.stopCachingTransaction();
}

Gridifier.TransformerOperations.Transform.prototype._parseTransformationData = function(itemsToTransform,
                                                                                        sizesToTransform,
                                                                                        usePaddingBottomInsteadHeight) {
    var itemNewRawSizesFinder = new Gridifier.SizesTransformer.ItemNewRawSizesFinder(this._sizesResolverManager);
    var transformationData = [];

    for(var i = 0; i < itemsToTransform.length; i++) {
        if(this._gridifier.isItemClone(itemsToTransform[i]))
            continue;

        var connectionToTransform = this._connections.findConnectionByItem(itemsToTransform[i]);
        var targetSizesToTransform = null;

        targetSizesToTransform = itemNewRawSizesFinder.initConnectionTransform(
            connectionToTransform, sizesToTransform[i][0], sizesToTransform[i][1], usePaddingBottomInsteadHeight
        );

        transformationData.push({
            connectionToTransform: connectionToTransform,
            widthToTransform: targetSizesToTransform.targetWidth,
            heightToTransform: targetSizesToTransform.targetHeight,
            usePaddingBottomInsteadHeight: usePaddingBottomInsteadHeight
        });
    }

    return transformationData;
}

Gridifier.TransformerOperations.Transform.prototype.executeRetransformAllSizes = function() {
    this._sizesResolverManager.startCachingTransaction();
    this._sizesTransformer.retransformAllConnections();
    this._sizesResolverManager.stopCachingTransaction();
}

Gridifier.TransformerOperations.Transform.prototype.executeRetransformFromFirstSortedConnection = function(items) {
    this._sizesResolverManager.startCachingTransaction();
    this._sizesTransformer.retransformFromFirstSortedConnection(items);
    this._sizesResolverManager.stopCachingTransaction();
}

Gridifier.VerticalGrid.Appender = function(gridifier, 
                                           settings, 
                                           sizesResolverManager,
                                           connectors, 
                                           connections, 
                                           guid, 
                                           renderer, 
                                           normalizer,
                                           operation) {
    var me = this;

    this._gridifier = null;
    this._settings = null;
    this._sizesResolverManager = null;
    this._guid = null;
    this._renderer = null;
    this._normalizer = null;
    this._operation = null;
    this._connectors = null;
    this._connections = null;

    this._connectorsCleaner = null;
    this._connectorsShifter = null;
    this._connectorsSelector = null;
    this._connectorsSorter = null;
    this._itemCoordsExtractor = null;
    this._connectionsIntersector = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._settings = settings;
        me._sizesResolverManager = sizesResolverManager;
        me._guid = guid;
        me._renderer = renderer;
        me._normalizer = normalizer;
        me._operation = operation;
        me._connectors = connectors;
        me._connections = connections;

        me._connectorsCleaner = new Gridifier.VerticalGrid.ConnectorsCleaner(
            me._connectors, me._connections, me._settings
        );
        me._connectorsShifter = new Gridifier.ConnectorsShifter(
            me._gridifier, me._connections, me._settings
        );
        me._connectorsSelector = new Gridifier.VerticalGrid.ConnectorsSelector(me._guid);
        me._connectorsSorter = new Gridifier.VerticalGrid.ConnectorsSorter();
        me._itemCoordsExtractor = new Gridifier.VerticalGrid.ItemCoordsExtractor(me._gridifier, me._sizesResolverManager);
        me._connectionsIntersector = new Gridifier.VerticalGrid.ConnectionsIntersector(me._connections);
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

Gridifier.VerticalGrid.Appender.prototype.append = function(item) {
    this._initConnectors();

    var connection = this._createConnectionPerItem(item);
    this._connections.attachConnectionToRanges(connection);
    this._connectorsCleaner.deleteAllTooHighConnectorsFromMostBottomConnector();
    this._connectorsCleaner.deleteAllIntersectedFromBottomConnectors();
    
    if(this._settings.isDefaultIntersectionStrategy())
        this._renderer.showConnections(connection);
    else if(this._settings.isNoIntersectionsStrategy()) {
        var rowConnections = this._connections.getLastRowVerticallyExpandedConnections();

        for(var i = 0; i < rowConnections.length; i++) {
            if(rowConnections[i].itemGUID == connection.itemGUID) {
                rowConnections.splice(i, 1);
                i--;
            }
        }

        this._renderer.renderConnectionsAfterDelay(rowConnections);
        this._renderer.showConnections(connection);
    }
}

Gridifier.VerticalGrid.Appender.prototype._initConnectors = function() {
    if(this._operation.isInitialOperation(Gridifier.OPERATIONS.APPEND)) {
        this.createInitialConnector();
        return;
    }

    if(!this._operation.isCurrentOperationSameAsPrevious(Gridifier.OPERATIONS.APPEND)) {
        this.recreateConnectorsPerAllConnectedItems();
        this._connectorsCleaner.deleteAllIntersectedFromBottomConnectors();
        this._connectorsCleaner.deleteAllTooHighConnectorsFromMostBottomConnector();
    }
}

Gridifier.VerticalGrid.Appender.prototype.createInitialConnector = function() {
    this._connectors.addAppendConnector(
        Gridifier.Connectors.SIDES.LEFT.TOP,
        parseFloat(this._gridifier.getGridX2()),
        0
    );
}

Gridifier.VerticalGrid.Appender.prototype.recreateConnectorsPerAllConnectedItems = function(disableFlush) {
    var disableFlush = disableFlush || false;
    if(!disableFlush)
        this._connectors.flush();

    var connections = this._connections.get();
    for(var i = 0; i < connections.length; i++) {
        this._addItemConnectors(connections[i], connections[i].itemGUID);
    }

    if(this._connectors.count() == 0) 
        this.createInitialConnector();
}

Gridifier.VerticalGrid.Appender.prototype._addItemConnectors = function(itemCoords, itemGUID) {
    if((itemCoords.x1 - 1) >= 0) {
        this._connectors.addAppendConnector(
            Gridifier.Connectors.SIDES.LEFT.TOP,
            parseFloat(itemCoords.x1 - 1),
            parseFloat(itemCoords.y1),
            Dom.toInt(itemGUID)
        );
    }

    this._connectors.addAppendConnector(
        Gridifier.Connectors.SIDES.BOTTOM.RIGHT,
        parseFloat(itemCoords.x2),
        parseFloat(itemCoords.y2 + 1),
        Dom.toInt(itemGUID)
    );
}

Gridifier.VerticalGrid.Appender.prototype._createConnectionPerItem = function(item) {
    var sortedConnectors = this._filterConnectorsPerNextConnection();

    var itemConnectionCoords = this._findItemConnectionCoords(item, sortedConnectors);
    var connection = this._connections.add(item, itemConnectionCoords);

    if(this._settings.isNoIntersectionsStrategy()) {
        this._connections.expandVerticallyAllRowConnectionsToMostTall(connection);
    }
    this._addItemConnectors(itemConnectionCoords, this._guid.getItemGUID(item));

    return connection;
}

Gridifier.VerticalGrid.Appender.prototype._filterConnectorsPerNextConnection = function() {
    var connectors = this._connectors.getClone();

    this._connectorsSelector.attachConnectors(connectors);
    this._connectorsSelector.selectOnlySpecifiedSideConnectorsOnPrependedItems(Gridifier.Connectors.SIDES.BOTTOM.RIGHT);
    connectors = this._connectorsSelector.getSelectedConnectors();

    if(this._settings.isDefaultIntersectionStrategy()) {
        this._connectorsShifter.attachConnectors(connectors);
        this._connectorsShifter.shiftAllConnectors();
        connectors = this._connectorsShifter.getAllConnectors();
    }
    else if(this._settings.isNoIntersectionsStrategy()) {
        var connectorsSide = Gridifier.Connectors.SIDES.BOTTOM.RIGHT;

        this._connectorsSelector.attachConnectors(connectors);
        this._connectorsSelector.selectOnlyMostBottomConnectorFromSide(connectorsSide);
        connectors = this._connectorsSelector.getSelectedConnectors();
        
        this._connectorsShifter.attachConnectors(connectors);
        this._connectorsShifter.shiftAllWithSpecifiedSideToRightGridCorner(connectorsSide);
        connectors = this._connectorsShifter.getAllConnectors();
    }
    
    this._connectorsSorter.attachConnectors(connectors); 
    this._connectorsSorter.sortConnectorsForAppend(Gridifier.APPEND_TYPES.DEFAULT_APPEND);

    return this._connectorsSorter.getConnectors();
}

Gridifier.VerticalGrid.Appender.prototype._findItemConnectionCoords = function(item, sortedConnectors) {
    var itemConnectionCoords = null;
    
    for(var i = 0; i < sortedConnectors.length; i++) {
        var itemCoords = this._itemCoordsExtractor.connectorToAppendedItemCoords(item, sortedConnectors[i]);

        if(itemCoords.x1 < this._normalizer.normalizeLowRounding(0)) {
            continue;
        }
        
        var maybeIntersectableConnections = this._connectionsIntersector.findAllMaybeIntersectableConnectionsOnAppend(
            sortedConnectors[i]
        );
        if(this._connectionsIntersector.isIntersectingAnyConnection(maybeIntersectableConnections, itemCoords)) {
            continue;
        }
        
        itemConnectionCoords = itemCoords;
        
        var connectionsBelowCurrent = this._connections.getAllConnectionsBelowY(itemCoords.y2);
        if(this._connections.isAnyConnectionItemGUIDSmallerThan(connectionsBelowCurrent, item)) {
            continue;
        }

        if(this._settings.isNoIntersectionsStrategy()) {
            if(this._connections.isIntersectingMoreThanOneConnectionItemVertically(itemConnectionCoords)) {
                itemConnectionCoords = null;
            }
        }
        
        if(itemConnectionCoords != null) {
            break;
        }
    }

    if(itemConnectionCoords == null) {
        var errorType = Gridifier.Error.ERROR_TYPES.INSERTER.TOO_WIDE_ITEM_ON_VERTICAL_GRID_INSERT;
        new Gridifier.Error(errorType, item);
    }
    
    return itemConnectionCoords;
}

Gridifier.VerticalGrid.Connections = function(gridifier, guid, settings, sizesResolverManager, eventEmitter) {
    var me = this;

    this._gridifier = null;
    this._guid = null;
    this._settings = null;
    this._sizesResolverManager = null;
    this._eventEmitter = null;

    this._itemCoordsExtractor = null;
    this._sizesTransformer = null;
    this._connectionsCore = null;
    this._connectionsVerticalIntersector = null;

    this._connections = [];
    this._ranges = null;
    this._sorter = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._guid = guid;
        me._settings = settings;
        me._sizesResolverManager = sizesResolverManager;
        me._eventEmitter = eventEmitter;

        me._ranges = new Gridifier.VerticalGrid.ConnectionsRanges(me);
        me._ranges.init();

        me._sorter = new Gridifier.VerticalGrid.ConnectionsSorter(
            me, me._settings, me._guid
        );
        me._itemCoordsExtractor = new Gridifier.VerticalGrid.ItemCoordsExtractor(
            me._gridifier, me._sizesResolverManager
        );

        me._connectionsCore = new Gridifier.Connections(
            me._gridifier, me, me._guid, me._sorter, me._sizesResolverManager
        );
        me._connectionsVerticalIntersector = new Gridifier.VerticalGrid.ConnectionsVerticalIntersector(
            me, me._settings, me._itemCoordsExtractor
        );
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

Gridifier.VerticalGrid.Connections.prototype.getConnectionsSorter = function() {
    return this._sorter;
}

Gridifier.VerticalGrid.Connections.prototype.setSizesTransformerInstance = function(sizesTransformer) {
    this._sizesTransformer = sizesTransformer;
    this._connectionsCore.setSizesTransformerInstance(sizesTransformer);
}

Gridifier.VerticalGrid.Connections.prototype.attachConnectionToRanges = function(connection) {
    this._ranges.attachConnection(connection, this._connections.length - 1);
}

Gridifier.VerticalGrid.Connections.prototype.reinitRanges = function() {
    this._ranges.init();
}

Gridifier.VerticalGrid.Connections.prototype.getAllHorizontallyIntersectedAndUpperConnections = function(connector) {
    return this._ranges.getAllConnectionsFromIntersectedAndUpperRanges(connector.y);
}

Gridifier.VerticalGrid.Connections.prototype.getAllHorizontallyIntersectedConnections = function(connector) {
    return this._ranges.getAllConnectionsFromIntersectedRange(connector.y);
}

Gridifier.VerticalGrid.Connections.prototype.getAllHorizontallyIntersectedAndLowerConnections = function(connector) {
    return this._ranges.getAllConnectionsFromIntersectedAndLowerRanges(connector.y);
}

Gridifier.VerticalGrid.Connections.prototype.mapAllIntersectedAndLowerConnectionsPerEachConnector = function(sortedConnectors) {
    return this._ranges.mapAllIntersectedAndLowerConnectionsPerEachConnector(sortedConnectors);
}

Gridifier.VerticalGrid.Connections.prototype.mapAllIntersectedAndUpperConnectionsPerEachConnector = function(sortedConnectors) {
    return this._ranges.mapAllIntersectedAndUpperConnectionsPerEachConnector(sortedConnectors);
}

Gridifier.VerticalGrid.Connections.prototype.getLastRowVerticallyExpandedConnections = function() {
    return this._connectionsVerticalIntersector.getLastRowVerticallyExpandedConnections();
}

Gridifier.VerticalGrid.Connections.prototype.get = function() {
    return this._connections;
}

Gridifier.VerticalGrid.Connections.prototype.count = function() {
    return this._connections.length;
}

Gridifier.VerticalGrid.Connections.prototype.restore = function(connections) {
    this._connections = this._connections.concat(connections);
}

Gridifier.VerticalGrid.Connections.prototype.restoreOnCustomSortDispersionMode = function(connections) {
    var currentConnections = this._sorter.sortConnectionsPerReappend(this._connections);
    var lastConnection = currentConnections[currentConnections.length - 1];

    if(this._settings.isDefaultAppend()) {
        var minX = lastConnection.x1;
        var maxY = lastConnection.y1;

        var nextFakeX = minX - 1;
        for(var i = 0; i < connections.length; i++) {
            connections[i].x1 = nextFakeX;
            connections[i].x2 = nextFakeX;
            connections[i].y1 = maxY;
            connections[i].y2 = maxY;
            nextFakeX--;
        }
    }
    else if(this._settings.isReversedAppend()) {
        var maxX = lastConnection.x2;
        var maxY = lastConnection.y1;

        var nextFakeX = maxX + 1;
        for(var i = 0; i < connections.length; i++) {
            connections[i].x1 = nextFakeX;
            connections[i].x2 = nextFakeX;
            connections[i].y1 = maxY;
            connections[i].y2 = maxY;
            nextFakeX++;
        }
    }

    this.restore(connections);
}

Gridifier.VerticalGrid.Connections.prototype.getMaxX2 = function() {
    return this._connectionsCore.getMaxX2();
}

Gridifier.VerticalGrid.Connections.prototype.getMaxY2 = function() {
    return this._connectionsCore.getMaxY2();
}

Gridifier.VerticalGrid.Connections.prototype.findConnectionByItem = function(item, disableWasItemFoundValidation) {
    var disableWasItemFindValidation = disableWasItemFoundValidation || false;
    return this._connectionsCore.findConnectionByItem(item, disableWasItemFoundValidation);
}

Gridifier.VerticalGrid.Connections.prototype.remapAllItemGUIDS = function() {
    this._connectionsCore.remapAllItemGUIDS();
}

Gridifier.VerticalGrid.Connections.prototype.remapAllItemGUIDSInSortedConnections = function(connections) {
    this._connectionsCore.remapAllItemGUIDSInSortedConnections(connections);
}

Gridifier.VerticalGrid.Connections.prototype.add = function(item, itemConnectionCoords) {
    var connection = this._connectionsCore.createItemConnection(item, itemConnectionCoords);
    this._connections.push(connection);
    this._eventEmitter.emitConnectionCreateEvent(this);

    return connection;
}

Gridifier.VerticalGrid.Connections.prototype.removeConnection = function(connection) {
    for(var i = 0; i < this._connections.length; i++) {
        if(this._guid.getItemGUID(connection.item) == this._guid.getItemGUID(this._connections[i].item)) {
            this._connections.splice(i, 1);
            return;
        }
    }
}

Gridifier.VerticalGrid.Connections.prototype.getConnectionsByItemGUIDS = function(itemGUIDS) {
    return this._connectionsCore.getConnectionsByItemGUIDS(itemGUIDS);
}

Gridifier.VerticalGrid.Connections.prototype.syncConnectionParams = function(connectionsData) {
    this._connectionsCore.syncConnectionParams(connectionsData);
}

Gridifier.VerticalGrid.Connections.prototype.getMinConnectionWidth = function() {
    return this._connectionsCore.getMinConnectionWidth();
}

Gridifier.VerticalGrid.Connections.prototype.getMinConnectionHeight = function() {
    return this._connectionsCore.getMinConnectionHeight();
}

Gridifier.VerticalGrid.Connections.prototype.isAnyConnectionItemGUIDSmallerThan = function(comparableConnections, 
                                                                                           item) {
    return this._connectionsCore.isAnyConnectionItemGUIDSmallerThan(comparableConnections, item);
}

Gridifier.VerticalGrid.Connections.prototype.isAnyConnectionItemGUIDBiggerThan = function(comparableConnections,
                                                                                          item) {
    return this._connectionsCore.isAnyConnectionItemGUIDBiggerThan(comparableConnections, item);
}

Gridifier.VerticalGrid.Connections.prototype.getAllConnectionsBelowY = function(y) {
    var connections = [];
    for(var i = 0; i < this._connections.length; i++) {
        if(this._settings.isDisabledSortDispersion()) {
            if(this._connections[i].y1 > y)
                connections.push(this._connections[i]);
        }
        else if(this._settings.isCustomSortDispersion()) {
            var sortDispersionValue = this._settings.getSortDispersionValue();
            if(this._connections[i].y1 - sortDispersionValue > y)
                connections.push(this._connections[i]);
        }
        else if(this._settings.isCustomAllEmptySpaceSortDispersion()) {
            ; // No connections
        }
    }

    return connections;
}

Gridifier.VerticalGrid.Connections.prototype.getAllConnectionsAboveY = function(y) {
    var connections = [];
    for(var i = 0; i < this._connections.length; i++) {
        if(this._settings.isDisabledSortDispersion()) {
            if(this._connections[i].y2 < y)
                connections.push(this._connections[i]);
        }
        else if(this._settings.isCustomSortDispersion()) {
            var sortDispersionValue = this._settings.getSortDispersionValue();
            if(this._connections[i].y2 + sortDispersionValue < y)
                connections.push(this._connections[i]);
        }
        else if(this._settings.isCustomAllEmptySpaceSortDispersion()) {
            ; // No connections
        }
    }

    return connections;
}

Gridifier.VerticalGrid.Connections.prototype.getMaxYFromAllConnections = function() {
    var maxY = 0;
    for(var i = 0; i < this._connections.length; i++) {
        if(this._connections[i].y2 > maxY)
            maxY = this._connections[i].y2;
    }

    return maxY;
}

Gridifier.VerticalGrid.Connections.prototype.isIntersectingMoreThanOneConnectionItemVertically = function(itemCoords) {
    return this._connectionsVerticalIntersector.isIntersectingMoreThanOneConnectionItemVertically(itemCoords);
}

Gridifier.VerticalGrid.Connections.prototype.getMostTallFromAllVerticallyIntersectedConnections = function(itemCoords) {
    return this._connectionsVerticalIntersector.getMostTallFromAllVerticallyIntersectedConnections(itemCoords);
}

Gridifier.VerticalGrid.Connections.prototype.getAllVerticallyIntersectedConnections = function(itemCoords) {
    return this._connectionsVerticalIntersector.getAllVerticallyIntersectedConnections(itemCoords);
}

Gridifier.VerticalGrid.Connections.prototype.expandVerticallyAllRowConnectionsToMostTall = function(newConnection) {
    this._connectionsVerticalIntersector.expandVerticallyAllRowConnectionsToMostTall(newConnection);
}

Gridifier.VerticalGrid.Connections.prototype.normalizeVerticalPositionsOfAllConnectionsAfterPrepend = function(newConnection,
                                                                                                               connectors) {
    if(newConnection.y1 >= 0)
        return false;

    var increaseVerticalPositionBy = Math.round(Math.abs(newConnection.y1));
    newConnection.y2 = Math.abs(newConnection.y1 - newConnection.y2);
    newConnection.y1 = 0;

    for(var i = 0; i < this._connections.length; i++) {
        if(newConnection.itemGUID == this._connections[i].itemGUID)
            continue;

        this._connections[i].y1 += increaseVerticalPositionBy;
        this._connections[i].y2 += increaseVerticalPositionBy;
    }

    for(var i = 0; i < connectors.length; i++)
        connectors[i].y += increaseVerticalPositionBy;

    this._ranges.shiftAllRangesBy(increaseVerticalPositionBy);
    this._ranges.createPrependedRange(newConnection.y1, newConnection.y2);

    return true;
}

Gridifier.VerticalGrid.ConnectionsIntersector = function(connections) {
    var me = this;

    this._connections = null;

    this._intersectorCore = null;

    this._css = {
    };

    this._construct = function() {
        me._connections = connections;
        me._intersectorCore = new Gridifier.ConnectionsIntersector(
            me._connections
        );
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

Gridifier.VerticalGrid.ConnectionsIntersector.prototype.isIntersectingAnyConnection = function(maybeIntersectableConnections, itemCoords) {
    return this._intersectorCore.isIntersectingAnyConnection(maybeIntersectableConnections, itemCoords);
}

Gridifier.VerticalGrid.ConnectionsIntersector.prototype.getAllConnectionsWithIntersectedCenter = function(maybeIntersectionCoords) {
    return this._intersectorCore.getAllConnectionsWithIntersectedCenter(maybeIntersectionCoords);
}

Gridifier.VerticalGrid.ConnectionsIntersector.prototype.findAllMaybeIntersectableConnectionsOnAppend = function(connector) {
    var connections = this._connections.get();
    var maybeIntersectableConnections = [];

    for(var i = 0; i < connections.length; i++) {
        if(connector.y > connections[i].y2)
            continue;

        maybeIntersectableConnections.push(connections[i]);
    }

    return maybeIntersectableConnections;
}

Gridifier.VerticalGrid.ConnectionsIntersector.prototype.findAllMaybeIntersectableConnectionsOnPrepend = function(connector) {
    var connections = this._connections.get();
    var maybeIntersectableConnections = [];

    for(var i = 0; i < connections.length; i++) {
        if(connector.y < connections[i].y1)
            continue;

        maybeIntersectableConnections.push(connections[i]);
    }

    return maybeIntersectableConnections;
}

Gridifier.VerticalGrid.ConnectionsRanges = function(connections) {
    var me = this;

    this._connections = null;

    this._ranges = null;

    this._css = {

    }

    this._construct = function() {
        me._connections = connections;
    };

    this._bindEvents = function() {

    };

    this._unbindEvents = function() {

    };

    this.destruct = function() {
        me._unbindEvents();
    }

    this._construct();
    return this;
}


Gridifier.VerticalGrid.ConnectionsRanges.RANGE_PX_HEIGHT = 500;

Gridifier.VerticalGrid.ConnectionsRanges.prototype.init = function() {
    this._ranges = [];
    this._ranges.push({
        y1: -1,
        y2: Gridifier.VerticalGrid.ConnectionsRanges.RANGE_PX_HEIGHT,
        connectionIndexes: []
    });
    this._attachAllConnections();
}

Gridifier.VerticalGrid.ConnectionsRanges.prototype.shiftAllRangesBy = function(verticalIncrease) {
    for(var i = 0; i < this._ranges.length; i++) {
        this._ranges[i].y1 += verticalIncrease;
        this._ranges[i].y2 += verticalIncrease;
    }
}

Gridifier.VerticalGrid.ConnectionsRanges.prototype.createPrependedRange = function(newRangeY1, newRangeY2) {
    this._ranges.unshift({
        y1: -1,
        y2: newRangeY2,
        connectionIndexes: []
    });
}

Gridifier.VerticalGrid.ConnectionsRanges.prototype._createNextRange = function() {
    var nextRangeY1 = this._ranges[this._ranges.length - 1].y2 + 1;

    this._ranges.push({
        y1: nextRangeY1,
        y2: nextRangeY1 + Gridifier.VerticalGrid.ConnectionsRanges.RANGE_PX_HEIGHT,
        connectionIndexes: []
    });
}

Gridifier.VerticalGrid.ConnectionsRanges.prototype.attachConnection = function(connection, connectionIndex) {
    while(connection.y2 + 1 > this._ranges[this._ranges.length - 1].y2) {
        this._createNextRange();
    }

    var wasConnectionAttachedAtLeastInOneRange = false;
    for(var i = 0; i < this._ranges.length; i++) {
        var isAboveRange = connection.y2 < this._ranges[i].y1;
        var isBelowRange = connection.y1 > this._ranges[i].y2;

        if(!isAboveRange && !isBelowRange) {
            this._ranges[i].connectionIndexes.push(connectionIndex);
            wasConnectionAttachedAtLeastInOneRange = true;
        }
    }

    if(!wasConnectionAttachedAtLeastInOneRange)
        throw new Error("Gridifier core error: connection was not connected to any range: " + connection.itemGUID);
}

Gridifier.VerticalGrid.ConnectionsRanges.prototype._attachAllConnections = function() {
    var connections = this._connections.get();
    for(var i = 0; i < connections.length; i++) 
        this.attachConnection(connections[i], i);
}

Gridifier.VerticalGrid.ConnectionsRanges.prototype.mapAllIntersectedAndUpperConnectionsPerEachConnector = function(sortedConnectors) {
    var currentConnectorRangeIndex = this._ranges.length - 1;
    var currentConnectorConnectionIndexes = [];

    for(var connectorIndex = 0; connectorIndex < sortedConnectors.length; connectorIndex++) {
        var currentConnectorRangeIndexFound = false;

        if(currentConnectorRangeIndex == this._ranges.length - 1)
            var isCurrentConnectorRangeSameAsPrevious = false;
        else
            var isCurrentConnectorRangeSameAsPrevious = true;

        while(!currentConnectorRangeIndexFound) { 
            // Sometimes connector y may become 1px lower than range.
            // (Spot on (width=10%, height=0px, padding-bottom: 25%)).
            // In this such cases we should return connections of all ranges.
            if(currentConnectorRangeIndex > this._ranges.length - 1
                || currentConnectorRangeIndex < 0) {
                currentConnectorRangeIndex = this._ranges.length - 1;
                break;
            }

            if(sortedConnectors[connectorIndex].y >= this._ranges[currentConnectorRangeIndex].y1 &&
                sortedConnectors[connectorIndex].y <= this._ranges[currentConnectorRangeIndex].y2) {
                currentConnectorRangeIndexFound = true;
            }
            else {
                currentConnectorRangeIndex--;
                isCurrentConnectorRangeSameAsPrevious = false;
            }
        }

        if(!isCurrentConnectorRangeSameAsPrevious) {
            currentConnectorConnectionIndexes = [];
            for(var rangeIndex = currentConnectorRangeIndex; rangeIndex >= 0; rangeIndex--)
                currentConnectorConnectionIndexes.push(this._ranges[rangeIndex].connectionIndexes);
        }

        sortedConnectors[connectorIndex].connectionIndexes = currentConnectorConnectionIndexes;
    }

    return sortedConnectors;
}

Gridifier.VerticalGrid.ConnectionsRanges.prototype.getAllConnectionsFromIntersectedAndLowerRanges = function(y) {
    var connectionIndexes = [];
    var intersectedRangeIndex = null;

    for(var i = 0; i < this._ranges.length; i++) {
        if(y >= this._ranges[i].y1 && y <= this._ranges[i].y2) {
            intersectedRangeIndex = i;
            break;
        }
    }

    if(intersectedRangeIndex == null)
        intersectedRangeIndex = 0;

    for(var i = intersectedRangeIndex; i < this._ranges.length; i++) {
        connectionIndexes.push(this._ranges[i].connectionIndexes);
    }

    return connectionIndexes;
}

Gridifier.VerticalGrid.ConnectionsRanges.prototype.mapAllIntersectedAndLowerConnectionsPerEachConnector = function(sortedConnectors) {
    var currentConnectorRangeIndex = 0;
    var currentConnectorConnectionIndexes = [];

    for(var connectorIndex = 0; connectorIndex < sortedConnectors.length; connectorIndex++) {
        var currentConnectorRangeIndexFound = false;

        if(currentConnectorRangeIndex == 0)
            var isCurrentConnectorRangeSameAsPrevious = false;
        else
            var isCurrentConnectorRangeSameAsPrevious = true;

        while(!currentConnectorRangeIndexFound) {
            // Sometimes connector y may become 1px larger than range.
            // (Spot on (width=10%, height=0px, padding-bottom: 25%)).
            // In this such cases we should return connections of all ranges.
            if(currentConnectorRangeIndex > this._ranges.length - 1
                || currentConnectorRangeIndex < 0) {
                currentConnectorRangeIndex = 0;
                break;
            }

            if(sortedConnectors[connectorIndex].y >= this._ranges[currentConnectorRangeIndex].y1 &&
               sortedConnectors[connectorIndex].y <= this._ranges[currentConnectorRangeIndex].y2) {
                currentConnectorRangeIndexFound = true;
            }
            else {
                currentConnectorRangeIndex++;
                isCurrentConnectorRangeSameAsPrevious = false;
            }
        }

        if(!isCurrentConnectorRangeSameAsPrevious) {
            currentConnectorConnectionIndexes = [];
            for(var rangeIndex = currentConnectorRangeIndex; rangeIndex < this._ranges.length; rangeIndex++)
                currentConnectorConnectionIndexes.push(this._ranges[rangeIndex].connectionIndexes);
        }

        sortedConnectors[connectorIndex].connectionIndexes = currentConnectorConnectionIndexes;
    }

    return sortedConnectors;
}

Gridifier.VerticalGrid.ConnectionsRanges.prototype.getAllConnectionsFromIntersectedRange = function(y) {
    for(var i = 0; i < this._ranges.length; i++) {
        if(y >= this._ranges[i].y1 && y <= this._ranges[i].y2)
            return this._ranges[i].connectionIndexes;
    }

    var isConnectionIndexAdded = function(connectionIndexes, index) {
        for(var i = 0; i < connectionIndexes.length; i++) {
            if(connectionIndexes[i] == index)
                return true;
        }

        return false;
    }

    var connectionIndexes = [];
    for(var i = 0; i < this._ranges.length; i++) {
        for(var j = 0; j < this._ranges[i].connectionIndexes.length; j++) {
            if(!isConnectionIndexAdded(connectionIndexes, this._ranges[i].connectionIndexes[j]))
                connectionIndexes.push(this._ranges[i].connectionIndexes[j]);
        }
    }

    return connectionIndexes;
}

Gridifier.VerticalGrid.ConnectionsRanges.prototype.getAllConnectionsFromIntersectedAndUpperRanges = function(y) {
    var connectionIndexes = [];
    var intersectedRangeIndex = null;

    for(var i = this._ranges.length - 1; i >= 0; i--) {
        if(y >= this._ranges[i].y1 && y <= this._ranges[i].y2) {
            intersectedRangeIndex = i;
            break;
        }
    }

    if(intersectedRangeIndex == null)
        intersectedRangeIndex = this._ranges.length - 1;

    for(var i = intersectedRangeIndex; i >= 0; i--) {
        connectionIndexes.push(this._ranges[i].connectionIndexes);
    }

    return connectionIndexes;
}

Gridifier.VerticalGrid.ConnectionsSorter = function(connections, settings, guid) {
    var me = this;

    this._connections = null;
    this._settings = null;
    this._guid = null;

    this._css = {
    };

    this._construct = function() {
        me._connections = connections;
        me._settings = settings;
        me._guid = guid;
    };

    this._bindEvents = function() {
        ;
    };

    this._unbindEvents = function() {
        ;
    };

    this.destruct = function() {
        me._unbindEvents();
    };

    this._construct();
    return this;
}

Gridifier.VerticalGrid.ConnectionsSorter.prototype.sortConnectionsPerReappend = function(connections) {
    var me = this;

    if(this._settings.isDisabledSortDispersion()) {
        connections.sort(function(firstConnection, secondConnection) {
            if(me._guid.getItemGUID(firstConnection.item) > me._guid.getItemGUID(secondConnection.item))
                return 1;

            return -1;
        });
    }
    else if(this._settings.isCustomSortDispersion() || 
            this._settings.isCustomAllEmptySpaceSortDispersion()) {
        if(this._settings.isDefaultAppend()) {
            connections.sort(function(firstConnection, secondConnection) {
                if(firstConnection.y1 == secondConnection.y1) {
                    if(firstConnection.x2 > secondConnection.x2)
                        return -1;
                    else 
                        return 1;
                }
                else {
                    if(firstConnection.y1 < secondConnection.y1)
                        return -1;
                    else
                        return 1;
                }
            });
        }
        else if(this._settings.isReversedAppend()) {
            connections.sort(function(firstConnection, secondConnection) {
                if(firstConnection.y1 == secondConnection.y1) {
                    if(firstConnection.x1 < secondConnection.x1)
                        return -1;
                    else
                        return 1;
                }
                else {
                    if(firstConnection.y1 < secondConnection.y1)
                        return -1;
                    else
                        return 1;
                }
            });
        }
    }

    return connections;
}

Gridifier.VerticalGrid.ConnectionsVerticalIntersector = function(connections,
                                                                 settings,
                                                                 itemCoordsExtractor) {
    var me = this;

    this._connections = null;
    this._settings = null;
    this._itemCoordsExtractor = null;

    this._lastRowVerticallyExpandedConnections = [];

    this._css = {
    };

    this._construct = function() {
        me._connections = connections;
        me._settings = settings;
        me._itemCoordsExtractor = itemCoordsExtractor;
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

Gridifier.VerticalGrid.ConnectionsVerticalIntersector.prototype.getLastRowVerticallyExpandedConnections = function() {
    return this._lastRowVerticallyExpandedConnections;
}

Gridifier.VerticalGrid.ConnectionsVerticalIntersector.prototype.isIntersectingMoreThanOneConnectionItemVertically = function(itemCoords) {
    var me = this;

    var connections = this._connections.get();
    var intersectedConnectionItemIndexes = [];

    var isIntersectingVerticallyAnyFromAlreadyIntersectedItems = function(connection) {
        if(intersectedConnectionItemIndexes.length == 0)
            return false;

        for(var i = 0; i < intersectedConnectionItemIndexes.length; i++) {
            var maybeIntersectableConnection = connections[intersectedConnectionItemIndexes[i]];
            var isAbove = (connection.y1 < maybeIntersectableConnection.y1 && connection.y2 < maybeIntersectableConnection.y1);
            var isBelow = (connection.y1 > maybeIntersectableConnection.y1 && connection.y2 > maybeIntersectableConnection.y2);

            if(!isAbove && !isBelow)
                return true;
        }

        return false;
    };

    var intersectedConnectionItemsCount = 0;
    for(var i = 0; i < connections.length; i++) {
        var maybeIntersectableConnection = connections[i];
        var isAbove = (itemCoords.y1 < maybeIntersectableConnection.y1 && itemCoords.y2 < maybeIntersectableConnection.y1);
        var isBelow = (itemCoords.y1 > maybeIntersectableConnection.y2 && itemCoords.y2 > maybeIntersectableConnection.y2);

        if(!isAbove && !isBelow && !isIntersectingVerticallyAnyFromAlreadyIntersectedItems(maybeIntersectableConnection)) {
            intersectedConnectionItemIndexes.push(i);
            intersectedConnectionItemsCount++;
        }
    }

    return intersectedConnectionItemsCount > 1;
}

Gridifier.VerticalGrid.ConnectionsVerticalIntersector.prototype.getMostTallFromAllVerticallyIntersectedConnections = function(itemCoords) {
    var me = this;

    var connections = this._connections.get();
    var mostTallVerticallyIntersectedConnection = null;

    for(var i = 0; i < connections.length; i++) {
        var maybeIntersectableConnection = connections[i];
        var isAbove = (itemCoords.y1 < maybeIntersectableConnection.y1 && itemCoords.y2 < maybeIntersectableConnection.y1);
        var isBelow = (itemCoords.y1 > maybeIntersectableConnection.y2 && itemCoords.y2 > maybeIntersectableConnection.y2);

        if(!isAbove && !isBelow) {
            if(mostTallVerticallyIntersectedConnection == null)
                mostTallVerticallyIntersectedConnection = maybeIntersectableConnection;
            else {
                var maybeIntersectableConnectionHeight = Math.abs(
                    maybeIntersectableConnection.y2 - maybeIntersectableConnection.y1
                );
                var mostTallVerticallyIntersectedConnectionHeight = Math.abs(
                    mostTallVerticallyIntersectedConnection.y2 - mostTallVerticallyIntersectedConnection.y1
                );

                if(maybeIntersectableConnectionHeight > mostTallVerticallyIntersectedConnectionHeight)
                    mostTallVerticallyIntersectedConnection = maybeIntersectableConnection;
            }
        }
    }

    return mostTallVerticallyIntersectedConnection;
}

Gridifier.VerticalGrid.ConnectionsVerticalIntersector.prototype.getAllVerticallyIntersectedConnections = function(itemCoords) {
    var me = this;

    var connections = this._connections.get();
    var verticallyIntersectedConnections = [];

    for(var i = 0; i < connections.length; i++) {
        var maybeIntersectableConnection = connections[i];
        var isAbove = (itemCoords.y1 < maybeIntersectableConnection.y1 && itemCoords.y2 < maybeIntersectableConnection.y1);
        var isBelow = (itemCoords.y1 > maybeIntersectableConnection.y2 && itemCoords.y2 > maybeIntersectableConnection.y2);

        if(!isAbove && !isBelow)
            verticallyIntersectedConnections.push(maybeIntersectableConnection);
    }

    return verticallyIntersectedConnections;
}

Gridifier.VerticalGrid.ConnectionsVerticalIntersector.prototype.expandVerticallyAllRowConnectionsToMostTall = function(newConnection) {
    var mostTallConnection = this.getMostTallFromAllVerticallyIntersectedConnections(newConnection);
    if(mostTallConnection == null)
        return;

    var rowConnectionsToExpand = this.getAllVerticallyIntersectedConnections(newConnection);
    var expandedConnectionsWithNewOffsets = [];

    for(var i = 0; i < rowConnectionsToExpand.length; i++) {
        rowConnectionsToExpand[i].y1 = mostTallConnection.y1;
        rowConnectionsToExpand[i].y2 = mostTallConnection.y2;

        if(this._settings.isVerticalGridTopAlignmentType()) {
            if(rowConnectionsToExpand[i].verticalOffset != 0)
                expandedConnectionsWithNewOffsets.push(rowConnectionsToExpand[i]);

            rowConnectionsToExpand[i].verticalOffset = 0;

        }
        else if(this._settings.isVerticalGridCenterAlignmentType()) {
            var y1 = rowConnectionsToExpand[i].y1;
            var y2 = rowConnectionsToExpand[i].y2;

            var targetSizes = this._itemCoordsExtractor.getItemTargetSizes(rowConnectionsToExpand[i].item);
            var itemHeight = targetSizes.targetHeight;

            var newVerticalOffset = (Math.abs(y2 - y1 + 1) / 2) - (itemHeight / 2);

            if(rowConnectionsToExpand[i].verticalOffset != newVerticalOffset) {
                rowConnectionsToExpand[i].verticalOffset = newVerticalOffset;
                expandedConnectionsWithNewOffsets.push(rowConnectionsToExpand[i]);
            }
        }
        else if(this._settings.isVerticalGridBottomAlignmentType()) {
            var y1 = rowConnectionsToExpand[i].y1;
            var y2 = rowConnectionsToExpand[i].y2;

            var targetSizes = this._itemCoordsExtractor.getItemTargetSizes(rowConnectionsToExpand[i].item);
            var itemHeight = targetSizes.targetHeight;

            var newVerticalOffset = Math.abs(y2 - y1 + 1) - itemHeight;

            if(rowConnectionsToExpand[i].verticalOffset != newVerticalOffset) {
                rowConnectionsToExpand[i].verticalOffset = newVerticalOffset;
                expandedConnectionsWithNewOffsets.push(rowConnectionsToExpand[i]);
            }
        }
    }

    // We should rerender only connections with new vertical offsets(Otherwise some browsers
    // will produce noticeable 'freezes' on rerender cycle)
    this._lastRowVerticallyExpandedConnections = expandedConnectionsWithNewOffsets;
}

Gridifier.VerticalGrid.ConnectorsCleaner = function(connectors, connections, settings) {
    var me = this;

    this._connectors = null;
    this._connections = null;
    this._settings = null;

    this._connectionItemIntersectionStrategy = null;

    this._css = {
    };

    this._construct = function() {
        me._connectors = connectors;
        me._connections = connections;
        me._settings = settings;

        if(me._settings.isDisabledSortDispersion()) {
            me.setConnectorInsideOrBeforeItemIntersectionStrategy();
        }
        else if(me._settings.isCustomSortDispersion() ||
                me._settings.isCustomAllEmptySpaceSortDispersion()) {
            me.setConnectorInsideItemIntersectionStrategy();
        }
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

Gridifier.VerticalGrid.ConnectorsCleaner.CONNECTION_ITEM_INTERSECTION_STRATEGIES = {
    CONNECTOR_INSIDE_CONNECTION_ITEM: 0,
    CONNECTOR_INSIDE_OR_BEFORE_CONNECTION_ITEM: 1
};

Gridifier.VerticalGrid.ConnectorsCleaner.MAX_VALID_VERTICAL_DISTANCE = {
    FROM_MOST_BOTTOM_CONNECTOR: 3000,
    FROM_MOST_TOP_CONNECTOR: 3000
};

Gridifier.VerticalGrid.ConnectorsCleaner.prototype.setConnectorInsideItemIntersectionStrategy = function() {
    var intersectionStrategies = Gridifier.VerticalGrid.ConnectorsCleaner.CONNECTION_ITEM_INTERSECTION_STRATEGIES;
    this._connectionItemIntersectionStrategy = intersectionStrategies.CONNECTOR_INSIDE_CONNECTION_ITEM;
}

Gridifier.VerticalGrid.ConnectorsCleaner.prototype.setConnectorInsideOrBeforeItemIntersectionStrategy = function() {
    var intersectionStrategies = Gridifier.VerticalGrid.ConnectorsCleaner.CONNECTION_ITEM_INTERSECTION_STRATEGIES;
    this._connectionItemIntersectionStrategy = intersectionStrategies.CONNECTOR_INSIDE_OR_BEFORE_CONNECTION_ITEM;
}

Gridifier.VerticalGrid.ConnectorsCleaner.prototype.isConnectorInsideItemIntersectionStrategy = function() {
    var intersectionStrategies = Gridifier.VerticalGrid.ConnectorsCleaner.CONNECTION_ITEM_INTERSECTION_STRATEGIES;
    return (this._connectionItemIntersectionStrategy == intersectionStrategies.CONNECTOR_INSIDE_CONNECTION_ITEM);
}

Gridifier.VerticalGrid.ConnectorsCleaner.prototype.isConnectorInsideOrBeforeItemIntersectionStrategy = function() {
    var intersectionStrategies = Gridifier.VerticalGrid.ConnectorsCleaner.CONNECTION_ITEM_INTERSECTION_STRATEGIES;
    return (this._connectionItemIntersectionStrategy == intersectionStrategies.CONNECTOR_INSIDE_OR_BEFORE_CONNECTION_ITEM);
}

Gridifier.VerticalGrid.ConnectorsCleaner.prototype._isMappedConnectorIntersectingAnyTopConnectionItem = function(mappedConnector) {
    var connections = this._connections.get();

    for(var i = 0; i < mappedConnector.connectionIndexes.length; i++) {
        for(var j = 0; j < mappedConnector.connectionIndexes[i].length; j++) {
            var connection = connections[mappedConnector.connectionIndexes[i][j]];

            if(this.isConnectorInsideOrBeforeItemIntersectionStrategy())
                var verticalIntersectionCond = (mappedConnector.y >= connection.y1);
            else if(this.isConnectorInsideItemIntersectionStrategy())
                var verticalIntersectionCond = (mappedConnector.y >= connection.y1 
                                                && mappedConnector.y <= connection.y2);

            if(mappedConnector.x >= connection.x1 && mappedConnector.x <= connection.x2
                && verticalIntersectionCond)
                return true;
        }
    }

    return false;
}

Gridifier.VerticalGrid.ConnectorsCleaner.prototype.deleteAllIntersectedFromTopConnectors = function() {
    var connectors = this._connectors.get();
    var mappedConnectors = this._connectors.getClone();

    mappedConnectors.sort(function(firstConnector, secondConnector) {
        if(firstConnector.y == secondConnector.y)
            return 0;
        else if(firstConnector.y > secondConnector.y)
            return -1;
        else
            return 1;
    });
    mappedConnectors = this._connections.mapAllIntersectedAndUpperConnectionsPerEachConnector(
        mappedConnectors
    );

    for(var i = 0; i < mappedConnectors.length; i++) {
        if(this._isMappedConnectorIntersectingAnyTopConnectionItem(mappedConnectors[i]))
            connectors[mappedConnectors[i].connectorIndex].isIntersected = true;
        else
            connectors[mappedConnectors[i].connectorIndex].isIntersected = false;
    }

    for(var i = 0; i < connectors.length; i++) {
        if(connectors[i].isIntersected) {
            connectors.splice(i, 1);
            i--;
        }
    }
}

Gridifier.VerticalGrid.ConnectorsCleaner.prototype.deleteAllTooLowConnectorsFromMostTopConnector = function() {
    var connectors = this._connectors.get();
    if(connectors.length == 0) return;

    var mostTopConnector = connectors[0];
    for(var i = 1; i < connectors.length; i++) {
        if(connectors[i].y < mostTopConnector.y)
            mostTopConnector = connectors[i];
    }

    var cc = Gridifier.VerticalGrid.ConnectorsCleaner;
    var maxValidY = mostTopConnector.y + cc.MAX_VALID_VERTICAL_DISTANCE.FROM_MOST_TOP_CONNECTOR;
    for(var i = 0; i < connectors.length; i++) {
        if(connectors[i].y > maxValidY) {
            connectors.splice(i, 1);
            i--;
        }
    }
}

Gridifier.VerticalGrid.ConnectorsCleaner.prototype._isMappedConnectorIntersectingAnyBottomConnectionItem = function(mappedConnector) {
    var connections = this._connections.get();

    for(var i = 0; i < mappedConnector.connectionIndexes.length; i++) {
        for(var j = 0; j < mappedConnector.connectionIndexes[i].length; j++) {
            var connection = connections[mappedConnector.connectionIndexes[i][j]];

            if(this.isConnectorInsideOrBeforeItemIntersectionStrategy())
                var verticalIntersectionCond = (mappedConnector.y <= connection.y2);
            else if(this.isConnectorInsideItemIntersectionStrategy())
                var verticalIntersectionCond = (mappedConnector.y <= connection.y2
                                                && mappedConnector.y >= connection.y1);

            if(mappedConnector.x >= connection.x1 && mappedConnector.x <= connection.x2
                && verticalIntersectionCond)
                return true;
        }
    }
    
    return false;
}

Gridifier.VerticalGrid.ConnectorsCleaner.prototype.deleteAllIntersectedFromBottomConnectors = function() {
    var connectors = this._connectors.get();
    var mappedConnectors = this._connectors.getClone();

    mappedConnectors.sort(function(firstConnector, secondConnector) {
        if(firstConnector.y == secondConnector.y)
            return 0;
        else if(firstConnector.y < secondConnector.y)
            return -1;
        else 
            return 1;
    });

    mappedConnectors = this._connections.mapAllIntersectedAndLowerConnectionsPerEachConnector(
        mappedConnectors
    );

    for(var i = 0; i < mappedConnectors.length; i++) {
        if(this._isMappedConnectorIntersectingAnyBottomConnectionItem(mappedConnectors[i])) 
            connectors[mappedConnectors[i].connectorIndex].isIntersected = true;
        else
            connectors[mappedConnectors[i].connectorIndex].isIntersected = false;
    }

    for(var i = 0; i < connectors.length; i++) {
        if(connectors[i].isIntersected) {
            connectors.splice(i, 1);
            i--;
        }
    }
}

Gridifier.VerticalGrid.ConnectorsCleaner.prototype.deleteAllTooHighConnectorsFromMostBottomConnector = function() {
    var connectors = this._connectors.get();
    if(connectors.length == 0) return;

    var mostBottomConnector = connectors[0];
    for(var i = 1; i < connectors.length; i++) {
        if(connectors[i].y > mostBottomConnector.y)
            mostBottomConnector = connectors[i];
    }

    var cc = Gridifier.VerticalGrid.ConnectorsCleaner;
    var minValidY = mostBottomConnector.y - cc.MAX_VALID_VERTICAL_DISTANCE.FROM_MOST_BOTTOM_CONNECTOR;
    for(var i = 0; i < connectors.length; i++) {
        if(connectors[i].y < minValidY) {
            connectors.splice(i, 1);
            i--;
        }
    }
}

Gridifier.VerticalGrid.ConnectorsSelector = function(guid) {
    var me = this;

    this._connectors = null;

    this._guid = null;

    this._css = {
    };

    this._construct = function() {
        me._guid = guid;
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

Gridifier.VerticalGrid.ConnectorsSelector.prototype.attachConnectors = function(connectors) {
    this._connectors = connectors;
}

Gridifier.VerticalGrid.ConnectorsSelector.prototype.getSelectedConnectors = function() {
    return this._connectors;
}

Gridifier.VerticalGrid.ConnectorsSelector.prototype.selectOnlyMostBottomConnectorFromSide = function(side) {
    var mostBottomConnectorItemGUID = null;
    var mostBottomConnectorY = null;

    var i = this._connectors.length;
    while(i--) {
        if(this._connectors[i].side == side) {
            if(mostBottomConnectorItemGUID == null || this._connectors[i].y > mostBottomConnectorY) {
                mostBottomConnectorItemGUID = this._connectors[i].itemGUID;
                mostBottomConnectorY = this._connectors[i].y;
            }
        }
    }

    if(mostBottomConnectorItemGUID == null)
        return;

    var i = this._connectors.length;
    while(i--) {
        if(this._connectors[i].side == side && this._connectors[i].itemGUID != mostBottomConnectorItemGUID)
            this._connectors.splice(i, 1);
    }
}

Gridifier.VerticalGrid.ConnectorsSelector.prototype.selectOnlyMostTopConnectorFromSide = function(side) {
    var mostTopConnectorItemGUID = null;
    var mostTopConnectorY = null;

    var i = this._connectors.length;
    while(i--) {
        if(this._connectors[i].side == side) {
            if(mostTopConnectorItemGUID == null || this._connectors[i].y < mostTopConnectorY) {
                mostTopConnectorItemGUID = this._connectors[i].itemGUID;
                mostTopConnectorY = this._connectors[i].y;
            }
        }
    }

    if(mostTopConnectorItemGUID == null)
        return;

    var i = this._connectors.length;
    while(i--) {
        if(this._connectors[i].side == side && this._connectors[i].itemGUID != mostTopConnectorItemGUID) 
            this._connectors.splice(i, 1);
    }
}

Gridifier.VerticalGrid.ConnectorsSelector.prototype._isInitialConnector = function(connector) {
    return connector.itemGUID == Gridifier.Connectors.INITIAL_CONNECTOR_ITEM_GUID;
}

Gridifier.VerticalGrid.ConnectorsSelector.prototype.selectOnlySpecifiedSideConnectorsOnAppendedItems = function(side) {
    for(var i = 0; i < this._connectors.length; i++) {
        if(!this._isInitialConnector(this._connectors[i]) &&
            !this._guid.wasItemPrepended(this._connectors[i].itemGUID) && side != this._connectors[i].side) {
            this._connectors.splice(i, 1);
            i--;
        }
    }
}

Gridifier.VerticalGrid.ConnectorsSelector.prototype.selectOnlySpecifiedSideConnectorsOnPrependedItems = function(side) {
    for(var i = 0; i < this._connectors.length; i++) {
        if(!this._isInitialConnector(this._connectors[i]) &&
            this._guid.wasItemPrepended(this._connectors[i].itemGUID) && side != this._connectors[i].side) {
            this._connectors.splice(i, 1);
            i--;
        }
    }
}

Gridifier.VerticalGrid.ConnectorsSorter = function() {
    var me = this;

    this._connectors = null;

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

Gridifier.VerticalGrid.ConnectorsSorter.prototype.attachConnectors = function(connectors) {
    this._connectors = connectors;
}

Gridifier.VerticalGrid.ConnectorsSorter.prototype.getConnectors = function() {
    return this._connectors;
}

Gridifier.VerticalGrid.ConnectorsSorter.prototype.sortConnectorsForPrepend = function(prependType) {
    var me = this;
    this._connectors.sort(function(firstConnector, secondConnector) {
        if(firstConnector.y == secondConnector.y) {
            if(prependType == Gridifier.PREPEND_TYPES.DEFAULT_PREPEND) {
                if(firstConnector.x > secondConnector.x)
                    return 1;
                else
                    return -1;
            }
            else if(prependType == Gridifier.PREPEND_TYPES.REVERSED_PREPEND) {
                if(firstConnector.x < secondConnector.x)
                    return 1;
                else
                    return -1;
            }
        }
        else {
            if(firstConnector.y < secondConnector.y)
                return 1;
            else
                return -1;
        }
    });
}

Gridifier.VerticalGrid.ConnectorsSorter.prototype.sortConnectorsForAppend = function(appendType) {
    var me = this;
    this._connectors.sort(function(firstConnector, secondConnector) {
        if(firstConnector.y == secondConnector.y) {
            if(appendType == Gridifier.APPEND_TYPES.DEFAULT_APPEND) {
                if(firstConnector.x > secondConnector.x)
                    return -1;
                else
                    return 1;
            }
            else if(appendType == Gridifier.APPEND_TYPES.REVERSED_APPEND) {
                if(firstConnector.x < secondConnector.x)
                    return -1;
                else
                    return 1;
            }
        }
        else {
            if(firstConnector.y < secondConnector.y)
                return -1;
            else
                return 1;
        }
    });
}

Gridifier.VerticalGrid.ItemCoordsExtractor = function(gridifier, sizesResolverManager) {
    var me = this;

    this._gridifier = null;
    this._sizesResolverManager = null;
    this._transformedItemMarker = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._sizesResolverManager = sizesResolverManager;
        me._transformedItemMarker = new Gridifier.SizesTransformer.TransformedItemMarker();
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

Gridifier.VerticalGrid.ItemCoordsExtractor.prototype._getItemSizesPerAppend = function(item) {
    if(this._transformedItemMarker.isTransformedItem(item)) {
        var itemTargetPxSizes = this._transformedItemMarker.getTransformedItemTargetPxSizes(item);

        return {
            targetWidth: parseFloat(itemTargetPxSizes.targetPxWidth),
            targetHeight: parseFloat(itemTargetPxSizes.targetPxHeight)
        };
    }
    else {
        return {
            targetWidth: this._sizesResolverManager.outerWidth(item, true),
            targetHeight: this._sizesResolverManager.outerHeight(item, true)
        };
    }
}

Gridifier.VerticalGrid.ItemCoordsExtractor.prototype.getItemTargetSizes = function(item) {
    return this._getItemSizesPerAppend(item);
}

Gridifier.VerticalGrid.ItemCoordsExtractor.prototype.connectorToAppendedItemCoords = function(item, connector) {
    var targetSizes = this._getItemSizesPerAppend(item);
    
    return {
        x1: parseFloat(connector.x - targetSizes.targetWidth + 1),
        x2: parseFloat(connector.x),
        y1: parseFloat(connector.y),
        y2: parseFloat(connector.y + targetSizes.targetHeight - 1)
    };
}

Gridifier.VerticalGrid.ItemCoordsExtractor.prototype.connectorToReversedAppendedItemCoords = function(item, connector) {
    var targetSizes = this._getItemSizesPerAppend(item);

    return {
        x1: parseFloat(connector.x),
        x2: parseFloat(connector.x + targetSizes.targetWidth - 1),
        y1: parseFloat(connector.y),
        y2: parseFloat(connector.y + targetSizes.targetHeight - 1)
    };
}

Gridifier.VerticalGrid.ItemCoordsExtractor.prototype.connectorToPrependedItemCoords = function(item, connector) {
    var targetSizes = this._getItemSizesPerAppend(item);

    return {
        x1: parseFloat(connector.x),
        x2: parseFloat(connector.x + targetSizes.targetWidth - 1),
        y1: parseFloat(connector.y - targetSizes.targetHeight + 1),
        y2: parseFloat(connector.y)
    };
}

Gridifier.VerticalGrid.ItemCoordsExtractor.prototype.connectorToReversedPrependedItemCoords = function(item, connector) {
    var targetSizes = this._getItemSizesPerAppend(item);

    return {
        x1: parseFloat(connector.x - targetSizes.targetWidth + 1),
        x2: parseFloat(connector.x),
        y1: parseFloat(connector.y - targetSizes.targetHeight + 1),
        y2: parseFloat(connector.y)
    };
}

Gridifier.VerticalGrid.Prepender = function(gridifier, 
                                            settings, 
                                            sizesResolverManager,
                                            connectors, 
                                            connections, 
                                            guid, 
                                            renderer, 
                                            normalizer,
                                            operation) {
    var me = this;

    this._gridifier = null;
    this._settings = null;
    this._sizesResolverManager = null;
    this._guid = null;
    this._renderer = null;
    this._normalizer = null;
    this._operation = null;
    this._connectors = null;
    this._connections = null;

    this._connectorsCleaner = null;
    this._connectorsShifter = null;
    this._connectorsSelector = null;
    this._connectorsSorter = null;
    this._itemCoordsExtractor = null;
    this._connectionsIntersector = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._settings = settings;
        me._sizesResolverManager = sizesResolverManager;
        me._guid = guid;
        me._renderer = renderer;
        me._normalizer = normalizer;
        me._operation = operation;
        me._connectors = connectors;
        me._connections = connections;

        me._connectorsCleaner = new Gridifier.VerticalGrid.ConnectorsCleaner(
            me._connectors, me._connections, me._settings
        );
        me._connectorsShifter = new Gridifier.ConnectorsShifter(
            me._gridifier, me._connections, me._settings
        );
        me._connectorsSelector = new Gridifier.VerticalGrid.ConnectorsSelector(me._guid);
        me._connectorsSorter = new Gridifier.VerticalGrid.ConnectorsSorter();
        me._itemCoordsExtractor = new Gridifier.VerticalGrid.ItemCoordsExtractor(me._gridifier, me._sizesResolverManager);
        me._connectionsIntersector = new Gridifier.VerticalGrid.ConnectionsIntersector(me._connections);
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

Gridifier.VerticalGrid.Prepender.prototype.prepend = function(item) {
    this._initConnectors();

    var connection = this._createConnectionPerItem(item);
    var wereItemsNormalized = this._connections.normalizeVerticalPositionsOfAllConnectionsAfterPrepend(
        connection, this._connectors.get()
    );
    this._connections.attachConnectionToRanges(connection);

    this._connectorsCleaner.deleteAllTooLowConnectorsFromMostTopConnector();
    this._connectorsCleaner.deleteAllIntersectedFromTopConnectors();

    if(wereItemsNormalized) {
        this._renderer.renderConnections(this._connections.get(), [connection]);
    }

    if(this._settings.isDefaultIntersectionStrategy())
        this._renderer.showConnections(connection);
    else if(this._settings.isNoIntersectionsStrategy()) {
        var rowConnections = this._connections.getLastRowVerticallyExpandedConnections();

        for(var i = 0; i < rowConnections.length; i++) {
            if(rowConnections[i].itemGUID == connection.itemGUID) {
                rowConnections.splice(i, 1);
                i--;
            }
        }

        this._renderer.renderConnectionsAfterDelay(rowConnections);
        this._renderer.showConnections(connection);
    }
}

Gridifier.VerticalGrid.Prepender.prototype._initConnectors = function() {
    if(this._operation.isInitialOperation(Gridifier.OPERATIONS.PREPEND)) {
        this.createInitialConnector();
        return;
    }

    if(!this._operation.isCurrentOperationSameAsPrevious(Gridifier.OPERATIONS.PREPEND)) {
        this.recreateConnectorsPerAllConnectedItems();
        this._connectorsCleaner.deleteAllIntersectedFromTopConnectors();
        this._connectorsCleaner.deleteAllTooLowConnectorsFromMostTopConnector();
    }
}

Gridifier.VerticalGrid.Prepender.prototype.createInitialConnector = function() {
    this._connectors.addPrependConnector(
        Gridifier.Connectors.SIDES.RIGHT.BOTTOM,
        0,
        0
    );
}

Gridifier.VerticalGrid.Prepender.prototype.recreateConnectorsPerAllConnectedItems = function(disableFlush) {
    var disableFlush = disableFlush || false;
    if(!disableFlush)
        this._connectors.flush();

    var connections = this._connections.get();
    for(var i = 0; i < connections.length; i++) {
        this._addItemConnectors(connections[i], connections[i].itemGUID);
    }

    if(this._connectors.count() == 0)
        this.createInitialConnector();
}

Gridifier.VerticalGrid.Prepender.prototype._addItemConnectors = function(itemCoords, itemGUID) {
    if((itemCoords.x2 + 1) <= this._gridifier.getGridX2()) {
        this._connectors.addPrependConnector(
            Gridifier.Connectors.SIDES.RIGHT.BOTTOM,
            parseFloat(itemCoords.x2 + 1),
            parseFloat(itemCoords.y2),
            Dom.toInt(itemGUID)
        );
    }

    this._connectors.addPrependConnector(
        Gridifier.Connectors.SIDES.TOP.LEFT,
        parseFloat(itemCoords.x1),
        parseFloat(itemCoords.y1 - 1),
        Dom.toInt(itemGUID)
    );
}

Gridifier.VerticalGrid.Prepender.prototype._createConnectionPerItem = function(item) {
    var sortedConnectors = this._filterConnectorsPerNextConnection();
    var itemConnectionCoords = this._findItemConnectionCoords(item, sortedConnectors);

    var connection = this._connections.add(item, itemConnectionCoords);
    if(this._settings.isNoIntersectionsStrategy()) {
        this._connections.expandVerticallyAllRowConnectionsToMostTall(connection);
    }
    this._addItemConnectors(itemConnectionCoords, this._guid.getItemGUID(item));
    this._guid.markAsPrependedItem(item);

    return connection;
}

Gridifier.VerticalGrid.Prepender.prototype._filterConnectorsPerNextConnection = function() {
    var connectors = this._connectors.getClone();

    this._connectorsSelector.attachConnectors(connectors);
    this._connectorsSelector.selectOnlySpecifiedSideConnectorsOnAppendedItems(Gridifier.Connectors.SIDES.TOP.LEFT);
    connectors = this._connectorsSelector.getSelectedConnectors();

    if(this._settings.isDefaultIntersectionStrategy()) {
        this._connectorsShifter.attachConnectors(connectors);
        this._connectorsShifter.shiftAllConnectors();
        connectors = this._connectorsShifter.getAllConnectors();
    }
    else if(this._settings.isNoIntersectionsStrategy()) {
        var connectorsSide = Gridifier.Connectors.SIDES.TOP.LEFT;

        this._connectorsSelector.attachConnectors(connectors);
        this._connectorsSelector.selectOnlyMostTopConnectorFromSide(connectorsSide);
        connectors = this._connectorsSelector.getSelectedConnectors();
        
        this._connectorsShifter.attachConnectors(connectors);
        this._connectorsShifter.shiftAllWithSpecifiedSideToLeftGridCorner(connectorsSide);
        connectors = this._connectorsShifter.getAllConnectors();
    }

    this._connectorsSorter.attachConnectors(connectors);
    this._connectorsSorter.sortConnectorsForPrepend(Gridifier.PREPEND_TYPES.DEFAULT_PREPEND);

    return this._connectorsSorter.getConnectors();
}

Gridifier.VerticalGrid.Prepender.prototype._findItemConnectionCoords = function(item, sortedConnectors) {
    var itemConnectionCoords = null;

    for(var i = 0; i < sortedConnectors.length; i++) {
        var itemCoords = this._itemCoordsExtractor.connectorToPrependedItemCoords(item, sortedConnectors[i]);
        if(itemCoords.x2 > this._normalizer.normalizeHighRounding(this._gridifier.getGridX2())) {
            continue;
        }

        var maybeIntersectableConnections = this._connectionsIntersector.findAllMaybeIntersectableConnectionsOnPrepend(sortedConnectors[i]);
        if(this._connectionsIntersector.isIntersectingAnyConnection(maybeIntersectableConnections, itemCoords)) {
            continue;
        }

        itemConnectionCoords = itemCoords;

        var connectionsAboveCurrent = this._connections.getAllConnectionsAboveY(itemCoords.y1);
        if(this._connections.isAnyConnectionItemGUIDBiggerThan(connectionsAboveCurrent, item)) {
            continue;
        }

        if(this._settings.isNoIntersectionsStrategy()) {
            if(this._connections.isIntersectingMoreThanOneConnectionItemVertically(itemConnectionCoords)) {
                itemConnectionCoords = null;
            }
        }

        if(itemConnectionCoords != null) {
            break;
        }
    }

    if(itemConnectionCoords == null) {
        var errorType = Gridifier.Error.ERROR_TYPES.INSERTER.TOO_WIDE_ITEM_ON_VERTICAL_GRID_INSERT;
        new Gridifier.Error(errorType, item);
    }

    return itemConnectionCoords;
}

Gridifier.VerticalGrid.ReversedAppender = function(gridifier,
                                                   settings,
                                                   sizesResolverManager,
                                                   connectors,
                                                   connections,
                                                   guid,
                                                   renderer,
                                                   normalizer,
                                                   operation) {
    var me = this;

    this._gridifier = null;
    this._settings = null;
    this._sizesResolverManager = null;
    this._guid = null;
    this._renderer = null;
    this._normalizer = null;
    this._operation = null;
    this._connectors = null;
    this._connections = null;

    this._connectorsCleaner = null;
    this._connectorsShifter = null;
    this._connectorsSelector = null;
    this._connectorsSorter = null;
    this._itemCoordsExtractor = null;
    this._connectionsIntersector = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._settings = settings;
        me._sizesResolverManager = sizesResolverManager;
        me._guid = guid;
        me._renderer = renderer;
        me._normalizer = normalizer;
        me._operation = operation;
        me._connectors = connectors;
        me._connections = connections;

        me._connectorsCleaner = new Gridifier.VerticalGrid.ConnectorsCleaner(
            me._connectors, me._connections, me._settings
        );
        me._connectorsShifter = new Gridifier.ConnectorsShifter(
            me._gridifier, me._connections, me._settings
        );
        me._connectorsSelector = new Gridifier.VerticalGrid.ConnectorsSelector(me._guid);
        me._connectorsSorter = new Gridifier.VerticalGrid.ConnectorsSorter();
        me._itemCoordsExtractor = new Gridifier.VerticalGrid.ItemCoordsExtractor(me._gridifier, me._sizesResolverManager);
        me._connectionsIntersector = new Gridifier.VerticalGrid.ConnectionsIntersector(me._connections);
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

Gridifier.VerticalGrid.ReversedAppender.prototype.reversedAppend = function(item) {
    this._initConnectors();

    var connection = this._createConnectionPerItem(item);
    this._connections.attachConnectionToRanges(connection);

    this._connectorsCleaner.deleteAllTooHighConnectorsFromMostBottomConnector();
    this._connectorsCleaner.deleteAllIntersectedFromBottomConnectors();

    if(this._settings.isDefaultIntersectionStrategy())
        this._renderer.showConnections(connection);
    else if(this._settings.isNoIntersectionsStrategy()) {
        var rowConnections = this._connections.getLastRowVerticallyExpandedConnections();

        for(var i = 0; i < rowConnections.length; i++) {
            if(rowConnections[i].itemGUID == connection.itemGUID) {
                rowConnections.splice(i, 1);
                i--;
            }
        }

        this._renderer.renderConnectionsAfterDelay(rowConnections);
        this._renderer.showConnections(connection);
    }
}

Gridifier.VerticalGrid.ReversedAppender.prototype._initConnectors = function() {
    if(this._operation.isInitialOperation(Gridifier.OPERATIONS.REVERSED_APPEND)) {
        this.createInitialConnector();
        return;
    }

    if(!this._operation.isCurrentOperationSameAsPrevious(Gridifier.OPERATIONS.REVERSED_APPEND)) {
        this.recreateConnectorsPerAllConnectedItems();
        this._connectorsCleaner.deleteAllIntersectedFromBottomConnectors();
        this._connectorsCleaner.deleteAllTooHighConnectorsFromMostBottomConnector();
    }
}

Gridifier.VerticalGrid.ReversedAppender.prototype.createInitialConnector = function() {
    this._connectors.addAppendConnector(
        Gridifier.Connectors.SIDES.RIGHT.TOP,
        0,
        0
    );
}

Gridifier.VerticalGrid.ReversedAppender.prototype.recreateConnectorsPerAllConnectedItems = function(disableFlush) {
    var disableFlush = disableFlush || false;
    if(!disableFlush)
        this._connectors.flush();

    var connections = this._connections.get(); 
    for(var i = 0; i < connections.length; i++) {
        this._addItemConnectors(connections[i], connections[i].itemGUID);
    }

    if(this._connectors.count() == 0)
        this.createInitialConnector();
}

Gridifier.VerticalGrid.ReversedAppender.prototype._addItemConnectors = function(itemCoords, itemGUID) {
    if((itemCoords.x2 + 1) <= this._gridifier.getGridX2()) {
        this._connectors.addAppendConnector(
            Gridifier.Connectors.SIDES.RIGHT.TOP,
            parseFloat(itemCoords.x2 + 1),
            parseFloat(itemCoords.y1),
            Dom.toInt(itemGUID)
        );
    }

    this._connectors.addAppendConnector(
        Gridifier.Connectors.SIDES.BOTTOM.LEFT,
        parseFloat(itemCoords.x1),
        parseFloat(itemCoords.y2 + 1),
        Dom.toInt(itemGUID)
    );
}

Gridifier.VerticalGrid.ReversedAppender.prototype._createConnectionPerItem = function(item) {
    var sortedConnectors = this._filterConnectorsPerNextConnection();
    var itemConnectionCoords = this._findItemConnectionCoords(item, sortedConnectors);
    var connection = this._connections.add(item, itemConnectionCoords);

    if(this._settings.isNoIntersectionsStrategy()) {
        this._connections.expandVerticallyAllRowConnectionsToMostTall(connection);
    }
    this._addItemConnectors(itemConnectionCoords, this._guid.getItemGUID(item));

    return connection;
}

Gridifier.VerticalGrid.ReversedAppender.prototype._filterConnectorsPerNextConnection = function() {
    var connectors = this._connectors.getClone();

    this._connectorsSelector.attachConnectors(connectors);
    this._connectorsSelector.selectOnlySpecifiedSideConnectorsOnPrependedItems(Gridifier.Connectors.SIDES.BOTTOM.LEFT);
    connectors = this._connectorsSelector.getSelectedConnectors();

    if(this._settings.isDefaultIntersectionStrategy()) {
        this._connectorsShifter.attachConnectors(connectors);
        this._connectorsShifter.shiftAllConnectors();
        connectors = this._connectorsShifter.getAllConnectors();
    }
    else if(this._settings.isNoIntersectionsStrategy()) {
        var connectorsSide = Gridifier.Connectors.SIDES.BOTTOM.LEFT;

        this._connectorsSelector.attachConnectors(connectors);
        this._connectorsSelector.selectOnlyMostBottomConnectorFromSide(connectorsSide);
        connectors = this._connectorsSelector.getSelectedConnectors();

        this._connectorsShifter.attachConnectors(connectors);
        this._connectorsShifter.shiftAllWithSpecifiedSideToLeftGridCorner(connectorsSide);
        connectors = this._connectorsShifter.getAllConnectors();
    }

    this._connectorsSorter.attachConnectors(connectors);
    this._connectorsSorter.sortConnectorsForAppend(Gridifier.APPEND_TYPES.REVERSED_APPEND);

    return this._connectorsSorter.getConnectors();
}

Gridifier.VerticalGrid.ReversedAppender.prototype._findItemConnectionCoords = function(item, sortedConnectors) {
    var itemConnectionCoords = null;
    
    for(var i = 0; i < sortedConnectors.length; i++) {
        var itemCoords = this._itemCoordsExtractor.connectorToReversedAppendedItemCoords(item, sortedConnectors[i]);

        if(itemCoords.x2 > this._normalizer.normalizeHighRounding(this._gridifier.getGridX2())) {
            continue;
        }
        
        var maybeIntersectableConnections = this._connectionsIntersector.findAllMaybeIntersectableConnectionsOnAppend(
            sortedConnectors[i]
        );
        if(this._connectionsIntersector.isIntersectingAnyConnection(maybeIntersectableConnections, itemCoords)) {
            continue;
        }
        
        itemConnectionCoords = itemCoords;
        
        var connectionsBelowCurrent = this._connections.getAllConnectionsBelowY(itemCoords.y2);
        if(this._connections.isAnyConnectionItemGUIDSmallerThan(connectionsBelowCurrent, item)) {
            continue;
        }

        if(this._settings.isNoIntersectionsStrategy()) {
            if(this._connections.isIntersectingMoreThanOneConnectionItemVertically(itemConnectionCoords)) {
                itemConnectionCoords = null;
            }
        }
        
        if(itemConnectionCoords != null) {
            break;
        }
    }

    if(itemConnectionCoords == null) {
        var errorType = Gridifier.Error.ERROR_TYPES.INSERTER.TOO_WIDE_ITEM_ON_VERTICAL_GRID_INSERT;
        new Gridifier.Error(errorType, item);
    }
    
    return itemConnectionCoords;
}

Gridifier.VerticalGrid.ReversedPrepender = function(gridifier, 
                                                    settings, 
                                                    sizesResolverManager,
                                                    connectors, 
                                                    connections, 
                                                    guid, 
                                                    renderer, 
                                                    normalizer,
                                                    operation) {
    var me = this;

    this._gridifier = null;
    this._settings = null;
    this._sizesResolverManager = null;
    this._guid = null;
    this._renderer = null;
    this._normalizer = null;
    this._operation = null;
    this._connectors = null;
    this._connections = null;

    this._connectorsCleaner = null;
    this._connectorsShifter = null;
    this._connectorsSelector = null;
    this._connectorsSorter = null;
    this._itemCoordsExtractor = null;
    this._connectionsIntersector = null;

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
        me._settings = settings;
        me._sizesResolverManager = sizesResolverManager;
        me._guid = guid;
        me._renderer = renderer;
        me._normalizer = normalizer;
        me._operation = operation;
        me._connectors = connectors;
        me._connections = connections;

        me._connectorsCleaner = new Gridifier.VerticalGrid.ConnectorsCleaner(
            me._connectors, me._connections, me._settings
        );
        me._connectorsShifter = new Gridifier.ConnectorsShifter(
            me._gridifier, me._connections, me._settings
        );
        me._connectorsSelector = new Gridifier.VerticalGrid.ConnectorsSelector(me._guid);
        me._connectorsSorter = new Gridifier.VerticalGrid.ConnectorsSorter();
        me._itemCoordsExtractor = new Gridifier.VerticalGrid.ItemCoordsExtractor(me._gridifier, me._sizesResolverManager);
        me._connectionsIntersector = new Gridifier.VerticalGrid.ConnectionsIntersector(me._connections);
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

Gridifier.VerticalGrid.ReversedPrepender.prototype.reversedPrepend = function(item) {
    this._initConnectors();

    var connection = this._createConnectionPerItem(item);
    var wereItemsNormalized = this._connections.normalizeVerticalPositionsOfAllConnectionsAfterPrepend(
        connection, this._connectors.get()
    );
    this._connections.attachConnectionToRanges(connection);

    this._connectorsCleaner.deleteAllTooLowConnectorsFromMostTopConnector();
    this._connectorsCleaner.deleteAllIntersectedFromTopConnectors();

    if(wereItemsNormalized) {
        this._renderer.renderConnections(this._connections.get(), [connection]);
    }

    if(this._settings.isDefaultIntersectionStrategy())
        this._renderer.showConnections(connection);
    else if(this._settings.isNoIntersectionsStrategy()) {
        var rowConnections = this._connections.getLastRowVerticallyExpandedConnections();

        for(var i = 0; i < rowConnections.length; i++) {
            if(rowConnections[i].itemGUID == connection.itemGUID) {
                rowConnections.splice(i, 1);
                i--;
            }
        }

        this._renderer.renderConnectionsAfterDelay(rowConnections);
        this._renderer.showConnections(connection);
    }
}

Gridifier.VerticalGrid.ReversedPrepender.prototype._initConnectors = function() {
    if(this._operation.isInitialOperation(Gridifier.OPERATIONS.REVERSED_PREPEND)) {
        this.createInitialConnector();
        return;
    }

    if(!this._operation.isCurrentOperationSameAsPrevious(Gridifier.OPERATIONS.REVERSED_PREPEND)) {
        this.recreateConnectorsPerAllConnectedItems();
        this._connectorsCleaner.deleteAllIntersectedFromTopConnectors();
        this._connectorsCleaner.deleteAllTooLowConnectorsFromMostTopConnector();
    }
}

Gridifier.VerticalGrid.ReversedPrepender.prototype.createInitialConnector = function() {
    this._connectors.addPrependConnector(
        Gridifier.Connectors.SIDES.LEFT.BOTTOM,
        this._gridifier.getGridX2(),
        0
    );
}

Gridifier.VerticalGrid.ReversedPrepender.prototype.recreateConnectorsPerAllConnectedItems = function(disableFlush) {
    var disableFlush = disableFlush || false;
    if(!disableFlush)
        this._connectors.flush();

    var connections = this._connections.get();
    for(var i = 0; i < connections.length; i++) {
        this._addItemConnectors(connections[i], connections[i].itemGUID);
    }

    if(this._connectors.count() == 0)
        this.createInitialConnector();
}

Gridifier.VerticalGrid.ReversedPrepender.prototype._addItemConnectors = function(itemCoords, itemGUID) {
    if((itemCoords.x1 - 1) >= 0) {
        this._connectors.addPrependConnector(
            Gridifier.Connectors.SIDES.LEFT.BOTTOM,
            parseFloat(itemCoords.x1 - 1),
            parseFloat(itemCoords.y2),
            Dom.toInt(itemGUID)
        );
    }

    this._connectors.addPrependConnector(
        Gridifier.Connectors.SIDES.TOP.RIGHT,
        parseFloat(itemCoords.x2),
        parseFloat(itemCoords.y1 - 1),
        Dom.toInt(itemGUID)
    );
}

Gridifier.VerticalGrid.ReversedPrepender.prototype._createConnectionPerItem = function(item) {
    var sortedConnectors = this._filterConnectorsPerNextConnection();
    var itemConnectionCoords = this._findItemConnectionCoords(item, sortedConnectors);

    var connection = this._connections.add(item, itemConnectionCoords);
    if(this._settings.isNoIntersectionsStrategy()) {
        this._connections.expandVerticallyAllRowConnectionsToMostTall(connection);
    }
    this._addItemConnectors(itemConnectionCoords, this._guid.getItemGUID(item));
    this._guid.markAsPrependedItem(item);

    return connection;
}

Gridifier.VerticalGrid.ReversedPrepender.prototype._filterConnectorsPerNextConnection = function() {
    var connectors = this._connectors.getClone();

    this._connectorsSelector.attachConnectors(connectors);
    this._connectorsSelector.selectOnlySpecifiedSideConnectorsOnAppendedItems(Gridifier.Connectors.SIDES.TOP.RIGHT);
    connectors = this._connectorsSelector.getSelectedConnectors();

    if(this._settings.isDefaultIntersectionStrategy()) {
        this._connectorsShifter.attachConnectors(connectors);
        this._connectorsShifter.shiftAllConnectors();
        connectors = this._connectorsShifter.getAllConnectors();
    }
    else if(this._settings.isNoIntersectionsStrategy()) {
        var connectorsSide = Gridifier.Connectors.SIDES.TOP.RIGHT;

        this._connectorsSelector.attachConnectors(connectors);
        this._connectorsSelector.selectOnlyMostTopConnectorFromSide(connectorsSide);
        connectors = this._connectorsSelector.getSelectedConnectors();
        
        this._connectorsShifter.attachConnectors(connectors);
        this._connectorsShifter.shiftAllWithSpecifiedSideToRightGridCorner(connectorsSide);
        connectors = this._connectorsShifter.getAllConnectors();
    }

    this._connectorsSorter.attachConnectors(connectors);
    this._connectorsSorter.sortConnectorsForPrepend(Gridifier.PREPEND_TYPES.REVERSED_PREPEND);

    return this._connectorsSorter.getConnectors();
}

Gridifier.VerticalGrid.ReversedPrepender.prototype._findItemConnectionCoords = function(item, sortedConnectors) {
    var itemConnectionCoords = null;

    for(var i = 0; i < sortedConnectors.length; i++) {
        var itemCoords = this._itemCoordsExtractor.connectorToReversedPrependedItemCoords(item, sortedConnectors[i]);
        if(itemCoords.x1 < this._normalizer.normalizeLowRounding(0)) {
            continue;
        }

        var maybeIntersectableConnections = this._connectionsIntersector.findAllMaybeIntersectableConnectionsOnPrepend(sortedConnectors[i]);
        if(this._connectionsIntersector.isIntersectingAnyConnection(maybeIntersectableConnections, itemCoords)) {
            continue;
        }

        itemConnectionCoords = itemCoords;

        var connectionsAboveCurrent = this._connections.getAllConnectionsAboveY(itemCoords.y1);
        if(this._connections.isAnyConnectionItemGUIDBiggerThan(connectionsAboveCurrent, item)) {
            continue;
        }

        if(this._settings.isNoIntersectionsStrategy()) {
            if(this._connections.isIntersectingMoreThanOneConnectionItemVertically(itemConnectionCoords)) {
                itemConnectionCoords = null;
            }
        }

        if(itemConnectionCoords != null) {
            break;
        }
    }

    if(itemConnectionCoords == null) {
        var errorType = Gridifier.Error.ERROR_TYPES.INSERTER.TOO_WIDE_ITEM_ON_VERTICAL_GRID_INSERT;
        new Gridifier.Error(errorType, item);
    }

    return itemConnectionCoords;
}