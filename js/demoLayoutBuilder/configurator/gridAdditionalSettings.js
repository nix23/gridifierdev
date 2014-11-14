DemoLayoutBuilder.GridAdditionalSettings = function($targetEl, gridSettings, gridTypeSelector, demoLayout) {
    var me = this;

    this._$view = null;

    this._demoLayout = null;
    this._gridTypeSelector = null;

    this._$customSortDispersionSeparator = null;
    this._$customSortDispersionValue = null;

    this._$sortDispersionSlider = null;
    this._$sortDispersionValue = null;

    this._verticalGridAtomWidth = 57;
    this._verticalGridSmallAtomHeight = 57;
    this._verticalGridBigAtomHeight = 57 + Math.floor(57 / 2);

    this._gridSettings = null;
    this._intersectionsSettingDemonstrator = null;
    this._sortDispersionSettingDemonstrator = null;

    this._selectedIntersectionStrategyClass = null;
    this._selectedSortDispersionClass = null;
    this._customSortDispersionValue = 0;

    this._verticalGridAdditionalSettingsViewParams = {
        settingNameHighlightClass: "gridFifthColor",
        intersectionStrategySublabel: "Type of horizontal item intersection.",
        defaultIntersectionStrategyDescription: "Several items can intersect any other item horizontally.",
        noIntersectionsStrategyDescription: "Only one item can intersect any other horizontally.",

        sortDispersionHeadingSublabel: "Max vertical distance from valid sorting position.",
        disabledDispersionDescription: "All items are inserted in normal flow. New item cannot be inserted out of the last items bounds.",
        sortDispersionClass: "verticalSortDispersion",

        demonstratorClass: "gridFifthBorderColor verticalGridDemonstrator"
    }

    this._horizontalGridAdditionalSettingsViewParams = {
        settingNameHighlightClass: "gridFourthColor",
        intersectionStrategySublabel: "Type of vertical item intersection.",
        defaultIntersectionStrategyDescription: "Several items can intersect any other item vertically.",
        noIntersectionsStrategyDescription: "Only one item can intersect any other vertically.",

        sortDispersionHeadingSublabel: "Max horizontal distance from valid sorting position.",
        disabledDispersionDescription: "All items are inserted in normal flow. New item cannot be inserted out of the last items bounds.",
        sortDispersionClass: "horizontalSortDispersion",

        demonstratorClass: "gridFourthBorderColor horizontalGridDemonstrator"
    }

    this._css = {
        settingClass: "setting",
        horizontalGridSelectedSettingClass: "gridFourthBorderColor",
        verticalGridSelectedSettingClass: "gridFifthBorderColor",

        intersectionSettingClass: "intersectionSetting",
        sortDispersionSettingClass: "sortDispersionSetting",

        defaultIntersectionSettingClass: "defaultIntersectionStrategySetting",
        noIntersectionsSettingClass: "noIntersectionsStrategySetting",

        disabledSortDispersionSettingClass: "disabledSortDispersionSetting",
        customSortDispersionSettingClass: "customSortDispersionSetting",

        customSortDispersionSeparatorClass: "customDispersionSeparator",
        customSortDispersionValueClass: "customDispersionValue",
        customSortDispersionAllAvailableSpaceLabelClass: "customDispersionAllAvailableSpaceLabel",

        sortDispersionSliderClass: "sortDispersionSlider",

        intersectionsDemonstratorClass: "intersectionsDemonstrator",
        sortDispersionDemonstratorClass: "sortDispersionDemonstrator"
    }

    this._intersectionStrategyClasses = [
        this._css.defaultIntersectionSettingClass,
        this._css.noIntersectionsSettingClass
    ];

    this._sortDispersionClasses = [
        this._css.disabledSortDispersionSettingClass,
        this._css.customSortDispersionSettingClass
    ];

    this._construct = function() { 
        me._demoLayout = demoLayout;
        me._gridSettings = gridSettings;
        me._gridTypeSelector = gridTypeSelector;
        me._attachView();

        me._$customSortDispersionSeparator = me._$view.find("." + me._css.customSortDispersionSeparatorClass);
        me._$customSortDispersionValue = me._$view.find("." + me._css.customSortDispersionValueClass);
        me._hideCustomSortDispersionLabels();

        me._$sortDispersionSlider = me._$view.find("." + me._css.sortDispersionSliderClass);
        me._initSortDispersionSlider();

        me._intersectionsSettingDemonstrator = new DemoLayoutBuilder.IntersectionsSettingDemonstrator(
            me._$view.find("." + me._css.intersectionsDemonstratorClass), me
        );

        me._sortDispersionSettingDemonstrator = new DemoLayoutBuilder.SortDispersionSettingDemonstrator(
            me._$view.find("." + me._css.sortDispersionDemonstratorClass), me, me._gridSettings, me._gridTypeSelector, me._demoLayout
        );

        me._selectStrategySetting(me._$view.find("." + me._css.defaultIntersectionSettingClass));
        me._selectSortDispersionSetting(me._$view.find("." + me._css.disabledSortDispersionSettingClass));
       
        me._bindEvents();
    }

    this._bindEvents = function() {
        me._$view.on("mouseenter", "." + me._css.intersectionSettingClass, function() {
            if(me._isSelectedStrategySetting($(this))) return;
            me._setSelectedSettingCss($(this));
        });

        me._$view.on("mouseleave", "." + me._css.intersectionSettingClass, function() {
            if(me._isSelectedStrategySetting($(this))) return;
            me._unsetSelectedSettingCss($(this));
        });

        me._$view.on("click", "." + me._css.intersectionSettingClass, function() {
            if(me._isSelectedStrategySetting($(this))) return; 
            me._selectStrategySetting($(this));
        });

        me._$view.on("mouseenter", "." + me._css.sortDispersionSettingClass, function() {
            if(me._isSelectedSortDispersionSetting($(this))) return;
            me._setSelectedSettingCss($(this));
        });

        me._$view.on("mouseleave", "." + me._css.sortDispersionSettingClass, function() {
            if(me._isSelectedSortDispersionSetting($(this))) return;
            me._unsetSelectedSettingCss($(this));
        });

        me._$view.on("click", "." + me._css.sortDispersionSettingClass, function() {
            if(me._isSelectedSortDispersionSetting($(this))) return;
            me._selectSortDispersionSetting($(this));
        });
    }

    this._unbindEvents = function() {

    }

    this.destruct = function() {
        me._unbindEvents();

        me._intersectionsSettingDemonstrator.destruct();
        me._sortDispersionSettingDemonstrator.destruct();

        me._$view.remove();
    }

    this._initSortDispersionSlider = function() {
        me._$sortDispersionSlider.noUiSlider({
            start: [100], connect: "lower", step: 5,
            range: {
                'min': [5], 'max': [1000]
            }
        });

        me._$sortDispersionSlider.on({
            slide: function() {
                var newValue = me._$sortDispersionSlider.val();
                me._customSortDispersionValue = newValue;
                me._updateCustomSortDispersionValue();

                if(me._selectedSortDispersionClass == me._css.disabledSortDispersionSettingClass)
                {
                    var sortDispersion = DemoLayoutBuilder.GridAdditionalSettings.SORT_DISPERSION_MODES.DISABLED;
                    var sortDispersionValue = null;
                }
                else if(me._selectedSortDispersionClass == me._css.customSortDispersionSettingClass)
                {
                    var sortDispersion = DemoLayoutBuilder.GridAdditionalSettings.SORT_DISPERSION_MODES.CUSTOM;
                    var sortDispersionValue = me._customSortDispersionValue;
                }

                $(me).trigger(DemoLayoutBuilder.GridAdditionalSettings.EVENT_SORT_DISPERSION_MODE_CHANGE, [
                    sortDispersion, 
                    sortDispersionValue,
                    function() { return me._sortDispersionSettingDemonstrator.isDisabledSortDispersionMode(); },
                    function() { return me._sortDispersionSettingDemonstrator.isCustomSortDispersionMode(); }
                ]);
            }
        });
        me._$sortDispersionSlider.trigger("slide");
        me._disableSortDispersionSlider();

        me._$sortDispersionSlider.noUiSlider_pips({
            mode: 'values',
            values: [5,100,200,300,400,500,600,700,800,900, 1000],
            density: 4,
            format: wNumb({
                decimals: 0,
                postfix: "px"
            }),
            replaceLastLabelMarking: true,
            replacedValue: "1000",
            lastLabelMarking: "100%"
        });
    }

    this._enableSortDispersionSlider = function() {
        me._$sortDispersionSlider.removeAttr("disabled");
    }

    this._disableSortDispersionSlider = function() {
        me._$sortDispersionSlider.attr("disabled", "disabled");
    }

    this._attachView = function() {
        if(me._gridSettings._isVerticalGridType())
            var viewParams = me._verticalGridAdditionalSettingsViewParams;
        else if(me._gridSettings._isHorizontalGridType())
            var viewParams = me._horizontalGridAdditionalSettingsViewParams;

        me._$view = View.attach(me._$view, $targetEl, View.ids.DEMO_LAYOUT_BUILDER.GRID_ADDITIONAL_SETTINGS, viewParams);
    }

    this._construct();
    return this;
}

