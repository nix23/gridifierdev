DemoLayoutBuilder.DemoLayout.GridControls = function($targetEl, 
                                                     demoLayout, 
                                                     controlsType, 
                                                     gridifierDynamicSettings,
                                                     gridControlsManager) {
    var me = this;

    this._$view = null;

    this._controlsType = null;
    this._gridifierDynamicSettings = null;
    this._gridControlsManager = null;

    this._demoLayout = null;
    this._legendDecorator = null;

    this._$controlsHeading = null;
    this._$gridItemSettingsSelector = null;
    this._$applyToAllControl = null;

    this._headingControls = [];

    this._$itemSizesControl = null;

    this._$clearGridControl = null;
    this._$itemCssControl = null;

    this._controls = [];

    this._$prependControl = null;
    this._$appendControl = null;
    this._$batchSizeControl = null;
    this._$toggleControl = null;
    this._$filterControl = null;
    this._$sortControl = null;

    this._selectorManager = null;

    this._css = {
        verticalGridHighlightedTextColorClass: "gridFifthColor",
        horizontalGridHighlightedTextColorClass: "gridFourthColor",
        selectorIconClass: "selectorIcon",

        verticalGridSelectedControlItemBgClass: "gridFifthBg",
        horizontalGridSelectedControlItemBgClass: "gridFourthBg",
        selectedControlItemColor: "selected",
        selectedSelectorIconClass: "selectedSelectorIcon",

        controlsHeadingClass: "controlsHeading",
        controlsHeadingLegendPrefixClass: "legendPrefix",
        controlsHeadingButtonTextHighlightClass: "buttonTextHighlight",
        controlsHeadingSelectorTextHighlightClass: "selectorTextHighlight",

        controlsHeadingClearGridControlClass: "clearGridControl",
        controlsHeadingItemCssControlClass: "selectItemCssControl",

        controlsHeadingBorderValueClass: "borderValue",
        controlsHeadingMarginValueClass: "marginValue",
        controlsHeadingBoxSizingValueClass: "boxSizingValue",

        controlsHeadingGridItemsSettingSelectorClass: "gridItemSettingsSelector",
        controlsHeadingGridItemsSettingSelectorItemWidthClass: "itemWidth",
        controlsHeadingGridItemsSettingSelectorItemHeightClass: "itemHeight",
        controlsHeadingGridItemsSettingSelectorWrapperClass: "selectorWrapper",
        controlsHeadingGridItemsSettingSelectorWrapperBorderClass: "selectorWrapperBorder",
        controlsHeadingGridItemsSettingSelectorSelectorIconClass: "selectorIcon",
        controlsHeadingGridItemsSettingSelectorSelectedSelectorIconClass: "selectedSelectorIcon",
        controlsHeadingGridItemsSettingSelectedSelectorClass: "selectedSelector",
        controlsHeadingGridItemSizeSelectorBorder: "gridItemSizeSelectorBorder",
        controlsHeadingApplyToAllControlClass: "applyToAllItemSetting",
        controlsHeadingSelectedApplyToAllControlsClass: "selectedApplyToAllItemSetting",
        controlsHeadingItemSizesPrefix: "item",
        controlsHeadingItemSizesPostfix: "Sizes",

        verticalGridSelectedBorderClass: "gridFifthSelectorBorderColor",
        horizontalGridSelectedBorderClass: "gridFourthSelectorBorderColor",

        topLeftControlClass: "topLeftControl",
        topRightControlClass: "topRightControl",
        middleLeftControlClass: "middleLeftControl",
        middleRightControlClass: "middleRightControl",
        bottomLeftControlClass: "bottomLeftControl",
        bottomRightControlClass: "bottomRightControl",

        legendDefaultTextClass: "defaultText",
        legendHighlightedTextClass: "highlightedText",
        sublabelTextClass: "sublabelText",

        itemSettingsClass: "itemSettings",
        itemSettingClass: "itemSetting",
        itemWidthClass: "itemWidth",
        itemHeightClass: "itemHeight",
        disabledItemClass: "disabledItemSetting"
    };

    this._verticalGridViewParams = {
        legendHighlightedTextColorClass: me._css.verticalGridHighlightedTextColorClass,
        selectedControlItemBgClass: me._css.verticalGridSelectedControlItemBgClass,
        labelStrongBgClass: me._css.verticalGridSelectedControlItemBgClass,
        selectedBorderClass: me._css.verticalGridSelectedBorderClass
    };

    this._horizontalGridViewParams = {
        legendHighlightedTextColorClass: me._css.horizontalGridHighlightedTextColorClass,
        selectedControlItemBgClass: me._css.horizontalGridSelectedControlItemBgClass,
        labelStrongBgClass: me._css.horizontalGridSelectedControlItemBgClass,
        selectedBorderClass: me._css.horizontalGridSelectedBorderClass
    };

    this._viewParams = null;

    this._construct = function() {
        me._demoLayout = demoLayout;
        me._controlsType = controlsType;
        me._gridifierDynamicSettings = gridifierDynamicSettings;
        me._gridControlsManager = gridControlsManager;

        me._attachView();
        if(me._demoLayout.isVerticalGrid())
            me._viewParams = me._verticalGridViewParams;
        else if(me._demoLayout.isHorizontalGrid())
            me._viewParams = me._horizontalGridViewParams;
        me._legendDecorator = new DemoLayoutBuilder.DemoLayout.GridControls.LegendDecorator(me._demoLayout, me, me._viewParams);

        me._$controlsHeading = me._$view.find("." + me._css.controlsHeadingClass);
        me._decorateControlHeading();

        me._$gridItemSettingsSelector = me._$view.find("." + me._css.controlsHeadingGridItemsSettingSelectorClass);
        me._$applyToAllControl = me._$view.find("." + me._css.controlsHeadingApplyToAllControlClass);

        me._$itemSizesControl = me._$gridItemSettingsSelector;

        me._$clearGridControl = me._$view.find("." + me._css.controlsHeadingClearGridControlClass);
        me._$itemCssControl = me._$view.find("." + me._css.controlsHeadingItemCssControlClass);

        me._headingControls.push(me._$clearGridControl);
        me._headingControls.push(me._$itemCssControl);

        if(me.areTopControls())
        {
            me._$toggleControl = me._$view.find("." + me._css.topLeftControlClass);
            me._$filterControl = me._$view.find("." + me._css.middleLeftControlClass);
            me._$sortControl = me._$view.find("." + me._css.bottomLeftControlClass);

            me._$batchSizeControl = me._$view.find("." + me._css.topRightControlClass);
            me._$prependControl = me._$view.find("." + me._css.bottomRightControlClass);
            me._$appendControl =  me._$view.find("." + me._css.middleRightControlClass);
        }
        else if(me.areBottomControls())
        {
            me._$toggleControl = me._$view.find("." + me._css.bottomLeftControlClass);
            me._$filterControl = me._$view.find("." + me._css.middleLeftControlClass);
            me._$sortControl = me._$view.find("." + me._css.topLeftControlClass); 

            me._$batchSizeControl = me._$view.find("." + me._css.bottomRightControlClass);
            me._$prependControl = me._$view.find("." + me._css.topRightControlClass);
            me._$appendControl = me._$view.find("." + me._css.middleRightControlClass);
        }

        me._controls.push(me._$batchSizeControl);
        me._controls.push(me._$prependControl);
        me._controls.push(me._$appendControl);
        me._controls.push(me._$toggleControl);
        me._controls.push(me._$sortControl);
        me._controls.push(me._$filterControl);

        me._selectorManager = new DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager(
            me, 
            me._gridifierDynamicSettings,
            me._gridControlsManager,
            me._demoLayout, 
            me._$itemSizesControl,
            me._$itemCssControl,
            me._$toggleControl, 
            me._$filterControl, 
            me._$sortControl, 
            me._$batchSizeControl
        );

        me._decorateControlLegends();
        me._legendDecorator.decorateLegendSublabels(me._controls);

        me._bindEvents();
    }

    this._decorateControlHeading = function() {
        var elementsToHighlight = [];

        $.each(me._$controlsHeading.find("." + me._css.controlsHeadingLegendPrefixClass), function() {
            elementsToHighlight.push($(this));
        });

        $.each(me._$controlsHeading.find("." + me._css.controlsHeadingButtonTextHighlightClass), function() {
            elementsToHighlight.push($(this));
        });

        $.each(me._$controlsHeading.find("." + me._css.controlsHeadingSelectorTextHighlightClass), function() {
            elementsToHighlight.push($(this));
        });

        for(var i = 0; i < elementsToHighlight.length; i++)
        {
            if(this._demoLayout.isVerticalGrid())
                elementsToHighlight[i].addClass(this._css.verticalGridHighlightedTextColorClass);
            else if(this._demoLayout.isHorizontalGrid())
                elementsToHighlight[i].addClass(this._css.horizontalGridHighlightedTextColorClass);
        }
    }

    this._decorateControlLegends = function() {
        me._legendDecorator.decoratePrependControl(me._$prependControl);
        me._legendDecorator.decorateAppendControl(me._$appendControl);
        me._legendDecorator.decorateBatchSizeControl(me._$batchSizeControl);
        me._legendDecorator.decorateToggleControl(me._$toggleControl);
        me._legendDecorator.decorateSortControl(me._$sortControl);
        me._legendDecorator.decorateFilterControl(me._$filterControl);
    }

    this._bindEvents = function() {
        for(var i = 0; i < me._controls.length; i++)
        {
            var $control = me._controls[i];
            $control.on("mouseenter", function() {
                me._setSelectedControl($(this));
            });

            $control.on("mouseleave", function(event) {
                if(!me._selectorManager.isMouseOverSelector(event.pageX, event.pageY)) {
                    me.unsetSelectedControl($(this));
                    return;
                }
            });
        }

        for(var i = 0; i < me._headingControls.length; i++)
        {
            var $headingControl = me._headingControls[i];
            $headingControl.on("mouseenter", function() {
                me._setSelectedHeadingControl($(this));
            });
        }

        for(var i = 0; i < me._headingControls.length; i++)
        {
            var $headingControl = me._headingControls[i];
            $headingControl.on("mouseleave", function(event) {
                if(!me._selectorManager.isMouseOverSelector(event.pageX, event.pageY)) {
                    me.unsetSelectedHeadingControl($(this));
                    return;
                }
            });
        }

        me._$clearGridControl.on("click", function() {
            console.log("Clear grid!");
        });

        me._$gridItemSettingsSelector.on("mouseenter", function() {
            me._setSelectedGridItemSettingControl($(this));
        });

        me._$gridItemSettingsSelector.on("mouseleave", function(event) { 
            if(!me._selectorManager.isMouseOverSelector(event.pageX, event.pageY)) {
                me.unsetSelectedGridItemSettingControl($(this));
                return;
            }
        });

        me._$applyToAllControl.on("mouseenter", function() {
            $(this).addClass(me._viewParams.selectedControlItemBgClass);
            $(this).addClass(me._css.controlsHeadingSelectedApplyToAllControlsClass);
        });

        me._$applyToAllControl.on("mouseleave", function() {
            $(this).removeClass(me._viewParams.selectedControlItemBgClass);
            $(this).removeClass(me._css.controlsHeadingSelectedApplyToAllControlsClass);
        });

        me._$applyToAllControl.on("click", function() {
            $clickedItemSetting = $(this).closest("." + me._css.itemSettingClass);
            clickedItemWidth = $clickedItemSetting.find("." + me._css.itemWidthClass).text();
            clickedItemHeight = $clickedItemSetting.find("." + me._css.itemHeightClass).text();

            me._gridControlsManager.setAllItemSizes(clickedItemWidth, clickedItemHeight);
            me._gridifierDynamicSettings.setAllItemSizes(clickedItemWidth, clickedItemHeight);
        });

        me._$prependControl.on("click", function() {
            $(me).trigger(DemoLayoutBuilder.DemoLayout.GridControls.EVENT_CONTROL_SELECT, [
                DemoLayoutBuilder.DemoLayout.GridControls.CONTROLS.PREPEND
            ]);
        });

        me._$appendControl.on("click", function() {
            $(me).trigger(DemoLayoutBuilder.DemoLayout.GridControls.EVENT_CONTROL_SELECT, [
                DemoLayoutBuilder.DemoLayout.GridControls.CONTROLS.APPEND
            ]);
        });
    }

    this._unbindEvents = function() {

    }

    this.destruct = function() {
        me._unbindEvents();
    }

    this._attachView = function() {
        if(me._demoLayout.isVerticalGrid())
            var viewParams = me._verticalGridViewParams;
        else if(me._demoLayout.isHorizontalGrid())
            var viewParams = me._horizontalGridViewParams;

        me._$view = View.attach(me._$view, $targetEl, View.ids.DEMO_LAYOUT_BUILDER.DEMO_LAYOUT.GRID_CONTROLS, viewParams);
    }

    this._construct();
    return this;
}

