var styleMaybePrefixedPropertyGetter = {
    prefixes: ['Moz', 'Webkit', 'ms', 'Ms', 'Khtml', 'O'],

    init: function()
    {
        ;
    },

    get: function(propertyName, element)
    {
        element = element || document.documentElement;
        var style = element.style;

        if(typeof style[propertyName] === "string") {
            return propertyName;
        }

        propertyName = propertyName.charAt(0).toUpperCase() + propertyName.slice(1);
        var prefixedPropertyName;
        for(var i = 0; i < this.prefixes.length; i++) {
            prefixedPropertyName = this.prefixes[i] + propertyName;
            if(typeof style[prefixedPropertyName] === "string")
                return prefixedPropertyName;
        }
    }
}

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

    init: function()
    {
        this.getComputedCSS = this.getComputedCSSFunction();
        this.determineMaybePrefixedProperties();
        this.determineBorderBoxComputedSizesCalculationStrategy();
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
        this.maybePrefixedProperties.boxSizing = styleMaybePrefixedPropertyGetter.get("boxSizing");
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

    _hasPercentageSide: function(sidePropertyValue) {
        var percentageSideRegex = new RegExp("(.*\\d)%$");
        if(percentageSideRegex.test(sidePropertyValue))
            return true;

        return false;
    },

    _getComputedCSSWithMaybePercentageSizes: function(DOMElem) {
        var parentDOMElemClone = DOMElem.parentNode.cloneNode();
        var DOMElemClone = DOMElem.cloneNode(true);

        parentDOMElemClone.appendChild(DOMElemClone);
        parentDOMElemClone.style.display = "none";
        DOMElem.parentNode.parentNode.appendChild(parentDOMElemClone);

        var unrenderedComputedCSSSource = this.getComputedCSS(DOMElemClone);
        var additionalComputedCSS = {};

        if(typeof unrenderedComputedCSSSource.getPropertyCSSValue != "undefined") {
            additionalComputedCSS.paddingLeft = unrenderedComputedCSSSource.getPropertyCSSValue("padding-left").cssText;
            additionalComputedCSS.paddingRight = unrenderedComputedCSSSource.getPropertyCSSValue("padding-right").cssText;
            additionalComputedCSS.marginLeft = unrenderedComputedCSSSource.getPropertyCSSValue("margin-left").cssText;
            additionalComputedCSS.marginRight = unrenderedComputedCSSSource.getPropertyCSSValue("margin-right").cssText;
            additionalComputedCSS.width = unrenderedComputedCSSSource.getPropertyCSSValue("width").cssText;
            additionalComputedCSS.height = unrenderedComputedCSSSource.getPropertyCSSValue("height").cssText;
        }

        var unrenderedComputedCSS = {};

        for(var key in unrenderedComputedCSSSource)
            unrenderedComputedCSS[key] = unrenderedComputedCSSSource[key];

        for(var key in additionalComputedCSS)
            unrenderedComputedCSS[key] = additionalComputedCSS[key];

        DOMElem.parentNode.parentNode.removeChild(parentDOMElemClone);

        return unrenderedComputedCSS;
    },

    hasPercentageWidth: function(DOMElem) {
        if(DOMElem.parentNode == null || typeof DOMElem.parentNode.outerHTML == "undefined") {
            var msg = "";

            msg += "SizesResolver error: ";
            msg += "Can't determine if is percentage width on element without parentNode. ";
            msg += "Elem: " + DOMElem;
            throw new Error(msg);
        }
        
        var elementComputedCSS = this._getComputedCSSWithMaybePercentageSizes(DOMElem);
        return this._hasPercentageSide(elementComputedCSS.width);
    },

    hasPercentageHeight: function(DOMElem) {
        if(DOMElem.parentNode == null || typeof DOMElem.parentNode.outerHTML == "undefined") {
            var msg = "";

            msg += "SizesResolver error: ";
            msg += "Can't determine if is percentage height on element without parentNode. ";
            msg += "Elem: " + DOMElem;
            throw new Error(msg);
        }

        var elementComputedCSS = this._getComputedCSSWithMaybePercentageSizes(DOMElem);
        return this._hasPercentageSide(elementComputedCSS.height);
    },

    getPercentageWidth: function(DOMElem) {
        var elementComputedCSS = this._getComputedCSSWithMaybePercentageSizes(DOMElem);
        return elementComputedCSS.width;
    },

    getPercentageHeight: function(DOMElem) {
        var elementComputedCSS = this._getComputedCSSWithMaybePercentageSizes(DOMElem);
        return elementComputedCSS.height;
    },

    hasPercentagePadding: function(DOMElem) {
        var elementComputedCSS = this._getComputedCSSWithMaybePercentageSizes(DOMElem);
        return this._hasPercentageSide(elementComputedCSS.paddingLeft);
    },

    getPercentagePadding: function(DOMElem) {
        var elementComputedCSS = this._getComputedCSSWithMaybePercentageSizes(DOMElem);
        return elementComputedCSS.paddingLeft;
    },

    // @todo If grid will have px padding, circular dependency could occur here. ))). Pass a flag to subcalls
    outerWidth: function(DOMElem, includeMargins, unfloored)
    {   //console.log(""); console.log(""); console.log("inspecting ELEM: ", DOMElem); // last
        includeMargins = includeMargins || false;

        var elementComputedCSS = this.getComputedCSS(DOMElem);

        if(elementComputedCSS.display === "none")
            return 0;

        var computedProperties = this.getComputedProperties("forOuterWidth", elementComputedCSS, DOMElem);

        var paddingWidth = computedProperties.paddingLeft + computedProperties.paddingRight;
        var marginWidth = computedProperties.marginLeft + computedProperties.marginRight;
        var borderWidth = computedProperties.borderLeftWidth + computedProperties.borderRightWidth;

        if(this.hasPercentagePadding(DOMElem)) { // console.log("call subfunction"); // last
            var percentagePaddingLeft = parseFloat(this.getPercentagePadding(DOMElem));
            var parentDOMElemWidth = this.outerWidth(DOMElem.parentNode);
            // console.log("return from subfunction"); // last
            var sidePaddingWidth = parentDOMElemWidth / 100 * percentagePaddingLeft;
            paddingWidth = sidePaddingWidth * 2;
        }
        else {
            // console.log("has no percentage padding"); // last
        }

        // The HTMLElement.offsetWidth read-only property returns the layout width of an element. Typically, 
        // an element's offsetWidth is a measurement which includes the element borders, the element horizontal padding, 
        // the element vertical scrollbar (if present, if rendered) and the element CSS width.
        var outerWidth = DOMElem.offsetWidth; 
        var normalizedComputedWidth = this.normalizeComputedCSSSizeValue(elementComputedCSS.width);
        // console.log("normalizedComputedWidth: ", normalizedComputedWidth); // last
        // console.log("paddingWidth: ", paddingWidth); // last
        // console.log("borderWidth: ", borderWidth); // last

        if(normalizedComputedWidth !== false)
            outerWidth = normalizedComputedWidth + ((this.isBoxSizingBorderBox(elementComputedCSS) && this.isOuterBorderBoxSizing()) ? 0 : paddingWidth + borderWidth);
        else {
            // Fix for ie8~ browsers. (No fractional parts in calculated CSS)
            if(DOMElem.parentNode != null || typeof DOMElem.parentNode.outerHTML != "undefined"
                 && this.hasPercentageWidth(DOMElem)) {
                var parentDOMElemWidth = this.outerWidth(DOMElem.parentNode);
                var DOMElemPercentageWidth = parseFloat(this.getPercentageWidth(DOMElem));
                var maybeFractionalDOMElemRealWidth = parentDOMElemWidth / 100 * DOMElemPercentageWidth;

                if(maybeFractionalDOMElemRealWidth % 1 != 0) {
                    outerWidth = Math.floor(maybeFractionalDOMElemRealWidth);
                }
            }

            outerWidth += ((this.isBoxSizingBorderBox(elementComputedCSS) && this.isOuterBorderBoxSizing())) ? 0 : paddingWidth + borderWidth;
        }
        // console.log("OUTER WIDTH: ", outerWidth); // last
        if(unfloored) {
            var parentDOMElemWidth = this.outerWidth(DOMElem.parentNode);
            var DOMElemPercentageWidth = parseFloat(this.getPercentageWidth(DOMElem));
            outerWidth = parentDOMElemWidth / 100 * DOMElemPercentageWidth + paddingWidth;
            console.log("elem outerWidth: ", outerWidth);
        }

        if(includeMargins) outerWidth += marginWidth;
        // console.log("paddingWidth: ", paddingWidth); // last
        // console.log("outerWidth: ", outerWidth);
        // console.log("marginTotalWidth: ", marginWidth);

        // msProfiler.start("has percentage width");
        // for(var i = 0; i <= 3; i++) {
        //     this.hasPercentageWidth(DOMElem);
        // }
        // msProfiler.stop();
        
        //return Math.round(outerWidth);
        // Math.floor is used here because of rounding with percentage sizes.
        // Test case: Mode = VERTICAL_GRID, GRID_WIDTH: 1077px, ITEM_WIDTH: 25% 
        //            -> add 4 Divs with default append. then transform 2x last one.
        //            -> Then transform one before last, the last one will move down.(It should stick at 
        //                  the same position.)
        //            That's happening because on second element reappening in transform, it will have
        //            rounded value of 539px. (First also has 539px). 
        //            First thing that comes in mind, is to round all values down in SizesResolver class.
        //            I want you to check this behavior -> Could this solution produce some errors? 
        //            Make observations later and ensure, if this is acceptable solution.
        //            Notices: Maybe we should round down the values when adding connections?
        //                     Could this solution affect px-based elements(I think no).
        //console.log("SizesResolver outerWidth: ", outerWidth);

        var unfloored = unfloored || false;

        if(!unfloored)
            return Math.floor(outerWidth); 
        else 
            return outerWidth;
    },

    outerHeight: function(DOMElem, includeMargins)
    {
        includeMargins = includeMargins || false;

        var elementComputedCSS = this.getComputedCSS(DOMElem);

        if(elementComputedCSS.display === "none")
            return 0;

        var computedProperties = this.getComputedProperties("forOuterHeight", elementComputedCSS, DOMElem);

        var paddingHeight = computedProperties.paddingTop + computedProperties.paddingBottom;
        var marginHeight = computedProperties.marginTop + computedProperties.marginBottom;
        var borderHeight = computedProperties.borderTopWidth + computedProperties.borderBottomWidth;

        var outerHeight = DOMElem.offsetHeight;
        var normalizedComputedHeight = this.normalizeComputedCSSSizeValue(elementComputedCSS.height);

        if(normalizedComputedHeight !== false)
            outerHeight = normalizedComputedHeight + ((this.isBoxSizingBorderBox(elementComputedCSS) && this.isOuterBorderBoxSizing()) ? 0 : paddingHeight + borderHeight);
        else {
            if(DOMElem.parentNode != null || typeof DOMElem.parentNode.outerHTML != "undefined"
                && this.hasPercentageHeight(DOMElem)) {
                var parentDOMElemHeight = this.outerHeight(DOMElem.parentNode);
                var DOMElemPercentageHeight = parseFloat(this.getPercentageHeight(DOMElem));
                var maybeFractionalDOMElemRealHeight = parentDOMElemWidth / 100 * DOMElemPercentageHeight;

                if(maybeFractionalDOMElemRealHeight % 1 != 0) {
                    outerHeight = Math.floor(maybeFractionalDOMElemRealHeight);
                }
            }

            outerHeight += ((this.isBoxSizingBorderBox(elementComputedCSS) && this.isOuterBorderBoxSizing())) ? 0 : paddingHeight + borderHeight;
        }

        if(includeMargins) outerHeight += marginHeight;

        //return Math.round(outerHeight);
        return Math.floor(outerHeight);
    },

    positionLeft: function(DOMElem)
    {
        var elementComputedCSS = this.getComputedCSS(DOMElem);

        if(elementComputedCSS.display == "none")
            return 0;

        var computedProperties = this.getComputedProperties("forPositionLeft", elementComputedCSS, DOMElem);
        return DOMElem.offsetLeft - Math.round(computedProperties.marginLeft);
    },

    positionTop: function(DOMElem)
    {
        var elementComputedCSS = this.getComputedCSS(DOMElem);

        if(elementComputedCSS.display == "none")
            return 0;

        var computedProperties = this.getComputedProperties("forPositionTop", elementComputedCSS, DOMElem);
        return DOMElem.offsetTop - Math.round(computedProperties.marginTop);
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