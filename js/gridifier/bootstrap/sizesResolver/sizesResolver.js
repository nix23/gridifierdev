var SizesResolver = {
    getComputedCSS: null,
    _getProps: {
        forOw: [
            "paddingLeft", "paddingRight", "marginLeft", "marginRight",
            "borderLeftWidth", "borderRightWidth"
        ],
        forOh: [
            "paddingTop", "paddingBottom", "marginTop", "marginBottom",
            "borderTopWidth", "borderBottomWidth"
        ],
        forPosLeft: [
            "marginLeft"
        ],
        forPosTop: [
            "marginTop"
        ]
    },
    _prefixedProps: {
        "boxSizing": null
    },
    _borderBoxType: null,
    _borderBoxTypes: {OUTER: 0, INNER: 1},
    _ptValsCalcType: null,
    _ptValsCalcTypes: {BROWSER: 0, RECALC: 1},
    recalcPtWidthFn: function(item, includeMargins, disablePtCSSRecalc, disableBordersCalc) {
        return this.outerWidth(item, includeMargins, disablePtCSSRecalc, disableBordersCalc);
    },
    recalcPtHeightFn: function(item, includeMargins, disablePtCSSRecalc, disableBordersCalc) {
        return this.outerHeight(item, includeMargins, disablePtCSSRecalc, disableBordersCalc);
    },
    _lastRawWidth: null,
    _lastRawHeight: null,
    _lastBorderWidth: null,
    _lastBorderHeight: null,
    _hasLastBorderBox: false,

    init: function() {
        this.getComputedCSS = this._getComputedCSSFn();
        this._findPrefixedProps();
        this._findBorderBoxType(Dom.div());
        this._findPtValsCalcType(Dom.div(), Dom.div());
    },

    clearRecursiveSubcallsData: function() {
        this._lastRawWidth = null;
        this._lastRawHeight = null;
        this._lastBorderWidth = null;
        this._lastBorderHeight = null;
        this._hasLastBorderBox = false;
    },

    _areBrowserPtVals: function() {
        return this._ptValsCalcType == this._ptValsCalcTypes.BROWSER;
    },

    _areRecalcPtVals: function() {
        return this._ptValsCalcType == this._ptValsCalcTypes.RECALC;
    },

    getUncomputedCSS: function(item) {
        var parentItemClone = item.parentNode.cloneNode();
        var itemClone = item.cloneNode();

        parentItemClone.appendChild(itemClone);
        parentItemClone.style.display = "none";
        
        var parentItemParent = (item.parentNode.nodeName == "HTML") ? item.parentNode : item.parentNode.parentNode;
        parentItemParent.appendChild(parentItemClone);
        
        var uncomputedCSSSource = this.getComputedCSS(itemClone);
        var uncomputedCSS = {};

        var props = ["paddingLeft", "paddingRight", "paddingTop", "paddingBottom",
                     "marginLeft", "marginRight", "marginTop", "marginBottom",
                     "width", "height"];
        for(var i = 0; i < props.length; i++)
            uncomputedCSS[props[i]] = uncomputedCSSSource[props[i]];
        
        parentItemParent.removeChild(parentItemClone);
        
        return uncomputedCSS;
    },

    _ensureHasParentNode: function(item) {
        if(item.parentNode == null || !Dom.hasOwnProp(item.parentNode, "innerHTML"))
            err("no parentNode");
    },

    _ensureHasComputedProp: function(itemComputedCSS, prop) {
        if(!(prop in itemComputedCSS))
            err("no prop " + prop);
    },

    _hasPtCSSVal: function(cssProp, item, itemComputedCSS) {
        var tester = function(cssProp, item, itemComputedCSS) {
            this._ensureHasParentNode(item);

            itemComputedCSS = itemComputedCSS || this.getUncomputedCSS(item);
            this._ensureHasComputedProp(itemComputedCSS, cssProp);

            var ptValRegex = new RegExp("(.*\\d)%$");
            return ptValRegex.test(itemComputedCSS[cssProp]);
        }

        if(Dom.isArray(cssProp)) {
            for(var i = 0; i < cssProp.length; i++) {
                if(tester.call(this, cssProp[i], item, itemComputedCSS))
                    return true;
            }

            return false;
        }
        else
            return tester.call(this, cssProp, item, itemComputedCSS);
    },

    _getPtCSSVal: function(cssProp, item, itemComputedCSS) {
        this._ensureHasParentNode(item);

        itemComputedCSS = itemComputedCSS || this.getUncomputedCSS(item);
        this._ensureHasComputedProp(itemComputedCSS, cssProp);

        return itemComputedCSS[cssProp];
    },

    _recalcPtVal: function(item,
                           parentItemSize,
                           uncomputedProps,
                           propName) {
        var ptSize = parseFloat(this._getPtCSSVal(propName, item, uncomputedProps));
        return parentItemSize / 100 * ptSize;
    },

    _recalcTwoSidePropPtVals: function(item,
                                       parentItemWidth,
                                       computedProps,
                                       uncomputedProps,
                                       cssPropPrefix,
                                       verticalSides) {
        var firstSideProp = cssPropPrefix + ((verticalSides) ? "Top" : "Left");
        var secondSideProp = cssPropPrefix + ((verticalSides) ? "Bottom" : "Right");
        var firstSideVal = computedProps[firstSideProp];
        var secondSideVal = computedProps[secondSideProp];

        if(this._hasPtCSSVal(firstSideProp, item, uncomputedProps))
            firstSideVal = this._recalcPtVal(item, parentItemWidth, uncomputedProps, firstSideProp);
        if(this._hasPtCSSVal(secondSideProp, item, uncomputedProps))
            secondSideVal = this._recalcPtVal(item, parentItemWidth, uncomputedProps, secondSideProp);

        return firstSideVal + secondSideVal;
    },

    _isDefBoxSizing: function(itemComputedCSS) {
        var boxSizingProp = this._prefixedProps.boxSizing;
        if(boxSizingProp && itemComputedCSS[boxSizingProp]
            && itemComputedCSS[boxSizingProp] === "border-box")
            return true;

        return false;
    },

    _isOuterBoxSizing: function() {
        return this._borderBoxType === this._borderBoxTypes.OUTER;
    },

    // Based on http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291
    // and http://javascript.info/tutorial/styles-and-classes-getcomputedstyle.
    // IE currentStyle returns cascaded style instead of computed style,
    // so if we have unit other than px, we should recalculate it in px.
    _isCascadedCSSVal: function(CSSValue) {
        return (window.getComputedStyle || CSSValue.indexOf("px") !== -1) ? false : true;
    },

    _cascadedToComputed: function(item, CSSValue, itemComputedCSS) {
        // Check value auto, medium, etc...
        var atLeastOneDigitRegex = new RegExp("(?=.*\\d)");
        if(!atLeastOneDigitRegex.test(CSSValue))
            return CSSValue;

        var inlineStyle = item.style;
        var runtimeStyle = item.runtimeStyle;

        var inlineStyleLeft = inlineStyle.left;
        var runtimeStyleLeft = runtimeStyle && runtimeStyle.left;

        if(runtimeStyleLeft)
            runtimeStyle.left = itemComputedCSS.left;

        inlineStyle.left = CSSValue;
        CSSValue = inlineStyle.pixelLeft;

        inlineStyle.left = inlineStyleLeft;
        if(runtimeStyleLeft)
            runtimeStyle.left = runtimeStyleLeft;

        return CSSValue;
    },

    _normalizeComputedCSS: function(postfixedSizeValue) {
        var sizeValue = parseFloat(postfixedSizeValue);
        var canBeParsedAsNumber = postfixedSizeValue.indexOf("%") === -1 && !isNaN(sizeValue);
        
        return (canBeParsedAsNumber) ? sizeValue : false;
    },

    _getComputedProps: function(getPropsType, itemComputedCSS, item) {
        var computedProps = {};

        for(var i = 0; i < this._getProps[getPropsType].length; i++) {
            var propName = this._getProps[getPropsType][i];
            var propVal = itemComputedCSS[propName];

            if(this._isCascadedCSSVal(propVal))
                propVal = this._cascadedToComputed(item, propVal, itemComputedCSS);
            propVal = parseFloat(propVal);
            propVal = isNaN(propVal) ? 0 : propVal;

            computedProps[propName] = propVal;
        }

        return computedProps;
    },


    positionLeft: function(item) {
        var itemComputedCSS = this.getComputedCSS(item);
        if(itemComputedCSS.display == "none")
            return 0;

        var computedProps = this._getComputedProps("forPosLeft", itemComputedCSS, item);
        return item.offsetLeft - computedProps.marginLeft;
    },

    positionTop: function(item) {
        var itemComputedCSS = this.getComputedCSS(item);
        if(itemComputedCSS.display == "none")
            return 0;

        var computedProps = this._getComputedProps("forPosTop", itemComputedCSS, item);
        return item.offsetTop - computedProps.marginTop;
    },

    offsetLeft: function(item) {
        var clientRect = item.getBoundingClientRect();
        var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        return clientRect.left + scrollLeft;
    },

    offsetTop: function(item) {
        var clientRect = item.getBoundingClientRect();
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        return clientRect.top + scrollTop;
    },

    cloneComputedStyle: function(source, target) {
        var camelize = function(text) {
            return text.replace(/-+(.)?/g, function(match, chr) {
                return chr ? chr.toUpperCase() : '';
            });
        };

        var sourceCompCSS = this.getComputedCSS(source);

        for(var prop in sourceCompCSS) {
            if(prop == "cssText")
                continue;

            var propName = camelize(prop);
            if(target.style[propName] != sourceCompCSS[propName])
                target.style[propName] = sourceCompCSS[propName];
        }

        this._reclone(sourceCompCSS, target);
    },

    _reclone: function(sourceCompCSS, target) {
        // Some properties could be overwritten by further rules.
        // For example in FF/IE borders are overwritten by some from further rules.
        var propsToReclone = ["font", "fontSize", "fontWeight", "lineHeight"];
        var borderProps = ["Width", "Color", "Style"];
        var borderSides = ["Left", "Right", "Top", "Bottom"];
        for(var i = 0; i < borderProps.length; i++) {
            for(var j = 0; j < borderSides.length; j++)
                propsToReclone.push("border" + borderSides[j] + borderProps[i]);
        }

        for(var i = 0; i < propsToReclone.length; i++) {
            var propName = propsToReclone[i];
            if(typeof sourceCompCSS[propName] != "undefined" &&
                target.style[propName] != sourceCompCSS[propName])
                target.style[propName] = sourceCompCSS[propName];
        }
    }
}