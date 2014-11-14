DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager = function(gridControls,
                                                                                                              gridifierDynamicSettings,
                                                                                                              gridControlsManager,
                                                                                                              demoLayout, 
                                                                                                              $itemSizesControl,
                                                                                                              $itemCssControl,
                                                                                                              $toggleControl, 
                                                                                                              $filterControl, 
                                                                                                              $sortControl, 
                                                                                                              $batchSizeControl) {
    var me = this;

    this._$view = null;
    this._gridControls = gridControls;
    this._demoLayout = null;
    this._gridifierDynamicSettings = null;
    this._gridControlsManager = null;

    this._selectorControls = [];

    this._$itemSizesControl = null;
    this._$itemCssControl = null;
    this._$toggleControl = null;
    this._$filterControl = null;
    this._$sortControl = null;
    this._$batchSizeControl = null;

    this._currentSelector = null;
    this._currentSelectorType = null;

    this._animationMsInterval = 200;

    this._css = {
        gridControlsSelectorClass: "gridControlsSelector"
    }

    this._construct = function() {
        me._gridControls = gridControls;
        me._demoLayout = demoLayout;
        me._gridifierDynamicSettings = gridifierDynamicSettings;
        me._gridControlsManager = gridControlsManager;

        me._$itemSizesControl = $itemSizesControl;
        me._$itemCssControl = $itemCssControl;
        me._$toggleControl = $toggleControl;
        me._$filterControl = $filterControl;
        me._$sortControl = $sortControl;
        me._$batchSizeControl = $batchSizeControl;

        me._selectorControls.push(me._$itemSizesControl);
        me._selectorControls.push(me._$itemCssControl);
        me._selectorControls.push(me._$toggleControl);
        me._selectorControls.push(me._$filterControl);
        me._selectorControls.push(me._$sortControl);
        me._selectorControls.push(me._$batchSizeControl);

        me._bindEvents();
    }

    this._bindEvents = function() {
        me._$itemSizesControl.on("click", function() {
            if(me._isAnySelectorOpened())
            {
                if(me._isItemSizesSelectorOpened())
                    me._deleteCurrentSelector(null, true);
                else
                    me._deleteCurrentSelector(function() {
                        me._openItemSizesSelector($(this));
                    });
            }
            else
                me._openItemSizesSelector($(this));
        });

        me._$itemCssControl.on("click", function() {
            if(me._isAnySelectorOpened())
            {
                if(me._isItemCssSelectorOpened())
                    me._deleteCurrentSelector(null, true);
                else
                    me._deleteCurrentSelector(me._openItemCssSelector);
            }
            else
                me._openItemCssSelector();
        });

        me._$toggleControl.on("click", function() {
            if(me._isAnySelectorOpened())
            {
                if(me._isToggleSelectorOpened()) 
                    me._deleteCurrentSelector(null, true);
                else 
                    me._deleteCurrentSelector(me._openToggleSelector);
            }
            else
                me._openToggleSelector();
        });

        me._$filterControl.on("click", function() {
            if(me._isAnySelectorOpened())
            {
                if(me._isFilterSelectorOpened())
                    me._deleteCurrentSelector(null, true);
                else
                    me._deleteCurrentSelector(me._openFilterSelector);
            }
            else
                me._openFilterSelector();
        });

        me._$sortControl.on("click", function() {
            if(me._isAnySelectorOpened())
            {
                if(me._isSortSelectorOpened())
                    me._deleteCurrentSelector(null, true);
                else
                    me._deleteCurrentSelector(me._openSortSelector);
            }
            else
                me._openSortSelector();
        });

        me._$batchSizeControl.on("click", function() {
            if(me._isAnySelectorOpened())
            {
                if(me._isBatchSizeSelectorOpened())
                    me._deleteCurrentSelector(null, true);
                else
                    me._deleteCurrentSelector(me._openBatchSizeSelector);
            }
            else
                me._openBatchSizeSelector();
        });

        $("body").on(DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.EVENT_BODY_CLICK, function(event) {
            if(!me._isMouseOverSelector(event.pageX, event.pageY) && !me._isMouseOverAnyControl(event.pageX, event.pageY))
                me._deleteCurrentSelector();
        });

        for(var i = 0; i < me._selectorControls.length; i++)
        {
            me._selectorControls[i].on("mouseleave", function(event) { 
                if(!me._isMouseOverSelector(event.pageX, event.pageY))
                    me._deleteCurrentSelector();
            });
        }
    }

    this._unbindEvents = function() {
        $("body").off(DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.EVENT_BODY_CLICK);
    }

    this.destruct = function() {
        me._unbindEvents();
    }

    this._construct();
    return this;
}

DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.EVENT_BODY_CLICK = 
    "click.DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.EventBodyClick";

DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.SELECTOR_TYPES = {
    TOGGLE: 0, FILTER: 1, SORT: 2, BATCH_SIZE: 3, ITEM_CSS: 4, ITEM_SIZES: 5
}

DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.prototype._isMouseOverSelector = function(pageX, pageY) {
    if(this._currentSelector == null) return;
    var x1 = this._currentSelector.getView().offset().left;
    var x2 = x1 + this._currentSelector.getView().outerWidth() - 1;
    var y1 = this._currentSelector.getView().offset().top;
    var y2 = y1 + this._currentSelector.getView().outerHeight() - 1;

    if(pageX >= x1 && pageX <= x2 && pageY >= y1 && pageY <= y2)
        return true;
    else
        return false;
}

DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.prototype.isMouseOverSelector =
    DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.prototype._isMouseOverSelector;

DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.prototype._isMouseOverControl = function($control, x, y, boostControlRange) {
    var x1 = $control.offset().left;
    var x2 = x1 + $control.outerWidth() - 1;
    var y1 = $control.offset().top;
    var y2 = y1 + $control.outerHeight() - 1;

    // Item sizes selector absolute position icon fix
    if(boostControlRange)
        x2 += 30;

    return (x >= x1 && x <= x2 && y >= y1 && y <= y2) ? true : false;
}

DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.prototype._isMouseOverAnyControl = function(pageX, pageY) {
    var me = this;

    var isMouseOverAnyItemSizeControl = false;
    $.each(this._$itemSizesControl, function() {
        if(me._isMouseOverControl($(this), pageX, pageY, true))
            isMouseOverAnyItemSizeControl = true;
    });

    if(isMouseOverAnyItemSizeControl)
        return true;

    if(this._isMouseOverControl(this._$toggleControl, pageX, pageY) || this._isMouseOverControl(this._$filterControl, pageX, pageY)
        || this._isMouseOverControl(this._$sortControl, pageX, pageY) || this._isMouseOverControl(this._$batchSizeControl, pageX, pageY)
        || this._isMouseOverControl(this._$itemCssControl, pageX, pageY))
        return true;
    else
        return false;
}

DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.prototype._isAnySelectorOpened = function() {
    return this._currentSelectorType != null;
}

DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.prototype._isItemSizesSelectorOpened = function() {
    return this._currentSelectorType == DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.SELECTOR_TYPES.ITEM_SIZES;
}

DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.prototype._isToggleSelectorOpened = function() {
    return this._currentSelectorType == DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.SELECTOR_TYPES.TOGGLE;
}

DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.prototype._isItemCssSelectorOpened = function() {
    return this._currentSelectorType == DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.SELECTOR_TYPES.ITEM_CSS;
}

DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.prototype._isFilterSelectorOpened = function() {
    return this._currentSelectorType == DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.SELECTOR_TYPES.FILTER;
}

DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.prototype._isSortSelectorOpened = function() {
    return this._currentSelectorType == DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.SELECTOR_TYPES.SORT;
}

DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.prototype._isBatchSizeSelectorOpened = function() {
    return this._currentSelectorType == DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.SELECTOR_TYPES.BATCH_SIZE;
}

DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.prototype._openItemSizesSelector = function($itemSizesControl) {
    this._currentSelectorType = DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.SELECTOR_TYPES.ITEM_SIZES;
    this._createItemSizesSelector($itemSizesControl);
}

DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.prototype._openItemCssSelector = function() {
    this._currentSelectorType = DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.SELECTOR_TYPES.ITEM_CSS;
    this._createItemCssSelector();
}

DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.prototype._openToggleSelector = function() {
    this._currentSelectorType = DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.SELECTOR_TYPES.TOGGLE;
    this._createToggleSelector();
}

DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.prototype._openFilterSelector = function() {
    this._currentSelectorType = DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.SELECTOR_TYPES.FILTER;
    this._createFilterSelector();
}

DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.prototype._openSortSelector = function() {
    this._currentSelectorType = DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.SELECTOR_TYPES.SORT;
    this._createSortSelector();
}

DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.prototype._openBatchSizeSelector = function() {
    this._currentSelectorType = DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.SELECTOR_TYPES.BATCH_SIZE;
    this._createBatchSizeSelector();
}

DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.prototype._unsetSelectedControl = function() {
    if(this._isToggleSelectorOpened())
        this._gridControls.unsetSelectedControl(this._$toggleControl);
    else if(this._isSortSelectorOpened())
        this._gridControls.unsetSelectedControl(this._$sortControl);
    else if(this._isFilterSelectorOpened())
        this._gridControls.unsetSelectedControl(this._$filterControl);
    else if(this._isBatchSizeSelectorOpened())
        this._gridControls.unsetSelectedControl(this._$batchSizeControl);
    else if(this._isItemCssSelectorOpened())
        this._gridControls.unsetSelectedHeadingControl(this._$itemCssControl);
    else if(this._isItemSizesSelectorOpened())
        this._gridControls.unsetSelectedGridItemSettingControl(this._$itemSizesControl);
}

DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.prototype._deleteCurrentSelector = function(callbackFunc,
                                                                                                                                                                   keepControlSelected) {
    var me = this;
    var transitionCallback = function() {
        me._currentSelector.destruct();
        me._currentSelector = null;
        me._currentSelectorType = null;

        if(typeof callbackFunc == "function")
            callbackFunc();
    }

    if(this._currentSelector != null && typeof this._currentSelector.destruct == "function")
    {
        var keepControlSelected = keepControlSelected || false;
        if(!keepControlSelected)
            me._unsetSelectedControl();

        if(this._gridControls.areTopControls())
        {
            this._currentSelector.getView().transition(
                {height: "0px"}, this.animationMsInterval, transitionCallback
            );
        }
        else if(this._gridControls.areBottomControls())
        {
            var selectorHeight = this._getSelectorViewHeight();
            this._currentSelector.getView().transition(
                {height: "0px", "margin-top": selectorHeight + "px"}, this.animationMsInterval, transitionCallback
            );
        }
    }
}

DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.prototype._selectOption = function($control) {
    var me = this;
    var targetX = $control.offset().left + Math.round($control.outerWidth() / 2);
    var targetY = $control.offset().top + Math.round($control.outerHeight() / 2);

    me._unsetSelectedControl();
    this._currentSelector.getView().transition(
        {width: "0px", height: "0px", left: targetX + "px", top: targetY + "px"}, this.animationMsInterval, function() {
            me._currentSelector.destruct();
            me._currentSelector = null;
            me._currentSelectorType = null;
        }
    );
}

DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.prototype._bindSelectorEvents = function() {
    var me = this;
    this._currentSelector.getView().on("mouseleave", function() {
        me._deleteCurrentSelector();
    });
}

DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.prototype._getSelectorViewHeight = function() {
    var viewHeight = 0;
    $.each(this._currentSelector.getView().children(), function() {
        viewHeight += $(this).outerHeight(true);
    });

    return viewHeight;
}

DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.prototype._openCurrentSelector = function() {
    if(this._gridControls.areTopControls())
    {
        this._currentSelector.getView().transition(
            {height: this._getSelectorViewHeight()}, this.animationMsInterval
        );
    }
    else if(this._gridControls.areBottomControls())
    {
        var selectorHeight = this._getSelectorViewHeight();
        this._currentSelector.getView().css({"marginTop": selectorHeight + "px"});

        this._currentSelector.getView().transition(
            {height: selectorHeight + "px", "margin-top": "0px"}, this.animationMsInterval
        );
    }
}

DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.prototype._createToggleSelector = function() {
    var me = this;

    var selectorOptions = [];
    if(!browserDetector.isIe8())
    {
        selectorOptions.push({
            optionLabel: "Scale",
            optionSublabel: "Item will be toggled with scale effect(CSS3).",
            createOptionRightSide: function($rightSide) {
                var optionRightSide = new DemoLayoutBuilder.DemoLayout.GridControls.Selector.Toggle.Scale(
                    $rightSide, me._demoLayout
                );
                return optionRightSide;
            },
            isSelected: this._gridifierDynamicSettings.isScaleToggleFunction(),
            selectHandler: function() {
                me._gridControlsManager.selectToggleControlScaleOption();
                me._gridifierDynamicSettings.setScaleToggleFunction();
                me._selectOption(me._$toggleControl);
            }
        });

        selectorOptions.push({
            optionLabel: "Opacity",
            optionSublabel: "Item will be toggled with smooth opacity change(CSS3).",
            createOptionRightSide: function($rightSide) {
                var optionRightSide = new DemoLayoutBuilder.DemoLayout.GridControls.Selector.Toggle.Fade(
                    $rightSide, me._demoLayout
                );
                return optionRightSide;
            },
            isSelected: this._gridifierDynamicSettings.isFadeToggleFunction(),
            selectHandler: function() {
                me._gridControlsManager.selectToggleControlFadeOption();
                me._gridifierDynamicSettings.setFadeToggleFunction();
                me._selectOption(me._$toggleControl);
            }
        });

        selectorOptions.push({
            optionLabel: "RotateX",
            optionSublabel: "Item will be toggled with smooth rotation around X-axis(CSS3).",
            createOptionRightSide: function($rightSide) {
                var optionRightSide = new DemoLayoutBuilder.DemoLayout.GridControls.Selector.Toggle.Rotate(
                    $rightSide, me._demoLayout
                );
                return optionRightSide;
            },
            isSelected: this._gridifierDynamicSettings.isRotateXToggleFunction(),
            selectHandler: function() {
                me._gridControlsManager.selectToggleControlRotateXOption();
                me._gridifierDynamicSettings.setRotateXToggleFunction();
                me._selectOption(me._$toggleControl);
            }
        });

        selectorOptions.push({
            optionLabel: "RotateY",
            optionSublabel: "Item will be toggled with smooth rotation around Y-axis(CSS3).",
            createOptionRightSide: function($rightSide) {
                var optionRightSide = new DemoLayoutBuilder.DemoLayout.GridControls.Selector.Toggle.Rotate(
                    $rightSide, me._demoLayout, true
                );
                return optionRightSide;
            },
            isSelected: this._gridifierDynamicSettings.isRotateYToggleFunction(),
            selectHandler: function() {
                me._gridControlsManager.selectToggleControlRotateYOption();
                me._gridifierDynamicSettings.setRotateYToggleFunction();
                me._selectOption(me._$toggleControl);
            }
        });
    }

    selectorOptions.push({
        optionLabel: "Visibility",
        optionSublabel: "Toggles visibility of the element.",
        createOptionRightSide: function($rightSide) {
            var optionRightSide = new DemoLayoutBuilder.DemoLayout.GridControls.Selector.Toggle.Display(
                $rightSide, me._demoLayout
            );
            return optionRightSide;
        },
        isSelected: this._gridifierDynamicSettings.isVisibilityToggleFunction(),
        selectHandler: function() {
            me._gridControlsManager.selectToggleControlVisibilityOption();
            me._gridifierDynamicSettings.setVisibilityToggleFunction();
            me._selectOption(me._$toggleControl);
        }
    });

    var snapOffset = {left: 5, top: 0};
    if(this._gridControls.areBottomControls())
        snapOffset.top -= this._$toggleControl.outerHeight() + 5;

    this._currentSelector = new DemoLayoutBuilder.DemoLayout.GridControls.Selector(
        this._gridControls,
        this._demoLayout, 
        $("body"),
        this._$toggleControl,
        snapOffset,
        selectorOptions
    );

    this._bindSelectorEvents();
    this._openCurrentSelector();
}

DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.prototype._createFilterSelector = function() {
    var me = this;

    var selectorOptions = [];
    var selectorOptionsSourceData = [
        [
            "All", 
            "Show all items.", 
            DemoLayoutBuilder.DemoLayout.GridControls.Selector.Filter.ITEM_BG_COLOR_TYPES.ALL,
            this._gridifierDynamicSettings.isAllFilterFunction(),
            this._gridControlsManager.selectFilterControlAllOption,
            this._gridifierDynamicSettings.setAllFilterFunction
        ],
        [
            "Blue", 
            "Filter only blue items.", 
            DemoLayoutBuilder.DemoLayout.GridControls.Selector.Filter.ITEM_BG_COLOR_TYPES.FIRST,
            this._gridifierDynamicSettings.isBlueFilterFunction(),
            this._gridControlsManager.selectFilterControlBlueOption,
            this._gridifierDynamicSettings.setBlueFilterFunction
        ],
        [
            "Violet", 
            "Filter only violet items.", 
            DemoLayoutBuilder.DemoLayout.GridControls.Selector.Filter.ITEM_BG_COLOR_TYPES.SECOND,
            this._gridifierDynamicSettings.isVioletFilterFunction(),
            this._gridControlsManager.selectFilterControlVioletOption,
            this._gridifierDynamicSettings.setVioletFilterFunction
        ],
        [
            "Red", 
            "Filter only red items.", 
            DemoLayoutBuilder.DemoLayout.GridControls.Selector.Filter.ITEM_BG_COLOR_TYPES.THIRD,
            this._gridifierDynamicSettings.isRedFilterFunction(),
            this._gridControlsManager.selectFilterControlRedOption,
            this._gridifierDynamicSettings.setRedFilterFunction
        ],
        [
            "Yellow", 
            "Filter only yellow items.", 
            DemoLayoutBuilder.DemoLayout.GridControls.Selector.Filter.ITEM_BG_COLOR_TYPES.FOURTH,
            this._gridifierDynamicSettings.isYellowFilterFunction(),
            this._gridControlsManager.selectFilterControlYellowOption,
            this._gridifierDynamicSettings.setYellowFilterFunction
        ],
        [
            "Green", 
            "Filter only green items.", 
            DemoLayoutBuilder.DemoLayout.GridControls.Selector.Filter.ITEM_BG_COLOR_TYPES.FIFTH,
            this._gridifierDynamicSettings.isGreenFilterFunction(),
            this._gridControlsManager.selectFilterControlGreenOption,
            this._gridifierDynamicSettings.setGreenFilterFunction
        ]
    ];

    for(var i = 0; i < selectorOptionsSourceData.length; i++)
    {
        var optionLabel = selectorOptionsSourceData[i][0];
        var optionSublabel = selectorOptionsSourceData[i][1];
        var itemBgColorType = selectorOptionsSourceData[i][2];
        var isSelected = selectorOptionsSourceData[i][3];
        var gridControlsManagerSetterFunction = selectorOptionsSourceData[i][4];
        var gridifierDynamicSettingsSetterFunction = selectorOptionsSourceData[i][5];

        (function(itemBgColorType, gridControlsManagerSetter, gridifierDynamicSettingsSetter) {
            selectorOptions.push({
                optionLabel: optionLabel,
                optionSublabel: optionSublabel,
                createOptionRightSide: function($rightSide) {
                    var optionRightSide = new DemoLayoutBuilder.DemoLayout.GridControls.Selector.Filter(
                        $rightSide, me._demoLayout, itemBgColorType
                    );
                },
                isSelected: isSelected,
                selectHandler: function() {
                    gridControlsManagerSetter.call(me._gridControlsManager);
                    gridifierDynamicSettingsSetter.call(me._gridifierDynamicSettings);
                    me._selectOption(me._$filterControl);
                }
            });
        })(itemBgColorType, gridControlsManagerSetterFunction, gridifierDynamicSettingsSetterFunction);
    }

    var snapOffset = {left: 5, top: 0};
    if(this._gridControls.areBottomControls())
        snapOffset.top -= this._$filterControl.outerHeight() + 5;

    this._currentSelector = new DemoLayoutBuilder.DemoLayout.GridControls.Selector(
        this._gridControls,
        this._demoLayout,
        $("body"),
        this._$filterControl,
        snapOffset,
        selectorOptions
    );

    this._bindSelectorEvents();
    this._openCurrentSelector();
}

DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.prototype._createSortSelector = function() {
    var me = this;

    var selectorOptions = [];
    selectorOptions.push({
        optionLabel: "By GUID",
        optionSublabel: "Items are sorted in the order by which they were collected by Gridifier.",
        createOptionRightSide: function($rightSide) {
            var optionRightSide = new DemoLayoutBuilder.DemoLayout.GridControls.Selector.Sort(
                $rightSide, me._demoLayout, DemoLayoutBuilder.DemoLayout.GridControls.Selector.Sort.SORT_TYPES.BY_GUID
            );
            return optionRightSide;
        },
        isSelected: this._gridifierDynamicSettings.isByGUIDSortFunction(),
        selectHandler: function() {
            me._gridControlsManager.selectSortControlByGUIDOption();
            me._gridifierDynamicSettings.setByGUIDSortFunction();
            me._selectOption(me._$sortControl);
        }
    });

    selectorOptions.push({
        optionLabel: "By item color",
        optionSublabel: "Items are sorted by the colors.(Blue > Violet > Red > Yellow > Green)",
        createOptionRightSide: function($rightSide) {
            var optionRightSide = new DemoLayoutBuilder.DemoLayout.GridControls.Selector.Sort(
                $rightSide, me._demoLayout, DemoLayoutBuilder.DemoLayout.GridControls.Selector.Sort.SORT_TYPES.BY_ITEM_COLOR
            );
            return optionRightSide;
        },
        isSelected: this._gridifierDynamicSettings.isByItemColorSortFunction(),
        selectHandler: function() {
            me._gridControlsManager.selectSortControlByItemColorOption();
            me._gridifierDynamicSettings.setByItemColorSortFunction();
            me._selectOption(me._$sortControl);
        }
    });

    var snapOffset = {left: 5, top: 0};
    if(this._gridControls.areBottomControls())
        snapOffset.top -= this._$sortControl.outerHeight() + 5;
    else if(this._gridControls.areTopControls())
        snapOffset.top -= 5;

    this._currentSelector = new DemoLayoutBuilder.DemoLayout.GridControls.Selector(
        this._gridControls,
        this._demoLayout,
        $("body"),
        this._$sortControl,
        snapOffset,
        selectorOptions
    );

    this._bindSelectorEvents();
    this._openCurrentSelector();
}

DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.prototype._createBatchSizeSelector = function() {
    var me = this;

    var batchSizeSelectorEventsUID = new Date().getTime() + Math.random();
    var selectorOptions = [];
    selectorOptions.push({
        optionLabel: "Batch size",
        optionSublabel: "Determines how many items will be inserted on next append or prepend.",
        createOptionLeftSide: function($leftSide) {
            var optionLeftSide = new DemoLayoutBuilder.DemoLayout.GridControls.Selector.BatchSize.LeftSide(
                $leftSide, 
                me._demoLayout, 
                batchSizeSelectorEventsUID, 
                me._gridifierDynamicSettings.getBatchSize(),
                function(newBatchSize) {
                    me._gridControlsManager.setBatchSizeOption(newBatchSize);
                    me._gridifierDynamicSettings.setBatchSize(newBatchSize);
                }
            );
            return optionLeftSide;
        },
        createOptionRightSide: function($rightSide) {
            var optionRightSide = new DemoLayoutBuilder.DemoLayout.GridControls.Selector.BatchSize.RightSide(
                $rightSide, 
                me._demoLayout, 
                batchSizeSelectorEventsUID
            );
            return optionRightSide;
        },
        selectHandler: function() {
            //console.log("select click");
        }
    });

    var snapOffset = {left: 5, top: 0};
    if(this._gridControls.areBottomControls())
        snapOffset.top -= this._$batchSizeControl.outerHeight() + 5;
    
    this._currentSelector = new DemoLayoutBuilder.DemoLayout.GridControls.Selector(
        this._gridControls,
        this._demoLayout,
        $("body"),
        this._$batchSizeControl,
        snapOffset,
        selectorOptions
    );

    this._bindSelectorEvents();
    this._openCurrentSelector();
}

DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.prototype._createItemCssSelector = function() {
    var me = this;

    var selectorOptions = [];
    selectorOptions.push({
        optionLabel: "Item border size",
        optionSublabel: "Every grid item will have specified border size.",
        createOptionRightSide: function($rightSide) {
            var optionRightSide = new DemoLayoutBuilder.DemoLayout.GridControls.Selector.ItemCss(
                $rightSide,
                me._demoLayout,
                function(newBorderSize) {
                    me._gridControlsManager.setItemCssControlBorder(newBorderSize);
                    me._gridifierDynamicSettings.setItemBorder(newBorderSize);
                },
                DemoLayoutBuilder.DemoLayout.GridControls.Selector.ItemCss.SLIDER_TYPES.BORDER,
                me._gridifierDynamicSettings.getItemBorder()
            );
            return optionRightSide;
        },
        selectHandler: function() {
            //
        }
    });

    selectorOptions.push({
        optionLabel: "Item margin size",
        optionSublabel: "Every grid item will have specified margin size.",
        createOptionRightSide: function($rightSide) {
            var optionRightSide = new DemoLayoutBuilder.DemoLayout.GridControls.Selector.ItemCss(
                $rightSide,
                me._demoLayout,
                function(newMarginSize) {
                    me._gridControlsManager.setItemCssControlMargin(newMarginSize);
                    me._gridifierDynamicSettings.setItemMargin(newMarginSize);
                },
                DemoLayoutBuilder.DemoLayout.GridControls.Selector.ItemCss.SLIDER_TYPES.MARGIN,
                me._gridifierDynamicSettings.getItemMargin()
            );
            return optionRightSide;
        },
        selectHandler: function() {
            //
        }
    });

    selectorOptions.push({
        optionLabel: "Box-sizing",
        optionSublabel: "Determines box-sizing of each grid item.",
        createOptionRightSide: function($rightSide) {
            var optionRightSide = new DemoLayoutBuilder.DemoLayout.GridControls.Selector.ItemCss(
                $rightSide,
                me._demoLayout,
                function(newBoxSizing) {
                    if(newBoxSizing == 0) {
                        me._gridControlsManager.setBoxSizingItemCssControlBorderBoxOption();
                        me._gridifierDynamicSettings.setBorderBoxBoxSizing();
                    }
                    else if(newBoxSizing == 1) {
                        me._gridControlsManager.setBoxSizingItemCssControlContentBoxOption();
                        me._gridifierDynamicSettings.setContentBoxBoxSizing();
                    }
                },
                DemoLayoutBuilder.DemoLayout.GridControls.Selector.ItemCss.SLIDER_TYPES.BOX_SIZING,
                (me._gridifierDynamicSettings.isBorderBoxBoxSizing()) ? 0 : 1
            );
            return optionRightSide;
        },
        selectHandler: function() {
            //
        }
    });

    var snapOffset = {left: -630, top: 0};
    if(this._gridControls.areBottomControls())
        snapOffset.top -= this._$itemCssControl.outerHeight() + 10;

    this._currentSelector = new DemoLayoutBuilder.DemoLayout.GridControls.Selector(
        this._gridControls,
        this._demoLayout,
        $("body"),
        this._$itemCssControl,
        snapOffset,
        selectorOptions,
        880,
        550
    );

    this._bindSelectorEvents();
    this._openCurrentSelector();
}

