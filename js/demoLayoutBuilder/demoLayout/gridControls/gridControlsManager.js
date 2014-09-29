DemoLayoutBuilder.DemoLayout.GridControlsManager = function() {
    var me = this;

    this._$view = null;

    this._gridControls = [];

    this._css = {
    };

    this._construct = function() {
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

DemoLayoutBuilder.DemoLayout.GridControlsManager.prototype._selectToggleControlOption = function(sublabel) {
    for(var i = 0; i < this._gridControls.length; i++) { 
        this._gridControls[i].setControlSublabel(
            DemoLayoutBuilder.DemoLayout.GridControls.CONTROLS.TOGGLE, sublabel
        );
    }
}

DemoLayoutBuilder.DemoLayout.GridControlsManager.prototype.selectToggleControlScaleOption = function() {
    this._selectToggleControlOption("Scale(CSS3)"); 
}

DemoLayoutBuilder.DemoLayout.GridControlsManager.prototype.selectToggleControlFadeOption = function() {
    this._selectToggleControlOption("Opacity(CSS3)");
}

DemoLayoutBuilder.DemoLayout.GridControlsManager.prototype.selectToggleControlVisibilityOption = function() {
    this._selectToggleControlOption("Visibility");
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
    }
}