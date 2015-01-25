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
    this._gridDebugger = null;

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
        
        //me._gridifierSettings.appendType = "reversedAppend";   // @todo -> Delete, tmp
        //me._gridifierSettings.prependType = "reversedPrepend"; // @todo -> Delete, tmp
        //me._gridifierSettings.intersectionStrategy = "noIntersections"; // @todo -> Delete, tmp
        me._gridifierSettings.sortDispersionMode = "customAllEmptySpace";

        me._attachView();
        me._gridifierDynamicSettings = new DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings();

        me._gridifierDynamicSettings._batchSize = 5; // @todo -> Delete, tmp
        // me._gridifierDynamicSettings._itemSizes[0].width = "100px";
        // me._gridifierDynamicSettings._itemSizes[0].height = "100px";

        // me._gridifierDynamicSettings._itemSizes[1].width = "200px";
        // me._gridifierDynamicSettings._itemSizes[1].height = "200px";

        // me._gridifierDynamicSettings._itemSizes[2].width = "100px";
        // me._gridifierDynamicSettings._itemSizes[2].height = "300px";

        // me._gridifierDynamicSettings._itemSizes[3].width = "200px";
        // me._gridifierDynamicSettings._itemSizes[3].height = "100px";

        // me._gridifierDynamicSettings._itemSizes[4].width = "100px";
        // me._gridifierDynamicSettings._itemSizes[4].height = "200px"; // @todo -> Delete, tmp



        // me._gridifierDynamicSettings._itemSizes[0].width = "200px"; // cars tmp
        // me._gridifierDynamicSettings._itemSizes[0].height = "200px";

        // me._gridifierDynamicSettings._itemSizes[1].width = "400px";
        // me._gridifierDynamicSettings._itemSizes[1].height = "400px";

        // me._gridifierDynamicSettings._itemSizes[2].width = "200px";
        // me._gridifierDynamicSettings._itemSizes[2].height = "200px";

        // me._gridifierDynamicSettings._itemSizes[3].width = "400px";
        // me._gridifierDynamicSettings._itemSizes[3].height = "400px";

        // me._gridifierDynamicSettings._itemSizes[4].width = "200px";
        // me._gridifierDynamicSettings._itemSizes[4].height = "200px"; // cars tmp



        // me._gridifierDynamicSettings._batchSize = 3;

        // me._gridifierDynamicSettings._itemSizes[0].width = "50%";
        // me._gridifierDynamicSettings._itemSizes[0].height = "200px";

        // me._gridifierDynamicSettings._itemSizes[1].width = "25%";
        // me._gridifierDynamicSettings._itemSizes[1].height = "200px";

        // me._gridifierDynamicSettings._itemSizes[2].width = "25%";
        // me._gridifierDynamicSettings._itemSizes[2].height = "200px";



        // me._gridifierDynamicSettings._batchSize = 50;
        // for(var i = 0; i < 50; i++) {
        //     if(i % 2 == 0) {
        //         var width = "50px";
        //         var height = "25px";
        //     }
        //     else {
        //         var width = "25px";
        //         var height = "50px";
        //     }

        //     me._gridifierDynamicSettings._itemSizes[i].width = width;
        //     me._gridifierDynamicSettings._itemSizes[i].height = height;
        // }



        // me._gridifierDynamicSettings._itemSizes[0].width = "5%";  // @todo -> Delete, tmp
        // //me._gridifierDynamicSettings._itemSizes[0].width = "25px";
        // me._gridifierDynamicSettings._itemSizes[0].height = "100px";

        // me._gridifierDynamicSettings._itemSizes[1].width = "20%";
        // me._gridifierDynamicSettings._itemSizes[1].height = "200px";

        // me._gridifierDynamicSettings._itemSizes[2].width = "25%";
        // me._gridifierDynamicSettings._itemSizes[2].height = "300px";
        // //me._gridifierDynamicSettings._itemSizes[2].height = "335px";

        // me._gridifierDynamicSettings._itemSizes[3].width = "5%";
        // me._gridifierDynamicSettings._itemSizes[3].height = "100px";

        // me._gridifierDynamicSettings._itemSizes[4].width = "5%";
        // me._gridifierDynamicSettings._itemSizes[4].height = "200px"; // @todo -> Delete, tmp



        // for(var i = 0; i < 5; i++) {
        //     me._gridifierDynamicSettings._itemSizes[i].width = "20%";
        //     me._gridifierDynamicSettings._itemSizes[i].height = "100px";
        // }




        // @todo -> This is an example with margins params.(Margin size = 30px)
        // me._gridifierDynamicSettings._itemSizes[0].width = "260px";
        // me._gridifierDynamicSettings._itemSizes[0].height = "130px";

        // me._gridifierDynamicSettings._itemSizes[1].width = "100px";
        // me._gridifierDynamicSettings._itemSizes[1].height = "320px";

        // me._gridifierDynamicSettings._itemSizes[2].width = "260px";
        // me._gridifierDynamicSettings._itemSizes[2].height = "130px";

        // me._gridifierDynamicSettings._itemSizes[3].width = "260px";
        // me._gridifierDynamicSettings._itemSizes[3].height = "130px";

        // me._gridifierDynamicSettings._itemSizes[4].width = "100px";
        // me._gridifierDynamicSettings._itemSizes[4].height = "320px"; // @todo -> Delete, tmp

        me._gridifierDynamicSettings._itemSizes[0].width = "250px";
        me._gridifierDynamicSettings._itemSizes[0].height = "250px";

        me._gridifierDynamicSettings._itemSizes[1].width = "250px";
        me._gridifierDynamicSettings._itemSizes[1].height = "250px";

        me._gridifierDynamicSettings._itemSizes[2].width = "250px";
        me._gridifierDynamicSettings._itemSizes[2].height = "250px";

        me._gridifierDynamicSettings._itemSizes[3].width = "250px";
        me._gridifierDynamicSettings._itemSizes[3].height = "250px";

        me._gridifierDynamicSettings._itemSizes[4].width = "250px";
        me._gridifierDynamicSettings._itemSizes[4].height = "250px"; // @todo -> Delete, tmp

        me._$loadGridConfiguratorButton = me._$view.find("." + me._css.loadGridConfiguratorButtonClass);
        me._$gridTopHeadingView = me._$view.find("." + me._css.gridTopHeadingViewClass);
        me._$gridBottomHeadingView = me._$view.find("." + me._css.gridBottomHeadingViewClass);
        me._$gridTopControlsView = me._$view.find("." + me._css.gridTopControlsViewClass);
        me._$gridView = me._$view.find("." + me._css.gridViewClass);
        me._$gridBottomControlsView = me._$view.find("." + me._css.gridBottomControlsViewClass);
        me._$gridSourcesDumperView = me._$view.find("." + me._css.gridSourcesDumperClass);
        me._gridDebugger = new DemoLayoutBuilder.DemoLayout.GridDebugger(me);

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

       // for(var i = 0; i < 10000; i++) {
       //      var div = document.createElement("div");
       //      div.style.width = "30%";
       //      div.style.height = "100px";
       //      div.style.position = "absolute";
       //      div.style.left = "30%";
       //      div.style.top = "100px";
       //      div.style.border = "3px red solid";
       //      div.style.boxSizing = "border-box";
       //      div.style.fontSize = "14px";
       //      div.innerHTML = "100";
       //      Dom.css3.transition(div, "All 600ms ease");

       //      $("#demoLayout .grid").get(0).appendChild(div);

       //      (function(div, i) { setTimeout(function() {
       //          timer.start();
       //      var compCss = window.getComputedStyle(div, null);
       //      //var compCss = div.currentStyle;
       //      var width = compCss.width;
       //      var totaltime = timer.get();
       //      //if(i % 100 == 0)
       //      if(totaltime > 0.100) {
       //          //console.log("width = " + width);
       //          console.log("Elem [" + i + "] = " + totaltime);
       //      }
       //      }, 0); })(div, i);
       // }

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

        me._gridControlsManager.setMarginWidth("0px");
        me._gridControlsManager.setMarginHeight("0px");
        me._gridControlsManager.setPaddingWidth("0px");
        me._gridControlsManager.setPaddingHeight("0px");
        me._gridControlsManager.setBorderWidth("3px");
        me._gridControlsManager.setBorderHeight("3px");
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
        // me._$view.on("click", ".gridItem", function() {
        //     me._gridifier.toggleSizes($(this), "*2", "*2");
            // if($(this).hasClass("transformedItem")) {
            //     $(this).removeClass("transformedItem");
            //     me._gridifier.transformSizes($(this), "25%", "200px");
            //    //me._gridifier.transformSizes($(this), "200px", "200px");
            // }
            // else {
            //     $(this).addClass("transformedItem");
            //     me._gridifier.transformSizes($(this), "50%", "400px");
            //     //me._gridifier.transformSizes($(this), "400px", "400px");
            // }
        //});

        // @todo -> Replace this.(tmp for testing)
        me._$gridTopControlsView.find(".gridControlsHeadingMenu").on("click", function() {
            var $gridItems = $("#demoLayout .gridView").find(".gridItem");
            if($gridItems.length < 2)
                return;

            $firstGridItem = $gridItems.get(0);
            $secondGridItem = $gridItems.get(1);

            me._gridifier.toggleSizes([
                [$secondGridItem, "*2", "*2"],
                [$firstGridItem, "*2", "*2"]
            ]);
        });
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
            this._gridifierDynamicSettings.getMarginWidth(),
            this._gridifierDynamicSettings.getMarginHeight(),
            this._gridifierDynamicSettings.getPaddingWidth(),
            this._gridifierDynamicSettings.getPaddingHeight(),
            this._gridifierDynamicSettings.getBorderWidth(),
            this._gridifierDynamicSettings.getBorderHeight(),
            this._gridifierDynamicSettings.isBorderBoxBoxSizing(),
            this._gridifierDynamicSettings.isContentBoxBoxSizing(),
            this._gridifierDynamicSettings.getNextAppendedItemBgClass()
        );
        
        var $gridItem = gridItem.getView();
        this._gridifier.append($gridItem);
        // @todo -> Replace with real event
        // @todo -> Check if batch processing of appended items is required
        (function($gridItem, gridItem) {
            $gridItem.on("gridifier.appendFinished", function() {
                //setTimeout(function() {
                   gridItem.renderGUID();
                //}, 0);
            });
        })($gridItem, gridItem);
    }
}

