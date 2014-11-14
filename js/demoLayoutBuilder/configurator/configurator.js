DemoLayoutBuilder.Configurator = function($targetEl, demoLayout) {
    var me = this;

    this._$view = View.attach(this._$view, $targetEl, View.ids.DEMO_LAYOUT_BUILDER.CONFIGURATOR);

    this._demoLayout = null;
    this._gridTypeSelector = null;

    this._horizontalGridSettings = null;
    this._verticalGridSettings = null;

    this._horizontalGridAdditionalSettings = null;
    this._verticalGridAdditionalSettings = null;

    this._horizontalGridCreateButton = null;
    this._verticalGridCreateButton = null;

    this._gridifierSettings = {
        verticalGrid: {
            gridType: Gridifier.GRID_TYPES.VERTICAL_GRID,
            prependType: Gridifier.PREPEND_TYPES.DEFAULT_PREPEND,
            appendType: Gridifier.APPEND_TYPES.DEFAULT_APPEND,
            intersectionStrategy: Gridifier.INTERSECTION_STRATEGIES.DEFAULT,
            sortDispersionMode: Gridifier.SORT_DISPERSION_MODES.DISABLED,
            sortDispersionValue: null
        },
        horizontalGrid: {
            gridType: Gridifier.GRID_TYPES.HORIZONTAL_GRID,
            prependType: Gridifier.PREPEND_TYPES.DEFAULT_PREPEND,
            appendType: Gridifier.APPEND_TYPES.DEFAULT_APPEND,
            intersectionStrategy: Gridifier.INTERSECTION_STRATEGIES.DEFAULT,
            sortDispersionMode: Gridifier.SORT_DISPERSION_MODES.DISABLED,
            sortDispersionValue: null
        }
    };

    this._eventHandlerGridType = null;

    this._gridSettingsAccordion = null;
    this._accordionItemIds = {
        verticalGridSettingsItem: "verticalGridSettingsItem",
        horizontalGridSettingsItem: "horizontalGridSettingsItem"
    };

    this._css = {
        gridTypeSelectorClass: "gridTypeSelector",
        gridSettingsClass: "gridSettings",
        verticalGridSettingsClass: "verticalGridSettings",
        horizontalGridSettingsClass: "horizontalGridSettings"
    }

    this._construct = function() {
        me._demoLayout = demoLayout;

       me._gridTypeSelector = new DemoLayoutBuilder.GridTypeSelector(me._$view.find("." + me._css.gridTypeSelectorClass));
       me._horizontalGridSettings = new DemoLayoutBuilder.GridSettings(
            me._$view.find("." + me._css.horizontalGridSettingsClass), 
            DemoLayoutBuilder.GridSettings.SETTING_TYPES.HORIZONTAL_GRID, 
            me,
            me._demoLayout
       );
       me._verticalGridSettings = new DemoLayoutBuilder.GridSettings(
            me._$view.find("." + me._css.verticalGridSettingsClass), 
            DemoLayoutBuilder.GridSettings.SETTING_TYPES.VERTICAL_GRID, 
            me,
            me._demoLayout
       );

       me._horizontalGridAdditionalSettings = me._horizontalGridSettings.getGridAdditionalSettings();
       me._verticalGridAdditionalSettings = me._verticalGridSettings.getGridAdditionalSettings();

       me._horizontalGridCreateButton = me._horizontalGridSettings.getCreateGrid();
       me._verticalGridCreateButton = me._verticalGridSettings.getCreateGrid();

       me._gridSettingsAccordion = new Accordion(me._$view.find("." + me._css.gridSettingsClass));
       me._bindEvents();
    }

    this._bindEvents = function() {
        $(this._gridTypeSelector).on(DemoLayoutBuilder.GridTypeSelector.EVENT_GRID_TYPE_CHANGE, function(event, newGridType) {
            if(newGridType == DemoLayoutBuilder.GridTypeSelector.SELECTOR_TYPES.VERTICAL_GRID)
                me._gridSettingsAccordion.selectItem(me._accordionItemIds.verticalGridSettingsItem);
            else if(newGridType == DemoLayoutBuilder.GridTypeSelector.SELECTOR_TYPES.HORIZONTAL_GRID)
                me._gridSettingsAccordion.selectItem(me._accordionItemIds.horizontalGridSettingsItem);
        });

        $(me._horizontalGridSettings).on(DemoLayoutBuilder.GridSettings.EVENT_APPEND_TYPE_CHANGE, function() {
            me._setHorizontalEventHandlerGridType();
            me._gridAppendTypeChangeEventHandler.apply(me, arguments);
        });

        $(me._horizontalGridSettings).on(DemoLayoutBuilder.GridSettings.EVENT_PREPEND_TYPE_CHANGE, function() {
            me._setHorizontalEventHandlerGridType();
            me._gridPrependTypeChangeEventHandler.apply(me, arguments);
        });

        $(me._horizontalGridAdditionalSettings).on(DemoLayoutBuilder.GridAdditionalSettings.EVENT_INTERSECTION_STRATEGY_CHANGE, function() {
            me._setHorizontalEventHandlerGridType();
            me._gridIntersectionStrategyChangeEventHandler.apply(me, arguments);
        });

        $(me._horizontalGridAdditionalSettings).on(DemoLayoutBuilder.GridAdditionalSettings.EVENT_SORT_DISPERSION_MODE_CHANGE, function() {
            me._setHorizontalEventHandlerGridType();
            me._gridSortDispersionModeChangeEventHandler.apply(me, arguments);
        });

        $(me._verticalGridSettings).on(DemoLayoutBuilder.GridSettings.EVENT_APPEND_TYPE_CHANGE, function() {
            me._setVerticalEventHandlerGridType();
            me._gridAppendTypeChangeEventHandler.apply(me, arguments);
        });

        $(me._verticalGridSettings).on(DemoLayoutBuilder.GridSettings.EVENT_PREPEND_TYPE_CHANGE, function() {
            me._setVerticalEventHandlerGridType();
            me._gridPrependTypeChangeEventHandler.apply(me, arguments);
        });

        $(me._verticalGridAdditionalSettings).on(DemoLayoutBuilder.GridAdditionalSettings.EVENT_INTERSECTION_STRATEGY_CHANGE, function() {
            me._setVerticalEventHandlerGridType();
            me._gridIntersectionStrategyChangeEventHandler.apply(me, arguments);
        });

        $(me._verticalGridAdditionalSettings).on(DemoLayoutBuilder.GridAdditionalSettings.EVENT_SORT_DISPERSION_MODE_CHANGE, function() {
            me._setVerticalEventHandlerGridType();
            me._gridSortDispersionModeChangeEventHandler.apply(me, arguments);
        });

        $(me._horizontalGridCreateButton).on(DemoLayoutBuilder.CreateGrid.EVENT_BUTTON_CLICK, function() {
            $(me).trigger(DemoLayoutBuilder.Configurator.EVENT_CREATE_HORIZONTAL_GRID, [me._gridifierSettings.horizontalGrid]);
        });

        $(me._verticalGridCreateButton).on(DemoLayoutBuilder.CreateGrid.EVENT_BUTTON_CLICK, function() {
            $(me).trigger(DemoLayoutBuilder.Configurator.EVENT_CREATE_VERTICAL_GRID, [me._gridifierSettings.verticalGrid]);
        });
    }

    this._unbindEvents = function() {
        $(this._gridTypeSelector).off(DemoLayoutBuilder.GridTypeSelector.EVENT_GRID_TYPE_CHANGE);
        $(me._horizontalGridSettings).off(DemoLayoutBuilder.GridSettings.EVENT_APPEND_TYPE_CHANGE);
        $(me._horizontalGridSettings).off(DemoLayoutBuilder.GridSettings.EVENT_PREPEND_TYPE_CHANGE);
        $(me._horizontalGridAdditionalSettings).off(DemoLayoutBuilder.GridAdditionalSettings.EVENT_INTERSECTION_STRATEGY_CHANGE);
        $(me._horizontalGridAdditionalSettings).off(DemoLayoutBuilder.GridAdditionalSettings.EVENT_SORT_DISPERSION_MODE_CHANGE);

        $(me._verticalGridSettings).off(DemoLayoutBuilder.GridSettings.EVENT_APPEND_TYPE_CHANGE);
        $(me._verticalGridSettings).off(DemoLayoutBuilder.GridSettings.EVENT_PREPEND_TYPE_CHANGE);
        $(me._verticalGridAdditionalSettings).off(DemoLayoutBuilder.GridAdditionalSettings.EVENT_INTERSECTION_STRATEGY_CHANGE);
        $(me._verticalGridAdditionalSettings).off(DemoLayoutBuilder.GridAdditionalSettings.EVENT_SORT_DISPERSION_MODE_CHANGE);

        $(me._horizontalGridCreateButton).off(DemoLayoutBuilder.CreateGrid.EVENT_BUTTON_CLICK);
        $(me._verticalGridCreateButton).off(DemoLayoutBuilder.CreateGrid.EVENT_BUTTON_CLICK);
    }

    this.destruct = function() {
        me._gridTypeSelector.destruct();
        me._horizontalGridSettings.destruct();
        me._verticalGridSettings.destruct();

        me._$view.remove();
        me._unbindEvents();
    }

    this._construct();
    return this;
}

