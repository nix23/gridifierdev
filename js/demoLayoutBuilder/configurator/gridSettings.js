DemoLayoutBuilder.GridSettings = function($targetEl, settingsType, gridConfigurator, demoLayout) {
    var me = this;

    this._$view = null;

    this._demoLayout = null;
    this._gridConfigurator = null;
    this._gridAdditionalSettings = null;
    this._createGrid = null;

    this._prependSettingDemonstrator = null;
    this._appendSettingDemonstrator = null;

    this._settingsType = null;

    this._selectedPrependSettingClass = null;
    this._selectedAppendSettingClass = null;

    this._verticalGridSettingsViewParams = {
        settingNameHighlightClass: "gridFifthColor",
        mirroredPrependDescription: "Insert items at the beggining(top) of the layout accordingly to selected append mode.(Full relayout)",
        defaultPrependDescription: "Insert items at the beginning(top) of the layout from left to right.(No full relayout)",
        reversedPrependDescription: "Insert items at the beginning(top) of the layout from right to left.(No full relayout)",
        defaultAppendDescription: "Insert items at the end(bottom) of the layout from right to left.(No full relayout)",
        reversedAppendDescription: "Insert items at the end(bottom) of the layout from left to right.(No full relayout)",

        demonstratorGridTypeClass: "gridFifthBorderColor verticalGridDemonstrator"
    }

    this._horizontalGridSettingsViewParams = {
        settingNameHighlightClass: "gridFourthColor",
        mirroredPrependDescription: "Insert items at the beggining(left) of the layout accordingly to selected append mode.(Full relayout)",
        defaultPrependDescription: "Insert items at the beginning(left) of the layout from bottom to top.(No full relayout)",
        reversedPrependDescription: "Insert items at the beginning(left) of the layout from top to bottom.(No full relayout)",
        defaultAppendDescription: "Insert items at the end(right) of the layout from top to bottom.(No full relayout)",
        reversedAppendDescription: "Insert items at the end(right) of the layout from bottom to top.(No full relayout)",

        demonstratorGridTypeClass: "gridFourthBorderColor horizontalGridDemonstrator"
    }

    this._css = {
        settingClass: "setting",
        horizontalGridSelectedSettingClass: "gridFourthBorderColor",
        verticalGridSelectedSettingClass: "gridFifthBorderColor",

        mirroredPrependSettingClass: "mirroredPrependSetting",
        defaultPrependSettingClass: "defaultPrependSetting",
        reversedPrependSettingClass: "reversedPrependSetting",
        defaultAppendSettingClass: "defaultAppendSetting",
        reversedAppendSettingClass: "reversedAppendSetting",

        prependDemonstratorClass: "prependDemonstrator",
        appendDemonstratorClass: "appendDemonstrator"
    }

    this._prependSettingClasses = [
        this._css.mirroredPrependSettingClass, this._css.defaultPrependSettingClass,
        this._css.reversedPrependSettingClass
    ];

    this._appendSettingClasses = [
        this._css.defaultAppendSettingClass, this._css.reversedAppendSettingClass
    ];

    this._construct = function() {
        me._demoLayout = demoLayout;
        me._settingsType = settingsType;
        me._gridConfigurator = gridConfigurator;
        me._attachView(); 

        me._gridAdditionalSettings = new DemoLayoutBuilder.GridAdditionalSettings(
            $targetEl, 
            me,
            me._gridConfigurator.getGridTypeSelector(),
            me._demoLayout
        );
        me._createGrid = new DemoLayoutBuilder.CreateGrid($targetEl, me);

        me._selectSetting(me._$view.find("." + me._css.defaultPrependSettingClass));
        me._selectSetting(me._$view.find("." + me._css.defaultAppendSettingClass));

        var $prependDemonstrator = me._$view.find("." + me._css.prependDemonstratorClass);
        me._prependSettingDemonstrator = new DemoLayoutBuilder.InsertSettingDemonstrator(
            $prependDemonstrator, 
            me, 
            DemoLayoutBuilder.GridSettings.INSERT_MODES.PREPEND,
            me._gridConfigurator.getGridTypeSelector(),
            me._demoLayout
        );

        var $appendDemonstrator = me._$view.find("." + me._css.appendDemonstratorClass);
        me._appendSettingDemonstrator = new DemoLayoutBuilder.InsertSettingDemonstrator(
            $appendDemonstrator, 
            me, 
            DemoLayoutBuilder.GridSettings.INSERT_MODES.APPEND,
            me._gridConfigurator.getGridTypeSelector(),
            me._demoLayout
        );

        me._bindEvents();
    }

    this._bindEvents = function() {
        me._$view.on("mouseenter", "." + me._css.settingClass, function() {
            if(me._isSelectedSetting($(this))) return;
            me._setSelectedSettingCss($(this));
        });

        me._$view.on("mouseleave", "." + me._css.settingClass, function() {
            if(me._isSelectedSetting($(this))) return;
            me._unsetSelectedSettingCss($(this));
        });

        me._$view.on("click", "." + me._css.settingClass, function() {
            if(me._isSelectedSetting($(this))) return;
            me._selectSetting($(this));
        });
    }

    this._unbindEvents = function() {
        me._gridAdditionalSettings.destruct();
        me._createGrid.destruct();
        me._prependSettingDemonstrator.destruct();
        me._appendSettingDemonstrator.destruct();

        me._$view.remove();
    }

    this.destruct = function() {
        me._unbindEvents();
    }

    this._attachView = function() {

        if(me._isVerticalGridType())
            var viewParams = me._verticalGridSettingsViewParams;
        else if(me._isHorizontalGridType())
            var viewParams = me._horizontalGridSettingsViewParams;

        me._$view = View.attach(me._$view, $targetEl, View.ids.DEMO_LAYOUT_BUILDER.GRID_SETTINGS, viewParams);
    }

    this._construct();
    return this;
}

