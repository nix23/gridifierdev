DemoLayoutBuilder.DemoLayout.GridItem = function($targetEl,
                                                 gridifier,
                                                 itemSizes,
                                                 itemBorder,
                                                 itemMargin,
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
            itemBorder,
            itemMargin,
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
                                                                           itemBorder,
                                                                           itemMargin,
                                                                           isBorderBoxBoxSizing,
                                                                           isContentBoxBoxSizing,
                                                                           itemBgClass) {
    this._gridifier.markAsGridItem(this._$gridItem);
    this._$gridItem.css({
        //width: itemSizes.width,
        //height: itemSizes.height,
        width: "5%",
        height: "100px",
        border: itemBorder + "px rgb(60,60,60) solid",
        margin: itemMargin + "px",
        "box-sizing": (isBorderBoxBoxSizing) ? "border-box" : "content-box",

        // "-webkit-box-shadow": "2px 2px 2px rgb(60,60,60)",
        // "box-shadow": "2px 2px 2px rgb(60,60,60)",
        // "-moz-box-shadow": "2px 2px 2px rgb(60,60,60)",
        "position": "relative",

        "color": "white",
        "font-size": "14px",
        "font-weight": "bold"
    });
    
    this._$gridItem.addClass(itemBgClass);

    var $gridItemBg = $("<div/>");
    $gridItemBg.css({
        position: "absolute",
        //width: "80%",
        //height: "80%",
        //"margin-left": "10%",
        //"margin-top": "10%",
        width: "100%",
        height: "100%",
        // @todo -> Make Crossbrowser
        background: "url(img/gridItemBg9.png)",
        //background: "url(img/test2.png)",
        "background-size": "cover",
        "background-repeat": "no-repeat",
        "background-position": "center center"
    });
    //this._$gridItem.append($gridItemBg);
}

DemoLayoutBuilder.DemoLayout.GridItem.prototype.renderGUID = function() {
    var itemGUID = this._$gridItem.attr(Gridifier.GUID.GUID_DATA_ATTR);
    this._$gridItem.append(itemGUID);
}