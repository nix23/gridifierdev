DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings = function() {
    var me = this;

    this._$view = null;

    this._itemSizes = [];

    this._marginWidth = null;
    this._marginHeight = null;
    this._paddingWidth = null;
    this._paddingHeight = null;
    this._borderWidth = null;
    this._borderHeight = null;
    this._boxSizing = null;

    this._toggleFunction = null;
    this._filterFunction = null;
    this._sortFunction = null;
    this._batchSize = 0;

    this._gridItemBgClasses = ["gridFirstBg", "gridSecondBg", "gridThirdBg",
                                                "gridFourthBg", "gridFifthBg"];
    this._nextPrependedItemBgClassIndex = 0;
    this._nextAppendedItemBgClassIndex = -1;

    this._css = {
    };

    this._construct = function() {
        me.setAllItemSizes("100px", "100px");

        me.setMarginWidth("0px");
        me.setMarginHeight("0px");
        me.setPaddingWidth("0px");
        me.setPaddingHeight("0px");
        me.setBorderWidth("3px");
        me.setBorderHeight("3px");
        me.setBorderBoxBoxSizing();

        if(!browserDetector.isIe8())
            me.setScaleToggleFunction();
        else
            me.setVisibilityToggleFunction();

        me.setAllFilterFunction();
        me.setByGUIDSortFunction();
        me.setBatchSize(1);
        //me._debug();
        me._bindEvents();
    }

    this._bindEvents = function() {
    }

    this._unbindEvents = function() {
    }

    this.destruct = function() {
        me._unbindEvents();
    }

    this._debug = function() {
        console.log("");

        console.log("***********************************************************************");
        console.log("*********** GridifierDynamicSettings DEBUG ****************");
        console.log("***********************************************************************");

        console.log("");
        console.log("Item sizes:");
        for(var i = 0; i <= 49; i++) {
            console.log("Item " + (i + 1) + ": width = " + this._itemSizes[i].width + " height: " + this._itemSizes[i].height);
        }

        console.log("");
        console.log("Border: " + me.getBorderWidth() + "; " + me.getBorderHeight() + "; \n");
        console.log("Margin: " + me.getMarginWidth() + "; " + me.getMarginHeight() + "; \n");
        console.log("Padding: " + me.getPaddingWidth() + "; " + me.getPaddingHeight() + "; \n");
        var borderBoxValue = (me.isBorderBoxBoxSizing()) ? "border-box" : "content-box";
        console.log("Box-sizing: " + borderBoxValue);

        if(me.isScaleToggleFunction())
            var toggleValue = "scale";
        else if(me.isFadeToggleFunction())
            var toggleValue = "fade";
        else if(me.isVisibilityToggleFunction())
            var toggleValue = "visibility";
        else if(me.isRotateXToggleFunction())
            var toggleValue = "rotateX";
        else if(me.isRotateYToggleFunction())
            var toggleValue = "rotateY";

        if(me.isAllFilterFunction())
            var filterValue = "all";
        else if(me.isBlueFilterFunction())
            var filterValue = "blue";
        else if(me.isVioletFilterFunction())
            var filterValue = "violet";
        else if(me.isRedFilterFunction())
            var filterValue = "red";
        else if(me.isYellowFilterFunction())
            var filterValue = "yellow";
        else if(me.isGreenFilterFunction())
            var filterValue = "green";

        if(me.isByGUIDSortFunction())
            var sortValue = "by GUID";
        else if(me.isByItemColorSortFunction())
            var sortValue = "by item color";

        console.log("Toggle: " + toggleValue + " \nFilter: " + filterValue + " \nSort: " + sortValue);
        console.log("Batch size: " + me.getBatchSize());

        console.log("");
        console.log("***********************************************************************");
        console.log("*********** GridifierDynamicSettings DEBUG  END **********");
        console.log("***********************************************************************");
    }

    this._construct();
    return this;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.BOX_SIZINGS = {
    BORDER_BOX: 0, CONTEXT_BOX: 1
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.TOGGLE_FUNCTIONS = {
    SCALE: 0, FADE: 1, VISIBILITY: 2, ROTATE_X: 3, ROTATE_Y: 4
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.FILTER_FUNCTIONS = {
    ALL: 0, BLUE: 1, VIOLET: 2, RED: 3, YELLOW: 4, GREEN: 5
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.SORT_FUNCTIONS = {
    BY_GUID: 0, BY_ITEM_COLOR: 1
}

/* Item sizes */
DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.getAllItemSizes = function() {
    return this._itemSizes;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.setAllItemSizes = function(width, height) {
    this._itemSizes = [];

    for(var i = 1; i <= 50; i++) {
        var sizes = {};
        sizes.width = width;
        sizes.height = height;

        this._itemSizes[i - 1] = sizes;
    }
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.setItemSizes = function(itemSizesIndex, width, height) {
    for(var i = 0; i <= 49; i++) {
        if(i == itemSizesIndex) {
            this._itemSizes[i].width = width;
            this._itemSizes[i].height = height;
            break;
        }
    }
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.setItemWidth = function(itemSizesIndex, width) {
    for(var i = 0; i <= 49; i++) {
        if(i == itemSizesIndex) {
            this._itemSizes[i].width = width;
            break;
        }
    }
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.setItemHeight = function(itemSizesIndex, height) {
    for(var i = 0; i <= 49; i++) {
        if(i == itemSizesIndex) {
            this._itemSizes[i].height = height;
            break;
        }
    }
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.getItemSizes = function(itemSizesIndex) {
    for(var i =0 ; i <= 49; i++) {
        if(i == itemSizesIndex)
            return this._itemSizes[i];
    }
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.getItemWidth = function(itemSizesIndex) {
    var itemSizes = this.getItemSizes(itemSizesIndex);
    return itemSizes.width;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.getItemHeight = function(itemSizesIndex) {
    var itemSizes = this.getItemSizes(itemSizesIndex);
    return itemSizes.height;
}

/* Item border */
DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.setMarginWidth = function(marginWidth) {
    this._marginWidth = marginWidth;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.getMarginWidth = function() {
    return this._marginWidth;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.setMarginHeight = function(marginHeight) {
    this._marginHeight = marginHeight;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.getMarginHeight = function() {
    return this._marginHeight;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.setPaddingWidth = function(paddingWidth) {
    this._paddingWidth = paddingWidth;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.getPaddingWidth = function() {
    return this._paddingWidth;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.setPaddingHeight = function(paddingHeight) {
    this._paddingHeight = paddingHeight;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.getPaddingHeight = function() {
    return this._paddingHeight;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.setBorderWidth = function(borderWidth) {
    this._borderWidth = borderWidth;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.getBorderWidth = function() {
    return this._borderWidth;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.setBorderHeight = function(borderHeight) {
    this._borderHeight = borderHeight;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.getBorderHeight = function() {
    return this._borderHeight;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.setBorderBoxBoxSizing = function() {
    this._boxSizing = DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.BOX_SIZINGS.BORDER_BOX;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.setContentBoxBoxSizing = function() {
    this._boxSizing = DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.BOX_SIZINGS.CONTENT_BOX;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.isBorderBoxBoxSizing = function() {
    return this._boxSizing == DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.BOX_SIZINGS.BORDER_BOX;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.isContentBoxBoxSizing = function() {
    return this._boxSizing == DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.BOX_SIZINGS.CONTENT_BOX;
}

/* Toggle functions */
DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.setRotateXToggleFunction = function() {
    this._toggleFunciton = DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.TOGGLE_FUNCTIONS.ROTATE_X;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.setRotateYToggleFunction = function() {
    this._toggleFunction = DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.TOGGLE_FUNCTIONS.ROTATE_Y;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.setScaleToggleFunction = function() {
    this._toggleFunction = DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.TOGGLE_FUNCTIONS.SCALE;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.setFadeToggleFunction = function() {
    this._toggleFunction = DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.TOGGLE_FUNCTIONS.FADE;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.setVisibilityToggleFunction = function() {
    this._toggleFunction = DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.TOGGLE_FUNCTIONS.VISIBILITY;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.isRotateXToggleFunction = function() {
    return this._toggleFunction == DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.TOGGLE_FUNCTIONS.ROTATE_X;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.isRotateYToggleFunction = function() {
    return this._toggleFunction == DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.TOGGLE_FUNCTIONS.ROTATE_Y;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.isScaleToggleFunction = function() {
    return this._toggleFunction == DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.TOGGLE_FUNCTIONS.SCALE;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.isFadeToggleFunction = function() {
    return this._toggleFunction == DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.TOGGLE_FUNCTIONS.FADE;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.isVisibilityToggleFunction = function() {
    return this._toggleFunction == DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.TOGGLE_FUNCTIONS.VISIBILITY;
}

/* Filter functions */
DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.setAllFilterFunction = function() {
    this._filterFunction = DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.FILTER_FUNCTIONS.ALL;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.setBlueFilterFunction = function() {
    this._filterFunction = DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.FILTER_FUNCTIONS.BLUE;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.setVioletFilterFunction = function() {
    this._filterFunction = DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.FILTER_FUNCTIONS.VIOLET;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.setRedFilterFunction = function() {
    this._filterFunction = DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.FILTER_FUNCTIONS.RED;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.setYellowFilterFunction = function() {
    this._filterFunction = DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.FILTER_FUNCTIONS.YELLOW;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.setGreenFilterFunction = function() {
    this._filterFunction = DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.FILTER_FUNCTIONS.GREEN;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.isAllFilterFunction = function() {
    return this._filterFunction == DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.FILTER_FUNCTIONS.ALL;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.isBlueFilterFunction = function() {
    return this._filterFunction == DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.FILTER_FUNCTIONS.BLUE;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.isVioletFilterFunction = function() {
    return this._filterFunction == DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.FILTER_FUNCTIONS.VIOLET;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.isRedFilterFunction = function() {
    return this._filterFunction == DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.FILTER_FUNCTIONS.RED;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.isYellowFilterFunction = function() {
    return this._filterFunction == DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.FILTER_FUNCTIONS.YELLOW;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.isGreenFilterFunction = function() {
    return this._filterFunction == DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.FILTER_FUNCTIONS.GREEN;
}

/* Sort functions */
DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.setByGUIDSortFunction = function() {
    this._sortFunction = DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.SORT_FUNCTIONS.BY_GUID;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.setByItemColorSortFunction = function() {
    this._sortFunction = DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.SORT_FUNCTIONS.BY_ITEM_COLOR;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.isByGUIDSortFunction = function() {
    return this._sortFunction == DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.SORT_FUNCTIONS.BY_GUID;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.isByItemColorSortFunction = function() {
    return this._sortFunction == DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.SORT_FUNCTIONS.BY_ITEM_COLOR;
}

/* Batch size function */
DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.setBatchSize = function(batchSize) {
    this._batchSize = batchSize;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.getBatchSize = function() {
    return this._batchSize;
}

/* Item bg colors */
DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.getNextAppendedItemBgClass = function() {
    this._nextAppendedItemBgClassIndex++;
    if(this._nextAppendedItemBgClassIndex >= this._gridItemBgClasses.length)
        this._nextAppendedItemBgClassIndex = 0;

    return this._gridItemBgClasses[this._nextAppendedItemBgClassIndex];
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.getNextPrependedItemBgClass = function() {
    this._nextPrependedItemBgClassIndex--;
    if(this._nextPrependedItemBgClassIndex < 0)
        this._nextPrependedItemBgClassIndex = this._gridItemBgClasses.length - 1;

    return this._gridItemBgClasses[this._nextPrependedItemBgClassIndex];
}