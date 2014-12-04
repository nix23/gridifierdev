DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemCss = function($selectorRightSide,
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
    this._selectedValueDemonstratorValues = [];

    this._$pxMeasurementSlider = null;
    this._$ptMeasurementSlider = null;
    this._$ptMeasurementFractionalSlider = null;

    this._measurementsAccordion = null;
    this._measurementsAccordionItemIds = {
        pixelMeasurement: "multipleMeasurementPixelsTab",
        percentMeasurement: "multipleMeasurementPercentsTab"
    };

    this._sliderChangeHandler = null;

    this._css = {
        containerClass: "multipleMeasurementsItemCss",

        measurementsMenuClass: "measurementsMenu",
        measurementsMenuPixelTabClass: "tab pixelsTab",
        measurementsMenuPercentTabClass: "tab percentsTab",

        verticalGridSelectedMenuTab: "selectedTab gridFifthBg",
        horizontalGridSelectedMenuTab: "selectedTab gridFourthBg",

        pixelMeasurementAccordionTabClass: "accordionPixelsTab",
        percentMeasurementAccordionTabClass: "accordionPercentsTab",

        selectedValueDemonstratorClass: "multipleMeasurementsItemCssSelectedValueDemonstrator",
        selectedValueDemonstratorValueClass: "multipleMeasurementsItemCssSelectedValue",
        demonstratorNoBorderClass: "demonstratorNoBorder",

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

        marginDemonstratorItemClass: "marginDemonstratorItem",

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

        me._createPixelSizesSlider();
        me._createPercentsSizesSlider();
        me._createPercentsFractionalSizesSlider();

        $selectorRightSide.append(me._$view);

        me._measurementsAccordion = new Accordion(me._$view);

        me._createSelectedValueDemonstrator(measurementType);
        me._bindEvents();

        if(me._isPixelsMeasurementValue(measurementValue)) {
            me._selectPixelsMenuTab();
            me._initItemSizeSliderValues(parseInt(measurementValue, 10));
            me._initPercentsSizeSliderValues(0);
            me._initPercentsFractionalSizeSliderValues(0.00);
            me._$pxMeasurementSlider.trigger("slide");
        }
        else if(me._isPercentsMeasurementValue(measurementValue)) {
            me._selectPercentMenuTab();

            var measurementValueParts = parseFloat(measurementValue).toString().split(".");
            var percentsIntegerPart = measurementValueParts[0];
            var percentsFractionalPart = measurementValueParts[1];

            me._initItemSizeSliderValues(0);
            me._initPercentsSizeSliderValues(parseInt(percentsIntegerPart, 10));
            me._initPercentsFractionalSizeSliderValues(parseFloat("0." + percentsFractionalPart));
            me._$measurementsMenuPercentTab.trigger("click");
            me._$ptMeasurementSlider.trigger("slide");
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
    }

    this._unbindEvents = function() {
    }

    this.destruct = function() {
        me._unbindEvents();
    }

    this._construct();
    return this;
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemCss.MEASUREMENT_TYPES = {
    MARGIN_WIDTH: 0, MARGIN_HEIGHT: 1, PADDING_WIDTH: 2, PADDING_HEIGHT: 3
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemCss.MENU_TABS = {
    PIXELS: 0, PERCENTS: 1
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemCss.prototype._isPixelsMeasurementValue = function(measurementValue) {
    var pattern = new RegExp("px");
    return pattern.test(measurementValue);
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemCss.prototype._isPercentsMeasurementValue = function(measurementValue) {
    var pattern = new RegExp("%");
    return pattern.test(measurementValue);
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemCss.prototype._unsetSelectedMenuTab = function() {
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

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemCss.prototype._highlightPixelsMenuTab = function() {
    if(this._demoLayout.isVerticalGrid())
        this._$measurementsMenuPixelTab.addClass(this._css.verticalGridSelectedMenuTab);
    else if(this._demoLayout.isHorizontalGrid())
        this._$measurementsMenuPixelTab.addClass(this._css.horizontalGridSelectedMenuTab);
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemCss.prototype._highlightPercentsMenuTab = function() {
    if(this._demoLayout.isVerticalGrid())
        this._$measurementsMenuPercentTab.addClass(this._css.verticalGridSelectedMenuTab);
    else if(this._demoLayout.isHorizontalGrid())
        this._$measurementsMenuPercentTab.addClass(this._css.horizontalGridSelectedMenuTab);
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemCss.prototype._unhighlightPixelsMenuTab = function() {
    if(this._demoLayout.isVerticalGrid())
        this._$measurementsMenuPixelTab.removeClass(this._css.verticalGridSelectedMenuTab);
    else if(this._demoLayout.isHorizontalGrid())
        this._$measurementsMenuPixelTab.removeClass(this._css.horizontalGridSelectedMenuTab);
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemCss.prototype._unhighlightPercentsMenuTab = function() {
    if(this._demoLayout.isVerticalGrid())
        this._$measurementsMenuPercentTab.removeClass(this._css.verticalGridSelectedMenuTab);
    else if(this._demoLayout.isHorizontalGrid())
        this._$measurementsMenuPercentTab.removeClass(this._css.horizontalGridSelectedMenuTab);
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemCss.prototype._highlightPixelsMenuTab = function() {
    if(this._demoLayout.isVerticalGrid())
        this._$measurementsMenuPixelTab.addClass(this._css.verticalGridSelectedMenuTab);
    else if(this._demoLayout.isHorizontalGrid())
        this._$measurementsMenuPixelTab.addClass(this._css.horizontalGridSelectedMenuTab);
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemCss.prototype._highlightPercentsMenuTab = function() {
    if(this._demoLayout.isVerticalGrid())
        this._$measurementsMenuPercentTab.addClass(this._css.verticalGridSelectedMenuTab);
    else if(this._demoLayout.isHorizontalGrid())
        this._$measurementsMenuPercentTab.addClass(this._css.horizontalGridSelectedMenuTab);
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemCss.prototype._selectPixelsMenuTab = function() {
    this._highlightPixelsMenuTab();
    this._openedMenuTab = DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemCss.MENU_TABS.PIXELS;
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemCss.prototype._selectPercentMenuTab = function() {
    this._highlightPercentsMenuTab();
    this._openedMenuTab = DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemCss.MENU_TABS.PERCENTS;
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemCss.prototype._isPixelsMenuTabOpened = function() {
    return this._openedMenuTab == DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemCss.MENU_TABS.PIXELS;
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemCss.prototype._isPercentsMenuTabOpened = function() {
    return this._openedMenuTab == DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemCss.MENU_TABS.PERCENTS;
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemCss.prototype._createMeasurementsMenu = function() {
    this._$measurementsMenu = $("<div/>").addClass(this._css.measurementsMenuClass);
    this._$measurementsMenuPixelTab = $("<div/>").addClass(this._css.measurementsMenuPixelTabClass).text("PX");
    this._$measurementsMenuPercentTab = $("<div/>").addClass(this._css.measurementsMenuPercentTabClass).text("%");

    this._$measurementsMenu.append(this._$measurementsMenuPixelTab).append(this._$measurementsMenuPercentTab);
    this._$view.append(this._$measurementsMenu);
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemCss.prototype._createPixelMeasurementAccordionTab = function() {
    this._$pixelMeasurementAccordionTab = $("<div/>").addClass(this._css.pixelMeasurementAccordionTabClass);
    this._$pixelMeasurementAccordionTab.attr("data-applyplugin", "accordion");
    this._$pixelMeasurementAccordionTab.attr("data-accordionItemId", this._measurementsAccordionItemIds.pixelMeasurement);

    this._$view.append(this._$pixelMeasurementAccordionTab);
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemCss.prototype._createPercentMeasurementAccordionTab = function() {
    this._$percentMeasurementAccordionTab = $("<div/>").addClass(this._css.percentMeasurementAccordionTabClass);
    this._$percentMeasurementAccordionTab.attr("data-applyplugin", "accordion");
    this._$percentMeasurementAccordionTab.attr("data-accordionItemId", this._measurementsAccordionItemIds.percentMeasurement);

    this._$view.append(this._$percentMeasurementAccordionTab);
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemCss.prototype._createPixelSizesSlider = function() {
    this._$pxMeasurementSlider = $("<div/>").addClass(this._css.sliderClass);
    this._$pixelMeasurementAccordionTab.append(this._$pxMeasurementSlider);

    if(this._demoLayout.isVerticalGrid())
        this._$pxMeasurementSlider.addClass(this._css.verticalGridSliderClass);
    else if(this._demoLayout.isHorizontalGrid())
        this._$pxMeasurementSlider.addClass(this._css.horizontalGridSliderClass);

    var me = this;
    this._$pxMeasurementSlider.on({
        slide: function() {
            if(me._isPixelsMenuTabOpened()) {
                var newPropertyValue = Math.round(me._$pxMeasurementSlider.val());

                for(var i = 0; i < me._selectedValueDemonstratorValues.length; i++)
                    me._selectedValueDemonstratorValues[i].text(newPropertyValue + "px");
                
                me._sliderChangeHandler(newPropertyValue + "px");
            }
        }
    });
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemCss.prototype._initItemSizeSliderValues = function(initialSliderValue) {
    var me = this;

    var minSliderValue = 0;
    this._$pxMeasurementSlider.noUiSlider({
        start: [initialSliderValue],
        connect: "lower",
        step: 1,
        range: {
            'min': minSliderValue,
            'max': 100
        }
    });

    var $sliderPipValuePostfix = $("<span/>").addClass(this._css.sliderPipValuesPostfixClass).text("px");
    this._$pxMeasurementSlider.noUiSlider_pips({
        mode: "values",
        values: [0,10,20,30,40,50,60,70,80,90,100],
        format: wNumb({
            decimals: 0,
            postfix: $sliderPipValuePostfix.get(0).outerHTML
        })
    });

    setTimeout(function() { me._$pxMeasurementSlider.trigger("slide"); }, 0);
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemCss.prototype._createPercentsSizesSlider = function() {
    this._$ptMeasurementSlider = $("<div/>").addClass(this._css.sliderClass);
    this._$percentMeasurementAccordionTab.append(this._$ptMeasurementSlider);

    if(this._demoLayout.isVerticalGrid())
        this._$ptMeasurementSlider.addClass(this._css.verticalGridSliderClass);
    else if(this._demoLayout.isHorizontalGrid())
        this._$ptMeasurementSlider.addClass(this._css.horizontalGridSliderClass);

    var me = this;
    this._$ptMeasurementSlider.on({
        slide: function() {
            if(me._isPercentsMenuTabOpened()) {
                var newIntegerPtValue = parseFloat(me._$ptMeasurementSlider.val());
                var newFractionalPtValue = parseFloat(me._$ptMeasurementFractionalSlider.val());
                var newPtValue = (newIntegerPtValue + newFractionalPtValue).toFixed(2);

                for(var i = 0; i < me._selectedValueDemonstratorValues.length; i++)
                    me._selectedValueDemonstratorValues[i].text(newPtValue + "%");

                me._sliderChangeHandler(newPtValue + "%");
            }
        }
    });
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemCss.prototype._initPercentsSizeSliderValues = function(initialSliderValue) {
    var me = this;

    this._$ptMeasurementSlider.noUiSlider({
        start: [initialSliderValue],
        connect: "lower",
        step: 1,
        range: {
            'min': 0,
            'max': 50
        }
    });

    var $sliderPipValuePostfix = $("<span/>").addClass(this._css.sliderPipValuesPostfixClass).text("%");
    this._$ptMeasurementSlider.noUiSlider_pips({
        mode: "values",
        values: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
        format: wNumb({
            decimals: 0,
            postfix: $sliderPipValuePostfix.get(0).outerHTML
        })
    });
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemCss.prototype._createPercentsFractionalSizesSlider = function() {
    this._$ptMeasurementFractionalSlider = $("<div/>").addClass(this._css.sliderClass);
    this._$ptMeasurementFractionalSlider.css("margin-top", "70px");
    this._$percentMeasurementAccordionTab.append(this._$ptMeasurementFractionalSlider);

    if(this._demoLayout.isVerticalGrid())
        this._$ptMeasurementFractionalSlider.addClass(this._css.verticalGridSliderClass);
    else if(this._demoLayout.isHorizontalGrid())
        this._$ptMeasurementFractionalSlider.addClass(this._css.horizontalGridSliderClass);

    var me = this;
    this._$ptMeasurementFractionalSlider.on({
        slide: function() {
            if(me._isPercentsMenuTabOpened()) {
                var newIntegerPtValue = parseFloat(me._$ptMeasurementSlider.val());
                var newFractionalPtValue = parseFloat(me._$ptMeasurementFractionalSlider.val());
                var newPtValue = (newIntegerPtValue + newFractionalPtValue).toFixed(2);

                for(var i = 0; i < me._selectedValueDemonstratorValues.length; i++)
                    me._selectedValueDemonstratorValues[i].text(newPtValue + "%");

                me._sliderChangeHandler(newPtValue + "%");
            }
        }
    });
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemCss.prototype._initPercentsFractionalSizeSliderValues = function(initialSliderValue) {
    var me = this;

    this._$ptMeasurementFractionalSlider.noUiSlider({
        start: [initialSliderValue],
        connect: "lower",
        step: 0.01,
        range: {
            'min': 0.00,
            'max': 0.99
        }
    });

    var $sliderPipValuePostfix = $("<span/>").addClass(this._css.sliderPipValuesPostfixClass).text("%");
    this._$ptMeasurementFractionalSlider.noUiSlider_pips({
        mode: "values",
        values: [0.00, 0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 0.99],
        format: wNumb({
            decimals: 2,
            postfix: $sliderPipValuePostfix.get(0).outerHTML
        })
    });
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemCss.prototype._createHorizontalArrow = function() {
    var $arrowIcon = $("<div/>").addClass(this._css.demonstratorWidthArrowClass);

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

    return $arrowIcon;
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemCss.prototype._createVerticalArrow = function() {
    var $arrowIcon = $("<div/>").addClass(this._css.demonstratorHeightArrowClass);

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

    return $arrowIcon;
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemCss.prototype._createMarginWidthValueDemonstrator = function() {
    var $item = $("<div/>").addClass(this._css.marginDemonstratorItemClass);
    this._$selectedValueDemonstrator.append($item);
    this._$selectedValueDemonstrator.addClass(this._css.demonstratorNoBorderClass);

    var $leftArrow = this._createHorizontalArrow();
    var $rightArrow = this._createHorizontalArrow();
    $leftArrow.css({"top": "42px"});
    $rightArrow.css({"top": "40px", "left": "102px"});

    this._$selectedValueDemonstrator.append($leftArrow);
    this._$selectedValueDemonstrator.append($rightArrow);

    this._$selectedValueDemonstrator.css({"height": "110px"});
    this._$view.css({"height": "230px"});

    var $leftDemonstratorValue = $("<div/>").addClass(this._css.selectedValueDemonstratorValueClass);
    var $rightDemonstratorValue = $("<div/>").addClass(this._css.selectedValueDemonstratorValueClass);
    $leftDemonstratorValue.css({"top": "75px", "left": "-3px"});
    $rightDemonstratorValue.css({"top": "75px", "left": "95px"});

    this._$selectedValueDemonstrator.append($leftDemonstratorValue);
    this._$selectedValueDemonstrator.append($rightDemonstratorValue);

    this._selectedValueDemonstratorValues.push($leftDemonstratorValue);
    this._selectedValueDemonstratorValues.push($rightDemonstratorValue);
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemCss.prototype._createMarginHeightValueDemonstrator = function() {
    var $item = $("<div/>").addClass(this._css.marginDemonstratorItemClass);
    $item.css({"left": "70%", "top": "54%"});
    this._$selectedValueDemonstrator.append($item);
    this._$selectedValueDemonstrator.addClass(this._css.demonstratorNoBorderClass);

    var $topArrow = this._createVerticalArrow();
    var $bottomArrow = this._createVerticalArrow();
    $topArrow.css({"left": "91px", "top": "-8px"});
    $bottomArrow.css({"left": "91px", "top": "84px"});

    this._$selectedValueDemonstrator.append($topArrow);
    this._$selectedValueDemonstrator.append($bottomArrow);

    this._$selectedValueDemonstrator.css({"height": "110px"});
    this._$view.css({"height": "230px"});

    var $topDemonstratorValue = $("<div/>").addClass(this._css.selectedValueDemonstratorValueClass);
    var $bottomDemonstratorValue = $("<div/>").addClass(this._css.selectedValueDemonstratorValueClass);
    $topDemonstratorValue.css({"top": "-4px", "left": "23px"});
    $bottomDemonstratorValue.css({"top": "88px", "left": "23px"});

    this._$selectedValueDemonstrator.append($topDemonstratorValue);
    this._$selectedValueDemonstrator.append($bottomDemonstratorValue);

    this._selectedValueDemonstratorValues.push($topDemonstratorValue);
    this._selectedValueDemonstratorValues.push($bottomDemonstratorValue);
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemCss.prototype._createPaddingWidthValueDemonstrator = function() {
    var $item = $("<div/>").addClass(this._css.marginDemonstratorItemClass);
    this._$selectedValueDemonstrator.append($item);

    var $leftArrow = this._createHorizontalArrow();
    var $rightArrow = this._createHorizontalArrow();
    $leftArrow.css({"top": "72px", "left": "8px"});
    $rightArrow.css({"top": "72px", "left": "110px"});

    this._$selectedValueDemonstrator.css({
        "left": "50px", "top": "70px", "width": "170px", "height": "170px"
    });
    this._$selectedValueDemonstrator.append($leftArrow).append($rightArrow);
    this._$view.css({"height": "230px"});

    var $leftDemonstratorValue = $("<div/>").addClass(this._css.selectedValueDemonstratorValueClass);
    var $rightDemonstratorValue = $("<div/>").addClass(this._css.selectedValueDemonstratorValueClass);
    $leftDemonstratorValue.css({"top": "105px", "left": "5px"});
    $rightDemonstratorValue.css({"top": "105px", "left": "103px"});

    this._$selectedValueDemonstrator.append($leftDemonstratorValue).append($rightDemonstratorValue);
    this._selectedValueDemonstratorValues.push($leftDemonstratorValue);
    this._selectedValueDemonstratorValues.push($rightDemonstratorValue);
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemCss.prototype._createPaddingHeightValueDemonstrator = function() {
    var $item = $("<div/>").addClass(this._css.marginDemonstratorItemClass);
    this._$selectedValueDemonstrator.append($item);

    var $topArrow = this._createVerticalArrow();
    var $bottomArrow = this._createVerticalArrow();
    $topArrow.css({"left": "91px", "top": "17px"});
    $bottomArrow.css({"left": "91px", "top": "109px"});

    this._$selectedValueDemonstrator.css({
        "left": "50px", "top": "70px", "width": "170px", "height": "170px"
    });
    this._$selectedValueDemonstrator.append($topArrow).append($bottomArrow);
    this._$view.css({"height": "230px"});

    var $topDemonstratorValue = $("<div/>").addClass(this._css.selectedValueDemonstratorValueClass);
    var $bottomDemonstratorValue = $("<div/>").addClass(this._css.selectedValueDemonstratorValueClass);
    $topDemonstratorValue.css({"top": "21px", "left": "23px"});
    $bottomDemonstratorValue.css({"top": "113px", "left": "23px"});

    this._$selectedValueDemonstrator.append($topDemonstratorValue).append($bottomDemonstratorValue);
    this._selectedValueDemonstratorValues.push($topDemonstratorValue);
    this._selectedValueDemonstratorValues.push($bottomDemonstratorValue);
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemCss.prototype._createSelectedValueDemonstrator = function(measurementType) {
    this._$selectedValueDemonstrator = $("<div/>").addClass(this._css.selectedValueDemonstratorClass);
    this._$view.parent().append(this._$selectedValueDemonstrator);

    var measurementTypes = DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemCss.MEASUREMENT_TYPES;
    if(measurementType == measurementTypes.MARGIN_WIDTH)
        this._createMarginWidthValueDemonstrator();
    else if(measurementType == measurementTypes.MARGIN_HEIGHT)
        this._createMarginHeightValueDemonstrator();
    else if(measurementType == measurementTypes.PADDING_WIDTH)
        this._createPaddingWidthValueDemonstrator();
    else if(measurementType == measurementTypes.PADDING_HEIGHT)
        this._createPaddingHeightValueDemonstrator();
}