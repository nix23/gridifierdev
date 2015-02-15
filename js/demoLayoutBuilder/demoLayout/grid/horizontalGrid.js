DemoLayoutBuilder.DemoLayout.HorizontalGrid = function($targetEl) {
    var me = this;

    this._$view = View.attach(this._$view, $targetEl, View.ids.DEMO_LAYOUT_BUILDER.DEMO_LAYOUT.GRID.HORIZONTAL_GRID);

    this._$grid = null;
    this._$gridBody = null;
    this._$gridBg = null;
    this._$gridResizer = null;

    this._isResizing = false;
    this._gridMinHeight = 60;
    this._gridBgSetDefaultFontClassAfterHeight = 250;
    this._gridBgSetReduced2xFontClassAfterHeight = 60;

    this._css = {
        gridClass: "horizontalGrid",
        gridBodyClass: "gridBody",
        gridBgClass: "gridBg",
        gridBgDefaultFontClass: "defaultGridBgFont",
        gridBgReduced2xFontClass: "reduced2xGridBgFont",

        gridResizerClass: "horizontalGridResizer",
        gridResizerSelectedClass: "gridFourthBg",
        gridResizerIconLeftClass: "left",
        gridResizerIconMiddleClass: "middle",
        gridResizerIconRightClass: "right",
        gridResizerSelectedIconLeftClass: "leftSelected",
        gridResizerSelectedIconMiddleClass: "middleSelected",
        gridResizerSelectedIconRightClass: "rightSelected"
    }

    this._construct = function() {
        me._$grid = me._$view.parent().find("." + me._css.gridClass); 
        me._$gridBody = me._$view.find("." + me._css.gridBodyClass);
        me._$gridBg = me._$view.find("." + me._css.gridBgClass);
        me._$gridResizer = me._$view.parent().find("." + me._css.gridResizerClass);
        me._adjustGridBgFontSize();
        
        this._bindEvents();
    }

    this._bindEvents = function() {
        me._$grid.get(0).onselectstart = function() {
            return false;
        };

        $(window).scroll($.proxy(me._processScroll, me));
        $(window).on(DemoLayoutBuilder.DemoLayout.HorizontalGrid.EVENT_WINDOW_RESIZE, function(event) {
            me._adjustResizerVerticalPosition();
            me._adjustGridBgFontSize(event);
            me._triggerGridSizesChangeEvent();
        });
        setTimeout(function() { me._triggerGridSizesChangeEvent(); }, 0);

        me._$gridResizer.on("mousedown", function() {
            me._isResizing = true;
            me._highlightResizer();
        });

        $("body").on(DemoLayoutBuilder.DemoLayout.HorizontalGrid.EVENT_RESIZER_RELEASE, function(event) {
            me._isResizing = false;
            me._unhighlightResizer();
        });

        // @todo -> Don't allow to resize wrapper smaller than maxHeight of item???
        $("body").on("mousemove", function(event) {
            if(!me._isResizing) {
                if(me._isMouseOverResizer(event))
                    me._highlightResizer();
                else
                    me._unhighlightResizer();
                return;
            }
            
            me._recalculateGridHeightOnResizerResize(event);
            me._adjustGridBgFontSize(event);
            me._triggerGridSizesChangeEvent();
            $(window).trigger("resize"); // @todo -> Replace with nice event
            $(me).trigger(DemoLayoutBuilder.DemoLayout.HorizontalGrid.EVENT_GRID_VERTICAL_RESIZE);
        });

        $("body").on(DemoLayoutBuilder.DemoLayout.HorizontalGrid.EVENT_BODY_MOUSELEAVE, function() {
            $(window).one("mouseup.test", function() { 
                $("body").trigger(DemoLayoutBuilder.DemoLayout.HorizontalGrid.EVENT_RESIZER_RELEASE);
            });
        });
    }

    this._unbindEvents = function() {

    }

    this.destruct = function() {
        me._unbindEvents();
    }

    this._construct();
    return this;
}

DemoLayoutBuilder.DemoLayout.HorizontalGrid.EVENT_GRID_SIZES_CHANGE = "DemoLayoutBuilder.DemoLayout.GridSizesChange";
DemoLayoutBuilder.DemoLayout.HorizontalGrid.EVENT_WINDOW_RESIZE = "resize.DemoLayoutBuilder.DemoLayout.HorizontalGrid";
DemoLayoutBuilder.DemoLayout.HorizontalGrid.EVENT_RESIZER_RELEASE = "mouseup.DemoLayoutBuilder.DemoLayout.HorizontalGrid";
DemoLayoutBuilder.DemoLayout.HorizontalGrid.EVENT_BODY_MOUSELEAVE = "mouseleave.DemoLayoutBuilder.DemoLayout.HorizontalGrid";
DemoLayoutBuilder.DemoLayout.HorizontalGrid.EVENT_WINDOW_MOUSEUP = "mouseup.DemoLayoutBuilder.DemoLayout.HorizontalGrid.OutsideBody";
DemoLayoutBuilder.DemoLayout.HorizontalGrid.EVENT_GRID_VERTICAL_RESIZE = "DemoLayoutBuilder.DemoLayout.HorizontalGrid.GridVerticalResize";

