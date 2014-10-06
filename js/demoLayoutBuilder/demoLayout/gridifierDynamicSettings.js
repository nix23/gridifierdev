DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings = function() {
    var me = this;

    this._$view = null;

    this._itemSizes = [];

    this._itemBorder = 0;
    this._itemMargin = 0;
    this._boxSizing = null;

    this._toggleFunction = null;
    this._filterFunction = null;
    this._sortFunction = null;
    this._batchSize = 0;

    this._css = {
    };

    this._construct = function() {
        me.setAllItemSizes("100px", "100px");

        me.setItemBorder(3);
        me.setItemMargin(0);
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
        console.log("Border: " + me.getItemBorder() + "px; \nMargin: " + me.getItemMargin() + "px;");
        var borderBoxValue = (me.isBorderBoxBoxSizing()) ? "border-box" : "content-box";
        console.log("Box-sizing: " + borderBoxValue);

        if(me.isScaleToggleFunction())
            var toggleValue = "scale";
        else if(me.isFadeToggleFunction())
            var toggleValue = "fade";
        else if(me.isVisibilityToggleFunction())
            var toggleValue = "visibility";

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
    SCALE: 0, FADE: 1, VISIBILITY: 2
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.FILTER_FUNCTIONS = {
    ALL: 0, BLUE: 1, VIOLET: 2, RED: 3, YELLOW: 4, GREEN: 5
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.SORT_FUNCTIONS = {
    BY_GUID: 0, BY_ITEM_COLOR: 1
}

/* Item sizes */
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
DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.setItemBorder = function(itemBorder) {
    this._itemBorder = itemBorder;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.getItemBorder = function() {
    return this._itemBorder;
}

/* Item margin */
DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.setItemMargin = function(itemMargin) {
    this._itemMargin = itemMargin;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.getItemMargin = function() {
    return this._itemMargin;
}

/* Box sizing */
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
DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.setScaleToggleFunction = function() {
    this._toggleFunction = DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.TOGGLE_FUNCTIONS.SCALE;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.setFadeToggleFunction = function() {
    this._toggleFunction = DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.TOGGLE_FUNCTIONS.FADE;
}

DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.prototype.setVisibilityToggleFunction = function() {
    this._toggleFunction = DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings.TOGGLE_FUNCTIONS.VISIBILITY;
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