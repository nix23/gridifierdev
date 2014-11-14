DemoLayoutBuilder.DemoLayout.GridSourcesDumper = function($targetEl, demoLayout) {
    var me = this;

    this._$view = null;

    this._demoLayout = null;

    this._viewParams = {
        bgClass: null
    }

    this._css = {
        horizontalGridBgClass: "gridFourthBg",
        verticalGridBgClass: "gridFifthBg"
    }

    this._construct = function() {
        me._demoLayout = demoLayout;
        me._attachView();

        this._bindEvents();
    }

    this._bindEvents = function() {

    }

    this._unbindEvents = function() {

    }

    this.destruct = function() {
        me._unbindEvents();
    }

    this._attachView = function() {
        if(me._demoLayout.isVerticalGrid()) {
            me._viewParams.bgClass = me._css.verticalGridBgClass;
        }
        else if(me._demoLayout.isHorizontalGrid()) {
            me._viewParams.bgClass = me._css.horizontalGridBgClass;
        }

        me._$view = View.attach(
            me._$view, 
            $targetEl, 
            View.ids.DEMO_LAYOUT_BUILDER.DEMO_LAYOUT.GRID_SOURCES_DUMPER,
            me._viewParams
        );
    }

    this._construct();
    return this;
}