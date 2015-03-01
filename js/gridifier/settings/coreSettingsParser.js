Gridifier.CoreSettingsParser = function(settingsCore, settings) {
    var me = this;

    this._settingsCore = null;
    this._settings = null;

    this._css = {
    };

    this._construct = function() {
        me._settingsCore = settingsCore;
        me._settings = settings;
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

Gridifier.CoreSettingsParser.prototype.parseGridType = function() {
    if(!this._settings.hasOwnProperty("gridType")) {
        var gridType = Gridifier.GRID_TYPES.VERTICAL_GRID;
        return gridType;
    }

    if(this._settings.gridType != Gridifier.GRID_TYPES.VERTICAL_GRID
        && this._settings.gridType != Gridifier.GRID_TYPES.HORIZONTAL_GRID) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_GRID_TYPE,
            this._settings.gridType
        );
    }
    
    var gridType = this._settings.gridType;
    return gridType;
}

Gridifier.CoreSettingsParser.prototype.parsePrependType = function() {
    if(!this._settings.hasOwnProperty("prependType")) {
        var prependType = Gridifier.PREPEND_TYPES.DEFAULT_PREPEND;
        return prependType;
    }

    if(this._settings.prependType != Gridifier.PREPEND_TYPES.DEFAULT_PREPEND 
        && this._settings.prependType != Gridifier.PREPEND_TYPES.REVERSED_PREPEND 
        && this._settings.prependType != Gridifier.PREPEND_TYPES.MIRRORED_PREPEND) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_PREPEND_TYPE,
            this._settings.prependType
        );
    }
    
    var prependType = this._settings.prependType;
    return prependType;
}

Gridifier.CoreSettingsParser.prototype.parseAppendType = function() {
    if(!this._settings.hasOwnProperty("appendType")) {
        var appendType = Gridifier.APPEND_TYPES.DEFAULT_APPEND;
        return appendType;
    }

    if(this._settings.appendType != Gridifier.APPEND_TYPES.DEFAULT_APPEND
        && this._settings.appendType != Gridifier.APPEND_TYPES.REVERSED_APPEND) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_APPEND_TYPE,
            this._settings.appendType
        );
    }

    var appendType = this._settings.appendType;
    return appendType;
}

Gridifier.CoreSettingsParser.prototype.parseIntersectionStrategy = function() {
    if(!this._settings.hasOwnProperty("intersectionStrategy")) {
        var intersectionStrategy = Gridifier.INTERSECTION_STRATEGIES.DEFAULT;
        return intersectionStrategy;
    }

    if(this._settings.intersectionStrategy != Gridifier.INTERSECTION_STRATEGIES.DEFAULT 
        && this._settings.intersectionStrategy != Gridifier.INTERSECTION_STRATEGIES.NO_INTERSECTIONS) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_INTERSECTION_STRATEGY,
            this._settings.intersectionStrategy
        );
    }

    var intersectionStrategy = this._settings.intersectionStrategy;
    return intersectionStrategy;
}

Gridifier.CoreSettingsParser.prototype.parseIntersectionStrategyAlignmentType = function() {
    var alignmentTypes = Gridifier.INTERSECTION_STRATEGY_ALIGNMENT_TYPES;

    if(!this._settings.hasOwnProperty("alignmentType")) {
        if(this._settingsCore.isVerticalGrid())
            var alignmentType = alignmentTypes.FOR_VERTICAL_GRID.TOP;
        else if(this._settingsCore.isHorizontalGrid()) 
            var alignmentType = alignmentTypes.FOR_HORIZONTAL_GRID.LEFT;
        
        return alignmentType;
    }

    if(this._settingsCore.isVerticalGrid()) {
        var validAlignmentTypes = [
            alignmentTypes.FOR_VERTICAL_GRID.TOP,
            alignmentTypes.FOR_VERTICAL_GRID.CENTER,
            alignmentTypes.FOR_VERTICAL_GRID.BOTTOM
        ];
    }
    else if(this._settingsCore.isHorizontalGrid()) {
        var validAlignmentTypes = [
            alignmentTypes.FOR_HORIZONTAL_GRID.LEFT,
            alignmentTypes.FOR_HORIZONTAL_GRID.CENTER,
            alignmentTypes.FOR_HORIZONTAL_GRID.RIGHT
        ];
    }

    var isValidAlignmentType = false;
    for(var i = 0; i < validAlignmentTypes.length; i++) {
        if(validAlignmentTypes[i] == this._settings.alignmentType)
            isValidAlignmentType = true;
    }

    if(isValidAlignmentType) {
        var alignmentType = this._settings.alignmentType;
        return alignmentType;
    }

    new Gridifier.Error(
        Gridifier.Error.ERROR_TYPES.INVALID_ALIGNMENT_TYPE,
        this._settings.alignmentType
    );
}

Gridifier.CoreSettingsParser.prototype.parseSortDispersionMode = function() {
    if(!this._settings.hasOwnProperty("sortDispersionMode")) {
        var sortDispersionMode = Gridifier.SORT_DISPERSION_MODES.DISABLED;
        return sortDispersionMode;
    }

    if(this._settings.sortDispersionMode != Gridifier.SORT_DISPERSION_MODES.DISABLED 
        && this._settings.sortDispersionMode != Gridifier.SORT_DISPERSION_MODES.CUSTOM 
        && this._settings.sortDispersionMode != Gridifier.SORT_DISPERSION_MODES.CUSTOM_ALL_EMPTY_SPACE) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_SORT_DISPERSION_MODE,
            this._settings.sortDispersionMode
        );
    }

    var sortDispersionMode = this._settings.sortDispersionMode;
    return sortDispersionMode;
}