DemoLayoutBuilder.GridSettings.EVENT_APPEND_TYPE_CHANGE = "demoLayoutBuilder.gridSettings.appendTypeChange";
DemoLayoutBuilder.GridSettings.EVENT_PREPEND_TYPE_CHANGE = "demoLayoutBuilder.gridSettings.prependTypeChange";

DemoLayoutBuilder.GridSettings.INSERT_MODES = {PREPEND: 0, APPEND: 1};
DemoLayoutBuilder.GridSettings.PREPEND_TYPES = {MIRRORED_PREPEND: 0, DEFAULT_PREPEND: 1, REVERSED_PREPEND: 2};
DemoLayoutBuilder.GridSettings.APPEND_TYPES = {DEFAULT_APPEND: 0, REVERSED_APPEND: 1};
DemoLayoutBuilder.GridSettings.SETTING_TYPES = {VERTICAL_GRID: 0, HORIZONTAL_GRID: 1};

DemoLayoutBuilder.GridSettings.prototype.getGridAdditionalSettings = function() {
    return this._gridAdditionalSettings;
}

DemoLayoutBuilder.GridSettings.prototype.getCreateGrid = function() {
    return this._createGrid;
}

DemoLayoutBuilder.GridSettings.prototype._getClassConstBySettingClass = function(settingClass) {
    var classConstValue = null;

    switch(settingClass) 
    {
        case this._css.mirroredPrependSettingClass:
            classConstValue = DemoLayoutBuilder.GridSettings.PREPEND_TYPES.MIRRORED_PREPEND;
        break;

        case this._css.defaultPrependSettingClass:
            classConstValue = DemoLayoutBuilder.GridSettings.PREPEND_TYPES.DEFAULT_PREPEND;
        break;

        case this._css.reversedPrependSettingClass:
            classConstValue = DemoLayoutBuilder.GridSettings.PREPEND_TYPES.REVERSED_PREPEND;
        break;

        case this._css.defaultAppendSettingClass:
            classConstValue = DemoLayoutBuilder.GridSettings.APPEND_TYPES.DEFAULT_APPEND;
        break;

        case this._css.reversedAppendSettingClass:
            classConstValue = DemoLayoutBuilder.GridSettings.APPEND_TYPES.REVERSED_APPEND;
        break;
    }

    return classConstValue;
}

DemoLayoutBuilder.GridSettings.prototype._isMirroredPrepend = function() {
    var settingValue = this._getClassConstBySettingClass(this._selectedPrependSettingClass);
    return settingValue == DemoLayoutBuilder.GridSettings.PREPEND_TYPES.MIRRORED_PREPEND;
}

DemoLayoutBuilder.GridSettings.prototype._isDefaultPrepend = function() {
    var settingValue = this._getClassConstBySettingClass(this._selectedPrependSettingClass);
    return settingValue == DemoLayoutBuilder.GridSettings.PREPEND_TYPES.DEFAULT_PREPEND;
}

DemoLayoutBuilder.GridSettings.prototype._isReversedPrepend = function() {
    var settingValue = this._getClassConstBySettingClass(this._selectedPrependSettingClass);
    return settingValue == DemoLayoutBuilder.GridSettings.PREPEND_TYPES.REVERSED_PREPEND;
}

DemoLayoutBuilder.GridSettings.prototype._isDefaultAppend = function() {
    var settingValue = this._getClassConstBySettingClass(this._selectedAppendSettingClass);
    return settingValue == DemoLayoutBuilder.GridSettings.APPEND_TYPES.DEFAULT_APPEND;
}

DemoLayoutBuilder.GridSettings.prototype._isReversedAppend = function() {
    var settingValue = this._getClassConstBySettingClass(this._selectedAppendSettingClass);
    return settingValue == DemoLayoutBuilder.GridSettings.APPEND_TYPES.REVERSED_APPEND;
}

DemoLayoutBuilder.GridSettings.prototype._isHorizontalGridType = function() {
    return this._settingsType == DemoLayoutBuilder.GridSettings.SETTING_TYPES.HORIZONTAL_GRID;
}