DemoLayoutBuilder.GridAdditionalSettings.EVENT_INTERSECTION_STRATEGY_CHANGE = "demoLayoutBuilder.gridAdditionalSettings.intersectionStrategyChange";
DemoLayoutBuilder.GridAdditionalSettings.EVENT_SORT_DISPERSION_MODE_CHANGE = "demoLayoutBuilder.gridAdditionalSettings.sortDispersionModeChange";

DemoLayoutBuilder.GridAdditionalSettings.INTERSECTION_STRATEGIES = {DEFAULT: 0, NO_INTERSECTIONS: 1};
DemoLayoutBuilder.GridAdditionalSettings.SORT_DISPERSION_MODES = {DISABLED: 0, CUSTOM: 1};

DemoLayoutBuilder.GridAdditionalSettings.prototype._showCustomSortDispersionLabels = function() {
    this._$customSortDispersionSeparator.css("visibility", "visible");
    this._$customSortDispersionValue.css("visibility", "visible");
}

DemoLayoutBuilder.GridAdditionalSettings.prototype._hideCustomSortDispersionLabels = function() {
    this._$customSortDispersionSeparator.css("visibility", "hidden");
    this._$customSortDispersionValue.css("visibility", "hidden");
}

DemoLayoutBuilder.GridAdditionalSettings.prototype._updateCustomSortDispersionValue = function(e) {
    var fullSizeLabelClass = this._css.customSortDispersionAllAvailableSpaceLabelClass;
    if(this._gridSettings._isHorizontalGridType())
        var fullSizeLabel = "<span class='" + fullSizeLabelClass + "'>100% of width</span>";
    else if(this._gridSettings._isVerticalGridType())
        var fullSizeLabel = "<span class='" + fullSizeLabelClass + "'>100% of height</span>";

    var newValue = parseInt(this._customSortDispersionValue);
    newValue = (newValue == 1000) ? fullSizeLabel : newValue + "px";

    this._$customSortDispersionValue.html(newValue);
}

