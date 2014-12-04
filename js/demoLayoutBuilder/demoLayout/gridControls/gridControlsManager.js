DemoLayoutBuilder.DemoLayout.GridControlsManager = function(gridifier) {
    var me = this;

    this._gridifier = null;

    this._$view = null;

    this._gridControls = [];

    this._css = {
    };

    this._construct = function() {
        me._gridifier = gridifier;
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

DemoLayoutBuilder.DemoLayout.GridControlsManager.prototype.addGridControls = function(gridControls) {
    this._gridControls.push(gridControls);
}

DemoLayoutBuilder.DemoLayout.GridControlsManager.prototype.setAllItemSizes = function(newWidthLabel, newHeightLabel) {
    for(var i = 0; i < this._gridControls.length; i++) {
        for(var itemSizesIndex = 1; itemSizesIndex <= 50; itemSizesIndex++) {
            this._gridControls[i].setItemSizesLabel(itemSizesIndex, newWidthLabel, newHeightLabel);
        }
    }
}

DemoLayoutBuilder.DemoLayout.GridControlsManager.prototype.setItemSizes = function(itemSizesIndexToSet, newWidthLabel, newHeightLabel) {
    for(var i = 0; i < this._gridControls.length; i++) {
        for(var itemSizesIndex = 1; itemSizesIndex <= 50; itemSizesIndex++) {
            if(itemSizesIndexToSet == itemSizesIndex)
            {
                this._gridControls[i].setItemSizesLabel(itemSizesIndex, newWidthLabel, newHeightLabel);
                break;
            }
        }
    }
}

DemoLayoutBuilder.DemoLayout.GridControlsManager.prototype.setItemWidth = function(itemSizesIndex, newWidthLabel) {
    for(var i = 0; i < this._gridControls.length; i++) {
        this._gridControls[i].setItemWidthLabel(itemSizesIndex, newWidthLabel);
    }
}

DemoLayoutBuilder.DemoLayout.GridControlsManager.prototype.setItemHeight = function(itemSizesIndex, newHeightLabel) {
    for(var i = 0; i< this._gridControls.length; i++) {
        this._gridControls[i].setItemHeightLabel(itemSizesIndex, newHeightLabel);
    }
}

DemoLayoutBuilder.DemoLayout.GridControlsManager.prototype._setItemCssControlValue = function(controlType, label) {
    for(var i = 0; i < this._gridControls.length; i++) {
        this._gridControls[i].setHeadingControlLabel(controlType, label);
    }
}

DemoLayoutBuilder.DemoLayout.GridControlsManager.prototype.setMarginWidth = function(marginWidth) {
    this._setItemCssControlValue(
        DemoLayoutBuilder.DemoLayout.GridControls.HEADER_CONTROL_TYPES.MARGIN_WIDTH, marginWidth
    );
}

DemoLayoutBuilder.DemoLayout.GridControlsManager.prototype.setMarginHeight = function(marginHeight) {
    this._setItemCssControlValue(
        DemoLayoutBuilder.DemoLayout.GridControls.HEADER_CONTROL_TYPES.MARGIN_HEIGHT, marginHeight
    );
}

DemoLayoutBuilder.DemoLayout.GridControlsManager.prototype.setPaddingWidth = function(paddingWidth) {
    this._setItemCssControlValue(
        DemoLayoutBuilder.DemoLayout.GridControls.HEADER_CONTROL_TYPES.PADDING_WIDTH, paddingWidth
    );
}

DemoLayoutBuilder.DemoLayout.GridControlsManager.prototype.setPaddingHeight = function(paddingHeight) {
    this._setItemCssControlValue(
        DemoLayoutBuilder.DemoLayout.GridControls.HEADER_CONTROL_TYPES.PADDING_HEIGHT, paddingHeight
    );
}

DemoLayoutBuilder.DemoLayout.GridControlsManager.prototype.setBorderWidth = function(borderWidth) {
    this._setItemCssControlValue(
        DemoLayoutBuilder.DemoLayout.GridControls.HEADER_CONTROL_TYPES.BORDER_WIDTH, borderWidth
    );
}

DemoLayoutBuilder.DemoLayout.GridControlsManager.prototype.setBorderHeight = function(borderHeight) {
    this._setItemCssControlValue(
        DemoLayoutBuilder.DemoLayout.GridControls.HEADER_CONTROL_TYPES.BORDER_HEIGHT, borderHeight
    );
}

DemoLayoutBuilder.DemoLayout.GridControlsManager.prototype.setBoxSizingItemCssControlBorderBoxOption = function() {
    this._setItemCssControlValue(
        DemoLayoutBuilder.DemoLayout.GridControls.HEADER_CONTROL_TYPES.BOX_SIZING, "Border-box"
    );
}

DemoLayoutBuilder.DemoLayout.GridControlsManager.prototype.setBoxSizingItemCssControlContentBoxOption = function() {
    this._setItemCssControlValue(
        DemoLayoutBuilder.DemoLayout.GridControls.HEADER_CONTROL_TYPES.BOX_SIZING, "Content-box"
    );
}

DemoLayoutBuilder.DemoLayout.GridControlsManager.prototype._selectToggleControlOption = function(sublabel) {
    for(var i = 0; i < this._gridControls.length; i++) { 
        this._gridControls[i].setControlSublabel(
            DemoLayoutBuilder.DemoLayout.GridControls.CONTROLS.TOGGLE, sublabel
        );
    }
}

DemoLayoutBuilder.DemoLayout.GridControlsManager.prototype.selectToggleControlRotateXOption = function() {
    this._selectToggleControlOption("RotateX(CSS3)");
    this._gridifier.toggleBy("rotateX");
}

DemoLayoutBuilder.DemoLayout.GridControlsManager.prototype.selectToggleControlRotateYOption = function() {
    this._selectToggleControlOption("RotateY(CSS3)");
    this._gridifier.toggleBy("rotateY");
}

DemoLayoutBuilder.DemoLayout.GridControlsManager.prototype.selectToggleControlScaleOption = function() {
    this._selectToggleControlOption("Scale(CSS3)"); 
    this._gridifier.toggleBy("scale");
}

DemoLayoutBuilder.DemoLayout.GridControlsManager.prototype.selectToggleControlFadeOption = function() {
    this._selectToggleControlOption("Opacity(CSS3)");
    this._gridifier.toggleBy("fade");
}

DemoLayoutBuilder.DemoLayout.GridControlsManager.prototype.selectToggleControlVisibilityOption = function() {
    this._selectToggleControlOption("Visibility");
    this._gridifier.toggleBy("visibility");
}

DemoLayoutBuilder.DemoLayout.GridControlsManager.prototype._selectFilterControlOption = function(sublabel) {
    for(var i = 0; i < this._gridControls.length; i++) {
        this._gridControls[i].setControlSublabel(
            DemoLayoutBuilder.DemoLayout.GridControls.CONTROLS.FILTER, sublabel
        );
    }
}

DemoLayoutBuilder.DemoLayout.GridControlsManager.prototype.selectFilterControlAllOption = function() {
    this._selectFilterControlOption("Show all items");
}

DemoLayoutBuilder.DemoLayout.GridControlsManager.prototype.selectFilterControlBlueOption = function() {
    this._selectFilterControlOption("Only blue items");
}

DemoLayoutBuilder.DemoLayout.GridControlsManager.prototype.selectFilterControlVioletOption = function() {
    this._selectFilterControlOption("Only violet items");
}

DemoLayoutBuilder.DemoLayout.GridControlsManager.prototype.selectFilterControlRedOption = function() {
    this._selectFilterControlOption("Only red items");
}

DemoLayoutBuilder.DemoLayout.GridControlsManager.prototype.selectFilterControlYellowOption = function() {
    this._selectFilterControlOption("Only yellow items");
}

DemoLayoutBuilder.DemoLayout.GridControlsManager.prototype.selectFilterControlGreenOption = function() {
    this._selectFilterControlOption("Only green items");
}

DemoLayoutBuilder.DemoLayout.GridControlsManager.prototype._selectSortControlOption = function(sublabel) {
    for(var i = 0; i < this._gridControls.length; i++) {
        this._gridControls[i].setControlSublabel(
            DemoLayoutBuilder.DemoLayout.GridControls.CONTROLS.SORT, sublabel
        );
    }
}

DemoLayoutBuilder.DemoLayout.GridControlsManager.prototype.selectSortControlByGUIDOption = function() {
    this._selectSortControlOption("By GUID");
}

DemoLayoutBuilder.DemoLayout.GridControlsManager.prototype.selectSortControlByItemColorOption = function() {
    this._selectSortControlOption("By item color");
}

DemoLayoutBuilder.DemoLayout.GridControlsManager.prototype.setBatchSizeOption = function(newBatchSize) {
    for(var i = 0; i < this._gridControls.length; i++)
    {
        this._gridControls[i].setControlSublabel(
            DemoLayoutBuilder.DemoLayout.GridControls.CONTROLS.BATCH_SIZE,
            newBatchSize + ((newBatchSize == 1) ? " item" : " items")
        );

        this._gridControls[i].setControlSublabel(
            DemoLayoutBuilder.DemoLayout.GridControls.CONTROLS.APPEND,
            "Next " + newBatchSize + ((newBatchSize == 1) ? " item" : " items")
        );

        this._gridControls[i].setControlSublabel(
            DemoLayoutBuilder.DemoLayout.GridControls.CONTROLS.PREPEND,
            "Next " + newBatchSize + ((newBatchSize == 1) ? " item" : " items")
        );

        this._gridControls[i].setEnabledItemControls(newBatchSize);
    }
}