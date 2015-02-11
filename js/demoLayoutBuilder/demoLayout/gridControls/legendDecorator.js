DemoLayoutBuilder.DemoLayout.GridControls.LegendDecorator = function(demoLayout, gridControls, viewParams) {
    var me = this;

    this._$view = null;

    this._demoLayout = null;
    this._gridControls = null;

    this._viewParams = null;

    this._css = {
        legendDefaultTextClass: "defaultText",
        legendHighlightedTextClass: "highlightedText",
        sublabelTextClass: "sublabelText",
        selectorIconClass: "selectorIcon",

        verticalGridLegendSublabelTextClass: "gridFifthColor",
        horizontalGridLegendSublabelTextClass: "gridFourthColor"
    };

    this._legendPrefixes = {
        mirroredPrepend: "Mirrored",
        reversedPrepend: "Reversed",
        defaultPrepend: "Default",

        defaultAppend: "Default",
        reversedAppend: "Reversed",

        batchSize: "Batch",
        toggle: "Toggle",
        sort: "Sort",
        filter: "Filter"
    };

    this._legendPostfixes = {
        prepend: "prepend",
        append: "append",

        batchSize: "size",
        "function": "function"
    };

    this._construct = function() {
        me._demoLayout = demoLayout;
        me._gridControls = gridControls;

        me._viewParams = viewParams;

        this._bindEvents();
    }

    this._bindEvents = function() {

    }

    this._unbindEvents = function() {

    }

    this.destruct = function() {
        me._unbindEvents();
    }

    this._construct();
    return this;
}

DemoLayoutBuilder.DemoLayout.GridControls.LegendDecorator.prototype._createSelectorIcon = function($control) {
    var $selector = $("<div/>");
    $selector.addClass(this._css.selectorIconClass);
    $selector.addClass(this._viewParams.selectorBorderColorClass);
    $control.append($selector);
}

DemoLayoutBuilder.DemoLayout.GridControls.LegendDecorator.prototype.decoratePrependControl = function($prependControl) {
    var $legendDefaultText = $prependControl.find("." + this._css.legendDefaultTextClass);
    var $legendHighlightedText = $prependControl.find("." + this._css.legendHighlightedTextClass);

    if(this._demoLayout.isDefaultPrependGrid())
        var legendHighlightedText = this._legendPrefixes.defaultPrepend;
    else if(this._demoLayout.isReversedPrependGrid())
        var legendHighlightedText = this._legendPrefixes.reversedPrepend;
    else if(this._demoLayout.isMirroredPrependGrid())
        var legendHighlightedText = this._legendPrefixes.mirroredPrepend;

    $legendHighlightedText.text(legendHighlightedText);
    $legendDefaultText.text(this._legendPostfixes.prepend);
}

DemoLayoutBuilder.DemoLayout.GridControls.LegendDecorator.prototype.decorateAppendControl = function($appendControl) {
    var $legendDefaultText = $appendControl.find("." + this._css.legendDefaultTextClass);
    var $legendHighlightedText = $appendControl.find("." + this._css.legendHighlightedTextClass);

    if(this._demoLayout.isDefaultAppendGrid())
        var legendHighlightedText = this._legendPrefixes.defaultAppend;
    else if(this._demoLayout.isReversedAppendGrid())
        var legendHighlightedText = this._legendPrefixes.reversedAppend;

    $legendHighlightedText.text(legendHighlightedText);
    $legendDefaultText.text(this._legendPostfixes.append);
}

DemoLayoutBuilder.DemoLayout.GridControls.LegendDecorator.prototype.decorateBatchSizeControl = function($batchSizeControl) {
    var $legendDefaultText = $batchSizeControl.find("." + this._css.legendDefaultTextClass);
    var $legendHighlightedText = $batchSizeControl.find("." + this._css.legendHighlightedTextClass);

    $legendHighlightedText.text(this._legendPrefixes.batchSize);
    $legendDefaultText.text(this._legendPostfixes.batchSize);

    this._createSelectorIcon($batchSizeControl);
}

DemoLayoutBuilder.DemoLayout.GridControls.LegendDecorator.prototype.decorateToggleControl = function($toggleControl) {
    var $legendDefaultText = $toggleControl.find("." + this._css.legendDefaultTextClass);
    var $legendHighlightedText = $toggleControl.find("." + this._css.legendHighlightedTextClass);

    $legendHighlightedText.text(this._legendPrefixes.toggle);
    $legendDefaultText.text(this._legendPostfixes["function"]);

    this._createSelectorIcon($toggleControl);
}

DemoLayoutBuilder.DemoLayout.GridControls.LegendDecorator.prototype.decorateSortControl = function($sortControl) {
    var $legendDefaultText = $sortControl.find("." + this._css.legendDefaultTextClass);
    var $legendHighlightedText = $sortControl.find("." + this._css.legendHighlightedTextClass);

    $legendHighlightedText.text(this._legendPrefixes.sort);
    $legendDefaultText.text(this._legendPostfixes["function"]);

    this._createSelectorIcon($sortControl);
}

DemoLayoutBuilder.DemoLayout.GridControls.LegendDecorator.prototype.decorateFilterControl = function($filterControl) {
    var $legendDefaultText = $filterControl.find("." + this._css.legendDefaultTextClass);
    var $legendHighlightedText = $filterControl.find("." + this._css.legendHighlightedTextClass);

    $legendHighlightedText.text(this._legendPrefixes.filter);
    $legendDefaultText.text(this._legendPostfixes["function"]);

    this._createSelectorIcon($filterControl);
}

DemoLayoutBuilder.DemoLayout.GridControls.LegendDecorator.prototype.decorateLegendSublabels = function(controls) {
    for(var i = 0; i < controls.length; i++)
    {
        var $legendSublabel = controls[i].find("." + this._css.sublabelTextClass);

        if(this._demoLayout.isVerticalGrid())
            $legendSublabel.addClass(this._css.verticalGridLegendSublabelTextClass);
        else if(this._demoLayout.isHorizontalGrid())
            $legendSublabel.addClass(this._css.horizontalGridLegendSublabelTextClass);
    }
}

DemoLayoutBuilder.DemoLayout.GridControls.LegendDecorator.prototype.setControlSublabel = function($control, text) {
    $control.find("." + this._css.sublabelTextClass).text(text);
}