DemoLayoutBuilder.Configurator.EVENT_CREATE_HORIZONTAL_GRID = "demoLayoutBuilder.Configurator.createHorizontalGrid";
DemoLayoutBuilder.Configurator.EVENT_CREATE_VERTICAL_GRID = "demoLayoutBuilder.Configurator.createVerticalGrid";

DemoLayoutBuilder.Configurator.EVENT_HANDLER_GRID_TYPES = {VERTICAL_GRID: 0, HORIZONTAL_GRID: 1};
DemoLayoutBuilder.Configurator.IS_DEBUG_ENABLED = false;

DemoLayoutBuilder.Configurator.prototype._debugGridifierSettings = function() {
    if(DemoLayoutBuilder.Configurator.IS_DEBUG_ENABLED)
    {
        console.log("Gridifier settings");

        console.log("   Vertical grid settings:");
        for(var prop in this._gridifierSettings.verticalGrid)
            console.log("      " + prop + " = " + this._gridifierSettings.verticalGrid[prop]);

        console.log("   Horizontal grid settings:");
        for(var prop in this._gridifierSettings.horizontalGrid)
            console.log("      " + prop + " = " + this._gridifierSettings.horizontalGrid[prop]);
    }
}

DemoLayoutBuilder.Configurator.prototype.getView = function() {
    return this._$view;
}

