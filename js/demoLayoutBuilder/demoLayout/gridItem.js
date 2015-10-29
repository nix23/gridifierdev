DemoLayoutBuilder.DemoLayout.GridItem = function($targetEl,
                                                 gridifier,
                                                 itemSizes,
                                                 marginWidth,
                                                 marginHeight,
                                                 paddingWidth,
                                                 paddingHeight,
                                                 borderWidth,
                                                 borderHeight,
                                                 isBorderBoxBoxSizing,
                                                 isContentBoxBoxSizing,
                                                 itemBgClass) {
    var me = this;

    this._$view = View.attach(this._$view, $targetEl, View.ids.DEMO_LAYOUT_BUILDER.DEMO_LAYOUT.GRID_ITEM);

    this._gridifier = null;
    this._$gridItem = null;

    this._css = {
        gridItemClass: "gridItem"
    };

    this._construct = function() {
        me._gridifier = gridifier;

        me._$gridItem = me._$view;
        me._adjustGridItem(
            itemSizes,
            marginWidth,
            marginHeight,
            paddingWidth,
            paddingHeight,
            borderWidth,
            borderHeight,
            isBorderBoxBoxSizing,
            isContentBoxBoxSizing,
            itemBgClass
        );
    };

    this._bindEvents = function() {
    };

    this._unbindEvents = function() {
    };

    this.destruct = function() {
        me._unbindEvents();
    };

    this._construct();
    return this;
}

DemoLayoutBuilder.DemoLayout.GridItem.prototype.getView = function() {
    return this._$view;
}

