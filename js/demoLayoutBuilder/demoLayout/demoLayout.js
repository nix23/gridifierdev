DemoLayoutBuilder.DemoLayout = function($targetEl, gridType, gridifierSettings, demoLayoutBuilder) {
    var me = this;

    this._$view = null;

    this._demoLayoutBuilder = null;

    this._gridType = null;
    this._gridifierSettings = null;

    this._$loadGridConfiguratorButton = null;

    this._css = {
        verticalGridThemeBgClass: "gridFifthBg",
        horizontalGridThemeBgClass: "gridFourthBg",

        loadGridConfiguratorButtonClass: "loadGridConfiguratorButton"
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

        me._bindEvents();
    }

    // @todo Vivoditj kod sozdanija gridifiera? S pravilnoj temoj
    // @todo Vinositj v otdelnuju papku renderfunction, sortfunctions, etc..
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

        me._$view = View.attach(me._$view, $targetEl, View.ids.DEMO_LAYOUT_BUILDER.DEMO_LAYOUT, viewParams);
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