DemoLayoutBuilder.DemoLayout.GridControls.EVENT_CONTROL_SELECT = "DemoLayoutBuilder.DemoLayout.GridControls.controlSelect";

DemoLayoutBuilder.DemoLayout.GridControls.CONTROLS_TYPES = {TOP: 0, BOTTOM: 1};
DemoLayoutBuilder.DemoLayout.GridControls.HEADER_CONTROL_TYPES = {
    BORDER: 0, MARGIN: 1, BOX_SIZING: 2
};
DemoLayoutBuilder.DemoLayout.GridControls.CONTROLS = {
    APPEND: 0, PREPEND: 1, FILTER: 2, SORT: 3, TOGGLE: 4, BATCH_SIZE: 5
};

DemoLayoutBuilder.DemoLayout.GridControls.prototype._setSelectedGridItemSettingControl = function($gridItemSettingControl) {
    $gridItemSettingControl.addClass(this._viewParams.selectedControlItemBgClass);
    $gridItemSettingControl.addClass(this._css.controlsHeadingGridItemsSettingSelectedSelectorClass);
    $gridItemSettingControl.addClass(this._css.controlsHeadingGridItemSizeSelectorBorder);

    var $itemWidth = $gridItemSettingControl.find("." + this._css.controlsHeadingGridItemsSettingSelectorItemWidthClass);
    var $itemHeight = $gridItemSettingControl.find("." + this._css.controlsHeadingGridItemsSettingSelectorItemHeightClass);
    $itemWidth.addClass(this._css.controlsHeadingGridItemsSettingSelectedSelectorClass);
    $itemHeight.addClass(this._css.controlsHeadingGridItemsSettingSelectedSelectorClass);

    var $selectorWrapper = $gridItemSettingControl.find("." + this._css.controlsHeadingGridItemsSettingSelectorWrapperClass);
    $selectorWrapper.addClass(this._viewParams.selectedControlItemBgClass);
    $selectorWrapper.addClass(this._css.controlsHeadingGridItemsSettingSelectorWrapperBorderClass);

    var $selectorIcon = $gridItemSettingControl.find("." + this._css.controlsHeadingGridItemsSettingSelectorSelectorIconClass);
    $selectorIcon.addClass(this._css.controlsHeadingGridItemsSettingSelectorSelectedSelectorIconClass);
}

