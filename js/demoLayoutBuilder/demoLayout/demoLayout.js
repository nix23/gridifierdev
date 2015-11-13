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

    this._nextGridItemNumber = -1;
    this._prevGridItemNumber = 1;

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
        me._nextGridItemNumber = -1;
        me._prevGridItemNumber = 1;

        me._demoLayoutBuilder = demoLayoutBuilder;
        me._gridType = gridType;
        me._gridifierSettings = gridifierSettings;
        
        me._gridifierSettings.gridTransformType = "expand";
        //me._gridifierSettings.dragifierMode = "d";
        // me._gridifierSettings.widthPxAs = 20;
        // me._gridifierSettings.heightPxAs = 20;

        me._gridifierSettings.prependType = "mirroredPrepend";
        //me._gridifierSettings.loadImages = true;
        //me._gridifierSettings.append = "reversed";
        //me._gridifierSettings.appendType = "reversedAppend";   // @todo -> Delete, tmp
        //me._gridifierSettings.prependType = "reversedPrepend"; // @todo -> Delete, tmp
        //me._gridifierSettings.intersectionStrategy = "noIntersections"; // @todo -> Delete, tmp
        //me._gridifierSettings.alignmentType = "center";
        //me._gridifierSettings.sortDispersion = "custom";
        me._gridifierSettings.sortDispersionMode = "customAllEmptySpace";
        //me._gridifierSettings.dragifier = true;
        //me._gridifierSettings.dragifierMode = "discretization";
        //me._gridifierSettings.retransformSort = "areaEvenly";
        //me._gridifierSettings.retransformQueueBatchSize = 500;
        //me._gridifierSettings.coordsChangeAnimationMsDuration = 300;
        //me._gridifierSettings.toggleDuration = 1500;
        //me._gridifierSettings.coordsChangeDuration = 1500;

        //me._gridifierSettings.intersections = false;
        //me._gridifierSettings.retransformQueueBatchSize = 10000;
        me._gridifierSettings.dragifier = true;
         //me._gridifierSettings.append = "reversed";
          //me._gridifierSettings.prepend = "reversed";
         //me._gridifierSettings.dragifier = true;
         me._gridifierSettings.gridResize = "expand";
         // me._gridifierSettings.append = "reversed";
         //  me._gridifierSettings.intersections = false;
         // me._gridifierSettings.prepend = "reversed";
          me._gridifierSettings.sortDispersion = true;
         //  me._gridifierSettings.align = "center";s

         // me._gridifierSettings.widthPxAs = 100;
         // me._gridifierSettings.heightPxAs = 100;

        //me._gridifierSettings.dragifier = "testSelector";
        //me._gridifierSettings.sortDispersionMode = "custom";
        //me._gridifierSettings.sortDispersionValue = "200px";
        //me._gridifierSettings.dragifierMode = "discretization";
        //me._gridifierSettings.retransformQueueBatchSize = 50;
        //me._gridifierSettings.rotateAngles = [-180, -360, -80, -80];

        //me._gridifierSettings.retransformQueueBatchSize = 50;
        //me._gridifierSettings.disableRetransformQueueOnDrags = false;
        //me._gridifierSettings.rsort = {selected: "areaEvenly"};

        setTimeout(function() {
            //me._gridifier.setToggle("fade");
            //me._gridifier.setRetransformQueueBatchSize(50);
           //me._gridifier.setRetransformSort("orientationEvenly");
            //me._gridifier.setToggle("rotateX");
            //me._gridifier.setRotateAngles([-180, -360]);
            //me._gridifier.setToggleAnimationMsDuration(1000);
            //me._gridifier.setCoordsChangeAnimationMsDuration(1000);
            //me._gridifier.setToggle("slideClockwiseFromCornersWithFade");
            //me._gridifier.setCoordsChanger("CSS3Translate3D");
        }, 500);

        //me._gridifierSettings.appendType = "reversedAppend";



        me._gridifierSettings.sort = {"byColor": function(firstItem, secondItem, sort) {
            var firstItemClassParts = firstItem.getAttribute("class").split(" ");
            var secondItemClassParts = secondItem.getAttribute("class").split(" ");
        
            var firstItemColorClass = "";
            var secondItemColorClass = "";
        
            for(var i = 0; i < firstItemClassParts.length; i++) {
                if(firstItemClassParts[i].search("Bg") !== -1) {
                    firstItemColorClass = firstItemClassParts[i];
                    break;
                }
            }
        
            for(var i = 0; i < secondItemClassParts.length; i++) {
                if(secondItemClassParts[i].search("Bg") !== -1) {
                    secondItemColorClass = secondItemClassParts[i];
                    break;
                }
            }
        
            var classNameToOrderNumber = function(className) {
                if(className == "gridFirstBg") return 1;
                else if(className == "gridSecondBg") return 2;
                else if(className == "gridThirdBg") return 3;
                else if(className == "gridFourthBg") return 4;
                else if(className == "gridFifthBg") return 5;
            }
        
            var firstItemOrderNum = classNameToOrderNumber(firstItemColorClass);
            var secondItemOrderNum = classNameToOrderNumber(secondItemColorClass);
        
            if(firstItemOrderNum < secondItemOrderNum)
                return -1;
            else if(firstItemOrderNum == secondItemOrderNum)
                return sort.byOriginalPos(firstItem, secondItem);
            else if(firstItemOrderNum > secondItemOrderNum)
                return 1;
        }};

        // window.createDiv = function() {
        //     return $("<div/>").css({
        //         "width": "100px",
        //         "height": "100px",
        //         "background": "red",
        //         "box-sizing": "border-box",
        //         "border": "px black solid"
        //     }).get(0);
        // };

        // window.test = function() {
        //     var div = window.createDiv();
        //     var div2 = window.createDiv();
        //     $("#demoLayout .grid").get(0).appendChild(div2);
        //     $("#demoLayout .grid").get(0).appendChild(div);
        //     me._gridifier.insertAfter([div, div2], $("#demoLayout .grid").find("[data-gridifier-item-id=10002]"));
        // }

        var itemFilterCore = function(item, itemClassName) {
            var itemClassParts = item.getAttribute("class").split(" ");
            var itemClass = "";

            for(var i = 0; i < itemClassParts.length; i++) {
                if(itemClassParts[i].search('Bg') !== -1) {
                    itemClass = itemClassParts[i];
                    break;
                }
            }

            if(itemClass == itemClassName)
                return true;
            else
                return false;
        }

        me._gridifierSettings.filter = {
            //"initial": "disabled",
            //initial: "blue",

            "blue": function(item) {
                return itemFilterCore(item, "gridFirstBg");
            },

            "violet": function(item) {
                return itemFilterCore(item, "gridSecondBg");
            },

            "red": function(item) {
                return itemFilterCore(item, "gridFourthBg");
            },

            "yellow": function(item) {
                return itemFilterCore(item, "gridThirdBg");
            },

            "green": function(item) {
                return itemFilterCore(item, "gridFifthBg");
            },
            "big": function(item) {
                return $(item).outerWidth() > 100;
            },
            "small": function(item) {
                return $(item).outerWidth() <= 100;
            },

            "disabled": function(item) {
                return false;
            }
        };

        //$(window).on("resize", function() {
        //    window.gridifier.silentRender(window.gridifier.getForSilentRender(true));
        //});
        //
        //$(document).on("scroll", function() {
        //    window.gridifier.silentRender(window.gridifier.getForSilentRender(true));
        //});

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

        me._gridifierSettings.toggleAnimationMsDuration = 1000;
        //me._gridifierSettings.loadImages = true;
        // me._gridifierSettings.prepend = "reversed";
        // me._gridifierSettings.append = "reversed";
        //me._gridifierSettings.coordsChangeAnimationMsDuration = 3000;
        //me._gridifierSettings.rotateBackface = false;
        //me._gridifierSettings.rotatePerspective = "3000px";

        /*
        me._gridifierDynamicSettings._batchSize = 50;
        for(var i = 0; i < 50; i++) {
            if(i % 2 == 0) {
                 //var width = "20%";
                 //var height = "200px";
                 var width = "200px";
                 var height = "100px";
                //var width = "200px";
                //var height = "200px";
            }
            else {
                //var width = "50%";
                //var height = "600px";
                var width = "100px";
                var height = "200px";
                //var width = "100px";
                //var height = "100px";
            }

            me._gridifierDynamicSettings._itemSizes[i].width = width;
            me._gridifierDynamicSettings._itemSizes[i].height = height;
        }
        */

        //me._gridifierDynamicSettings._batchSize = 16;
        //var sizes = [
        //    {width: "25%", height: "25%"},
        //    {width: "12.5%", height: "12.5%"},
        //    {width: "12.5%", height: "12.5%"},
        //    {width: "12.5%", height: "12.5%"},
        //    {width: "25%", height: "25%"},
        //    {width: "12.5%", height: "12.5%"},
        //    {width: "12.5%", height: "12.5%"},
        //    {width: "25%", height: "25%"},
        //    {width: "12.5%", height: "12.5%"},
        //    {width: "12.5%", height: "12.5%"},
        //    {width: "25%", height: "25%"},
        //    {width: "12.5%", height: "12.5%"},
        //    {width: "25%", height: "25%"},
        //    {width: "12.5%", height: "12.5%"},
        //    {width: "12.5%", height: "12.5%"},
        //    {width: "12.5%", height: "12.5%"}
        //];
        //for(var i = 0; i < sizes.length; i++) {
        //    me._gridifierDynamicSettings._itemSizes[i].width = sizes[i].width;
        //    me._gridifierDynamicSettings._itemSizes[i].height = sizes[i].height;
        //}

        // me._gridifierSettings.widthPtAs = 0.1;
        // me._gridifierSettings.heightPxAs = 1;
        // me._gridifierSettings.sortDispersion = true;
        me._gridifierDynamicSettings._batchSize = 10;
        //me._gridifierDynamicSettings._batchSize = 25;
        //me._gridifierDynamicSettings._batchSize = 3;
        var sizes = [
            //{width: "10%", height: "10%"},
            //{width: "5%", height: "5%"},
            //{width: "5%", height: "5%"},
            //{width: "5%", height: "5%"},
            //{width: "10%", height: "10%"},
            //{width: "5%", height: "5%"},
            //{width: "20%", height: "20%"},
            //{width: "10%", height: "10%"},
            //{width: "10%", height: "10%"},
            //{width: "20%", height: "20%"},
            //{width: "50%", height: "25%"},
            //{width: "50%", height: "12%"},
            //{width: "25%", height: "12%"},
            //{width: "12.5%", height: "25%"},
            //{width: "200px", height: "200px"},
            //{width: "100px", height: "100px"},
            //{width: "50px", height: "50px"},
            //{width: "50px", height: "50px"},
            //{width: "50px", height: "50px"},
            //{width: "50px", height: "50px"},

            // {width: "200px", height: "200px"},
            // {width: "200px", height: "200px"},
            // {width: "200px", height: "200px"},
            // {width: "200px", height: "200px"},
            // {width: "200px", height: "200px"},
            // {width: "200px", height: "200px"},
            // {width: "200px", height: "200px"},
            // {width: "200px", height: "200px"},
            // {width: "200px", height: "200px"},
            // {width: "200px", height: "200px"},
            //


            // {width: "200px", height: "200px"},
            // {width: "100px", height: "100px"},
            // {width: "100px", height: "100px"},
            // {width: "100px", height: "100px"},
            // {width: "200px", height: "200px"},
            {width: "100px", height: "100px"},
            {width: "100px", height: "100px"},
            {width: "100px", height: "100px"},
            // {width: "200px", height: "200px"},
            // {width: "200px", height: "200px"}
            // {width: "12.6%", height: "12.5%"},
            // {width: "12.6%", height: "12.5%"},
            // {width: "25.1%", height: "calc(25% - 1px)"},
            // {width: "12.6%", height: "12.5%"},
            // {width: "12.6%", height: "12.5%"},
            // {width: "12.6%", height: "12.5%"},
            // {width: "25.1%", height: "calc(25% - 1px)"},
            // {width: "12.6%", height: "12.5%"},
            // {width: "12.6%", height: "12.5%"},
            // {width: "12.6%", height: "12.5%"}


            //
            //{width: "200px", height: "200px"},
            //{width: "100px", height: "100px"},
            //{width: "50px", height: "50px"},
            //{width: "50px", height: "50px"},
            //{width: "200px", height: "200px"},
            //{width: "100px", height: "100px"},
            //{width: "50px", height: "50px"},
            //{width: "50px", height: "50px"},
            //{width: "50px", height: "50px"},
            //{width: "50px", height: "50px"},






            //{width: "33.33%", "height": "20%"},
            //{width: "33.33%", "height": "20%"},
            //{width: "33.33%", "height": "20%"},
            //{width: "33.33%", "height": "20%"},
            //{width: "5%", height: "10%"},
            //{width: "10%", height: "10%"},
            //{width: "5%", height: "5%"},
            //{width: "5%", height: "5%"},
            //{width: "5%", height: "5%"},
            //{width: "10%", height: "10%"},



            //
            //{width: "20%", height: "100%"},
            //{width: "10%", height: "100%"},
            //{width: "5%", height: "50%"},
            //{width: "10%", height: "50%"},
            //{width: "5%", height: "100%"},
            //{width: "5%", height: "50%"},
            //{width: "5%", height: "50%"}
        ];
        for(var i = 0; i < sizes.length; i++) {
            me._gridifierDynamicSettings._itemSizes[i].width = sizes[i].width;
            me._gridifierDynamicSettings._itemSizes[i].height = sizes[i].height;
        }


        /*
        me._gridifierDynamicSettings._itemSizes[0].width = "200px";  // @todo -> Delete, tmp
        //me._gridifierDynamicSettings._itemSizes[0].width = "25px";
        me._gridifierDynamicSettings._itemSizes[0].height = "200px";

        me._gridifierDynamicSettings._itemSizes[1].width = "200px";
        me._gridifierDynamicSettings._itemSizes[1].height = "200px";

        me._gridifierDynamicSettings._itemSizes[2].width = "200px";
        me._gridifierDynamicSettings._itemSizes[2].height = "200px";
        //me._gridifierDynamicSettings._itemSizes[2].height = "335px";

        me._gridifierDynamicSettings._itemSizes[3].width = "200";
        me._gridifierDynamicSettings._itemSizes[3].height = "200px";

        me._gridifierDynamicSettings._itemSizes[4].width = "400";
        me._gridifierDynamicSettings._itemSizes[4].height = "400px"; // @todo -> Delete, tmp
        */


        // for(var i = 0; i < 5; i++) {
        //     me._gridifierDynamicSettings._itemSizes[i].width = "20%";
        //     me._gridifierDynamicSettings._itemSizes[i].height = "100px";
        // }




        // @todo -> This is an example with margins params.(Margin size = 30px)
        // me._gridifierDynamicSettings._itemSizes[0].width = "260px";
        // me._gridifierDynamicSettings._itemSizes[0].height = "130px";

        // me._gridifierDynamicSettings._itemSizes[1].width = "130px";
        // me._gridifierDynamicSettings._itemSizes[1].height = "260px";

        // me._gridifierDynamicSettings._itemSizes[2].width = "260px";
        // me._gridifierDynamicSettings._itemSizes[2].height = "130px";

        // me._gridifierDynamicSettings._itemSizes[3].width = "130px";
        // me._gridifierDynamicSettings._itemSizes[3].height = "260px";

        // me._gridifierDynamicSettings._itemSizes[4].width = "130px";
        // me._gridifierDynamicSettings._itemSizes[4].height = "260px"; // @todo -> Delete, tmp



        // "margin-left": "3%",
        // "margin-right": "3%",
        // "margin-top": "10px",
        // "margin-bottom": "10px",
        // me._gridifierDynamicSettings._batchSize = 5;
        // me._gridifierDynamicSettings._itemSizes[0].width = "10%";
        // me._gridifierDynamicSettings._itemSizes[0].height = "90px";

        // me._gridifierDynamicSettings._itemSizes[1].width = "20%";
        // me._gridifierDynamicSettings._itemSizes[1].height = "200px";

        // me._gridifierDynamicSettings._itemSizes[2].width = "20%";
        // me._gridifierDynamicSettings._itemSizes[2].height = "200px";

        // me._gridifierDynamicSettings._itemSizes[3].width = "20%";
        // me._gridifierDynamicSettings._itemSizes[3].height = "200px";

        // me._gridifierDynamicSettings._itemSizes[4].width = "10%";
        // me._gridifierDynamicSettings._itemSizes[4].height = "90px"; // @todo -> Delete, tmp










        // me._gridifierDynamicSettings._itemSizes[0].width = "250px";
        // me._gridifierDynamicSettings._itemSizes[0].height = "250px";

        // me._gridifierDynamicSettings._itemSizes[1].width = "250px";
        // me._gridifierDynamicSettings._itemSizes[1].height = "250px";

        // me._gridifierDynamicSettings._itemSizes[2].width = "250px";
        // me._gridifierDynamicSettings._itemSizes[2].height = "250px";

        // me._gridifierDynamicSettings._itemSizes[3].width = "250px";
        // me._gridifierDynamicSettings._itemSizes[3].height = "250px";

        // me._gridifierDynamicSettings._itemSizes[4].width = "250px";
        // me._gridifierDynamicSettings._itemSizes[4].height = "250px"; // @todo -> Delete, tmp

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
        me._gridDebugger = new DemoLayoutBuilder.DemoLayout.GridDebugger(me, me._grid.getGrid().get(0));
        Logger.setGrid(me._grid.getGrid().get(0));
        
        me._gridifierSettings.toggleAnimationMsDuration = 500;
        me._gridifierSettings.coordsChangeAnimationMsDuration = 300;
        //me._gridifierSettings.toggleTransitionTiming = "cubic-bezier(0.550, 0.055, 0.675, 0.190)";
        //me._gridifierSettings.coordsChangeTransitionTiming = "cubic-bezier(0.550, 0.055, 0.675, 0.190)";
        //me._gridifierSettings.toggleAnimationMsDuration = 2500;
       // me._gridifierSettings.coordsChangeAnimationMsDuration = 2500;
        //me._gridifier = new Gridifier(me._grid.getGrid().get(0), me._gridifierSettings);
         me._gridifier = new DemoLayoutBuilder.GridifierBuilder(me._grid.getGrid(), me._gridifierSettings);
        //
        //me._gridifier.setItemClonesManagerLifecycleCallbacks();
        //me._gridifier.setCoordsChanger("CSS3Translate3DClones");

        //me._gridifier.onDragEnd(function(items) {
        //    for(var i = 0; i < items.length; i++) {
        //        console.log(items[i].getAttribute(DemoLayoutBuilder.DemoLayout.GRID_ITEM_INSERT_NUMBER_DATA_ATTR));
        //    }
        //    console.log("");
        //});

       //me._gridifier.setCoordsChanger("CSS3Translate");
       // me._gridifier.setSizesChanger("defaultPaddingBottom");
        window.gridifier = me._gridifier; // @todo -> Delete, tmp solution
        setTimeout(function() {
           //me._gridifier.toggleBy("scaleWithFade");
            //me._gridifier.toggleBy("scaleWithFade");
            //me._gridifier.toggleBy("fade");
            //me._gridifier.toggleBy("rotateXWithFade");
           //me._gridifier.toggleBy("rotateX");
            //me._gridifier.setCoordsChanger("CSS3Translate3DClones");
            //me._gridifier.toggleBy("slideClockwiseFromCornersWithFade");
            //me._gridifier.toggleBy("scale");
        }, 500);
        //me._gridifier.setCoordsChanger("CSS3Position");
        //me._gridifier.setItemWidthPercentageAntialias(0.1);
        //me._gridifier.setItemHeightPercentageAntialias(0.1);
        // me._gridifier._settings.setRendererCoordsChanger('default');
        // me._gridifier._settings.setRendererSizesChanger('default');
        //me._gridifier.setCoordsChanger("CSS3Translate");
        //me._gridifier.setCoordsChanger("CSS3Position");

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
        // gridifier.onDragEnd(function(items) {
        //     console.log(items);
        // });

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
        me._gridifier.onGridResize(function() {
            $(me).trigger(DemoLayoutBuilder.DemoLayout.EVENT_DEMO_LAYOUT_SIZES_CHANGE);
        });

        $(me._grid).on(DemoLayoutBuilder.DemoLayout.HorizontalGrid.EVENT_GRID_VERTICAL_RESIZE, function() {
            me._gridifier.reposition();
            $(me).trigger(DemoLayoutBuilder.DemoLayout.EVENT_DEMO_LAYOUT_SIZES_CHANGE);
        });

        $(me._grid).on(DemoLayoutBuilder.DemoLayout.VerticalGrid.EVENT_GRID_SIZES_CHANGE, function() {
            me._gridifier.reposition();
            $(me).trigger(DemoLayoutBuilder.DemoLayout.EVENT_DEMO_LAYOUT_SIZES_CHANGE);
        });

        // me._gridifier.onCssChange(function(item, addedClasses, removedClasses) {
        //    console.log(item);
        //    console.log(addedClasses);
        //    console.log(removedClasses);
        // });
        
        // @todo -> Replace this.(Tmp for testing)
        me._$view.on("click", ".gridItem", function() { ///console.log("toggle");
            //gridifier.disconnect($(this));
            //console.log($(this).get(0));
            //console.log($(this).attr("data-gridifier-guid"));
            //gridifier.toggleCss($(this), ["bigGridItem", "blackGridItem"]);
            return;
            me._gridifier.toggleResponsiveClasses([$(this), $(this).next(".gridifier-connected-item")], ["wideItem", "wideBlackItem"]);
            return;
            //me._gridifier.disconnect($(this)); return;
            //me._gridifier.transformSizes($(this), "*2", "*2");
           //me._gridifier.toggleSizesWithPaddingBottom($(this), "*2", "*2");
            me._gridifier.toggleSizes($(this), "*2", "*2");
           //me._gridifier.toggleResponsiveClasses($(this), "largeTest");
            return;
            if($(this).hasClass("transformedItem")) {
                $(this).removeClass("transformedItem");
                //me._gridifier.transformSizesWithPaddingBottom($(this), "/2", "/2");
               me._gridifier.transformSizes($(this), "/2", "/2");
            }
            else {
                $(this).addClass("transformedItem");
                //me._gridifier.transformSizesWithPaddingBottom($(this), "*2", "*2");
                me._gridifier.transformSizes($(this), "*2", "*2");
            }
        });

        // @todo -> Replace this.(tmp for testing)
        me._$gridTopControlsView.find(".gridControlsHeadingMenu").on("click", function() {
            var $gridItems = $("#demoLayout .gridView").find(".gridItem"); // @todo -> find only layouted items
            if($gridItems.length < 2)
                return;

            $firstGridItem = $gridItems.get(0);
            $secondGridItem = $gridItems.get(1);

            me._gridifier.toggleSizes([
                [$secondGridItem, "*2", "*2"],
                [$firstGridItem, "*2", "*2"]
            ]);
            //me._gridifier.toggleSizes($secondGridItem, "400px", "400px");
            //me._gridifier.toggleSizes($firstGridItem, "200px", "200px");
            //me._gridifier.setSizesChanger('defaultPaddingBottom');
            //me._gridifier.toggleSizesWithPaddingBottom($secondGridItem, "*2.5", "*2.5");
            //me._gridifier.toggleSizesWithPaddingBottom($firstGridItem, "*2.5", "*2.5");
            //setTimeout(function() {

            //}, 100);
        });

        $(me._gridifierDynamicSettings).on(DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.EVENT_FILTER_SELECTED, function(event, filterName) {
            setTimeout(function() {
                me._gridifier.filter(filterName);
            }, 250);
        });

        var i = 0;
        me._gridifier.onShow(function(item) {
            var itemGUID = item.getAttribute("data-gridifier-guid");
            //item.innerHTML = itemGUID;
            i++;
            //item.innerHTML = i;
            var $div = $("<div/>").css({
                position: "absolute",
                left: "0px",
                top: "0px",
                color: "red",
                fontSize: "20px"
            }).addClass("dragHandle");
            $(item).append($div);
            $div.get(0).innerHTML = itemGUID;
        });

        //me._gridifier.setSort("byColor");
        //me._gridifier.onInsert(function() {
            //me._gridifier.resort();
        //     console.log("insert");
        // });
        // me._gridifier.onDisconnect(function(item) {
        //     console.log(item);
        // });
        // me._gridifier.onGridResize(function() {
        //     console.log("res");
        // });

        // gridifier.onReposition(function() {
        //     gridifier.silentRender(gridifier.getForSilentRender(true));
        // });

        // $(window).on("scroll", function() {
        //     gridifier.silentRender(gridifier.getForSilentRender(true));
        // });

        me._gridifier.onDisconnect(function(item) {
            //console.log("item disconnected = ", item);
        });

        me._gridifier.onHide(function(item) {
            //console.log("item hidden = ", item);
            // var itemGUID = item.getAttribute(Gridifier.GUID.GUID_DATA_ATTR);
            // console.log("item = ", item);
            // console.log("Item with GUID = " + itemGUID + " was hiden!");
        });

        //me._gridifier.onTransform(function(item, newWidth, newHeight, newLeft, newTop) {
            // console.log("Item transformed ! newwidth = " + newWidth + " newheight = " + newHeight);
            // console.log(" newleft = " + newLeft + ", newTop = " + newTop);
            // console.log('item = ', item);
        //});

        me._gridifier.onRepositionEnd(function() {
            //console.log("grid retransform event!");
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
DemoLayoutBuilder.DemoLayout.GRID_ITEM_INSERT_NUMBER_DATA_ATTR = "grid-item-insert-number";

DemoLayoutBuilder.DemoLayout.prototype.getView = function() {
    return this._$view;
}

DemoLayoutBuilder.DemoLayout.prototype._appendNextItems = function() {
    var itemSizes = this._gridifierDynamicSettings.getAllItemSizes();
    var itemsToAppend = [];
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
        $gridItem[0].setAttribute(DemoLayoutBuilder.DemoLayout.GRID_ITEM_INSERT_NUMBER_DATA_ATTR, ++this._nextGridItemNumber);
        //this._gridifier.append($gridItem);
        itemsToAppend.push($gridItem);

        // @todo -> Replace with real event
        // @todo -> Check if batch processing of appended items is required
        // (function($gridItem, gridItem) {
        //     $gridItem.on("gridifier.appendFinished", function() {
        //            gridItem.renderGUID();
        //     });
        // })($gridItem, gridItem);
    }

    this._gridifier.append(itemsToAppend);
    //this._gridifier.prepend(itemsToAppend, 2, 100);
    //this._gridifier.append(itemsToAppend, 1, 100);
    //this._gridifier.silentAppend(itemsToAppend);
    // @todo -> append and prepend by one or by batch????
}

DemoLayoutBuilder.DemoLayout.prototype._prependNextItems = function() {
    var itemSizes = this._gridifierDynamicSettings.getAllItemSizes();
    var itemsToPrepend = [];
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
        $gridItem[0].setAttribute(DemoLayoutBuilder.DemoLayout.GRID_ITEM_INSERT_NUMBER_DATA_ATTR, --this._prevGridItemNumber);
        //this._gridifier.prepend($gridItem);
        itemsToPrepend.push($gridItem);
    }

    this._gridifier.prepend(itemsToPrepend);
    //this._gridifier.insertBefore(itemsToPrepend, $("[data-gridifier-item-id=10001]").get(0));
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
    return this._getGridifierSetting("prependType") == "default";
}

DemoLayoutBuilder.DemoLayout.prototype.isReversedPrependGrid = function() {
    return this._getGridifierSetting("prependType") == "reversed";
}

DemoLayoutBuilder.DemoLayout.prototype.isMirroredPrependGrid = function() {
    return this._getGridifierSetting("prependType") == "mirrored";
}

DemoLayoutBuilder.DemoLayout.prototype.isDefaultAppendGrid = function() {
    return this._getGridifierSetting("appendType") == "default";
}

DemoLayoutBuilder.DemoLayout.prototype.isReversedAppendGrid = function() {
    return this._getGridifierSetting("appendType") == "reversed";
}