DemoLayoutBuilder.DemoLayout.prototype._prependNextItems = function() {
    var itemSizes = this._gridifierDynamicSettings.getAllItemSizes();
    for(var i = 0; i < this._gridifierDynamicSettings.getBatchSize(); i++) {
        var gridItem = new DemoLayoutBuilder.DemoLayout.GridItem(
            this._grid.getGrid(),
            this._gridifier,
            itemSizes[i],
            this._gridifierDynamicSettings.getMarginWidth(),
            this._gridifierDynamicSettings.getMarginHeight(),
            this._gridifierDynamicSettings.getPaddingWidth(),
            this._gridifierDynamicSettings.getPaddingHeight(),
            this._gridifierDynamicSettings.getBorderWidth(),
            this._gridifierDynamicSettings.getBorderHeight(),
            this._gridifierDynamicSettings.isBorderBoxBoxSizing(),
            this._gridifierDynamicSettings.isContentBoxBoxSizing(),
            this._gridifierDynamicSettings.getNextPrependedItemBgClass()
        );

        var $gridItem = gridItem.getView();
        this._gridifier.prepend($gridItem);
        // @todo -> Replace with real event
        (function($gridItem, gridItem) {
            $gridItem.on("gridifier.prependFinished", function() {
                //setTimeout(function() {
                    // gridItem.renderGUID();
                //}, 0);
            });
        })($gridItem, gridItem);
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