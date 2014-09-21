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

    this._$loadGridConfiguratorButton = null;

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

        me._gridTopControls = new DemoLayoutBuilder.DemoLayout.GridControls(me._$gridTopControlsView);
        me._gridBottomControls = new DemoLayoutBuilder.DemoLayout.GridControls(me._$gridBottomControlsView);
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