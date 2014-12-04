DemoLayoutBuilder.DemoLayout.GridControls.Selector = function(gridControls,
                                                              demoLayout, 
                                                              $bodyEl, 
                                                              $elementToSnap, 
                                                              snapOffset, 
                                                              selectorOptions,
                                                              selectorMinWidth,
                                                              extendedRightSideWidth,
                                                              reducedLeftSideWidth,
                                                              reverseHorizontalSnapCorner) {
    var me = this;

    this._$view = null;
    this._$bodyEl = null;
    this._demoLayout = null;

    this._gridControls = null;

    this._$elementToSnap = null;
    this._snapOffset = {
        left: 0,
        top: 0
    };
    this._selectorOptions = null;

    this._$selector = null;
    this._selectorMinWidth = 600;

    this._reducedLeftSideWidth = false;
    this._reverseHorizontalSnapCorner = false;

    this._optionLeftSide = null;
    this._optionRightSide = null;

    this._css = {
        gridControlsSelectorClass: "gridControlsSelector",
        selectorRowClass: "row",
        selectorActiveRowClass: "row-active",
        selectorSelectedRowClass: "row-selected",
        selectorHighlightedRowClass: "highlightedRow",
        selectorRowLeftSideClass: "leftSide",
        selectorReducedLeftSideWidthClass: "reducedLeftSideWidth",
        selectorRowLeftSideLabelClass: "label",
        selectorRowLeftSideSublabelClass: "sublabel",
        selectorRowRightSideClass: "rightSide",
        selectorSpacerRowClass: "spacerRow",
        selectorRowMarginBottomClass: "rowMarginBottom",
        selectorRowsSeparatorClass: "rowSeparator",

        horizontalGridLabelFirstCharColorClass: "gridFourthColor",
        verticalGridLabelFirstCharColorClass: "gridFifthColor",

        horizontalGridSelectedBorderClass: "gridFourthBorderColor",
        verticalGridSelectedBorderClass: "gridFifthBorderColor"
    };

    this._construct = function() {
        me._demoLayout = demoLayout;
        me._$bodyEl = $bodyEl;
        me._gridControls = gridControls;
        me._$elementToSnap = $elementToSnap;
        if(typeof snapOffset != "undefined")
        {
            if(typeof snapOffset.left != "undefined")
                me._snapOffset.left = snapOffset.left;
            if(typeof snapOffset.top != "undefined")
                me._snapOffset.top = snapOffset.top;
        }
        me._selectorOptions = selectorOptions;

        if(typeof selectorMinWidth == "number")
            me._selectorMinWidth = selectorMinWidth;

        me._reducedLeftSideWidth = reducedLeftSideWidth || false;
        me._reverseHorizontalSnapCorner = reverseHorizontalSnapCorner || false;
        
        me._createSelector();
        me._createSelectorRows(extendedRightSideWidth);
        me._snapToElement();
        me._bindEvents();
    }

    this._bindEvents = function() {
        $(window).on(DemoLayoutBuilder.DemoLayout.GridControls.Selector.EVENT_WINDOW_RESIZE, function() {
            me._$selector.width(me._getSelectorWidth());
            me._snapToElement();
        });

        me._$selector.find("." + me._css.selectorActiveRowClass).on("mouseenter", function() {
            if(me._demoLayout.isVerticalGrid())
                $(this).addClass(me._css.verticalGridSelectedBorderClass);
            else if(me._demoLayout.isHorizontalGrid())
                $(this).addClass(me._css.horizontalGridSelectedBorderClass);
        });

        me._$selector.find("." + me._css.selectorActiveRowClass).on("mouseleave", function() {
            if(me._demoLayout.isVerticalGrid())
                $(this).removeClass(me._css.verticalGridSelectedBorderClass);
            else if(me._demoLayout.isHorizontalGrid())
                $(this).removeClass(me._css.horizontalGridSelectedBorderClass);
        });
    }

    this._unbindEvents = function() {
        $(window).off(DemoLayoutBuilder.DemoLayout.GridControls.Selector.EVENT_WINDOW_RESIZE);
    }

    this.destruct = function() {
        if(me._optionLeftSide != null)
            me._optionLeftSide.destruct();
        if(me._optionRightSide != null)
            me._optionRightSide.destruct();

        me._unbindEvents();
        me._$view.remove();
    }

    this._construct();
    return this;
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.prototype._getOuterHeight = function() {
    var selectorHeight = 0;
    $.each(this._$view.children(), function() {
        selectorHeight += $(this).outerHeight(true);
    });

    return selectorHeight;
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.prototype._snapToElement = function() { 
    var top = this._$elementToSnap.offset().top + this._$elementToSnap.outerHeight() + this._snapOffset.top;

    if(!this._reverseHorizontalSnapCorner)
        var left = this._$elementToSnap.offset().left + this._snapOffset.left;
    else {
        var left = (this._$elementToSnap.offset().left + this._$elementToSnap.outerWidth()) - this._getSelectorWidth();
        left += this._snapOffset.left;
    }

    if(this._gridControls.areBottomControls())
        top -= this._getOuterHeight();

    this._$selector.css({left: left + "px", top: top + "px"});
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.prototype._createSelector = function() {
    this._$selector = $("<div/>");
    this._$selector.width(this._getSelectorWidth());
    this._$selector.addClass(this._css.gridControlsSelectorClass);
    this._$bodyEl.append(this._$selector);

    this._$view = this._$selector;
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.prototype._getSelectorWidth = function() {
    if(this._$elementToSnap.outerWidth() < this._selectorMinWidth)
        return this._selectorMinWidth;
    else
        return this._$elementToSnap.outerWidth();
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.prototype._createSelectorRows = function(extendedRightSideWidth) {
    // var $spacerRow = $("<div/>");
    // $spacerRow.addClass(this._css.selectorSpacerRowClass);
    // this._$selector.append($spacerRow);

    for(var i = 0; i < this._selectorOptions.length; i++)
    {
        var $row = $("<div/>");
        $row.addClass(this._css.selectorRowClass);

        if(i % 2 != 0) 
            $row.addClass(this._css.selectorHighlightedRowClass);
        if(this._selectorOptions[i].isSelected) {

            if(this._demoLayout.isVerticalGrid())
                $row.addClass(this._css.verticalGridSelectedBorderClass);
            else if(this._demoLayout.isHorizontalGrid())
                $row.addClass(this._css.horizontalGridSelectedBorderClass);

            $row.addClass(this._css.selectorSelectedRowClass);
        }
        else
            $row.addClass(this._css.selectorActiveRowClass);

        if(i > 0)
            $row.addClass(this._css.selectorRowsSeparatorClass);
        this._$selector.append($row);

        var $leftSide = $("<div/>");
        $leftSide.addClass(this._css.selectorRowLeftSideClass);

        if(this._reducedLeftSideWidth)
            $leftSide.addClass(this._css.selectorReducedLeftSideWidthClass);

        var $leftSideLabel = $("<div/>");
        $leftSideLabel.addClass(this._css.selectorRowLeftSideLabelClass);

        var leftSideLabelFirstChar = this._selectorOptions[i].optionLabel.charAt(0); 
        var leftSideLabelRestChars = this._selectorOptions[i].optionLabel.substr(1);
        if(this._demoLayout.isVerticalGrid())
            var $highlightedFirstChar = $("<span/>").addClass(this._css.verticalGridLabelFirstCharColorClass);
        else if(this._demoLayout.isHorizontalGrid())
            var $highlightedFirstChar = $("<span/>").addClass(this._css.horizontalGridLabelFirstCharColorClass);
        $highlightedFirstChar.text(leftSideLabelFirstChar);

        $leftSideLabel.append($highlightedFirstChar).append(leftSideLabelRestChars);

        var $leftSideSublabel = $("<div/>");
        $leftSideSublabel.addClass(this._css.selectorRowLeftSideSublabelClass);
        $leftSideSublabel.html(this._selectorOptions[i].optionSublabel);

        $leftSide.append($leftSideLabel).append($leftSideSublabel);

        var $rightSide = $("<div/>");
        $rightSide.addClass(this._css.selectorRowRightSideClass);
        if(typeof extendedRightSideWidth == "number")
            $rightSide.css("width", extendedRightSideWidth + "px");

        $row.append($leftSide); 
        $row.append($rightSide);

        this._optionRightSide = this._selectorOptions[i].createOptionRightSide($rightSide);
        // Events are listended in right side, so we should create it before leftSide
        if(typeof this._selectorOptions[i].createOptionLeftSide != "undefined")
            this._optionLeftSide = this._selectorOptions[i].createOptionLeftSide($leftSide);

        var $rowMarginBottom = $("<div/>");
        $rowMarginBottom.addClass(this._css.selectorRowMarginBottomClass);
        $row.append($rowMarginBottom);

        $row.on("click", this._selectorOptions[i].selectHandler);
    }

    // var $spacerRow = $("<div/>");
    // $spacerRow.addClass(this._css.selectorSpacerRowClass);
    // this._$selector.append($spacerRow);
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.EVENT_WINDOW_RESIZE = "resize.demoLayoutBuilder.demoLayout.GridControls.Selector";

DemoLayoutBuilder.DemoLayout.GridControls.Selector.prototype.getView = function() {
    return this._$view;
}