// @todo -> Set grid item params(BS/Mar/Pad/Border,etc...)
DemoLayoutBuilder.DemoLayout.GridItem.prototype._adjustGridItem = function(itemSizes,
                                                                           marginWidth,
                                                                           marginHeight,
                                                                           paddingWidth,
                                                                           paddingHeight,
                                                                           borderWidth,
                                                                           borderHeight,
                                                                           isBorderBoxBoxSizing,
                                                                           isContentBoxBoxSizing,
                                                                           itemBgClass) {
    grid.mark(this._$gridItem);
    
    if(typeof window.borderType == "undefined")
        window.borderType = 1;
    else
        window.borderType++;

    if(window.borderType == 5)
        window.borderType = 1;

    if(window.borderType == 1)
        var borderColor = "black";
    else if(window.borderType == 2)
        var borderColor = "brown";
    else if(window.borderType == 3)
        var borderColor = "red";
    else if(window.borderType == 4)
        var borderColor = "blue";

    var res = Math.floor(Math.random()*(2-1+1)+1);
    if(res == 1)
        var pb = "15%";
    else
        var pb = "7.5%";

    if(typeof window.isFirstItem == "undefined") {
        var isFirst = true;
        window.isFirstItem = true;
    }
    else
        var isFirst = false;

    if(typeof window.num == "undefined")
       window.num = 0;
    window.num++;
    if(window.num % 3 == 0)
        var itemHeight = "20%";
    else
        var itemHeight = "10%";

    this._$gridItem.css({
        //width: (isFirst) ? "25%" : "12.5%",
        //height: 0,
       // "padding-bottom": (isFirst) ? "-webkit-calc(25% + 6px)" : "12.5%",
       //width: "12.5%",
       //height: 0,
       //"padding-bottom": "12.5%",
       width: itemSizes.width,
        //width: "10%",
        //width: "25%",
        //"margin-left": "2.5%",
        //"margin-right": "2.5%",
        //"margin-top": "20px",
        //width: "200px",
       //height: "100px",
       //height: "33.33%",
       // height: 0,
       // "padding-bottom": "5%",
        //margin: "5px",
        height: itemSizes.height,
        //height: "200px",

        //"padding-bottom": parseFloat(itemSizes.height) + "%",
        //margin: "2em",
        //height: 0,
       // paddingBottom: pb,
       // marginBottom: "10px",
        //height: "30%",

        // width: "33.43%",
        // height: "60px",



        // width: "60px",
        //  height: "0px",
        // "padding-bottom": "10%",

        // width: "100px",
        // height: "100px",


        // width: "100px",
        // height: "100px",

        // width: "20%",
        // height: "100px",
        //"padding-bottom": "25%",

        //"margin-top": "10px",
        // "margin-left": "30px",
        // "margin-right": "30px",
        // "margin-top": "30px",
        // "margin-bottom": "30px",
        // width: "25%",
        // height: "200px",
        //border: itemBorder + "px rgb(60,60,60) solid",
       // border: "1px " + borderColor + " solid",
        //border: "3px black solid",
        //margin: itemMargin + "px",
        // "margin-left": "1.66%",
        // "margin-right": "1.66%",
        // "padding-left": "1.66%",
        // "padding-right": "1.66%",
        //"margin": "20px",
        //"box-sizing": (isBorderBoxBoxSizing) ? "border-box" : "content-box",
        "box-sizing": "border-box",
        //"border": "3px rgb(60,60,60) solid",
        "border": "5px red solid",
        //margin: "10px",

        // "-webkit-box-shadow": "2px 2px 2px rgb(60,60,60)",
        // "box-shadow": "2px 2px 2px rgb(60,60,60)",
        // "-moz-box-shadow": "2px 2px 2px rgb(60,60,60)",
        "position": "relative",

        "color": "white",
        "font-size": "14px",
        "font-weight": "bold",
        //"margin": "15px",
        "visibility": "hidden"
        //"margin": "2%"

       //background: "url(img/test2.png)",
       // "background-size": "cover",
       // "background-repeat": "no-repeat",
       // "background-position": "center center"
    });
    this._$gridItem.addClass(itemBgClass);
    var res = Math.floor(Math.random()*(2-1+1)+1);
    //if(res == 1)
    //    var itemBgClass = "gridFirstBg";
    //else
    //    var itemBgClass = "gridSecondBg";
    //this._$gridItem.addClass(itemBgClass);

    var res = Math.floor(Math.random()*(2-1+1)+1);
    if(res == 1) 
        var bgs = "url(img/Cars1.jpg)";
    else
        var bgs = "url(img/Cars2.jpg)";

    var $gridItemBg = $("<div/>");
    var $gridItemImg = $("<img/>").css("max-width", "100%");
    // $gridItemImg.attr("src", "http://deelay.me/1000?http://g3.delphi.lv/images/pix/355x215/9mCnxFYV_ho/litex-jelgava-46198655.jpg");
    // $gridItemImg.css({"max-width": "100%"});

    if(typeof window.num == "undefined")
        window.num = 1;
    else
        window.num++;

    //if(window.num < 21)
    //    $gridItemImg.attr("src", "img/hotel/" + window.num + ".jpeg");
    //else
    //    $gridItemImg.attr("src", "img/hotel/" + window.num + ".jpg");
    //
    //this._$gridItem.append($gridItemImg);

    $gridItemBg.css({
        position: "absolute",
        //width: "80%",
        //height: "80%",
        //"margin-left": "10%",
        //"margin-top": "10%",
        width: "20.0%",
        //height: "100%",
        // @todo -> Make Crossbrowser
        //background: "url(img/gridItemBg9.png)",
        background: "url(img/test2.png)",
        //background: bgs,
        //background: "black",
        "background-size": "cover",
        "background-repeat": "no-repeat",
        "background-position": "center center"
    });
    //this._$gridItem.append($gridItemBg);
    //this._$gridItem.append($gridItemImg);
}

DemoLayoutBuilder.DemoLayout.GridItem.prototype.renderGUID = function() {
    var itemGUID = this._$gridItem.attr(Gridifier.GUID.GUID_DATA_ATTR);
    //this._$gridItem.append(itemGUID);
}