DemoLayoutBuilder.DemoLayout.GridControls.prototype.unsetSelectedGridItemSettingControl = function($gridItemSettingControl) {
    $gridItemSettingControl.removeClass(this._viewParams.selectedControlItemBgClass);
    $gridItemSettingControl.removeClass(this._css.controlsHeadingGridItemsSettingSelectedSelectorClass);
    $gridItemSettingControl.removeClass(this._css.controlsHeadingGridItemSizeSelectorBorder);

    var $itemWidth = $gridItemSettingControl.find("." + this._css.controlsHeadingGridItemsSettingSelectorItemWidthClass);
    var $itemHeight = $gridItemSettingControl.find("." + this._css.controlsHeadingGridItemsSettingSelectorItemHeightClass);
    $itemWidth.removeClass(this._css.controlsHeadingGridItemsSettingSelectedSelectorClass);
    $itemHeight.removeClass(this._css.controlsHeadingGridItemsSettingSelectedSelectorClass);

    var $selectorWrapper = $gridItemSettingControl.find("." + this._css.controlsHeadingGridItemsSettingSelectorWrapperClass);
    $selectorWrapper.removeClass(this._viewParams.selectedControlItemBgClass);
    $selectorWrapper.removeClass(this._css.controlsHeadingGridItemsSettingSelectorWrapperBorderClass);

    var $selectorIcon = $gridItemSettingControl.find("." + this._css.controlsHeadingGridItemsSettingSelectorSelectorIconClass);
    $selectorIcon.removeClass(this._css.controlsHeadingGridItemsSettingSelectorSelectedSelectorIconClass);
}