DemoLayoutBuilder.GridAdditionalSettings.prototype._getSettingClass = function($settingEl, settingClasses) {
    for(var i = 0; i < settingClasses.length; i++)
    {
        if($settingEl.hasClass(settingClasses[i]))
            return settingClasses[i];
    }
}

DemoLayoutBuilder.GridAdditionalSettings.prototype._isSelectedStrategySetting = function($settingEl) {
    if(this._getSettingClass($settingEl, this._intersectionStrategyClasses) == this._selectedIntersectionStrategyClass)
        return true;
    else
        return false;
}

DemoLayoutBuilder.GridAdditionalSettings.prototype._selectStrategySetting = function($settingEl) {
    this._selectedIntersectionStrategyClass = this._getSettingClass($settingEl, this._intersectionStrategyClasses);
    this._unselectAllSettings(this._intersectionStrategyClasses);
    this._setSelectedSettingCss($settingEl);

    if(this._selectedIntersectionStrategyClass == this._css.defaultIntersectionSettingClass)
        var intersectionStrategyMode = DemoLayoutBuilder.GridAdditionalSettings.INTERSECTION_STRATEGIES.DEFAULT;
    else if(this._selectedIntersectionStrategyClass == this._css.noIntersectionsSettingClass)
        var intersectionStrategyMode = DemoLayoutBuilder.GridAdditionalSettings.INTERSECTION_STRATEGIES.NO_INTERSECTIONS;

    var me = this;
    this._intersectionsSettingDemonstrator.setIntersectionMode(intersectionStrategyMode);
    $(this).trigger(DemoLayoutBuilder.GridAdditionalSettings.EVENT_INTERSECTION_STRATEGY_CHANGE, [
        intersectionStrategyMode,
        function() { return me._intersectionsSettingDemonstrator.isDefaultIntersectionMode(); },
        function() { return me._intersectionsSettingDemonstrator.isNoIntersectionsMode(); }
    ]);
}