DemoLayoutBuilder.DemoLayout.HorizontalGrid.prototype.getGrid = function() {
    return this._$gridBody;
}

DemoLayoutBuilder.DemoLayout.HorizontalGrid.prototype._triggerGridSizesChangeEvent = function() {
    $(this).trigger(DemoLayoutBuilder.DemoLayout.HorizontalGrid.EVENT_GRID_SIZES_CHANGE, [
        this._$grid.outerWidth(),
        this._$grid.outerHeight(),
        this._$gridBody.outerWidth(), 
        this._$gridBody.outerHeight()
    ]);
}

DemoLayoutBuilder.DemoLayout.HorizontalGrid.prototype._adjustGridBgFontSize = function(event) {
    this._$gridBg.removeClass(this._css.gridBgDefaultFontClass);
    this._$gridBg.removeClass(this._css.gridBgReduced2xFontClass);
    this._$gridBg.removeClass(this._css.gridBgReduced4xFontClass);

    var gridHeight = this._$grid.outerHeight();
    if(gridHeight >= this._gridBgSetDefaultFontClassAfterHeight)
        this._$gridBg.addClass(this._css.gridBgDefaultFontClass);
    else if(gridHeight >= this._gridBgSetReduced2xFontClassAfterHeight)
        this._$gridBg.addClass(this._css.gridBgReduced2xFontClass);
}

DemoLayoutBuilder.DemoLayout.HorizontalGrid.prototype._recalculateGridHeightOnResizerResize = function(event) {
    var newHeight = event.pageY - this._$grid.offset().top + (Math.round(this._$gridResizer.outerHeight()) / 2);
    
    if(newHeight < this._gridMinHeight)
        newHeight = this._gridMinHeight;

    this._$grid.outerHeight(newHeight);
}

DemoLayoutBuilder.DemoLayout.HorizontalGrid.prototype._isMouseOverResizer = function(event) {
    var resizerX1 = this._$gridResizer.offset().left;
    var resizerX2 = resizerX1 + this._$gridResizer.outerWidth();
    var resizerY1 = this._$gridResizer.offset().top;
    var resizerY2 = resizerY1 + this._$gridResizer.outerHeight();

    if(event.pageX >= resizerX1 && event.pageX <= resizerX2 && event.pageY >= resizerY1 && event.pageY <= resizerY2)
        return true;
    else
        return false;
}

DemoLayoutBuilder.DemoLayout.HorizontalGrid.prototype._processScroll = function() {
    this._adjustResizerVerticalPosition();
}

DemoLayoutBuilder.DemoLayout.HorizontalGrid.prototype._adjustResizerVerticalPosition = function() {
    var viewportY1 = $(window).scrollTop();
    var viewportY2 = $(window).height() + $(window).scrollTop();

    var gridY1 = this._$grid.offset().top;
    var gridY2 = gridY1 + this._$grid.outerHeight();

    if(gridY2 > viewportY2) {
        var offsetBottom = gridY2 - viewportY2; 
        if(offsetBottom + this._$gridResizer.outerHeight() > this._$grid.outerHeight())
            this._$gridResizer.css("bottom", (this._$grid.outerHeight - this._$gridResizer.outerHeight()) + "px");
        else
            this._$gridResizer.css("bottom", offsetBottom + "px");
    }
    else
        this._$gridResizer.css("bottom", "0px");
}

DemoLayoutBuilder.DemoLayout.HorizontalGrid.prototype._highlightResizer = function() {
    this._$gridResizer.addClass(this._css.gridResizerSelectedClass);
    this._$gridResizer.find("." + this._css.gridResizerIconLeftClass).addClass(this._css.gridResizerSelectedIconLeftClass);
    this._$gridResizer.find("." + this._css.gridResizerIconMiddleClass).addClass(this._css.gridResizerSelectedIconMiddleClass);
    this._$gridResizer.find("." + this._css.gridResizerIconRightClass).addClass(this._css.gridResizerSelectedIconRightClass);
}

DemoLayoutBuilder.DemoLayout.HorizontalGrid.prototype._unhighlightResizer = function() {
    this._$gridResizer.removeClass(this._css.gridResizerSelectedClass);
    this._$gridResizer.find("." + this._css.gridResizerIconLeftClass).removeClass(this._css.gridResizerSelectedIconLeftClass);
    this._$gridResizer.find("." + this._css.gridResizerIconMiddleClass).removeClass(this._css.gridResizerSelectedIconMiddleClass);
    this._$gridResizer.find("." + this._css.gridResizerIconRightClass).removeClass(this._css.gridResizerSelectedIconRightClass);
}