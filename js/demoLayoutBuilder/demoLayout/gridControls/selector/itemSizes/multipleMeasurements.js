DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize = function($selectorRightSide, 
                                                                                                                                                  demoLayout, 
                                                                                                                                                  sliderChangeHandler,
                                                                                                                                                  sliderInitialValue) {
    var me = this;

    this._$view = null;

    this._demoLayout = null;

    this._$measurementsMenu = null;
    this._$measurementsMenuPixelTab = null;
    this._$measurementsMenuPercentTab = null;

    this._openedMenuTab = null;

    this._$pixelMeasurementAccordionTab = null;
    this._$percentMeasurementAccordionTab = null;

    this._$pixelsMeasurementItemSizeRangeSlider = null;
    this._$pixelsMeasurementItemSizeSlider = null;
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

        sliderClass: "slider",
        sliderMarginClass: "sliderMargin",

        horizontalGridSliderClass: "horizontalNoUiSlider",
        verticalGridSliderClass: "verticalNoUiSlider"
    }

    this._construct = function() {
        me._demoLayout = demoLayout;
        me._sliderChangeHandler = sliderChangeHandler;

        me._$view = $("<div/>").addClass(me._css.containerClass);
       
        me._createMeasurementsMenu();
        me._selectPixelsMenuTab();

        me._createPixelMeasurementAccordionTab();
        me._createPercentMeasurementAccordionTab();

        me._createPixelsMeasurementItemSizeRangeSlider();
        me._createPixelsMeasurementItemSizeSlider();
        me._createPercentsMeasurementItemSizeSlider();

        $selectorRightSide.append(me._$view);

        me._measurementsAccordion = new Accordion(me._$view);

        me._bindEvents();
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

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.MENU_TABS = {
    PIXELS: 0, PERCENTS: 1
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.prototype._unsetSelectedMenuTab = function() {
    if(this._isPixelsMenuTabOpened())
    {
        this._$measurementsMenuPixelTab.removeClass(this._css.verticalGridSelectedMenuTab);
        this._$measurementsMenuPercentTab.removeClass(this._css.horizontalGridSelectedMenuTab);
    }
    else if(this._isPercentsMenuTabOpened())
    {
        this._$measurementsMenuPercentTab.removeClass(this._css.verticalGridSelectedMenuTab);
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

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.SliderPipsValuesGenerator = function(pipsPostfixes) {
    var me = this;
    this._pipsPostfixes = null;
    this._nextPipPostfixIndex = -1;

    this._construct = function() {
        me._pipsPostfixes = pipsPostfixes;
    }

    this._css = {
        postfixSliderPipValueClass: "sliderPipValuePostfix"
    }

    this._getNextPipPostfix = function() {
        me._nextPipPostfixIndex++;
        return me._pipsPostfixes[me._nextPipPostfixIndex];
    }

    this._construct();
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.SliderPipsValuesGenerator.prototype.toString = function() {
    var $postfixLabel = $("<span/>").addClass(this._css.postfixSliderPipValueClass).text("px");

    if(this._nextPipPostfixIndex + 1 == this._pipsPostfixes.length)
        return $postfixLabel.get(0).outerHTML;

    return "-" + (this._getNextPipPostfix() + 100) + $postfixLabel.get(0).outerHTML;
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.prototype._decorateSliderPipsAsMultiline = function($slider) {
    var even = false;
    $.each($slider.find(".noUi-value"), function() {
        if(even) {
            var top = 30;
            $(this).css("top", top + "px");
        }
        even = !even;
    });

    var even = false;
    $.each($slider.find(".noUi-marker-large"), function() {
        if(even) {
            $(this).css("height", "35px");
        }
        even = !even;
    });
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.prototype._createPixelsMeasurementItemSizeRangeSlider = function() {
    this._$pixelsMeasurementItemSizeRangeSlider = $("<div/>").addClass(this._css.sliderClass);
    this._$pixelMeasurementAccordionTab.append(this._$pixelsMeasurementItemSizeRangeSlider);

    if(this._demoLayout.isVerticalGrid())
        this._$pixelsMeasurementItemSizeRangeSlider.addClass(this._css.verticalGridSliderClass);
    else if(this._demoLayout.isHorizontalGrid())
        this._$pixelsMeasurementItemSizeRangeSlider.addClass(this._css.horizontalGridSliderClass);

    this._$pixelsMeasurementItemSizeRangeSlider.noUiSlider({
        start: [1],
        connect: "lower",
        step: 100,
        range: {'min': 1, 'max': 1500}
    });

    this._$pixelsMeasurementItemSizeRangeSlider.noUiSlider_pips({
        mode: "values",
        values: [1, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500],
        format: wNumb({
            decimals: 0,
            postfix: new DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.SliderPipsValuesGenerator(
                [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400]
            )
        })
    });

    this._decorateSliderPipsAsMultiline(this._$pixelsMeasurementItemSizeRangeSlider);
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.prototype._createPixelsMeasurementItemSizeSlider = function() {
    this._$pixelsMeasurementItemSizeSlider = $("<div/>").addClass(this._css.sliderClass);
    this._$pixelsMeasurementItemSizeSlider.addClass(this._css.sliderMarginClass);
    this._$pixelMeasurementAccordionTab.append(this._$pixelsMeasurementItemSizeSlider);

    if(this._demoLayout.isVerticalGrid())
        this._$pixelsMeasurementItemSizeSlider.addClass(this._css.verticalGridSliderClass);
    else if(this._demoLayout.isHorizontalGrid())
        this._$pixelsMeasurementItemSizeSlider.addClass(this._css.horizontalGridSliderClass);

    this._$pixelsMeasurementItemSizeSlider.noUiSlider({
        start: [1],
        connect: "lower",
        step: 1,
        range: {'min': 1, 'max': 100}
    });

    this._$pixelsMeasurementItemSizeSlider.noUiSlider_pips({
        mode: "values",
        values: [1, 50, 100],
        format: wNumb({
            decimals: 0,
            postfix: "px"
        })
    });
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.prototype._createPercentsMeasurementItemSizeSlider = function() {
    this._$percentsMeasurementItemSizeSlider = $("<div/>").addClass(this._css.sliderClass);
    this._$percentMeasurementAccordionTab.append(this._$percentsMeasurementItemSizeSlider);

    if(this._demoLayout.isVerticalGrid())
        this._$percentsMeasurementItemSizeSlider.addClass(this._css.verticalGridSliderClass);
    else if(this._demoLayout.isHorizontalGrid())
        this._$percentsMeasurementItemSizeSlider.addClass(this._css.horizontalGridSliderClass);

    this._$percentsMeasurementItemSizeSlider.noUiSlider({
        start: [1],
        connect: "lower",
        step: 1,
        range: {'min': 1, 'max': 100}
    });

    this._$percentsMeasurementItemSizeSlider.noUiSlider_pips({
        mode: "values",
        values: [1, 50, 100],
        format: wNumb({
            decimals: 0,
            postfix: "%"
        })
    });
}