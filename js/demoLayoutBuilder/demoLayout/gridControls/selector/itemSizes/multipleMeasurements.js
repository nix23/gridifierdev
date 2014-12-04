DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize = function($selectorRightSide, 
                                                                                           demoLayout, 
                                                                                           sliderChangeHandler,
                                                                                           measurementValue,
                                                                                           measurementType) {
    var me = this;

    this._$view = null;

    this._demoLayout = null;

    this._$measurementsMenu = null;
    this._$measurementsMenuPixelTab = null;
    this._$measurementsMenuPercentTab = null;

    this._openedMenuTab = null;

    this._$pixelMeasurementAccordionTab = null;
    this._$percentMeasurementAccordionTab = null;

    this._$selectedValueDemonstrator = null;
    this._$selectedValueDemonstratorValue = null;

    // Pixels measurement tab items
    this._$itemRangesSelector = null;
    this._itemRangesSelectorOptions = [];
    this._itemRangesSelectorOptionsCount = 12;
    this._selectedItemRangeSelectorOptionIndex = null;

    this._$itemSizeSlider = null;
    this._reinitItemSizeSlider = false; 

    this._ranges = [
        {from: 1, to: 99, step: 1}, 
        {from: 100, to: 199, step: 1},
        {from: 200, to: 299, step: 1},
        {from: 300, to: 399, step: 1},
        {from: 400, to: 499, step: 1},
        {from: 500, to: 599, step: 1},
        {from: 600, to: 699, step: 1},
        {from: 700, to: 799, step: 1},
        {from: 800, to: 899, step: 1},
        {from: 900, to: 999, step: 1},
        {from: 1000, to: 1500, step: 5},
        {from: 1500, to: 2000, step: 5}
    ];

    // Percents measurement tab items
    this._$percentsMeasurementItemSizeSlider = null;

    this._measurementsAccordion = null;
    this._measurementsAccordionItemIds = {
        pixelMeasurement: "multipleMeasurementPixelsTab",
        percentMeasurement: "multipleMeasurementPercentsTab"
    }

    this._sliderChangeHandler = null;

    this._css = {
        containerClass: "multipleMeasurementsItemSize",

        measurementsMenuClass: "measurementsMenu",
        measurementsMenuPixelTabClass: "tab pixelsTab",
        measurementsMenuPercentTabClass: "tab percentsTab",

        verticalGridSelectedMenuTab: "selectedTab gridFifthBg",
        horizontalGridSelectedMenuTab: "selectedTab gridFourthBg",

        pixelMeasurementAccordionTabClass: "accordionPixelsTab",
        percentMeasurementAccordionTabClass: "accordionPercentsTab",

        selectedValueDemonstratorClass: "multipleMeasurementsItemSizeSelectedValueDemonstrator",

        demonstratorHeightArrowClass: "heightArrow",
        demonstratorHeightArrowTopClass: "top",
        demonstratorHeightArrowMiddleClass: "middle",
        demonstratorHeightArrowBottomClass: "bottom",
        demonstratorHeightContentClass: "heightContent",
        demonstratorHeightValueClass: "heightValue",

        demonstratorWidthArrowClass: "widthArrow",
        demonstratorWidthArrowLeftClass: "left",
        demonstratorWidthArrowCenterClass: "center",
        demonstratorWidthArrowRightClass: "right",
        demonstratorWidthContentClass: "widthContent",
        demonstratorWidthValueClass: "widthValue",

        itemRangesSelectorClass: "itemRangesSelector",
        itemRangesSelectorOptionClass: "option",
        itemRangesSelectorHighlightedOptionClass: "",
        itemRangesSelectorOptionMarginClass: "optionMargin",

        verticalGridLeftBorderColorClass: "gridFifthLeftBorderColor",
        verticalGridBottomBorderColorClass: "gridFifthBottomBorderColor",
        verticalGridRightBorderColorClass: "gridFifthRightBorderColor",
        verticalGridTopBorderColorClass: "gridFifthTopBorderColor",

        horizontalGridLeftBorderColorClass: "gridFourthLeftBorderColor",
        horizontalGridBottomBorderColorClass: "gridFourthBottomBorderColor",
        horizontalGridRightBorderColorClass: "gridFourthRightBorderColor",
        horizontalGridTopBorderColorClass: "gridFourthTopBorderColor",

        verticalGridBgClass: "gridFifthBg",
        horizontalGridBgClass: "gridFourthBg",

        verticalGridSelectedItemRangeSelectorOptionClass: "gridFifthBg selectedOption",
        horizontalGridSelectedItemRangeSelectorOptionClass: "gridFourthBg selectedOption",

        sliderClass: "slider",
        sliderMarginClass: "sliderMargin",

        sliderPipValuesPostfixClass: "sliderPipValuePostfix",

        horizontalGridSliderClass: "horizontalNoUiSlider",
        verticalGridSliderClass: "verticalNoUiSlider"
    }

    this._construct = function() {
        me._demoLayout = demoLayout;
        me._sliderChangeHandler = sliderChangeHandler;

        me._$view = $("<div/>").addClass(me._css.containerClass);
       
        me._createMeasurementsMenu();

        me._createPixelMeasurementAccordionTab();
        me._createPercentMeasurementAccordionTab();

        me._createItemSizesRangesSelector();
        me._createItemSizesSlider();
        me._createPercentsSizesSlider();

        $selectorRightSide.append(me._$view);

        me._measurementsAccordion = new Accordion(me._$view);

        me._createSelectedValueDemonstrator(measurementType);
        me._bindEvents();

        if(me._isPixelsMeasurementValue(measurementValue)) {
            me._selectPixelsMenuTab();
            me._findRangeSelectorOptionByMeasurementValue(measurementValue);
            var $option = me._itemRangesSelectorOptions[me._selectedItemRangeSelectorOptionIndex - 1];
            me._selectItemSizeRangeSelectorOption($option);
            me._initItemSizeSliderValues(parseInt(measurementValue, 10));
            me._initPercentsSizeSliderValues(1);
            me._$itemSizeSlider.trigger("slide");
        }
        else if(me._isPercentsMeasurementValue(measurementValue)) { 
            me._selectPercentMenuTab();
            var $option = me._itemRangesSelectorOptions[1];
            me._selectItemSizeRangeSelectorOption($option);
            me._initItemSizeSliderValues(100);
            me._initPercentsSizeSliderValues(parseInt(measurementValue, 10));
            me._$measurementsMenuPercentTab.trigger("click");
            me._$percentsMeasurementItemSizeSlider.trigger("slide");
        }
    }

    this._bindEvents = function() {
        me._$measurementsMenuPixelTab.on("mouseenter", function() {
            if(me._isPixelsMenuTabOpened()) return;
            me._highlightPixelsMenuTab();
        });

        me._$measurementsMenuPixelTab.on("mouseleave", function() {
            if(me._isPixelsMenuTabOpened()) return;
            me._unhighlightPixelsMenuTab();
        });

        me._$measurementsMenuPercentTab.on("mouseenter", function() {
            if(me._isPercentsMenuTabOpened()) return;
            me._highlightPercentsMenuTab();
        });

        me._$measurementsMenuPercentTab.on("mouseleave", function() {
            if(me._isPercentsMenuTabOpened()) return;
            me._unhighlightPercentsMenuTab();
        });

       me._$measurementsMenuPixelTab.on("click", function() {
            me._unsetSelectedMenuTab();
            me._selectPixelsMenuTab();
            me._measurementsAccordion.selectItem(me._measurementsAccordionItemIds.pixelMeasurement);
       }); 

       me._$measurementsMenuPercentTab.on("click", function() {
            me._unsetSelectedMenuTab();
            me._selectPercentMenuTab();
            me._measurementsAccordion.selectItem(me._measurementsAccordionItemIds.percentMeasurement);
       });

        for(var i = 0; i < me._itemRangesSelectorOptions.length; i++)
        {
            var $itemRangeSelectorOption = me._itemRangesSelectorOptions[i];
            $itemRangeSelectorOption.on("mouseenter", function() {
                if(me._isRangeSelectorOptionSelected($(this))) return;
                me._highlightItemSizeRangeSelectorOption($(this));
            });

            $itemRangeSelectorOption.on("mouseleave", function() {
                if(me._isRangeSelectorOptionSelected($(this))) return;
                me._unhighlightItemSizeRangeSelectorOption($(this));
            });

            $itemRangeSelectorOption.on("click", function() {
                if(me._isRangeSelectorOptionSelected($(this))) return;
                var $option = me._$view.find("[data-selectorOption=" + me._selectedItemRangeSelectorOptionIndex + "]");
                me._unselectItemSizeRangeSelectorOption($option);
                me._selectItemSizeRangeSelectorOption($(this));
                me._initItemSizeSliderValues(me._ranges[me._selectedItemRangeSelectorOptionIndex - 1].from);
            });
        }
    }

    this._unbindEvents = function() {
    }

    this.destruct = function() {
        me._unbindEvents();
    }

    this._construct();
    return this;
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.MEASUREMENT_TYPES = {
    WIDTH: 0, HEIGHT: 1
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.MENU_TABS = {
    PIXELS: 0, PERCENTS: 1
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.prototype._isPixelsMeasurementValue = function(measurementValue) {
    var pattern = new RegExp("px");
    return pattern.test(measurementValue);
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.prototype._isPercentsMeasurementValue = function(measurementValue) {
    var pattern = new RegExp("%");
    return pattern.test(measurementValue);
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.prototype._unsetSelectedMenuTab = function() {
    if(this._isPixelsMenuTabOpened())
    {
        this._$measurementsMenuPixelTab.removeClass(this._css.verticalGridSelectedMenuTab);
        this._$measurementsMenuPercentTab.removeClass(this._css.verticalGridSelectedMenuTab);

        this._$measurementsMenuPixelTab.removeClass(this._css.horizontalGridSelectedMenuTab);
        this._$measurementsMenuPercentTab.removeClass(this._css.horizontalGridSelectedMenuTab);
    }
    else if(this._isPercentsMenuTabOpened())
    {
        this._$measurementsMenuPixelTab.removeClass(this._css.verticalGridSelectedMenuTab);
        this._$measurementsMenuPercentTab.removeClass(this._css.verticalGridSelectedMenuTab);

        this._$measurementsMenuPixelTab.removeClass(this._css.horizontalGridSelectedMenuTab);
        this._$measurementsMenuPercentTab.removeClass(this._css.horizontalGridSelectedMenuTab);
    }

    this._openedMenuTab = null;
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.prototype._unhighlightPixelsMenuTab = function() {
    if(this._demoLayout.isVerticalGrid())
        this._$measurementsMenuPixelTab.removeClass(this._css.verticalGridSelectedMenuTab);
    else if(this._demoLayout.isHorizontalGrid())
        this._$measurementsMenuPixelTab.removeClass(this._css.horizontalGridSelectedMenuTab);
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.prototype._unhighlightPercentsMenuTab = function() {
    if(this._demoLayout.isVerticalGrid())
        this._$measurementsMenuPercentTab.removeClass(this._css.verticalGridSelectedMenuTab);
    else if(this._demoLayout.isHorizontalGrid())
        this._$measurementsMenuPercentTab.removeClass(this._css.horizontalGridSelectedMenuTab);
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.prototype._highlightPixelsMenuTab = function() {
    if(this._demoLayout.isVerticalGrid())
        this._$measurementsMenuPixelTab.addClass(this._css.verticalGridSelectedMenuTab);
    else if(this._demoLayout.isHorizontalGrid())
        this._$measurementsMenuPixelTab.addClass(this._css.horizontalGridSelectedMenuTab);
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.prototype._highlightPercentsMenuTab = function() {
    if(this._demoLayout.isVerticalGrid())
        this._$measurementsMenuPercentTab.addClass(this._css.verticalGridSelectedMenuTab);
    else if(this._demoLayout.isHorizontalGrid())
        this._$measurementsMenuPercentTab.addClass(this._css.horizontalGridSelectedMenuTab);
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.prototype._selectPixelsMenuTab = function() {
    this._highlightPixelsMenuTab();
    this._openedMenuTab = DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.MENU_TABS.PIXELS;
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.prototype._selectPercentMenuTab = function() {
    this._highlightPercentsMenuTab();
    this._openedMenuTab = DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.MENU_TABS.PERCENTS;
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.prototype._isPixelsMenuTabOpened = function() {
    return this._openedMenuTab == DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.MENU_TABS.PIXELS;
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.prototype._isPercentsMenuTabOpened = function() {
    return this._openedMenuTab == DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.MENU_TABS.PERCENTS;
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.prototype._createMeasurementsMenu = function() {
    this._$measurementsMenu = $("<div/>").addClass(this._css.measurementsMenuClass);
    this._$measurementsMenuPixelTab = $("<div/>").addClass(this._css.measurementsMenuPixelTabClass).text("PX");
    this._$measurementsMenuPercentTab = $("<div/>").addClass(this._css.measurementsMenuPercentTabClass).text("%");

    this._$measurementsMenu.append(this._$measurementsMenuPixelTab).append(this._$measurementsMenuPercentTab);
    this._$view.append(this._$measurementsMenu);
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.prototype._createPixelMeasurementAccordionTab = function() {
    this._$pixelMeasurementAccordionTab = $("<div/>").addClass(this._css.pixelMeasurementAccordionTabClass);
    this._$pixelMeasurementAccordionTab.attr("data-applyplugin", "accordion");
    this._$pixelMeasurementAccordionTab.attr("data-accordionItemId", this._measurementsAccordionItemIds.pixelMeasurement);

    this._$view.append(this._$pixelMeasurementAccordionTab);
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.prototype._createPercentMeasurementAccordionTab = function() {
    this._$percentMeasurementAccordionTab = $("<div/>").addClass(this._css.percentMeasurementAccordionTabClass);
    this._$percentMeasurementAccordionTab.attr("data-applyplugin", "accordion");
    this._$percentMeasurementAccordionTab.attr("data-accordionItemId", this._measurementsAccordionItemIds.percentMeasurement);

    this._$view.append(this._$percentMeasurementAccordionTab);
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.prototype._createWidthValueDemonstrator = function() {
    var $arrowIcon = $("<div/>").addClass(this._css.demonstratorWidthArrowClass);
    this._$selectedValueDemonstrator.append($arrowIcon);

    var $arrowIconLeft = $("<div/>").addClass(this._css.demonstratorWidthArrowLeftClass);
    var $arrowIconCenter = $("<div/>").addClass(this._css.demonstratorWidthArrowCenterClass);
    var $arrowIconRight = $("<div/>").addClass(this._css.demonstratorWidthArrowRightClass);

    if(this._demoLayout.isVerticalGrid()) {
        $arrowIconLeft.addClass(this._css.verticalGridRightBorderColorClass);
        $arrowIconCenter.addClass(this._css.verticalGridBgClass);
        $arrowIconRight.addClass(this._css.verticalGridLeftBorderColorClass);
    }
    else if(this._demoLayout.isHorizontalGrid()) {
        $arrowIconLeft.addClass(this._css.horizontalGridRightBorderColorClass);
        $arrowIconCenter.addClass(this._css.horizontalGridBgClass);
        $arrowIconRight.addClass(this._css.horizontalGridLeftBorderColorClass);
    }

    $arrowIcon.append($arrowIconLeft).append($arrowIconCenter).append($arrowIconRight);

    var $content = $("<div/>").addClass(this._css.demonstratorWidthValueClass);
    this._$selectedValueDemonstrator.append($content);

    this._$selectedValueDemonstratorValue = $("<div/>").addClass(this._css.demonstratorWidthValueClass);
    $content.append(this._$selectedValueDemonstratorValue);
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.prototype._createHeightValueDemonstrator = function() {
    var $arrowIcon = $("<div/>").addClass(this._css.demonstratorHeightArrowClass);
    this._$selectedValueDemonstrator.append($arrowIcon);

    var $arrowIconTop = $("<div/>").addClass(this._css.demonstratorHeightArrowTopClass);
    var $arrowIconMiddle = $("<div/>").addClass(this._css.demonstratorHeightArrowMiddleClass);
    var $arrowIconBottom = $("<div/>").addClass(this._css.demonstratorHeightArrowBottomClass);

    if(this._demoLayout.isVerticalGrid()) {
        $arrowIconTop.addClass(this._css.verticalGridBottomBorderColorClass);
        $arrowIconMiddle.addClass(this._css.verticalGridBgClass);
        $arrowIconBottom.addClass(this._css.verticalGridTopBorderColorClass);
    }
    else if(this._demoLayout.isHorizontalGrid()) { 
        $arrowIconTop.addClass(this._css.horizontalGridBottomBorderColorClass);
        $arrowIconMiddle.addClass(this._css.horizontalGridBgClass);
        $arrowIconBottom.addClass(this._css.horizontalGridTopBorderColorClass);
    }

    $arrowIcon.append($arrowIconTop).append($arrowIconMiddle).append($arrowIconBottom);

    var $content = $("<div/>").addClass(this._css.demonstratorHeightValueClass);
    this._$selectedValueDemonstrator.append($content);

    this._$selectedValueDemonstratorValue = $("<div/>").addClass(this._css.demonstratorHeightValueClass);
    $content.append(this._$selectedValueDemonstratorValue);
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.prototype._createSelectedValueDemonstrator = function(measurementType) {
    this._$selectedValueDemonstrator = $("<div/>").addClass(this._css.selectedValueDemonstratorClass);
    this._$view.parent().append(this._$selectedValueDemonstrator);

    if(measurementType == DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.MEASUREMENT_TYPES.WIDTH)
        this._createWidthValueDemonstrator();
    else if(measurementType == DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.MEASUREMENT_TYPES.HEIGHT)
        this._createHeightValueDemonstrator();
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.prototype._findRangeSelectorOptionByMeasurementValue = function(measurementValue) {
    var measurementValue = parseInt(measurementValue, 10);

    for(var i = 0; i < this._ranges.length; i++) {
        if(measurementValue >= this._ranges[i].from && measurementValue <= this._ranges[i].to) {
            this._selectedItemRangeSelectorOptionIndex = i + 1;
            break;
        }
    }
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.prototype._isRangeSelectorOptionSelected = function($rangeSelectorOption) {
    var selectorOptionIndex = $rangeSelectorOption.attr("data-selectorOption");
    return this._selectedItemRangeSelectorOptionIndex == selectorOptionIndex;
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.prototype._highlightItemSizeRangeSelectorOption = function($rangeSelectorOption) {
    if(this._demoLayout.isVerticalGrid())
        $rangeSelectorOption.addClass(this._css.verticalGridSelectedItemRangeSelectorOptionClass);
    else if(this._demoLayout.isHorizontalGrid())
        $rangeSelectorOption.addClass(this._css.horizontalGridSelectedItemRangeSelectorOptionClass);
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.prototype._unhighlightItemSizeRangeSelectorOption = function($rangeSelectorOption) {
    $rangeSelectorOption.removeClass(this._css.verticalGridSelectedItemRangeSelectorOptionClass);
    $rangeSelectorOption.removeClass(this._css.horizontalGridSelectedItemRangeSelectorOptionClass);
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.prototype._unselectItemSizeRangeSelectorOption = function($rangeSelectorOption) {
    for(var i = 0; i < this._itemRangesSelectorOptions.length; i++)
    {
        var selectorOptionIndex = this._itemRangesSelectorOptions[i].attr("data-selectorOption");
        if(selectorOptionIndex == this._selectedItemRangeSelectorOptionIndex)
        {
            this._selectedItemRangeSelectorOptionIndex = null;
            this._unhighlightItemSizeRangeSelectorOption($rangeSelectorOption);
            break;
        }
    }
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.prototype._selectItemSizeRangeSelectorOption = function($rangeSelectorOption) {
    var selectorOptionIndex = $rangeSelectorOption.attr("data-selectorOption");
    this._highlightItemSizeRangeSelectorOption($rangeSelectorOption);
    this._selectedItemRangeSelectorOptionIndex = selectorOptionIndex;
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.prototype._createItemSizesRangesSelector = function() {
    this._$itemRangesSelector = $("<div/>").addClass(this._css.itemRangesSelectorClass);
    this._$pixelMeasurementAccordionTab.append(this._$itemRangesSelector);

    var even = false;
    for(var i = 1; i <= this._itemRangesSelectorOptionsCount; i++) {
        var $selectorOption = $("<div/>").addClass(this._css.itemRangesSelectorOptionClass);
        $selectorOption.attr("data-selectorOption", i);
        if(even) $selectorOption.addClass(this._css.itemRangesSelectorHighlightedOptionClass);
        if(i > 4) $selectorOption.addClass(this._css.itemRangesSelectorOptionMarginClass);

        var $selectorOptionPrefix = $("<span/>").text(this._ranges[i - 1].from + "-" + this._ranges[i - 1].to);
        $selectorOption.html($selectorOptionPrefix.get(0).outerHTML + "px");

        this._$itemRangesSelector.append($selectorOption);
        this._itemRangesSelectorOptions.push($selectorOption);

        even = !even;
        if(i % 4 == 0) even = !even;
    }
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.prototype._createItemSizesSlider = function() {
    this._$itemSizeSlider = $("<div/>").addClass(this._css.sliderClass);
    this._$pixelMeasurementAccordionTab.append(this._$itemSizeSlider);

    if(this._demoLayout.isVerticalGrid())
        this._$itemSizeSlider.addClass(this._css.verticalGridSliderClass);
    else if(this._demoLayout.isHorizontalGrid())
        this._$itemSizeSlider.addClass(this._css.horizontalGridSliderClass);

    var me = this;
    this._$itemSizeSlider.on({
        slide: function() {
            if(me._isPixelsMenuTabOpened()) {
                var newPropertyValue = Math.round(me._$itemSizeSlider.val());
                me._$selectedValueDemonstratorValue.text(newPropertyValue + "px");
                me._sliderChangeHandler(newPropertyValue + "px");
            }
        }
    });
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.prototype._getItemSizeSliderPipsValues = function(minSliderValue) {
    var pipsValues = [];
    var from = this._ranges[this._selectedItemRangeSelectorOptionIndex - 1].from;
    var to = this._ranges[this._selectedItemRangeSelectorOptionIndex - 1].to;
    var step = this._ranges[this._selectedItemRangeSelectorOptionIndex - 1].step;

    if(from < 1000) {
        for(var i = from; i <= to; i += 10) {
            pipsValues.push(i);
            if(i == 1) i -= 1;
        }

        pipsValues.push(i - 10 + 9);
    }
    else { 
        for(var i = from; i <= to; i += 50) {
            pipsValues.push(i);
        }
    }

    return pipsValues;
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.prototype._initItemSizeSliderValues = function(initialSliderValue) {
    var me = this;

    var minSliderValue = me._ranges[me._selectedItemRangeSelectorOptionIndex - 1].from;
    this._$itemSizeSlider.noUiSlider({
        start: [initialSliderValue],
        connect: "lower",
        step: me._ranges[me._selectedItemRangeSelectorOptionIndex - 1].step,
        range: {
            'min': minSliderValue,
            'max': me._ranges[me._selectedItemRangeSelectorOptionIndex - 1].to
        }
    }, this._reinitItemSizeSlider);

    var $sliderPipValuePostfix = $("<span/>").addClass(this._css.sliderPipValuesPostfixClass).text("px");
    this._$itemSizeSlider.noUiSlider_pips({
        mode: "values",
        values: me._getItemSizeSliderPipsValues(minSliderValue),
        format: wNumb({
            decimals: 0,
            postfix: $sliderPipValuePostfix.get(0).outerHTML
        })
    });

    setTimeout(function() { me._$itemSizeSlider.trigger("slide"); }, 0);

    if(!this._reinitItemSizeSlider)
        this._reinitItemSizeSlider = true;
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.prototype._createPercentsSizesSlider = function() {
    this._$percentsMeasurementItemSizeSlider = $("<div/>").addClass(this._css.sliderClass);
    this._$percentMeasurementAccordionTab.append(this._$percentsMeasurementItemSizeSlider);

    if(this._demoLayout.isVerticalGrid())
        this._$percentsMeasurementItemSizeSlider.addClass(this._css.verticalGridSliderClass);
    else if(this._demoLayout.isHorizontalGrid())
        this._$percentsMeasurementItemSizeSlider.addClass(this._css.horizontalGridSliderClass);

    var me = this;
    this._$percentsMeasurementItemSizeSlider.on({
        slide: function() {
            if(me._isPercentsMenuTabOpened()) {
                var newPropertyValue = Math.round(me._$percentsMeasurementItemSizeSlider.val());
                me._$selectedValueDemonstratorValue.text(newPropertyValue + "%");
                me._sliderChangeHandler(newPropertyValue + "%");
            }
        }
    });
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.prototype._initPercentsSizeSliderValues = function(initialSliderValue) {
    var me = this;

    this._$percentsMeasurementItemSizeSlider.noUiSlider({
        start: [initialSliderValue],
        connect: "lower",
        step: 1,
        range: {
            'min': 1,
            'max': 100
        }
    });

    var $sliderPipValuePostfix = $("<span/>").addClass(this._css.sliderPipValuesPostfixClass).text("%");
    this._$percentsMeasurementItemSizeSlider.noUiSlider_pips({
        mode: "values",
        values: [1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
        format: wNumb({
            decimals: 0,
            postfix: $sliderPipValuePostfix.get(0).outerHTML
        })
    });
}