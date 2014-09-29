DemoLayoutBuilder.DemoLayout.GridControls.Selector.BatchSize.LeftSide = function($selectorLeftSide, 
                                                                                                                                 demoLayout, 
                                                                                                                                 eventsUID,
                                                                                                                                 batchSize,
                                                                                                                                 sliderChangeHandler) {
    var me = this;

    this._$view = null;
    this._eventsUID = null;

    this._demoLayout = null;

    this._$optionLabelRightSide = null;
    this._$optionLabelRightSideSeparator = null;
    this._$optionLabelRightSideValue = null;
    this._$batchSizeSlider = null;

    this._sliderChangeHandler = null;

    this._css = {
        containerClass: "batchSizeControls",
        batchSizeSliderClass: "batchSizeSlider",
        optionLabelRightSideClass: "optionLabelRightSide",
        optionLabelRightSideSeparator: "separator",
        optionLabelRightSideValue: "value",

        horizontalGridSliderClass: "horizontalNoUiSlider",
        verticalGridSliderClass: "verticalNoUiSlider"
    }

    this._construct = function() {
        me._eventsUID = eventsUID;
        me._demoLayout = demoLayout;
        me._sliderChangeHandler = sliderChangeHandler;

        me._$view = $("<div/>").addClass(me._css.containerClass);

        me._createOptionLabelRightSide();
        me._createSlider(batchSize);

        $selectorLeftSide.append(me._$view);

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

DemoLayoutBuilder.DemoLayout.GridControls.Selector.BatchSize.LeftSide.EVENT_BATCH_SIZE_CHANGE = 
"DemoLayoutBuilder.DemoLayout.GridControls.Selector.BatchSize.LeftSize.EventBatchSizeChange";

DemoLayoutBuilder.DemoLayout.GridControls.Selector.BatchSize.LeftSide.prototype._createSlider = function(initialBatchSize) {
    this._$batchSizeSlider = $("<div/>").addClass(this._css.batchSizeSliderClass);
    this._$view.append(this._$batchSizeSlider);

    if(this._demoLayout.isVerticalGrid())
        this._$batchSizeSlider.addClass(this._css.verticalGridSliderClass);
    else if(this._demoLayout.isHorizontalGrid())
        this._$batchSizeSlider.addClass(this._css.horizontalGridSliderClass);

    this._$batchSizeSlider.noUiSlider({
        start: [initialBatchSize], 
        connect: "lower",
        step: 5,
        snap: true,
        range: {
            'min': [1],
            '10%': [2],
            '20%': [3],
            '30%': [5],
            '40%': [10],
            '50%': [15],
            '70%': [25],
            'max': [50]
        }
    });

    var me = this;
    this._$batchSizeSlider.on({
        slide: function() {
            var batchSize = Math.round(me._$batchSizeSlider.val());
            me._$optionLabelRightSideValue.html((batchSize == 1) ? "1 item" : batchSize + " items");
            
            $(window).trigger(
                DemoLayoutBuilder.DemoLayout.GridControls.Selector.BatchSize.LeftSide.EVENT_BATCH_SIZE_CHANGE,
                [me._eventsUID, batchSize]
            );

            me._sliderChangeHandler(batchSize);
        }
    });
    this._$batchSizeSlider.trigger("slide");

    this._$batchSizeSlider.noUiSlider_pips({
        mode: 'values',
        values: [1,2,3,5,10,15,25,50]
    });
}

DemoLayoutBuilder.DemoLayout.GridControls.Selector.BatchSize.LeftSide.prototype._createOptionLabelRightSide = function() {
    this._$optionLabelRightSide = $("<div/>").addClass(this._css.optionLabelRightSideClass);

    this._$optionLabelRightSideSeparator = $("<div/>").addClass(this._css.optionLabelRightSideSeparator);
    this._$optionLabelRightSideValue = $("<div/>").addClass(this._css.optionLabelRightSideValue);
    this._$optionLabelRightSide.append(this._$optionLabelRightSideSeparator).append(this._$optionLabelRightSideValue);

    this._$optionLabelRightSideSeparator.html(">>");

    this._$view.append(this._$optionLabelRightSide);
}