DemoLayoutBuilder.DemoLayout.VerticalGridHeading = function($targetEl, grid) {
    var me = this;

    this._$view = View.attach(this._$view, $targetEl, View.ids.DEMO_LAYOUT_BUILDER.DEMO_LAYOUT.GRID_HEADING.VERTICAL_GRID);

    this._grid = null;

    this._css = {
        layoutWidthClass: "layoutWidth",
        layoutHeightClass: "layoutHeight"
    };

    this._$layoutWidth = null;
    this._$layoutHeight = null;

    this._construct = function() {
        me._grid = grid;

        me._$layoutWidth = me._$view.find("." + me._css.layoutWidthClass);
        me._$layoutHeight = me._$view.find("." + me._css.layoutHeightClass);

        me._bindEvents();
    }

    this._bindEvents = function() {
        $(me._grid).on(DemoLayoutBuilder.DemoLayout.VerticalGrid.EVENT_GRID_SIZES_CHANGE, function(event, width, height) {
            me._$layoutWidth.html(width + "px");
            me._$layoutHeight.html(height + "px");
        });
    }

    this._unbindEvents = function() {
        $(me._grid).off(DemoLayoutBuilder.DemoLayout.VerticalGrid.EVENT_GRID_SIZES_CHANGE);
    }

    this.destruct = function() {
        me._unbindEvents();
    }

    this._construct();
    return this;
}