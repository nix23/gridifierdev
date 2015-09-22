SizesResolver.getComputedCSSFunction = function() {
    if(window.getComputedStyle) {
        return function(item) {
            return window.getComputedStyle(item, null);
        }
    }
    else {
        return function(item) {
            return item.currentStyle;
        }
    }
};

SizesResolver._findPrefixedProps = function() {
    this._prefixedProps.boxSizing = Prefixer.get("boxSizing");
};

// based on http://connect.microsoft.com/IE/feedback/details/695683/dimensions-returned-by-getcomputedstyle-are-wrong-if-element-has-box-sizing-border-box.
// At least IE10 and FF7 returns computed width and height without padding and borders, so we should determine sizes calculation type here.
// Looks like 'workaround', but bootstrap inspired me.(They use similar aproach as in Dom.isBrowserSupportingTransitions
// to detect if browser is supporting transitions, they are using so-called testerEl).
SizesResolver._findBorderBoxType = function() {
    var tester = Dom.div();

    Dom.css.set(tester, {
        width: "100px",
        padding: "10px 20px",
        borderWidth: "10px 20px",
        borderStyle: "solid"
    });

    var boxSizingProp = this._prefixedProps.boxSizing;
    tester.style[boxSizingProp] = "border-box";

    var root = document.body || document.documentElement;
    root.appendChild(tester);

    var testerComputedCSS = this.getComputedCSS(tester);
    if(this._normalizeComputedCSS(testerComputedCSS.width) === 100)
        this._borderBoxType = this._borderBoxTypes.OUTER;
    else
        this._borderBoxType = this._borderBoxTypes.INNER;

    root.removeChild(tester);
};

SizesResolver._findPtValsCalcType = function() {
    var testerWrap = Dom.div();

    Dom.css.set(testerWrap, {
        width: "1178px",
        height: "300px",
        position: "absolute",
        left: "-9000px",
        top: "0px",
        visibility: "hidden"
    });

    var root = document.body || document.documentElement;
    root.appendChild(testerWrap);

    var tester = Dom.div();
    Dom.css.set(tester, {
        width: "10%",
        height: "200px"
    });
    testerWrap.appendChild(tester);

    var expectedOw = 117.796875.toFixed(1);
    var ow = parseFloat(this.outerWidth(tester, true)).toFixed(1);
    this._ptValsCalcType = (expectedOw == ow) ? this._ptValsCalcTypes.BROWSER : this._ptValsCalcTypes.RECALC;

    root.removeChild(testerWrap);
};