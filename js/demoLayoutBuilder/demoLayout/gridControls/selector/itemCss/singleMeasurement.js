DemoLayoutBuilder.DemoLayout.GridControls.Selector.SingleMeasurementItemCss = function($selectorRightSide,
                                                                                       demoLayout,
                                                                                       sliderChangeHandler,
                                                                                       measurementValue,
                                                                                       measurementType) {
    var me = this;

    this._$view = null;

    this._demoLayout = null;

    this._$selectedValueDemonstrator = null;
    this._selectedValueDemonstratorValues = [];

    this._$slider = null;

    this._sliderChangeHandler = null;

    this._css = {
        containerClass: "singleMeasurementItemCss",

        selectedValueDemonstratorClass: "singleMeasurementItemCssSelectedValueDemonstrator",
        selectedValueDemonstratorValueClass: "singleMeasurementItemCssSelectedValue",
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
        me._$view.css("height", "195px");

        var namespace = DemoLayoutBuilder.DemoLayout.GridControls.Selector.SingleMeasurementItemCss;
        
        if(measurementType == namespace.MEASUREMENT_TYPES.BOX_SIZING)
            me._createBoxSizingSlider();
        else
            me._createSlider();
        $selectorRightSide.append(me._$view);

        if(measurementType != namespace.MEASUREMENT_TYPES.BOX_SIZING)
            me._createSelectedValueDemonstrator(measurementType);
        else
            me._$view.css("height", "80px");
        me._bindEvents();
        
        if(measurementType == namespace.MEASUREMENT_TYPES.BOX_SIZING)
            me._initBoxSizingSliderValues(parseInt(measurementValue, 10));
        else
            me._initSliderValues(parseInt(measurementValue, 10));
        
        me._$slider.trigger("slide");
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

DemoLayoutBuilder.DemoLayout.GridControls.Selector.SingleMeasurementItemCss.MEASUREMENT_TYPES = {
    BORDER_WIDTH: 0, BORDER_HEIGHT: 1, BOX_SIZING: 2
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.SingleMeasurementItemCss.prototype._createSlider = function() {
    this._$slider = $("<div/>").addClass(this._css.sliderClass);
    this._$view.append(this._$slider);

    if(this._demoLayout.isVerticalGrid())
        this._$slider.addClass(this._css.verticalGridSliderClass);
    else if(this._demoLayout.isHorizontalGrid())
        this._$slider.addClass(this._css.horizontalGridSliderClass);

    var me = this;
    this._$slider.on({
        slide: function() {
            var newPropertyValue = Math.round(me._$slider.val());

            for(var i = 0; i < me._selectedValueDemonstratorValues.length; i++)
                me._selectedValueDemonstratorValues[i].text(newPropertyValue + "px");
            
            me._sliderChangeHandler(newPropertyValue + "px");
        }
    });
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.SingleMeasurementItemCss.prototype._createBoxSizingSlider = function() {
    this._$slider = $("<div/>").addClass(this._css.sliderClass);
    this._$view.append(this._$slider);

    if(this._demoLayout.isVerticalGrid())
        this._$slider.addClass(this._css.verticalGridSliderClass);
    else if(this._demoLayout.isHorizontalGrid())
        this._$slider.addClass(this._css.horizontalGridSliderClass);

    var me = this;
    this._$slider.on({
        slide: function() {
            var newBoxSizingValue = me._$slider.val();
            me._sliderChangeHandler(newBoxSizingValue);
        }
    });
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.SingleMeasurementItemCss.prototype._initBoxSizingSliderValues = function(initialSliderValue) {
    var me = this;

    this._$slider.noUiSlider({
        start: [initialSliderValue],
        range: {
            'min': 0,
            'max': 1
        },
        step: 1,
        pipsValues: null
    });

    this._$slider.noUiSlider_pips({
        mode: "values",
        values: [0,1],
        replaceFirstLabelMarking: true,
        replacedFirstValue: "0",
        firstLabelMarking: "Border-box", 
        replaceLastLabelMarking: true,
        replacedValue: "1",
        lastLabelMarking: "Content-box"
    });

    setTimeout(function() { me._$slider.trigger("slide"); }, 0);
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.SingleMeasurementItemCss.prototype._initSliderValues = function(initialSliderValue) {
    var me = this;

    var minSliderValue = 0;
    this._$slider.noUiSlider({
        start: [initialSliderValue],
        connect: "lower",
        step: 1,
        range: {
            'min': minSliderValue,
            'max': 100
        }
    });

    var $sliderPipValuePostfix = $("<span/>").addClass(this._css.sliderPipValuesPostfixClass).text("px");
    this._$slider.noUiSlider_pips({
        mode: "values",
        values: [0,10,20,30,40,50,60,70,80,90,100],
        format: wNumb({
            decimals: 0,
            postfix: $sliderPipValuePostfix.get(0).outerHTML
        })
    });

    setTimeout(function() { me._$slider.trigger("slide"); }, 0);
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.SingleMeasurementItemCss.prototype._createHorizontalArrow = function(disableLeft,
                                                                                                                        disableRight) {
    var disableLeft = disableLeft || false;
    var disableRight = disableRight || false;

    var $arrowIcon = $("<div/>").addClass(this._css.demonstratorWidthArrowClass);

    var $arrowIconLeft = $("<div/>").addClass(this._css.demonstratorWidthArrowLeftClass);
    var $arrowIconCenter = $("<div/>").addClass(this._css.demonstratorWidthArrowCenterClass);
    var $arrowIconRight = $("<div/>").addClass(this._css.demonstratorWidthArrowRightClass);

    if(this._demoLayout.isVerticalGrid()) {
        if(!disableLeft) $arrowIconLeft.addClass(this._css.verticalGridRightBorderColorClass);
        $arrowIconCenter.addClass(this._css.verticalGridBgClass);
        if(!disableRight) $arrowIconRight.addClass(this._css.verticalGridLeftBorderColorClass);
    }
    else if(this._demoLayout.isHorizontalGrid()) {
        if(!disableLeft) $arrowIconLeft.addClass(this._css.horizontalGridRightBorderColorClass);
        $arrowIconCenter.addClass(this._css.horizontalGridBgClass);
        if(!disableRight) $arrowIconRight.addClass(this._css.horizontalGridLeftBorderColorClass);
    }

    $arrowIcon.append($arrowIconLeft);
    $arrowIcon.append($arrowIconCenter);
    $arrowIcon.append($arrowIconRight);

    return $arrowIcon;
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.SingleMeasurementItemCss.prototype._createVerticalArrow = function(disableTop,
                                                                                                                      disableBottom) {
    var disableTop = disableTop || false;
    var disableBottom = disableBottom || false;

    var $arrowIcon = $("<div/>").addClass(this._css.demonstratorHeightArrowClass);

    var $arrowIconTop = $("<div/>").addClass(this._css.demonstratorHeightArrowTopClass);
    var $arrowIconMiddle = $("<div/>").addClass(this._css.demonstratorHeightArrowMiddleClass);
    var $arrowIconBottom = $("<div/>").addClass(this._css.demonstratorHeightArrowBottomClass);

    if(this._demoLayout.isVerticalGrid()) {
        if(!disableTop) $arrowIconTop.addClass(this._css.verticalGridBottomBorderColorClass);
        $arrowIconMiddle.addClass(this._css.verticalGridBgClass);
        if(!disableBottom) $arrowIconBottom.addClass(this._css.verticalGridTopBorderColorClass);
    }
    else if(this._demoLayout.isHorizontalGrid()) { 
        if(!disableTop) $arrowIconTop.addClass(this._css.horizontalGridBottomBorderColorClass);
        $arrowIconMiddle.addClass(this._css.horizontalGridBgClass);
        if(!disableBottom) $arrowIconBottom.addClass(this._css.horizontalGridTopBorderColorClass);
    }

    $arrowIcon.append($arrowIconTop);
    $arrowIcon.append($arrowIconMiddle);
    $arrowIcon.append($arrowIconBottom);

    return $arrowIcon;
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.SingleMeasurementItemCss.prototype._createBorderWidthValueDemonstrator = function() {
    var $item = $("<div/>").addClass(this._css.marginDemonstratorItemClass);
    this._$selectedValueDemonstrator.append($item);
    this._$selectedValueDemonstrator.addClass(this._css.demonstratorNoBorderClass);
    this._$selectedValueDemonstrator.css("top", "85px");

    var $leftArrow = this._createHorizontalArrow(true);
    var $rightArrow = this._createHorizontalArrow(false, true);
    $leftArrow.css({"top": "42px", "left": "-11px"});
    $rightArrow.css({"top": "40px", "left": "102px"});

    this._$selectedValueDemonstrator.append($leftArrow);
    this._$selectedValueDemonstrator.append($rightArrow);

    this._$selectedValueDemonstrator.css({"height": "110px"});

    var $leftDemonstratorValue = $("<div/>").addClass(this._css.selectedValueDemonstratorValueClass);
    var $rightDemonstratorValue = $("<div/>").addClass(this._css.selectedValueDemonstratorValueClass);
    $leftDemonstratorValue.css({"top": "75px", "left": "-3px"});
    $rightDemonstratorValue.css({"top": "75px", "left": "95px"});

    this._$selectedValueDemonstrator.append($leftDemonstratorValue);
    this._$selectedValueDemonstrator.append($rightDemonstratorValue);

    this._selectedValueDemonstratorValues.push($leftDemonstratorValue);
    this._selectedValueDemonstratorValues.push($rightDemonstratorValue);
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.SingleMeasurementItemCss.prototype._createBorderHeightValueDemonstrator = function() {
    var $item = $("<div/>").addClass(this._css.marginDemonstratorItemClass);
    $item.css({"left": "70%", "top": "54%"});
    this._$selectedValueDemonstrator.append($item);
    this._$selectedValueDemonstrator.addClass(this._css.demonstratorNoBorderClass);
    this._$selectedValueDemonstrator.css("top", "93px");

    var $topArrow = this._createVerticalArrow(true);
    var $bottomArrow = this._createVerticalArrow(false, true);
    $topArrow.css({"left": "91px", "top": "-20px"});
    $bottomArrow.css({"left": "91px", "top": "84px"});

    this._$selectedValueDemonstrator.append($topArrow);
    this._$selectedValueDemonstrator.append($bottomArrow);

    this._$selectedValueDemonstrator.css({"height": "110px"});

    var $topDemonstratorValue = $("<div/>").addClass(this._css.selectedValueDemonstratorValueClass);
    var $bottomDemonstratorValue = $("<div/>").addClass(this._css.selectedValueDemonstratorValueClass);
    $topDemonstratorValue.css({"top": "-4px", "left": "23px"});
    $bottomDemonstratorValue.css({"top": "88px", "left": "23px"});

    this._$selectedValueDemonstrator.append($topDemonstratorValue);
    this._$selectedValueDemonstrator.append($bottomDemonstratorValue);

    this._selectedValueDemonstratorValues.push($topDemonstratorValue);
    this._selectedValueDemonstratorValues.push($bottomDemonstratorValue);
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.SingleMeasurementItemCss.prototype._createSelectedValueDemonstrator = function(measurementType) {
    this._$selectedValueDemonstrator = $("<div/>").addClass(this._css.selectedValueDemonstratorClass);
    this._$view.parent().append(this._$selectedValueDemonstrator);

    var measurementTypes = DemoLayoutBuilder.DemoLayout.GridControls.Selector.SingleMeasurementItemCss.MEASUREMENT_TYPES;
    if(measurementType == measurementTypes.BORDER_WIDTH)
        this._createBorderWidthValueDemonstrator();
    else if(measurementType == measurementTypes.BORDER_HEIGHT)
        this._createBorderHeightValueDemonstrator();
}