DemoLayoutBuilder.DemoLayout.GridControls.prototype._setSelectedHeadingControl = function($headingControl) {
    var me = this;
    $headingControl.addClass(this._viewParams.selectedControlItemBgClass);
    $headingControl.addClass(me._css.selectedControlItemColor);
    $.each($headingControl.find("span"), function() {
        $(this).addClass(me._css.selectedControlItemColor);
    });

    var $selectorIcon = $headingControl.find("." + this._css.selectorIconClass);
    if($selectorIcon.length > 0)
        $selectorIcon.addClass(this._css.selectedSelectorIconClass);
}

DemoLayoutBuilder.DemoLayout.GridControls.prototype.unsetSelectedHeadingControl = function($headingControl) {
    var me = this;
    $headingControl.removeClass(this._viewParams.selectedControlItemBgClass);
    $headingControl.removeClass(me._css.selectedControlItemColor);
    $.each($headingControl.find("span"), function() {
        $(this).removeClass(me._css.selectedControlItemColor);
    });

    var $selectorIcon = $headingControl.find("." + this._css.selectorIconClass);
    if($selectorIcon.length > 0)
        $selectorIcon.removeClass(this._css.selectedSelectorIconClass);
}

DemoLayoutBuilder.DemoLayout.GridControls.prototype._setSelectedControl = function($control) {
    $control.addClass(this._viewParams.selectedControlItemBgClass);
    $control.find("." + this._css.legendDefaultTextClass).addClass(this._css.selectedControlItemColor);
    $control.find("." + this._css.legendHighlightedTextClass).addClass(this._css.selectedControlItemColor);
    $control.find("." + this._css.sublabelTextClass).addClass(this._css.selectedControlItemColor);

    var $selectorIcon = $control.find("." + this._css.selectorIconClass);
    if($selectorIcon.length > 0)
        $selectorIcon.addClass(this._css.selectedSelectorIconClass);
}