DemoLayoutBuilder.DemoLayout.GridControls.SelectorManager.prototype._createItemSizesSelector = function($itemSizeControl) {
    var me = this;
    var itemSizesIndexAttr = "data-itemSizesSelectorId";
    var itemSizesIndex = $itemSizeControl.attr(itemSizesIndexAttr);

    if(this._demoLayout.isVerticalGrid())
    {
        var createWidthOptionRightSide = function($rightSide) {
            var optionRightSide = new DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize(
                $rightSide,
                me._demoLayout,
                function(newWidth) {
                    me._gridifierDynamicSettings.setItemWidth(itemSizesIndex, newWidth);
                    me._gridControlsManager.setItemWidth(itemSizesIndex, newWidth);
                },
                me._gridifierDynamicSettings.getItemWidth(itemSizesIndex),
                DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.MEASUREMENT_TYPES.WIDTH
            );

            return optionRightSide;
        }

        var createHeightOptionRightSide = function($rightSide) {
            var optionRightSide = new DemoLayoutBuilder.DemoLayout.GridControls.Selector.SingleMeasurementItemSize(
                $rightSide,
                me._demoLayout,
                function(newHeight) {
                    me._gridifierDynamicSettings.setItemHeight(itemSizesIndex, newHeight + "px");
                    me._gridControlsManager.setItemHeight(itemSizesIndex, newHeight + "px");
                },
                me._gridifierDynamicSettings.getItemHeight(itemSizesIndex),
                DemoLayoutBuilder.DemoLayout.GridControls.Selector.SingleMeasurementItemSize.MEASUREMENT_TYPES.HEIGHT
            );

            return optionRightSide;
        }
    }
    else if(this._demoLayout.isHorizontalGrid())
    {
        var createWidthOptionRightSide = function($rightSide) {
            var optionRightSide = new DemoLayoutBuilder.DemoLayout.GridControls.Selector.SingleMeasurementItemSize(
                $rightSide,
                me._demoLayout,
                function(newWidth) {
                    me._gridifierDynamicSettings.setItemWidth(itemSizesIndex, newWidth + "px");
                    me._gridControlsManager.setItemWidth(itemSizesIndex, newWidth + "px");
                },
               me._gridifierDynamicSettings.getItemWidth(itemSizesIndex),
               DemoLayoutBuilder.DemoLayout.GridControls.Selector.SingleMeasurementItemSize.MEASUREMENT_TYPES.WIDTH
            );

            return optionRightSide;
        }

        var createHeightOptionRightSide = function($rightSide) {
            var optionRightSide = new DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize(
                $rightSide,
                me._demoLayout,
                function(newHeight) {
                    me._gridifierDynamicSettings.setItemHeight(itemSizesIndex, newHeight);
                    me._gridControlsManager.setItemHeight(itemSizesIndex, newHeight);
                },
                me._gridifierDynamicSettings.getItemHeight(itemSizesIndex),
                DemoLayoutBuilder.DemoLayout.GridControls.Selector.MultipleMeasurementsItemSize.MEASUREMENT_TYPES.HEIGHT
            );

            return optionRightSide;
        }
    }

    var selectorOptions = [];
    selectorOptions.push({
        optionLabel: "Item width",
        optionSublabel: "Select item width.",
        createOptionRightSide: createWidthOptionRightSide,
        selectHandler: function() {
            //
        }
    });

    selectorOptions.push({
        optionLabel: "Item height",
        optionSublabel: "Select item height.",
        createOptionRightSide: createHeightOptionRightSide,
        selectHandler: function() {
            //
        }
    });

    var snapOffset = {left: -540, top: 0};
    if(this._gridControls.areBottomControls())
        snapOffset.top -= $itemSizeControl.outerHeight() + 10;

    this._currentSelector = new DemoLayoutBuilder.DemoLayout.GridControls.Selector(
        this._gridControls,
        this._demoLayout,
        $("body"),
        $itemSizeControl,
        snapOffset,
        selectorOptions,
        880,
        700,
        true
    );

    this._bindSelectorEvents();
    this._openCurrentSelector();
}