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
    DOMElem: null,
    getComputedCSS: null,
    elementComputedCSS: null,
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

    outerWidth: function(DOMElem, includeMargins)
    {
        includeMargins = includeMargins || false;
        this.DOMElem = DOMElem;
        this.elementComputedCSS = this.getComputedCSS(DOMElem);

        if(this.elementComputedCSS.display === "none")
            return 0;

        var computedProperties = this.getComputedProperties("forOuterWidth");

        var paddingWidth = computedProperties.paddingLeft + computedProperties.paddingRight;
        var marginWidth = computedProperties.marginLeft + computedProperties.marginRight;
        var borderWidth = computedProperties.borderLeftWidth + computedProperties.borderRightWidth;

        var outerWidth = DOMElem.offsetWidth;
        var normalizedComputedWidth = this.normalizeComputedCSSSizeValue(this.elementComputedCSS.width);

        if(normalizedComputedWidth !== false)
            outerWidth = normalizedComputedWidth + ((this.isBoxSizingBorderBox() && this.isOuterBorderBoxSizing()) ? 0 : paddingWidth + borderWidth);
        if(includeMargins) outerWidth += marginWidth;

        return Math.round(outerWidth);
    },

    outerHeight: function(DOMElem, includeMargins)
    {
        includeMargins = includeMargins || false;
        this.DOMElem = DOMElem;
        this.elementComputedCSS = this.getComputedCSS(DOMElem);

        if(this.elementComputedCSS.display === "none")
            return 0;

        var computedProperties = this.getComputedProperties("forOuterHeight");

        var paddingHeight = computedProperties.paddingTop + computedProperties.paddingBottom;
        var marginHeight = computedProperties.marginTop + computedProperties.marginBottom;
        var borderHeight = computedProperties.borderTopWidth + computedProperties.borderBottomWidth;

        var outerHeight = DOMElem.offsetHeight;
        var normalizedComputedHeight = this.normalizeComputedCSSSizeValue(this.elementComputedCSS.height);

        if(normalizedComputedHeight !== false)
            outerHeight = normalizedComputedHeight + ((this.isBoxSizingBorderBox() && this.isOuterBorderBoxSizing()) ? 0 : paddingHeight + borderHeight);
        if(includeMargins) outerHeight += marginHeight;

        return Math.round(outerHeight);
    },

    positionLeft: function(DOMElem)
    {
        this.DOMElem = DOMElem;
        this.elementComputedCSS = this.getComputedCSS(DOMElem);

        if(this.elementComputedCSS.display == "none")
            return 0;

        var computedProperties = this.getComputedProperties("forPositionLeft");
        return DOMElem.offsetLeft - Math.round(computedProperties.marginLeft);
    },

    positionTop: function(DOMElem)
    {
        this.DOMElem = DOMElem;
        this.elementComputedCSS = this.getComputedCSS(DOMElem);

        if(this.elementComputedCSS.display == "none")
            return 0;

        var computedProperties = this.getComputedProperties("forPositionTop");
        return DOMElem.offsetTop - Math.round(computedProperties.marginTop);
    },

    getComputedProperty: function(DOMElem, propertyName)
    {
        this.DOMElem = DOMElem;
        this.elementComputedCSS = this.getComputedCSS(DOMElem);

        return this.elementComputedCSS[propertyName];
    },

    isBoxSizingBorderBox: function()
    {
        var boxSizingProperty = this.maybePrefixedProperties.boxSizing;
        if(boxSizingProperty && this.elementComputedCSS[boxSizingProperty]
            && this.elementComputedCSS[boxSizingProperty] === "border-box")
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

    transformFromCascadedToComputedStyle: function(DOMElem, CSSValue)
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
            runtimeStyle.left = this.elementComputedCSS.left;

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

    getComputedProperties: function(propertiesToGetType)
    {
        var computedProperties = {};

        for(var i = 0; i < this.propertiesToGet[propertiesToGetType].length; i++)
        {
            var propertyName = this.propertiesToGet[propertiesToGetType][i];
            var propertyValue = this.elementComputedCSS[propertyName];

            if(this.isCascadedCSSValue(propertyValue))
                propertyValue = this.transformFromCascadedToComputedStyle(this.DOMElem, propertyValue);
            propertyValue = parseFloat(propertyValue);
            propertyValue = isNaN(propertyValue) ? 0 : propertyValue;

            computedProperties[propertyName] = propertyValue;
        }

        return computedProperties;
    }
}
SizesResolver.init();