DemoLayoutBuilder.DemoLayout.GridControls.prototype.unsetSelectedControl = function($control) {
    $control.removeClass(this._viewParams.selectedControlItemBgClass);
    $control.find("." + this._css.legendDefaultTextClass).removeClass(this._css.selectedControlItemColor);
    $control.find("." + this._css.legendHighlightedTextClass).removeClass(this._css.selectedControlItemColor);
    $control.find("." + this._css.sublabelTextClass).removeClass(this._css.selectedControlItemColor);

    var $selectorIcon = $control.find("." + this._css.selectorIconClass);
    if($selectorIcon.length > 0)
        $selectorIcon.removeClass(this._css.selectedSelectorIconClass);
}

DemoLayoutBuilder.DemoLayout.GridControls.prototype.areTopControls = function() {
    return this._controlsType == DemoLayoutBuilder.DemoLayout.GridControls.CONTROLS_TYPES.TOP;
}

DemoLayoutBuilder.DemoLayout.GridControls.prototype.areBottomControls = function() {
    return this._controlsType == DemoLayoutBuilder.DemoLayout.GridControls.CONTROLS_TYPES.BOTTOM;
}

DemoLayoutBuilder.DemoLayout.GridControls.prototype._getControlByConst = function(control) {
    if(control == DemoLayoutBuilder.DemoLayout.GridControls.CONTROLS.APPEND)
        return this._$appendControl;
    else if(control == DemoLayoutBuilder.DemoLayout.GridControls.CONTROLS.PREPEND)
        return this._$prependControl;
    else if(control == DemoLayoutBuilder.DemoLayout.GridControls.CONTROLS.FILTER)
        return this._$filterControl;
    else if(control == DemoLayoutBuilder.DemoLayout.GridControls.CONTROLS.SORT)
        return this._$sortControl;
    else if(control == DemoLayoutBuilder.DemoLayout.GridControls.CONTROLS.TOGGLE)
        return this._$toggleControl;
    else if(control == DemoLayoutBuilder.DemoLayout.GridControls.CONTROLS.BATCH_SIZE)
        return this._$batchSizeControl;
    else
        throw new Error("GridControls: Unknown control const: " + control);
}

