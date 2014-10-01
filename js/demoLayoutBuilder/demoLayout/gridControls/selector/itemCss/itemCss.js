DemoLayoutBuilder.DemoLayout.GridControls.Selector.ItemCss = function($selectorRightSide, 
                                                                                                               demoLayout, 
                                                                                                               sliderChangeHandler,
                                                                                                               sliderType,
                                                                                                               sliderInitialValue) {
    var me = this;

    this._$view = null;

    this._demoLayout = null;

    this._$itemCssPropertySlider = null;
    this._sliderChangeHandler = null;

    this._css = {
        containerClass: "itemCssControls",
        sliderClass: "itemCssPropertySlider",

        horizontalGridSliderClass: "horizontalNoUiSlider",
        verticalGridSliderClass: "verticalNoUiSlider"
    }

    this._construct = function() {
        me._demoLayout = demoLayout;
        me._sliderChangeHandler = sliderChangeHandler;

        me._$view = $("<div/>").addClass(me._css.containerClass);
       
        me._createSlider(sliderType, sliderInitialValue);
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

DemoLayoutBuilder.DemoLayout.GridControls.Selector.ItemCss.SLIDER_TYPES = {
    BORDER: 0, MARGIN: 1, BOX_SIZING: 2
};

DemoLayoutBuilder.DemoLayout.GridControls.Selector.ItemCss.prototype._getSliderSettingsByType = function(sliderType) {
    if(sliderType == DemoLayoutBuilder.DemoLayout.GridControls.Selector.ItemCss.SLIDER_TYPES.BORDER)
    {
        return {
            range: {'min': 0, 'max': 25},
            pipsValues: [0, 5, 10, 15, 20, 25]
        }
    }
    else if(sliderType == DemoLayoutBuilder.DemoLayout.GridControls.Selector.ItemCss.SLIDER_TYPES.MARGIN)
    {
        return {
            range: {'min': 0, 'max': 100},
            pipsValues: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
        }
    }
    else if(sliderType == DemoLayoutBuilder.DemoLayout.GridControls.Selector.ItemCss.SLIDER_TYPES.BOX_SIZING)
    {
        return {
            range: {'min': 0, 'max': 1},
            pipsValues: null
        }
    }
    else
        throw new Error("Selector itemCss, can;t find settings by type: " + sliderType);
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.ItemCss.prototype._createSlider = function(sliderType, sliderInitialValue) {
    this._$itemCssPropertySlider = $("<div/>").addClass(this._css.sliderClass);
    this._$view.append(this._$itemCssPropertySlider);

    var sliderSettings = this._getSliderSettingsByType(sliderType);

    if(this._demoLayout.isVerticalGrid())
        this._$itemCssPropertySlider.addClass(this._css.verticalGridSliderClass);
    else if(this._demoLayout.isHorizontalGrid())
        this._$itemCssPropertySlider.addClass(this._css.horizontalGridSliderClass);

    this._$itemCssPropertySlider.noUiSlider({
        start: [sliderInitialValue],
        connect: "lower",
        step: 1,
        //snap: true,
        range: sliderSettings.range
    });

    var me = this;
    this._$itemCssPropertySlider.on({
        slide: function() {
            var newPropertyValue = Math.round(me._$itemCssPropertySlider.val());
            me._sliderChangeHandler(newPropertyValue);
        }
    });
    this._$itemCssPropertySlider.trigger("slide");

    if(sliderType != DemoLayoutBuilder.DemoLayout.GridControls.Selector.ItemCss.SLIDER_TYPES.BOX_SIZING) {
        this._$itemCssPropertySlider.noUiSlider_pips({
            mode: "values",
            values: sliderSettings.pipsValues,
            format: wNumb({
                decimals: 0,
                postfix: "px"
            })
        });
    }
    else {
        this._$itemCssPropertySlider.noUiSlider_pips({
            mode: "values",
            values: [0,1],
            replaceFirstLabelMarking: true,
            replacedFirstValue: "0",
            firstLabelMarking: "Border-box", 
            replaceLastLabelMarking: true,
            replacedValue: "1",
            lastLabelMarking: "Content-box"
        });
    }
}