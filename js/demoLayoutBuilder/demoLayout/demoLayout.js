DemoLayoutBuilder.DemoLayout = function($targetEl, gridType, gridifierSettings, demoLayoutBuilder) {
    var me = this;

    this._$view = null;

    this._demoLayoutBuilder = null;

    this._gridHeading = null;
    this._gridTopControls = null;
    this._grid = null;
    this._gridBottomControls = null;
    this._gridSourcesDumper = null;

    this._gridType = null;
    this._gridifierSettings = null;
    this._gridifierDynamicSettings = null;

    this._$loadGridConfiguratorButton = null;

    this._gridControlsManager = null;
    this._$gridHeadingView = null;
    this._$gridTopControlsView = null;
    this._$gridView = null;
    this._$gridBottomControlsView = null;
    this._$gridSourcesDumperView = null;

    this._css = {
        verticalGridThemeBgClass: "gridFifthBg",
        horizontalGridThemeBgClass: "gridFourthBg",

        loadGridConfiguratorButtonClass: "loadGridConfiguratorButton",

        gridHeadingViewClass: "gridHeadingView",
        gridTopControlsViewClass: "gridTopControlsView",
        gridViewClass: "gridView",
        gridBottomControlsViewClass: "gridBottomControlsView",
        gridSourcesDumperClass: "gridSourcesDumperView"
    }

    this._verticalGridViewParams = {
        gridThemeBgClass: this._css.verticalGridThemeBgClass
    }

    this._horizontalGridViewParams = {
        gridThemeBgClass: this._css.horizontalGridThemeBgClass
    }

    this._construct = function() {
        me._demoLayoutBuilder = demoLayoutBuilder;
        me._gridType = gridType;
        me._gridifierSettings = gridifierSettings;

        me._attachView();
        me._gridifierDynamicSettings = new DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings();

        me._$loadGridConfiguratorButton = me._$view.find("." + me._css.loadGridConfiguratorButtonClass);
        me._$gridHeadingView = me._$view.find("." + me._css.gridHeadingViewClass);
        me._$gridTopControlsView = me._$view.find("." + me._css.gridTopControlsViewClass);
        me._$gridView = me._$view.find("." + me._css.gridViewClass);
        me._$gridBottomControlsView = me._$view.find("." + me._css.gridBottomControlsViewClass);
        me._$gridSourcesDumperView = me._$view.find("." + me._css.gridSourcesDumperClass);

        if(me.isVerticalGrid()) {
            me._gridHeading = new DemoLayoutBuilder.DemoLayout.VerticalGridHeading(me._$gridHeadingView);
            me._grid = new DemoLayoutBuilder.DemoLayout.VerticalGrid(me._$gridView);
        }
        else if(me.isHorizontalGrid()) {
            me._gridHeading = new DemoLayoutBuilder.DemoLayout.HorizontalGridHeading(me._$gridHeadingView);
            me._grid = new DemoLayoutBuilder.DemoLayout.HorizontalGrid(me._$gridView);
        }

        me._gridControlsManager = new DemoLayoutBuilder.DemoLayout.GridControlsManager();
        me._gridTopControls = new DemoLayoutBuilder.DemoLayout.GridControls(
            me._$gridTopControlsView, 
            me,
            DemoLayoutBuilder.DemoLayout.GridControls.CONTROLS_TYPES.TOP,
            me._gridifierDynamicSettings,
            me._gridControlsManager
        );
        me._gridBottomControls = new DemoLayoutBuilder.DemoLayout.GridControls(
            me._$gridBottomControlsView, 
            me,
            DemoLayoutBuilder.DemoLayout.GridControls.CONTROLS_TYPES.BOTTOM,
            me._gridifierDynamicSettings,
            me._gridControlsManager
        );
        me._gridControlsManager.addGridControls(me._gridTopControls);
        me._gridControlsManager.addGridControls(me._gridBottomControls);

        me._gridControlsManager.setItemCssControlBorder(5);
        me._gridControlsManager.setItemCssControlMargin(0);
        me._gridControlsManager.setBoxSizingItemCssControlBorderBoxOption();

        if(!browserDetector.isIe8())
            me._gridControlsManager.selectToggleControlScaleOption();
        else
            me._gridControlsManager.selectToggleControlVisibilityOption();

        me._gridControlsManager.selectFilterControlAllOption();
        me._gridControlsManager.selectSortControlByGUIDOption();
        me._gridControlsManager.setBatchSizeOption(1);

        me._gridSourcesDumper = new DemoLayoutBuilder.DemoLayout.GridSourcesDumper(me._$gridSourcesDumperView);

        me._bindEvents();
    }

    this._bindEvents = function() {
        me._$loadGridConfiguratorButton.on("mouseenter", function() {
            if(me.isVerticalGrid())
                $(this).addClass(me._css.verticalGridThemeBgClass);
            else if(me.isHorizontalGrid())
                $(this).addClass(me._css.horizontalGridThemeBgClass);
        });

        me._$loadGridConfiguratorButton.on("mouseleave", function() {
            if(me.isVerticalGrid())
                $(this).removeClass(me._css.verticalGridThemeBgClass);
            else if(me.isHorizontalGrid())
                $(this).removeClass(me._css.horizontalGridThemeBgClass);
        });

        me._$loadGridConfiguratorButton.on("click", function() {
            $(me._demoLayoutBuilder).trigger(DemoLayoutBuilder.EVENT_LOAD_GRID_CONFIGURATOR);
        });
    }

    this._unbindEvents = function() {

    }

    this.destruct = function() {
        me._unbindEvents();
        me._$view.remove();
        // @todo remove all grid stuff here
    }

    this._attachView = function() {
        if(me.isVerticalGrid())
            var viewParams = me.verticalGridParams;
        else if(me.isHorizontalGrid())
            var viewParams = me.horizontalGridParams;

        me._$view = View.attach(me._$view, $targetEl, View.ids.DEMO_LAYOUT_BUILDER.DEMO_LAYOUT.DEMO_LAYOUT, viewParams);
    }

    this._construct();
    return this;
}