DemoLayoutBuilder.DemoLayout.GridControls.prototype._getHeaderControlByConst = function(controlType) {
    if(controlType == DemoLayoutBuilder.DemoLayout.GridControls.HEADER_CONTROL_TYPES.BORDER)
        return this._$itemCssControl.find("." + this._css.controlsHeadingBorderValueClass);
    else if(controlType == DemoLayoutBuilder.DemoLayout.GridControls.HEADER_CONTROL_TYPES.MARGIN)
        return this._$itemCssControl.find("." + this._css.controlsHeadingMarginValueClass);
    else if(controlType == DemoLayoutBuilder.DemoLayout.GridControls.HEADER_CONTROL_TYPES.BOX_SIZING)
        return this._$itemCssControl.find("." + this._css.controlsHeadingBoxSizingValueClass);
    else
        throw new Error("GridControls: Unknown control conts: " + control);
}

DemoLayoutBuilder.DemoLayout.GridControls.prototype.setHeadingControlLabel = function(controlType, newLabel) {
    var $headerControl = this._getHeaderControlByConst(controlType);
    $headerControl.text(newLabel);
}

DemoLayoutBuilder.DemoLayout.GridControls.prototype._getItemSizes = function(itemSizesIndex) {
    var itemSizesClass = "";
    itemSizesClass += this._css.controlsHeadingItemSizesPrefix;
    itemSizesClass += itemSizesIndex;
    itemSizesClass += this._css.controlsHeadingItemSizesPostfix;

    var $itemSizes = this._$view.find("." + itemSizesClass);
    return $itemSizes;
}

DemoLayoutBuilder.DemoLayout.GridControls.prototype.setItemSizesLabel = function(itemSizesIndex, newWidthLabel, newHeightLabel) {
    var $itemSizes = this._getItemSizes(itemSizesIndex);

    var $itemWidth = $itemSizes.find("." + this._css.controlsHeadingGridItemsSettingSelectorItemWidthClass);
    var $itemHeight = $itemSizes.find("." + this._css.controlsHeadingGridItemsSettingSelectorItemHeightClass);

    $itemWidth.text(newWidthLabel);
    $itemHeight.text(newHeightLabel);
}

DemoLayoutBuilder.DemoLayout.GridControls.prototype.setItemWidthLabel = function(itemSizesIndex, newWidthLabel) {
    var $itemSizes = this._getItemSizes(itemSizesIndex); 
    var $itemWidth = $itemSizes.find("." + this._css.controlsHeadingGridItemsSettingSelectorItemWidthClass);
    $itemWidth.text(newWidthLabel); 
}

DemoLayoutBuilder.DemoLayout.GridControls.prototype.setItemHeightLabel = function(itemSizesIndex, newHeightLabel) {
    var $itemSizes = this._getItemSizes(itemSizesIndex);
    var $itemHeight = $itemSizes.find("." + this._css.controlsHeadingGridItemsSettingSelectorItemHeightClass);
    $itemHeight.text(newHeightLabel);
}

DemoLayoutBuilder.DemoLayout.GridControls.prototype.setControlSublabel = function(control, sublabel) {
    $control = this._getControlByConst(control); 
    this._legendDecorator.setControlSublabel($control, sublabel);
}

DemoLayoutBuilder.DemoLayout.GridControls.prototype.setEnabledItemControls = function(newBatchSize) {
    var me = this;
    var itemNumber = 0;

    $.each(this._$view.find("." + this._css.itemSettingClass), function() {
        var $disabledItemSetting = $(this).find("." + me._css.disabledItemClass);

        itemNumber++;
        if(itemNumber <= newBatchSize) {
            $disabledItemSetting.css("display", "none");
        }
        else {
            $disabledItemSetting.css("display", "block");
        }
    });
}