DemoLayoutBuilder.Configurator.prototype.getGridTypeSelector = function() {
    return this._gridTypeSelector;
}

DemoLayoutBuilder.Configurator.prototype._setVerticalEventHandlerGridType = function() {
    this._eventHandlerGridType = DemoLayoutBuilder.Configurator.EVENT_HANDLER_GRID_TYPES.VERTICAL_GRID;
}

DemoLayoutBuilder.Configurator.prototype._setHorizontalEventHandlerGridType = function() {
    this._eventHandlerGridType = DemoLayoutBuilder.Configurator.EVENT_HANDLER_GRID_TYPES.HORIZONTAL_GRID;
}

DemoLayoutBuilder.Configurator.prototype._isVerticalEventHandlerGridType = function() {
    return this._eventHandlerGridType == DemoLayoutBuilder.Configurator.EVENT_HANDLER_GRID_TYPES.VERTICAL_GRID;
}

DemoLayoutBuilder.Configurator.prototype._isHorizontalEventHandlerGridType = function() {
    return this._eventHandlerGridType == DemoLayoutBuilder.Configurator.EVENT_HANDLER_GRID_TYPES.HORIZONTAL_GRID;
}

DemoLayoutBuilder.Configurator.prototype._gridAppendTypeChangeEventHandler = function(event, 
                                                                                                                                         isDefaultAppend, 
                                                                                                                                         isReversedAppend) {
    var settingName = "appendType";
    var settingValue = (isDefaultAppend()) ? Gridifier.APPEND_TYPES.DEFAULT_APPEND : Gridifier.APPEND_TYPES.REVERSED_APPEND;

    if(this._isVerticalEventHandlerGridType())
        this._setVerticalGridSetting(settingName, settingValue);
    else if(this._isHorizontalEventHandlerGridType())
        this._setHorizontalGridSetting(settingName, settingValue);
}

