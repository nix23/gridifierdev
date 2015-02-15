DemoLayoutBuilder.DemoLayout.HorizontalGridHeading = function($targetEl, grid) {
    var me = this;

    this._$view = View.attach(this._$view, $targetEl, View.ids.DEMO_LAYOUT_BUILDER.DEMO_LAYOUT.GRID_HEADING.HORIZONTAL_GRID);

    this._grid = null;

    this._css = {
        gridWrapperWidthClass: "gridWrapperWidth",
        gridWrapperHeightClass: "gridWrapperHeight",
        gridWidthClass: "gridWidth",
        gridHeightClass: "gridHeight"
    };

    this._$gridWrapperWidth = null;
    this._$gridWrapperHeight = null;
    this._$gridWidth = null;
    this._$gridHeight = null;

    this._construct = function() {
        me._grid = grid;

        me._$gridWrapperWidth = me._$view.find("." + me._css.gridWrapperWidthClass);
        me._$gridWrapperHeight = me._$view.find("." + me._css.gridWrapperHeightClass);
        me._$gridWidth = me._$view.find("." + me._css.gridWidthClass);
        me._$gridHeight = me._$view.find("." + me._css.gridHeightClass);

        me._bindEvents();
    }

    this._bindEvents = function() {
        $(me._grid).on(DemoLayoutBuilder.DemoLayout.HorizontalGrid.EVENT_GRID_SIZES_CHANGE, function(event,
                                                                                                     gridWrapperWidth,
                                                                                                     gridWrapperHeight,
                                                                                                     gridWidth,
                                                                                                     gridHeight) {
            me._$gridWrapperWidth.html(gridWrapperWidth + "px");
            me._$gridWrapperHeight.html(gridWrapperHeight + "px");
            me._$gridWidth.html(gridWidth + "px");
            me._$gridHeight.html(gridHeight + "px");
        });
    }

    this._unbindEvents = function() {
        $(me._grid).off(DemoLayoutBuilder.DemoLayout.HorizontalGrid.EVENT_GRID_SIZES_CHANGE);
    }

    this.destruct = function() {
        me._unbindEvents();
    }

    this._construct();
    return this;
}