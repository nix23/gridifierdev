DemoLayoutBuilder.DemoLayout.VerticalGrid = function($targetEl) {
    var me = this;

    this._$view = View.attach(this._$view, $targetEl, View.ids.DEMO_LAYOUT_BUILDER.DEMO_LAYOUT.GRID.VERTICAL_GRID);

    this._$grid = null;
    this._$gridBg = null;
    this._$gridResizer = null;

    this._isResizing = false;
    this._gridMinWidth = 60;
    this._gridBgSetDefaultFontClassAfterWidth = 500;
    this._gridBgSetReduced2xFontClassAfterWidth = 250;
    this._gridBgSetReduced4xFontClassAfterWidth = 60;

    this._css = {
        gridClass: "grid",
        gridBgClass: "gridBg",
        gridBgDefaultFontClass: "defaultGridBgFont",
        gridBgReduced2xFontClass: "reduced2xGridBgFont",
        gridBgReduced4xFontClass: "reduced4xGridBgFont",

        gridResizerClass: "gridResizer",
        gridResizerSelectedClass: "gridFifthBg",
        gridResizerIconLeftClass: "left",
        gridResizerIconMiddleClass: "middle",
        gridResizerIconRightClass: "right",
        gridResizerSelectedIconLeftClass: "leftSelected",
        gridResizerSelectedIconMiddleClass: "middleSelected",
        gridResizerSelectedIconRightClass: "rightSelected"
    }

    this._construct = function() {
        me._$grid = me._$view.parent().find("." + me._css.gridClass); 
        me._$gridBg = me._$view.find("." + me._css.gridBgClass);
        me._$gridResizer = me._$view.find("." + me._css.gridResizerClass);
        
        this._bindEvents();
    }

    this._bindEvents = function() {
        me._$grid.get(0).onselectstart = function() {
            return false;
        };

        $(window).scroll($.proxy(me._processScroll, me));
        $(window).on(DemoLayoutBuilder.DemoLayout.VerticalGrid.EVENT_WINDOW_RESIZE, function(event) {
            me._adjustResizerVerticalPosition();
            me._recalculateGridWidthOnWindowResize(event);
            me._adjustGridBgFontSize(event);
            me._triggerGridSizesChangeEvent();
        });
        setTimeout(function() { me._triggerGridSizesChangeEvent(); }, 0);

        me._$gridResizer.on("mousedown", function() {
            me._isResizing = true;
            me._highlightResizer();
        });

        $("body").on(DemoLayoutBuilder.DemoLayout.VerticalGrid.EVENT_RESIZER_RELEASE, function(event) {
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
            
            me._recalculateGridWidthOnResizerResize(event);
            me._adjustGridBgFontSize(event);
            me._triggerGridSizesChangeEvent();
            $(window).trigger("resize"); // @todo -> Replace with nice event
        });

        $("body").on(DemoLayoutBuilder.DemoLayout.VerticalGrid.EVENT_BODY_MOUSELEAVE, function() {
            $(window).one("mouseup.test", function() { 
                $("body").trigger(DemoLayoutBuilder.DemoLayout.VerticalGrid.EVENT_RESIZER_RELEASE);
            });
        });
    }

    this._unbindEvents = function() {
        $(window).off("scroll", me._processScroll);
        $(window).off(DemoLayoutBuilder.DemoLayout.VerticalGrid.EVENT_WINDOW_RESIZE);
        $("body").off(DemoLayoutBuilder.DemoLayout.VerticalGrid.EVENT_BODY_MOUSELEAVE);
    }

    this.destruct = function() {
        me._unbindEvents();
    }
    
    this._construct();
    return this;
}

DemoLayoutBuilder.DemoLayout.VerticalGrid.EVENT_GRID_SIZES_CHANGE = "DemoLayoutBuilder.DemoLayout.GridSizesChange";
DemoLayoutBuilder.DemoLayout.VerticalGrid.EVENT_WINDOW_RESIZE = "resize.DemoLayoutBuilder.DemoLayout.VerticalGrid";
DemoLayoutBuilder.DemoLayout.VerticalGrid.EVENT_RESIZER_RELEASE = "mouseup.DemoLayoutBuilder.DemoLayout.VerticalGrid";
DemoLayoutBuilder.DemoLayout.VerticalGrid.EVENT_BODY_MOUSELEAVE = "mouseleave.DemoLayoutBuilder.DemoLayout.VerticalGrid";
DemoLayoutBuilder.DemoLayout.VerticalGrid.EVENT_WINDOW_MOUSEUP = "mouseup.DemoLayoutBuilder.DemoLayout.VerticalGrid.OutsideBody";

