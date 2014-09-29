DemoLayoutBuilder.DemoLayout.VerticalGridHeading = function($targetEl) {
    var me = this;

    this._$view = View.attach(this._$view, $targetEl, View.ids.DEMO_LAYOUT_BUILDER.DEMO_LAYOUT.GRID_HEADING.VERTICAL_GRID);

    this._css = {
        layoutWidthClass: "layoutWidth",
        layoutHeightClass: "layoutHeight"
    };

    this._$layoutWidth = null;
    this._$layoutHeight = null;

    this._construct = function() {
        me._$layoutWidth = me._$view.find("." + me._css.layoutWidthClass);
        me._$layoutHeight = me._$view.find("." + me._css.layoutHeightClass);

        me._bindEvents();
    }

    this._bindEvents = function() {

    }

    this._unbindEvents = function() {

    }

    this.destruct = function() {
        me._unbindEvents();
    }

    this._construct();
    return this;
}