DemoLayoutBuilder.Configurator.prototype._gridPrependTypeChangeEventHandler = function(event, 
                                                                                                                                            isMirroredPrepend, 
                                                                                                                                            isDefaultPrepend, 
                                                                                                                                            isReversedPrepend) {
    var settingName = "prependType";
    if(isMirroredPrepend())
        var settingValue = Gridifier.PREPEND_TYPES.MIRRORED_PREPEND;
    else if(isDefaultPrepend())
        var settingValue = Gridifier.PREPEND_TYPES.DEFAULT_PREPEND;
    else if(isReversedPrepend())
        var settingValue = Gridifier.PREPEND_TYPES.REVERSED_PREPEND;

    if(this._isVerticalEventHandlerGridType())
        this._setVerticalGridSetting(settingName, settingValue);
    else if(this._isHorizontalEventHandlerGridType())
        this._setHorizontalGridSetting(settingName, settingValue);
}

DemoLayoutBuilder.Configurator.prototype._gridIntersectionStrategyChangeEventHandler = function(event,
                                                                                                                                                          intersectionStrategy,
                                                                                                                                                          isDefaultIntersectionMode,
                                                                                                                                                          isNoIntersectionsMode) {
    var settingName = "intersectionStrategy";
    if(isDefaultIntersectionMode())
        var settingValue = Gridifier.INTERSECTION_STRATEGIES.DEFAULT;
    else if(isNoIntersectionsMode())
        var settingValue = Gridifier.INTERSECTION_STRATEGIES.NO_INTERSECTIONS;

    if(this._isVerticalEventHandlerGridType())
        this._setVerticalGridSetting(settingName, settingValue);
    else if(this._isHorizontalEventHandlerGridType())
        this._setHorizontalGridSetting(settingName, settingValue);
}

DemoLayoutBuilder.Configurator.prototype._gridSortDispersionModeChangeEventHandler = function(event,
                                                                                                                                                       sortDispersion,
                                                                                                                                                       sortDispersionValue,
                                                                                                                                                       isDisabledSortDispersionMode,
                                                                                                                                                       isCustomSortDispersionMode) {
    var sortDispersionSettingName = "sortDispersionMode";
    var sortDispersionValueSettingName = "sortDispersionValue";
    var sortDispersionAllEmptySpaceValue = 1000;

    if(isDisabledSortDispersionMode())
    {
        var sortDispersionSettingValue = Gridifier.SORT_DISPERSION_MODES.DISABLED;
        var sortDispersionValueSettingValue = null;
    }
    else if(isCustomSortDispersionMode())
    {
        var sortDispersionValue = parseInt(sortDispersionValue, 10);
        if(sortDispersionValue == sortDispersionAllEmptySpaceValue)
        {
            var sortDispersionSettingValue = Gridifier.SORT_DISPERSION_MODES.CUSTOM_ALL_EMPTY_SPACE;
            var sortDispersionValueSettingValue = null;
        }
        else
        {
            var sortDispersionSettingValue = Gridifier.SORT_DISPERSION_MODES.CUSTOM;
            var sortDispersionValueSettingValue = sortDispersionValue + "px";
        }
    }

    if(this._isVerticalEventHandlerGridType())
    {
        this._setVerticalGridSetting(sortDispersionSettingName, sortDispersionSettingValue);
        this._setVerticalGridSetting(sortDispersionValueSettingName, sortDispersionValueSettingValue);
    }
    else if(this._isHorizontalEventHandlerGridType())
    {
        this._setHorizontalGridSetting(sortDispersionSettingName, sortDispersionSettingValue);
        this._setHorizontalGridSetting(sortDispersionValueSettingName, sortDispersionValueSettingValue);
    }
}

DemoLayoutBuilder.Configurator.prototype._setHorizontalGridSetting = function(settingName, settingValue) {
    if(typeof this._gridifierSettings.horizontalGrid[settingName] == "undefined")
        throw new Error("GridifierConfigurator error: HorizontalGrid has no setting with name '" + settingName + "'");

    this._gridifierSettings.horizontalGrid[settingName] = settingValue;
    this._debugGridifierSettings();
}

DemoLayoutBuilder.Configurator.prototype._setVerticalGridSetting = function(settingName, settingValue) {
    if(typeof this._gridifierSettings.verticalGrid[settingName] == "undefined")
        throw new Error("GridifierConfigurator error: VerticalGrid has no setting with name '" + settingName + "'");

    this._gridifierSettings.verticalGrid[settingName] = settingValue;
    this._debugGridifierSettings();
}
