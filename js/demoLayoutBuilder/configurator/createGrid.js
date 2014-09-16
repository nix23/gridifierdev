DemoLayoutBuilder.CreateGrid = function($targetEl, gridSettings) {
    var me = this;

    this._$view = null;

    this._gridSettings = null;

    this._$createButton = null;

    this._verticalGridCreateGridViewParams = {

    }

    this._horizontalGridCreateGridViewParams = {

    }

    this._css = {
        createButtonClass: "createButton",

        verticalGridSelectedButtonClass: "gridFifthBg selectedButton",
        horizontalGridSelectedButtonClass: "gridFourthBg selectedButton"
    }

    this._construct = function() {
        me._gridSettings = gridSettings;
        me._attachView();

        me._$createButton = me._$view.find("." + me._css.createButtonClass);
        me._bindEvents();
    }

    this._bindEvents = function() {
        me._$createButton.on("mouseenter", function() {
            if(me._gridSettings._isVerticalGridType())
            {
                me._$createButton.addClass(me._css.verticalGridSelectedButtonClass);
            }
            else if(me._gridSettings._isHorizontalGridType())
            {
                me._$createButton.addClass(me._css.horizontalGridSelectedButtonClass);
            }
        });

        me._$createButton.on("mouseleave", function() {
            if(me._gridSettings._isVerticalGridType())
            {
                me._$createButton.removeClass(me._css.verticalGridSelectedButtonClass);
            }
            else if(me._gridSettings._isHorizontalGridType())
            {
                me._$createButton.removeClass(me._css.horizontalGridSelectedButtonClass);
            }
        });

        me._$createButton.on("click", function() {
            $(me).trigger(DemoLayoutBuilder.CreateGrid.EVENT_BUTTON_CLICK);
        });
    }

    this._unbindEvents = function() {

    }

    this.destruct = function() {
        me._unbindEvents();
        me._$view.remove();
    }

    this._attachView = function() {
        if(me._gridSettings._isVerticalGridType())
            var viewParams = me._verticalGridCreateGridViewParams;
        else if(me._gridSettings._isHorizontalGridType())
            var viewParams = me._horizontalGridCreateGridViewParams;

        me._$view = View.attach(me._$view, $targetEl, View.ids.DEMO_LAYOUT_BUILDER.CREATE_GRID, viewParams);
    }

    this._construct();
    return this;
}

DemoLayoutBuilder.CreateGrid.EVENT_BUTTON_CLICK = "demoLayoutBuilder.createGrid.buttonClick";