DemoLayoutBuilder.GridAdditionalSettings.prototype._isSelectedSortDispersionSetting = function($settingEl) {
    if(this._getSettingClass($settingEl, this._sortDispersionClasses) == this._selectedSortDispersionClass)
        return true;
    else
        return false;
}

DemoLayoutBuilder.GridAdditionalSettings.prototype._selectSortDispersionSetting = function($settingEl) {
    this._selectedSortDispersionClass = this._getSettingClass($settingEl, this._sortDispersionClasses);
    this._unselectAllSettings(this._sortDispersionClasses);
    this._setSelectedSettingCss($settingEl);

    if(this._selectedSortDispersionClass == this._css.disabledSortDispersionSettingClass)
    {
        this._hideCustomSortDispersionLabels();
        this._disableSortDispersionSlider();
        var sortDispersion = DemoLayoutBuilder.GridAdditionalSettings.SORT_DISPERSION_MODES.DISABLED;
        var sortDispersionValue = null;
    }
    else if(this._selectedSortDispersionClass == this._css.customSortDispersionSettingClass)
    {
        this._showCustomSortDispersionLabels();
        this._enableSortDispersionSlider();
        var sortDispersion = DemoLayoutBuilder.GridAdditionalSettings.SORT_DISPERSION_MODES.CUSTOM;
        var sortDispersionValue = this._customSortDispersionValue;
    }

    var me = this;
    this._sortDispersionSettingDemonstrator.setSortDispersionMode(sortDispersion);
    $(this).trigger(DemoLayoutBuilder.GridAdditionalSettings.EVENT_SORT_DISPERSION_MODE_CHANGE, [
        sortDispersion, 
        sortDispersionValue,
        function() { return me._sortDispersionSettingDemonstrator.isDisabledSortDispersionMode(); },
        function() { return me._sortDispersionSettingDemonstrator.isCustomSortDispersionMode(); }
    ]);
}

DemoLayoutBuilder.GridAdditionalSettings.prototype._unselectAllSettings = function(settingClasses) {
    for(var i = 0; i < settingClasses.length; i++)
        this._unsetSelectedSettingCss(this._$view.find("." + settingClasses[i]));
}

DemoLayoutBuilder.GridAdditionalSettings.prototype._mutateSelectedSettingCss = function($settingEl, applyMutator, horClass, verClass) {
    if(this._gridSettings._isHorizontalGridType())
        applyMutator($settingEl, horClass);
    else if(this._gridSettings._isVerticalGridType())
        applyMutator($settingEl, verClass);
}

DemoLayoutBuilder.GridAdditionalSettings.prototype._setSelectedSettingCssMutator = function($targetEl, className) {
    $targetEl.addClass(className);
}

DemoLayoutBuilder.GridAdditionalSettings.prototype._unsetSelectedSettingCssMutator = function($targetEl, className) {
    $targetEl.removeClass(className);
}

DemoLayoutBuilder.GridAdditionalSettings.prototype._unsetSelectedSettingCss = function($settingEl) {
    this._mutateSelectedSettingCss(
        $settingEl, this._unsetSelectedSettingCssMutator, 
        this._css.horizontalGridSelectedSettingClass, this._css.verticalGridSelectedSettingClass
    );
}

DemoLayoutBuilder.GridAdditionalSettings.prototype._setSelectedSettingCss = function($settingEl) {
    this._mutateSelectedSettingCss(
        $settingEl, this._setSelectedSettingCssMutator,
        this._css.horizontalGridSelectedSettingClass, this._css.verticalGridSelectedSettingClass
    );
}