Gridifier.CoreSettingsParser.prototype.parseSortDispersionValue = function() {
    if(!this._settingsCore.isCustomSortDispersion())
        return "";

    if(!this._settings.hasOwnProperty("sortDispersionValue")) {
        new Gridifier.Error(Gridifier.Error.ERROR_TYPES.SETTINGS.MISSING_SORT_DISPERSION_VALUE);
    }

    var sortDispersionValueRegexp = new RegExp(/[\d]+(px)/);
    if(!sortDispersionValueRegexp.test(this._settings.sortDispersionValue)) {
        new Gridifier.Error(
            Gridifier.Error.ERROR_TYPES.SETTINGS.INVALID_SORT_DISPERSION_VALUE,
            this._settings.sortDispersionValue
        );
    }

    var sortDispersionValue = this._settings.sortDispersionValue;
    return sortDispersionValue;
}

Gridifier.CoreSettingsParser.prototype.parseDisableItemHideOnGridAttachValue = function() {
    if(!this._settings.hasOwnProperty("disableItemHideOnGridAttach"))
        return false;

    return true;
}

Gridifier.CoreSettingsParser.prototype.parseToggleAnimationMsDuration = function() {
    if(!this._settings.hasOwnProperty("toggleAnimationMsDuration"))
        return Gridifier.DEFAULT_TOGGLE_ANIMATION_MS_DURATION;

    return this._settings.toggleAnimationMsDuration;
}

Gridifier.CoreSettingsParser.prototype.parseCoordsChangeAnimationMsDuration = function() {
    if(!this._settings.hasOwnProperty("coordsChangeAnimationMsDuration"))
        return Gridifier.DEFAULT_COORDS_CHANGE_ANIMATION_MS_DURATION;

    return this._settings.coordsChangeAnimationMsDuration;
}

Gridifier.CoreSettingsParser.prototype.parseRotatePerspective = function() {
    if(!this._settings.hasOwnProperty("rotatePerspective"))
        return Gridifier.DEFAULT_ROTATE_PERSPECTIVE;

    return this._settings.rotatePerspective;
}

Gridifier.CoreSettingsParser.prototype.parseRotateBackface = function() {
    if(!this._settings.hasOwnProperty("rotateBackface"))
        return Gridifier.DEFAULT_ROTATE_BACKFACE;

    return this._settings.rotateBackface;
}

Gridifier.CoreSettingsParser.prototype.parseGridItemMarkingStrategy = function() {
    if(!this._settings.hasOwnProperty(Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_CLASS) 
        && !this._settings.hasOwnProperty(Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_DATA_ATTR)
        && !this._settings.hasOwnProperty(Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_QUERY)) {
        return {
            gridItemMarkingStrategyType: Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_DATA_ATTR,
            gridItemMarkingValue: Gridifier.GRID_ITEM_MARKING_DEFAULTS.DATA_ATTR
        };
    }

    if(this._settings.hasOwnProperty(Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_CLASS)) {
        return {
            gridItemMarkingStrategyType: Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_CLASS,
            gridItemMarkingValue: this._settings[Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_CLASS]
        };
    }
    else if(this._settings.hasOwnProperty(Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_DATA_ATTR)) {
        return {
            gridItemMarkingStrategyType: Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_DATA_ATTR,
            gridItemMarkingValue: this._settings[Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_DATA_ATTR]
        };
    }
    else if(this._settings.hasOwnProperty(Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_QUERY)) {
        return {
            gridItemMarkingStrategyType: Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_QUERY,
            gridItemMarkingValue: this._settings[Gridifier.GRID_ITEM_MARKING_STRATEGIES.BY_QUERY]
        };
    }
}

Gridifier.CoreSettingsParser.prototype.parseDragifierSettings = function() {
    if(this._settings.hasOwnProperty("dragifier") && this._settings.dragifier) {
        var shouldEnableDragifierOnInit = true;

        if(typeof this._settings.dragifier == "boolean") {
            if(this._settingsCore.isByClassGridItemMarkingStrategy()) {
                var dragifierItemSelector = "." + this._settingsCore.getGridItemMarkingValue();
            }
            else if(this._settingsCore.isByDataAttrGridItemMarkingStrategy()) {
                var dragifierItemSelector = "[" + this._settingsCore.getGridItemMarkingValue() + "]";
            }
        }
        else {
            var dragifierItemSelector = this._settings.dragifier;
        }
        
        return {
            shouldEnableDragifierOnInit: shouldEnableDragifierOnInit,
            dragifierItemSelector: dragifierItemSelector
        };
    }

    var shouldEnableDragifierOnInit = false;
    if(this._settingsCore.isByClassGridItemMarkingStrategy()) {
        var dragifierItemSelector = "." + this._settingsCore.getGridItemMarkingValue();
    }
    else if(this._settingsCore.isByDataAttrGridItemMarkingStrategy()) {
        var dragifierItemSelector = "[" + this._settingsCore.getGridItemMarkingValue() + "]";
    }

    return {
        shouldEnableDragifierOnInit: shouldEnableDragifierOnInit,
        dragifierItemSelector: dragifierItemSelector
    };
}