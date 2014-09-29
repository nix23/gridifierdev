DemoLayoutBuilder.DemoLayout.GridifierDynamicSettings = function() {
    var me = this;

    this._$view = null;

    this._toggleFunction = null;
    this._filterFunction = null;
    this._sortFunction = null;
    this._batchSize = 0;

    this._css = {
    };

    this._construct = function() {
        if(!browserDetector.isIe8())
            me.setScaleToggleFunction();
        else
            me.setVisibilityToggleFunction();

        me.setAllFilterFunction();
        me.setByGUIDSortFunction();
        me.setBatchSize(1);

        me._bindEvents();
    }

    this._bindEvents = function() {
    }

    this._unbindEvents = function() {
    }

    this.destruct = function() {
        me._unbindEvents();
    }

    this._construct();
    return this;
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