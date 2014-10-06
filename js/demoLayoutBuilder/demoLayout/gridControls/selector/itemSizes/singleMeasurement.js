DemoLayoutBuilder.DemoLayout.GridControls.Selector.SingleMeasurementItemSize = function($selectorRightSide, 
                                                                                                                                             demoLayout, 
                                                                                                                                             sliderChangeHandler,
                                                                                                                                             measurementValue) {
    var me = this;

    this._$view = null;

    this._demoLayout = null;

    this._$itemSizeRangesSlider = null;
    this._$itemSizeSlider = null;

    this._itemSizeRangesSliderInitialValue = null;
    this._itemSizeSliderInitialValue = null;

    this._sliderChangeHandler = null;

    this._css = {
        containerClass: "singleMeasurementItemSize",
        sliderClass: "slider",
        sliderMarginClass: "sliderMargin",

        postfixSliderPipValueClass: "sliderPipValuePostfix",

        horizontalGridSliderClass: "horizontalNoUiSlider",
        verticalGridSliderClass: "verticalNoUiSlider"
    }

    this._construct = function() {
        me._demoLayout = demoLayout;
        me._sliderChangeHandler = sliderChangeHandler;

        me._$view = $("<div/>").addClass(me._css.containerClass);
       
        me._transformMeasurementValueToSliderInitialValues(measurementValue);
        me._createItemSizeRangesSlider();

        $selectorRightSide.append(me._$view);

        me._bindEvents();
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

DemoLayoutBuilder.DemoLayout.GridControls.Selector.SingleMeasurementItemSize.prototype._transformMeasurementValueToSliderInitialValues = function(measurementValue) {
    var rangesSliderRanges = [
        {from: 1, to: 99}, 
        {from: 100, to: 199},
        {from: 200, to: 299},
        {from: 300, to: 399},
        {from: 400, to: 499},
        {from: 500, to: 599},
        {from: 600, to: 699},
        {from: 700, to: 799},
        {from: 800, to: 899},
        {from: 900, to: 999},
        {from: 1000, to: 1099},
        {from: 1100, to: 1199},
        {from: 1200, to: 1299},
        {from: 1300, to: 1399},
        {from: 1400, to: 1500}
    ];

    var measurementValue = parseInt(measurementValue, 10);
    for(var i = 0; i < rangesSliderRanges.length; i++)
    {
        if(measurementValue >= rangesSliderRanges[i].from && 
            measurementValue <= rangesSliderRanges[i].to) 
        {
            this._itemSizeRangesSliderInitialValue = rangesSliderRanges[i].from;
            break;
        }
    }

    this._itemSizeSliderInitialValue = measurementValue;
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.SingleMeasurementItemSize.SliderPipsValuesGenerator = function(pipsValues) {
    var me = this;
    this._pipsValues = null;
    this._nextPipValueIndex = -1;

    this._construct = function() {
        me._pipsValues = pipsValues;
    }

    this._css = {
        postfixSliderPipValueClass: "sliderPipValuePostfix"
    }

    this._getNextPipValue = function() {
        me._nextPipValueIndex++; 
        return me._pipsValues[me._nextPipValueIndex];
    }

    this._construct();
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.SingleMeasurementItemSize.SliderPipsValuesGenerator.prototype.toString = function() {
    var $postfixLabel = $("<span/>").addClass(this._css.postfixSliderPipValueClass).text("px");

    if(this._nextPipValueIndex + 1 == this._pipsValues.length)
        return $postfixLabel.get(0).outerHTML;

    return "-" + (this._getNextPipValue() + 99) + $postfixLabel.get(0).outerHTML;
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.SingleMeasurementItemSize.prototype._createItemSizeRangesSlider = function() {
    this._$itemSizeRangesSlider = $("<div/>").addClass(this._css.sliderClass);
    this._$view.append(this._$itemSizeRangesSlider);

    if(this._demoLayout.isVerticalGrid())
        this._$itemSizeRangesSlider.addClass(this._css.verticalGridSliderClass);
    else if(this._demoLayout.isHorizontalGrid())
        this._$itemSizeRangesSlider.addClass(this._css.horizontalGridSliderClass);

    this._$itemSizeRangesSlider.noUiSlider({
        start: [this._itemSizeRangesSliderInitialValue],
        connect: "lower",
        step: 100,
        range: {'min': 1, 'max': 1400}
    });

    var me = this;
    this._$itemSizeRangesSlider.on({
        slide: function() {
            var newPropertyValue = Math.round(me._$itemSizeRangesSlider.val()); 
            newPropertyValue = (newPropertyValue == 1400) ? newPropertyValue : newPropertyValue - 1;
            if(newPropertyValue == 0) newPropertyValue = 1;
            if(newPropertyValue == 101) newPropertyValue = 100; 
            me._initItemSizeSliderValues(newPropertyValue, true);
        }
    });
    me._createItemSizeSlider();

    this._$itemSizeRangesSlider.noUiSlider_pips({
        mode: "values",
        values: [1, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400],
        format: wNumb({
            decimals: 0,
            postfix: new DemoLayoutBuilder.DemoLayout.GridControls.Selector.SingleMeasurementItemSize.SliderPipsValuesGenerator(
                [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1401]
            )
        })
    });

    this._decorateItemSizeRangesSlider();
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.SingleMeasurementItemSize.prototype._decorateItemSizeRangesSlider = function() {
    var even = false;
    $.each(this._$itemSizeRangesSlider.find(".noUi-value"), function() { 
        if(even) { 
            var top = 30;
            $(this).css("position", "absolute");
            $(this).css("top", top + "px");
        }
        even = !even;
    });

    var even = false;
    $.each(this._$itemSizeRangesSlider.find(".noUi-marker-large"), function() {
        if(even) {
            $(this).css("height","35px");
        }
        even = !even;
    });
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.SingleMeasurementItemSize.prototype._createItemSizeSlider = function() {
    this._$itemSizeSlider = $("<div/>").addClass(this._css.sliderClass);
    this._$itemSizeSlider.addClass(this._css.sliderMarginClass);
    this._$view.append(this._$itemSizeSlider);

    if(this._demoLayout.isVerticalGrid())
        this._$itemSizeSlider.addClass(this._css.verticalGridSliderClass);
    else if(this._demoLayout.isHorizontalGrid())
        this._$itemSizeSlider.addClass(this._css.horizontalGridSliderClass);

    this._initItemSizeSliderValues(this._itemSizeSliderInitialValue);

    var me = this;
    this._$itemSizeSlider.on({
        slide: function() {
            var newPropertyValue = Math.round(me._$itemSizeSlider.val()); 
            me._sliderChangeHandler(newPropertyValue);
        }
    });
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.SingleMeasurementItemSize.prototype._getItemSizeSliderMaxValue = function(minSliderValue) {
    if(minSliderValue == 1) return 99;
    return (minSliderValue < 1400) ? minSliderValue + 99 : minSliderValue + 100;
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.SingleMeasurementItemSize.prototype._getItemSizeSliderMinValue = function(initialSliderValue) {
    var sliderRanges = [
        {from: 1, to: 99}, 
        {from: 100, to: 199},
        {from: 200, to: 299},
        {from: 300, to: 399},
        {from: 400, to: 499},
        {from: 500, to: 599},
        {from: 600, to: 699},
        {from: 700, to: 799},
        {from: 800, to: 899},
        {from: 900, to: 999},
        {from: 1000, to: 1099},
        {from: 1100, to: 1199},
        {from: 1200, to: 1299},
        {from: 1300, to: 1399},
        {from: 1400, to: 1500}
    ];

    for(var i = 0; i < sliderRanges.length; i++) {
        if(initialSliderValue >= sliderRanges[i].from && initialSliderValue <= sliderRanges[i].to)
            return sliderRanges[i].from;
    }
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.SingleMeasurementItemSize.prototype._getItemSizeSliderPipsValues = function(initialSliderValue) {
    if(initialSliderValue == 0) {
        var pipsValues = [initialSliderValue + 1];
        var nextPipValue = initialSliderValue + 9;
    }
    else {
        var pipsValues = [initialSliderValue];
        var nextPipValue = initialSliderValue + 9;
    }

    for(var i = 1; i <= 9; i++) {
        if(initialSliderValue > 99)
            pipsValues.push(nextPipValue + 1);
        else
            pipsValues.push(nextPipValue);
        nextPipValue += 10;
    }
    
    if(initialSliderValue == 1)
        pipsValues.push(nextPipValue - 1);
    else if(initialSliderValue != 1400)
        pipsValues.push(nextPipValue);
    else
        pipsValues.push(nextPipValue + 1);
    
    return pipsValues;
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.SingleMeasurementItemSize.prototype._initItemSizeSliderValues = function(initialSliderValue, reinit) {
    var me = this;
    var reinit = reinit || false;

    var minSliderValue = this._getItemSizeSliderMinValue(initialSliderValue);
    this._$itemSizeSlider.noUiSlider({
        start: [initialSliderValue],
        connect: "lower",
        step: 1,
        range: {
            'min': minSliderValue, 
            'max': this._getItemSizeSliderMaxValue(minSliderValue)
        }
    }, reinit);

    var $pipPostfix = $("<span/>").addClass(this._css.postfixSliderPipValueClass).text("px");
    this._$itemSizeSlider.noUiSlider_pips({
        mode: "values",
        values: me._getItemSizeSliderPipsValues(minSliderValue),
        format: wNumb({
            decimals: 0,
            postfix: $pipPostfix.get(0).outerHTML
        })
    });

    setTimeout(function() { me._$itemSizeSlider.trigger("slide"); }, 0);
}