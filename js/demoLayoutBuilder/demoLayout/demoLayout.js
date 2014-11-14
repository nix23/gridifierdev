DemoLayoutBuilder.DemoLayout = function($targetEl, gridType, gridifierSettings, demoLayoutBuilder) {
    var me = this;

    this._$view = null;

    this._demoLayoutBuilder = null;
    this._gridifier = null;

    this._gridHeading = null;
    this._gridTopControls = null;
    this._grid = null;
    this._gridBottomControls = null;
    this._gridSourcesDumper = null;

    this._gridType = null;
    this._gridifierSettings = null;
    this._gridifierDynamicSettings = null;

    this._$loadGridConfiguratorButton = null;

    this._gridControlsManager = null;
    this._$gridTopHeadingView = null;
    this._$gridBottomHeadingView = null;
    this._$gridTopControlsView = null;
    this._$gridView = null;
    this._$gridBottomControlsView = null;
    this._$gridSourcesDumperView = null;

    this._css = {
        verticalGridThemeBgClass: "gridFifthBg",
        horizontalGridThemeBgClass: "gridFourthBg",

        loadGridConfiguratorButtonClass: "loadGridConfiguratorButton",

        gridTopHeadingViewClass: "gridTopHeadingView",
        gridBottomHeadingViewClass: "gridBottomHeadingView",
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
        me._gridifierDynamicSettings = new DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings();

        me._$loadGridConfiguratorButton = me._$view.find("." + me._css.loadGridConfiguratorButtonClass);
        me._$gridTopHeadingView = me._$view.find("." + me._css.gridTopHeadingViewClass);
        me._$gridBottomHeadingView = me._$view.find("." + me._css.gridBottomHeadingViewClass);
        me._$gridTopControlsView = me._$view.find("." + me._css.gridTopControlsViewClass);
        me._$gridView = me._$view.find("." + me._css.gridViewClass);
        me._$gridBottomControlsView = me._$view.find("." + me._css.gridBottomControlsViewClass);
        me._$gridSourcesDumperView = me._$view.find("." + me._css.gridSourcesDumperClass);

        if(me.isVerticalGrid()) {
            me._grid = new DemoLayoutBuilder.DemoLayout.VerticalGrid(me._$gridView);
            me._gridTopHeading = new DemoLayoutBuilder.DemoLayout.VerticalGridHeading(me._$gridTopHeadingView, me._grid);
            me._gridBottomHeading = new DemoLayoutBuilder.DemoLayout.VerticalGridHeading(me._$gridBottomHeadingView, me._grid);
        }
        else if(me.isHorizontalGrid()) {
            me._grid = new DemoLayoutBuilder.DemoLayout.HorizontalGrid(me._$gridView);
            me._gridTopHeading = new DemoLayoutBuilder.DemoLayout.HorizontalGridHeading(me._$gridTopHeadingView, me._grid);
            me._gridBottomHeading = new DemoLayoutBuilder.DemoLayout.HorizontalGridHeading(me._$gridBottomHeadingView, me._grid);
        }
        
       me._gridifier = new Gridifier(me._grid.getGrid().get(0), me._gridifierSettings);

        me._gridControlsManager = new DemoLayoutBuilder.DemoLayout.GridControlsManager(me._gridifier);
        me._gridTopControls = new DemoLayoutBuilder.DemoLayout.GridControls(
            me._$gridTopControlsView, 
            me,
            DemoLayoutBuilder.DemoLayout.GridControls.CONTROLS_TYPES.TOP,
            me._gridifierDynamicSettings,
            me._gridControlsManager
        );
        me._gridBottomControls = new DemoLayoutBuilder.DemoLayout.GridControls(
            me._$gridBottomControlsView, 
            me,
            DemoLayoutBuilder.DemoLayout.GridControls.CONTROLS_TYPES.BOTTOM,
            me._gridifierDynamicSettings,
            me._gridControlsManager
        );
        me._gridControlsManager.addGridControls(me._gridTopControls);
        me._gridControlsManager.addGridControls(me._gridBottomControls);

        me._gridControlsManager.setAllItemSizes("100px", "100px");

        me._gridControlsManager.setItemCssControlBorder(3);
        me._gridControlsManager.setItemCssControlMargin(0);
        me._gridControlsManager.setBoxSizingItemCssControlBorderBoxOption();

        if(!browserDetector.isIe8())
            me._gridControlsManager.selectToggleControlScaleOption();
        else
            me._gridControlsManager.selectToggleControlVisibilityOption();

        me._gridControlsManager.selectFilterControlAllOption();
        me._gridControlsManager.selectSortControlByGUIDOption();
        me._gridControlsManager.setBatchSizeOption(1);

        me._gridSourcesDumper = new DemoLayoutBuilder.DemoLayout.GridSourcesDumper(
            me._$gridSourcesDumperView,
            me
        );

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

        var controlClickEvent = DemoLayoutBuilder.DemoLayout.GridControls.EVENT_CONTROL_SELECT;
        $(me._gridTopControls).on(controlClickEvent, function(event, clickedControl) {
            if(clickedControl == DemoLayoutBuilder.DemoLayout.GridControls.CONTROLS.APPEND)
                me._appendNextItems();
            else if(clickedControl == DemoLayoutBuilder.DemoLayout.GridControls.CONTROLS.PREPEND)
                me._prependNextItems();
        });
        $(me._gridBottomControls).on(controlClickEvent, function(event, clickedControl) {
            if(clickedControl == DemoLayoutBuilder.DemoLayout.GridControls.CONTROLS.APPEND)
                me._appendNextItems();
            else if(clickedControl == DemoLayoutBuilder.DemoLayout.GridControls.CONTROLS.PREPEND)
                me._prependNextItems();
        });

        // @todo -> Listen for correct event
        $(me._gridifier).on("gridifier.gridSizesChange", function() {
            $(me).trigger(DemoLayoutBuilder.DemoLayout.EVENT_DEMO_LAYOUT_SIZES_CHANGE);
        });

        // @todo -> Replace this.(Tmp for testing)
        me._$view.on("click", ".gridItem", function() {
            if($(this).hasClass("transformedItem")) {
                $(this).removeClass("transformedItem");
                me._gridifier.transformSizes($(this), "24.95%", "100px");
            }
            else {
                $(this).addClass("transformedItem");
                me._gridifier.transformSizes($(this), "49.8%", "200px");
            }
        });

        // var containerWidthStart = 2; 
        // //var containerWidthStart = 1069;
        // var containerWidthEnd = 1070;
        // for(var containerWidth = containerWidthStart; containerWidth <= containerWidthEnd; containerWidth++) {
        //     var elementsCountStart = 2;
        //     //var elementsCountStart = 20;
        //     var elementsCountEnd = 20;
        //     for(var elementsCount = elementsCountStart; elementsCount <= elementsCountEnd; elementsCount++) {
        //         var elementWidth = containerWidth / elementsCount;
        //         var flooredWidth = Math.floor(elementWidth);
        //         var ceiledWidth = Math.ceil(elementWidth);

        //         if(flooredWidth == ceiledWidth) {
        //             flooredWidth = elementWidth - 1;
        //             ceiledWidth = elementWidth + 1;
        //         }

        //         var totalPixelsCovered = 0;
        //         for(j = 0; j < elementsCount; j++) {
        //             if(j % 2 == 0)
        //                 totalPixelsCovered += flooredWidth;
        //             else
        //                 totalPixelsCovered += ceiledWidth;
        //         }

        //         //if(totalPixelsCovered != containerWidth)
        //          //   console.log("TotalPixelsCovered: ", totalPixelsCovered, ", containerWidth: ", containerWidth);

        //         console.log("totalPixelsCovered: ", totalPixelsCovered, ", containerWidth: ", containerWidth);
        //     }
        // }
    }

    this._unbindEvents = function() {

    }

    this.destruct = function() {
        me._unbindEvents();
        me._$view.remove();
        // @todo remove all grid stuff here
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

DemoLayoutBuilder.DemoLayout.EVENT_DEMO_LAYOUT_SIZES_CHANGE = "demoLayoutBuilder.DemoLayout.demoLayoutSizesChange";
DemoLayoutBuilder.DemoLayout.GRID_TYPES = {HORIZONTAL_GRID: 0, VERTICAL_GRID: 1};

DemoLayoutBuilder.DemoLayout.prototype.getView = function() {
    return this._$view;
}

DemoLayoutBuilder.DemoLayout.prototype._appendNextItems = function() {
    var itemSizes = this._gridifierDynamicSettings.getAllItemSizes();
    for(var i = 0; i < this._gridifierDynamicSettings.getBatchSize(); i++) {
        var gridItem = new DemoLayoutBuilder.DemoLayout.GridItem(
            this._grid.getGrid(),
            this._gridifier,
            itemSizes[i],
            this._gridifierDynamicSettings.getItemBorder(),
            this._gridifierDynamicSettings.getItemMargin(),
            this._gridifierDynamicSettings.isBorderBoxBoxSizing(),
            this._gridifierDynamicSettings.isContentBoxBoxSizing(),
            this._gridifierDynamicSettings.getNextAppendedItemBgClass()
        );
        var $gridItem = gridItem.getView();
        this._gridifier.append($gridItem);
        gridItem.renderGUID();
    }
}

DemoLayoutBuilder.DemoLayout.prototype._prependNextItems = function() {
    var itemSizes = this._gridifierDynamicSettings.getAllItemSizes();
    for(var i = 0; i < this._gridifierDynamicSettings.getBatchSize(); i++) {
        var gridItem = new DemoLayoutBuilder.DemoLayout.GridItem(
            this._grid.getGrid(),
            this._gridifier,
            itemSizes[i],
            this._gridifierDynamicSettings.getItemBorder(),
            this._gridifierDynamicSettings.getItemMargin(),
            this._gridifierDynamicSettings.isBorderBoxBoxSizing(),
            this._gridifierDynamicSettings.isContentBoxBoxSizing(),
            this._gridifierDynamicSettings.getNextPrependedItemBgClass()
        );
        var $gridItem = gridItem.getView();
        this._gridifier.prepend($gridItem);
        gridItem.renderGUID();
    }
}

DemoLayoutBuilder.DemoLayout.prototype.isVerticalGrid = function() {
    return this._gridType == DemoLayoutBuilder.DemoLayout.GRID_TYPES.VERTICAL_GRID;
}

DemoLayoutBuilder.DemoLayout.prototype.isHorizontalGrid = function() {
    return this._gridType == DemoLayoutBuilder.DemoLayout.GRID_TYPES.HORIZONTAL_GRID;
}

DemoLayoutBuilder.DemoLayout.prototype._getGridifierSetting = function(settingName) {
    if(typeof this._gridifierSettings[settingName] == "undefined")
        throw new Error("demoLayout: unknown settingName '" + settingName + "'");

    return this._gridifierSettings[settingName];
}

DemoLayoutBuilder.DemoLayout.prototype.isDefaultPrependGrid = function() {
    return this._getGridifierSetting("prependType") == Gridifier.PREPEND_TYPES.DEFAULT_PREPEND;
}

DemoLayoutBuilder.DemoLayout.prototype.isReversedPrependGrid = function() {
    return this._getGridifierSetting("prependType") == Gridifier.PREPEND_TYPES.REVERSED_PREPEND;
}

DemoLayoutBuilder.DemoLayout.prototype.isMirroredPrependGrid = function() {
    return this._getGridifierSetting("prependType") == Gridifier.PREPEND_TYPES.MIRRORED_PREPEND;
}

DemoLayoutBuilder.DemoLayout.prototype.isDefaultAppendGrid = function() {
    return this._getGridifierSetting("appendType") == Gridifier.APPEND_TYPES.DEFAULT_APPEND;
}

DemoLayoutBuilder.DemoLayout.prototype.isReversedAppendGrid = function() {
    return this._getGridifierSetting("appendType") == Gridifier.APPEND_TYPES.REVERSED_APPEND;
}