DemoLayoutBuilder.DemoLayout.GRID_TYPES = {HORIZONTAL_GRID: 0, VERTICAL_GRID: 1};

DemoLayoutBuilder.DemoLayout.prototype.getView = function() {
    return this._$view;
}

DemoLayoutBuilder.DemoLayout.prototype.isVerticalGrid = function() {
    return this._gridType == DemoLayoutBuilder.DemoLayout.GRID_TYPES.VERTICAL_GRID;
}

DemoLayoutBuilder.DemoLayout.prototype.isHorizontalGrid = function() {
    return this._gridType == DemoLayoutBuilder.DemoLayout.GRID_TYPES.HORIZONTAL_GRID;
}

DemoLayoutBuilder.DemoLayout.prototype._getGridifierSetting = function(settingName) {
    if(typeof this._gridifierSettings[settingName] == "undefined")
        throw new Error("demoLayout: unknown settingName '" + settingName + "'");

    return this._gridifierSettings[settingName];
}

DemoLayoutBuilder.DemoLayout.prototype.isDefaultPrependGrid = function() {
    return this._getGridifierSetting("prependType") == Gridifier.PREPEND_TYPES.DEFAULT_PREPEND;
}

DemoLayoutBuilder.DemoLayout.prototype.isReversedPrependGrid = function() {
    return this._getGridifierSetting("prependType") == Gridifier.PREPEND_TYPES.REVERSED_PREPEND;
}

DemoLayoutBuilder.DemoLayout.prototype.isMirroredPrependGrid = function() {
    return this._getGridifierSetting("prependType") == Gridifier.PREPEND_TYPES.MIRRORED_PREPEND;
}

DemoLayoutBuilder.DemoLayout.prototype.isDefaultAppendGrid = function() {
    return this._getGridifierSetting("appendType") == Gridifier.APPEND_TYPES.DEFAULT_APPEND;
}

DemoLayoutBuilder.DemoLayout.prototype.isReversedAppendGrid = function() {
    return this._getGridifierSetting("appendType") == Gridifier.APPEND_TYPES.REVERSED_APPEND;
}