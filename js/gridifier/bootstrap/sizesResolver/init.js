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