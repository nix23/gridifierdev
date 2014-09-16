DemoLayoutBuilder.DemoLayout = function($targetEl, gridType, gridifierSettings) {
    var me = this;

    this._$view = View.attach(this._$view, $targetEl, View.ids.DEMO_LAYOUT_BUILDER.DEMO_LAYOUT);

    this._gridType = null;
    this._gridifierSettings = null;

    this._css = {

    }

    this._construct = function() {
        me._gridType = gridType;
        me._gridifierSettings = gridifierSettings;

        me._bindEvents();
    }

    this._bindEvents = function() {

    }

    this._unbindEvents = function() {

    }

    this.destruct = function() {
        me._unbindEvents();
        me._$view.remove();
    }

    this._construct();
    return this;
}

DemoLayoutBuilder.DemoLayout.GRID_TYPES = {HORIZONTAL_GRID: 0, VERTICAL_GRID: 1};

DemoLayoutBuilder.DemoLayout.prototype.getView = function() {
    return this._$view;
}