DemoLayoutBuilder.DemoLayout.VerticalGrid.prototype.getGrid = function() {
    return this._$grid;
}

DemoLayoutBuilder.DemoLayout.VerticalGrid.prototype._triggerGridSizesChangeEvent = function() {
    $(this).trigger(DemoLayoutBuilder.DemoLayout.VerticalGrid.EVENT_GRID_SIZES_CHANGE, [
        this._$grid.outerWidth(), this._$grid.outerHeight()
    ]);
}

DemoLayoutBuilder.DemoLayout.VerticalGrid.prototype._adjustGridBgFontSize = function(event) {
    this._$gridBg.removeClass(this._css.gridBgDefaultFontClass);
    this._$gridBg.removeClass(this._css.gridBgReduced2xFontClass);
    this._$gridBg.removeClass(this._css.gridBgReduced4xFontClass);

    var gridWidth = this._$grid.outerWidth();
    if(gridWidth >= this._gridBgSetDefaultFontClassAfterWidth)
        this._$gridBg.addClass(this._css.gridBgDefaultFontClass);
    else if(gridWidth >= this._gridBgSetReduced2xFontClassAfterWidth)
        this._$gridBg.addClass(this._css.gridBgReduced2xFontClass);
    else if(gridWidth >= this._gridBgSetReduced4xFontClassAfterWidth)
        this._$gridBg.addClass(this._css.gridBgReduced4xFontClass);
}

DemoLayoutBuilder.DemoLayout.VerticalGrid.prototype._recalculateGridWidthOnResizerResize = function(event) {
    var newWidth = event.pageX - this._$grid.offset().left + (Math.round(this._$gridResizer.outerWidth() / 2));
    
    if(newWidth < this._gridMinWidth)
        newWidth = this._gridMinWidth;
    else if(newWidth > this._$view.parent().outerWidth())
        newWidth = this._$view.parent().outerWidth(); 

    this._$grid.outerWidth(newWidth);
}

DemoLayoutBuilder.DemoLayout.VerticalGrid.prototype._recalculateGridWidthOnWindowResize = function(event) {
    var newViewWrapperWidth = this._$view.parent().outerWidth();
    if(this._$grid.outerWidth() > newViewWrapperWidth)
        this._$grid.outerWidth(newViewWrapperWidth);
}

DemoLayoutBuilder.DemoLayout.VerticalGrid.prototype._isMouseOverResizer = function(event) {
    var resizerX1 = this._$gridResizer.offset().left;
    var resizerX2 = resizerX1 + this._$gridResizer.outerWidth();
    var resizerY1 = this._$gridResizer.offset().top;
    var resizerY2 = resizerY1 + this._$gridResizer.outerHeight();

    if(event.pageX >= resizerX1 && event.pageX <= resizerX2 && event.pageY >= resizerY1 && event.pageY <= resizerY2)
        return true;
    else
        return false;
}

DemoLayoutBuilder.DemoLayout.VerticalGrid.prototype._processScroll = function() {
    this._adjustResizerVerticalPosition();
}

DemoLayoutBuilder.DemoLayout.VerticalGrid.prototype._adjustResizerVerticalPosition = function() {
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

DemoLayoutBuilder.DemoLayout.VerticalGrid.prototype._highlightResizer = function() {
    this._$gridResizer.addClass(this._css.gridResizerSelectedClass);
    this._$gridResizer.find("." + this._css.gridResizerIconLeftClass).addClass(this._css.gridResizerSelectedIconLeftClass);
    this._$gridResizer.find("." + this._css.gridResizerIconMiddleClass).addClass(this._css.gridResizerSelectedIconMiddleClass);
    this._$gridResizer.find("." + this._css.gridResizerIconRightClass).addClass(this._css.gridResizerSelectedIconRightClass);
}

DemoLayoutBuilder.DemoLayout.VerticalGrid.prototype._unhighlightResizer = function() {
    this._$gridResizer.removeClass(this._css.gridResizerSelectedClass);
    this._$gridResizer.find("." + this._css.gridResizerIconLeftClass).removeClass(this._css.gridResizerSelectedIconLeftClass);
    this._$gridResizer.find("." + this._css.gridResizerIconMiddleClass).removeClass(this._css.gridResizerSelectedIconMiddleClass);
    this._$gridResizer.find("." + this._css.gridResizerIconRightClass).removeClass(this._css.gridResizerSelectedIconRightClass);
}