DemoLayoutBuilder.GridSettings.prototype._isVerticalGridType = function() {
    return this._settingsType == DemoLayoutBuilder.GridSettings.SETTING_TYPES.VERTICAL_GRID;
}

DemoLayoutBuilder.GridSettings.prototype._isSelectedSetting = function($settingEl) {
    if(this._getSettingClass($settingEl) == this._selectedPrependSettingClass
        || this._getSettingClass($settingEl) == this._selectedAppendSettingClass)
        return true;
    else
        return false;
}

DemoLayoutBuilder.GridSettings.prototype._elementHasSettingClassApplicator = function($settingEl, 
                                                                                                                                          settingClasses, 
                                                                                                                                          hasSettingApplicator, 
                                                                                                                                          noneElementHasSettingApplicator) {
    for(var i = 0; i < settingClasses.length; i++)
    {
        if($settingEl.hasClass(settingClasses[i]))
            return hasSettingApplicator(settingClasses[i]);
    }

    return noneElementHasSettingApplicator();
}

DemoLayoutBuilder.GridSettings.prototype._alwaysTrue = function() {
    return true;
}

DemoLayoutBuilder.GridSettings.prototype._alwaysFalse = function() {
    return false;
}

DemoLayoutBuilder.GridSettings.prototype._void = function() {
    ;
}

DemoLayoutBuilder.GridSettings.prototype._settingClassGetter = function(settingClass) {
    return settingClass;
}

DemoLayoutBuilder.GridSettings.prototype._isPrependSetting = function($settingEl) {
    return this._elementHasSettingClassApplicator($settingEl, this._prependSettingClasses, this._alwaysTrue, this._alwaysFalse);
}

DemoLayoutBuilder.GridSettings.prototype._isAppendSetting = function($settingEl) {
    return this._elementHasSettingClassApplicator($settingEl, this._appendSettingClasses, this._alwaysTrue, this._alwaysFalse);
}

DemoLayoutBuilder.GridSettings.prototype._getSettingClass = function($settingEl) {
    if(this._isPrependSetting($settingEl))
        return this._elementHasSettingClassApplicator($settingEl, this._prependSettingClasses, this._settingClassGetter, this._void);
    else if(this._isAppendSetting($settingEl))
        return this._elementHasSettingClassApplicator($settingEl, this._appendSettingClasses, this._settingClassGetter, this._void);
}

DemoLayoutBuilder.GridSettings.prototype._selectSetting = function($settingEl) {
    if(this._isPrependSetting($settingEl))
    {
        this._unselectAllSettings(this._prependSettingClasses);
        this._selectedPrependSettingClass = this._getSettingClass($settingEl);
    }
    else if(this._isAppendSetting($settingEl))
    {
        this._unselectAllSettings(this._appendSettingClasses);
        this._selectedAppendSettingClass = this._getSettingClass($settingEl);
    }

    this._setSelectedSettingCss($settingEl);

    var me = this;
    if(this._isPrependSetting($settingEl))
    {
        $(this).trigger(DemoLayoutBuilder.GridSettings.EVENT_PREPEND_TYPE_CHANGE, [
            function() { return me._isMirroredPrepend(); },
            function() { return me._isDefaultPrepend(); },
            function() { return me._isReversedPrepend(); }
        ]);
    }
    else if(this._isAppendSetting($settingEl))
    {
        $(this).trigger(DemoLayoutBuilder.GridSettings.EVENT_APPEND_TYPE_CHANGE, [
            function() { return me._isDefaultAppend(); },
            function() { return me._isReversedAppend(); }
        ]);
    }
}

DemoLayoutBuilder.GridSettings.prototype._unselectAllSettings = function(settingClasses) {
    for(var i = 0; i < settingClasses.length; i++)
        this._unsetSelectedSettingCss(this._$view.find("." + settingClasses[i]));
}

DemoLayoutBuilder.GridSettings.prototype._mutateSelectedSettingCss = function($settingEl, applyMutator, horClass, verClass) {
    if(this._isHorizontalGridType())
        applyMutator($settingEl, horClass);
    else if(this._isVerticalGridType())
        applyMutator($settingEl, verClass);
}

DemoLayoutBuilder.GridSettings.prototype._setSelectedSettingCssMutator = function($targetEl, className) {
    $targetEl.addClass(className);
}

DemoLayoutBuilder.GridSettings.prototype._unsetSelectedSettingCssMutator = function($targetEl, className) {
    $targetEl.removeClass(className);
}

DemoLayoutBuilder.GridSettings.prototype._unsetSelectedSettingCss = function($settingEl) {
    this._mutateSelectedSettingCss(
        $settingEl, this._unsetSelectedSettingCssMutator, 
        this._css.horizontalGridSelectedSettingClass, this._css.verticalGridSelectedSettingClass
    );
}

DemoLayoutBuilder.GridSettings.prototype._setSelectedSettingCss = function($settingEl) {
    this._mutateSelectedSettingCss(
        $settingEl, this._setSelectedSettingCssMutator,
        this._css.horizontalGridSelectedSettingClass, this._css.verticalGridSelectedSettingClass
    );
}